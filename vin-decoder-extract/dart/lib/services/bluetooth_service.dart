/// Bluetooth service — supports BOTH Classic (SPP) and BLE OBD adapters.
/// ELM327 devices (VGate, clones, etc.) use Bluetooth Classic SPP/RFCOMM.
/// Some newer WiFi/BLE adapters use BLE GATT.
///
/// Uses flutter_bluetooth_serial_plus for Classic, flutter_blue_plus for BLE.

import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/foundation.dart';
import 'package:flutter_bluetooth_serial_plus/flutter_bluetooth_serial_plus.dart'
    as classic;
import 'package:flutter_blue_plus/flutter_blue_plus.dart' as ble;

// ── Device Abstraction ────────────────────────────────────

enum OBDTransport { classicSPP, ble }

/// Represents a discovered OBD adapter (Classic or BLE).
class DiscoveredOBDDevice {
  final String name;
  final String address;
  final int? rssi;
  final OBDTransport transport;

  /// Underlying Classic device reference (non-null when transport == classicSPP)
  final classic.BluetoothDevice? classicDevice;

  /// Underlying BLE device reference (non-null when transport == ble)
  final ble.BluetoothDevice? bleDevice;

  DiscoveredOBDDevice({
    required this.name,
    required this.address,
    this.rssi,
    required this.transport,
    this.classicDevice,
    this.bleDevice,
  });

  @override
  String toString() =>
      '$name ($address) [${transport == OBDTransport.classicSPP ? "Classic" : "BLE"}]';
}

// ── Bluetooth Service ─────────────────────────────────────

class BluetoothService {
  // Classic connection
  classic.BluetoothConnection? _classicConnection;

  // BLE connection
  ble.BluetoothDevice? _bleConnectedDevice;
  ble.BluetoothCharacteristic? _rxCharacteristic;
  ble.BluetoothCharacteristic? _txCharacteristic;
  StreamSubscription? _bleNotifySubscription;

  OBDTransport? _activeTransport;

  /// Clone mode support (for clone ELM327 chips that need ATCAF0/ATS0).
  bool _cloneMode = false;
  void setCloneMode(bool enabled) => _cloneMode = enabled;
  bool get cloneMode => _cloneMode;

  final StreamController<String> _responseController =
      StreamController<String>.broadcast();
  final StreamController<bool> _connectionController =
      StreamController<bool>.broadcast();

  final StringBuffer _responseBuffer = StringBuffer();

  Stream<String> get responseStream => _responseController.stream;
  Stream<bool> get connectionStream => _connectionController.stream;

  bool get isConnected =>
      _classicConnection != null || _bleConnectedDevice != null;

  // ── Scanning ────────────────────────────────────────────

  /// Scan for OBD adapters — tries Bluetooth Classic bonded devices first,
  /// then does a BLE scan. Returns a merged list.
  Future<List<DiscoveredOBDDevice>> scanForDevices({
    Duration timeout = const Duration(seconds: 6),
  }) async {
    final devices = <DiscoveredOBDDevice>[];

    // ─── 1. Bluetooth Classic: check bonded (paired) devices ───
    try {
      final bonded = await classic.FlutterBluetoothSerial.instance.getBondedDevices();
      for (final d in bonded) {
        final name = d.name ?? '';
        if (_isOBDAdapter(name) || _isOBDAdapter(d.address ?? '')) {
          devices.add(DiscoveredOBDDevice(
            name: name.isNotEmpty ? name : 'OBD Adapter',
            address: d.address ?? '',
            transport: OBDTransport.classicSPP,
            classicDevice: d,
          ));
        }
      }
      debugPrint('BYKI BT: Found ${devices.length} bonded Classic OBD adapters');
    } catch (e) {
      debugPrint('BYKI BT: Classic scan error: $e');
    }

    // ─── 2. Bluetooth Classic: discovery for non-bonded devices ───
    try {
      final discoveryStream =
          classic.FlutterBluetoothSerial.instance.startDiscovery();
      final disco = <classic.BluetoothDiscoveryResult>[];

      await for (final result in discoveryStream.timeout(
        timeout,
        onTimeout: (sink) => sink.close(),
      )) {
        disco.add(result);
      }

      for (final r in disco) {
        final name = r.device.name ?? '';
        final addr = r.device.address ?? '';
        if (_isOBDAdapter(name) || _isOBDAdapter(addr)) {
          // Skip duplicates already found via bonded
          if (devices.any((d) => d.address == addr)) continue;
          devices.add(DiscoveredOBDDevice(
            name: name.isNotEmpty ? name : 'OBD Adapter',
            address: addr,
            rssi: r.rssi,
            transport: OBDTransport.classicSPP,
            classicDevice: r.device,
          ));
        }
      }
      debugPrint('BYKI BT: Discovery found ${disco.length} total, '
          '${devices.length} OBD adapters after filtering');
    } catch (e) {
      debugPrint('BYKI BT: Classic discovery error: $e');
    }

    // ─── 3. BLE scan (catches WiFi-BLE hybrid adapters) ───
    try {
      if (await ble.FlutterBluePlus.isSupported) {
        final bleDevices = <ble.ScanResult>[];
        final sub = ble.FlutterBluePlus.scanResults.listen((results) {
          bleDevices.addAll(results);
        });

        await ble.FlutterBluePlus.startScan(timeout: const Duration(seconds: 4));
        sub.cancel();

        for (final r in bleDevices) {
          final name = r.device.platformName;
          if (_isOBDAdapter(name)) {
            // Skip if we already have this via Classic
            if (devices.any((d) => d.name == name)) continue;
            devices.add(DiscoveredOBDDevice(
              name: name.isNotEmpty ? name : 'BLE OBD Adapter',
              address: r.device.remoteId.str,
              rssi: r.rssi,
              transport: OBDTransport.ble,
              bleDevice: r.device,
            ));
          }
        }
      }
    } catch (e) {
      debugPrint('BYKI BT: BLE scan error: $e');
    }

    debugPrint('BYKI BT: Total OBD devices found: ${devices.length}');
    return devices;
  }

  // ── Connection ──────────────────────────────────────────

  /// Connect to a discovered OBD device (auto-selects Classic or BLE).
  Future<void> connect(DiscoveredOBDDevice device) async {
    switch (device.transport) {
      case OBDTransport.classicSPP:
        await _connectClassic(device);
        break;
      case OBDTransport.ble:
        await _connectBLE(device);
        break;
    }
    _connectionController.add(true);
    await _initializeELM327();
  }

  /// Connect via Bluetooth Classic SPP/RFCOMM.
  Future<void> _connectClassic(DiscoveredOBDDevice device) async {
    try {
      debugPrint('BYKI BT: Connecting Classic SPP to ${device.address}...');
      _classicConnection =
          await classic.BluetoothConnection.toAddress(device.address);
      _activeTransport = OBDTransport.classicSPP;

      // Listen to incoming data
      _classicConnection!.input?.listen(
        (data) => _handleRawData(data),
        onDone: () {
          debugPrint('BYKI BT: Classic connection closed');
          _classicConnection = null;
          _connectionController.add(false);
        },
      );

      debugPrint('BYKI BT: Classic SPP connected to ${device.name}');
    } catch (e) {
      debugPrint('BYKI BT: Classic connect failed: $e');
      _classicConnection = null;
      rethrow;
    }
  }

  /// Connect via BLE GATT.
  Future<void> _connectBLE(DiscoveredOBDDevice device) async {
    if (device.bleDevice == null) {
      throw Exception('No BLE device reference');
    }

    try {
      debugPrint('BYKI BT: Connecting BLE to ${device.name}...');
      await device.bleDevice!.connect(
        timeout: const Duration(seconds: 10),
        autoConnect: false,
      );

      final services = await device.bleDevice!.discoverServices();

      for (final service in services) {
        final uuid = service.uuid.toString().toLowerCase();
        if (uuid.contains('fff0') ||
            uuid.contains('ffe0') ||
            uuid.contains('1101')) {
          for (final char in service.characteristics) {
            final charUuid = char.uuid.toString().toLowerCase();
            if (charUuid.contains('fff1') || charUuid.contains('ffe1')) {
              _rxCharacteristic = char;
            } else if (charUuid.contains('fff2') || charUuid.contains('ffe2')) {
              _txCharacteristic = char;
            }
          }
          break;
        }
      }

      // Fallback: first writable/notifiable
      if (_rxCharacteristic == null || _txCharacteristic == null) {
        for (final service in services) {
          for (final char in service.characteristics) {
            if (char.properties.notify && _rxCharacteristic == null) {
              _rxCharacteristic = char;
            }
            if (char.properties.write && _txCharacteristic == null) {
              _txCharacteristic = char;
            }
          }
        }
      }

      if (_rxCharacteristic == null || _txCharacteristic == null) {
        throw Exception('Could not find OBD characteristics on ${device.name}');
      }

      await _rxCharacteristic!.setNotifyValue(true);
      _bleNotifySubscription =
          _rxCharacteristic!.onValueReceived.listen(_handleRawData);

      _bleConnectedDevice = device.bleDevice;
      _activeTransport = OBDTransport.ble;

      debugPrint('BYKI BT: BLE connected to ${device.name}');
    } catch (e) {
      await disconnect();
      rethrow;
    }
  }

  /// Disconnect from the current device.
  Future<void> disconnect() async {
    _bleNotifySubscription?.cancel();
    _bleNotifySubscription = null;

    if (_classicConnection != null) {
      try {
        _classicConnection!.finish();
      } catch (_) {}
      _classicConnection = null;
    }

    if (_bleConnectedDevice != null) {
      try {
        await _bleConnectedDevice!.disconnect();
      } catch (_) {}
      _bleConnectedDevice = null;
    }

    _rxCharacteristic = null;
    _txCharacteristic = null;
    _activeTransport = null;
    _connectionController.add(false);
  }

  // ── OBD Commands ────────────────────────────────────────

  /// Send an OBD-II command and wait for the response.
  Future<String> sendCommand(
    String command, {
    Duration timeout = const Duration(seconds: 3),
  }) async {
    if (!isConnected) throw Exception('Not connected to OBD device');

    _responseBuffer.clear();

    final data = utf8.encode('$command\r');

    if (_activeTransport == OBDTransport.classicSPP &&
        _classicConnection != null) {
      _classicConnection!.output.add(Uint8List.fromList(data));
      await _classicConnection!.output.allSent;
    } else if (_activeTransport == OBDTransport.ble &&
        _txCharacteristic != null) {
      await _txCharacteristic!.write(
        Uint8List.fromList(data),
        withoutResponse: false,
      );
    } else {
      throw Exception('No active transport');
    }

    // Wait for response terminated by '>'
    final completer = Completer<String>();
    late StreamSubscription sub;
    Timer? timer;

    sub = responseStream.listen((response) {
      if (!completer.isCompleted) {
        completer.complete(response);
        sub.cancel();
        timer?.cancel();
      }
    });

    timer = Timer(timeout, () {
      if (!completer.isCompleted) {
        final partial = _responseBuffer.toString().trim();
        completer.complete(partial.isNotEmpty ? partial : 'NO DATA');
        sub.cancel();
      }
    });

    return completer.future;
  }

  /// Send a raw AT command.
  Future<String> sendAT(String atCommand) => sendCommand('AT$atCommand');

  /// Read a specific OBD-II PID (Mode 01).
  Future<String> readPID(String pid) => sendCommand('01$pid');

  /// Read DTCs (Mode 03).
  Future<String> readDTCs() => sendCommand('03');

  /// Clear DTCs (Mode 04).
  Future<String> clearDTCs() => sendCommand('04');

  /// Read VIN (Mode 09, PID 02).
  Future<String> readVIN() => sendCommand('0902');

  // ── Private helpers ─────────────────────────────────────

  void _handleRawData(List<int> data) {
    final chunk = utf8.decode(data, allowMalformed: true);
    _responseBuffer.write(chunk);

    final content = _responseBuffer.toString();
    if (content.contains('>')) {
      final response = content
          .replaceAll('>', '')
          .replaceAll('\r', '\n')
          .split('\n')
          .where((line) => line.trim().isNotEmpty)
          .join('\n')
          .trim();

      _responseController.add(response);
      _responseBuffer.clear();
    }
  }

  Future<void> _initializeELM327() async {
    debugPrint('BYKI BT: Initializing ELM327...');

    // Reset
    await sendAT('Z');
    await Future.delayed(const Duration(milliseconds: 1000));

    // Echo off
    await sendAT('E0');

    // Line feeds off
    await sendAT('L0');

    // Headers on (needed for multi-ECU)
    await sendAT('H1');

    // Clone mode: disable CAN auto-formatting and spaces
    if (_cloneMode) {
      debugPrint('BYKI BT: Clone mode — sending ATCAF0, ATS0');
      await sendAT('CAF0');
      await sendAT('S0');
    }

    // Auto-detect protocol
    await sendAT('SP0');

    // Adaptive timing auto 2
    await sendAT('AT2');

    // Verify connectivity
    final probe = await sendCommand('0100', timeout: const Duration(seconds: 4));
    debugPrint('BYKI BT: Probe 0100 → $probe');

    if (probe.contains('NO DATA') ||
        probe.contains('UNABLE') ||
        probe.contains('ERROR')) {
      debugPrint('BYKI BT: Auto-detect failed, trying CAN 11/500 (SP6)');
      await sendAT('SP6');
      await Future.delayed(const Duration(milliseconds: 300));
      final retry =
          await sendCommand('0100', timeout: const Duration(seconds: 4));
      debugPrint('BYKI BT: Retry 0100 → $retry');
    }

    debugPrint('BYKI BT: ELM327 init complete');
  }

  bool _isOBDAdapter(String name) {
    final lower = name.toLowerCase();
    return lower.contains('obd') ||
        lower.contains('elm') ||
        lower.contains('vlink') ||
        lower.contains('veepeak') ||
        lower.contains('byki') ||
        lower.contains('vgate') ||
        lower.contains('icar') ||
        (lower.contains('car') && lower.contains('scan')) ||
        lower.contains('obdlink') ||
        lower.contains('konnwei') ||
        lower.contains('launch') ||
        lower.contains('v-link') ||
        lower.contains('carista') ||
        lower.contains('torque') ||
        lower.contains('scan tool') ||
        lower.contains('diag');
  }

  void dispose() {
    disconnect();
    _responseController.close();
    _connectionController.close();
  }
}
