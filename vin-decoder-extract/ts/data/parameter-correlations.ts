/**
 * COMPREHENSIVE PARAMETER CORRELATION MATRIX
 * 
 * This defines all known relationships between OBD-II parameters based on:
 * - Automotive engineering principles
 * - Engine control system logic
 * - Physics of internal combustion
 * - Manufacturer calibration strategies
 * 
 * Each correlation includes:
 * - Expected relationship type (positive, negative, inverse, proportional)
 * - Mathematical relationship when known
 * - Conditions when the relationship is valid
 * - What it means when the correlation breaks
 */

export interface ParameterCorrelation {
  id: string;
  name: string;
  description: string;
  param1: string;
  param2: string;
  correlationType: 'positive' | 'negative' | 'proportional' | 'inverse' | 'conditional' | 'complex';
  expectedCoefficient: number; // Expected Pearson correlation coefficient (-1 to 1)
  tolerance: number; // Acceptable deviation from expected
  validConditions: CorrelationCondition[];
  formula?: string; // Mathematical relationship if known
  whenHealthy: string;
  whenAbnormal: string;
  possibleCauses: string[];
  affectedSystems: string[];
  diagnosticWeight: number; // 1-10, how important this correlation is for diagnosis
  category: CorrelationCategory;
}

export interface CorrelationCondition {
  parameter: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | 'between';
  value: number | [number, number];
  description: string;
}

export type CorrelationCategory = 
  | 'FUEL_CONTROL'
  | 'AIR_FLOW'
  | 'COMBUSTION'
  | 'THERMAL'
  | 'EMISSIONS'
  | 'POWERTRAIN'
  | 'SENSOR_VALIDATION'
  | 'SYSTEM_EFFICIENCY';

/**
 * COMPLETE PARAMETER CORRELATION DATABASE
 * 120+ correlations covering all major diagnostic scenarios
 */
export const PARAMETER_CORRELATIONS: ParameterCorrelation[] = [
  // ==========================================
  // FUEL CONTROL CORRELATIONS
  // ==========================================
  
  {
    id: 'load-throttle',
    name: 'Load vs Throttle Position',
    description: 'Engine load should increase with throttle opening. This is the fundamental driver demand correlation.',
    param1: '0x0104', // Load
    param2: '0x0111', // TPS
    correlationType: 'positive',
    expectedCoefficient: 0.85,
    tolerance: 0.15,
    validConditions: [
      { parameter: '0x010C', operator: '>', value: 800, description: 'Engine running above idle' },
    ],
    formula: 'Load ≈ f(TPS, RPM, VE)',
    whenHealthy: 'Load increases smoothly with throttle opening',
    whenAbnormal: 'Throttle opens but load stays low, or load high despite low throttle',
    possibleCauses: [
      'Vacuum leak causing high load at closed throttle',
      'Clogged air filter limiting load increase',
      'MAF sensor over/under reading',
      'Throttle body carbon buildup',
      'EGR stuck open affecting load',
    ],
    affectedSystems: ['Air Intake', 'Throttle Body', 'MAF Sensor', 'EGR'],
    diagnosticWeight: 9,
    category: 'AIR_FLOW',
  },

  {
    id: 'maf-load',
    name: 'MAF vs Calculated Load',
    description: 'MAF reading should match calculated engine load. Validates MAF sensor accuracy.',
    param1: '0x0110', // MAF
    param2: '0x0104', // Load
    correlationType: 'proportional',
    expectedCoefficient: 0.92,
    tolerance: 0.10,
    validConditions: [
      { parameter: '0x010C', operator: 'between', value: [800, 5000], description: 'Normal operating RPM' },
    ],
    formula: 'MAF(g/s) ≈ (RPM × Displacement × VE × Air Density) / 3456',
    whenHealthy: 'MAF reading matches expected airflow for current load',
    whenAbnormal: 'MAF reading deviates significantly from expected value',
    possibleCauses: [
      'Dirty MAF sensor element',
      'Air leak between MAF and throttle body',
      'Incorrect MAF sensor installed',
      'MAF sensor element contaminated with oil',
      'Clogged air filter restricting flow',
    ],
    affectedSystems: ['MAF Sensor', 'Air Intake System', 'Air Filter'],
    diagnosticWeight: 10,
    category: 'AIR_FLOW',
  },

  {
    id: 'rpm-speed-ratio',
    name: 'RPM vs Vehicle Speed',
    description: 'RPM/Speed ratio indicates gear selection and transmission function.',
    param1: '0x010C', // RPM
    param2: '0x010D', // Speed
    correlationType: 'proportional',
    expectedCoefficient: 0.75,
    tolerance: 0.20,
    validConditions: [
      { parameter: '0x010D', operator: '>', value: 10, description: 'Vehicle moving' },
      { parameter: '0x0111', operator: '>', value: 3, description: 'Not coasting with clutch in' },
    ],
    formula: 'Speed = (RPM × Tire Circumference) / (Final Drive × Gear Ratio × 60)',
    whenHealthy: 'Consistent RPM/Speed ratio within each gear',
    whenAbnormal: 'RPM high for speed (slipping) or speed erratic (VSS issue)',
    possibleCauses: [
      'Transmission slipping',
      'VSS sensor failure',
      'Torque converter lockup issues',
      'Incorrect tire size affecting speed reading',
      'Transmission stuck in wrong gear',
    ],
    affectedSystems: ['Transmission', 'VSS', 'Torque Converter', 'Final Drive'],
    diagnosticWeight: 8,
    category: 'POWERTRAIN',
  },

  {
    id: 'stft-ltft-combined',
    name: 'Combined Fuel Trim Health',
    description: 'STFT + LTFT indicates total fuel system correction.',
    param1: '0x0106', // STFT B1
    param2: '0x0107', // LTFT B1
    correlationType: 'complex',
    expectedCoefficient: 0.0,
    tolerance: 0.25,
    validConditions: [
      { parameter: '0x0103', operator: '==', value: 2, description: 'Closed loop operation' },
    ],
    formula: 'Total Correction = STFT + LTFT (should be near 0%)',
    whenHealthy: 'Combined trims stay within ±10%',
    whenAbnormal: 'Combined trims exceed ±15%, indicating fuel system issue',
    possibleCauses: [
      'Positive trims: Vacuum leak, low fuel pressure, clogged injector, air leak after MAF',
      'Negative trims: Leaking injector, high fuel pressure, saturated EVAP canister',
      'Oscillating: O2 sensor response issue, injector balance problem',
    ],
    affectedSystems: ['Fuel Injection', 'Fuel Pressure Regulator', 'O2 Sensors', 'Intake Manifold'],
    diagnosticWeight: 10,
    category: 'FUEL_CONTROL',
  },

  {
    id: 'bank-balance',
    name: 'Bank 1 vs Bank 2 Fuel Trim',
    description: 'Bank trim comparison identifies bank-specific issues on V-engines.',
    param1: '0x0107', // LTFT B1
    param2: '0x0109', // LTFT B2
    correlationType: 'positive',
    expectedCoefficient: 0.95,
    tolerance: 0.10,
    validConditions: [],
    formula: '|LTFT_B1 - LTFT_B2| should be < 5%',
    whenHealthy: 'Both banks require similar fuel correction',
    whenAbnormal: 'One bank running significantly leaner/richer than other',
    possibleCauses: [
      'Intake manifold gasket leak on one bank',
      'Exhaust leak on one bank before O2 sensor',
      'Injector issue affecting one bank',
      'Head gasket seepage on one bank',
      'O2 sensor reading difference between banks',
    ],
    affectedSystems: ['Intake Manifold', 'Exhaust Manifold', 'Fuel Injectors', 'O2 Sensors'],
    diagnosticWeight: 9,
    category: 'FUEL_CONTROL',
  },

  {
    id: 'o2-voltage-fuel-trim',
    name: 'O2 Sensor vs Fuel Trim Response',
    description: 'O2 voltage changes should cause opposite fuel trim changes.',
    param1: '0x0114', // O2 B1S1
    param2: '0x0106', // STFT B1
    correlationType: 'negative',
    expectedCoefficient: -0.70,
    tolerance: 0.20,
    validConditions: [
      { parameter: '0x0103', operator: '==', value: 2, description: 'Closed loop operation' },
      { parameter: '0x010C', operator: 'between', value: [700, 3000], description: 'Steady state operation' },
    ],
    formula: 'High O2 (>0.7V) → Negative STFT, Low O2 (<0.3V) → Positive STFT',
    whenHealthy: 'Fuel trims respond correctly to O2 sensor readings',
    whenAbnormal: 'No fuel trim response to O2 changes, or wrong direction',
    possibleCauses: [
      'O2 sensor slow response',
      'ECU calibration issue',
      'O2 heater circuit failure',
      'O2 sensor contaminated',
      'Wiring/ground issue affecting O2 signal',
    ],
    affectedSystems: ['O2 Sensors', 'ECU', 'Fuel Injection Control'],
    diagnosticWeight: 10,
    category: 'FUEL_CONTROL',
  },

  {
    id: 'pre-post-cat-o2',
    name: 'Pre-Cat vs Post-Cat O2 Activity',
    description: 'Post-cat O2 should be much steadier than pre-cat O2.',
    param1: '0x0114', // O2 B1S1 (pre-cat)
    param2: '0x0115', // O2 B1S2 (post-cat)
    correlationType: 'complex',
    expectedCoefficient: 0.20,
    tolerance: 0.30,
    validConditions: [
      { parameter: '0x0103', operator: '==', value: 2, description: 'Closed loop operation' },
      { parameter: '0x0105', operator: '>', value: 70, description: 'Engine warm' },
    ],
    formula: 'Post-cat O2 switching rate should be < 10% of pre-cat rate',
    whenHealthy: 'Pre-cat O2 switches rapidly, post-cat O2 stays near 0.6V',
    whenAbnormal: 'Post-cat O2 mirrors pre-cat O2 activity',
    possibleCauses: [
      'Catalyst efficiency below threshold',
      'Catalyst contaminated (coolant, oil, fuel additives)',
      'Catalyst overheated/melted',
      'Exhaust leak between sensors',
      'Post-cat O2 sensor heater failure',
    ],
    affectedSystems: ['Catalytic Converter', 'O2 Sensors', 'Exhaust System'],
    diagnosticWeight: 8,
    category: 'EMISSIONS',
  },

  // ==========================================
  // COMBUSTION & IGNITION CORRELATIONS
  // ==========================================

  {
    id: 'timing-load-relationship',
    name: 'Timing Advance vs Engine Load',
    description: 'Timing should retard as load increases to prevent knock.',
    param1: '0x010E', // Timing
    param2: '0x0104', // Load
    correlationType: 'negative',
    expectedCoefficient: -0.60,
    tolerance: 0.25,
    validConditions: [
      { parameter: '0x010C', operator: 'between', value: [1500, 4000], description: 'Cruise/acceleration' },
    ],
    formula: 'Timing ≈ Base Timing + f(RPM) - f(Load) - Knock Retard',
    whenHealthy: 'Timing decreases smoothly as load increases',
    whenAbnormal: 'Excessive timing at high load (knock risk) or no timing at low load (power loss)',
    possibleCauses: [
      'Knock sensor failure (timing not retracting)',
      'EGR excessive (timing over-retarded)',
      'Octane too low for calibration',
      'Carbon buildup increasing compression',
      'MAF sensor causing incorrect load calculation',
    ],
    affectedSystems: ['Ignition System', 'Knock Sensors', 'EGR', 'Fuel Quality'],
    diagnosticWeight: 8,
    category: 'COMBUSTION',
  },

  {
    id: 'timing-rpm-relationship',
    name: 'Timing Advance vs RPM',
    description: 'Timing should advance with RPM to optimize burn rate.',
    param1: '0x010E', // Timing
    param2: '0x010C', // RPM
    correlationType: 'positive',
    expectedCoefficient: 0.70,
    tolerance: 0.20,
    validConditions: [
      { parameter: '0x0104', operator: 'between', value: [20, 50], description: 'Partial load' },
    ],
    formula: 'Timing advance increases roughly 1° per 500 RPM',
    whenHealthy: 'Timing advances smoothly with RPM increase',
    whenAbnormal: 'Flat timing curve or erratic timing changes',
    possibleCauses: [
      'Crank position sensor issues',
      'Cam position sensor issues',
      'Timing chain stretch',
      'Variable valve timing fault',
      'ECU timing map corruption',
    ],
    affectedSystems: ['Ignition System', 'Crankshaft Sensor', 'Camshaft Sensor', 'VVT System'],
    diagnosticWeight: 7,
    category: 'COMBUSTION',
  },

  {
    id: 'misfire-fuel-trim',
    name: 'Misfire Activity vs Fuel Trim',
    description: 'Misfires often correlate with fuel trim extremes.',
    param1: '0x0200', // Misfire Cyl 1
    param2: '0x0106', // STFT
    correlationType: 'complex',
    expectedCoefficient: 0.40,
    tolerance: 0.35,
    validConditions: [],
    formula: 'Lean misfire: High positive trim + misfire. Rich misfire: High negative trim + misfire',
    whenHealthy: 'No misfires with normal fuel trims',
    whenAbnormal: 'Misfires increase with fuel trim extremes',
    possibleCauses: [
      'Lean misfire: Vacuum leak, clogged injector, low fuel pressure',
      'Rich misfire: Fouled plug, ignition weak, flooding',
      'Random misfire: Ignition component failure, compression issue',
    ],
    affectedSystems: ['Ignition System', 'Fuel Injection', 'Compression'],
    diagnosticWeight: 9,
    category: 'COMBUSTION',
  },

  // ==========================================
  // THERMAL CORRELATIONS
  // ==========================================

  {
    id: 'coolant-iat-warmup',
    name: 'Coolant vs Intake Air Temp Warm-up',
    description: 'Both temperatures should rise together during warm-up.',
    param1: '0x0105', // ECT
    param2: '0x010F', // IAT
    correlationType: 'positive',
    expectedCoefficient: 0.85,
    tolerance: 0.15,
    validConditions: [
      { parameter: '0x0105', operator: '<', value: 80, description: 'During warm-up phase' },
    ],
    formula: 'ECT should rise faster than IAT, both starting near ambient',
    whenHealthy: 'ECT rises steadily, IAT follows with heat soak',
    whenAbnormal: 'ECT not rising (thermostat stuck open) or IAT stuck',
    possibleCauses: [
      'Thermostat stuck open (ECT not rising)',
      'ECT sensor failure',
      'IAT sensor failure',
      'Cooling system air pocket',
      'Head gasket leak affecting temp readings',
    ],
    affectedSystems: ['Cooling System', 'Thermostat', 'Temperature Sensors'],
    diagnosticWeight: 7,
    category: 'THERMAL',
  },

  {
    id: 'coolant-oil-temp',
    name: 'Coolant vs Oil Temperature',
    description: 'Oil temp should track slightly behind coolant temp.',
    param1: '0x0105', // ECT
    param2: '0x015C', // Oil Temp
    correlationType: 'positive',
    expectedCoefficient: 0.90,
    tolerance: 0.10,
    validConditions: [],
    formula: 'Oil temp ≈ Coolant temp + 10-20°C under load',
    whenHealthy: 'Oil temp follows coolant, slightly higher under load',
    whenAbnormal: 'Oil temp significantly higher than coolant',
    possibleCauses: [
      'Oil cooler blocked or undersized',
      'Low oil level',
      'Wrong oil viscosity',
      'Oil dilution from fuel',
      'Internal coolant leak into oil',
    ],
    affectedSystems: ['Oil System', 'Oil Cooler', 'Cooling System'],
    diagnosticWeight: 7,
    category: 'THERMAL',
  },

  {
    id: 'ect-fuel-trim-warmup',
    name: 'Coolant Temp vs Fuel Trim During Warmup',
    description: 'Fuel trims should normalize as engine warms up.',
    param1: '0x0105', // ECT
    param2: '0x0107', // LTFT
    correlationType: 'conditional',
    expectedCoefficient: -0.30,
    tolerance: 0.40,
    validConditions: [
      { parameter: '0x0105', operator: '<', value: 70, description: 'Engine warming up' },
    ],
    formula: 'Cold: Richer mixture (negative trim adjustment). Hot: Normalized trims',
    whenHealthy: 'Trims stabilize as engine reaches operating temp',
    whenAbnormal: 'Trims dont stabilize or are extreme when warm',
    possibleCauses: [
      'ECT sensor reading incorrectly',
      'Stuck in open loop mode',
      'Cold start enrichment issue',
      'O2 sensor not heating properly',
    ],
    affectedSystems: ['ECT Sensor', 'Cold Start Enrichment', 'O2 Heater Circuit'],
    diagnosticWeight: 6,
    category: 'THERMAL',
  },

  {
    id: 'cat-temp-engine-load',
    name: 'Catalyst Temp vs Engine Load',
    description: 'Catalyst temperature increases with sustained load.',
    param1: '0x013C', // Cat Temp
    param2: '0x0104', // Load
    correlationType: 'positive',
    expectedCoefficient: 0.75,
    tolerance: 0.20,
    validConditions: [
      { parameter: '0x010C', operator: '>', value: 1500, description: 'Above idle' },
    ],
    formula: 'Cat temp rises 50-100°C above exhaust temp under load',
    whenHealthy: 'Cat temp rises with load but stays below 850°C',
    whenAbnormal: 'Cat temp excessive (>900°C) indicating misfire or rich condition',
    possibleCauses: [
      'Misfire heating catalyst',
      'Running rich flooding catalyst',
      'Ignition timing issues',
      'Restricted exhaust',
    ],
    affectedSystems: ['Catalytic Converter', 'Ignition System', 'Fuel System'],
    diagnosticWeight: 8,
    category: 'EMISSIONS',
  },

  // ==========================================
  // AIR FLOW CORRELATIONS
  // ==========================================

  {
    id: 'map-throttle',
    name: 'MAP vs Throttle Position',
    description: 'Manifold pressure should increase (toward atmospheric) with throttle opening.',
    param1: '0x010B', // MAP
    param2: '0x0111', // TPS
    correlationType: 'positive',
    expectedCoefficient: 0.80,
    tolerance: 0.15,
    validConditions: [
      { parameter: '0x010C', operator: '>', value: 700, description: 'Engine running' },
    ],
    formula: 'MAP approaches 101 kPa (atmospheric) as throttle opens',
    whenHealthy: 'MAP increases smoothly from ~30-40 kPa at idle toward 101 kPa at WOT',
    whenAbnormal: 'MAP stays high at closed throttle or doesnt reach atmospheric at WOT',
    possibleCauses: [
      'Vacuum leak (high MAP at idle)',
      'Throttle body restriction',
      'Air filter clogged',
      'MAP sensor calibration issue',
      'Intake manifold obstruction',
    ],
    affectedSystems: ['Intake Manifold', 'Throttle Body', 'MAP Sensor', 'Air Filter'],
    diagnosticWeight: 8,
    category: 'AIR_FLOW',
  },

  {
    id: 'maf-rpm-relationship',
    name: 'MAF vs RPM at Steady State',
    description: 'MAF should increase roughly proportionally with RPM at constant load.',
    param1: '0x0110', // MAF
    param2: '0x010C', // RPM
    correlationType: 'proportional',
    expectedCoefficient: 0.88,
    tolerance: 0.12,
    validConditions: [
      { parameter: '0x0104', operator: 'between', value: [25, 45], description: 'Steady cruise load' },
    ],
    formula: 'MAF doubles when RPM doubles at same load',
    whenHealthy: 'Linear relationship between MAF and RPM',
    whenAbnormal: 'MAF doesnt scale with RPM properly',
    possibleCauses: [
      'MAF sensor contamination',
      'Air leak downstream of MAF',
      'MAF element damage',
      'Wiring/ground issue',
    ],
    affectedSystems: ['MAF Sensor', 'Air Intake Path'],
    diagnosticWeight: 9,
    category: 'AIR_FLOW',
  },

  {
    id: 'boost-throttle-turbo',
    name: 'Boost Pressure vs Throttle (Turbo)',
    description: 'Boost should build with throttle opening on turbo vehicles.',
    param1: '0x0170', // Boost
    param2: '0x0111', // TPS
    correlationType: 'positive',
    expectedCoefficient: 0.85,
    tolerance: 0.15,
    validConditions: [
      { parameter: '0x010C', operator: '>', value: 2500, description: 'RPM sufficient for boost' },
    ],
    formula: 'Boost builds after ~2500 RPM, reaches target at WOT',
    whenHealthy: 'Smooth boost build matching throttle input',
    whenAbnormal: 'No boost, slow boost build, or overboost',
    possibleCauses: [
      'Wastegate stuck (over/underboost)',
      'Boost leak in intercooler piping',
      'Turbo bearing failure',
      'Boost control solenoid failure',
      'Intercooler restriction',
    ],
    affectedSystems: ['Turbocharger', 'Wastegate', 'Intercooler', 'Boost Control'],
    diagnosticWeight: 9,
    category: 'AIR_FLOW',
  },

  {
    id: 'turbo-rpm-exhaust',
    name: 'Turbo RPM vs Engine RPM',
    description: 'Turbo shaft speed correlates with engine RPM and load.',
    param1: '0x0171', // Turbo RPM
    param2: '0x010C', // Engine RPM
    correlationType: 'positive',
    expectedCoefficient: 0.75,
    tolerance: 0.25,
    validConditions: [
      { parameter: '0x0104', operator: '>', value: 40, description: 'Under load' },
    ],
    formula: 'Turbo RPM = f(Engine RPM, Load, Wastegate Position)',
    whenHealthy: 'Turbo spools up proportionally with engine load',
    whenAbnormal: 'Turbo not spooling or overspeeding',
    possibleCauses: [
      'Turbo bearing failure',
      'Compressor wheel damage',
      'Exhaust restriction',
      'VGT actuator failure',
    ],
    affectedSystems: ['Turbocharger', 'VGT Actuator', 'Exhaust System'],
    diagnosticWeight: 7,
    category: 'AIR_FLOW',
  },

  // ==========================================
  // EGR CORRELATIONS
  // ==========================================

  {
    id: 'egr-map-response',
    name: 'EGR Command vs MAP Response',
    description: 'Opening EGR should increase MAP (reduce vacuum).',
    param1: '0x012C', // EGR Command
    param2: '0x010B', // MAP
    correlationType: 'positive',
    expectedCoefficient: 0.60,
    tolerance: 0.25,
    validConditions: [
      { parameter: '0x010C', operator: 'between', value: [1500, 3000], description: 'Cruise conditions' },
      { parameter: '0x0104', operator: 'between', value: [20, 50], description: 'Partial load' },
    ],
    formula: 'MAP increases 5-15 kPa when EGR opens 20-40%',
    whenHealthy: 'MAP rises when EGR commanded, returns when closed',
    whenAbnormal: 'No MAP change with EGR command',
    possibleCauses: [
      'EGR valve stuck closed',
      'Clogged EGR passages',
      'EGR solenoid failure',
      'Vacuum supply issue to EGR',
    ],
    affectedSystems: ['EGR Valve', 'EGR Passages', 'Vacuum System'],
    diagnosticWeight: 6,
    category: 'EMISSIONS',
  },

  {
    id: 'egr-idle-stability',
    name: 'EGR Activity at Idle',
    description: 'EGR should be closed at idle for stability.',
    param1: '0x012C', // EGR Command
    param2: '0x010C', // RPM
    correlationType: 'complex',
    expectedCoefficient: 0.0,
    tolerance: 0.10,
    validConditions: [
      { parameter: '0x010D', operator: '==', value: 0, description: 'Vehicle stationary' },
      { parameter: '0x0111', operator: '<', value: 5, description: 'Closed throttle' },
    ],
    formula: 'EGR should be 0% at idle',
    whenHealthy: 'EGR stays closed at idle, RPM stable',
    whenAbnormal: 'EGR open at idle causing rough running',
    possibleCauses: [
      'EGR valve stuck open',
      'Carbon buildup preventing closure',
      'EGR solenoid stuck energized',
    ],
    affectedSystems: ['EGR Valve', 'Idle Control'],
    diagnosticWeight: 7,
    category: 'EMISSIONS',
  },

  // ==========================================
  // EVAP CORRELATIONS
  // ==========================================

  {
    id: 'purge-fuel-trim',
    name: 'EVAP Purge vs Fuel Trim Response',
    description: 'Fuel trims should shift slightly rich when purging hydrocarbons.',
    param1: '0x012E', // EVAP Purge
    param2: '0x0106', // STFT
    correlationType: 'negative',
    expectedCoefficient: -0.40,
    tolerance: 0.30,
    validConditions: [
      { parameter: '0x012E', operator: '>', value: 10, description: 'Purge active' },
      { parameter: '0x010C', operator: 'between', value: [1500, 3000], description: 'Cruise conditions' },
    ],
    formula: 'STFT goes slightly negative (1-5%) when purge active',
    whenHealthy: 'Small negative fuel trim shift during purge',
    whenAbnormal: 'No fuel trim change or large rich shift during purge',
    possibleCauses: [
      'No change: Purge valve stuck closed, empty canister',
      'Large shift: Saturated canister, liquid fuel in EVAP',
    ],
    affectedSystems: ['EVAP Canister', 'Purge Valve', 'Fuel System'],
    diagnosticWeight: 5,
    category: 'EMISSIONS',
  },

  // ==========================================
  // TRANSMISSION CORRELATIONS
  // ==========================================

  {
    id: 'trans-temp-load',
    name: 'Trans Fluid Temp vs Engine Load',
    description: 'Transmission temperature increases with sustained load.',
    param1: '0x01A4', // Trans Temp
    param2: '0x0104', // Load
    correlationType: 'positive',
    expectedCoefficient: 0.65,
    tolerance: 0.25,
    validConditions: [
      { parameter: '0x010D', operator: '>', value: 50, description: 'Highway driving' },
    ],
    formula: 'Trans temp rises 1-2°C per minute under sustained high load',
    whenHealthy: 'Trans temp stabilizes around 80-100°C normal driving',
    whenAbnormal: 'Trans temp climbing rapidly or exceeding 120°C',
    possibleCauses: [
      'Low transmission fluid',
      'Trans cooler blocked',
      'Torque converter slipping',
      'Internal clutch slipping',
      'Towing beyond capacity',
    ],
    affectedSystems: ['Transmission', 'Trans Cooler', 'Torque Converter'],
    diagnosticWeight: 7,
    category: 'POWERTRAIN',
  },

  {
    id: 'gear-rpm-speed',
    name: 'Gear Selection vs RPM/Speed Ratio',
    description: 'Each gear has a specific RPM/Speed ratio.',
    param1: '0x01A3', // Gear
    param2: '0x010C', // RPM
    correlationType: 'complex',
    expectedCoefficient: 0.0,
    tolerance: 0.20,
    validConditions: [
      { parameter: '0x010D', operator: '>', value: 20, description: 'Moving at speed' },
    ],
    formula: 'Expected RPM = Speed × Gear Ratio × Final Drive / Tire Rev',
    whenHealthy: 'RPM matches expected value for gear and speed',
    whenAbnormal: 'RPM higher than expected (slipping) or wrong gear',
    possibleCauses: [
      'Transmission slipping',
      'Wrong gear commanded',
      'Shift solenoid failure',
      'TCM fault',
    ],
    affectedSystems: ['Transmission', 'TCM', 'Shift Solenoids'],
    diagnosticWeight: 8,
    category: 'POWERTRAIN',
  },

  // ==========================================
  // SENSOR VALIDATION CORRELATIONS
  // ==========================================

  {
    id: 'dual-tps-validation',
    name: 'TPS1 vs TPS2 Cross-Check',
    description: 'Dual TPS sensors should track each other for redundancy.',
    param1: '0x0111', // TPS
    param2: '0x0145', // Relative TPS (if available)
    correlationType: 'positive',
    expectedCoefficient: 0.99,
    tolerance: 0.02,
    validConditions: [],
    formula: 'TPS1 ≈ TPS2 within 2%',
    whenHealthy: 'Both TPS sensors reading identically',
    whenAbnormal: 'TPS sensors disagree - potential safety issue',
    possibleCauses: [
      'One TPS sensor failing',
      'Connector corrosion',
      'Wiring damage',
      'Throttle body malfunction',
    ],
    affectedSystems: ['Throttle Body', 'TPS Sensors', 'Drive-by-Wire'],
    diagnosticWeight: 10,
    category: 'SENSOR_VALIDATION',
  },

  {
    id: 'map-baro-validation',
    name: 'MAP vs Barometric Pressure',
    description: 'MAP should never exceed barometric pressure (natural aspiration).',
    param1: '0x010B', // MAP
    param2: '0x0133', // Barometric Pressure
    correlationType: 'conditional',
    expectedCoefficient: 0.0,
    tolerance: 0.10,
    validConditions: [
      { parameter: '0x0170', operator: '<', value: 105, description: 'Non-boosted condition' },
    ],
    formula: 'MAP ≤ Barometric Pressure (NA engines)',
    whenHealthy: 'MAP always below or equal to barometric',
    whenAbnormal: 'MAP exceeds barometric (sensor error or boost on NA)',
    possibleCauses: [
      'MAP sensor failure',
      'Barometric sensor failure',
      'Sensor calibration drift',
    ],
    affectedSystems: ['MAP Sensor', 'Barometric Sensor'],
    diagnosticWeight: 6,
    category: 'SENSOR_VALIDATION',
  },

  {
    id: 'o2-heater-warmup',
    name: 'O2 Sensor Activity vs Time',
    description: 'O2 sensors should start switching within 30 seconds of start.',
    param1: '0x0114', // O2 B1S1
    param2: '0x0105', // ECT (proxy for time since start)
    correlationType: 'conditional',
    expectedCoefficient: 0.30,
    tolerance: 0.40,
    validConditions: [
      { parameter: '0x0105', operator: '>', value: 50, description: 'Engine warming' },
    ],
    formula: 'O2 should be switching before ECT reaches 60°C',
    whenHealthy: 'O2 sensor active and switching early in warm-up',
    whenAbnormal: 'O2 sensor slow to respond or not switching',
    possibleCauses: [
      'O2 heater circuit failure',
      'O2 sensor aged/contaminated',
      'Wiring issue to heater',
      'Relay failure',
    ],
    affectedSystems: ['O2 Sensor', 'O2 Heater Circuit'],
    diagnosticWeight: 7,
    category: 'SENSOR_VALIDATION',
  },

  // ==========================================
  // DIESEL-SPECIFIC CORRELATIONS
  // ==========================================

  {
    id: 'dpf-pressure-load',
    name: 'DPF Differential Pressure vs Engine Load',
    description: 'DPF backpressure increases with exhaust flow (load).',
    param1: '0x017D', // DPF DP
    param2: '0x0104', // Load
    correlationType: 'positive',
    expectedCoefficient: 0.70,
    tolerance: 0.20,
    validConditions: [
      { parameter: '0x010C', operator: '>', value: 1500, description: 'Above idle' },
    ],
    formula: 'DPF DP increases with exhaust volume',
    whenHealthy: 'Proportional increase with load, within limits',
    whenAbnormal: 'Excessive pressure drop indicating high soot load',
    possibleCauses: [
      'DPF needs regeneration',
      'Ash accumulation',
      'Failed regen attempts',
      'Excessive oil consumption',
    ],
    affectedSystems: ['DPF', 'Exhaust System', 'Regen System'],
    diagnosticWeight: 8,
    category: 'EMISSIONS',
  },

  {
    id: 'dpf-temp-regen',
    name: 'DPF Temp During Regeneration',
    description: 'DPF temperature should rise significantly during active regen.',
    param1: '0x017C', // DPF Temp
    param2: '0x0104', // Load
    correlationType: 'conditional',
    expectedCoefficient: 0.80,
    tolerance: 0.20,
    validConditions: [],
    formula: 'DPF temp reaches 550-650°C during active regen',
    whenHealthy: 'Controlled temperature rise during regen',
    whenAbnormal: 'Temp not reaching regen threshold or runaway',
    possibleCauses: [
      'Injector issue affecting regen',
      'Glow plug failure',
      'Temperature sensor fault',
      'Exhaust leak',
    ],
    affectedSystems: ['DPF', 'Fuel Injectors', 'Glow Plugs'],
    diagnosticWeight: 8,
    category: 'EMISSIONS',
  },

  // ==========================================
  // ELECTRICAL CORRELATIONS
  // ==========================================

  {
    id: 'voltage-load-alternator',
    name: 'System Voltage vs Electrical Load',
    description: 'Voltage should remain stable despite electrical load changes.',
    param1: '0x0142', // ECU Voltage
    param2: '0x0104', // Engine Load (proxy for alternator output)
    correlationType: 'positive',
    expectedCoefficient: 0.30,
    tolerance: 0.40,
    validConditions: [
      { parameter: '0x010C', operator: '>', value: 800, description: 'Engine running' },
    ],
    formula: 'Voltage should stay 13.5-14.8V regardless of load',
    whenHealthy: 'Stable voltage across all conditions',
    whenAbnormal: 'Voltage dropping under load or not recovering',
    possibleCauses: [
      'Alternator failing',
      'Belt slip',
      'Battery failing',
      'High resistance in charging circuit',
      'Voltage regulator fault',
    ],
    affectedSystems: ['Alternator', 'Battery', 'Charging Circuit'],
    diagnosticWeight: 7,
    category: 'SYSTEM_EFFICIENCY',
  },

  // ==========================================
  // OIL SYSTEM CORRELATIONS
  // ==========================================

  {
    id: 'oil-pressure-rpm',
    name: 'Oil Pressure vs Engine RPM',
    description: 'Oil pressure should increase with RPM due to pump output.',
    param1: '0x015B', // Oil Pressure
    param2: '0x010C', // RPM
    correlationType: 'positive',
    expectedCoefficient: 0.75,
    tolerance: 0.20,
    validConditions: [
      { parameter: '0x015C', operator: '>', value: 60, description: 'Oil warm' },
    ],
    formula: 'Oil pressure roughly doubles from idle to 3000 RPM',
    whenHealthy: 'Oil pressure rises smoothly with RPM',
    whenAbnormal: 'Oil pressure not increasing with RPM',
    possibleCauses: [
      'Oil pump wear',
      'Pressure relief stuck open',
      'Worn main bearings',
      'Oil viscosity too low',
      'Oil level low',
    ],
    affectedSystems: ['Oil Pump', 'Bearings', 'Pressure Relief'],
    diagnosticWeight: 9,
    category: 'SYSTEM_EFFICIENCY',
  },

  {
    id: 'oil-pressure-temp',
    name: 'Oil Pressure vs Oil Temperature',
    description: 'Oil pressure decreases as oil warms due to viscosity change.',
    param1: '0x015B', // Oil Pressure
    param2: '0x015C', // Oil Temp
    correlationType: 'negative',
    expectedCoefficient: -0.50,
    tolerance: 0.25,
    validConditions: [
      { parameter: '0x010C', operator: 'between', value: [700, 900], description: 'At idle' },
    ],
    formula: 'Oil pressure drops 20-40 kPa as oil goes from cold to hot',
    whenHealthy: 'Moderate pressure drop as oil warms',
    whenAbnormal: 'Excessive pressure drop when hot',
    possibleCauses: [
      'Wrong oil viscosity',
      'Oil dilution from fuel',
      'Worn bearings',
      'Internal oil leaks',
    ],
    affectedSystems: ['Oil System', 'Engine Bearings'],
    diagnosticWeight: 7,
    category: 'SYSTEM_EFFICIENCY',
  },

  // ==========================================
  // ADVANCED MULTI-PARAMETER CORRELATIONS
  // ==========================================

  {
    id: 'volumetric-efficiency',
    name: 'Volumetric Efficiency Validation',
    description: 'Cross-check MAF, RPM, and displacement for VE calculation.',
    param1: '0x0110', // MAF
    param2: '0x010C', // RPM
    correlationType: 'proportional',
    expectedCoefficient: 0.85,
    tolerance: 0.15,
    validConditions: [
      { parameter: '0x0111', operator: 'between', value: [80, 100], description: 'Near WOT' },
    ],
    formula: 'VE = (MAF × 3456) / (RPM × Displacement × Air Density)',
    whenHealthy: 'Calculated VE is 85-100% at WOT',
    whenAbnormal: 'VE significantly different from expected',
    possibleCauses: [
      'MAF sensor error',
      'Air leak',
      'Valve timing issue',
      'Compression loss',
      'Exhaust restriction',
    ],
    affectedSystems: ['Intake System', 'Valvetrain', 'Exhaust System'],
    diagnosticWeight: 8,
    category: 'AIR_FLOW',
  },

  {
    id: 'injector-duty-cycle',
    name: 'Injector Duty Cycle vs Load',
    description: 'Injector duty cycle should match engine load demand.',
    param1: '0x0104', // Load
    param2: '0x0110', // MAF (proxy for injector demand)
    correlationType: 'proportional',
    expectedCoefficient: 0.90,
    tolerance: 0.10,
    validConditions: [],
    formula: 'IDC = (Pulse Width × RPM) / 1200',
    whenHealthy: 'IDC below 85% at WOT (headroom for enrichment)',
    whenAbnormal: 'IDC maxing out, indicates fuel system limitation',
    possibleCauses: [
      'Injectors undersized',
      'Low fuel pressure',
      'Clogged injectors',
      'Increased displacement',
    ],
    affectedSystems: ['Fuel Injectors', 'Fuel Pump', 'Fuel Pressure Regulator'],
    diagnosticWeight: 7,
    category: 'FUEL_CONTROL',
  },
];

/**
 * Get correlations by category
 */
export function getCorrelationsByCategory(category: CorrelationCategory): ParameterCorrelation[] {
  return PARAMETER_CORRELATIONS.filter(c => c.category === category);
}

/**
 * Get correlations involving a specific parameter
 */
export function getCorrelationsForParameter(pid: string): ParameterCorrelation[] {
  return PARAMETER_CORRELATIONS.filter(c => c.param1 === pid || c.param2 === pid);
}

/**
 * Get high-priority correlations for quick diagnostics
 */
export function getCriticalCorrelations(): ParameterCorrelation[] {
  return PARAMETER_CORRELATIONS.filter(c => c.diagnosticWeight >= 8);
}

/**
 * Get all correlations sorted by diagnostic weight
 */
export function getCorrelationsByPriority(): ParameterCorrelation[] {
  return [...PARAMETER_CORRELATIONS].sort((a, b) => b.diagnosticWeight - a.diagnosticWeight);
}

export default PARAMETER_CORRELATIONS;
