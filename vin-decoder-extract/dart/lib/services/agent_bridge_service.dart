/// Agent bridge service — ported from agent-bridge.ts
/// Central communication hub between Flutter frontend and
/// the Rust diagnostic agent via WebSocket, BLE, or mock/demo mode.

import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../models/diagnostic_types.dart';
import '../data/obd2_parameters.dart';
import '../providers/bluetooth_provider.dart';
import 'agent_types.dart';
import 'bluetooth_service.dart';
import 'mock_data_service.dart';

// ── Connection Mode ───────────────────────────────────────

enum AgentMode { agent, demo, ble }

// ── Agent Status ──────────────────────────────────────────

class AgentStatus {
  final bool connected;
  final String? agentVersion;
  final String? vciStatus;
  final String? protocol;
  final int? uptimeMs;
  final int? pendingCommands;

  const AgentStatus({
    this.connected = false,
    this.agentVersion,
    this.vciStatus,
    this.protocol,
    this.uptimeMs,
    this.pendingCommands,
  });
}

// ── Agent Command / Response ──────────────────────────────

class AgentCommand {
  final String id;
  final String method;
  final Map<String, dynamic> params;

  AgentCommand({
    required this.method,
    this.params = const {},
  }) : id = DateTime.now().microsecondsSinceEpoch.toRadixString(36);

  Map<String, dynamic> toJson() => {
        'id': id,
        'method': method,
        'params': params,
      };
}

class AgentResponse {
  final String id;
  final bool success;
  final dynamic data;
  final String? error;

  AgentResponse({
    required this.id,
    required this.success,
    this.data,
    this.error,
  });

  factory AgentResponse.fromJson(Map<String, dynamic> json) {
    return AgentResponse(
      id: json['id'] as String? ?? '',
      success: json['success'] as bool? ?? false,
      data: json['data'],
      error: json['error'] as String?,
    );
  }
}

// ── Agent Bridge Service ──────────────────────────────────

class AgentBridgeService {
  static const String _defaultHost = '127.0.0.1';
  static const int _defaultPort = 9100;
  static const Duration _commandTimeout = Duration(seconds: 10);
  static const Duration _reconnectDelay = Duration(seconds: 3);

  AgentMode _mode = AgentMode.demo;
  WebSocketChannel? _channel;
  StreamSubscription? _wsSubscription;
  bool _isConnected = false;

  final Map<String, Completer<AgentResponse>> _pendingCommands = {};
  final BluetoothService _bluetoothService;
  final MockDataService _mockService = MockDataService();

  AgentBridgeService({BluetoothService? bluetoothService})
      : _bluetoothService = bluetoothService ?? BluetoothService();

  /// Timer for live data polling (BLE/agent mode) — stored to prevent memory leak
  Timer? _liveDataPollTimer;

  final StreamController<AgentStatus> _statusController =
      StreamController<AgentStatus>.broadcast();
  final StreamController<List<LiveDataParameter>> _liveDataController =
      StreamController<List<LiveDataParameter>>.broadcast();

  /// Current connection mode.
  AgentMode get mode => _mode;

  /// Whether connected to the Rust agent.
  bool get isConnected => _isConnected;

  /// Stream of agent status updates.
  Stream<AgentStatus> get statusStream => _statusController.stream;

  /// Stream of live OBD data from agent.
  Stream<List<LiveDataParameter>> get liveDataStream =>
      _liveDataController.stream;

  // ── Connection Management ─────────────────────────────

  /// Connect to the Rust agent via WebSocket.
  Future<bool> connectToAgent({
    String host = _defaultHost,
    int port = _defaultPort,
  }) async {
    _mode = AgentMode.agent;

    try {
      final uri = Uri.parse('ws://$host:$port');
      _channel = WebSocketChannel.connect(uri);

      // Wait for connection
      await _channel!.ready;

      _wsSubscription = _channel!.stream.listen(
        _handleMessage,
        onError: _handleError,
        onDone: _handleDisconnect,
      );

      _isConnected = true;

      // Verify with ping
      final pong = await _sendCommand('ping');
      if (!pong.success) {
        await disconnect();
        return false;
      }

      _emitStatus(connected: true);
      return true;
    } catch (e) {
      _isConnected = false;
      _emitStatus(connected: false);
      return false;
    }
  }

  /// Switch to demo mode (uses mock data).
  void connectDemo() {
    _mode = AgentMode.demo;
    _isConnected = true;
    _emitStatus(connected: true);
  }

  /// Connect via Bluetooth (Classic SPP or BLE) to an ELM327 adapter.
  Future<bool> connectBLE(DiscoveredOBDDevice device) async {
    _mode = AgentMode.ble;
    try {
      await _bluetoothService.connect(device);
      _isConnected = true;
      _emitStatus(connected: true);
      return true;
    } catch (e) {
      _isConnected = false;
      return false;
    }
  }

  /// Disconnect from all sources.
  Future<void> disconnect() async {
    _wsSubscription?.cancel();
    _wsSubscription = null;

    if (_channel != null) {
      await _channel!.sink.close();
      _channel = null;
    }

    if (_mode == AgentMode.ble) {
      await _bluetoothService.disconnect();
    }

    _isConnected = false;
    _pendingCommands.forEach((_, c) {
      if (!c.isCompleted) {
        c.complete(AgentResponse(
          id: '',
          success: false,
          error: 'Disconnected',
        ));
      }
    });
    _pendingCommands.clear();
    _emitStatus(connected: false);
  }

  // ── Core Diagnostic Commands ──────────────────────────

  /// Scan for available VCI adapters.
  Future<List<Map<String, dynamic>>> scanVCI() async {
    if (_mode == AgentMode.demo) {
      return [
        {
          'type': 'demo',
          'name': 'BYKI Demo Adapter',
          'protocol': 'ISO 15765-4 (CAN 11/500)',
        }
      ];
    }
    if (_mode == AgentMode.ble) {
      final devices = await _bluetoothService.scanForDevices();
      return devices
          .map((d) {
                return {
                  'type': d.transport == OBDTransport.classicSPP ? 'classic' : 'ble',
                  'name': d.name,
                  'address': d.address,
                  'rssi': d.rssi,
                };
              })
          .toList();
    }

    final resp = await _sendCommand('scan_vci');
    return resp.success ? List<Map<String, dynamic>>.from(resp.data ?? []) : [];
  }

  /// Connect to a VCI by identifier.
  Future<bool> connectVCI(String vciId) async {
    if (_mode == AgentMode.demo) return true;

    final resp = await _sendCommand('connect_vci', {'vci_id': vciId});
    return resp.success;
  }

  /// Discover ECUs on the vehicle network.
  Future<List<ECUInfo>> discoverECUs() async {
    if (_mode == AgentMode.demo) {
      return _mockService.simulateTopologyScan();
    }

    if (_mode == AgentMode.ble) {
      return _discoverECUsViaBLE();
    }

    final resp = await _sendCommand('discover_ecus');
    if (!resp.success) return [];

    final ecus = (resp.data as List?) ?? [];
    return ecus.map<ECUInfo>((e) {
      final m = Map<String, dynamic>.from(e);
      return mapDiscoveredEcu(
        requestArbId: m['request_arb_id'] as int,
        responseArbId: m['response_arb_id'] as int,
        ecuType: m['ecu_type'] as String? ?? 'unknown',
        name: m['name'] as String? ?? 'Unknown ECU',
        protocol: m['protocol'] as String? ?? 'CAN',
        responseTimeMs: m['response_time_ms'] as int?,
      );
    }).toList();
  }

  /// Read the Vehicle Identification Number.
  Future<String?> readVIN() async {
    if (_mode == AgentMode.demo) {
      return '${mockVinData.wmi}${mockVinData.vds}${mockVinData.vis}';
    }

    if (_mode == AgentMode.ble) {
      final raw = await _bluetoothService.readVIN();
      return _parseVINResponse(raw);
    }

    final resp = await _sendCommand('read_vin');
    return resp.success ? resp.data as String? : null;
  }

  /// Read DTCs from a specific ECU or all ECUs.
  Future<List<DiagnosticTroubleCode>> readDTCs({String? ecuAddress}) async {
    if (_mode == AgentMode.demo) {
      return _mockService.simulateDTCRead();
    }

    if (_mode == AgentMode.ble) {
      return _readDTCsViaBLE();
    }

    final params = <String, dynamic>{};
    if (ecuAddress != null) params['ecu_address'] = ecuAddress;

    final resp = await _sendCommand('read_dtcs', params);
    if (!resp.success) return [];

    final dtcs = (resp.data as List?) ?? [];
    return dtcs.map<DiagnosticTroubleCode>((d) {
      final m = Map<String, dynamic>.from(d);
      return mapDtcResult(
        code: m['code'] as String,
        statusByte: m['status_byte'] as int? ?? 0,
        description: m['description'] as String?,
      );
    }).toList();
  }

  /// Clear DTCs (Mode 04).
  Future<bool> clearDTCs({String? ecuAddress}) async {
    if (_mode == AgentMode.demo) {
      return (await _mockService.simulateDTCClear()).success;
    }

    if (_mode == AgentMode.ble) {
      final raw = await _bluetoothService.clearDTCs();
      return !raw.contains('ERROR');
    }

    final params = <String, dynamic>{};
    if (ecuAddress != null) params['ecu_address'] = ecuAddress;

    final resp = await _sendCommand('clear_dtcs', params);
    return resp.success;
  }

  /// Read live data for a set of PIDs.
  Future<List<LiveDataParameter>> readLiveData({
    List<int>? pids,
  }) async {
    if (_mode == AgentMode.demo) {
      // Return a snapshot from mock stream
      return _mockService.liveDataStream.first;
    }

    if (_mode == AgentMode.ble) {
      return _readLiveDataViaBLE(pids);
    }

    final params = <String, dynamic>{};
    if (pids != null) params['pids'] = pids;

    final resp = await _sendCommand('read_live_data', params);
    if (!resp.success) return [];

    return _parseAgentLiveData(resp.data);
  }

  /// Start a continuous live data streaming session.
  Future<Stream<List<LiveDataParameter>>> startLiveDataStream({
    List<int>? pids,
    Duration interval = const Duration(milliseconds: 500),
  }) async {
    if (_mode == AgentMode.demo) {
      _mockService.startLiveDataSimulation();
      return _mockService.liveDataStream;
    }

    // For agent & BLE, poll at interval
    final controller = StreamController<List<LiveDataParameter>>();
    _liveDataPollTimer?.cancel();
    _liveDataPollTimer = Timer.periodic(interval, (timer) async {
      if (!_isConnected) {
        timer.cancel();
        _liveDataPollTimer = null;
        controller.close();
        return;
      }
      try {
        final data = await readLiveData(pids: pids);
        controller.add(data);
        _liveDataController.add(data);
      } catch (e) {
        debugPrint('Live data poll error: $e');
      }
    });

    return controller.stream;
  }

  /// Stop live data streaming.
  void stopLiveDataStream() {
    _liveDataPollTimer?.cancel();
    _liveDataPollTimer = null;
    _mockService.stopLiveDataSimulation();
  }

  // ── Extended Diagnostic Commands ──────────────────────

  /// Discover which PIDs are supported by an ECU.
  Future<List<int>> discoverSupportedPids({String? ecuAddress}) async {
    if (_mode == AgentMode.demo) {
      return obd2Parameters.values.map((p) => int.tryParse(p.pid.replaceFirst('0x', ''), radix: 16) ?? 0).toList();
    }

    if (_mode == AgentMode.ble) {
      return _discoverPidsViaBLE();
    }

    final params = <String, dynamic>{};
    if (ecuAddress != null) params['ecu_address'] = ecuAddress;

    final resp = await _sendCommand('discover_supported_pids', params);
    if (!resp.success) return [];
    return List<int>.from(resp.data ?? []);
  }

  /// Read readiness monitors (Mode 01, PID 01).
  Future<ReadinessMonitors?> readReadinessMonitors() async {
    if (_mode == AgentMode.demo) {
      return const ReadinessMonitors(
        misfire: MonitorStatus.complete,
        fuelSystem: MonitorStatus.complete,
        components: MonitorStatus.complete,
        catalyst: MonitorStatus.notReady,
        oxygenSensor: MonitorStatus.complete,
        oxygenSensorHeater: MonitorStatus.complete,
        evapSystem: MonitorStatus.notReady,
        secondaryAir: MonitorStatus.notAvailable,
        acRefrigerant: MonitorStatus.notAvailable,
        exhaustGasSensor: MonitorStatus.complete,
        egr: MonitorStatus.complete,
      );
    }

    if (_mode == AgentMode.ble) {
      final raw = await _bluetoothService.readPID('01');
      return _parseReadinessMonitors(raw);
    }

    final resp = await _sendCommand('read_readiness_monitors');
    if (!resp.success) return null;
    return _parseReadinessFromAgent(resp.data);
  }

  /// Read freeze frame data for a specific DTC.
  Future<FreezeFrameData?> readFreezeFrame(String dtcCode) async {
    if (_mode == AgentMode.demo) {
      return mockDTCs.isNotEmpty ? mockDTCs.first.freezeFrame : null;
    }

    final resp =
        await _sendCommand('read_freeze_frame', {'dtc_code': dtcCode});
    if (!resp.success) return null;
    return _parseFreezeFrame(resp.data);
  }

  /// Read pending DTCs.
  Future<List<DiagnosticTroubleCode>> readPendingDTCs() async {
    if (_mode == AgentMode.demo) return [];

    if (_mode == AgentMode.ble) {
      final raw = await _bluetoothService.sendCommand('07');
      return _parseBLEDTCResponse(raw, DTCStatus.pending);
    }

    final resp = await _sendCommand('read_pending_dtcs');
    if (!resp.success) return [];
    return (resp.data as List?)
            ?.map<DiagnosticTroubleCode>((d) => mapDtcResult(
                  code: d['code'],
                  statusByte: d['status_byte'] ?? 0,
                  dtcStatus: DTCStatus.pending,
                ))
            .toList() ??
        [];
  }

  /// Read permanent DTCs.
  Future<List<DiagnosticTroubleCode>> readPermanentDTCs() async {
    if (_mode == AgentMode.demo) return [];

    if (_mode == AgentMode.ble) {
      final raw = await _bluetoothService.sendCommand('0A');
      return _parseBLEDTCResponse(raw, DTCStatus.permanent);
    }

    final resp = await _sendCommand('read_permanent_dtcs');
    if (!resp.success) return [];
    return (resp.data as List?)
            ?.map<DiagnosticTroubleCode>((d) => mapDtcResult(
                  code: d['code'],
                  statusByte: d['status_byte'] ?? 0,
                  dtcStatus: DTCStatus.permanent,
                ))
            .toList() ??
        [];
  }

  /// Read vehicle info (Mode 09).
  Future<Map<String, String>> readVehicleInfo() async {
    if (_mode == AgentMode.demo) {
      return {
        'VIN': '${mockVinData.wmi}${mockVinData.vds}${mockVinData.vis}',
        'CalibrationID': 'BYKI-CAL-001',
        'ECU Name': 'BYKI Demo ECU',
      };
    }

    final resp = await _sendCommand('read_vehicle_info');
    if (!resp.success) return {};
    return Map<String, String>.from(resp.data ?? {});
  }

  /// Start a diagnostic session.
  Future<bool> startSession({String name = 'Diagnostic Session'}) async {
    if (_mode == AgentMode.demo) return true;

    final resp = await _sendCommand('start_session', {'name': name});
    return resp.success;
  }

  /// End the current diagnostic session.
  Future<bool> endSession() async {
    if (_mode == AgentMode.demo) return true;

    final resp = await _sendCommand('end_session');
    return resp.success;
  }

  /// Get agent status.
  Future<AgentStatus> getStatus() async {
    if (_mode == AgentMode.demo) {
      return const AgentStatus(
        connected: true,
        agentVersion: 'demo-1.0.0',
        vciStatus: 'Demo Mode',
        protocol: 'N/A',
      );
    }

    final resp = await _sendCommand('get_status');
    if (!resp.success) return const AgentStatus(connected: false);

    final m = Map<String, dynamic>.from(resp.data ?? {});
    return AgentStatus(
      connected: true,
      agentVersion: m['agent_version'] as String?,
      vciStatus: m['vci_status'] as String?,
      protocol: m['protocol'] as String?,
      uptimeMs: m['uptime_ms'] as int?,
      pendingCommands: m['pending_commands'] as int?,
    );
  }

  // ── WebSocket Transport ───────────────────────────────

  Future<AgentResponse> _sendCommand(
    String method, [
    Map<String, dynamic> params = const {},
  ]) async {
    final command = AgentCommand(method: method, params: params);

    if (_mode != AgentMode.agent || _channel == null) {
      // Should not reach here for non-agent modes
      return AgentResponse(
        id: command.id,
        success: false,
        error: 'Not connected to agent',
      );
    }

    final completer = Completer<AgentResponse>();
    _pendingCommands[command.id] = completer;

    try {
      _channel!.sink.add(jsonEncode(command.toJson()));
    } catch (e) {
      _pendingCommands.remove(command.id);
      return AgentResponse(
        id: command.id,
        success: false,
        error: 'Send failed: $e',
      );
    }

    // Timeout guard
    return completer.future.timeout(
      _commandTimeout,
      onTimeout: () {
        _pendingCommands.remove(command.id);
        return AgentResponse(
          id: command.id,
          success: false,
          error: 'Command timeout',
        );
      },
    );
  }

  void _handleMessage(dynamic data) {
    try {
      final json = jsonDecode(data as String) as Map<String, dynamic>;
      final response = AgentResponse.fromJson(json);

      final completer = _pendingCommands.remove(response.id);
      if (completer != null && !completer.isCompleted) {
        completer.complete(response);
      }

      // Handle push notifications from agent
      if (json.containsKey('event')) {
        _handleAgentEvent(json);
      }
    } catch (e) {
      // Malformed message
    }
  }

  void _handleError(dynamic error) {
    _isConnected = false;
    _emitStatus(connected: false);
    _scheduleReconnect();
  }

  void _handleDisconnect() {
    _isConnected = false;
    _emitStatus(connected: false);
    _scheduleReconnect();
  }

  void _handleAgentEvent(Map<String, dynamic> event) {
    final eventType = event['event'] as String?;

    switch (eventType) {
      case 'live_data':
        final params = _parseAgentLiveData(event['data']);
        _liveDataController.add(params);
        break;
      case 'dtc_detected':
        // Could emit via a separate stream if needed
        break;
      case 'connection_lost':
        _isConnected = false;
        _emitStatus(connected: false);
        break;
    }
  }

  Timer? _reconnectTimer;

  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(_reconnectDelay, () {
      if (!_isConnected && _mode == AgentMode.agent) {
        connectToAgent();
      }
    });
  }

  void _emitStatus({required bool connected}) {
    _statusController.add(AgentStatus(connected: connected));
  }

  // ── BLE Diagnostic Helpers ────────────────────────────

  Future<List<ECUInfo>> _discoverECUsViaBLE() async {
    final ecus = <ECUInfo>[];

    // Scan standard ECU addresses
    for (final entry in ecuAddressMap.entries) {
      try {
        // Send a basic request to each known ECU address
        final hexAddr = entry.key.toRadixString(16).padLeft(3, '0');
        await _bluetoothService.sendAT('SH $hexAddr');
        final response = await _bluetoothService.sendCommand('0100');

        if (!response.contains('NO DATA') && !response.contains('ERROR')) {
          ecus.add(mapDiscoveredEcu(
            requestArbId: entry.key,
            responseArbId: entry.key + 8,
            ecuType: entry.value.type.name,
            name: entry.value.name,
            protocol: 'CAN',
          ));
        }
      } catch (e) {
        debugPrint('BLE ECU probe 0x${entry.key.toRadixString(16)} error: $e');
      }
    }

    // Reset to default header
    await _bluetoothService.sendAT('SH 7DF');

    return ecus;
  }

  Future<List<DiagnosticTroubleCode>> _readDTCsViaBLE() async {
    final raw = await _bluetoothService.readDTCs();
    return _parseBLEDTCResponse(raw, DTCStatus.confirmed);
  }

  Future<List<LiveDataParameter>> _readLiveDataViaBLE(List<int>? pids) async {
    // Expanded default PID set covering engine, fuel, air, speed, battery
    final targetPids = pids ?? [
      0x04, // Engine Load
      0x05, // Coolant Temp
      0x06, // STFT Bank 1
      0x07, // LTFT Bank 1
      0x0B, // Intake Manifold Pressure
      0x0C, // RPM
      0x0D, // Vehicle Speed
      0x0E, // Timing Advance
      0x0F, // Intake Air Temp
      0x10, // MAF Rate
      0x11, // Throttle Position
      0x14, // O2 Sensor B1S1
      0x42, // Control Module Voltage
    ];
    final params = <LiveDataParameter>[];

    for (final pid in targetPids) {
      try {
        final hex = pid.toRadixString(16).padLeft(2, '0').toUpperCase();
        final raw = await _bluetoothService.readPID(hex);
        final parsed = _parseOBDResponse(pid, raw);
        if (parsed != null) params.add(parsed);
      } catch (e) {
        debugPrint('BLE PID 0x${pid.toRadixString(16)} read error: $e');
      }
    }

    return params;
  }

  Future<List<int>> _discoverPidsViaBLE() async {
    final supported = <int>[];

    // Read PID support bitmaps (PIDs 0x00, 0x20, 0x40, 0x60)
    for (final base in [0x00, 0x20, 0x40, 0x60]) {
      try {
        final hex = base.toRadixString(16).padLeft(2, '0');
        final raw = await _bluetoothService.readPID(hex);
        final bitmap = _parseSupportBitmap(raw);
        for (var i = 0; i < 32; i++) {
          if (bitmap & (1 << (31 - i)) != 0) {
            supported.add(base + i + 1);
          }
        }
      } catch (e) {
        debugPrint('BLE PID support discovery error at base 0x${base.toRadixString(16)}: $e');
        break;
      }
    }

    return supported;
  }

  // ── OBD Response Parsing ──────────────────────────────

  LiveDataParameter? _parseOBDResponse(int pid, String raw) {
    // Clean response
    final cleaned = raw.replaceAll(RegExp(r'[^0-9A-Fa-f\s]'), '').trim();
    final bytes = cleaned.split(RegExp(r'\s+'));

    if (bytes.length < 3) return null;

    // Skip mode+pid bytes (first 2 bytes: 41 XX)
    final dataBytes = bytes.sublist(2);
    if (dataBytes.isEmpty) return null;

    final a = int.tryParse(dataBytes[0], radix: 16) ?? 0;
    final b = dataBytes.length > 1
        ? (int.tryParse(dataBytes[1], radix: 16) ?? 0)
        : 0;

    double value;
    String unit;
    String name;

    switch (pid) {
      case 0x04: // Engine Load
        value = a * 100.0 / 255.0;
        unit = '%';
        name = 'Engine Load';
        break;
      case 0x05: // Coolant Temp
        value = a - 40.0;
        unit = '°C';
        name = 'Coolant Temp';
        break;
      case 0x06: // Short Term Fuel Trim Bank 1
        value = (a - 128.0) * 100.0 / 128.0;
        unit = '%';
        name = 'STFT B1';
        break;
      case 0x07: // Long Term Fuel Trim Bank 1
        value = (a - 128.0) * 100.0 / 128.0;
        unit = '%';
        name = 'LTFT B1';
        break;
      case 0x0B: // Intake MAP
        value = a.toDouble();
        unit = 'kPa';
        name = 'Intake MAP';
        break;
      case 0x0C: // RPM
        value = ((a * 256) + b) / 4.0;
        unit = 'rpm';
        name = 'Engine RPM';
        break;
      case 0x0D: // Speed
        value = a.toDouble();
        unit = 'km/h';
        name = 'Vehicle Speed';
        break;
      case 0x0E: // Timing Advance
        value = a / 2.0 - 64.0;
        unit = '°BTDC';
        name = 'Timing Advance';
        break;
      case 0x0F: // Intake Air Temp
        value = a - 40.0;
        unit = '°C';
        name = 'Intake Air Temp';
        break;
      case 0x10: // MAF Rate
        value = ((a * 256) + b) / 100.0;
        unit = 'g/s';
        name = 'MAF Rate';
        break;
      case 0x11: // Throttle Position
        value = a * 100.0 / 255.0;
        unit = '%';
        name = 'Throttle Pos';
        break;
      case 0x14: // O2 Sensor B1S1
        value = a / 200.0;
        unit = 'V';
        name = 'O2 B1S1';
        break;
      case 0x15: // O2 Sensor B1S2
        value = a / 200.0;
        unit = 'V';
        name = 'O2 B1S2';
        break;
      case 0x42: // Control Voltage
        value = ((a * 256) + b) / 1000.0;
        unit = 'V';
        name = 'Battery Voltage';
        break;
      case 0x3C: // Cat Temp B1S1
        value = ((a * 256) + b) / 10.0 - 40.0;
        unit = '°C';
        name = 'Catalyst Temp';
        break;
      case 0x5B: // Hybrid Battery SOC
        value = a * 100.0 / 255.0;
        unit = '%';
        name = 'Hybrid Battery';
        break;
      case 0x5C: // Oil Temp
        value = a - 40.0;
        unit = '°C';
        name = 'Oil Temp';
        break;
      default:
        value = a.toDouble();
        unit = '';
        name = 'PID ${pid.toRadixString(16).toUpperCase()}';
    }

    final category = pidCategoryMap[0x0100 + pid] ?? LiveDataCategory.engine;

    // Determine normal range
    final range = pidNormalRanges[0x0100 + pid];
    double? min = range?.min;
    double? max = range?.max;

    return LiveDataParameter(
      id: 'pid-${pid.toRadixString(16)}',
      pid: '${pid.toRadixString(16).toUpperCase().padLeft(2, '0')}',
      name: name,
      value: value,
      unit: unit,
      category: category,
      normalMin: min,
      normalMax: max,
      timestamp: DateTime.now(),
    );
  }

  int _parseSupportBitmap(String raw) {
    final cleaned = raw.replaceAll(RegExp(r'[^0-9A-Fa-f\s]'), '').trim();
    final bytes = cleaned.split(RegExp(r'\s+'));

    if (bytes.length < 6) return 0; // mode + pid + 4 data bytes

    try {
      final dataHex = bytes.sublist(2, 6).join();
      return int.parse(dataHex, radix: 16);
    } catch (e) {
      debugPrint('PID support bitmap parse error: $e');
      return 0;
    }
  }

  List<DiagnosticTroubleCode> _parseBLEDTCResponse(
    String raw,
    DTCStatus status,
  ) {
    final cleaned = raw.replaceAll(RegExp(r'[^0-9A-Fa-f\s]'), '').trim();
    final bytes = cleaned.split(RegExp(r'\s+'));
    final dtcs = <DiagnosticTroubleCode>[];

    // Skip first byte (mode response: 43 for mode 03, 47 for mode 07)
    var i = 1;
    while (i + 1 < bytes.length) {
      final b1 = int.tryParse(bytes[i], radix: 16) ?? 0;
      final b2 = int.tryParse(bytes[i + 1], radix: 16) ?? 0;

      if (b1 == 0 && b2 == 0) {
        i += 2;
        continue;
      }

      // Decode DTC
      final firstChar = ['P', 'C', 'B', 'U'][(b1 >> 6) & 0x03];
      final secondChar = ((b1 >> 4) & 0x03).toRadixString(16);
      final rest = (b1 & 0x0F).toRadixString(16) +
          b2.toRadixString(16).padLeft(2, '0');

      final code = '$firstChar$secondChar$rest'.toUpperCase();

      dtcs.add(mapDtcResult(
        code: code,
        statusByte: 0,
        dtcStatus: status,
      ));

      i += 2;
    }

    return dtcs;
  }

  String? _parseVINResponse(String raw) {
    final cleaned = raw.replaceAll(RegExp(r'[^0-9A-Fa-f\s]'), '').trim();
    final bytes = cleaned.split(RegExp(r'\s+'));

    // VIN is 17 ASCII characters — skip header bytes
    final vinBytes = <int>[];
    for (var i = 0; i < bytes.length; i++) {
      final val = int.tryParse(bytes[i], radix: 16);
      if (val != null && val >= 0x20 && val <= 0x7E) {
        vinBytes.add(val);
      }
    }

    if (vinBytes.length >= 17) {
      return String.fromCharCodes(vinBytes.sublist(0, 17));
    }

    return null;
  }

  List<LiveDataParameter> _parseAgentLiveData(dynamic data) {
    if (data is! List) return [];

    return data.map<LiveDataParameter>((item) {
      final m = Map<String, dynamic>.from(item);
      final pid = m['pid'] as int? ?? 0;
      final category =
          pidCategoryMap[0x0100 + pid] ?? LiveDataCategory.engine;

      return LiveDataParameter(
        id: 'pid-${pid.toRadixString(16)}',
        pid: pid.toRadixString(16).toUpperCase().padLeft(2, '0'),
        name: m['name'] as String? ?? 'PID ${pid.toRadixString(16)}',
        value: (m['value'] as num?)?.toDouble() ?? 0,
        unit: m['unit'] as String? ?? '',
        category: category,
        normalMin: (m['min'] as num?)?.toDouble(),
        normalMax: (m['max'] as num?)?.toDouble(),
        timestamp: DateTime.now(),
      );
    }).toList();
  }

  ReadinessMonitors? _parseReadinessMonitors(String raw) {
    // Parse Mode 01 PID 01 response for monitor readiness
    final cleaned = raw.replaceAll(RegExp(r'[^0-9A-Fa-f\s]'), '').trim();
    final bytes = cleaned.split(RegExp(r'\s+'));

    if (bytes.length < 6) return null;

    try {
      final b = int.parse(bytes[3], radix: 16);
      final c = int.parse(bytes[4], radix: 16);
      final d = int.parse(bytes[5], radix: 16);

      MonitorStatus status(int supported, int notReady) {
        if (supported == 0) return MonitorStatus.notAvailable;
        return notReady == 0 ? MonitorStatus.complete : MonitorStatus.notReady;
      }

      return ReadinessMonitors(
        misfire: status((b >> 0) & 1, (b >> 4) & 1),
        fuelSystem: status((b >> 1) & 1, (b >> 5) & 1),
        components: status((b >> 2) & 1, (b >> 6) & 1),
        catalyst: status((c >> 0) & 1, (d >> 0) & 1),
        oxygenSensor: status((c >> 5) & 1, (d >> 5) & 1),
        oxygenSensorHeater: status((c >> 6) & 1, (d >> 6) & 1),
        evapSystem: status((c >> 2) & 1, (d >> 2) & 1),
        secondaryAir: status((c >> 3) & 1, (d >> 3) & 1),
        acRefrigerant: status((c >> 4) & 1, (d >> 4) & 1),
        exhaustGasSensor: status((c >> 1) & 1, (d >> 1) & 1),
        egr: status((c >> 7) & 1, (d >> 7) & 1),
      );
    } catch (e) {
      debugPrint('Readiness monitors parse error: $e');
      return null;
    }
  }

  ReadinessMonitors? _parseReadinessFromAgent(dynamic data) {
    if (data is! Map) return null;
    final m = Map<String, dynamic>.from(data);

    MonitorStatus fromStr(String? s) {
      switch (s) {
        case 'complete': return MonitorStatus.complete;
        case 'not_ready': return MonitorStatus.notReady;
        case 'not_available': return MonitorStatus.notAvailable;
        default: return MonitorStatus.notAvailable;
      }
    }

    return ReadinessMonitors(
      misfire: fromStr(m['misfire'] as String?),
      fuelSystem: fromStr(m['fuel_system'] as String?),
      components: fromStr(m['components'] as String?),
      catalyst: fromStr(m['catalyst'] as String?),
      oxygenSensor: fromStr(m['oxygen_sensor'] as String?),
      oxygenSensorHeater: fromStr(m['oxygen_sensor_heater'] as String?),
      evapSystem: fromStr(m['evap_system'] as String?),
      secondaryAir: fromStr(m['secondary_air'] as String?),
      acRefrigerant: fromStr(m['ac_refrigerant'] as String?),
      exhaustGasSensor: fromStr(m['exhaust_gas_sensor'] as String?),
      egr: fromStr(m['egr'] as String?),
    );
  }

  FreezeFrameData? _parseFreezeFrame(dynamic data) {
    if (data is! Map) return null;
    final m = Map<String, dynamic>.from(data);

    return FreezeFrameData(
      rpm: (m['rpm'] as num?)?.toDouble(),
      speed: (m['speed'] as num?)?.toDouble(),
      coolantTemp: (m['coolant_temp'] as num?)?.toDouble(),
      engineLoad: (m['engine_load'] as num?)?.toDouble(),
      fuelTrim: (m['fuel_trim'] as num?)?.toDouble(),
      intakeMAP: (m['intake_map'] as num?)?.toDouble(),
      throttlePos: (m['throttle_pos'] as num?)?.toDouble(),
      timestamp: m['timestamp'] != null
          ? DateTime.tryParse(m['timestamp'] as String)
          : null,
    );
  }

  /// Dispose all resources.
  void dispose() {
    _liveDataPollTimer?.cancel();
    _liveDataPollTimer = null;
    _reconnectTimer?.cancel();
    disconnect();
    _statusController.close();
    _liveDataController.close();
    _bluetoothService.dispose();
    _mockService.dispose();
  }
}

/// Riverpod provider for AgentBridgeService singleton.
/// Use `ref.read(agentBridgeProvider)` to access the service.
final agentBridgeProvider = Provider<AgentBridgeService>((ref) {
  final bt = ref.read(bluetoothServiceProvider);
  final service = AgentBridgeService(bluetoothService: bt);
  ref.onDispose(() => service.dispose());
  return service;
});
