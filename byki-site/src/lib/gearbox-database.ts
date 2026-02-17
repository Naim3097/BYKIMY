// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - GEARBOX DATABASE
// Malaysian market vehicle transmission identification
// ============================================================

export type TransmissionFamily = 
  | 'CVT'
  | 'DCT'
  | 'AT'
  | 'MT'
  | 'PDK'
  | 'E-CVT';

export type TransmissionRisk = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface GearboxInfo {
  id: string;
  make: string;
  model: string;
  variant?: string;
  engine: string;
  transmissionType: TransmissionFamily;
  gearboxFamily: string;
  gearCount: number;
  manufacturer: string;
  fluidType: string;
  fluidCapacity: string;
  serviceInterval: string;
  commonIssues: string[];
  calibrationRisk: TransmissionRisk;
  supportsAdaptiveReset: boolean;
  requiresSpecialTool: boolean;
  parts: GearboxPart[];
  diagramImage?: string;  // Optional: path to actual diagram image
}

export interface GearboxPart {
  id: string;
  name: string;
  partNumber?: string;
  category: 'CASE' | 'GEAR' | 'BEARING' | 'SEAL' | 'SOLENOID' | 'VALVE' | 'CLUTCH' | 'BELT' | 'PULLEY' | 'SENSOR' | 'ELECTRONICS';
  position: { x: number; y: number };  // Percentage position for diagram
  layer: number;  // For exploded view layering
  isServiceable: boolean;
  failureRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
}

// CVT Parts Template
const CVT_PARTS: GearboxPart[] = [
  { id: 'case-upper', name: 'Transmission Case (Upper)', category: 'CASE', position: { x: 50, y: 5 }, layer: 1, isServiceable: false, failureRisk: 'LOW' },
  { id: 'case-lower', name: 'Transmission Case (Lower)', category: 'CASE', position: { x: 50, y: 95 }, layer: 10, isServiceable: false, failureRisk: 'LOW' },
  { id: 'primary-pulley', name: 'Primary Pulley Assembly', category: 'PULLEY', position: { x: 30, y: 35 }, layer: 3, isServiceable: true, failureRisk: 'MEDIUM', notes: 'Wear inspection at 100k km' },
  { id: 'secondary-pulley', name: 'Secondary Pulley Assembly', category: 'PULLEY', position: { x: 70, y: 35 }, layer: 3, isServiceable: true, failureRisk: 'MEDIUM', notes: 'Wear inspection at 100k km' },
  { id: 'steel-belt', name: 'Steel Push Belt', category: 'BELT', position: { x: 50, y: 40 }, layer: 4, isServiceable: false, failureRisk: 'HIGH', notes: 'Critical component - no field service' },
  { id: 'forward-clutch', name: 'Forward Clutch Pack', category: 'CLUTCH', position: { x: 25, y: 55 }, layer: 5, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'reverse-clutch', name: 'Reverse Brake Clutch', category: 'CLUTCH', position: { x: 75, y: 55 }, layer: 5, isServiceable: true, failureRisk: 'LOW' },
  { id: 'valve-body', name: 'Valve Body Assembly', category: 'VALVE', position: { x: 50, y: 70 }, layer: 7, isServiceable: true, failureRisk: 'MEDIUM', notes: 'Contains all solenoids' },
  { id: 'pressure-solenoid', name: 'Line Pressure Solenoid', category: 'SOLENOID', position: { x: 35, y: 75 }, layer: 8, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'ratio-solenoid', name: 'Ratio Control Solenoid', category: 'SOLENOID', position: { x: 65, y: 75 }, layer: 8, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'torque-converter', name: 'Torque Converter', category: 'CLUTCH', position: { x: 15, y: 45 }, layer: 2, isServiceable: false, failureRisk: 'LOW' },
  { id: 'oil-pump', name: 'Oil Pump Assembly', category: 'GEAR', position: { x: 20, y: 30 }, layer: 2, isServiceable: true, failureRisk: 'LOW' },
  { id: 'diff-assembly', name: 'Differential Assembly', category: 'GEAR', position: { x: 50, y: 85 }, layer: 9, isServiceable: true, failureRisk: 'LOW' },
  { id: 'input-shaft', name: 'Input Shaft', category: 'GEAR', position: { x: 30, y: 25 }, layer: 2, isServiceable: false, failureRisk: 'LOW' },
  { id: 'output-shaft', name: 'Output Shaft', category: 'GEAR', position: { x: 70, y: 25 }, layer: 2, isServiceable: false, failureRisk: 'LOW' },
  { id: 'speed-sensor-in', name: 'Input Speed Sensor', category: 'SENSOR', position: { x: 20, y: 50 }, layer: 6, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'speed-sensor-out', name: 'Output Speed Sensor', category: 'SENSOR', position: { x: 80, y: 50 }, layer: 6, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'temp-sensor', name: 'Fluid Temperature Sensor', category: 'SENSOR', position: { x: 85, y: 70 }, layer: 6, isServiceable: true, failureRisk: 'LOW' },
  { id: 'tcu', name: 'Transmission Control Unit', category: 'ELECTRONICS', position: { x: 50, y: 15 }, layer: 1, isServiceable: true, failureRisk: 'LOW', notes: 'Software updates available' },
];

// DCT Parts Template
const DCT_PARTS: GearboxPart[] = [
  { id: 'case-upper', name: 'Transmission Case (Upper)', category: 'CASE', position: { x: 50, y: 5 }, layer: 1, isServiceable: false, failureRisk: 'LOW' },
  { id: 'case-lower', name: 'Transmission Case (Lower)', category: 'CASE', position: { x: 50, y: 95 }, layer: 10, isServiceable: false, failureRisk: 'LOW' },
  { id: 'clutch-odd', name: 'Odd Gear Clutch (1,3,5,7)', category: 'CLUTCH', position: { x: 30, y: 30 }, layer: 2, isServiceable: true, failureRisk: 'HIGH', notes: 'Dry clutch - wear item' },
  { id: 'clutch-even', name: 'Even Gear Clutch (2,4,6)', category: 'CLUTCH', position: { x: 70, y: 30 }, layer: 2, isServiceable: true, failureRisk: 'HIGH', notes: 'Dry clutch - wear item' },
  { id: 'input-shaft-1', name: 'Input Shaft 1 (Hollow)', category: 'GEAR', position: { x: 30, y: 45 }, layer: 3, isServiceable: false, failureRisk: 'LOW' },
  { id: 'input-shaft-2', name: 'Input Shaft 2 (Solid)', category: 'GEAR', position: { x: 70, y: 45 }, layer: 3, isServiceable: false, failureRisk: 'LOW' },
  { id: 'gear-1', name: '1st Gear Set', category: 'GEAR', position: { x: 20, y: 55 }, layer: 4, isServiceable: false, failureRisk: 'LOW' },
  { id: 'gear-2', name: '2nd Gear Set', category: 'GEAR', position: { x: 35, y: 55 }, layer: 4, isServiceable: false, failureRisk: 'LOW' },
  { id: 'gear-3', name: '3rd Gear Set', category: 'GEAR', position: { x: 50, y: 55 }, layer: 4, isServiceable: false, failureRisk: 'LOW' },
  { id: 'gear-4', name: '4th Gear Set', category: 'GEAR', position: { x: 65, y: 55 }, layer: 4, isServiceable: false, failureRisk: 'LOW' },
  { id: 'gear-5', name: '5th Gear Set', category: 'GEAR', position: { x: 80, y: 55 }, layer: 4, isServiceable: false, failureRisk: 'LOW' },
  { id: 'mechatronic', name: 'Mechatronic Unit', category: 'ELECTRONICS', position: { x: 50, y: 75 }, layer: 7, isServiceable: true, failureRisk: 'HIGH', notes: 'Contains TCU + hydraulics' },
  { id: 'fork-assembly', name: 'Shift Fork Assembly', category: 'GEAR', position: { x: 50, y: 65 }, layer: 5, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'diff-assembly', name: 'Differential Assembly', category: 'GEAR', position: { x: 50, y: 85 }, layer: 9, isServiceable: true, failureRisk: 'LOW' },
  { id: 'speed-sensor', name: 'Speed Sensor', category: 'SENSOR', position: { x: 85, y: 60 }, layer: 6, isServiceable: true, failureRisk: 'MEDIUM' },
];

// AT Parts Template
const AT_PARTS: GearboxPart[] = [
  { id: 'case', name: 'Transmission Case', category: 'CASE', position: { x: 50, y: 50 }, layer: 1, isServiceable: false, failureRisk: 'LOW' },
  { id: 'torque-converter', name: 'Torque Converter', category: 'CLUTCH', position: { x: 15, y: 35 }, layer: 2, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'oil-pump', name: 'Oil Pump', category: 'GEAR', position: { x: 25, y: 30 }, layer: 2, isServiceable: true, failureRisk: 'LOW' },
  { id: 'planetary-front', name: 'Front Planetary Gear Set', category: 'GEAR', position: { x: 40, y: 40 }, layer: 3, isServiceable: false, failureRisk: 'LOW' },
  { id: 'planetary-rear', name: 'Rear Planetary Gear Set', category: 'GEAR', position: { x: 60, y: 40 }, layer: 3, isServiceable: false, failureRisk: 'LOW' },
  { id: 'clutch-pack', name: 'Clutch Pack Assembly', category: 'CLUTCH', position: { x: 50, y: 55 }, layer: 4, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'band-brake', name: 'Band Brake', category: 'CLUTCH', position: { x: 75, y: 45 }, layer: 4, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'valve-body', name: 'Valve Body', category: 'VALVE', position: { x: 50, y: 75 }, layer: 7, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'solenoid-a', name: 'Shift Solenoid A', category: 'SOLENOID', position: { x: 35, y: 80 }, layer: 8, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'solenoid-b', name: 'Shift Solenoid B', category: 'SOLENOID', position: { x: 50, y: 80 }, layer: 8, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'solenoid-tcc', name: 'TCC Solenoid', category: 'SOLENOID', position: { x: 65, y: 80 }, layer: 8, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'output-shaft', name: 'Output Shaft', category: 'GEAR', position: { x: 80, y: 50 }, layer: 5, isServiceable: false, failureRisk: 'LOW' },
  { id: 'governor', name: 'Governor Assembly', category: 'VALVE', position: { x: 85, y: 65 }, layer: 6, isServiceable: true, failureRisk: 'LOW' },
];

// Toyota Aisin 8-Speed AT Parts (U880E - Camry, RAV4, etc.)
const TOYOTA_8AT_PARTS: GearboxPart[] = [
  // Case & Housing
  { id: 'case-bell', name: 'Bell Housing', category: 'CASE', position: { x: 10, y: 30 }, layer: 1, isServiceable: false, failureRisk: 'LOW' },
  { id: 'case-main', name: 'Main Case Assembly', category: 'CASE', position: { x: 50, y: 50 }, layer: 1, isServiceable: false, failureRisk: 'LOW' },
  { id: 'case-ext', name: 'Extension Housing', category: 'CASE', position: { x: 90, y: 50 }, layer: 1, isServiceable: false, failureRisk: 'LOW' },
  { id: 'oil-pan', name: 'Transmission Oil Pan', category: 'CASE', position: { x: 50, y: 95 }, layer: 10, isServiceable: true, failureRisk: 'LOW', notes: 'Replace gasket at fluid change' },
  
  // Torque Converter & Input
  { id: 'torque-converter', name: 'Torque Converter w/ Lock-up', category: 'CLUTCH', position: { x: 12, y: 45 }, layer: 2, isServiceable: true, failureRisk: 'MEDIUM', notes: 'Common shudder source - check lock-up clutch' },
  { id: 'flexplate', name: 'Flexplate/Driveplate', category: 'GEAR', position: { x: 5, y: 45 }, layer: 1, isServiceable: true, failureRisk: 'LOW' },
  { id: 'oil-pump', name: 'Oil Pump Assembly', category: 'GEAR', position: { x: 22, y: 40 }, layer: 2, isServiceable: true, failureRisk: 'LOW', notes: 'Variable displacement pump' },
  { id: 'input-shaft', name: 'Input Shaft', category: 'GEAR', position: { x: 30, y: 45 }, layer: 3, isServiceable: false, failureRisk: 'LOW' },
  
  // Planetary Gear Sets (8-speed uses 4 planetary sets)
  { id: 'planetary-1', name: 'Planetary Gear Set #1', category: 'GEAR', position: { x: 35, y: 35 }, layer: 4, isServiceable: false, failureRisk: 'LOW' },
  { id: 'planetary-2', name: 'Planetary Gear Set #2', category: 'GEAR', position: { x: 45, y: 35 }, layer: 4, isServiceable: false, failureRisk: 'LOW' },
  { id: 'planetary-3', name: 'Planetary Gear Set #3', category: 'GEAR', position: { x: 55, y: 35 }, layer: 4, isServiceable: false, failureRisk: 'LOW' },
  { id: 'planetary-4', name: 'Planetary Gear Set #4 (Ravigneaux)', category: 'GEAR', position: { x: 65, y: 35 }, layer: 4, isServiceable: false, failureRisk: 'LOW', notes: 'Compound planetary for 7th/8th gear' },
  
  // Clutch Packs
  { id: 'clutch-c1', name: 'C1 Forward Clutch', category: 'CLUTCH', position: { x: 38, y: 50 }, layer: 5, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'clutch-c2', name: 'C2 Direct Clutch', category: 'CLUTCH', position: { x: 48, y: 50 }, layer: 5, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'clutch-c3', name: 'C3 Underdrive Clutch', category: 'CLUTCH', position: { x: 58, y: 50 }, layer: 5, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'clutch-c4', name: 'C4 Overdrive Clutch', category: 'CLUTCH', position: { x: 68, y: 50 }, layer: 5, isServiceable: true, failureRisk: 'LOW' },
  
  // Brakes
  { id: 'brake-b1', name: 'B1 Coast Brake', category: 'CLUTCH', position: { x: 40, y: 65 }, layer: 5, isServiceable: true, failureRisk: 'LOW' },
  { id: 'brake-b2', name: 'B2 2-6 Brake', category: 'CLUTCH', position: { x: 55, y: 65 }, layer: 5, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'owc-f1', name: 'F1 One-Way Clutch', category: 'CLUTCH', position: { x: 70, y: 65 }, layer: 5, isServiceable: true, failureRisk: 'LOW' },
  
  // Valve Body & Solenoids
  { id: 'valve-body', name: 'Valve Body Assembly', category: 'VALVE', position: { x: 50, y: 80 }, layer: 7, isServiceable: true, failureRisk: 'MEDIUM', notes: 'Contains all shift solenoids and accumulators' },
  { id: 'solenoid-sl1', name: 'SL1 Shift Solenoid (1-2)', category: 'SOLENOID', position: { x: 30, y: 85 }, layer: 8, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'solenoid-sl2', name: 'SL2 Shift Solenoid (2-3)', category: 'SOLENOID', position: { x: 40, y: 85 }, layer: 8, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'solenoid-sl3', name: 'SL3 Shift Solenoid (3-4)', category: 'SOLENOID', position: { x: 50, y: 85 }, layer: 8, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'solenoid-sl4', name: 'SL4 Shift Solenoid (5-6-7-8)', category: 'SOLENOID', position: { x: 60, y: 85 }, layer: 8, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'solenoid-slt', name: 'SLT Line Pressure Solenoid', category: 'SOLENOID', position: { x: 70, y: 85 }, layer: 8, isServiceable: true, failureRisk: 'HIGH', notes: 'Critical - controls all line pressure' },
  { id: 'solenoid-slu', name: 'SLU Lock-up Solenoid', category: 'SOLENOID', position: { x: 80, y: 85 }, layer: 8, isServiceable: true, failureRisk: 'HIGH', notes: 'Common cause of TCC shudder' },
  
  // Output & Differential
  { id: 'output-shaft', name: 'Output Shaft', category: 'GEAR', position: { x: 75, y: 45 }, layer: 6, isServiceable: false, failureRisk: 'LOW' },
  { id: 'park-gear', name: 'Park Gear & Pawl', category: 'GEAR', position: { x: 82, y: 55 }, layer: 6, isServiceable: true, failureRisk: 'LOW' },
  { id: 'diff-assembly', name: 'Differential Assembly', category: 'GEAR', position: { x: 88, y: 45 }, layer: 9, isServiceable: true, failureRisk: 'LOW' },
  
  // Sensors
  { id: 'speed-sensor-in', name: 'Input/Turbine Speed Sensor (NT)', category: 'SENSOR', position: { x: 25, y: 60 }, layer: 6, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'speed-sensor-out', name: 'Output Speed Sensor (SP2)', category: 'SENSOR', position: { x: 78, y: 60 }, layer: 6, isServiceable: true, failureRisk: 'MEDIUM' },
  { id: 'temp-sensor', name: 'ATF Temperature Sensor', category: 'SENSOR', position: { x: 45, y: 90 }, layer: 8, isServiceable: true, failureRisk: 'LOW' },
  { id: 'range-sensor', name: 'Transmission Range Sensor (PNP)', category: 'SENSOR', position: { x: 15, y: 60 }, layer: 6, isServiceable: true, failureRisk: 'MEDIUM', notes: 'Neutral safety switch' },
  
  // Electronics
  { id: 'tcu', name: 'Transmission Control Module', category: 'ELECTRONICS', position: { x: 50, y: 15 }, layer: 1, isServiceable: true, failureRisk: 'LOW', notes: 'Integrated with valve body - Techstream updates available' },
  { id: 'wiring-harness', name: 'Internal Wiring Harness', category: 'ELECTRONICS', position: { x: 35, y: 75 }, layer: 7, isServiceable: true, failureRisk: 'MEDIUM' },
];

// Gearbox Database — 60 entries from Malaysian market data
export const GEARBOX_DATABASE: GearboxInfo[] = [
  // ==================== PERODUA ====================
  {
    id: 'perodua-myvi-15-cvt',
    make: 'Perodua', model: 'Myvi', variant: '1.5', engine: '2NR-VE',
    transmissionType: 'CVT', gearboxFamily: 'Daihatsu Super CVT-i', gearCount: 0,
    manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid TC', fluidCapacity: '6.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Judder at low speed', 'Whining noise', 'Delayed engagement'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'perodua-myvi-13-4at',
    make: 'Perodua', model: 'Myvi', variant: '1.3', engine: '1NR-VE',
    transmissionType: 'AT', gearboxFamily: '4-speed AT', gearCount: 4,
    manufacturer: 'Aisin', fluidType: 'ATF WS', fluidCapacity: '3.5L',
    serviceInterval: '40,000 km',
    commonIssues: ['Harsh 2-3 shift', 'Delayed engagement when cold'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'perodua-axia-10-4at',
    make: 'Perodua', model: 'Axia', variant: '1.0', engine: '1KR-VE',
    transmissionType: 'AT', gearboxFamily: '4-speed AT', gearCount: 4,
    manufacturer: 'Aisin', fluidType: 'ATF WS', fluidCapacity: '3.2L',
    serviceInterval: '40,000 km',
    commonIssues: ['Sluggish upshifts', 'Harsh 1-2 shift when cold'],
    calibrationRisk: 'LOW', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'perodua-axia-12-cvt',
    make: 'Perodua', model: 'Axia', variant: '1.2', engine: '3NR-VE',
    transmissionType: 'CVT', gearboxFamily: 'Super CVT-i', gearCount: 0,
    manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid TC', fluidCapacity: '5.8L',
    serviceInterval: '40,000 km',
    commonIssues: ['Low-speed judder', 'Belt whine at high RPM'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'perodua-bezza-10-4at',
    make: 'Perodua', model: 'Bezza', variant: '1.0', engine: '1KR-VE',
    transmissionType: 'AT', gearboxFamily: '4-speed AT', gearCount: 4,
    manufacturer: 'Aisin', fluidType: 'ATF WS', fluidCapacity: '3.2L',
    serviceInterval: '40,000 km',
    commonIssues: ['Delayed engagement', 'Hunting shifts on hill'],
    calibrationRisk: 'LOW', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'perodua-bezza-13-cvt',
    make: 'Perodua', model: 'Bezza', variant: '1.3', engine: '1NR-VE',
    transmissionType: 'CVT', gearboxFamily: 'Super CVT-i', gearCount: 0,
    manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid TC', fluidCapacity: '5.8L',
    serviceInterval: '40,000 km',
    commonIssues: ['Low-speed judder', 'Drone at highway speed'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'perodua-alza-15-cvt',
    make: 'Perodua', model: 'Alza', variant: '1.5', engine: '2NR-VE',
    transmissionType: 'CVT', gearboxFamily: 'Super CVT-i', gearCount: 0,
    manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid TC', fluidCapacity: '6.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Judder at low speed', 'Whining noise under load'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  // ==================== PROTON ====================
  {
    id: 'proton-saga-mt',
    make: 'Proton', model: 'Saga', variant: 'Standard', engine: '1.3',
    transmissionType: 'MT', gearboxFamily: '5-speed MT', gearCount: 5,
    manufacturer: 'Proton', fluidType: 'GL-4 75W-85', fluidCapacity: '2.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Notchy 2nd gear', 'Clutch judder'],
    calibrationRisk: 'LOW', supportsAdaptiveReset: false, requiresSpecialTool: false,
    parts: [],
  },
  {
    id: 'proton-saga-4at',
    make: 'Proton', model: 'Saga', variant: 'AT', engine: '1.3',
    transmissionType: 'AT', gearboxFamily: '4-speed AT', gearCount: 4,
    manufacturer: 'Punch Powertrain', fluidType: 'ATF Dexron VI', fluidCapacity: '4.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Harsh shifts', 'Delayed engagement'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
    diagramImage: '/assets/camry aisin.png',
  },
  {
    id: 'proton-saga-cvt',
    make: 'Proton', model: 'Saga', variant: '1.3 CVT', engine: '1.3 VVT',
    transmissionType: 'CVT', gearboxFamily: 'Punch CVT', gearCount: 0,
    manufacturer: 'Punch Powertrain', fluidType: 'CVT Fluid NS-3', fluidCapacity: '6.8L',
    serviceInterval: '40,000 km',
    commonIssues: ['Belt slip under load', 'Shudder from standstill', 'Judder at low speed'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'proton-persona-cvt',
    make: 'Proton', model: 'Persona', variant: '1.6', engine: '1.6 VVT',
    transmissionType: 'CVT', gearboxFamily: 'Punch CVT', gearCount: 0,
    manufacturer: 'Punch Powertrain', fluidType: 'CVT Fluid NS-3', fluidCapacity: '7.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Belt slip under load', 'Shudder during acceleration'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'proton-iriz-13-cvt',
    make: 'Proton', model: 'Iriz', variant: '1.3', engine: '1.3 VVT',
    transmissionType: 'CVT', gearboxFamily: 'Punch CVT', gearCount: 0,
    manufacturer: 'Punch Powertrain', fluidType: 'CVT Fluid NS-3', fluidCapacity: '7.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Belt slip under load', 'Shudder from standstill'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'proton-iriz-16-cvt',
    make: 'Proton', model: 'Iriz', variant: '1.6', engine: '1.6 VVT',
    transmissionType: 'CVT', gearboxFamily: 'Punch CVT', gearCount: 0,
    manufacturer: 'Punch Powertrain', fluidType: 'CVT Fluid NS-3', fluidCapacity: '7.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Belt slip under load', 'Hesitation at tip-in'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'proton-x50-7dct',
    make: 'Proton', model: 'X50', variant: '1.5 TGDi', engine: '1.5 TGDi',
    transmissionType: 'DCT', gearboxFamily: 'Getrag 7-speed DCT', gearCount: 7,
    manufacturer: 'Getrag', fluidType: 'DCT Fluid', fluidCapacity: '5.8L',
    serviceInterval: '60,000 km',
    commonIssues: ['Clutch judder', 'Hesitation from stop', 'Mechatronic failure'],
    calibrationRisk: 'CRITICAL', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: DCT_PARTS,
  },
  {
    id: 'proton-x70-8at',
    make: 'Proton', model: 'X70', variant: '1.8 TGDi', engine: '1.8 TGDi',
    transmissionType: 'AT', gearboxFamily: 'Aisin 8-speed AT', gearCount: 8,
    manufacturer: 'Aisin', fluidType: 'ATF WS', fluidCapacity: '8.0L',
    serviceInterval: '60,000 km',
    commonIssues: ['Torque converter shudder', 'Software shift logic issues'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: TOYOTA_8AT_PARTS,
  },
  // ==================== TOYOTA ====================
  {
    id: 'toyota-vios-cvt',
    make: 'Toyota', model: 'Vios', variant: '1.5', engine: '2NR-FE',
    transmissionType: 'CVT', gearboxFamily: 'Toyota K312 CVT', gearCount: 0,
    manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid FE', fluidCapacity: '6.2L',
    serviceInterval: '40,000 km',
    commonIssues: ['Judder at low RPM', 'Drone at highway speed'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'toyota-vios-4at',
    make: 'Toyota', model: 'Vios', variant: '1.5 (older)', engine: '1NZ-FE',
    transmissionType: 'AT', gearboxFamily: '4-speed AT', gearCount: 4,
    manufacturer: 'Aisin', fluidType: 'ATF WS', fluidCapacity: '3.5L',
    serviceInterval: '40,000 km',
    commonIssues: ['Harsh 2-3 shift', 'Torque converter shudder'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'toyota-yaris-cvt',
    make: 'Toyota', model: 'Yaris', variant: '1.5', engine: '2NR-FE',
    transmissionType: 'CVT', gearboxFamily: 'Toyota CVT', gearCount: 0,
    manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid FE', fluidCapacity: '6.2L',
    serviceInterval: '40,000 km',
    commonIssues: ['Low-speed judder', 'CVT whine'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'toyota-corolla-18-cvt',
    make: 'Toyota', model: 'Corolla Altis', variant: '1.8', engine: '2ZR-FE',
    transmissionType: 'CVT', gearboxFamily: 'Toyota CVT', gearCount: 0,
    manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid FE', fluidCapacity: '6.4L',
    serviceInterval: '40,000 km',
    commonIssues: ['Low-speed judder', 'Rubber band effect'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'toyota-corolla-16-4at',
    make: 'Toyota', model: 'Corolla Altis', variant: '1.6', engine: '1ZR-FE',
    transmissionType: 'AT', gearboxFamily: '4-speed AT', gearCount: 4,
    manufacturer: 'Aisin', fluidType: 'ATF WS', fluidCapacity: '3.5L',
    serviceInterval: '40,000 km',
    commonIssues: ['Harsh shifts when cold', 'Delayed 1-2 upshift'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'toyota-prius-ecvt',
    make: 'Toyota', model: 'Prius', variant: '1.8 Hybrid', engine: '2ZR-FXE',
    transmissionType: 'E-CVT', gearboxFamily: 'Toyota e-CVT', gearCount: 0,
    manufacturer: 'Toyota', fluidType: 'Toyota WS ATF', fluidCapacity: '3.7L',
    serviceInterval: '80,000 km',
    commonIssues: ['MG1/MG2 bearing noise', 'Inverter coolant pump failure'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: false, requiresSpecialTool: true,
    parts: CVT_PARTS,
  },
  {
    id: 'toyota-camry-8at',
    make: 'Toyota', model: 'Camry', variant: '2.5', engine: '2AR-FE',
    transmissionType: 'AT', gearboxFamily: 'Aisin U880E 8-Speed', gearCount: 8,
    manufacturer: 'Aisin', fluidType: 'Toyota ATF WS', fluidCapacity: '9.0L',
    serviceInterval: '60,000 km',
    commonIssues: ['Torque converter shudder at low speed', 'Delayed 1-2 upshift when cold', 'Valve body wear after 150k km'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: TOYOTA_8AT_PARTS,
    diagramImage: '/assets/camry aisin.png',
  },
  // ==================== HONDA ====================
  {
    id: 'honda-city-cvt',
    make: 'Honda', model: 'City', variant: '1.5', engine: 'L15B',
    transmissionType: 'CVT', gearboxFamily: 'Honda CVT', gearCount: 0,
    manufacturer: 'Honda', fluidType: 'Honda HCF-2', fluidCapacity: '3.5L',
    serviceInterval: '40,000 km',
    commonIssues: ['Start clutch judder', 'Whine at deceleration'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'honda-civic-15t-cvt',
    make: 'Honda', model: 'Civic', variant: '1.5T', engine: 'L15B7',
    transmissionType: 'CVT', gearboxFamily: 'Honda CVT', gearCount: 0,
    manufacturer: 'Honda', fluidType: 'Honda HCF-2', fluidCapacity: '4.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Turbo lag + CVT hesitation', 'Start clutch judder'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'honda-civic-20-6mt',
    make: 'Honda', model: 'Civic', variant: '2.0 MT', engine: 'R20',
    transmissionType: 'MT', gearboxFamily: '6-speed MT', gearCount: 6,
    manufacturer: 'Honda', fluidType: 'Honda MTF', fluidCapacity: '1.8L',
    serviceInterval: '60,000 km',
    commonIssues: ['Notchy 3rd gear synchro', 'Clutch chatter'],
    calibrationRisk: 'LOW', supportsAdaptiveReset: false, requiresSpecialTool: false,
    parts: [],
  },
  {
    id: 'honda-jazz-cvt',
    make: 'Honda', model: 'Jazz', variant: '1.5', engine: 'L15A',
    transmissionType: 'CVT', gearboxFamily: 'Honda CVT', gearCount: 0,
    manufacturer: 'Honda', fluidType: 'Honda HCF-2', fluidCapacity: '3.5L',
    serviceInterval: '40,000 km',
    commonIssues: ['Start clutch judder', 'Whine under load'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'honda-hrv-cvt',
    make: 'Honda', model: 'HR-V', variant: '1.8', engine: 'R18Z',
    transmissionType: 'CVT', gearboxFamily: 'Honda CVT', gearCount: 0,
    manufacturer: 'Honda', fluidType: 'Honda HCF-2', fluidCapacity: '4.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Start clutch judder', 'CVT drone at highway'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'honda-crv-cvt',
    make: 'Honda', model: 'CR-V', variant: '1.5T', engine: 'L15B7',
    transmissionType: 'CVT', gearboxFamily: 'Honda CVT', gearCount: 0,
    manufacturer: 'Honda', fluidType: 'Honda HCF-2', fluidCapacity: '4.2L',
    serviceInterval: '40,000 km',
    commonIssues: ['Start clutch judder', 'Hesitation under hard accel'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  // ==================== MAZDA ====================
  {
    id: 'mazda-3-6at',
    make: 'Mazda', model: 'Mazda 3', variant: '2.0', engine: 'SkyActiv-G 2.0',
    transmissionType: 'AT', gearboxFamily: 'SkyActiv-Drive 6AT', gearCount: 6,
    manufacturer: 'Mazda', fluidType: 'Mazda ATF FZ', fluidCapacity: '7.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Torque converter shudder', 'Harsh 3-4 shift'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'mazda-cx5-6at',
    make: 'Mazda', model: 'CX-5', variant: '2.0', engine: 'SkyActiv-G 2.0',
    transmissionType: 'AT', gearboxFamily: 'SkyActiv-Drive 6AT', gearCount: 6,
    manufacturer: 'Mazda', fluidType: 'Mazda ATF FZ', fluidCapacity: '7.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Torque converter shudder', 'Delayed downshift'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'mazda-2-6at',
    make: 'Mazda', model: 'Mazda 2', variant: '1.5', engine: 'SkyActiv-G 1.5',
    transmissionType: 'AT', gearboxFamily: 'SkyActiv-Drive 6AT', gearCount: 6,
    manufacturer: 'Mazda', fluidType: 'Mazda ATF FZ', fluidCapacity: '7.0L',
    serviceInterval: '60,000 km',
    commonIssues: ['Harsh low-speed shifts', 'Torque converter vibration'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  // ==================== NISSAN ====================
  {
    id: 'nissan-almera-cvt',
    make: 'Nissan', model: 'Almera', variant: '1.0T', engine: 'HR10DET',
    transmissionType: 'CVT', gearboxFamily: 'Nissan Xtronic CVT', gearCount: 0,
    manufacturer: 'Jatco', fluidType: 'Nissan NS-3', fluidCapacity: '6.5L',
    serviceInterval: '40,000 km',
    commonIssues: ['CVT judder', 'Overheating in traffic', 'Delayed acceleration'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'nissan-xtrail-cvt',
    make: 'Nissan', model: 'X-Trail', variant: '2.5', engine: 'QR25DE',
    transmissionType: 'CVT', gearboxFamily: 'Nissan Xtronic CVT', gearCount: 0,
    manufacturer: 'Jatco', fluidType: 'Nissan NS-3', fluidCapacity: '7.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['CVT overheating', 'Belt slip under heavy load', 'Whining noise'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  // ==================== MITSUBISHI ====================
  {
    id: 'mitsubishi-attrage-cvt',
    make: 'Mitsubishi', model: 'Attrage', variant: '1.2', engine: '3A92',
    transmissionType: 'CVT', gearboxFamily: 'INVECS-III CVT', gearCount: 0,
    manufacturer: 'Jatco', fluidType: 'Mitsubishi CVTF-J4', fluidCapacity: '6.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Belt noise', 'Shudder from standstill'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'mitsubishi-outlander-cvt',
    make: 'Mitsubishi', model: 'Outlander', variant: '2.0', engine: '4J11',
    transmissionType: 'CVT', gearboxFamily: 'INVECS-III CVT', gearCount: 0,
    manufacturer: 'Jatco', fluidType: 'Mitsubishi CVTF-J4', fluidCapacity: '7.5L',
    serviceInterval: '40,000 km',
    commonIssues: ['CVT overheating under tow', 'Belt whine at high speed'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  // ==================== SUBARU ====================
  {
    id: 'subaru-xv-cvt',
    make: 'Subaru', model: 'XV', variant: '2.0', engine: 'FB20',
    transmissionType: 'CVT', gearboxFamily: 'Lineartronic CVT', gearCount: 0,
    manufacturer: 'Subaru', fluidType: 'Subaru CVT Fluid', fluidCapacity: '11.0L',
    serviceInterval: '60,000 km',
    commonIssues: ['Chain noise at cold start', 'Torque converter shudder'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'subaru-forester-cvt',
    make: 'Subaru', model: 'Forester', variant: '2.0', engine: 'FB20',
    transmissionType: 'CVT', gearboxFamily: 'Lineartronic CVT', gearCount: 0,
    manufacturer: 'Subaru', fluidType: 'Subaru CVT Fluid', fluidCapacity: '11.0L',
    serviceInterval: '60,000 km',
    commonIssues: ['Chain noise at cold start', 'Hesitation from stop'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  // ==================== SUZUKI ====================
  {
    id: 'suzuki-swift-4at',
    make: 'Suzuki', model: 'Swift', variant: '1.4', engine: 'K14B',
    transmissionType: 'AT', gearboxFamily: '4-speed AT', gearCount: 4,
    manufacturer: 'Aisin', fluidType: 'ATF Dexron III', fluidCapacity: '4.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Harsh 2-3 shift', 'Delayed engagement when cold'],
    calibrationRisk: 'LOW', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'suzuki-ertiga-4at',
    make: 'Suzuki', model: 'Ertiga', variant: '1.5', engine: 'K15B',
    transmissionType: 'AT', gearboxFamily: '4-speed AT', gearCount: 4,
    manufacturer: 'Aisin', fluidType: 'ATF Dexron III', fluidCapacity: '4.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Hunting shifts on incline', 'Harsh shifts under load'],
    calibrationRisk: 'LOW', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  // ==================== ISUZU ====================
  {
    id: 'isuzu-dmax-30-6at',
    make: 'Isuzu', model: 'D-Max', variant: '3.0', engine: '4JJ3-TCX',
    transmissionType: 'AT', gearboxFamily: '6-speed AT', gearCount: 6,
    manufacturer: 'Aisin', fluidType: 'ATF Type H+', fluidCapacity: '8.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Torque converter shudder', 'Harsh 3-4 shift'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'isuzu-dmax-25-5mt',
    make: 'Isuzu', model: 'D-Max', variant: '2.5', engine: '4JK1-TCH',
    transmissionType: 'MT', gearboxFamily: '5-speed MT', gearCount: 5,
    manufacturer: 'Isuzu', fluidType: 'GL-4 75W-90', fluidCapacity: '2.5L',
    serviceInterval: '40,000 km',
    commonIssues: ['Hard shifting when cold', 'Clutch judder'],
    calibrationRisk: 'LOW', supportsAdaptiveReset: false, requiresSpecialTool: false,
    parts: [],
  },
  // ==================== FORD ====================
  {
    id: 'ford-ranger-22-6at',
    make: 'Ford', model: 'Ranger', variant: '2.2', engine: 'Duratorq 2.2',
    transmissionType: 'AT', gearboxFamily: '6-speed AT', gearCount: 6,
    manufacturer: 'Ford', fluidType: 'Mercon LV', fluidCapacity: '9.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Solenoid body issues', 'Harsh 2-3 shift'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'ford-ranger-32-6at',
    make: 'Ford', model: 'Ranger', variant: '3.2', engine: 'Duratorq 3.2',
    transmissionType: 'AT', gearboxFamily: '6-speed AT', gearCount: 6,
    manufacturer: 'Ford', fluidType: 'Mercon LV', fluidCapacity: '9.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Torque converter shudder', 'Valve body wear'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  // ==================== KIA ====================
  {
    id: 'kia-picanto-4at',
    make: 'Kia', model: 'Picanto', variant: '1.2', engine: 'Kappa 1.2',
    transmissionType: 'AT', gearboxFamily: '4-speed AT', gearCount: 4,
    manufacturer: 'Hyundai-Kia', fluidType: 'ATF SP-IV', fluidCapacity: '4.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Sluggish shifts', 'Hunting on incline'],
    calibrationRisk: 'LOW', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'kia-sportage-6at',
    make: 'Kia', model: 'Sportage', variant: '2.0', engine: 'Nu 2.0',
    transmissionType: 'AT', gearboxFamily: '6-speed AT', gearCount: 6,
    manufacturer: 'Hyundai-Kia', fluidType: 'ATF SP-IV', fluidCapacity: '7.1L',
    serviceInterval: '60,000 km',
    commonIssues: ['Torque converter shudder', 'Harsh shifts when cold'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  // ==================== HYUNDAI ====================
  {
    id: 'hyundai-i10-4at',
    make: 'Hyundai', model: 'i10', variant: '1.2', engine: 'Kappa 1.2',
    transmissionType: 'AT', gearboxFamily: '4-speed AT', gearCount: 4,
    manufacturer: 'Hyundai-Kia', fluidType: 'ATF SP-IV', fluidCapacity: '4.0L',
    serviceInterval: '40,000 km',
    commonIssues: ['Sluggish shifts', 'Delayed engagement'],
    calibrationRisk: 'LOW', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'hyundai-tucson-6at',
    make: 'Hyundai', model: 'Tucson', variant: '2.0', engine: 'Nu 2.0',
    transmissionType: 'AT', gearboxFamily: '6-speed AT', gearCount: 6,
    manufacturer: 'Hyundai-Kia', fluidType: 'ATF SP-IV', fluidCapacity: '7.1L',
    serviceInterval: '60,000 km',
    commonIssues: ['Harsh 1-2 shift', 'Torque converter shudder'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  // ==================== BMW ====================
  {
    id: 'bmw-3series-20-8at',
    make: 'BMW', model: '3 Series', variant: 'F30 320i', engine: 'B48',
    transmissionType: 'AT', gearboxFamily: 'ZF 8HP45', gearCount: 8,
    manufacturer: 'ZF', fluidType: 'ZF Lifeguard 8', fluidCapacity: '9.0L',
    serviceInterval: 'Lifetime (80,000 km recommended)',
    commonIssues: ['Mechatronic sleeve leak', 'Harsh low-speed shifts'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: AT_PARTS,
  },
  {
    id: 'bmw-3series-30-8at',
    make: 'BMW', model: '3 Series', variant: 'F30 330i', engine: 'B48B30',
    transmissionType: 'AT', gearboxFamily: 'ZF 8HP45', gearCount: 8,
    manufacturer: 'ZF', fluidType: 'ZF Lifeguard 8', fluidCapacity: '9.0L',
    serviceInterval: 'Lifetime (80,000 km recommended)',
    commonIssues: ['Mechatronic sleeve leak', 'Shift flare under load'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: AT_PARTS,
  },
  {
    id: 'bmw-5series-20-8at',
    make: 'BMW', model: '5 Series', variant: 'G30 520i', engine: 'B48',
    transmissionType: 'AT', gearboxFamily: 'ZF 8HP45', gearCount: 8,
    manufacturer: 'ZF', fluidType: 'ZF Lifeguard 8', fluidCapacity: '9.0L',
    serviceInterval: 'Lifetime (80,000 km recommended)',
    commonIssues: ['Mechatronic sleeve leak', 'Downshift clunk'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: AT_PARTS,
  },
  {
    id: 'bmw-5series-30-8at',
    make: 'BMW', model: '5 Series', variant: 'G30 530i', engine: 'B48B30',
    transmissionType: 'AT', gearboxFamily: 'ZF 8HP45', gearCount: 8,
    manufacturer: 'ZF', fluidType: 'ZF Lifeguard 8', fluidCapacity: '9.0L',
    serviceInterval: 'Lifetime (80,000 km recommended)',
    commonIssues: ['Mechatronic sleeve leak', 'Harsh coast downshift'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: AT_PARTS,
  },
  // ==================== MERCEDES ====================
  {
    id: 'mercedes-c-9at',
    make: 'Mercedes-Benz', model: 'C-Class', variant: 'W205', engine: 'M274',
    transmissionType: 'AT', gearboxFamily: 'Mercedes 9G-Tronic', gearCount: 9,
    manufacturer: 'Mercedes-Benz', fluidType: 'MB 236.17', fluidCapacity: '8.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Torque converter shudder', 'Software calibration issues'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: AT_PARTS,
  },
  {
    id: 'mercedes-e-9at',
    make: 'Mercedes-Benz', model: 'E-Class', variant: 'W213', engine: 'M274',
    transmissionType: 'AT', gearboxFamily: 'Mercedes 9G-Tronic', gearCount: 9,
    manufacturer: 'Mercedes-Benz', fluidType: 'MB 236.17', fluidCapacity: '8.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Rough downshifts', 'Torque converter shudder at low speed'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: AT_PARTS,
  },
  // ==================== VOLKSWAGEN ====================
  {
    id: 'vw-golf-dsg7',
    make: 'Volkswagen', model: 'Golf', variant: '1.4 TSI', engine: 'EA211',
    transmissionType: 'DCT', gearboxFamily: 'DSG-7 (DQ200)', gearCount: 7,
    manufacturer: 'LuK/VW', fluidType: 'VW G 052 529', fluidCapacity: '1.7L (dry sump)',
    serviceInterval: '60,000 km',
    commonIssues: ['Mechatronic failure', 'Clutch pack wear', 'Flywheel noise'],
    calibrationRisk: 'CRITICAL', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: DCT_PARTS,
  },
  {
    id: 'vw-passat-6at',
    make: 'Volkswagen', model: 'Passat', variant: '1.8T', engine: 'EA888',
    transmissionType: 'AT', gearboxFamily: '6-speed AT', gearCount: 6,
    manufacturer: 'Aisin', fluidType: 'ATF G 055 025', fluidCapacity: '7.0L',
    serviceInterval: '60,000 km',
    commonIssues: ['Torque converter shudder', 'Valve body solenoid wear'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  // ==================== AUDI ====================
  {
    id: 'audi-a4-7dct',
    make: 'Audi', model: 'A4', variant: '2.0T', engine: 'EA888',
    transmissionType: 'DCT', gearboxFamily: 'Audi 7-speed DCT', gearCount: 7,
    manufacturer: 'BorgWarner', fluidType: 'Audi G 052 529', fluidCapacity: '5.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Mechatronic failure', 'Clutch shudder from standstill'],
    calibrationRisk: 'CRITICAL', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: DCT_PARTS,
  },
  {
    id: 'audi-q5-7dct',
    make: 'Audi', model: 'Q5', variant: '2.0T', engine: 'EA888',
    transmissionType: 'DCT', gearboxFamily: 'Audi 7-speed DCT', gearCount: 7,
    manufacturer: 'BorgWarner', fluidType: 'Audi G 052 529', fluidCapacity: '5.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Mechatronic failure', 'Judder in stop-go traffic'],
    calibrationRisk: 'CRITICAL', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: DCT_PARTS,
  },
  // ==================== MINI ====================
  {
    id: 'mini-cooper-s-7dct',
    make: 'Mini', model: 'Cooper S', variant: '2.0T', engine: 'B48',
    transmissionType: 'DCT', gearboxFamily: 'Getrag/ALC 7-speed DCT', gearCount: 7,
    manufacturer: 'Getrag', fluidType: 'DCT Fluid', fluidCapacity: '5.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Clutch judder from standstill', 'Mechatronic solenoid failure'],
    calibrationRisk: 'CRITICAL', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: DCT_PARTS,
  },
  // ==================== PORSCHE ====================
  {
    id: 'porsche-macan-pdk',
    make: 'Porsche', model: 'Macan', variant: '2.0', engine: 'EA888',
    transmissionType: 'PDK', gearboxFamily: 'Porsche PDK', gearCount: 7,
    manufacturer: 'ZF', fluidType: 'Porsche PDK Fluid', fluidCapacity: '8.0L',
    serviceInterval: '60,000 km',
    commonIssues: ['Clutch actuator wear', 'High-RPM shift clunk'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: DCT_PARTS,
  },
  // ==================== LEXUS ====================
  {
    id: 'lexus-nx-6at',
    make: 'Lexus', model: 'NX 300', variant: '2.0T', engine: '8AR-FTS',
    transmissionType: 'AT', gearboxFamily: '6-speed AT', gearCount: 6,
    manufacturer: 'Aisin', fluidType: 'Toyota ATF WS', fluidCapacity: '7.8L',
    serviceInterval: '60,000 km',
    commonIssues: ['Rough downshifts when cold', 'Torque converter vibration'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'lexus-ux-cvt',
    make: 'Lexus', model: 'UX 200', variant: '2.0', engine: 'M20A-FKS',
    transmissionType: 'CVT', gearboxFamily: 'Lexus CVT', gearCount: 0,
    manufacturer: 'Aisin', fluidType: 'Toyota CVT Fluid FE', fluidCapacity: '6.5L',
    serviceInterval: '40,000 km',
    commonIssues: ['Rubber band effect', 'Low-speed judder'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  // ==================== PEUGEOT ====================
  {
    id: 'peugeot-3008-6at',
    make: 'Peugeot', model: '3008', variant: '1.6T', engine: 'EP6',
    transmissionType: 'AT', gearboxFamily: '6-speed AT', gearCount: 6,
    manufacturer: 'Aisin', fluidType: 'ATF AW-1', fluidCapacity: '7.0L',
    serviceInterval: '60,000 km',
    commonIssues: ['Delayed engagement', 'Harsh shifts under load'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  // ==================== VOLVO ====================
  {
    id: 'volvo-xc60-8at',
    make: 'Volvo', model: 'XC60', variant: 'T5 2.0T', engine: 'B4204T23',
    transmissionType: 'AT', gearboxFamily: 'Aisin TG-81SC 8AT', gearCount: 8,
    manufacturer: 'Aisin', fluidType: 'Volvo ATF (Aisin AW-1)', fluidCapacity: '7.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Mechatronics unit failure', 'Torque converter shudder at low speed', 'Delayed cold start engagement'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: AT_PARTS,
  },
  {
    id: 'volvo-xc90-8at',
    make: 'Volvo', model: 'XC90', variant: 'T8 PHEV', engine: 'B4204T35',
    transmissionType: 'AT', gearboxFamily: 'Aisin TG-81SC 8AT + EV module', gearCount: 8,
    manufacturer: 'Aisin', fluidType: 'Volvo ATF (Aisin AW-1)', fluidCapacity: '7.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Hybrid clutch wear', 'Mechatronics unit failure', 'Heat soak in tropical climate'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: AT_PARTS,
  },
  {
    id: 'volvo-xc40-8at',
    make: 'Volvo', model: 'XC40', variant: 'T5 2.0T', engine: 'B4204T47',
    transmissionType: 'AT', gearboxFamily: 'Aisin TG-81SC 8AT', gearCount: 8,
    manufacturer: 'Aisin', fluidType: 'Volvo ATF (Aisin AW-1)', fluidCapacity: '7.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Torque converter shudder', 'Harsh 2-3 upshift when cold'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: AT_PARTS,
  },
  // ==================== TOYOTA (additions) ====================
  {
    id: 'toyota-hilux-6at',
    make: 'Toyota', model: 'Hilux', variant: '2.8 Diesel', engine: '1GD-FTV',
    transmissionType: 'AT', gearboxFamily: 'Aisin AC60F 6AT', gearCount: 6,
    manufacturer: 'Aisin', fluidType: 'Toyota ATF WS', fluidCapacity: '8.2L',
    serviceInterval: '40,000 km',
    commonIssues: ['Torque converter lockup shudder', 'Valve body wear from heavy towing', 'Harsh downshifts under load'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'toyota-fortuner-6at',
    make: 'Toyota', model: 'Fortuner', variant: '2.8 Diesel', engine: '1GD-FTV',
    transmissionType: 'AT', gearboxFamily: 'Aisin AC60F 6AT', gearCount: 6,
    manufacturer: 'Aisin', fluidType: 'Toyota ATF WS', fluidCapacity: '8.2L',
    serviceInterval: '40,000 km',
    commonIssues: ['Torque converter lockup shudder', 'Delayed engagement from cold', 'Kick-down delay'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'toyota-innova-6at',
    make: 'Toyota', model: 'Innova Zenix', variant: '2.0 HEV', engine: 'M20A-FXS',
    transmissionType: 'E-CVT', gearboxFamily: 'Toyota E-CVT (Hybrid)', gearCount: 0,
    manufacturer: 'Toyota', fluidType: 'Toyota Auto Fluid WS', fluidCapacity: '3.7L',
    serviceInterval: '80,000 km',
    commonIssues: ['MG1/MG2 inverter coolant flow', 'Battery cell degradation'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: false, requiresSpecialTool: true,
    parts: CVT_PARTS,
  },
  // ==================== PERODUA (additions) ====================
  {
    id: 'perodua-ativa-cvt',
    make: 'Perodua', model: 'Ativa', variant: '1.0 Turbo', engine: '1KR-VET',
    transmissionType: 'CVT', gearboxFamily: 'Daihatsu D-CVT (split gear)', gearCount: 0,
    manufacturer: 'Daihatsu', fluidType: 'Toyota CVT Fluid TC', fluidCapacity: '5.9L',
    serviceInterval: '40,000 km',
    commonIssues: ['Belt noise under hard acceleration', 'Hesitation from standstill', 'Low-speed judder'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  // ==================== MITSUBISHI (additions) ====================
  {
    id: 'mitsubishi-triton-5at',
    make: 'Mitsubishi', model: 'Triton', variant: '2.4 Diesel', engine: '4N15',
    transmissionType: 'AT', gearboxFamily: 'Aisin A750F 5AT', gearCount: 5,
    manufacturer: 'Aisin', fluidType: 'Mitsubishi DiaQueen ATF SP-III', fluidCapacity: '8.5L',
    serviceInterval: '40,000 km',
    commonIssues: ['Solenoid pack failure', 'Torque converter shudder towing', 'ATF overheating in traffic'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  {
    id: 'mitsubishi-xpander-cvt',
    make: 'Mitsubishi', model: 'Xpander', variant: '1.5', engine: '4A91',
    transmissionType: 'CVT', gearboxFamily: 'Jatco CVT7', gearCount: 0,
    manufacturer: 'Jatco', fluidType: 'Mitsubishi DiaQueen CVTF-J4', fluidCapacity: '6.9L',
    serviceInterval: '40,000 km',
    commonIssues: ['Belt noise under load', 'Judder from standstill', 'CVT fluid overheating in traffic'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  // ==================== NISSAN (additions) ====================
  {
    id: 'nissan-serena-cvt',
    make: 'Nissan', model: 'Serena', variant: '2.0 S-Hybrid', engine: 'MR20DD',
    transmissionType: 'CVT', gearboxFamily: 'Jatco CVT8', gearCount: 0,
    manufacturer: 'Jatco', fluidType: 'Nissan NS-3', fluidCapacity: '7.4L',
    serviceInterval: '40,000 km',
    commonIssues: ['Judder at low speed', 'Overheating in stop-go traffic', 'Belt slip under hard accel'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: CVT_PARTS,
  },
  {
    id: 'nissan-navara-7at',
    make: 'Nissan', model: 'Navara', variant: '2.5 Diesel', engine: 'YD25DDTi',
    transmissionType: 'AT', gearboxFamily: 'Jatco 7AT (JR710E)', gearCount: 7,
    manufacturer: 'Jatco', fluidType: 'Nissan Matic S', fluidCapacity: '9.7L',
    serviceInterval: '40,000 km',
    commonIssues: ['TC lockup shudder', 'Valve body sticking in heat', 'Solenoid failure'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  // ==================== PROTON (additions) ====================
  {
    id: 'proton-x90-7dct',
    make: 'Proton', model: 'X90', variant: '1.5T', engine: '1.5 TGDi',
    transmissionType: 'DCT', gearboxFamily: 'Geely 7DCT (7DCT300)', gearCount: 7,
    manufacturer: 'Geely', fluidType: 'Geely DCT Fluid', fluidCapacity: '5.6L',
    serviceInterval: '40,000 km',
    commonIssues: ['Low-speed jerkiness in traffic', 'Clutch wear from hill starts', 'Overheating in heavy traffic'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: DCT_PARTS,
  },
  // ==================== HYUNDAI (additions) ====================
  {
    id: 'hyundai-kona-7dct',
    make: 'Hyundai', model: 'Kona', variant: '1.6T', engine: 'Gamma 1.6T-GDi',
    transmissionType: 'DCT', gearboxFamily: 'Hyundai 7DCT (D7UF1)', gearCount: 7,
    manufacturer: 'Hyundai Transys', fluidType: 'Hyundai DCT Fluid', fluidCapacity: '5.8L',
    serviceInterval: '60,000 km',
    commonIssues: ['Low-speed shudder', 'Clutch judder from creep', 'Delayed engagement from park'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: DCT_PARTS,
  },
  {
    id: 'hyundai-santa-fe-8at',
    make: 'Hyundai', model: 'Santa Fe', variant: '2.4', engine: 'Theta II 2.4',
    transmissionType: 'AT', gearboxFamily: 'Hyundai A8LF1 8AT', gearCount: 8,
    manufacturer: 'Hyundai Transys', fluidType: 'Hyundai/Kia ATF SP-IV', fluidCapacity: '8.2L',
    serviceInterval: '60,000 km',
    commonIssues: ['Harsh shift 3-4-5 when hot', 'TC lockup shudder', 'Valve body accumulator leak'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
  // ==================== FORD (additions) ====================
  {
    id: 'ford-everest-10at',
    make: 'Ford', model: 'Everest', variant: '2.0 Diesel Bi-Turbo', engine: '2.0 EcoBlue',
    transmissionType: 'AT', gearboxFamily: 'Ford 10R80 10AT', gearCount: 10,
    manufacturer: 'Ford', fluidType: 'Mercon ULV', fluidCapacity: '10.5L',
    serviceInterval: '60,000 km',
    commonIssues: ['Harsh low-speed shifts', 'Shudder in 3rd-4th-5th gears', 'Adaptive learning slow after reset'],
    calibrationRisk: 'HIGH', supportsAdaptiveReset: true, requiresSpecialTool: true,
    parts: AT_PARTS,
  },
  // ==================== ISUZU (additions) ====================
  {
    id: 'isuzu-mu-x-6at',
    make: 'Isuzu', model: 'MU-X', variant: '3.0 Diesel', engine: '4JJ3-TCX',
    transmissionType: 'AT', gearboxFamily: 'Aisin A760H 6AT', gearCount: 6,
    manufacturer: 'Aisin', fluidType: 'Isuzu ATF Type II', fluidCapacity: '8.8L',
    serviceInterval: '40,000 km',
    commonIssues: ['Shift flare 2-3', 'Torque converter lockup vibration', 'Harsh downshift when braking'],
    calibrationRisk: 'MODERATE', supportsAdaptiveReset: true, requiresSpecialTool: false,
    parts: AT_PARTS,
  },
];

// Map VIN decoder transmission types to gearbox database transmission families
const TRANS_TYPE_MAP: Record<string, TransmissionFamily[]> = {
  'AUTOMATIC': ['AT'],
  'MANUAL': ['MT'],
  'CVT': ['CVT', 'E-CVT'],
  'DCT': ['DCT', 'PDK'],
};

// Lookup function
export function findGearboxByVehicle(make: string, model: string, engine?: string, transmissionType?: string): GearboxInfo | null {
  const makeLower = make.toLowerCase();
  const modelLower = model.toLowerCase();
  
  // First try: match make + model + transmission type (most accurate)
  if (transmissionType) {
    const allowedFamilies = TRANS_TYPE_MAP[transmissionType] || [transmissionType as TransmissionFamily];
    const transMatch = GEARBOX_DATABASE.find(gb => {
      const matchMake = gb.make.toLowerCase().includes(makeLower) || makeLower.includes(gb.make.toLowerCase());
      const matchModel = gb.model.toLowerCase().includes(modelLower) || modelLower.includes(gb.model.toLowerCase());
      const matchTrans = allowedFamilies.includes(gb.transmissionType);
      const engLower = engine?.toLowerCase() || '';
      const gbEngLower = gb.engine.toLowerCase();
      const matchEngine = !engine || gbEngLower.includes(engLower) || engLower.includes(gbEngLower);
      return matchMake && matchModel && matchTrans && matchEngine;
    });
    if (transMatch) return transMatch;

    // Fallback: match make + model + transmission (without engine)
    const transOnlyMatch = GEARBOX_DATABASE.find(gb => {
      const matchMake = gb.make.toLowerCase().includes(makeLower) || makeLower.includes(gb.make.toLowerCase());
      const matchModel = gb.model.toLowerCase().includes(modelLower) || modelLower.includes(gb.model.toLowerCase());
      const matchTrans = allowedFamilies.includes(gb.transmissionType);
      return matchMake && matchModel && matchTrans;
    });
    if (transOnlyMatch) return transOnlyMatch;
  }

  // Fallback: match make + model + engine (no transmission filter)
  return GEARBOX_DATABASE.find(gb => {
    const matchMake = gb.make.toLowerCase().includes(makeLower) || makeLower.includes(gb.make.toLowerCase());
    const matchModel = gb.model.toLowerCase().includes(modelLower) || modelLower.includes(gb.model.toLowerCase());
    const engLower = engine?.toLowerCase() || '';
    const gbEngLower = gb.engine.toLowerCase();
    const matchEngine = !engine || gbEngLower.includes(engLower) || engLower.includes(gbEngLower);
    return matchMake && matchModel && matchEngine;
  }) || null;
}

// Get parts by category
export function getPartsByCategory(gearbox: GearboxInfo, category: GearboxPart['category']): GearboxPart[] {
  return gearbox.parts.filter(p => p.category === category);
}

// Get high-risk parts
export function getHighRiskParts(gearbox: GearboxInfo): GearboxPart[] {
  return gearbox.parts.filter(p => p.failureRisk === 'HIGH');
}
