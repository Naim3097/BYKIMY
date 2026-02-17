/// Topology Scanner Service — Professional-grade vehicle ECU discovery.
/// Ported from BYKI X1's proven 2631-line implementation that detects 5-7/7 ECU systems.
///
/// Key techniques that make this superior:
/// 1. 3-phase ECU discovery (broadcast → passive bus monitor → address sweep)
/// 2. Profile-specific module headers per brand (Perodua/Proton/Honda/Toyota)
/// 3. ATAR filter reset between every module scan
/// 4. 800ms inter-module delay for bus stability
/// 5. Multi-method UDS probing (TesterPresent → DiagSession → Mode03 → ExtSession)
/// 6. NRC (negative response) = module exists logic
/// 7. CAN error recovery (ATPC → ATWS → reinitialize)
/// 8. ATSTFF max timeout (1020ms) for slow ECUs
/// 9. 5-step flush-and-prepare between modules
/// 10. Passive bus monitoring (ATMA)
///
/// Adapted to use byki_app's BluetoothService for transport instead of X1's SharedOBDConnection.

import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/vehicle_system.dart';
import '../data/vehicle_profiles.dart';
import 'bluetooth_service.dart';
import 'fault_database_service.dart';

/// Current phase of the topology scan — exposed for UI
enum ScanPhase {
  idle,
  connecting,
  loadingDatabase,
  protocolDetection,
  ecuDiscovery,
  readingVin,
  readingBattery,
  scanningModules,
  complete,
  error,
}

/// Discovered ECU information for UI display
class DiscoveredEcu {
  final String txAddress;
  final String rxAddress;
  final String moduleName;
  final DateTime discoveredAt;

  DiscoveredEcu({
    required this.txAddress,
    required this.rxAddress,
    required this.moduleName,
    required this.discoveredAt,
  });
}

/// Protocol attempt result for UI display
class ProtocolAttempt {
  final String command;
  final String description;
  final bool success;
  final String? errorMessage;
  final DateTime timestamp;

  ProtocolAttempt({
    required this.command,
    required this.description,
    required this.success,
    this.errorMessage,
    required this.timestamp,
  });
}

class TopologyScannerService with ChangeNotifier {
  final BluetoothService _bluetooth;
  final FaultDatabaseService _faultDb = FaultDatabaseService();

  TopologyScannerService(this._bluetooth);

  // DEBUG LOGGING
  final List<String> _debugLogs = [];
  List<String> get debugLogs => List.unmodifiable(_debugLogs);
  static const int _maxLogs = 500;

  void _log(String message) {
    final timestamp =
        DateTime.now().toString().substring(11, 23); // HH:mm:ss.SSS
    final logEntry = '[$timestamp] $message';
    _debugLogs.add(logEntry);
    if (_debugLogs.length > _maxLogs) {
      _debugLogs.removeAt(0);
    }
    // ignore: avoid_print
    print(logEntry);
    notifyListeners();
  }

  void clearDebugLogs() {
    _debugLogs.clear();
    notifyListeners();
  }

  // Scan State
  bool _isScanning = false;
  String _currentAction = 'Ready';
  String _vin = 'Unknown';
  String _batteryVoltage = '-- V';
  double _progress = 0.0;
  VehicleProfile? _selectedProfile;

  void setProfile(VehicleProfile profile) {
    _selectedProfile = profile;
    _log('🔧 Profile set: ${profile.brand} ${profile.model}');
    notifyListeners();
  }

  // The "Topology" — List of all potential systems
  List<VehicleSystem> systems = [
    VehicleSystem(
      id: 'ECM',
      name: 'Engine Control Module',
      description: 'Powertrain',
      headerAddress: '7E0',
      alternativeHeaders: ['7E2'],
    ),
    VehicleSystem(
      id: 'TCM',
      name: 'Transmission Control',
      description: 'Powertrain',
      headerAddress: '7E1',
      alternativeHeaders: ['7E2', '7E3'],
    ),
    VehicleSystem(
      id: 'ABS',
      name: 'Anti-Lock Braking',
      description: 'Chassis',
      headerAddress: '7B0',
      alternativeHeaders: ['7A0', '7D0', '750', '751', '7A8', '7B8', '7E3'],
    ),
    VehicleSystem(
      id: 'SRS',
      name: 'Airbag System',
      description: 'Safety',
      headerAddress: '780',
      alternativeHeaders: ['7A2', '772', '770', '788', '7A5', '7B1'],
    ),
    VehicleSystem(
      id: 'BCM',
      name: 'Body Control Module',
      description: 'Body',
      headerAddress: '7C0',
      alternativeHeaders: ['750', '760', '740', '746', '7B4', '7A4', '7D4', '7E4'],
    ),
    VehicleSystem(
      id: 'EPS',
      name: 'Electric Power Steering',
      description: 'Chassis',
      headerAddress: '790',
      alternativeHeaders: ['7D0', '730', '7A1', '7D2', '7B2', '7E5'],
    ),
    VehicleSystem(
      id: 'IPC',
      name: 'Instrument Cluster',
      description: 'Info',
      headerAddress: '7C0',
      alternativeHeaders: ['7C4', '7C8', '760', '7E6', '7E7'],
    ),
  ];

  bool get isScanning => _isScanning;
  String get currentAction => _currentAction;
  String get vin => _vin;
  String get batteryVoltage => _batteryVoltage;
  double get progress => _progress;
  bool get isConnected => _bluetooth.isConnected;

  // Scan Phase Tracking
  ScanPhase _currentPhase = ScanPhase.idle;
  ScanPhase get currentPhase => _currentPhase;

  // Protocol Detection Info
  final List<ProtocolAttempt> _protocolAttempts = [];
  List<ProtocolAttempt> get protocolAttempts =>
      List.unmodifiable(_protocolAttempts);

  // ECU Discovery Info
  final List<DiscoveredEcu> _discoveredEcusList = [];
  List<DiscoveredEcu> get discoveredEcusList =>
      List.unmodifiable(_discoveredEcusList);

  // Currently scanning module
  String _currentModuleId = '';
  String get currentModuleId => _currentModuleId;
  String _currentProbeAddress = '';
  String get currentProbeAddress => _currentProbeAddress;

  // Protocol & Bus Info (public)
  String get detectedProtocol => _detectedProtocol;
  String get detectedBaudRate => _detectedBaudRate;
  int get discoveredEcuCount => _discoveredEcus.length;
  Map<String, String> get discoveredEcus => Map.unmodifiable(_discoveredEcus);

  // Technical stats
  int _commandsSent = 0;
  int get commandsSent => _commandsSent;
  int _responsesReceived = 0;
  int get responsesReceived => _responsesReceived;
  int _errorsEncountered = 0;
  int get errorsEncountered => _errorsEncountered;

  // Timing info
  DateTime? _scanStartTime;
  DateTime? get scanStartTime => _scanStartTime;
  Duration get scanDuration => _scanStartTime != null
      ? DateTime.now().difference(_scanStartTime!)
      : Duration.zero;

  // ── Private state ──
  Map<String, String> _discoveredEcus = {}; // TX Address → RX Address
  String _detectedProtocol = '';
  String _detectedBaudRate = '';

  // ── Helpers ──

  /// Send an ELM327 command and wait for response.
  /// Wraps BluetoothService.sendCommand, which already handles the `>` prompt.
  Future<String> _send(String command, {int timeoutMs = 3000}) async {
    _commandsSent++;
    try {
      final response = await _bluetooth.sendCommand(
        command,
        timeout: Duration(milliseconds: timeoutMs),
      );
      _responsesReceived++;
      return response;
    } catch (e) {
      _errorsEncountered++;
      return 'ERROR: $e';
    }
  }

  void _setPhase(ScanPhase phase) {
    _currentPhase = phase;
    notifyListeners();
  }

  void _addProtocolAttempt(String command, String description, bool success,
      [String? error]) {
    _protocolAttempts.add(ProtocolAttempt(
      command: command,
      description: description,
      success: success,
      errorMessage: error,
      timestamp: DateTime.now(),
    ));
    notifyListeners();
  }

  void _addDiscoveredEcu(String txAddr, String rxAddr, String moduleName) {
    _discoveredEcusList.add(DiscoveredEcu(
      txAddress: txAddr,
      rxAddress: rxAddr,
      moduleName: moduleName,
      discoveredAt: DateTime.now(),
    ));
    notifyListeners();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN SCAN ENTRY POINT
  // ════════════════════════════════════════════════════════════════════════════

  Future<void> startTopologyScan() async {
    if (_isScanning) return;

    _isScanning = true;
    _progress = 0.0;
    _resetSystems();

    // Reset UI tracking data
    _protocolAttempts.clear();
    _discoveredEcusList.clear();
    _currentModuleId = '';
    _currentProbeAddress = '';
    _commandsSent = 0;
    _responsesReceived = 0;
    _errorsEncountered = 0;
    _scanStartTime = DateTime.now();

    _setPhase(ScanPhase.connecting);
    _log('════════════════════════════════════════');
    _log('🔧 TOPOLOGY SCAN STARTED');
    _log('════════════════════════════════════════');
    notifyListeners();

    try {
      // 1. Connection Check
      if (!_bluetooth.isConnected) {
        _setPhase(ScanPhase.connecting);
        _updateStatus('Waiting for BT connection...', 0.05);
        _log('❌ Not connected — connect via Bluetooth first');
        throw Exception('Not connected to OBD adapter. Connect via Bluetooth first.');
      }
      _log('✅ OBD adapter connected');

      // 1.5 Load Database
      _setPhase(ScanPhase.loadingDatabase);
      _updateStatus('Loading Database...', 0.08);
      await _faultDb.loadDatabase();
      _log('✅ Fault database loaded');

      // 2. Protocol Setup (Critical — must happen before any OBD commands)
      _setPhase(ScanPhase.protocolDetection);
      _updateStatus('Detecting CAN Protocol...', 0.1);
      await _initializeProtocol();

      // 3. VIN
      _setPhase(ScanPhase.readingVin);
      _updateStatus('Reading VIN...', 0.12);
      await _readVin();
      _log('📋 VIN: $_vin');

      // 3.5 Battery
      _setPhase(ScanPhase.readingBattery);
      _updateStatus('Checking Battery...', 0.15);
      await _readBatteryVoltage();
      _log('🔋 Battery: $_batteryVoltage');

      // 4. Topology Ping & Scan
      _setPhase(ScanPhase.scanningModules);
      final totalSystems = systems.length;
      _log('════════════════════════════════════════');
      _log('🔍 SCANNING $totalSystems MODULES');
      _log('════════════════════════════════════════');

      for (int i = 0; i < totalSystems; i++) {
        final system = systems[i];
        final stepProgress = 0.2 + ((i / totalSystems) * 0.8);

        _currentModuleId = system.id;
        _currentProbeAddress = system.headerAddress;
        _updateStatus('Scanning ${system.name}...', stepProgress);

        system.status = SystemStatus.scanning;
        notifyListeners();

        await _scanSystem(system);

        // CRITICAL: 800ms delay between modules for bus stability
        await Future.delayed(const Duration(milliseconds: 800));
        notifyListeners();
      }

      _currentModuleId = '';
      _currentProbeAddress = '';
      _setPhase(ScanPhase.complete);
      _updateStatus('Scan Complete', 1.0);
    } catch (e) {
      _setPhase(ScanPhase.error);
      _errorsEncountered++;
      _updateStatus('Error: $e', 0.0);
    } finally {
      _isScanning = false;
      notifyListeners();
    }
  }

  void _resetSystems() {
    for (final s in systems) {
      s.status = SystemStatus.unknown;
      s.faultCount = 0;
      s.faultCodes = [];
      s.faultDetails = [];
      s.pendingFaultCount = 0;
      s.pendingFaultCodes = [];
      s.pendingFaultDetails = [];
    }
  }

  void _updateStatus(String action, double progress) {
    _currentAction = action;
    _progress = progress;
    notifyListeners();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PROTOCOL INITIALIZATION — Professional-grade sequence
  // ════════════════════════════════════════════════════════════════════════════

  Future<void> _initializeProtocol() async {
    _log('════════════════════════════════════════');
    _log('🔧 PROTOCOL INITIALIZATION (Pro Mode)');
    _log('════════════════════════════════════════');

    _discoveredEcus.clear();
    _detectedProtocol = '';
    _detectedBaudRate = '';

    // STEP 1: Hard Reset
    try {
      final atzResp = await _send('ATZ', timeoutMs: 3000);
      _log('✅ ATZ → ${atzResp.split('\n').first}');
    } catch (e) {
      _log('⚠️ ATZ timeout (normal for some adapters)');
    }
    await Future.delayed(const Duration(milliseconds: 1000));

    // STEP 2: Basic Configuration (CRITICAL ORDER!)
    final basicCommands = [
      'ATE0', // Echo OFF
      'ATL1', // Linefeed ON — needed for multi-frame responses
      'ATS1', // Spaces ON
      'ATH1', // Headers ON — CRITICAL to identify ECU source
      'ATAT2', // Adaptive Timing mode 2
      'ATSTFF', // Maximum Timeout (255 × 4ms = 1020ms)
      'ATCAF1', // CAN Auto Formatting ON
    ];

    _log('🔧 Basic Configuration:');
    for (final cmd in basicCommands) {
      try {
        final resp = await _send(cmd, timeoutMs: 1000);
        final success = resp.toUpperCase().contains('OK') ||
            (!resp.toUpperCase().contains('ERROR') &&
                !resp.toUpperCase().contains('?'));
        _log('   $cmd → ${success ? "OK" : "FAIL: $resp"}');
      } catch (e) {
        _log('   $cmd → FAIL: $e');
      }
      await Future.delayed(const Duration(milliseconds: 150));
    }

    // STEP 3: SMART PROTOCOL DETECTION
    _log('════════════════════════════════════════');
    _log('🔍 PROTOCOL DETECTION');
    _log('════════════════════════════════════════');

    bool protocolFound = false;

    if (_selectedProfile != null &&
        _selectedProfile!.protocolCmd != 'ATSP0') {
      _log('🔧 Trying profile protocol: ${_selectedProfile!.protocolCmd}');
      protocolFound = await _tryProtocol(_selectedProfile!.protocolCmd);

      if (!protocolFound) {
        _log('⚠️ Profile protocol failed, trying alternatives...');
      }
    }

    if (!protocolFound) {
      protocolFound = await _smartProtocolDetection();
    }

    // Apply profile-specific init commands
    if (_selectedProfile != null) {
      _log('🔧 Applying profile init commands:');
      for (final cmd in _selectedProfile!.initCommands) {
        if (!basicCommands.contains(cmd) && !cmd.startsWith('ATSP')) {
          try {
            await _send(cmd, timeoutMs: 1000);
            _log('   $cmd → OK');
          } catch (e) {
            _log('   $cmd → FAIL');
          }
        }
      }
    }

    // STEP 4: ECU DISCOVERY
    if (protocolFound) {
      await _discoverAllEcus();
    }

    _log('════════════════════════════════════════');
    _log('🔧 Protocol Init: Complete');
    _log('   Protocol: $_detectedProtocol');
    _log('   Baud Rate: $_detectedBaudRate');
    _log('   ECUs Found: ${_discoveredEcus.length}');
    _log('════════════════════════════════════════');
  }

  Future<bool> _smartProtocolDetection() async {
    final protocolsToTry = [
      ('ATSP0', 'Auto-Detect', 'ISO 15765-4 CAN (Auto)'),
      ('ATSP6', 'CAN 500k 11-bit', 'ISO 15765-4 CAN 11-bit 500kbps'),
      ('ATSP8', 'CAN 250k 11-bit', 'ISO 15765-4 CAN 11-bit 250kbps'),
      ('ATSP7', 'CAN 500k 29-bit', 'ISO 15765-4 CAN 29-bit 500kbps'),
      ('ATSP9', 'CAN 250k 29-bit', 'SAE J1939 CAN 29-bit 250kbps'),
    ];

    for (final (cmd, shortDesc, fullDesc) in protocolsToTry) {
      _log('🔄 Trying $shortDesc ($cmd)...');
      _commandsSent++;

      final success = await _tryProtocol(cmd);
      _addProtocolAttempt(cmd, fullDesc, success);

      if (success) {
        _log('✅ Protocol found: $shortDesc');
        _responsesReceived++;
        return true;
      }

      await Future.delayed(const Duration(milliseconds: 300));
    }

    _log('❌ No compatible protocol found!');
    return false;
  }

  Future<bool> _tryProtocol(String protocolCmd) async {
    try {
      await _send(protocolCmd, timeoutMs: 2000);
      await Future.delayed(const Duration(milliseconds: 200));

      // Clear receive filters
      try {
        await _send('ATAR', timeoutMs: 500);
      } catch (e) {
        // Ignore
      }

      // Test with broadcast 0100
      final response = await _send('0100', timeoutMs: 8000);
      _log('   Response: ${response.length > 60 ? response.substring(0, 60) + '...' : response}');

      final upper = response.toUpperCase();

      if (upper.contains('41 00') || upper.contains('4100')) {
        try {
          final dpn = await _send('ATDPN', timeoutMs: 1000);
          final cleaned =
              dpn.replaceAll(RegExp(r'[^0-9A-Za-z]'), '');
          _detectedProtocol = _parseProtocolNumber(cleaned);
          _detectedBaudRate = _parseBaudRate(cleaned);
          _log('   ATDPN → $cleaned ($_detectedProtocol @ $_detectedBaudRate)');
        } catch (e) {
          _detectedProtocol = protocolCmd;
        }
        return true;
      } else if (upper.contains('SEARCHING')) {
        _log('   Searching...');
        await Future.delayed(const Duration(seconds: 3));
        try {
          final dpn = await _send('ATDPN', timeoutMs: 1000);
          if (!dpn.contains('0') || dpn.contains('A')) {
            _detectedProtocol = _parseProtocolNumber(dpn);
            _detectedBaudRate = _parseBaudRate(dpn);
            _log('   Search found: $_detectedProtocol');
            return true;
          }
        } catch (e) {
          // Ignore
        }
      } else if (upper.contains('CAN ERROR') || upper.contains('BUS ERROR')) {
        _log('   ❌ Bus error');
      } else if (upper.contains('NO DATA') || upper.contains('UNABLE')) {
        _log('   ❌ No response');
      }

      return false;
    } catch (e) {
      _log('   ❌ Exception: $e');
      return false;
    }
  }

  String _parseProtocolNumber(String dpn) {
    final num = dpn.replaceAll('A', '').replaceAll('a', '').trim();
    switch (num) {
      case '1':
        return 'SAE J1850 PWM';
      case '2':
        return 'SAE J1850 VPW';
      case '3':
        return 'ISO 9141-2';
      case '4':
        return 'ISO 14230-4 KWP (5-baud)';
      case '5':
        return 'ISO 14230-4 KWP (fast)';
      case '6':
        return 'ISO 15765-4 CAN (11-bit, 500k)';
      case '7':
        return 'ISO 15765-4 CAN (29-bit, 500k)';
      case '8':
        return 'ISO 15765-4 CAN (11-bit, 250k)';
      case '9':
        return 'ISO 15765-4 CAN (29-bit, 250k)';
      case 'A':
        return 'SAE J1939 CAN (29-bit, 250k)';
      case 'B':
        return 'User CAN 1 (11-bit, 125k)';
      case 'C':
        return 'User CAN 2 (11-bit, 50k)';
      default:
        return 'Unknown ($dpn)';
    }
  }

  String _parseBaudRate(String dpn) {
    final num = dpn.replaceAll('A', '').replaceAll('a', '').trim();
    switch (num) {
      case '6':
      case '7':
        return '500 kbps';
      case '8':
      case '9':
      case 'A':
        return '250 kbps';
      case 'B':
        return '125 kbps';
      case 'C':
        return '50 kbps';
      default:
        return 'Unknown';
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ECU DISCOVERY — 3-Phase approach
  // ════════════════════════════════════════════════════════════════════════════

  Future<void> _discoverAllEcus() async {
    _setPhase(ScanPhase.ecuDiscovery);
    _log('════════════════════════════════════════');
    _log('🔍 ECU DISCOVERY (3-Phase)');
    _log('════════════════════════════════════════');

    _discoveredEcus.clear();
    _discoveredEcusList.clear();

    try {
      // Phase 1: Broadcast query
      await _send('ATSH7DF', timeoutMs: 1000);
      await _send('ATAR', timeoutMs: 500);
      await Future.delayed(const Duration(milliseconds: 200));

      _commandsSent++;
      final response = await _send('0100', timeoutMs: 5000);
      _log('📡 Broadcast Response:');

      // Parse response headers (7E8, 7E9, 7EA, etc.)
      final headerPattern =
          RegExp(r'(7[0-9A-Fa-f]{2})\s+[0-9A-Fa-f]{2}\s+41\s+00');
      for (final match in headerPattern.allMatches(response)) {
        final rxAddr = match.group(1)!.toUpperCase();
        final rxInt = int.parse(rxAddr, radix: 16);
        final txInt = rxInt - 8;
        final txAddr =
            txInt.toRadixString(16).toUpperCase().padLeft(3, '0');

        _discoveredEcus[txAddr] = rxAddr;
        final ecuName = _identifyEcu(txAddr);
        _log('   ✅ Found: $ecuName (TX: $txAddr → RX: $rxAddr)');
        _addDiscoveredEcu(txAddr, rxAddr, ecuName);
        _responsesReceived++;
      }

      // Also check for simpler pattern
      final simplePattern = RegExp(r'(7[0-9A-Fa-f]{2})\s');
      for (final match in simplePattern.allMatches(response)) {
        final rxAddr = match.group(1)!.toUpperCase();
        final rxInt = int.parse(rxAddr, radix: 16);
        if (rxInt >= 0x7E8 && rxInt <= 0x7EF) {
          final txInt = rxInt - 8;
          final txAddr =
              txInt.toRadixString(16).toUpperCase().padLeft(3, '0');
          if (!_discoveredEcus.containsKey(txAddr)) {
            _discoveredEcus[txAddr] = rxAddr;
            final ecuName = _identifyEcu(txAddr);
            _log('   ✅ Found: $ecuName (TX: $txAddr → RX: $rxAddr)');
            _addDiscoveredEcu(txAddr, rxAddr, ecuName);
            _responsesReceived++;
          }
        }
      }

      // Check for TCM directly if not found
      if (!_discoveredEcus.containsKey('7E1')) {
        _log('🔍 TCM not in broadcast, checking directly...');
        await _probeSpecificEcu('7E1', 'TCM');
      }

      // Phase 2: Passive Bus Monitoring (ATMA)
      await _passiveBusMonitor();

      // Phase 3: Fast Address Sweep
      await _comprehensiveAddressSweep();

      // Summary
      _log('────────────────────────────────────────');
      _log('📋 ECU Discovery Summary:');
      if (_discoveredEcus.isEmpty) {
        _log('   ⚠️ No ECUs discovered via broadcast');
        _log('   💡 Will fall back to direct probing during scan');
      } else {
        _discoveredEcus.forEach((tx, rx) {
          _log('   • ${_identifyEcu(tx)}: $tx → $rx');
        });
        if (!_discoveredEcus.containsKey('7E1')) {
          _log(
              '   ℹ️ TCM not found — Manual transmission or TCM asleep');
        }
      }
    } catch (e) {
      _log('⚠️ ECU discovery error: $e');
    }
  }

  /// Phase 2: Passive bus monitoring — listens to CAN traffic without sending
  Future<void> _passiveBusMonitor() async {
    _log('');
    _log('🔍 PASSIVE BUS MONITORING');
    _log('   Listening to CAN traffic for 2 seconds...');

    try {
      await _send('ATAR', timeoutMs: 500);
      await Future.delayed(const Duration(milliseconds: 100));

      final Set<String> observedAddresses = {};
      String monitorData = '';

      try {
        monitorData = await _send('ATMA', timeoutMs: 2000);
      } catch (e) {
        // Timeout is expected
      }

      // Send character to exit monitor mode
      try {
        await _send(' ', timeoutMs: 300);
      } catch (e) {
        // Ignore
      }

      final canIdPattern = RegExp(r'(7[0-9A-Fa-f]{2})\s+[0-9A-Fa-f]{2}');
      for (final match in canIdPattern.allMatches(monitorData)) {
        observedAddresses.add(match.group(1)!.toUpperCase());
      }

      if (observedAddresses.isNotEmpty) {
        _log('   📡 Observed CAN IDs: ${observedAddresses.join(", ")}');
        for (final rxAddr in observedAddresses) {
          final rxInt = int.tryParse(rxAddr, radix: 16) ?? 0;
          final txInt = rxInt - 8;
          if (txInt >= 0x700) {
            final txAddr =
                txInt.toRadixString(16).toUpperCase().padLeft(3, '0');
            if (!_discoveredEcus.containsKey(txAddr)) {
              _log('   ✅ Possible module: $txAddr → $rxAddr');
            }
          }
        }
      } else {
        _log('   ℹ️ No traffic observed (modules may be idle)');
      }

      await _flushAndPrepare();
    } catch (e) {
      _log('   ⚠️ Passive monitoring error: $e');
      await _flushAndPrepare();
    }
  }

  /// Phase 3: Fast address sweep — only profile-specific addresses
  Future<void> _comprehensiveAddressSweep() async {
    _log('');
    _log('🔍 FAST ADDRESS SWEEP');

    final Set<String> addressesToProbe = {};

    if (_selectedProfile != null) {
      addressesToProbe.addAll(_selectedProfile!.moduleHeaders.values);
      _log('   📋 Profile addresses: ${addressesToProbe.join(", ")}');
    } else {
      for (final system in systems) {
        addressesToProbe.add(system.headerAddress);
      }
      _log('   📋 Standard addresses: ${addressesToProbe.join(", ")}');
    }

    addressesToProbe.removeAll(_discoveredEcus.keys);

    if (addressesToProbe.isEmpty) {
      _log('   ✅ All addresses already discovered');
      return;
    }

    _log('   🎯 Probing ${addressesToProbe.length} addresses...');
    int found = 0;

    for (final addr in addressesToProbe) {
      final responded = await _fastProbeAddress(addr);
      if (responded) found++;
      await Future.delayed(const Duration(milliseconds: 150));
    }

    _log('   ✅ Sweep complete: Found $found additional module(s)');
  }

  /// Fast single-method probe — DiagnosticSessionControl (1001)
  Future<bool> _fastProbeAddress(String txAddr) async {
    try {
      final rxInt = int.parse(txAddr, radix: 16) + 8;
      final rxAddr =
          rxInt.toRadixString(16).toUpperCase().padLeft(3, '0');

      await _send('ATSH$txAddr', timeoutMs: 500);
      await _send('ATAR', timeoutMs: 300);

      _commandsSent++;
      bool found = false;

      final response = await _send('1001', timeoutMs: 1000);
      final upper = _cleanResponse(response).toUpperCase();

      if (upper.contains('50 01') ||
          upper.contains('5001') ||
          RegExp(r'7[A-F0-9]{2}\s+\d+\s+50').hasMatch(upper)) {
        found = true;
        _log('   ✅ $txAddr: DiagSession OK');
      } else if ((upper.contains('7F 10') ||
              upper.contains('7F10') ||
              upper.contains('7F')) &&
          !upper.contains('NO DATA') &&
          !_isCanError(upper)) {
        found = true;
        _log('   ✅ $txAddr: DiagSession NRC (module exists)');
      } else if (upper.contains('NO DATA') || upper.isEmpty) {
        // Try TesterPresent as fallback
        await Future.delayed(const Duration(milliseconds: 50));
        final tpResp = await _send('3E00', timeoutMs: 1000);
        final tpUpper = _cleanResponse(tpResp).toUpperCase();

        if ((tpUpper.contains('7E') || tpUpper.contains('7F')) &&
            !tpUpper.contains('NO DATA') &&
            !_isCanError(tpUpper)) {
          found = true;
          _log('   ✅ $txAddr: TesterPresent responded');
        }
      }

      if (found) {
        _discoveredEcus[txAddr] = rxAddr;
        final ecuName = _identifyEcuByAddress(txAddr);
        _addDiscoveredEcu(txAddr, rxAddr, ecuName);
        _responsesReceived++;
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> _probeSpecificEcu(String txAddr, String name) async {
    try {
      final rxInt = int.parse(txAddr, radix: 16) + 8;
      final rxAddr = rxInt.toRadixString(16).toUpperCase();

      await _send('ATSH$txAddr', timeoutMs: 1000);
      await _send('ATCRA$rxAddr', timeoutMs: 1000);
      await Future.delayed(const Duration(milliseconds: 100));

      _commandsSent++;
      final response = await _send('0100', timeoutMs: 3000);

      if (response.contains('41') && !response.contains('NO DATA')) {
        _discoveredEcus[txAddr] = rxAddr;
        _addDiscoveredEcu(txAddr, rxAddr, name);
        _responsesReceived++;
        _log('   ✅ $name found at $txAddr');
        return true;
      } else {
        _log('   ℹ️ $name ($txAddr): No response');
        return false;
      }
    } catch (e) {
      _errorsEncountered++;
      _log('   ℹ️ $name ($txAddr): Timeout');
      return false;
    } finally {
      try {
        await _send('ATCRA', timeoutMs: 500);
      } catch (e) {
        // Ignore
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIN & BATTERY
  // ════════════════════════════════════════════════════════════════════════════

  Future<void> _readVin() async {
    try {
      _log('🔧 Reading VIN...');
      final response = await _send('0902', timeoutMs: 5000);
      _log('📥 VIN Raw Response: $response');

      if (response.contains('NO DATA') ||
          response.contains('ERROR') ||
          response.contains('UNABLE')) {
        _vin = 'Not Supported';
        return;
      }

      final vinBuffer = StringBuffer();
      final cleaned = response.toUpperCase();

      int vinMarker = cleaned.indexOf('49 02');
      if (vinMarker == -1) vinMarker = cleaned.indexOf('4902');

      if (vinMarker != -1) {
        final afterMarker = cleaned.substring(vinMarker);
        final hexPattern = RegExp(r'[0-9A-F]{2}');
        final hexBytes =
            hexPattern.allMatches(afterMarker).map((m) => m.group(0)!).toList();

        for (int i = 3; i < hexBytes.length && vinBuffer.length < 17; i++) {
          final hexByte = hexBytes[i];
          final byteVal = int.tryParse(hexByte, radix: 16);
          if (byteVal != null) {
            if ((byteVal >= 0x10 && byteVal <= 0x1F) ||
                (byteVal >= 0x20 && byteVal <= 0x2F)) {
              continue;
            }
            if (hexByte == '7E' ||
                hexByte == '7F' ||
                (byteVal >= 0xE0 && byteVal <= 0xEF)) {
              continue;
            }
          }

          try {
            final charCode = int.parse(hexByte, radix: 16);
            if ((charCode >= 48 && charCode <= 57) ||
                (charCode >= 65 && charCode <= 90)) {
              vinBuffer.write(String.fromCharCode(charCode));
            }
          } catch (e) {
            // Skip invalid hex
          }
        }
      }

      final decodedVin = vinBuffer.toString();
      _log('📥 Decoded VIN: $decodedVin (${decodedVin.length} chars)');

      if (decodedVin.length >= 17) {
        _vin = decodedVin.substring(decodedVin.length - 17);
      } else if (decodedVin.length >= 5) {
        _vin = decodedVin;
      } else {
        _vin = 'Unknown';
      }
    } catch (e) {
      _log('❌ VIN Read Error: $e');
      _vin = 'Read Failed';
    }
    notifyListeners();
  }

  Future<void> _readBatteryVoltage() async {
    try {
      final response = await _send('AT RV', timeoutMs: 1000);
      if (response.contains('V')) {
        _batteryVoltage = response.replaceAll('>', '').trim();
      } else {
        _batteryVoltage = 'Unknown';
      }
    } catch (e) {
      _batteryVoltage = 'Err';
    }
    notifyListeners();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SYSTEM SCANNING — Smart header selection + multi-method probing
  // ════════════════════════════════════════════════════════════════════════════

  Future<void> _scanSystem(VehicleSystem system) async {
    final List<String> headersToTry = [];

    // Priority 1: Discovered address that matches this system
    final matchedAddr = _findDiscoveredAddressForSystem(system);
    if (matchedAddr != null) {
      _log('🎯 [${system.name}] Found via discovery at $matchedAddr');
      headersToTry.add(matchedAddr);
    }

    // Standard OBD-II address check
    final standardAddr = _getStandardOBDAddress(system.id);
    if (standardAddr != null && _discoveredEcus.containsKey(standardAddr)) {
      if (!headersToTry.contains(standardAddr)) {
        headersToTry.add(standardAddr);
      }
    }

    // Priority 2: Profile-specific header
    if (_selectedProfile != null) {
      final profileHeader =
          _selectedProfile!.moduleHeaders[system.id];
      if (profileHeader != null && !headersToTry.contains(profileHeader)) {
        headersToTry.add(profileHeader);
      }
    }

    // Priority 3: Default and alternative headers
    if (!headersToTry.contains(system.headerAddress)) {
      headersToTry.add(system.headerAddress);
    }
    for (final alt in system.alternativeHeaders) {
      if (!headersToTry.contains(alt)) {
        headersToTry.add(alt);
      }
    }

    _log('🔍 [${system.name}] Headers to try: $headersToTry');

    for (final header in headersToTry) {
      _currentProbeAddress = header;
      notifyListeners();
      final success = await _tryScanWithHeader(system, header);
      if (success) return;
    }

    _log('❌ [${system.name}] No response from any header — Not Equipped');
    system.status = SystemStatus.notEquipped;
  }

  String? _findDiscoveredAddressForSystem(VehicleSystem system) {
    final expectedAddresses = {
      system.headerAddress,
      ...system.alternativeHeaders,
    };

    for (final discoveredAddr in _discoveredEcus.keys) {
      if (expectedAddresses.contains(discoveredAddr)) {
        return discoveredAddr;
      }
    }

    for (final entry in _discoveredEcus.entries) {
      final ecuName = _identifyEcuByAddress(entry.key).toUpperCase();
      final systemId = system.id.toUpperCase();

      if (ecuName.contains(systemId) ||
          (systemId == 'SRS' && ecuName.contains('AIRBAG')) ||
          (systemId == 'SRS' && ecuName.contains('SAFETY')) ||
          (systemId == 'BCM' && ecuName.contains('BODY')) ||
          (systemId == 'IPC' && ecuName.contains('CLUSTER')) ||
          (systemId == 'EPS' && ecuName.contains('STEERING'))) {
        return entry.key;
      }
    }

    return null;
  }

  String? _getStandardOBDAddress(String systemId) {
    switch (systemId.toUpperCase()) {
      case 'ECM':
        return '7E0';
      case 'TCM':
        return '7E1';
      default:
        return null;
    }
  }

  bool _isStandardObdModule(String header, String systemId) {
    if (header == '7E0' || header == '7DF') return true;

    if (_selectedProfile != null) {
      final profileName = _selectedProfile!.model.toLowerCase();
      if (profileName.contains('dnga') ||
          profileName.contains('myvi') ||
          profileName.contains('ativa') ||
          profileName.contains('alza') ||
          profileName.contains('geely') ||
          profileName.contains('x50') ||
          profileName.contains('x70')) {
        return header == '7E0';
      }
    }

    return header == '7E0' || header == '7E1';
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TRY SCAN WITH HEADER — The core scanning logic per module
  // ════════════════════════════════════════════════════════════════════════════

  Future<bool> _tryScanWithHeader(VehicleSystem system, String header) async {
    try {
      final txAddr = int.parse(header, radix: 16);
      final rxAddr = txAddr + 8;
      final rxHeader = rxAddr.toRadixString(16).toUpperCase();

      final isObdModule = _isStandardObdModule(header, system.id);

      _commandsSent++;
      _log('════════════════════════════════════════');
      _log('🎯 [${system.name}] Header: $header → Response: $rxHeader');
      _log('   Type: ${isObdModule ? "OBD-II" : "UDS"}');

      // CRITICAL: Flush and prepare clean state before every module scan
      await _flushAndPrepare();

      // 1. Set Transmit Header
      bool headerSet = false;
      for (int retry = 0; retry < 2 && !headerSet; retry++) {
        try {
          final shResp = await _send('ATSH$header', timeoutMs: 1500);
          final cleanResp = _cleanResponse(shResp);
          _log('   ATSH$header → "$cleanResp"');
          if (cleanResp.toUpperCase().contains('OK')) {
            headerSet = true;
          }
        } catch (e) {
          _log('   ⚠️ ATSH attempt ${retry + 1} timeout');
        }
        await Future.delayed(const Duration(milliseconds: 150));
      }

      if (!headerSet) {
        _log('   ❌ Failed to set header $header');
        return false;
      }

      // 2. Set Receive Address Filter
      try {
        final arResp = await _send('ATAR', timeoutMs: 1000);
        _log('   ATAR → "${_cleanResponse(arResp)}"');
        await Future.delayed(const Duration(milliseconds: 150));

        if (isObdModule) {
          final craResp =
              await _send('ATCRA$rxHeader', timeoutMs: 1000);
          _log('   ATCRA$rxHeader → "${_cleanResponse(craResp)}"');
        } else {
          _log('   Filter: Open (accepting all responses)');
        }
      } catch (e) {
        _log('   ⚠️ Filter setup: $e');
        try {
          await _send('ATCRA', timeoutMs: 500);
        } catch (e2) {
          // Ignore
        }
      }
      await Future.delayed(const Duration(milliseconds: 150));

      String response = '';
      bool moduleExists = false;
      String primaryCommand = '';

      // 3. Ping strategy based on module type
      if (isObdModule) {
        _log('🏓 [$header] OBD-II Ping (0100)...');
        try {
          final pingResp = await _send('0100', timeoutMs: 4000);
          _log('   Ping → "$pingResp"');
          if (pingResp.toUpperCase().contains('41') &&
              !pingResp.toUpperCase().contains('NO DATA')) {
            moduleExists = true;
            _log('   ✅ OBD-II module responded!');
          }
        } catch (e) {
          _log('   ⚠️ Ping timeout');
        }
        primaryCommand = '03';
      } else {
        // UDS modules: multi-method probing
        bool needsCanRecovery = false;

        // Step 1: TesterPresent (3E00)
        _log('🏓 [$header] UDS Tester Present (3E 00)...');
        await Future.delayed(const Duration(milliseconds: 100));

        try {
          final tpResp = await _send('3E00', timeoutMs: 3000);
          final cleanTp = _cleanResponse(tpResp);
          _log('   TesterPresent → "$cleanTp"');
          final upper = cleanTp.toUpperCase();

          if (_isCanError(cleanTp)) {
            needsCanRecovery = true;
            _log('   ⚠️ CAN ERROR on TesterPresent');
          } else if (upper.contains('7E 00') ||
              upper.contains('7E00') ||
              RegExp(r'7[A-F0-9]{2}\s+\d+\s+7E\s*00').hasMatch(upper)) {
            moduleExists = true;
            _log('   ✅ UDS module responded to TesterPresent!');
          } else if (upper.contains('7F 3E') || upper.contains('7F3E')) {
            moduleExists = true;
            _log('   ✅ Module exists (rejected TesterPresent with NRC)');
          } else if (upper.contains('7F') && !upper.contains('NO DATA')) {
            moduleExists = true;
            _log('   ✅ Module responded with NRC');
          }
        } catch (e) {
          _log('   ⚠️ TesterPresent timeout');
        }

        await Future.delayed(const Duration(milliseconds: 150));

        if (needsCanRecovery) {
          final recovered = await _recoverFromCanError();
          if (!recovered) {
            _log('   ❌ CAN bus recovery failed, skipping header $header');
            return false;
          }
          try {
            await _send('ATSH$header', timeoutMs: 1000);
            await _send('ATAR', timeoutMs: 500);
          } catch (e) {
            // Ignore
          }
          needsCanRecovery = false;
        }

        // Step 2: Default Session (10 01)
        if (!moduleExists) {
          _log('🏓 [$header] UDS Default Session (10 01)...');
          try {
            final dsResp = await _send('1001', timeoutMs: 3000);
            final cleanDs = _cleanResponse(dsResp);
            _log('   DefSession → "$cleanDs"');
            final upper = cleanDs.toUpperCase();

            if (_isCanError(cleanDs)) {
              needsCanRecovery = true;
            } else if (upper.contains('50 01') ||
                upper.contains('5001') ||
                RegExp(r'7[A-F0-9]{2}\s+\d+\s+50\s*01').hasMatch(upper)) {
              moduleExists = true;
              _log('   ✅ Default diagnostic session started!');
            } else if (upper.contains('7F 10') || upper.contains('7F10')) {
              moduleExists = true;
              _log('   ✅ Module exists (session rejected)');
            } else if (upper.contains('7F') && !upper.contains('NO DATA')) {
              moduleExists = true;
              _log('   ✅ Module responded with NRC');
            }
          } catch (e) {
            _log('   ⚠️ DefSession timeout');
          }
          await Future.delayed(const Duration(milliseconds: 150));
        }

        if (needsCanRecovery) {
          await _recoverFromCanError();
          return false;
        }

        // Step 3: OBD-II Mode 03
        if (!moduleExists) {
          _log('🏓 [$header] Trying OBD-II Mode 03...');
          try {
            final mode03Resp = await _send('03', timeoutMs: 3000);
            final cleanM03 = _cleanResponse(mode03Resp);
            _log('   Mode03 → "$cleanM03"');
            final upper = cleanM03.toUpperCase();

            if (_isCanError(cleanM03)) {
              await _recoverFromCanError();
              return false;
            }

            if ((upper.contains('43') ||
                    RegExp(r'7[A-F0-9]{2}\s+\d+\s+43').hasMatch(upper)) &&
                !upper.contains('NO DATA')) {
              moduleExists = true;
              response = mode03Resp;
              _log('   ✅ Module supports OBD-II Mode 03!');
              primaryCommand = '03_DONE';
            }
          } catch (e) {
            _log('   ⚠️ Mode03 timeout');
          }
          await Future.delayed(const Duration(milliseconds: 150));
        }

        // Step 4: Extended Session (10 03)
        if (!moduleExists) {
          _log('🏓 [$header] UDS Extended Session (10 03)...');
          try {
            final dsResp = await _send('1003', timeoutMs: 3000);
            final cleanDs = _cleanResponse(dsResp);
            _log('   ExtSession → "$cleanDs"');
            final upper = cleanDs.toUpperCase();

            if (upper.contains('50 03') ||
                upper.contains('5003') ||
                RegExp(r'7[A-F0-9]{2}\s+\d+\s+50\s*03').hasMatch(upper)) {
              moduleExists = true;
              _log('   ✅ Extended diagnostic session started!');
            } else if (upper.contains('7F') && !upper.contains('NO DATA')) {
              moduleExists = true;
              _log('   ✅ Module exists (extended session rejected)');
            }
          } catch (e) {
            _log('   ⚠️ ExtSession timeout');
          }
        }

        primaryCommand =
            moduleExists && primaryCommand != '03_DONE' ? '1902FF' : primaryCommand;
      }

      // 4. Query DTCs
      bool gotValidResponse = primaryCommand == '03_DONE';

      if (isObdModule) {
        for (int attempt = 1; attempt <= 2 && !gotValidResponse; attempt++) {
          try {
            response = await _send(primaryCommand, timeoutMs: 6000);
            _log('📡 [$header] Mode 03 #$attempt → "$response"');

            final upper = response.toUpperCase();
            if (!upper.contains('NO DATA') &&
                !upper.contains('ERROR') &&
                !upper.contains('?') &&
                response.trim().isNotEmpty) {
              gotValidResponse = true;
              _log('   ✅ Got response');
            } else {
              _log('   ❌ Negative response');
              if (attempt < 2) {
                await Future.delayed(const Duration(milliseconds: 500));
              }
            }
          } catch (e) {
            _log('⚠️ Mode 03 timeout');
          }
        }
      } else {
        // UDS Service 19
        final udsCommands = ['1902FF', '190209', '190201', '1901FF', '190A'];

        for (final cmd in udsCommands) {
          if (gotValidResponse) break;

          try {
            response = await _send(cmd, timeoutMs: 4000);
            _log('📡 [$header] UDS $cmd → "$response"');

            final upper = response.toUpperCase();
            if (upper.contains('59')) {
              gotValidResponse = true;
              _log('   ✅ Got UDS DTC response');
              break;
            } else if (upper.contains('7F19')) {
              if (upper.contains('7F1911') || upper.contains('7F 19 11')) {
                _log('   ⚠️ Service 19 not supported');
                break;
              } else if (upper.contains('7F1912') ||
                  upper.contains('7F 19 12')) {
                _log('   ⚠️ Subfunction $cmd not supported, trying next...');
                continue;
              }
            } else if (upper.contains('NO DATA')) {
              _log('   ❌ No response');
            }
          } catch (e) {
            _log('   ⚠️ UDS $cmd timeout');
          }
        }

        // Fallback: OBD-II Mode 03 on UDS module
        if (!gotValidResponse && moduleExists) {
          _log('📡 [$header] Fallback: OBD-II Mode 03...');
          try {
            response = await _send('03', timeoutMs: 4000);
            _log('   Mode 03 → "$response"');
            if (response.toUpperCase().contains('43')) {
              gotValidResponse = true;
              _log('   ✅ OBD-II Mode 03 worked on UDS module!');
            }
          } catch (e) {
            _log('   ⚠️ Mode 03 fallback timeout');
          }
        }

        if (!gotValidResponse && moduleExists) {
          gotValidResponse = true;
          response = 'NO_DTCS';
          _log('   ℹ️ Module exists but DTC reading not supported');
        }
      }

      // 5. Reset receive filter
      try {
        await _send('ATCRA', timeoutMs: 1000);
      } catch (e) {
        // Ignore
      }

      // 6. Analyze Response
      _log('🔍 [$header] Analyzing...');

      if (moduleExists &&
          (response == 'NO_DTCS' || !gotValidResponse)) {
        _log('✅ [$header] MODULE FOUND (no DTC support)');
        system.status = SystemStatus.ok;
        system.faultCount = 0;
        _log('✅ [${system.name}] OK — Module exists, DTCs not supported');
        _log('════════════════════════════════════════');
        return true;
      }

      if (!gotValidResponse || response.trim().isEmpty) {
        _log('❌ [$header] No valid response');
        return false;
      }

      final cleanResponse = response
          .replaceAll(' ', '')
          .replaceAll('\r', '')
          .replaceAll('\n', '')
          .toUpperCase();
      _log('   Clean: "$cleanResponse"');

      final hasMode03Response = cleanResponse.contains('43');
      final hasMode19Response = cleanResponse.contains('59');
      final hasTesterPresentResponse =
          RegExp(r'7E\s?00').hasMatch(cleanResponse);
      final hasCANHeader = RegExp(r'^7[0-9A-F]{2}').hasMatch(cleanResponse);

      _log('   Mode03(43): $hasMode03Response | UDS(59): $hasMode19Response | TP: $hasTesterPresentResponse | CAN: $hasCANHeader | Exists: $moduleExists');

      if (hasMode03Response ||
          hasMode19Response ||
          hasTesterPresentResponse ||
          hasCANHeader ||
          moduleExists) {
        _log('✅ [$header] MODULE FOUND!');
        _responsesReceived++;

        List<String> codes = [];
        if (hasMode03Response) {
          codes = _extractCodes(response, '03', system.id);
          _log('   OBD-II Codes: $codes');
        } else if (hasMode19Response) {
          codes = _extractCodes(response, '1902FF', system.id);
          _log('   UDS Codes: $codes');
        } else {
          _log('   Module exists — marking OK (no DTC data)');
        }

        if (codes.isEmpty || (codes.length == 1 && codes[0] == 'P0000')) {
          system.status = SystemStatus.ok;
          system.faultCount = 0;
          _log('✅ [${system.name}] OK — No faults');
        } else {
          system.status = SystemStatus.fault;
          system.faultCount = codes.length;
          system.faultCodes = codes;
          system.faultDetails =
              codes.map((c) => _faultDb.getDetails(c)).toList();
          _log('🚨 [${system.name}] ${codes.length} FAULT(s): $codes');
        }

        // Query Pending DTCs (Mode 07) for OBD-II modules
        if (isObdModule) {
          await _queryPendingDtcs(system, header);
        }

        _log('════════════════════════════════════════');
        return true;
      }

      _log('❌ [$header] No positive response pattern');
      _log('════════════════════════════════════════');
      return false;
    } catch (e) {
      _log('❌ [${system.name}] Exception: $e');
      return false;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PENDING DTCs
  // ════════════════════════════════════════════════════════════════════════════

  Future<void> _queryPendingDtcs(VehicleSystem system, String header) async {
    try {
      final response = await _send('07', timeoutMs: 3000);
      if (response.contains('47')) {
        List<String> pendingCodes =
            _extractCodes(response, '07', system.id);
        pendingCodes = pendingCodes
            .where((c) => c != 'P0000' && !system.faultCodes.contains(c))
            .toList();

        if (pendingCodes.isNotEmpty) {
          system.pendingFaultCount = pendingCodes.length;
          system.pendingFaultCodes = pendingCodes;
          system.pendingFaultDetails =
              pendingCodes.map((c) => _faultDb.getDetails(c)).toList();
          _log('⚠️ Pending DTCs for ${system.name}: $pendingCodes');
        }
      }
    } catch (e) {
      _log('ℹ️ Mode 07 not available for ${system.name}');
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FLUSH & PREPARE — Ensures clean ELM327 state between modules
  // ════════════════════════════════════════════════════════════════════════════

  Future<void> _flushAndPrepare() async {
    // Step 1: Abort any in-progress command
    try {
      await _send('\r', timeoutMs: 300);
    } catch (e) {
      // Ignore
    }

    // Step 2: Reset CAN receive filters
    try {
      await _send('ATAR', timeoutMs: 1000);
    } catch (e) {
      try {
        await _send('ATCRA', timeoutMs: 800);
      } catch (e2) {
        // Ignore
      }
    }
    await Future.delayed(const Duration(milliseconds: 150));

    // Step 3: Reset to broadcast header
    try {
      await _send('ATSH7DF', timeoutMs: 800);
    } catch (e) {
      // Ignore
    }
    await Future.delayed(const Duration(milliseconds: 100));

    // Step 4: Flush with safe command
    try {
      await _send('ATRV', timeoutMs: 1000);
    } catch (e) {
      // Ignore
    }
    await Future.delayed(const Duration(milliseconds: 100));

    // Step 5: Re-enforce critical settings
    try {
      await _send('ATE0', timeoutMs: 500);
      await _send('ATH1', timeoutMs: 500);
      await _send('ATCAF1', timeoutMs: 500);
    } catch (e) {
      // Ignore
    }
    await Future.delayed(const Duration(milliseconds: 100));
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CAN ERROR RECOVERY
  // ════════════════════════════════════════════════════════════════════════════

  Future<bool> _recoverFromCanError() async {
    _log('   🔧 CAN ERROR detected — attempting recovery...');

    try {
      try {
        await _send('ATPC', timeoutMs: 1000);
      } catch (e) {
        // Ignore
      }
      await Future.delayed(const Duration(milliseconds: 300));

      try {
        await _send('ATWS', timeoutMs: 2000);
      } catch (e) {
        // Ignore
      }
      await Future.delayed(const Duration(milliseconds: 500));

      try {
        await _send('ATE0', timeoutMs: 500);
        await _send('ATH1', timeoutMs: 500);
        await _send('ATCAF1', timeoutMs: 500);
        await _send('ATAR', timeoutMs: 500);
      } catch (e) {
        // Ignore
      }
      await Future.delayed(const Duration(milliseconds: 200));

      try {
        await _send('ATSP6', timeoutMs: 1500);
      } catch (e) {
        // Ignore
      }
      await Future.delayed(const Duration(milliseconds: 300));

      try {
        final test = await _send('ATRV', timeoutMs: 1000);
        if (test.contains('V') || test.contains('v')) {
          _log('   ✅ CAN ERROR recovery successful');
          return true;
        }
      } catch (e) {
        // Ignore
      }

      _log('   ⚠️ CAN ERROR recovery may have failed');
      return false;
    } catch (e) {
      _log('   ❌ CAN ERROR recovery failed: $e');
      return false;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════════════════════════════════

  String _cleanResponse(String response) {
    String clean = response;
    final echoPatterns = [
      RegExp(r'AT[A-Z0-9]+[\r\n]+', caseSensitive: false),
      RegExp(r'^[A-Z0-9]{3,4}[\r\n]+', multiLine: true),
    ];
    for (final pattern in echoPatterns) {
      clean = clean.replaceAll(pattern, '');
    }
    return clean.trim();
  }

  bool _isCanError(String response) {
    final upper = response.toUpperCase();
    return upper.contains('CAN ERROR') ||
        upper.contains('BUS ERROR') ||
        upper.contains('BUFFER FULL') ||
        upper.contains('BUS BUSY') ||
        upper.contains('STOPPED');
  }

  String _identifyEcu(String txAddr) {
    switch (txAddr.toUpperCase()) {
      case '7E0':
        return 'ECM (Engine)';
      case '7E1':
        return 'TCM (Transmission)';
      case '7E2':
        return 'TCM2/Hybrid';
      case '7E3':
        return 'ABS/ESC';
      case '7E4':
        return 'BCM (Body)';
      case '7E5':
        return 'SRS (Airbag)';
      case '7E6':
        return 'IPC (Cluster)';
      case '7E7':
        return 'AC/Climate';
      default:
        return 'ECU-$txAddr';
    }
  }

  String _identifyEcuByAddress(String txAddr) {
    switch (txAddr.toUpperCase()) {
      case '7E0':
        return 'ECM (Engine)';
      case '7E1':
        return 'TCM (Transmission)';
      case '7E2':
        return 'TCM2/Hybrid';
      case '7E3':
        return 'ABS/ESC';
      case '7E4':
        return 'BCM (Body)';
      case '7E5':
        return 'SRS (Airbag)';
      case '7E6':
        return 'IPC (Cluster)';
      case '7E7':
        return 'AC/Climate';
      case '7B0':
        return 'ABS (Perodua/Toyota)';
      case '780':
        return 'SRS (Airbag)';
      case '7C0':
        return 'BCM/IPC';
      case '7C4':
        return 'IPC (Honda)';
      case '790':
        return 'EPS (Steering)';
      case '7D0':
        return 'EPS (Perodua)';
      case '7A0':
        return 'ABS (Proton/Geely)';
      case '7A1':
        return 'EPS (Proton)';
      case '7A2':
        return 'SRS (Proton)';
      case '740':
        return 'BCM (Geely)';
      case '760':
        return 'BCM (Proton VVT)';
      case '730':
        return 'EPS (Proton VVT)';
      case '750':
        return 'BCM/Gateway';
      case '746':
        return 'Gateway';
      default:
        final addr = int.tryParse(txAddr, radix: 16) ?? 0;
        if (addr >= 0x7E0 && addr <= 0x7E7) return 'OBD Module';
        if (addr >= 0x7B0 && addr <= 0x7BF) return 'Chassis Module';
        if (addr >= 0x780 && addr <= 0x78F) return 'Safety Module';
        if (addr >= 0x7C0 && addr <= 0x7CF) return 'Body Module';
        if (addr >= 0x790 && addr <= 0x79F) return 'Steering Module';
        if (addr >= 0x7A0 && addr <= 0x7AF) return 'Proton Module';
        if (addr >= 0x740 && addr <= 0x74F) return 'Geely Module';
        return 'ECU-$txAddr';
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DTC EXTRACTION
  // ════════════════════════════════════════════════════════════════════════════

  String _getExpectedDtcType(String moduleId) {
    switch (moduleId) {
      case 'ECM':
      case 'TCM':
        return 'P';
      case 'ABS':
      case 'EPS':
        return 'C';
      case 'SRS':
      case 'BCM':
      case 'IPC':
        return 'B';
      default:
        return '';
    }
  }

  List<String> _extractCodes(String response, String command,
      [String moduleId = '']) {
    final codes = <String>[];
    final expectedType = _getExpectedDtcType(moduleId);

    final clean = response
        .replaceAll(' ', '')
        .replaceAll('\r', '')
        .replaceAll('\n', '')
        .toUpperCase();

    _log('🔍 Raw response for $command: $response');
    _log('🔍 Cleaned: $clean');

    // MODE 03: Standard OBD-II
    if (command == '03') {
      final idx43 = clean.indexOf('43');
      if (idx43 == -1) return codes;
      if (clean.length <= idx43 + 4) return codes;

      final dtcCountHex = clean.substring(idx43 + 2, idx43 + 4);
      final dtcCount = int.tryParse(dtcCountHex, radix: 16) ?? 0;

      _log('🔍 Mode 03: DTC count byte = $dtcCountHex ($dtcCount codes)');
      if (dtcCount == 0) return codes;

      String dtcData = clean.substring(idx43 + 4);
      dtcData = _reconstructMultiFrame(dtcData, clean);

      for (int i = 0; i < dtcData.length && codes.length < dtcCount; i += 4) {
        if (i + 4 <= dtcData.length) {
          final dtcHex = dtcData.substring(i, i + 4);
          if (dtcHex != '0000' && dtcHex != 'FFFF') {
            final code = _decodeDtcBytes(dtcHex, expectedType);
            if (code.isNotEmpty && !code.endsWith('000')) {
              codes.add(code);
              _log('✅ Decoded DTC: $dtcHex → $code');
            }
          }
        }
      }
      return codes;
    }

    // MODE 07: Pending DTCs
    if (command == '07') {
      final idx47 = clean.indexOf('47');
      if (idx47 == -1) return codes;
      if (clean.length <= idx47 + 4) return codes;

      final dtcCountHex = clean.substring(idx47 + 2, idx47 + 4);
      final dtcCount = int.tryParse(dtcCountHex, radix: 16) ?? 0;
      if (dtcCount == 0) return codes;

      String dtcData = clean.substring(idx47 + 4);
      dtcData = _reconstructMultiFrame(dtcData, clean);

      for (int i = 0; i < dtcData.length && codes.length < dtcCount; i += 4) {
        if (i + 4 <= dtcData.length) {
          final dtcHex = dtcData.substring(i, i + 4);
          if (dtcHex != '0000' && dtcHex != 'FFFF') {
            final code = _decodeDtcBytes(dtcHex, expectedType);
            if (code.isNotEmpty && !code.endsWith('000')) {
              codes.add(code);
            }
          }
        }
      }
      return codes;
    }

    // MODE 19 (UDS)
    if (command.startsWith('19')) {
      int idx59 = clean.indexOf('5902');
      if (idx59 == -1) {
        idx59 = clean.indexOf('59');
        if (idx59 == -1) return codes;
        idx59 += 2;
      } else {
        idx59 += 4;
      }

      if (clean.length <= idx59 + 2) return codes;
      idx59 += 2; // Skip status mask

      String dtcData = clean.substring(idx59);
      dtcData = _reconstructMultiFrame(dtcData, clean);

      _log('🔍 Mode 19: DTC hex data = $dtcData');

      // Try 3-byte DTC format (8 chars per entry)
      bool parsed = false;
      if (dtcData.length >= 8) {
        for (int i = 0; i + 8 <= dtcData.length; i += 8) {
          final dtc3Byte = dtcData.substring(i, i + 6);
          if (dtc3Byte != '000000' && dtc3Byte != 'FFFFFF') {
            final code = _decodeUdsDtc(dtc3Byte, expectedType);
            if (code.isNotEmpty) {
              codes.add(code);
              parsed = true;
              _log('✅ UDS 3-byte DTC: $dtc3Byte → $code');
            }
          }
        }
      }

      // Fallback: 2-byte DTCs (6 chars per entry)
      if (!parsed && dtcData.length >= 6) {
        for (int i = 0; i + 6 <= dtcData.length; i += 6) {
          final dtc2Byte = dtcData.substring(i, i + 4);
          if (dtc2Byte != '0000' && dtc2Byte != 'FFFF') {
            final code = _decodeDtcBytes(dtc2Byte, expectedType);
            if (code.isNotEmpty && !code.endsWith('000')) {
              codes.add(code);
              _log('✅ UDS 2-byte DTC: $dtc2Byte → $code');
            }
          }
        }
      }

      return codes;
    }

    return codes;
  }

  String _reconstructMultiFrame(String data, String fullResponse) {
    if (!fullResponse.contains('10 ') &&
        !fullResponse.contains('21 ') &&
        !fullResponse.contains('22 ')) {
      return data;
    }

    _log('🔧 Multi-frame detected, reconstructing...');

    try {
      final lines = fullResponse.split(RegExp(r'[\r\n]+'));
      final Map<int, String> frameData = {};
      int totalLength = 0;
      bool hasFirstFrame = false;

      for (final line in lines) {
        final clean = line.replaceAll(' ', '').toUpperCase();
        if (clean.length < 8) continue;
        if (clean.contains('NODATA') || clean.contains('ERROR')) continue;

        final framePattern = RegExp(r'7[0-9A-F]{2}([0-9A-F]{2})([0-9A-F]+)');
        final match = framePattern.firstMatch(clean);

        if (match != null) {
          final pciByte = match.group(1)!;
          final framePayload = match.group(2)!;
          final pci = int.parse(pciByte, radix: 16);
          final frameType = pci & 0xF0;

          if (frameType == 0x10) {
            hasFirstFrame = true;
            final lenHigh = pci & 0x0F;
            if (framePayload.length >= 2) {
              final lenLow =
                  int.parse(framePayload.substring(0, 2), radix: 16);
              totalLength = (lenHigh << 8) | lenLow;
              frameData[0] = framePayload.substring(2);
            }
          } else if (frameType == 0x20) {
            final seqNum = pci & 0x0F;
            frameData[seqNum] = framePayload;
          }
        }
      }

      if (hasFirstFrame && frameData.isNotEmpty) {
        final result = StringBuffer();
        if (frameData.containsKey(0)) {
          result.write(frameData[0]);
        }
        for (int i = 1; i <= 15 && frameData.containsKey(i); i++) {
          result.write(frameData[i]);
        }

        String reconstructed = result.toString();
        if (totalLength > 0 && reconstructed.length > totalLength * 2) {
          reconstructed = reconstructed.substring(0, totalLength * 2);
        }

        _log('🔧 Reconstructed ${reconstructed.length ~/ 2} bytes');
        return reconstructed;
      }
    } catch (e) {
      _log('⚠️ Multi-frame reconstruction error: $e');
    }

    // Fallback: simple marker removal
    final result = StringBuffer();
    final working = data;
    final headerPattern = RegExp(r'7[0-9A-F]{2}');

    for (int i = 0; i < working.length;) {
      if (i + 5 <= working.length) {
        final chunk = working.substring(i, i + 5);
        if (headerPattern.hasMatch(chunk.substring(0, 3))) {
          final possibleFrameMarker = chunk.substring(3, 5);
          final marker = int.tryParse(possibleFrameMarker, radix: 16);
          if (marker != null && marker >= 0x20 && marker <= 0x2F) {
            i += 5;
            continue;
          }
          if (possibleFrameMarker == '10' && i + 7 <= working.length) {
            i += 7;
            continue;
          }
        }
      }

      if (i + 2 <= working.length) {
        result.write(working.substring(i, i + 2));
        i += 2;
      } else {
        break;
      }
    }

    final reconstructed = result.toString();
    return reconstructed.isNotEmpty ? reconstructed : data;
  }

  String _decodeUdsDtc(String dtc3Byte, [String expectedType = '']) {
    if (dtc3Byte.length != 6) return '';

    try {
      final high = int.parse(dtc3Byte.substring(0, 2), radix: 16);

      final typeBits = (high >> 6) & 0x03;
      String type;
      switch (typeBits) {
        case 0:
          type = 'P';
          break;
        case 1:
          type = 'C';
          break;
        case 2:
          type = 'B';
          break;
        case 3:
          type = 'U';
          break;
        default:
          type = 'P';
      }

      final subtype = (high >> 4) & 0x03;
      final firstDigit = high & 0x0F;

      final mid = int.parse(dtc3Byte.substring(2, 4), radix: 16);
      final low = int.parse(dtc3Byte.substring(4, 6), radix: 16);

      String code =
          '$type$subtype${firstDigit.toRadixString(16).toUpperCase()}${mid.toRadixString(16).toUpperCase().padLeft(2, '0')}${low.toRadixString(16).toUpperCase().padLeft(2, '0')}';

      if (code.length > 5) {
        code = code.substring(0, 5);
      }

      if (expectedType.isNotEmpty && type != expectedType) {
        final altCode = expectedType + code.substring(1);
        if (_isValidCode(altCode)) {
          _log('🔄 Type override: $code → $altCode (expected $expectedType)');
          return altCode;
        }
        if (!_isValidCode(code)) {
          return altCode;
        }
      }

      return code;
    } catch (e) {
      return '';
    }
  }

  String _decodeDtcBytes(String dtcHex, [String expectedType = '']) {
    try {
      final standardDtc = _standardDecode(dtcHex);
      if (_isValidCode(standardDtc)) return standardDtc;

      if (expectedType.isNotEmpty && !standardDtc.startsWith(expectedType)) {
        final altCode = expectedType + standardDtc.substring(1);
        if (_isValidCode(altCode)) {
          _log('🔄 Type override: $standardDtc → $altCode');
          return altCode;
        }
      }

      // Fallback strategies
      if (dtcHex.startsWith('5')) {
        final p1Code = 'P1${dtcHex.substring(1)}';
        if (_isValidCode(p1Code)) return p1Code;
      }

      if (dtcHex.startsWith('4')) {
        final c0Code = 'C0${dtcHex.substring(1)}';
        if (_isValidCode(c0Code)) return c0Code;
      }

      if (dtcHex.length == 4) {
        final trimmed = dtcHex.substring(1);
        for (final prefix in ['P', 'C', 'B', 'U']) {
          final potential = '$prefix$trimmed';
          if (_isValidCode(potential)) return potential;
        }
      }

      return standardDtc;
    } catch (e) {
      return '';
    }
  }

  String _standardDecode(String dtcHex) {
    try {
      final val = int.parse(dtcHex, radix: 16);
      final byteA = (val >> 8) & 0xFF;
      final byteB = val & 0xFF;

      String type;
      final typeBits = (byteA >> 6) & 0x03;
      switch (typeBits) {
        case 0:
          type = 'P';
          break;
        case 1:
          type = 'C';
          break;
        case 2:
          type = 'B';
          break;
        case 3:
          type = 'U';
          break;
        default:
          type = 'P';
      }

      final digit2 = (byteA >> 4) & 0x03;
      final digit345 = ((byteA & 0x0F) << 8) | byteB;
      final hex345 =
          digit345.toRadixString(16).toUpperCase().padLeft(3, '0');

      return '$type$digit2$hex345';
    } catch (e) {
      return '';
    }
  }

  bool _isValidCode(String code) {
    return _faultDb.getDetails(code).category != 'unknown';
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CLEAR ALL CODES
  // ════════════════════════════════════════════════════════════════════════════

  Future<bool> clearAllCodes() async {
    if (_isScanning) return false;

    _isScanning = true;
    _updateStatus('Clearing DTCs...', 0.0);
    notifyListeners();

    bool success = true;
    int cleared = 0;
    final total = systems.where((s) => s.status == SystemStatus.fault).length;

    try {
      for (final system in systems) {
        if (system.status != SystemStatus.fault) continue;

        final progress = total > 0 ? (cleared / total) * 1.0 : 0.0;
        _updateStatus('Clearing ${system.name}...', progress);

        String header = system.headerAddress;
        if (_selectedProfile != null &&
            _selectedProfile!.moduleHeaders.containsKey(system.id)) {
          header = _selectedProfile!.moduleHeaders[system.id]!;
        }

        final clearSuccess = await _clearSystemCodes(system, header);

        if (clearSuccess) {
          system.status = SystemStatus.ok;
          system.faultCount = 0;
          system.faultCodes = [];
          system.faultDetails = [];
          cleared++;
        } else {
          success = false;
        }

        notifyListeners();
        await Future.delayed(const Duration(milliseconds: 300));
      }

      _updateStatus(
        success ? 'Codes Cleared Successfully' : 'Some Codes Failed to Clear',
        1.0,
      );
    } catch (e) {
      _updateStatus('Clear Error: $e', 0.0);
      success = false;
    } finally {
      _isScanning = false;
      notifyListeners();
    }

    return success;
  }

  Future<bool> _clearSystemCodes(VehicleSystem system, String header) async {
    try {
      await _send('ATSH$header');

      String clearCommand;
      String expectedResponse;

      if (header == '7E0' || header == '7E1') {
        clearCommand = '04';
        expectedResponse = '44';
      } else {
        clearCommand = '14FFFFFF';
        expectedResponse = '54';
      }

      final response =
          await _send(clearCommand, timeoutMs: 3000);

      if (response.contains(expectedResponse) || response.contains('OK')) {
        _log('✅ Cleared DTCs for ${system.name} (Header: $header)');
        return true;
      } else if (response.contains('NO DATA') || response.contains('ERROR')) {
        _log('⚠️ Clear response for ${system.name}: $response');
        return false;
      }

      return true;
    } catch (e) {
      _log('❌ Failed to clear ${system.name}: $e');
      return false;
    } finally {
      await _send('ATSH7DF');
    }
  }
}
