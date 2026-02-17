/// Mock data service — ported from mock-data.service.ts
/// Provides mock data for demo mode simulation.

import 'dart:async';
import 'dart:math';
import '../models/diagnostic_types.dart';

// ── Mock VIN Data ─────────────────────────────────────────

final VINDecoded mockVinData = VINDecoded(
  wmi: 'PMP',
  vds: 'A13K00',
  vis: 'R0000001',
  manufacturer: 'Proton',
  brand: 'Proton',
  country: 'Malaysia',
  modelYear: 2024,
  assemblyPlant: 'T',
  serialNumber: '000001',
  model: 'Saga',
  engineType: '1.3 VVT',
  transmissionType: TransmissionType.automatic,
  driveType: DriveType.fwd,
  bodyStyle: 'Sedan',
  fuelType: FuelType.petrol,
  marketRegion: MarketRegion.my,
  emissionStandard: 'Euro 4 (MY)',
);

// ── Mock ECUs ─────────────────────────────────────────────

final List<ECUInfo> mockECUs = [
  ECUInfo(
    id: 'ecu-ecm', name: 'Engine Control Module', type: ECUType.engine,
    address: '7E0', responseAddress: '7E8', protocol: OBDProtocol.iso15765_11bit,
    status: ECUStatus.online, firmwareVersion: 'ECM-3.2.1',
    hardwareVersion: 'HW-R4', voltage: 14.2,
    responseTimeMs: 45, communicationQuality: CommunicationQuality.excellent,
    supportedPids: [0x0104, 0x0105, 0x0106, 0x0107, 0x010C, 0x010D, 0x010E, 0x010F, 0x0110, 0x0111, 0x0114, 0x0142],
    dtcCount: DTCCount(confirmed: 2, pending: 1, permanent: 0),
    lastSeen: DateTime.now(),
  ),
  ECUInfo(
    id: 'ecu-tcm', name: 'Transmission Control Module', type: ECUType.transmission,
    address: '7E1', responseAddress: '7E9', protocol: OBDProtocol.iso15765_11bit,
    status: ECUStatus.online, firmwareVersion: 'TCM-2.1.0',
    hardwareVersion: 'HW-R3', voltage: 14.1,
    responseTimeMs: 52, communicationQuality: CommunicationQuality.good,
    supportedPids: [0x010D],
    dtcCount: DTCCount(confirmed: 0, pending: 0, permanent: 0),
    lastSeen: DateTime.now(),
  ),
  ECUInfo(
    id: 'ecu-abs', name: 'Anti-Lock Braking System', type: ECUType.abs,
    address: '7E2', responseAddress: '7EA', protocol: OBDProtocol.iso15765_11bit,
    status: ECUStatus.online, firmwareVersion: 'ABS-1.8.3',
    hardwareVersion: 'HW-R2', voltage: 14.0,
    responseTimeMs: 60, communicationQuality: CommunicationQuality.good,
    supportedPids: [0x010D],
    dtcCount: DTCCount(confirmed: 1, pending: 0, permanent: 0),
    lastSeen: DateTime.now(),
  ),
  ECUInfo(
    id: 'ecu-srs', name: 'Supplemental Restraint System', type: ECUType.airbag,
    address: '7E3', responseAddress: '7EB', protocol: OBDProtocol.iso15765_11bit,
    status: ECUStatus.online, firmwareVersion: 'SRS-2.0.5',
    hardwareVersion: 'HW-R1', voltage: 14.1,
    responseTimeMs: 48, communicationQuality: CommunicationQuality.excellent,
    supportedPids: [],
    dtcCount: DTCCount(confirmed: 0, pending: 0, permanent: 0),
    lastSeen: DateTime.now(),
  ),
  ECUInfo(
    id: 'ecu-bcm', name: 'Body Control Module', type: ECUType.body,
    address: '7E4', responseAddress: '7EC', protocol: OBDProtocol.iso15765_11bit,
    status: ECUStatus.online, firmwareVersion: 'BCM-3.0.2',
    hardwareVersion: 'HW-R2', voltage: 14.2,
    responseTimeMs: 55, communicationQuality: CommunicationQuality.good,
    supportedPids: [],
    dtcCount: DTCCount(confirmed: 0, pending: 0, permanent: 0),
    lastSeen: DateTime.now(),
  ),
  ECUInfo(
    id: 'ecu-eps', name: 'Electric Power Steering', type: ECUType.steering,
    address: '7E5', responseAddress: '7ED', protocol: OBDProtocol.iso15765_11bit,
    status: ECUStatus.online, firmwareVersion: 'EPS-1.5.0',
    hardwareVersion: 'HW-R1', voltage: 14.0,
    responseTimeMs: 62, communicationQuality: CommunicationQuality.good,
    supportedPids: [],
    dtcCount: DTCCount(confirmed: 0, pending: 0, permanent: 0),
    lastSeen: DateTime.now(),
  ),
  ECUInfo(
    id: 'ecu-immo', name: 'Immobilizer', type: ECUType.immobilizer,
    address: '7E6', responseAddress: '7EE', protocol: OBDProtocol.iso15765_11bit,
    status: ECUStatus.online, firmwareVersion: 'IMMO-1.2.0',
    hardwareVersion: 'HW-R1', voltage: 14.1,
    responseTimeMs: 70, communicationQuality: CommunicationQuality.fair,
    supportedPids: [],
    dtcCount: DTCCount(confirmed: 0, pending: 0, permanent: 0),
    lastSeen: DateTime.now(),
  ),
];

// ── Mock DTCs ─────────────────────────────────────────────

final List<DiagnosticTroubleCode> mockDTCs = [
  DiagnosticTroubleCode(
    code: 'P0171', status: DTCStatus.confirmed,
    category: DTCCategory.emission,
    description: 'System Too Lean (Bank 1)',
    severity: DriveImpact.warning,
    sourceECU: 'ECM',
    definition: DTCDefinition(
      officialDescription: 'System Too Lean (Bank 1)',
      userDescription: 'Your engine is running with too much air and not enough fuel. This can cause rough idle, hesitation, and reduced fuel economy.',
      possibleCauses: ['Vacuum leak in intake manifold', 'Dirty or faulty MAF sensor', 'Weak fuel pump', 'Clogged fuel injectors', 'Exhaust leak before O2 sensor'],
      symptoms: ['Rough idle', 'Hesitation on acceleration', 'Poor fuel economy', 'Check engine light'],
      affectedSystems: ['Fuel System', 'Emission Control'],
      estimatedRepairCost: (min: 150, max: 800, currency: 'MYR'),
      laborHours: 1.5,
    ),
    freezeFrame: FreezeFrameData(
      rpm: 780, speed: 0, coolantTemp: 92, engineLoad: 22,
      fuelTrim1: 14.8, fuelTrim2: null, intakeTemp: 35, mapPressure: 32,
      timestamp: DateTime.now().subtract(const Duration(hours: 2)),
    ),
    firstSeen: DateTime.now().subtract(const Duration(days: 5)),
    occurrenceCount: 3,
  ),
  DiagnosticTroubleCode(
    code: 'P0300', status: DTCStatus.confirmed,
    category: DTCCategory.emission,
    description: 'Random/Multiple Cylinder Misfire Detected',
    severity: DriveImpact.critical,
    sourceECU: 'ECM',
    definition: DTCDefinition(
      officialDescription: 'Random/Multiple Cylinder Misfire Detected',
      userDescription: 'Multiple engine cylinders are misfiring. This can cause engine shaking, loss of power, and can damage the catalytic converter if not fixed.',
      possibleCauses: ['Worn spark plugs', 'Failed ignition coil(s)', 'Low fuel pressure', 'Vacuum leak', 'Incorrect timing'],
      symptoms: ['Engine shaking/vibration', 'Loss of power', 'Flashing check engine light', 'Rough acceleration'],
      affectedSystems: ['Ignition System', 'Fuel System'],
      estimatedRepairCost: (min: 200, max: 1500, currency: 'MYR'),
      laborHours: 2.0,
    ),
    firstSeen: DateTime.now().subtract(const Duration(days: 2)),
    occurrenceCount: 7,
  ),
  DiagnosticTroubleCode(
    code: 'C0035', status: DTCStatus.confirmed,
    category: DTCCategory.chassis,
    description: 'Left Front Wheel Speed Sensor Circuit',
    severity: DriveImpact.warning,
    sourceECU: 'ABS',
    definition: DTCDefinition(
      officialDescription: 'Left Front Wheel Speed Sensor Circuit',
      userDescription: 'The ABS system cannot read the left front wheel speed. ABS and traction control may not be available.',
      possibleCauses: ['Damaged wheel speed sensor', 'Corroded connector', 'Broken wiring', 'Sensor air gap too large'],
      symptoms: ['ABS warning light', 'Traction control light', 'ABS not functioning'],
      affectedSystems: ['ABS', 'Traction Control'],
      estimatedRepairCost: (min: 180, max: 500, currency: 'MYR'),
      laborHours: 1.0,
    ),
    firstSeen: DateTime.now().subtract(const Duration(days: 14)),
    occurrenceCount: 1,
  ),
];

// ── Mock Live Data ────────────────────────────────────────

final List<LiveDataParameter> mockLiveData = [
  LiveDataParameter(pid: '0x010C', name: 'Engine RPM', value: 780, unit: 'RPM', category: LiveDataCategory.engine, normalRange: NormalRange(min: 650, max: 900), timestamp: DateTime.now()),
  LiveDataParameter(pid: '0x010D', name: 'Vehicle Speed', value: 0, unit: 'km/h', category: LiveDataCategory.engine, normalRange: NormalRange(min: 0, max: 200), timestamp: DateTime.now()),
  LiveDataParameter(pid: '0x0105', name: 'Coolant Temperature', value: 92, unit: '°C', category: LiveDataCategory.temperature, normalRange: NormalRange(min: 82, max: 108), timestamp: DateTime.now()),
  LiveDataParameter(pid: '0x0104', name: 'Engine Load', value: 22, unit: '%', category: LiveDataCategory.engine, normalRange: NormalRange(min: 5, max: 95), timestamp: DateTime.now()),
  LiveDataParameter(pid: '0x0111', name: 'Throttle Position', value: 15.7, unit: '%', category: LiveDataCategory.engine, normalRange: NormalRange(min: 0, max: 100), timestamp: DateTime.now()),
  LiveDataParameter(pid: '0x0106', name: 'Short Term Fuel Trim', value: 3.1, unit: '%', category: LiveDataCategory.fuelSystem, normalRange: NormalRange(min: -10, max: 10), timestamp: DateTime.now()),
  LiveDataParameter(pid: '0x0107', name: 'Long Term Fuel Trim', value: 8.5, unit: '%', category: LiveDataCategory.fuelSystem, normalRange: NormalRange(min: -10, max: 10), timestamp: DateTime.now()),
  LiveDataParameter(pid: '0x0110', name: 'MAF Air Flow', value: 3.8, unit: 'g/s', category: LiveDataCategory.airIntake, normalRange: NormalRange(min: 2, max: 8), timestamp: DateTime.now()),
  LiveDataParameter(pid: '0x010B', name: 'Intake Manifold Pressure', value: 34, unit: 'kPa', category: LiveDataCategory.airIntake, normalRange: NormalRange(min: 20, max: 105), timestamp: DateTime.now()),
  LiveDataParameter(pid: '0x0114', name: 'O2 Sensor B1S1', value: 0.45, unit: 'V', category: LiveDataCategory.o2Sensors, normalRange: NormalRange(min: 0.1, max: 0.9), timestamp: DateTime.now()),
  LiveDataParameter(pid: '0x0142', name: 'Control Module Voltage', value: 14.2, unit: 'V', category: LiveDataCategory.electrical, normalRange: NormalRange(min: 13.5, max: 14.8), timestamp: DateTime.now()),
  LiveDataParameter(pid: '0x010F', name: 'Intake Air Temperature', value: 35, unit: '°C', category: LiveDataCategory.temperature, normalRange: NormalRange(min: -10, max: 60), timestamp: DateTime.now()),
];

// ── Mock Diagnostic Case ──────────────────────────────────

final DiagnosticCase mockDiagnosticCase = DiagnosticCase(
  id: 'case-001',
  dtcCode: 'P0171',
  title: 'System Too Lean - Bank 1',
  rootCause: RootCauseAnalysis(
    primaryCause: 'Vacuum leak at intake manifold gasket',
    confidence: 87,
    explanation: 'Analysis of fuel trim data shows consistent lean condition at idle, reducing under load. This pattern is characteristic of a vacuum leak rather than a fuel delivery issue.',
    supportingEvidence: [
      'LTFT consistently above 8% at idle',
      'STFT reduces toward 0% at higher RPM/load',
      'MAF reading lower than expected for engine size at idle',
      'No fuel pressure-related codes present',
    ],
    secondaryCauses: [
      SecondaryCause(cause: 'Dirty MAF sensor', likelihood: 45),
      SecondaryCause(cause: 'Weak fuel pump', likelihood: 20),
    ],
  ),
  recommendations: [
    ActionRecommendation(
      action: 'Perform smoke test on intake system',
      priority: 1,
      estimatedCost: (min: 50.0, max: 100.0, currency: 'MYR'),
      estimatedTime: '30 minutes',
      significance: Significance.critical,
      type: ActionType.diagnose,
    ),
    ActionRecommendation(
      action: 'Replace intake manifold gasket if leak found',
      priority: 2,
      estimatedCost: (min: 150.0, max: 300.0, currency: 'MYR'),
      estimatedTime: '1-2 hours',
      significance: Significance.major,
      type: ActionType.repair,
    ),
    ActionRecommendation(
      action: 'Clean MAF sensor with approved cleaner',
      priority: 3,
      estimatedCost: (min: 30.0, max: 50.0, currency: 'MYR'),
      estimatedTime: '15 minutes',
      significance: Significance.minor,
      type: ActionType.maintenance,
    ),
  ],
  createdAt: DateTime.now(),
  status: CaseStatus.open,
);

// ── Mock Data Service ─────────────────────────────────────

class MockDataService {
  final _rng = Random();
  Timer? _liveDataTimer;
  final _liveDataController = StreamController<List<LiveDataParameter>>.broadcast();

  /// Stream of live data updates (500ms interval in simulation).
  Stream<List<LiveDataParameter>> get liveDataStream => _liveDataController.stream;

  /// Start simulating live data value changes.
  void startLiveDataSimulation() {
    _liveDataTimer?.cancel();
    _liveDataTimer = Timer.periodic(const Duration(milliseconds: 500), (_) {
      final updated = mockLiveData.map((p) {
        final newVal = _simulateValueChange(p);
        return p.copyWith(value: newVal, timestamp: DateTime.now());
      }).toList();
      _liveDataController.add(updated);
    });
  }

  /// Stop live data simulation.
  void stopLiveDataSimulation() {
    _liveDataTimer?.cancel();
    _liveDataTimer = null;
  }

  double _simulateValueChange(LiveDataParameter param) {
    final current = (param.value as num).toDouble();
    final variance = current * 0.02; // ±2%
    final change = (_rng.nextDouble() - 0.5) * 2 * variance;
    double newVal = current + change;

    // Clamp to normal range if available
    if (param.normalRange != null) {
      newVal = newVal.clamp(
        param.normalRange!.min * 0.5,
        param.normalRange!.max * 1.5,
      );
    }
    return double.parse(newVal.toStringAsFixed(1));
  }

  /// Simulate an ECU topology scan with progress callbacks.
  Future<List<ECUInfo>> simulateTopologyScan({
    void Function(String ecuName, int index, int total)? onProgress,
  }) async {
    final ecus = <ECUInfo>[];
    for (int i = 0; i < mockECUs.length; i++) {
      await Future.delayed(Duration(milliseconds: 300 + _rng.nextInt(400)));
      ecus.add(mockECUs[i]);
      onProgress?.call(mockECUs[i].name, i + 1, mockECUs.length);
    }
    return ecus;
  }

  /// Simulate DTC read.
  Future<List<DiagnosticTroubleCode>> simulateDTCRead() async {
    await Future.delayed(const Duration(milliseconds: 800));
    return List.of(mockDTCs);
  }

  /// Simulate DTC clear (C0035 returns as hard fault).
  Future<({bool success, List<String> returnedCodes})> simulateDTCClear() async {
    await Future.delayed(const Duration(seconds: 2));
    return (success: true, returnedCodes: ['C0035']);
  }

  void dispose() {
    _liveDataTimer?.cancel();
    _liveDataController.close();
  }
}

/// Singleton instance.
final mockDataService = MockDataService();
