/// Gearbox database — ported from gearbox-database.ts
/// Contains transmission specifications for Malaysian market vehicles.

enum TransmissionFamily {
  cvt,
  dct,
  at,
  mt,
  pdk,
  eCvt;

  String get label {
    switch (this) {
      case TransmissionFamily.cvt: return 'CVT';
      case TransmissionFamily.dct: return 'DCT';
      case TransmissionFamily.at: return 'AT';
      case TransmissionFamily.mt: return 'MT';
      case TransmissionFamily.pdk: return 'PDK';
      case TransmissionFamily.eCvt: return 'E-CVT';
    }
  }
}

enum TransmissionRisk {
  low,
  moderate,
  high,
  critical;

  String get label {
    switch (this) {
      case TransmissionRisk.low: return 'LOW';
      case TransmissionRisk.moderate: return 'MODERATE';
      case TransmissionRisk.high: return 'HIGH';
      case TransmissionRisk.critical: return 'CRITICAL';
    }
  }
}

enum PartCategory {
  caseType,
  gear,
  bearing,
  seal,
  solenoid,
  valve,
  clutch,
  belt,
  pulley,
  sensor,
  electronics;

  String get label {
    switch (this) {
      case PartCategory.caseType: return 'CASE';
      case PartCategory.gear: return 'GEAR';
      case PartCategory.bearing: return 'BEARING';
      case PartCategory.seal: return 'SEAL';
      case PartCategory.solenoid: return 'SOLENOID';
      case PartCategory.valve: return 'VALVE';
      case PartCategory.clutch: return 'CLUTCH';
      case PartCategory.belt: return 'BELT';
      case PartCategory.pulley: return 'PULLEY';
      case PartCategory.sensor: return 'SENSOR';
      case PartCategory.electronics: return 'ELECTRONICS';
    }
  }
}

enum PartFailureRisk { low, medium, high }

class GearboxPart {
  final String id;
  final String name;
  final String? partNumber;
  final PartCategory category;
  final ({double x, double y}) position;
  final int layer;
  final bool isServiceable;
  final PartFailureRisk failureRisk;
  final String? notes;

  const GearboxPart({
    required this.id,
    required this.name,
    this.partNumber,
    required this.category,
    required this.position,
    required this.layer,
    required this.isServiceable,
    required this.failureRisk,
    this.notes,
  });
}

class GearboxInfo {
  final String id;
  final String make;
  final String model;
  final String? variant;
  final String engine;
  final TransmissionFamily transmissionType;
  final String gearboxFamily;
  final int gearCount;
  final String manufacturer;
  final String fluidType;
  final String fluidCapacity;
  final String serviceInterval;
  final List<String> commonIssues;
  final TransmissionRisk calibrationRisk;
  final bool supportsAdaptiveReset;
  final bool requiresSpecialTool;
  final List<GearboxPart> parts;
  final String? diagramImage;

  const GearboxInfo({
    required this.id,
    required this.make,
    required this.model,
    this.variant,
    required this.engine,
    required this.transmissionType,
    required this.gearboxFamily,
    required this.gearCount,
    required this.manufacturer,
    required this.fluidType,
    required this.fluidCapacity,
    required this.serviceInterval,
    required this.commonIssues,
    required this.calibrationRisk,
    required this.supportsAdaptiveReset,
    required this.requiresSpecialTool,
    required this.parts,
    this.diagramImage,
  });
}

// ── Parts Templates ──────────────────────────────────────────

const List<GearboxPart> _cvtParts = [
  GearboxPart(id: 'case-upper', name: 'Transmission Case (Upper)', category: PartCategory.caseType, position: (x: 50, y: 5), layer: 1, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'case-lower', name: 'Transmission Case (Lower)', category: PartCategory.caseType, position: (x: 50, y: 95), layer: 10, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'primary-pulley', name: 'Primary Pulley Assembly', category: PartCategory.pulley, position: (x: 30, y: 35), layer: 3, isServiceable: true, failureRisk: PartFailureRisk.medium, notes: 'Wear inspection at 100k km'),
  GearboxPart(id: 'secondary-pulley', name: 'Secondary Pulley Assembly', category: PartCategory.pulley, position: (x: 70, y: 35), layer: 3, isServiceable: true, failureRisk: PartFailureRisk.medium, notes: 'Wear inspection at 100k km'),
  GearboxPart(id: 'steel-belt', name: 'Steel Push Belt', category: PartCategory.belt, position: (x: 50, y: 40), layer: 4, isServiceable: false, failureRisk: PartFailureRisk.high, notes: 'Critical component - no field service'),
  GearboxPart(id: 'forward-clutch', name: 'Forward Clutch Pack', category: PartCategory.clutch, position: (x: 25, y: 55), layer: 5, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'reverse-clutch', name: 'Reverse Brake Clutch', category: PartCategory.clutch, position: (x: 75, y: 55), layer: 5, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'valve-body', name: 'Valve Body Assembly', category: PartCategory.valve, position: (x: 50, y: 70), layer: 7, isServiceable: true, failureRisk: PartFailureRisk.medium, notes: 'Contains all solenoids'),
  GearboxPart(id: 'pressure-solenoid', name: 'Line Pressure Solenoid', category: PartCategory.solenoid, position: (x: 35, y: 75), layer: 8, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'ratio-solenoid', name: 'Ratio Control Solenoid', category: PartCategory.solenoid, position: (x: 65, y: 75), layer: 8, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'torque-converter', name: 'Torque Converter', category: PartCategory.clutch, position: (x: 15, y: 45), layer: 2, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'oil-pump', name: 'Oil Pump Assembly', category: PartCategory.gear, position: (x: 20, y: 30), layer: 2, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'diff-assembly', name: 'Differential Assembly', category: PartCategory.gear, position: (x: 50, y: 85), layer: 9, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'input-shaft', name: 'Input Shaft', category: PartCategory.gear, position: (x: 30, y: 25), layer: 2, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'output-shaft', name: 'Output Shaft', category: PartCategory.gear, position: (x: 70, y: 25), layer: 2, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'speed-sensor-in', name: 'Input Speed Sensor', category: PartCategory.sensor, position: (x: 20, y: 50), layer: 6, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'speed-sensor-out', name: 'Output Speed Sensor', category: PartCategory.sensor, position: (x: 80, y: 50), layer: 6, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'temp-sensor', name: 'Fluid Temperature Sensor', category: PartCategory.sensor, position: (x: 85, y: 70), layer: 6, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'tcu', name: 'Transmission Control Unit', category: PartCategory.electronics, position: (x: 50, y: 15), layer: 1, isServiceable: true, failureRisk: PartFailureRisk.low, notes: 'Software updates available'),
];

const List<GearboxPart> _dctParts = [
  GearboxPart(id: 'case-upper', name: 'Transmission Case (Upper)', category: PartCategory.caseType, position: (x: 50, y: 5), layer: 1, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'case-lower', name: 'Transmission Case (Lower)', category: PartCategory.caseType, position: (x: 50, y: 95), layer: 10, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'clutch-odd', name: 'Odd Gear Clutch (1,3,5,7)', category: PartCategory.clutch, position: (x: 30, y: 30), layer: 2, isServiceable: true, failureRisk: PartFailureRisk.high, notes: 'Dry clutch - wear item'),
  GearboxPart(id: 'clutch-even', name: 'Even Gear Clutch (2,4,6)', category: PartCategory.clutch, position: (x: 70, y: 30), layer: 2, isServiceable: true, failureRisk: PartFailureRisk.high, notes: 'Dry clutch - wear item'),
  GearboxPart(id: 'input-shaft-1', name: 'Input Shaft 1 (Hollow)', category: PartCategory.gear, position: (x: 30, y: 45), layer: 3, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'input-shaft-2', name: 'Input Shaft 2 (Solid)', category: PartCategory.gear, position: (x: 70, y: 45), layer: 3, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'gear-1', name: '1st Gear Set', category: PartCategory.gear, position: (x: 20, y: 55), layer: 4, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'gear-2', name: '2nd Gear Set', category: PartCategory.gear, position: (x: 35, y: 55), layer: 4, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'gear-3', name: '3rd Gear Set', category: PartCategory.gear, position: (x: 50, y: 55), layer: 4, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'gear-4', name: '4th Gear Set', category: PartCategory.gear, position: (x: 65, y: 55), layer: 4, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'gear-5', name: '5th Gear Set', category: PartCategory.gear, position: (x: 80, y: 55), layer: 4, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'mechatronic', name: 'Mechatronic Unit', category: PartCategory.electronics, position: (x: 50, y: 75), layer: 7, isServiceable: true, failureRisk: PartFailureRisk.high, notes: 'Contains TCU + hydraulics'),
  GearboxPart(id: 'fork-assembly', name: 'Shift Fork Assembly', category: PartCategory.gear, position: (x: 50, y: 65), layer: 5, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'diff-assembly', name: 'Differential Assembly', category: PartCategory.gear, position: (x: 50, y: 85), layer: 9, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'speed-sensor', name: 'Speed Sensor', category: PartCategory.sensor, position: (x: 85, y: 60), layer: 6, isServiceable: true, failureRisk: PartFailureRisk.medium),
];

const List<GearboxPart> _atParts = [
  GearboxPart(id: 'case', name: 'Transmission Case', category: PartCategory.caseType, position: (x: 50, y: 50), layer: 1, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'torque-converter', name: 'Torque Converter', category: PartCategory.clutch, position: (x: 15, y: 35), layer: 2, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'oil-pump', name: 'Oil Pump', category: PartCategory.gear, position: (x: 25, y: 30), layer: 2, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'planetary-front', name: 'Front Planetary Gear Set', category: PartCategory.gear, position: (x: 40, y: 40), layer: 3, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'planetary-rear', name: 'Rear Planetary Gear Set', category: PartCategory.gear, position: (x: 60, y: 40), layer: 3, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'clutch-pack', name: 'Clutch Pack Assembly', category: PartCategory.clutch, position: (x: 50, y: 55), layer: 4, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'band-brake', name: 'Band Brake', category: PartCategory.clutch, position: (x: 75, y: 45), layer: 4, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'valve-body', name: 'Valve Body', category: PartCategory.valve, position: (x: 50, y: 75), layer: 7, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'solenoid-a', name: 'Shift Solenoid A', category: PartCategory.solenoid, position: (x: 35, y: 80), layer: 8, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'solenoid-b', name: 'Shift Solenoid B', category: PartCategory.solenoid, position: (x: 50, y: 80), layer: 8, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'solenoid-tcc', name: 'TCC Solenoid', category: PartCategory.solenoid, position: (x: 65, y: 80), layer: 8, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'output-shaft', name: 'Output Shaft', category: PartCategory.gear, position: (x: 80, y: 50), layer: 5, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'governor', name: 'Governor Assembly', category: PartCategory.valve, position: (x: 85, y: 65), layer: 6, isServiceable: true, failureRisk: PartFailureRisk.low),
];

const List<GearboxPart> _toyota8atParts = [
  GearboxPart(id: 'case-bell', name: 'Bell Housing', category: PartCategory.caseType, position: (x: 10, y: 30), layer: 1, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'case-main', name: 'Main Case Assembly', category: PartCategory.caseType, position: (x: 50, y: 50), layer: 1, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'case-ext', name: 'Extension Housing', category: PartCategory.caseType, position: (x: 90, y: 50), layer: 1, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'oil-pan', name: 'Transmission Oil Pan', category: PartCategory.caseType, position: (x: 50, y: 95), layer: 10, isServiceable: true, failureRisk: PartFailureRisk.low, notes: 'Replace gasket at fluid change'),
  GearboxPart(id: 'torque-converter', name: 'Torque Converter w/ Lock-up', category: PartCategory.clutch, position: (x: 12, y: 45), layer: 2, isServiceable: true, failureRisk: PartFailureRisk.medium, notes: 'Common shudder source - check lock-up clutch'),
  GearboxPart(id: 'flexplate', name: 'Flexplate/Driveplate', category: PartCategory.gear, position: (x: 5, y: 45), layer: 1, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'oil-pump', name: 'Oil Pump Assembly', category: PartCategory.gear, position: (x: 22, y: 40), layer: 2, isServiceable: true, failureRisk: PartFailureRisk.low, notes: 'Variable displacement pump'),
  GearboxPart(id: 'input-shaft', name: 'Input Shaft', category: PartCategory.gear, position: (x: 30, y: 45), layer: 3, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'planetary-1', name: 'Planetary Gear Set #1', category: PartCategory.gear, position: (x: 35, y: 35), layer: 4, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'planetary-2', name: 'Planetary Gear Set #2', category: PartCategory.gear, position: (x: 45, y: 35), layer: 4, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'planetary-3', name: 'Planetary Gear Set #3', category: PartCategory.gear, position: (x: 55, y: 35), layer: 4, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'planetary-4', name: 'Planetary Gear Set #4 (Ravigneaux)', category: PartCategory.gear, position: (x: 65, y: 35), layer: 4, isServiceable: false, failureRisk: PartFailureRisk.low, notes: 'Compound planetary for 7th/8th gear'),
  GearboxPart(id: 'clutch-c1', name: 'C1 Forward Clutch', category: PartCategory.clutch, position: (x: 38, y: 50), layer: 5, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'clutch-c2', name: 'C2 Direct Clutch', category: PartCategory.clutch, position: (x: 48, y: 50), layer: 5, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'clutch-c3', name: 'C3 Underdrive Clutch', category: PartCategory.clutch, position: (x: 58, y: 50), layer: 5, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'clutch-c4', name: 'C4 Overdrive Clutch', category: PartCategory.clutch, position: (x: 68, y: 50), layer: 5, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'brake-b1', name: 'B1 Coast Brake', category: PartCategory.clutch, position: (x: 40, y: 65), layer: 5, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'brake-b2', name: 'B2 2-6 Brake', category: PartCategory.clutch, position: (x: 55, y: 65), layer: 5, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'owc-f1', name: 'F1 One-Way Clutch', category: PartCategory.clutch, position: (x: 70, y: 65), layer: 5, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'valve-body', name: 'Valve Body Assembly', category: PartCategory.valve, position: (x: 50, y: 80), layer: 7, isServiceable: true, failureRisk: PartFailureRisk.medium, notes: 'Contains all shift solenoids and accumulators'),
  GearboxPart(id: 'solenoid-sl1', name: 'SL1 Shift Solenoid (1-2)', category: PartCategory.solenoid, position: (x: 30, y: 85), layer: 8, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'solenoid-sl2', name: 'SL2 Shift Solenoid (2-3)', category: PartCategory.solenoid, position: (x: 40, y: 85), layer: 8, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'solenoid-sl3', name: 'SL3 Shift Solenoid (3-4)', category: PartCategory.solenoid, position: (x: 50, y: 85), layer: 8, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'solenoid-sl4', name: 'SL4 Shift Solenoid (5-6-7-8)', category: PartCategory.solenoid, position: (x: 60, y: 85), layer: 8, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'solenoid-slt', name: 'SLT Line Pressure Solenoid', category: PartCategory.solenoid, position: (x: 70, y: 85), layer: 8, isServiceable: true, failureRisk: PartFailureRisk.high, notes: 'Critical - controls all line pressure'),
  GearboxPart(id: 'solenoid-slu', name: 'SLU Lock-up Solenoid', category: PartCategory.solenoid, position: (x: 80, y: 85), layer: 8, isServiceable: true, failureRisk: PartFailureRisk.high, notes: 'Common cause of TCC shudder'),
  GearboxPart(id: 'output-shaft', name: 'Output Shaft', category: PartCategory.gear, position: (x: 75, y: 45), layer: 6, isServiceable: false, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'park-gear', name: 'Park Gear & Pawl', category: PartCategory.gear, position: (x: 82, y: 55), layer: 6, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'diff-assembly', name: 'Differential Assembly', category: PartCategory.gear, position: (x: 88, y: 45), layer: 9, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'speed-sensor-in', name: 'Input/Turbine Speed Sensor (NT)', category: PartCategory.sensor, position: (x: 25, y: 60), layer: 6, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'speed-sensor-out', name: 'Output Speed Sensor (SP2)', category: PartCategory.sensor, position: (x: 78, y: 60), layer: 6, isServiceable: true, failureRisk: PartFailureRisk.medium),
  GearboxPart(id: 'temp-sensor', name: 'ATF Temperature Sensor', category: PartCategory.sensor, position: (x: 45, y: 90), layer: 8, isServiceable: true, failureRisk: PartFailureRisk.low),
  GearboxPart(id: 'range-sensor', name: 'Transmission Range Sensor (PNP)', category: PartCategory.sensor, position: (x: 15, y: 60), layer: 6, isServiceable: true, failureRisk: PartFailureRisk.medium, notes: 'Neutral safety switch'),
  GearboxPart(id: 'tcu', name: 'Transmission Control Module', category: PartCategory.electronics, position: (x: 50, y: 15), layer: 1, isServiceable: true, failureRisk: PartFailureRisk.low, notes: 'Integrated with valve body - Techstream updates available'),
  GearboxPart(id: 'wiring-harness', name: 'Internal Wiring Harness', category: PartCategory.electronics, position: (x: 35, y: 75), layer: 7, isServiceable: true, failureRisk: PartFailureRisk.medium),
];

// ── Gearbox Database — All Entries ───────────────────────────

final List<GearboxInfo> gearboxDatabase = [
  // ── PERODUA ──
  GearboxInfo(id: 'perodua-myvi-15-cvt', make: 'Perodua', model: 'Myvi', variant: '1.5', engine: '2NR-VE', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Daihatsu Super CVT-i', gearCount: 0, manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid TC', fluidCapacity: '6.0L', serviceInterval: '40,000 km', commonIssues: ['Judder at low speed', 'Whining noise', 'Delayed engagement'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'perodua-myvi-13-4at', make: 'Perodua', model: 'Myvi', variant: '1.3', engine: '1NR-VE', transmissionType: TransmissionFamily.at, gearboxFamily: '4-speed AT', gearCount: 4, manufacturer: 'Aisin', fluidType: 'ATF WS', fluidCapacity: '3.5L', serviceInterval: '40,000 km', commonIssues: ['Harsh 2-3 shift', 'Delayed engagement when cold'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'perodua-axia-10-4at', make: 'Perodua', model: 'Axia', variant: '1.0', engine: '1KR-VE', transmissionType: TransmissionFamily.at, gearboxFamily: '4-speed AT', gearCount: 4, manufacturer: 'Aisin', fluidType: 'ATF WS', fluidCapacity: '3.2L', serviceInterval: '40,000 km', commonIssues: ['Sluggish upshifts', 'Harsh 1-2 shift when cold'], calibrationRisk: TransmissionRisk.low, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'perodua-axia-12-cvt', make: 'Perodua', model: 'Axia', variant: '1.2', engine: '3NR-VE', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Super CVT-i', gearCount: 0, manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid TC', fluidCapacity: '5.8L', serviceInterval: '40,000 km', commonIssues: ['Low-speed judder', 'Belt whine at high RPM'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'perodua-bezza-10-4at', make: 'Perodua', model: 'Bezza', variant: '1.0', engine: '1KR-VE', transmissionType: TransmissionFamily.at, gearboxFamily: '4-speed AT', gearCount: 4, manufacturer: 'Aisin', fluidType: 'ATF WS', fluidCapacity: '3.2L', serviceInterval: '40,000 km', commonIssues: ['Delayed engagement', 'Hunting shifts on hill'], calibrationRisk: TransmissionRisk.low, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'perodua-bezza-13-cvt', make: 'Perodua', model: 'Bezza', variant: '1.3', engine: '1NR-VE', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Super CVT-i', gearCount: 0, manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid TC', fluidCapacity: '5.8L', serviceInterval: '40,000 km', commonIssues: ['Low-speed judder', 'Drone at highway speed'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'perodua-alza-15-cvt', make: 'Perodua', model: 'Alza', variant: '1.5', engine: '2NR-VE', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Super CVT-i', gearCount: 0, manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid TC', fluidCapacity: '6.0L', serviceInterval: '40,000 km', commonIssues: ['Judder at low speed', 'Whining noise under load'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'perodua-ativa-cvt', make: 'Perodua', model: 'Ativa', variant: '1.0 Turbo', engine: '1KR-VET', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Daihatsu D-CVT (split gear)', gearCount: 0, manufacturer: 'Daihatsu', fluidType: 'Toyota CVT Fluid TC', fluidCapacity: '5.9L', serviceInterval: '40,000 km', commonIssues: ['Belt noise under hard acceleration', 'Hesitation from standstill', 'Low-speed judder'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  // ── PROTON ──
  GearboxInfo(id: 'proton-saga-mt', make: 'Proton', model: 'Saga', variant: 'Standard', engine: '1.3', transmissionType: TransmissionFamily.mt, gearboxFamily: '5-speed MT', gearCount: 5, manufacturer: 'Proton', fluidType: 'GL-4 75W-85', fluidCapacity: '2.0L', serviceInterval: '40,000 km', commonIssues: ['Notchy 2nd gear', 'Clutch judder'], calibrationRisk: TransmissionRisk.low, supportsAdaptiveReset: false, requiresSpecialTool: false, parts: []),
  GearboxInfo(id: 'proton-saga-4at', make: 'Proton', model: 'Saga', variant: 'AT', engine: '1.3', transmissionType: TransmissionFamily.at, gearboxFamily: '4-speed AT', gearCount: 4, manufacturer: 'Punch Powertrain', fluidType: 'ATF Dexron VI', fluidCapacity: '4.0L', serviceInterval: '40,000 km', commonIssues: ['Harsh shifts', 'Delayed engagement'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts, diagramImage: '/assets/camry aisin.png'),
  GearboxInfo(id: 'proton-persona-cvt', make: 'Proton', model: 'Persona', variant: '1.6', engine: '1.6 VVT', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Punch CVT', gearCount: 0, manufacturer: 'Punch Powertrain', fluidType: 'CVT Fluid NS-3', fluidCapacity: '7.0L', serviceInterval: '40,000 km', commonIssues: ['Belt slip under load', 'Shudder during acceleration'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'proton-iriz-13-cvt', make: 'Proton', model: 'Iriz', variant: '1.3', engine: '1.3 VVT', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Punch CVT', gearCount: 0, manufacturer: 'Punch Powertrain', fluidType: 'CVT Fluid NS-3', fluidCapacity: '7.0L', serviceInterval: '40,000 km', commonIssues: ['Belt slip under load', 'Shudder from standstill'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'proton-iriz-16-cvt', make: 'Proton', model: 'Iriz', variant: '1.6', engine: '1.6 VVT', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Punch CVT', gearCount: 0, manufacturer: 'Punch Powertrain', fluidType: 'CVT Fluid NS-3', fluidCapacity: '7.0L', serviceInterval: '40,000 km', commonIssues: ['Belt slip under load', 'Hesitation at tip-in'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'proton-x50-7dct', make: 'Proton', model: 'X50', variant: '1.5 TGDi', engine: '1.5 TGDi', transmissionType: TransmissionFamily.dct, gearboxFamily: 'Getrag 7-speed DCT', gearCount: 7, manufacturer: 'Getrag', fluidType: 'DCT Fluid', fluidCapacity: '5.8L', serviceInterval: '60,000 km', commonIssues: ['Clutch judder', 'Hesitation from stop', 'Mechatronic failure'], calibrationRisk: TransmissionRisk.critical, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _dctParts),
  GearboxInfo(id: 'proton-x70-8at', make: 'Proton', model: 'X70', variant: '1.8 TGDi', engine: '1.8 TGDi', transmissionType: TransmissionFamily.at, gearboxFamily: 'Aisin 8-speed AT', gearCount: 8, manufacturer: 'Aisin', fluidType: 'ATF WS', fluidCapacity: '8.0L', serviceInterval: '60,000 km', commonIssues: ['Torque converter shudder', 'Software shift logic issues'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _toyota8atParts),
  GearboxInfo(id: 'proton-x90-7dct', make: 'Proton', model: 'X90', variant: '1.5T', engine: '1.5 TGDi', transmissionType: TransmissionFamily.dct, gearboxFamily: 'Geely 7DCT (7DCT300)', gearCount: 7, manufacturer: 'Geely', fluidType: 'Geely DCT Fluid', fluidCapacity: '5.6L', serviceInterval: '40,000 km', commonIssues: ['Low-speed jerkiness in traffic', 'Clutch wear from hill starts', 'Overheating in heavy traffic'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _dctParts),
  // ── TOYOTA ──
  GearboxInfo(id: 'toyota-vios-cvt', make: 'Toyota', model: 'Vios', variant: '1.5', engine: '2NR-FE', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Toyota K312 CVT', gearCount: 0, manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid FE', fluidCapacity: '6.2L', serviceInterval: '40,000 km', commonIssues: ['Judder at low RPM', 'Drone at highway speed'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'toyota-vios-4at', make: 'Toyota', model: 'Vios', variant: '1.5 (older)', engine: '1NZ-FE', transmissionType: TransmissionFamily.at, gearboxFamily: '4-speed AT', gearCount: 4, manufacturer: 'Aisin', fluidType: 'ATF WS', fluidCapacity: '3.5L', serviceInterval: '40,000 km', commonIssues: ['Harsh 2-3 shift', 'Torque converter shudder'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'toyota-yaris-cvt', make: 'Toyota', model: 'Yaris', variant: '1.5', engine: '2NR-FE', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Toyota CVT', gearCount: 0, manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid FE', fluidCapacity: '6.2L', serviceInterval: '40,000 km', commonIssues: ['Low-speed judder', 'CVT whine'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'toyota-corolla-18-cvt', make: 'Toyota', model: 'Corolla Altis', variant: '1.8', engine: '2ZR-FE', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Toyota CVT', gearCount: 0, manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid FE', fluidCapacity: '6.4L', serviceInterval: '40,000 km', commonIssues: ['Low-speed judder', 'Rubber band effect'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'toyota-corolla-16-4at', make: 'Toyota', model: 'Corolla Altis', variant: '1.6', engine: '1ZR-FE', transmissionType: TransmissionFamily.at, gearboxFamily: '4-speed AT', gearCount: 4, manufacturer: 'Aisin', fluidType: 'ATF WS', fluidCapacity: '3.5L', serviceInterval: '40,000 km', commonIssues: ['Harsh shifts when cold', 'Delayed 1-2 upshift'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'toyota-prius-ecvt', make: 'Toyota', model: 'Prius', variant: '1.8 Hybrid', engine: '2ZR-FXE', transmissionType: TransmissionFamily.eCvt, gearboxFamily: 'Toyota e-CVT', gearCount: 0, manufacturer: 'Toyota', fluidType: 'Toyota WS ATF', fluidCapacity: '3.7L', serviceInterval: '80,000 km', commonIssues: ['MG1/MG2 bearing noise', 'Inverter coolant pump failure'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: false, requiresSpecialTool: true, parts: _cvtParts),
  GearboxInfo(id: 'toyota-camry-8at', make: 'Toyota', model: 'Camry', variant: '2.5', engine: '2AR-FE', transmissionType: TransmissionFamily.at, gearboxFamily: 'Aisin U880E 8-Speed', gearCount: 8, manufacturer: 'Aisin', fluidType: 'Toyota ATF WS', fluidCapacity: '9.0L', serviceInterval: '60,000 km', commonIssues: ['Torque converter shudder at low speed', 'Delayed 1-2 upshift when cold', 'Valve body wear after 150k km'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _toyota8atParts, diagramImage: '/assets/camry aisin.png'),
  GearboxInfo(id: 'toyota-hilux-6at', make: 'Toyota', model: 'Hilux', variant: '2.8 Diesel', engine: '1GD-FTV', transmissionType: TransmissionFamily.at, gearboxFamily: 'Aisin AC60F 6AT', gearCount: 6, manufacturer: 'Aisin', fluidType: 'Toyota ATF WS', fluidCapacity: '8.2L', serviceInterval: '40,000 km', commonIssues: ['Torque converter lockup shudder', 'Valve body wear from heavy towing', 'Harsh downshifts under load'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'toyota-fortuner-6at', make: 'Toyota', model: 'Fortuner', variant: '2.8 Diesel', engine: '1GD-FTV', transmissionType: TransmissionFamily.at, gearboxFamily: 'Aisin AC60F 6AT', gearCount: 6, manufacturer: 'Aisin', fluidType: 'Toyota ATF WS', fluidCapacity: '8.2L', serviceInterval: '40,000 km', commonIssues: ['Torque converter lockup shudder', 'Delayed engagement from cold', 'Kick-down delay'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'toyota-innova-ecvt', make: 'Toyota', model: 'Innova Zenix', variant: '2.0 HEV', engine: 'M20A-FXS', transmissionType: TransmissionFamily.eCvt, gearboxFamily: 'Toyota E-CVT (Hybrid)', gearCount: 0, manufacturer: 'Toyota', fluidType: 'Toyota Auto Fluid WS', fluidCapacity: '3.7L', serviceInterval: '80,000 km', commonIssues: ['MG1/MG2 inverter coolant flow', 'Battery cell degradation'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: false, requiresSpecialTool: true, parts: _cvtParts),
  // ── HONDA ──
  GearboxInfo(id: 'honda-city-cvt', make: 'Honda', model: 'City', variant: '1.5', engine: 'L15B', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Honda CVT', gearCount: 0, manufacturer: 'Honda', fluidType: 'Honda HCF-2', fluidCapacity: '3.5L', serviceInterval: '40,000 km', commonIssues: ['Start clutch judder', 'Whine at deceleration'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'honda-civic-15t-cvt', make: 'Honda', model: 'Civic', variant: '1.5T', engine: 'L15B7', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Honda CVT', gearCount: 0, manufacturer: 'Honda', fluidType: 'Honda HCF-2', fluidCapacity: '4.0L', serviceInterval: '40,000 km', commonIssues: ['Turbo lag + CVT hesitation', 'Start clutch judder'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'honda-civic-20-6mt', make: 'Honda', model: 'Civic', variant: '2.0 MT', engine: 'R20', transmissionType: TransmissionFamily.mt, gearboxFamily: '6-speed MT', gearCount: 6, manufacturer: 'Honda', fluidType: 'Honda MTF', fluidCapacity: '1.8L', serviceInterval: '60,000 km', commonIssues: ['Notchy 3rd gear synchro', 'Clutch chatter'], calibrationRisk: TransmissionRisk.low, supportsAdaptiveReset: false, requiresSpecialTool: false, parts: []),
  GearboxInfo(id: 'honda-jazz-cvt', make: 'Honda', model: 'Jazz', variant: '1.5', engine: 'L15A', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Honda CVT', gearCount: 0, manufacturer: 'Honda', fluidType: 'Honda HCF-2', fluidCapacity: '3.5L', serviceInterval: '40,000 km', commonIssues: ['Start clutch judder', 'Whine under load'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'honda-hrv-cvt', make: 'Honda', model: 'HR-V', variant: '1.8', engine: 'R18Z', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Honda CVT', gearCount: 0, manufacturer: 'Honda', fluidType: 'Honda HCF-2', fluidCapacity: '4.0L', serviceInterval: '40,000 km', commonIssues: ['Start clutch judder', 'CVT drone at highway'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'honda-crv-cvt', make: 'Honda', model: 'CR-V', variant: '1.5T', engine: 'L15B7', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Honda CVT', gearCount: 0, manufacturer: 'Honda', fluidType: 'Honda HCF-2', fluidCapacity: '4.2L', serviceInterval: '40,000 km', commonIssues: ['Start clutch judder', 'Hesitation under hard accel'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  // ── MAZDA ──
  GearboxInfo(id: 'mazda-3-6at', make: 'Mazda', model: 'Mazda 3', variant: '2.0', engine: 'SkyActiv-G 2.0', transmissionType: TransmissionFamily.at, gearboxFamily: 'SkyActiv-Drive 6AT', gearCount: 6, manufacturer: 'Mazda', fluidType: 'Mazda ATF FZ', fluidCapacity: '7.5L', serviceInterval: '60,000 km', commonIssues: ['Torque converter shudder', 'Harsh 3-4 shift'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'mazda-cx5-6at', make: 'Mazda', model: 'CX-5', variant: '2.0', engine: 'SkyActiv-G 2.0', transmissionType: TransmissionFamily.at, gearboxFamily: 'SkyActiv-Drive 6AT', gearCount: 6, manufacturer: 'Mazda', fluidType: 'Mazda ATF FZ', fluidCapacity: '7.5L', serviceInterval: '60,000 km', commonIssues: ['Torque converter shudder', 'Delayed downshift'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'mazda-2-6at', make: 'Mazda', model: 'Mazda 2', variant: '1.5', engine: 'SkyActiv-G 1.5', transmissionType: TransmissionFamily.at, gearboxFamily: 'SkyActiv-Drive 6AT', gearCount: 6, manufacturer: 'Mazda', fluidType: 'Mazda ATF FZ', fluidCapacity: '7.0L', serviceInterval: '60,000 km', commonIssues: ['Harsh low-speed shifts', 'Torque converter vibration'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  // ── NISSAN ──
  GearboxInfo(id: 'nissan-almera-cvt', make: 'Nissan', model: 'Almera', variant: '1.0T', engine: 'HR10DET', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Nissan Xtronic CVT', gearCount: 0, manufacturer: 'Jatco', fluidType: 'Nissan NS-3', fluidCapacity: '6.5L', serviceInterval: '40,000 km', commonIssues: ['CVT judder', 'Overheating in traffic', 'Delayed acceleration'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'nissan-xtrail-cvt', make: 'Nissan', model: 'X-Trail', variant: '2.5', engine: 'QR25DE', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Nissan Xtronic CVT', gearCount: 0, manufacturer: 'Jatco', fluidType: 'Nissan NS-3', fluidCapacity: '7.0L', serviceInterval: '40,000 km', commonIssues: ['CVT overheating', 'Belt slip under heavy load', 'Whining noise'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'nissan-serena-cvt', make: 'Nissan', model: 'Serena', variant: '2.0 S-Hybrid', engine: 'MR20DD', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Jatco CVT8', gearCount: 0, manufacturer: 'Jatco', fluidType: 'Nissan NS-3', fluidCapacity: '7.4L', serviceInterval: '40,000 km', commonIssues: ['Judder at low speed', 'Overheating in stop-go traffic', 'Belt slip under hard accel'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'nissan-navara-7at', make: 'Nissan', model: 'Navara', variant: '2.5 Diesel', engine: 'YD25DDTi', transmissionType: TransmissionFamily.at, gearboxFamily: 'Jatco 7AT (JR710E)', gearCount: 7, manufacturer: 'Jatco', fluidType: 'Nissan Matic S', fluidCapacity: '9.7L', serviceInterval: '40,000 km', commonIssues: ['TC lockup shudder', 'Valve body sticking in heat', 'Solenoid failure'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  // ── MITSUBISHI ──
  GearboxInfo(id: 'mitsubishi-attrage-cvt', make: 'Mitsubishi', model: 'Attrage', variant: '1.2', engine: '3A92', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'INVECS-III CVT', gearCount: 0, manufacturer: 'Jatco', fluidType: 'Mitsubishi CVTF-J4', fluidCapacity: '6.0L', serviceInterval: '40,000 km', commonIssues: ['Belt noise', 'Shudder from standstill'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'mitsubishi-outlander-cvt', make: 'Mitsubishi', model: 'Outlander', variant: '2.0', engine: '4J11', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'INVECS-III CVT', gearCount: 0, manufacturer: 'Jatco', fluidType: 'Mitsubishi CVTF-J4', fluidCapacity: '7.5L', serviceInterval: '40,000 km', commonIssues: ['CVT overheating under tow', 'Belt whine at high speed'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'mitsubishi-triton-5at', make: 'Mitsubishi', model: 'Triton', variant: '2.4 Diesel', engine: '4N15', transmissionType: TransmissionFamily.at, gearboxFamily: 'Aisin A750F 5AT', gearCount: 5, manufacturer: 'Aisin', fluidType: 'Mitsubishi DiaQueen ATF SP-III', fluidCapacity: '8.5L', serviceInterval: '40,000 km', commonIssues: ['Solenoid pack failure', 'Torque converter shudder towing', 'ATF overheating in traffic'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'mitsubishi-xpander-cvt', make: 'Mitsubishi', model: 'Xpander', variant: '1.5', engine: '4A91', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Jatco CVT7', gearCount: 0, manufacturer: 'Jatco', fluidType: 'Mitsubishi DiaQueen CVTF-J4', fluidCapacity: '6.9L', serviceInterval: '40,000 km', commonIssues: ['Belt noise under load', 'Judder from standstill', 'CVT fluid overheating in traffic'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  // ── SUBARU ──
  GearboxInfo(id: 'subaru-xv-cvt', make: 'Subaru', model: 'XV', variant: '2.0', engine: 'FB20', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Lineartronic CVT', gearCount: 0, manufacturer: 'Subaru', fluidType: 'Subaru CVT Fluid', fluidCapacity: '11.0L', serviceInterval: '60,000 km', commonIssues: ['Chain noise at cold start', 'Torque converter shudder'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  GearboxInfo(id: 'subaru-forester-cvt', make: 'Subaru', model: 'Forester', variant: '2.0', engine: 'FB20', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Lineartronic CVT', gearCount: 0, manufacturer: 'Subaru', fluidType: 'Subaru CVT Fluid', fluidCapacity: '11.0L', serviceInterval: '60,000 km', commonIssues: ['Chain noise at cold start', 'Hesitation from stop'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  // ── SUZUKI ──
  GearboxInfo(id: 'suzuki-swift-4at', make: 'Suzuki', model: 'Swift', variant: '1.4', engine: 'K14B', transmissionType: TransmissionFamily.at, gearboxFamily: '4-speed AT', gearCount: 4, manufacturer: 'Aisin', fluidType: 'ATF Dexron III', fluidCapacity: '4.0L', serviceInterval: '40,000 km', commonIssues: ['Harsh 2-3 shift', 'Delayed engagement when cold'], calibrationRisk: TransmissionRisk.low, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'suzuki-ertiga-4at', make: 'Suzuki', model: 'Ertiga', variant: '1.5', engine: 'K15B', transmissionType: TransmissionFamily.at, gearboxFamily: '4-speed AT', gearCount: 4, manufacturer: 'Aisin', fluidType: 'ATF Dexron III', fluidCapacity: '4.0L', serviceInterval: '40,000 km', commonIssues: ['Hunting shifts on incline', 'Harsh shifts under load'], calibrationRisk: TransmissionRisk.low, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  // ── ISUZU ──
  GearboxInfo(id: 'isuzu-dmax-30-6at', make: 'Isuzu', model: 'D-Max', variant: '3.0', engine: '4JJ3-TCX', transmissionType: TransmissionFamily.at, gearboxFamily: '6-speed AT', gearCount: 6, manufacturer: 'Aisin', fluidType: 'ATF Type H+', fluidCapacity: '8.0L', serviceInterval: '40,000 km', commonIssues: ['Torque converter shudder', 'Harsh 3-4 shift'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'isuzu-dmax-25-5mt', make: 'Isuzu', model: 'D-Max', variant: '2.5', engine: '4JK1-TCH', transmissionType: TransmissionFamily.mt, gearboxFamily: '5-speed MT', gearCount: 5, manufacturer: 'Isuzu', fluidType: 'GL-4 75W-90', fluidCapacity: '2.5L', serviceInterval: '40,000 km', commonIssues: ['Hard shifting when cold', 'Clutch judder'], calibrationRisk: TransmissionRisk.low, supportsAdaptiveReset: false, requiresSpecialTool: false, parts: []),
  GearboxInfo(id: 'isuzu-mu-x-6at', make: 'Isuzu', model: 'MU-X', variant: '3.0 Diesel', engine: '4JJ3-TCX', transmissionType: TransmissionFamily.at, gearboxFamily: 'Aisin A760H 6AT', gearCount: 6, manufacturer: 'Aisin', fluidType: 'Isuzu ATF Type II', fluidCapacity: '8.8L', serviceInterval: '40,000 km', commonIssues: ['Shift flare 2-3', 'Torque converter lockup vibration', 'Harsh downshift when braking'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  // ── FORD ──
  GearboxInfo(id: 'ford-ranger-22-6at', make: 'Ford', model: 'Ranger', variant: '2.2', engine: 'Duratorq 2.2', transmissionType: TransmissionFamily.at, gearboxFamily: '6-speed AT', gearCount: 6, manufacturer: 'Ford', fluidType: 'Mercon LV', fluidCapacity: '9.5L', serviceInterval: '60,000 km', commonIssues: ['Solenoid body issues', 'Harsh 2-3 shift'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'ford-ranger-32-6at', make: 'Ford', model: 'Ranger', variant: '3.2', engine: 'Duratorq 3.2', transmissionType: TransmissionFamily.at, gearboxFamily: '6-speed AT', gearCount: 6, manufacturer: 'Ford', fluidType: 'Mercon LV', fluidCapacity: '9.5L', serviceInterval: '60,000 km', commonIssues: ['Torque converter shudder', 'Valve body wear'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'ford-everest-10at', make: 'Ford', model: 'Everest', variant: '2.0 Diesel Bi-Turbo', engine: '2.0 EcoBlue', transmissionType: TransmissionFamily.at, gearboxFamily: 'Ford 10R80 10AT', gearCount: 10, manufacturer: 'Ford', fluidType: 'Mercon ULV', fluidCapacity: '10.5L', serviceInterval: '60,000 km', commonIssues: ['Harsh low-speed shifts', 'Shudder in 3rd-4th-5th gears', 'Adaptive learning slow after reset'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _atParts),
  // ── KIA ──
  GearboxInfo(id: 'kia-picanto-4at', make: 'Kia', model: 'Picanto', variant: '1.2', engine: 'Kappa 1.2', transmissionType: TransmissionFamily.at, gearboxFamily: '4-speed AT', gearCount: 4, manufacturer: 'Hyundai-Kia', fluidType: 'ATF SP-IV', fluidCapacity: '4.0L', serviceInterval: '40,000 km', commonIssues: ['Sluggish shifts', 'Hunting on incline'], calibrationRisk: TransmissionRisk.low, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'kia-sportage-6at', make: 'Kia', model: 'Sportage', variant: '2.0', engine: 'Nu 2.0', transmissionType: TransmissionFamily.at, gearboxFamily: '6-speed AT', gearCount: 6, manufacturer: 'Hyundai-Kia', fluidType: 'ATF SP-IV', fluidCapacity: '7.1L', serviceInterval: '60,000 km', commonIssues: ['Torque converter shudder', 'Harsh shifts when cold'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  // ── HYUNDAI ──
  GearboxInfo(id: 'hyundai-i10-4at', make: 'Hyundai', model: 'i10', variant: '1.2', engine: 'Kappa 1.2', transmissionType: TransmissionFamily.at, gearboxFamily: '4-speed AT', gearCount: 4, manufacturer: 'Hyundai-Kia', fluidType: 'ATF SP-IV', fluidCapacity: '4.0L', serviceInterval: '40,000 km', commonIssues: ['Sluggish shifts', 'Delayed engagement'], calibrationRisk: TransmissionRisk.low, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'hyundai-tucson-6at', make: 'Hyundai', model: 'Tucson', variant: '2.0', engine: 'Nu 2.0', transmissionType: TransmissionFamily.at, gearboxFamily: '6-speed AT', gearCount: 6, manufacturer: 'Hyundai-Kia', fluidType: 'ATF SP-IV', fluidCapacity: '7.1L', serviceInterval: '60,000 km', commonIssues: ['Harsh 1-2 shift', 'Torque converter shudder'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'hyundai-kona-7dct', make: 'Hyundai', model: 'Kona', variant: '1.6T', engine: 'Gamma 1.6T-GDi', transmissionType: TransmissionFamily.dct, gearboxFamily: 'Hyundai 7DCT (D7UF1)', gearCount: 7, manufacturer: 'Hyundai Transys', fluidType: 'Hyundai DCT Fluid', fluidCapacity: '5.8L', serviceInterval: '60,000 km', commonIssues: ['Low-speed shudder', 'Clutch judder from creep', 'Delayed engagement from park'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _dctParts),
  GearboxInfo(id: 'hyundai-santa-fe-8at', make: 'Hyundai', model: 'Santa Fe', variant: '2.4', engine: 'Theta II 2.4', transmissionType: TransmissionFamily.at, gearboxFamily: 'Hyundai A8LF1 8AT', gearCount: 8, manufacturer: 'Hyundai Transys', fluidType: 'Hyundai/Kia ATF SP-IV', fluidCapacity: '8.2L', serviceInterval: '60,000 km', commonIssues: ['Harsh shift 3-4-5 when hot', 'TC lockup shudder', 'Valve body accumulator leak'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  // ── BMW ──
  GearboxInfo(id: 'bmw-3series-20-8at', make: 'BMW', model: '3 Series', variant: 'F30 320i', engine: 'B48', transmissionType: TransmissionFamily.at, gearboxFamily: 'ZF 8HP45', gearCount: 8, manufacturer: 'ZF', fluidType: 'ZF Lifeguard 8', fluidCapacity: '9.0L', serviceInterval: 'Lifetime (80,000 km recommended)', commonIssues: ['Mechatronic sleeve leak', 'Harsh low-speed shifts'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _atParts),
  GearboxInfo(id: 'bmw-3series-30-8at', make: 'BMW', model: '3 Series', variant: 'F30 330i', engine: 'B48B30', transmissionType: TransmissionFamily.at, gearboxFamily: 'ZF 8HP45', gearCount: 8, manufacturer: 'ZF', fluidType: 'ZF Lifeguard 8', fluidCapacity: '9.0L', serviceInterval: 'Lifetime (80,000 km recommended)', commonIssues: ['Mechatronic sleeve leak', 'Shift flare under load'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _atParts),
  GearboxInfo(id: 'bmw-5series-20-8at', make: 'BMW', model: '5 Series', variant: 'G30 520i', engine: 'B48', transmissionType: TransmissionFamily.at, gearboxFamily: 'ZF 8HP45', gearCount: 8, manufacturer: 'ZF', fluidType: 'ZF Lifeguard 8', fluidCapacity: '9.0L', serviceInterval: 'Lifetime (80,000 km recommended)', commonIssues: ['Mechatronic sleeve leak', 'Downshift clunk'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _atParts),
  GearboxInfo(id: 'bmw-5series-30-8at', make: 'BMW', model: '5 Series', variant: 'G30 530i', engine: 'B48B30', transmissionType: TransmissionFamily.at, gearboxFamily: 'ZF 8HP45', gearCount: 8, manufacturer: 'ZF', fluidType: 'ZF Lifeguard 8', fluidCapacity: '9.0L', serviceInterval: 'Lifetime (80,000 km recommended)', commonIssues: ['Mechatronic sleeve leak', 'Harsh coast downshift'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _atParts),
  // ── MERCEDES ──
  GearboxInfo(id: 'mercedes-c-9at', make: 'Mercedes-Benz', model: 'C-Class', variant: 'W205', engine: 'M274', transmissionType: TransmissionFamily.at, gearboxFamily: 'Mercedes 9G-Tronic', gearCount: 9, manufacturer: 'Mercedes-Benz', fluidType: 'MB 236.17', fluidCapacity: '8.5L', serviceInterval: '60,000 km', commonIssues: ['Torque converter shudder', 'Software calibration issues'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _atParts),
  GearboxInfo(id: 'mercedes-e-9at', make: 'Mercedes-Benz', model: 'E-Class', variant: 'W213', engine: 'M274', transmissionType: TransmissionFamily.at, gearboxFamily: 'Mercedes 9G-Tronic', gearCount: 9, manufacturer: 'Mercedes-Benz', fluidType: 'MB 236.17', fluidCapacity: '8.5L', serviceInterval: '60,000 km', commonIssues: ['Rough downshifts', 'Torque converter shudder at low speed'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _atParts),
  // ── VOLKSWAGEN ──
  GearboxInfo(id: 'vw-golf-dsg7', make: 'Volkswagen', model: 'Golf', variant: '1.4 TSI', engine: 'EA211', transmissionType: TransmissionFamily.dct, gearboxFamily: 'DSG-7 (DQ200)', gearCount: 7, manufacturer: 'LuK/VW', fluidType: 'VW G 052 529', fluidCapacity: '1.7L (dry sump)', serviceInterval: '60,000 km', commonIssues: ['Mechatronic failure', 'Clutch pack wear', 'Flywheel noise'], calibrationRisk: TransmissionRisk.critical, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _dctParts),
  GearboxInfo(id: 'vw-passat-6at', make: 'Volkswagen', model: 'Passat', variant: '1.8T', engine: 'EA888', transmissionType: TransmissionFamily.at, gearboxFamily: '6-speed AT', gearCount: 6, manufacturer: 'Aisin', fluidType: 'ATF G 055 025', fluidCapacity: '7.0L', serviceInterval: '60,000 km', commonIssues: ['Torque converter shudder', 'Valve body solenoid wear'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  // ── AUDI ──
  GearboxInfo(id: 'audi-a4-7dct', make: 'Audi', model: 'A4', variant: '2.0T', engine: 'EA888', transmissionType: TransmissionFamily.dct, gearboxFamily: 'Audi 7-speed DCT', gearCount: 7, manufacturer: 'BorgWarner', fluidType: 'Audi G 052 529', fluidCapacity: '5.5L', serviceInterval: '60,000 km', commonIssues: ['Mechatronic failure', 'Clutch shudder from standstill'], calibrationRisk: TransmissionRisk.critical, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _dctParts),
  GearboxInfo(id: 'audi-q5-7dct', make: 'Audi', model: 'Q5', variant: '2.0T', engine: 'EA888', transmissionType: TransmissionFamily.dct, gearboxFamily: 'Audi 7-speed DCT', gearCount: 7, manufacturer: 'BorgWarner', fluidType: 'Audi G 052 529', fluidCapacity: '5.5L', serviceInterval: '60,000 km', commonIssues: ['Mechatronic failure', 'Judder in stop-go traffic'], calibrationRisk: TransmissionRisk.critical, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _dctParts),
  // ── MINI ──
  GearboxInfo(id: 'mini-cooper-s-7dct', make: 'Mini', model: 'Cooper S', variant: '2.0T', engine: 'B48', transmissionType: TransmissionFamily.dct, gearboxFamily: 'Getrag/ALC 7-speed DCT', gearCount: 7, manufacturer: 'Getrag', fluidType: 'DCT Fluid', fluidCapacity: '5.5L', serviceInterval: '60,000 km', commonIssues: ['Clutch judder from standstill', 'Mechatronic solenoid failure'], calibrationRisk: TransmissionRisk.critical, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _dctParts),
  // ── PORSCHE ──
  GearboxInfo(id: 'porsche-macan-pdk', make: 'Porsche', model: 'Macan', variant: '2.0', engine: 'EA888', transmissionType: TransmissionFamily.pdk, gearboxFamily: 'Porsche PDK', gearCount: 7, manufacturer: 'ZF', fluidType: 'Porsche PDK Fluid', fluidCapacity: '8.0L', serviceInterval: '60,000 km', commonIssues: ['Clutch actuator wear', 'High-RPM shift clunk'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _dctParts),
  // ── LEXUS ──
  GearboxInfo(id: 'lexus-nx-6at', make: 'Lexus', model: 'NX 300', variant: '2.0T', engine: '8AR-FTS', transmissionType: TransmissionFamily.at, gearboxFamily: '6-speed AT', gearCount: 6, manufacturer: 'Aisin', fluidType: 'Toyota ATF WS', fluidCapacity: '7.8L', serviceInterval: '60,000 km', commonIssues: ['Rough downshifts when cold', 'Torque converter vibration'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  GearboxInfo(id: 'lexus-ux-cvt', make: 'Lexus', model: 'UX 200', variant: '2.0', engine: 'M20A-FKS', transmissionType: TransmissionFamily.cvt, gearboxFamily: 'Lexus CVT', gearCount: 0, manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid FE', fluidCapacity: '6.5L', serviceInterval: '40,000 km', commonIssues: ['Rubber band effect', 'Low-speed judder'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _cvtParts),
  // ── PEUGEOT ──
  GearboxInfo(id: 'peugeot-3008-6at', make: 'Peugeot', model: '3008', variant: '1.6T', engine: 'EP6', transmissionType: TransmissionFamily.at, gearboxFamily: '6-speed AT', gearCount: 6, manufacturer: 'Aisin', fluidType: 'ATF AW-1', fluidCapacity: '7.0L', serviceInterval: '60,000 km', commonIssues: ['Delayed engagement', 'Harsh shifts under load'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: false, parts: _atParts),
  // ── VOLVO ──
  GearboxInfo(id: 'volvo-xc60-8at', make: 'Volvo', model: 'XC60', variant: 'T5 2.0T', engine: 'B4204T23', transmissionType: TransmissionFamily.at, gearboxFamily: 'Aisin TG-81SC 8AT', gearCount: 8, manufacturer: 'Aisin', fluidType: 'Volvo ATF (Aisin AW-1)', fluidCapacity: '7.5L', serviceInterval: '60,000 km', commonIssues: ['Mechatronics unit failure', 'Torque converter shudder at low speed', 'Delayed cold start engagement'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _atParts),
  GearboxInfo(id: 'volvo-xc90-8at', make: 'Volvo', model: 'XC90', variant: 'T8 PHEV', engine: 'B4204T35', transmissionType: TransmissionFamily.at, gearboxFamily: 'Aisin TG-81SC 8AT + EV module', gearCount: 8, manufacturer: 'Aisin', fluidType: 'Volvo ATF (Aisin AW-1)', fluidCapacity: '7.5L', serviceInterval: '60,000 km', commonIssues: ['Hybrid clutch wear', 'Mechatronics unit failure', 'Heat soak in tropical climate'], calibrationRisk: TransmissionRisk.high, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _atParts),
  GearboxInfo(id: 'volvo-xc40-8at', make: 'Volvo', model: 'XC40', variant: 'T5 2.0T', engine: 'B4204T47', transmissionType: TransmissionFamily.at, gearboxFamily: 'Aisin TG-81SC 8AT', gearCount: 8, manufacturer: 'Aisin', fluidType: 'Volvo ATF (Aisin AW-1)', fluidCapacity: '7.5L', serviceInterval: '60,000 km', commonIssues: ['Torque converter shudder', 'Harsh 2-3 upshift when cold'], calibrationRisk: TransmissionRisk.moderate, supportsAdaptiveReset: true, requiresSpecialTool: true, parts: _atParts),
];

// ── Helper Functions ────────────────────────────────────────

/// Find gearbox info by vehicle make, model, and optional engine
GearboxInfo? findGearboxByVehicle(String make, String model, [String? engine]) {
  final m = make.toLowerCase();
  final mo = model.toLowerCase();
  final e = engine?.toLowerCase();

  for (final g in gearboxDatabase) {
    final matchesMake = g.make.toLowerCase().contains(m);
    final matchesModel = g.model.toLowerCase().contains(mo);
    final matchesEngine = e == null || g.engine.toLowerCase().contains(e);
    if (matchesMake && matchesModel && matchesEngine) return g;
  }
  return null;
}

/// Get parts by category
List<GearboxPart> getPartsByCategory(GearboxInfo gearbox, PartCategory category) {
  return gearbox.parts.where((p) => p.category == category).toList();
}

/// Get high failure-risk parts
List<GearboxPart> getHighRiskParts(GearboxInfo gearbox) {
  return gearbox.parts.where((p) => p.failureRisk == PartFailureRisk.high).toList();
}

/// Get all gearbox entries for a make
List<GearboxInfo> getGearboxesByMake(String make) {
  final m = make.toLowerCase();
  return gearboxDatabase.where((g) => g.make.toLowerCase() == m).toList();
}

/// Get entries by transmission type
List<GearboxInfo> getGearboxesByType(TransmissionFamily type) {
  return gearboxDatabase.where((g) => g.transmissionType == type).toList();
}

/// Get entries by risk level
List<GearboxInfo> getGearboxesByRisk(TransmissionRisk risk) {
  return gearboxDatabase.where((g) => g.calibrationRisk == risk).toList();
}
