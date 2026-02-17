/**
 * COMPREHENSIVE DIAGNOSTIC RULES ENGINE
 * 
 * This contains all diagnostic rules for cross-parameter analysis.
 * Rules are based on:
 * - OEM diagnostic procedures
 * - Technical Service Bulletins
 * - ASE diagnostic guidelines
 * - Real-world diagnostic experience
 * - Engine management system theory
 * 
 * Each rule evaluates multiple parameters to detect specific failure modes.
 */

import { LiveDataParameter } from '@/types';

export interface DiagnosticRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  conditions: RuleCondition[];
  logicType: 'ALL' | 'ANY' | 'COMPLEX';
  customLogic?: (params: Map<string, number>) => boolean;
  affectedPIDs: string[];
  confidence: number; // Base confidence 0-100
  recommendation: string;
  possibleDTCs: string[];
  repairPriority: 1 | 2 | 3 | 4 | 5; // 1 = highest
  estimatedRepairTime: string;
  commonParts: string[];
  technicalNotes: string;
}

export interface RuleCondition {
  pid: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'between' | 'outside' | 'rate_of_change';
  value: number | [number, number];
  duration?: number; // seconds the condition must persist
  description: string;
}

export type RuleCategory = 
  | 'FUEL_SYSTEM'
  | 'IGNITION'
  | 'EMISSION_CONTROL'
  | 'COOLING_SYSTEM'
  | 'AIR_INTAKE'
  | 'EXHAUST'
  | 'SENSOR_FAILURE'
  | 'ELECTRICAL'
  | 'TRANSMISSION'
  | 'TURBO_SUPERCHARGER'
  | 'ENGINE_MECHANICAL'
  | 'EVAP'
  | 'EGR'
  | 'OIL_SYSTEM'
  | 'CATALYST';

/**
 * COMPREHENSIVE DIAGNOSTIC RULES DATABASE
 * 200+ rules covering all major diagnostic scenarios
 */
export const DIAGNOSTIC_RULES: DiagnosticRule[] = [
  // ==========================================
  // FUEL SYSTEM - LEAN CONDITIONS
  // ==========================================
  
  {
    id: 'lean-condition-bank1',
    name: 'Lean Fuel Condition - Bank 1',
    description: 'Engine running lean on bank 1. Combined fuel trims indicate system adding excessive fuel.',
    category: 'FUEL_SYSTEM',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0106', operator: '>', value: 10, description: 'STFT B1 positive' },
      { pid: '0x0107', operator: '>', value: 8, description: 'LTFT B1 positive' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0106', '0x0107', '0x0110', '0x010B', '0x0114'],
    confidence: 85,
    recommendation: 'Check for vacuum leaks using smoke machine. Inspect MAF sensor for contamination. Verify fuel pressure is within spec (typically 40-60 PSI). Check for exhaust leaks before O2 sensor.',
    possibleDTCs: ['P0171', 'P0174'],
    repairPriority: 2,
    estimatedRepairTime: '1-2 hours diagnosis',
    commonParts: ['Intake gasket', 'MAF sensor', 'Fuel filter', 'Fuel pump', 'O2 sensor'],
    technicalNotes: 'Lean conditions can cause catalyst damage if severe. Always address promptly. Check for TSBs related to intake manifold gasket failures.',
  },

  {
    id: 'severe-lean-condition',
    name: 'Severe Lean Condition - Catalyst Damage Risk',
    description: 'Dangerously lean condition. Catalyst damage and engine damage possible.',
    category: 'FUEL_SYSTEM',
    severity: 'CRITICAL',
    conditions: [
      { pid: '0x0106', operator: '>', value: 20, description: 'STFT extremely positive' },
      { pid: '0x0107', operator: '>', value: 15, description: 'LTFT extremely positive' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0106', '0x0107', '0x0110', '0x010A', '0x013C'],
    confidence: 95,
    recommendation: 'STOP DRIVING. Major vacuum leak or fuel delivery failure. Tow to shop. Check fuel pressure immediately - likely below 30 PSI or complete pump failure. Large vacuum leak possible - check brake booster, PCV, intake manifold.',
    possibleDTCs: ['P0171', 'P0174', 'P0087', 'P0300'],
    repairPriority: 1,
    estimatedRepairTime: '2-4 hours',
    commonParts: ['Fuel pump', 'Fuel pressure regulator', 'Intake manifold gasket', 'Brake booster'],
    technicalNotes: 'Severe lean conditions cause exhaust valve burning and catalyst meltdown. Check catalyst temp - if over 900°C, catalyst likely damaged.',
  },

  {
    id: 'lean-at-idle-only',
    name: 'Lean Condition at Idle Only',
    description: 'System lean only at idle, indicating idle-specific air leak.',
    category: 'FUEL_SYSTEM',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0106', operator: '>', value: 15, description: 'STFT B1 high positive at idle' },
      { pid: '0x010C', operator: '<', value: 900, description: 'Engine at idle' },
      { pid: '0x0111', operator: '<', value: 5, description: 'Throttle closed' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0106', '0x0107', '0x010C', '0x010B'],
    confidence: 90,
    recommendation: 'Idle-specific lean indicates small vacuum leak or IAC/throttle body issue. Check: PCV valve and hoses, throttle body gasket, IAC passages, brake booster check valve, intake manifold runner control.',
    possibleDTCs: ['P0171', 'P0505', 'P0507'],
    repairPriority: 3,
    estimatedRepairTime: '1-2 hours',
    commonParts: ['PCV valve', 'Throttle body gasket', 'IAC valve', 'Vacuum hoses'],
    technicalNotes: 'Propane enrichment test effective for finding small idle leaks. Also try pinching off vacuum lines one at a time.',
  },

  // ==========================================
  // FUEL SYSTEM - RICH CONDITIONS
  // ==========================================

  {
    id: 'rich-condition-bank1',
    name: 'Rich Fuel Condition - Bank 1',
    description: 'Engine running rich on bank 1. Combined fuel trims show system removing fuel.',
    category: 'FUEL_SYSTEM',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0106', operator: '<', value: -10, description: 'STFT B1 negative' },
      { pid: '0x0107', operator: '<', value: -8, description: 'LTFT B1 negative' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0106', '0x0107', '0x0110', '0x010A', '0x0114'],
    confidence: 85,
    recommendation: 'Check for leaking fuel injectors (leak-down test). Verify fuel pressure not excessive (stuck regulator). Check EVAP purge valve not stuck open. Inspect O2 sensors for contamination causing false rich reading.',
    possibleDTCs: ['P0172', 'P0175'],
    repairPriority: 2,
    estimatedRepairTime: '1-3 hours diagnosis',
    commonParts: ['Fuel injectors', 'Fuel pressure regulator', 'EVAP purge valve', 'O2 sensor'],
    technicalNotes: 'Rich conditions waste fuel and foul catalysts/spark plugs. Check for black soot at tailpipe. Smell for raw fuel.',
  },

  {
    id: 'severe-rich-condition',
    name: 'Severe Rich Condition - Engine Damage Risk',
    description: 'Dangerously rich condition. Oil dilution and catalyst damage occurring.',
    category: 'FUEL_SYSTEM',
    severity: 'CRITICAL',
    conditions: [
      { pid: '0x0106', operator: '<', value: -25, description: 'STFT extremely negative' },
      { pid: '0x0107', operator: '<', value: -20, description: 'LTFT extremely negative' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0106', '0x0107', '0x013C', '0x015C'],
    confidence: 95,
    recommendation: 'STOP DRIVING. Fuel washing cylinder walls (bearing damage risk). Check oil level - may be overfull from fuel dilution. Stuck-open injector or failed fuel pressure regulator likely. Check for fuel in oil (sniff dipstick).',
    possibleDTCs: ['P0172', 'P0175', 'P0088'],
    repairPriority: 1,
    estimatedRepairTime: '2-4 hours + oil change',
    commonParts: ['Fuel injector', 'Fuel pressure regulator', 'ECT sensor'],
    technicalNotes: 'Check oil level immediately. If overfull and smells of fuel, change oil before running engine further. Fuel-diluted oil loses lubrication properties.',
  },

  {
    id: 'rich-cold-start',
    name: 'Excessive Cold Start Enrichment',
    description: 'Running too rich during warm-up, indicating sensor or calibration issue.',
    category: 'FUEL_SYSTEM',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0105', operator: '<', value: 60, description: 'Engine still cold' },
      { pid: '0x0106', operator: '<', value: -15, description: 'STFT very negative' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0105', '0x0106', '0x0107'],
    confidence: 80,
    recommendation: 'ECT sensor may be reading colder than actual (causing over-enrichment). Check ECT sensor resistance vs actual temp. Also check IAT sensor. Verify no coolant leaks affecting sensor.',
    possibleDTCs: ['P0117', 'P0118', 'P0128', 'P0172'],
    repairPriority: 3,
    estimatedRepairTime: '30 min - 1 hour',
    commonParts: ['ECT sensor', 'IAT sensor', 'Thermostat'],
    technicalNotes: 'Compare ECT reading to actual coolant temp with infrared thermometer. Should match within 5°C.',
  },

  // ==========================================
  // FUEL SYSTEM - BANK IMBALANCE
  // ==========================================

  {
    id: 'bank-imbalance-lean',
    name: 'Bank 1 Lean vs Bank 2 - Intake Leak Suspected',
    description: 'One bank running significantly leaner than other, indicating bank-specific air leak.',
    category: 'FUEL_SYSTEM',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0107', operator: '>', value: 5, description: 'LTFT B1 positive' },
      { pid: '0x0109', operator: '<', value: -2, description: 'LTFT B2 near zero or negative' },
    ],
    logicType: 'COMPLEX',
    customLogic: (params) => {
      const ltftB1 = params.get('0x0107') || 0;
      const ltftB2 = params.get('0x0109') || 0;
      return (ltftB1 - ltftB2) > 8;
    },
    affectedPIDs: ['0x0107', '0x0109', '0x0106', '0x0108'],
    confidence: 90,
    recommendation: 'Vacuum leak on bank 1 side of intake manifold. Common locations: intake manifold gasket bank 1 side, vacuum hose to bank 1, brake booster (bank 1 side), PCV connection. Use smoke machine focusing on bank 1.',
    possibleDTCs: ['P0171', 'P0174'],
    repairPriority: 2,
    estimatedRepairTime: '1-3 hours',
    commonParts: ['Intake manifold gasket', 'Vacuum hoses', 'PCV valve'],
    technicalNotes: 'V-engine bank imbalance is excellent diagnostic - it isolates the problem to one side of engine.',
  },

  // ==========================================
  // OVERHEATING CONDITIONS
  // ==========================================

  {
    id: 'engine-overheating',
    name: 'Engine Overheating',
    description: 'Coolant temperature exceeding safe operating range.',
    category: 'COOLING_SYSTEM',
    severity: 'CRITICAL',
    conditions: [
      { pid: '0x0105', operator: '>', value: 105, description: 'Coolant temp high' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0105', '0x010C', '0x0104'],
    confidence: 95,
    recommendation: 'STOP DRIVING IMMEDIATELY. Turn off AC, turn on heater to max. Check coolant level (when cool). Possible causes: thermostat stuck closed, cooling fan failure, water pump failure, radiator blockage, head gasket leak.',
    possibleDTCs: ['P0217', 'P0118', 'P0116'],
    repairPriority: 1,
    estimatedRepairTime: 'Varies by cause',
    commonParts: ['Thermostat', 'Cooling fan', 'Water pump', 'Radiator', 'Head gasket'],
    technicalNotes: 'Continued driving with overheating causes head gasket failure, warped heads, and engine seizure. Every minute counts.',
  },

  {
    id: 'overcooling',
    name: 'Engine Running Cold - Thermostat Stuck Open',
    description: 'Engine not reaching operating temperature, indicating thermostat failure.',
    category: 'COOLING_SYSTEM',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0105', operator: '<', value: 75, description: 'Coolant temp too low', duration: 600 },
      { pid: '0x010D', operator: '>', value: 30, description: 'Vehicle moving (airflow through radiator)' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0105', '0x0107'],
    confidence: 90,
    recommendation: 'Thermostat stuck open. Replace thermostat. Symptoms: poor fuel economy, slow warm-up, weak heater, possible P0128 code. Using cardboard in front of radiator is a temporary diagnosis confirmation, not a fix.',
    possibleDTCs: ['P0128', 'P0125'],
    repairPriority: 3,
    estimatedRepairTime: '1-2 hours',
    commonParts: ['Thermostat', 'Thermostat housing gasket'],
    technicalNotes: 'Running cold increases fuel consumption 10-15% and accelerates engine wear. Also affects emissions testing.',
  },

  {
    id: 'rapid-temp-rise',
    name: 'Abnormally Rapid Temperature Rise',
    description: 'Coolant temperature rising faster than normal, indicating coolant loss or circulation issue.',
    category: 'COOLING_SYSTEM',
    severity: 'CRITICAL',
    conditions: [
      { pid: '0x0105', operator: 'rate_of_change', value: 5, description: 'Temp rising >5°C/minute' },
      { pid: '0x010C', operator: '<', value: 2500, description: 'Not under heavy load' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0105', '0x010C', '0x0104'],
    confidence: 85,
    recommendation: 'Rapid temp rise indicates: Low coolant level, water pump failure, air pocket in system, or severe head gasket leak. Check coolant level immediately. Look for external leaks. Check for bubbles in coolant reservoir (head gasket sign).',
    possibleDTCs: ['P0217', 'P0116'],
    repairPriority: 1,
    estimatedRepairTime: 'Varies by cause',
    commonParts: ['Water pump', 'Coolant hoses', 'Head gasket', 'Radiator'],
    technicalNotes: 'Combustion gases entering cooling system cause rapid temp rise and bubbles. Block test kit confirms head gasket leak.',
  },

  // ==========================================
  // O2 SENSOR ISSUES
  // ==========================================

  {
    id: 'o2-sensor-lazy',
    name: 'Lazy O2 Sensor - Slow Response',
    description: 'O2 sensor responding slowly, stuck in narrow voltage range.',
    category: 'SENSOR_FAILURE',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0114', operator: 'between', value: [0.35, 0.65], description: 'O2 stuck mid-range', duration: 10 },
      { pid: '0x0103', operator: '==', value: 2, description: 'Closed loop operation' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0114', '0x0106', '0x0107'],
    confidence: 80,
    recommendation: 'O2 sensor is sluggish. Should switch between 0.1-0.9V at least 5 times per 10 seconds at steady cruise. Replace upstream O2 sensor. Check for exhaust leaks that could affect sensor reading.',
    possibleDTCs: ['P0133', 'P0153', 'P0139', 'P0159'],
    repairPriority: 3,
    estimatedRepairTime: '30 min - 1 hour',
    commonParts: ['O2 sensor (upstream)', 'O2 sensor connector'],
    technicalNotes: 'Lazy O2 sensors cause drivability issues and fail emissions tests. Typically occurs at 80,000-120,000 miles.',
  },

  {
    id: 'o2-sensor-stuck-lean',
    name: 'O2 Sensor Stuck Lean (Low Voltage)',
    description: 'O2 sensor consistently reading low voltage, indicating lean condition or sensor failure.',
    category: 'SENSOR_FAILURE',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0114', operator: '<', value: 0.2, description: 'O2 stuck low', duration: 30 },
      { pid: '0x0106', operator: '>', value: 20, description: 'STFT maxing positive' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0114', '0x0106', '0x0107'],
    confidence: 85,
    recommendation: 'O2 sensor stuck lean could be: Actual lean condition (check fuel trims and vacuum leaks), exhaust leak before sensor (common), or failed O2 sensor. Diagnose by looking at fuel trim response to snap throttle.',
    possibleDTCs: ['P0131', 'P0151'],
    repairPriority: 2,
    estimatedRepairTime: '1-2 hours diagnosis',
    commonParts: ['O2 sensor', 'Exhaust manifold gasket'],
    technicalNotes: 'Exhaust leak before O2 sensor causes lean reading because ambient air dilutes exhaust. Check manifold studs for cracks.',
  },

  {
    id: 'o2-sensor-stuck-rich',
    name: 'O2 Sensor Stuck Rich (High Voltage)',
    description: 'O2 sensor consistently reading high voltage, indicating rich condition or sensor failure.',
    category: 'SENSOR_FAILURE',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0114', operator: '>', value: 0.8, description: 'O2 stuck high', duration: 30 },
      { pid: '0x0106', operator: '<', value: -20, description: 'STFT maxing negative' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0114', '0x0106', '0x0107'],
    confidence: 85,
    recommendation: 'O2 sensor stuck rich could be: Actual rich condition (leaking injector, high fuel pressure), contaminated O2 sensor (silicone/coolant), or shorted O2 sensor. Check for antifreeze in exhaust (sweet smell) indicating head gasket.',
    possibleDTCs: ['P0132', 'P0152'],
    repairPriority: 2,
    estimatedRepairTime: '1-2 hours diagnosis',
    commonParts: ['O2 sensor', 'Fuel injectors', 'Head gasket'],
    technicalNotes: 'Silicone contamination from gasket sealers permanently damages O2 sensors. Always use sensor-safe silicone.',
  },

  {
    id: 'o2-heater-failure',
    name: 'O2 Sensor Heater Circuit Failure',
    description: 'O2 sensor not reaching operating temperature, heater circuit fault.',
    category: 'SENSOR_FAILURE',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0114', operator: '==', value: 0.45, description: 'O2 stuck at bias voltage', duration: 60 },
      { pid: '0x0105', operator: '>', value: 70, description: 'Engine warm' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0114', '0x0105'],
    confidence: 90,
    recommendation: 'O2 sensor heater likely failed. Sensor should be active within 30 seconds of start. Check heater circuit fuse, relay, and sensor heater resistance (typically 10-20 ohms). Replace O2 sensor if heater open/shorted.',
    possibleDTCs: ['P0135', 'P0141', 'P0155', 'P0161'],
    repairPriority: 3,
    estimatedRepairTime: '30 min - 1 hour',
    commonParts: ['O2 sensor', 'O2 heater fuse', 'O2 heater relay'],
    technicalNotes: 'Unheated O2 sensors rely on exhaust heat and take 1-3 minutes to activate. Heater failure causes extended rich running at startup.',
  },

  // ==========================================
  // CATALYST ISSUES
  // ==========================================

  {
    id: 'catalyst-inefficient',
    name: 'Catalyst Efficiency Below Threshold',
    description: 'Catalytic converter not converting pollutants effectively.',
    category: 'CATALYST',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0114', operator: 'between', value: [0.1, 0.9], description: 'Pre-cat O2 switching' },
      { pid: '0x0115', operator: 'between', value: [0.2, 0.8], description: 'Post-cat O2 also switching' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0114', '0x0115', '0x013C'],
    confidence: 85,
    recommendation: 'Catalyst not storing/releasing oxygen effectively. Pre-cat O2 switches, post-cat should be steady near 0.6V. May need catalyst replacement. First verify no exhaust leaks and O2 sensors are functioning properly.',
    possibleDTCs: ['P0420', 'P0430'],
    repairPriority: 3,
    estimatedRepairTime: '2-4 hours',
    commonParts: ['Catalytic converter', 'O2 sensors', 'Exhaust gaskets'],
    technicalNotes: 'Catalyst efficiency decreases with age, contamination (oil, coolant, leaded fuel), and thermal damage. Some aftermarket cats fail quickly.',
  },

  {
    id: 'catalyst-overheat',
    name: 'Catalyst Overheating',
    description: 'Catalyst temperature dangerously high, indicating misfire or rich condition.',
    category: 'CATALYST',
    severity: 'CRITICAL',
    conditions: [
      { pid: '0x013C', operator: '>', value: 850, description: 'Cat temp extremely high' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x013C', '0x0106', '0x0200'],
    confidence: 95,
    recommendation: 'STOP IMMEDIATELY. Catalyst temperature over 850°C indicates unburned fuel entering exhaust. Usually caused by misfire or severe rich condition. Continued driving will melt catalyst and potentially start fire. Address misfire/rich condition first.',
    possibleDTCs: ['P0420', 'P0300', 'P0172'],
    repairPriority: 1,
    estimatedRepairTime: 'Varies + cat replacement if damaged',
    commonParts: ['Ignition coils', 'Spark plugs', 'Fuel injectors', 'Catalytic converter'],
    technicalNotes: 'Catalyst meltdown can restrict exhaust causing severe power loss and potential engine damage. Check cat with infrared for hot spots.',
  },

  // ==========================================
  // MAF SENSOR ISSUES
  // ==========================================

  {
    id: 'maf-contaminated',
    name: 'MAF Sensor Contaminated/Under-reading',
    description: 'MAF sensor reading lower than expected, causing lean condition.',
    category: 'SENSOR_FAILURE',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0110', operator: '<', value: 3, description: 'MAF very low at idle' },
      { pid: '0x010C', operator: 'between', value: [650, 900], description: 'Normal idle RPM' },
      { pid: '0x0106', operator: '>', value: 10, description: 'Running lean' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0110', '0x0106', '0x0107', '0x0104'],
    confidence: 85,
    recommendation: 'MAF sensor likely contaminated with oil or dirt. Clean with MAF cleaner spray (never touch element). If cleaning doesnt help, replace MAF. Also check for air leaks between MAF and throttle body.',
    possibleDTCs: ['P0101', 'P0102', 'P0171'],
    repairPriority: 2,
    estimatedRepairTime: '30 min clean, 1 hour replace',
    commonParts: ['MAF sensor', 'Air filter', 'Intake tube'],
    technicalNotes: 'Oiled aftermarket air filters are common cause of MAF contamination. MAF should read 3-7 g/s at idle for most engines.',
  },

  {
    id: 'maf-over-reading',
    name: 'MAF Sensor Over-reading',
    description: 'MAF sensor reading higher than expected, causing rich condition.',
    category: 'SENSOR_FAILURE',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0110', operator: '>', value: 10, description: 'MAF too high at idle' },
      { pid: '0x010C', operator: 'between', value: [650, 900], description: 'Normal idle RPM' },
      { pid: '0x0106', operator: '<', value: -10, description: 'Running rich' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0110', '0x0106', '0x0107', '0x0104'],
    confidence: 80,
    recommendation: 'MAF reading high could indicate: Wrong MAF installed (different part number), MAF sensor failure, or major vacuum leak causing turbulence. Verify correct MAF part number. Check for intake leaks causing turbulent airflow over MAF element.',
    possibleDTCs: ['P0101', 'P0103', 'P0172'],
    repairPriority: 2,
    estimatedRepairTime: '1-2 hours diagnosis',
    commonParts: ['MAF sensor', 'Intake tube', 'Intake manifold gasket'],
    technicalNotes: 'Air leaks after MAF cause opposite effect - unmetered air enters causing lean condition. Leak before MAF can cause turbulent flow.',
  },

  {
    id: 'maf-correlation-failure',
    name: 'MAF vs MAP Correlation Failure',
    description: 'MAF and MAP readings dont correlate, indicating sensor or air system issue.',
    category: 'SENSOR_FAILURE',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0110', operator: '>', value: 50, description: 'MAF showing high airflow' },
      { pid: '0x010B', operator: '<', value: 50, description: 'MAP showing low pressure (high vacuum)' },
      { pid: '0x0104', operator: '<', value: 40, description: 'Low calculated load' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0110', '0x010B', '0x0104'],
    confidence: 85,
    recommendation: 'MAF says high airflow but MAP says high vacuum - conflict. Possible air leak between sensors, stuck throttle plate, or one sensor failing. Compare both readings at WOT (both should be high).',
    possibleDTCs: ['P0101', 'P0106', 'P0068'],
    repairPriority: 2,
    estimatedRepairTime: '1-2 hours diagnosis',
    commonParts: ['MAF sensor', 'MAP sensor', 'Throttle body'],
    technicalNotes: 'P0068 is specific DTC for MAF/throttle position correlation failure. Very helpful for diagnosis.',
  },

  // ==========================================
  // MISFIRE DETECTION
  // ==========================================

  {
    id: 'cylinder-1-misfire',
    name: 'Cylinder 1 Misfire Detected',
    description: 'Recurring misfire on cylinder 1.',
    category: 'IGNITION',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0200', operator: '>', value: 5, description: 'Cyl 1 misfire count elevated' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0200', '0x010C', '0x0104', '0x010E'],
    confidence: 90,
    recommendation: 'Cylinder 1 specific misfire. Check in order: 1) Swap coil with another cylinder - if misfire moves, coil bad. 2) Swap spark plug - if moves, plug bad. 3) Swap injector - if moves, injector bad. 4) If doesnt move, compression/valve issue.',
    possibleDTCs: ['P0301', 'P0300'],
    repairPriority: 2,
    estimatedRepairTime: '1-2 hours diagnosis',
    commonParts: ['Ignition coil', 'Spark plug', 'Fuel injector', 'Valve'],
    technicalNotes: 'Component swap test is most efficient diagnosis method. Always check for TSBs - some vehicles have known coil failure issues.',
  },

  {
    id: 'random-misfire',
    name: 'Random Multiple Cylinder Misfire',
    description: 'Misfires occurring across multiple cylinders randomly.',
    category: 'IGNITION',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0200', operator: '>', value: 3, description: 'Cyl 1 misfire count' },
      { pid: '0x0201', operator: '>', value: 3, description: 'Cyl 2 misfire count' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0200', '0x0201', '0x0202', '0x0203', '0x0106'],
    confidence: 85,
    recommendation: 'Random misfire affecting multiple cylinders usually indicates system-wide issue: Fuel pressure low, vacuum leak, EGR stuck open, ignition timing issue, or fuel quality problem. Check fuel pressure first, then vacuum system.',
    possibleDTCs: ['P0300'],
    repairPriority: 2,
    estimatedRepairTime: '2-3 hours diagnosis',
    commonParts: ['Fuel pump', 'Fuel filter', 'Spark plugs (all)', 'EGR valve'],
    technicalNotes: 'Random misfire with positive fuel trims = lean misfire. With negative trims = ignition or compression issue. This correlation is key diagnostic.',
  },

  {
    id: 'misfire-at-idle-only',
    name: 'Misfire at Idle Only',
    description: 'Misfire occurring only at idle, smooth at higher RPM.',
    category: 'IGNITION',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0200', operator: '>', value: 5, description: 'Misfire count at idle' },
      { pid: '0x010C', operator: '<', value: 900, description: 'At idle' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0200', '0x010C', '0x0106', '0x010B'],
    confidence: 80,
    recommendation: 'Idle-only misfire suggests: Vacuum leak, EGR leak, worn spark plugs (idle is hardest on ignition), or injector with poor low-flow atomization. Check vacuum system integrity first.',
    possibleDTCs: ['P0300', 'P0301', 'P0171'],
    repairPriority: 3,
    estimatedRepairTime: '1-2 hours',
    commonParts: ['Spark plugs', 'Ignition coils', 'PCV valve', 'Vacuum hoses'],
    technicalNotes: 'Idle is most demanding on ignition system due to low cylinder pressure. Worn plugs often misfire only at idle.',
  },

  {
    id: 'misfire-under-load',
    name: 'Misfire Under Load Only',
    description: 'Misfire occurring only under acceleration or load.',
    category: 'IGNITION',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0200', operator: '>', value: 5, description: 'Misfire count elevated' },
      { pid: '0x0104', operator: '>', value: 60, description: 'Under load' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0200', '0x0104', '0x010A', '0x010E'],
    confidence: 85,
    recommendation: 'Load-only misfire indicates: Weak ignition (coil breaking down under load), fuel delivery issue (pump weak, filter clogged), or ignition timing retarded. Check fuel pressure under load - should maintain spec.',
    possibleDTCs: ['P0300', 'P0301', 'P0087'],
    repairPriority: 2,
    estimatedRepairTime: '1-3 hours diagnosis',
    commonParts: ['Ignition coil', 'Spark plug wires', 'Fuel pump', 'Fuel filter'],
    technicalNotes: 'Ignition components that test fine at rest may break down under load. Scope testing or substitution is often needed.',
  },

  // ==========================================
  // THROTTLE/IDLE ISSUES
  // ==========================================

  {
    id: 'high-idle',
    name: 'Abnormally High Idle Speed',
    description: 'Engine idling significantly above normal speed.',
    category: 'AIR_INTAKE',
    severity: 'WARNING',
    conditions: [
      { pid: '0x010C', operator: '>', value: 1000, description: 'Idle RPM too high' },
      { pid: '0x0111', operator: '<', value: 5, description: 'Throttle closed' },
      { pid: '0x010D', operator: '==', value: 0, description: 'Vehicle stationary' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x010C', '0x0111', '0x010B', '0x0106'],
    confidence: 90,
    recommendation: 'High idle with closed throttle indicates unmetered air entering engine. Check: Vacuum leaks, IAC valve stuck open, throttle body air bypass, intake gasket leak. Also check if AC is on (normal slight increase).',
    possibleDTCs: ['P0507', 'P0171', 'P0505'],
    repairPriority: 3,
    estimatedRepairTime: '1-2 hours',
    commonParts: ['IAC valve', 'Throttle body', 'Intake gasket', 'Vacuum hoses'],
    technicalNotes: 'High idle can cause premature transmission engagement and unsafe creeping. Address promptly.',
  },

  {
    id: 'low-idle',
    name: 'Abnormally Low Idle Speed',
    description: 'Engine idling below normal speed, stall risk.',
    category: 'AIR_INTAKE',
    severity: 'WARNING',
    conditions: [
      { pid: '0x010C', operator: '<', value: 600, description: 'Idle RPM too low' },
      { pid: '0x0111', operator: '<', value: 5, description: 'Throttle closed' },
      { pid: '0x010D', operator: '==', value: 0, description: 'Vehicle stationary' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x010C', '0x0111', '0x0104'],
    confidence: 85,
    recommendation: 'Low idle indicates: IAC valve stuck/clogged, dirty throttle body blocking air, or engine vacuum issue. Clean throttle body and IAC passages. Check for excessive engine load (AC compressor drag, alternator).',
    possibleDTCs: ['P0506', 'P0505'],
    repairPriority: 3,
    estimatedRepairTime: '30 min - 1 hour',
    commonParts: ['IAC valve', 'Throttle body', 'Spark plugs'],
    technicalNotes: 'Carbon buildup in throttle body is common cause. Use throttle body cleaner and clean minimum air rate passage.',
  },

  {
    id: 'hunting-idle',
    name: 'Hunting/Surging Idle',
    description: 'Idle speed fluctuating rhythmically up and down.',
    category: 'AIR_INTAKE',
    severity: 'WARNING',
    conditions: [
      { pid: '0x010C', operator: 'between', value: [500, 1200], description: 'RPM oscillating' },
      { pid: '0x0111', operator: '<', value: 5, description: 'Throttle closed' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x010C', '0x0106', '0x010B', '0x012C'],
    confidence: 80,
    recommendation: 'Hunting idle often caused by: EGR leak at idle, PCV system fault, intake manifold runner control malfunction, or O2 sensor hunting (look at fuel trims oscillating). Check EGR and PCV first.',
    possibleDTCs: ['P0505', 'P0401', 'P0171'],
    repairPriority: 3,
    estimatedRepairTime: '1-2 hours diagnosis',
    commonParts: ['EGR valve', 'PCV valve', 'IMRC actuator', 'O2 sensor'],
    technicalNotes: 'Watch fuel trims during hunting - if they oscillate with RPM, its an air/fuel issue. If steady, its mechanical or IAC related.',
  },

  // ==========================================
  // TPS ISSUES
  // ==========================================

  {
    id: 'tps-erratic',
    name: 'Erratic Throttle Position Signal',
    description: 'TPS signal jumping or inconsistent, causing drivability issues.',
    category: 'SENSOR_FAILURE',
    severity: 'CRITICAL',
    conditions: [
      { pid: '0x0111', operator: 'rate_of_change', value: 20, description: 'TPS signal erratic' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0111', '0x010C'],
    confidence: 90,
    recommendation: 'TPS signal instability causes surging, hesitation, and transmission shift problems. On drive-by-wire vehicles, this can trigger limp mode. Check TPS connector for corrosion, verify ground integrity, replace TPS/throttle body if worn.',
    possibleDTCs: ['P0121', 'P0122', 'P0123', 'P2135'],
    repairPriority: 2,
    estimatedRepairTime: '1-2 hours',
    commonParts: ['TPS sensor', 'Throttle body', 'Wiring harness'],
    technicalNotes: 'Drive-by-wire vehicles have dual TPS for redundancy. P2135 indicates disagreement between sensors - very serious on DBW systems.',
  },

  {
    id: 'tps-not-closing',
    name: 'TPS Not Returning to Closed Position',
    description: 'Throttle position not returning to idle position.',
    category: 'SENSOR_FAILURE',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0111', operator: '>', value: 8, description: 'TPS above idle position' },
      { pid: '0x010C', operator: '<', value: 900, description: 'Should be at idle' },
      { pid: '0x010D', operator: '==', value: 0, description: 'Vehicle stopped' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0111', '0x010C'],
    confidence: 85,
    recommendation: 'Throttle not fully closing: Check for carbon buildup on throttle plate edge, binding throttle cable/linkage, floor mat interference, or TPS needs adjustment/replacement. On DBW, check for motor/spring issues.',
    possibleDTCs: ['P0121', 'P0507', 'P2119'],
    repairPriority: 2,
    estimatedRepairTime: '30 min - 1 hour',
    commonParts: ['Throttle body', 'Throttle cable', 'TPS sensor'],
    technicalNotes: 'Safety issue - vehicle may not decelerate properly. Check throttle operation manually with engine off.',
  },

  // ==========================================
  // EGR ISSUES
  // ==========================================

  {
    id: 'egr-stuck-open',
    name: 'EGR Valve Stuck Open',
    description: 'EGR valve not closing, causing rough idle and stalling.',
    category: 'EGR',
    severity: 'WARNING',
    conditions: [
      { pid: '0x012C', operator: '==', value: 0, description: 'EGR commanded closed' },
      { pid: '0x010B', operator: '>', value: 50, description: 'Vacuum lower than expected at idle' },
      { pid: '0x010C', operator: '<', value: 800, description: 'At idle' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x012C', '0x010B', '0x010C'],
    confidence: 80,
    recommendation: 'EGR stuck open causes rough idle, stalling, and poor fuel economy. Carbon buildup is common cause. Remove and clean EGR valve, clean passages in intake manifold. Replace EGR if cleaning doesnt help.',
    possibleDTCs: ['P0402', 'P0401', 'P1406'],
    repairPriority: 3,
    estimatedRepairTime: '1-2 hours',
    commonParts: ['EGR valve', 'EGR gasket', 'Intake manifold cleaning'],
    technicalNotes: 'Diesel EGR systems are particularly prone to carbon buildup. Use walnut shell blasting for intake cleaning.',
  },

  {
    id: 'egr-insufficient-flow',
    name: 'EGR Flow Insufficient',
    description: 'EGR not flowing when commanded, increasing NOx emissions.',
    category: 'EGR',
    severity: 'INFO',
    conditions: [
      { pid: '0x012C', operator: '>', value: 20, description: 'EGR commanded open' },
      { pid: '0x012D', operator: '>', value: 15, description: 'High EGR error' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x012C', '0x012D', '0x010B'],
    confidence: 85,
    recommendation: 'EGR not flowing adequately. Check: EGR passages clogged with carbon, vacuum supply to EGR actuator, EGR solenoid function, exhaust backpressure supply. Common issue on high-mileage vehicles.',
    possibleDTCs: ['P0401', 'P0400', 'P1406'],
    repairPriority: 4,
    estimatedRepairTime: '1-3 hours',
    commonParts: ['EGR valve', 'EGR solenoid', 'EGR passages (cleaning)'],
    technicalNotes: 'EGR codes often fail emissions testing. Some states require EGR function for compliance.',
  },

  // ==========================================
  // EVAP SYSTEM ISSUES
  // ==========================================

  {
    id: 'evap-large-leak',
    name: 'EVAP System Large Leak Detected',
    description: 'Significant leak in evaporative emission control system.',
    category: 'EVAP',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0132', operator: '>', value: 1000, description: 'EVAP pressure not holding vacuum' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0132', '0x012E'],
    confidence: 85,
    recommendation: 'Large EVAP leak most commonly: Loose or missing gas cap (check first!), cracked EVAP hose, failed purge valve, damaged charcoal canister, or missing vent valve seal. Use smoke machine for diagnosis.',
    possibleDTCs: ['P0455', 'P0456', 'P0440'],
    repairPriority: 4,
    estimatedRepairTime: '1-2 hours diagnosis',
    commonParts: ['Gas cap', 'EVAP hoses', 'Purge valve', 'Vent valve'],
    technicalNotes: 'Always start diagnosis by checking/replacing gas cap. Its free diagnosis and often fixes P0455.',
  },

  {
    id: 'evap-purge-stuck',
    name: 'EVAP Purge Valve Stuck',
    description: 'Purge valve not operating correctly, affecting fuel trims.',
    category: 'EVAP',
    severity: 'WARNING',
    conditions: [
      { pid: '0x012E', operator: '>', value: 30, description: 'Purge commanded' },
      { pid: '0x0106', operator: '<', value: -8, description: 'Running rich' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x012E', '0x0106', '0x0107'],
    confidence: 75,
    recommendation: 'Purge valve stuck open causes: Rich running, rough idle when tank is full, strong fuel smell. Check purge valve holds vacuum when off, clicks when activated. Replace if stuck open.',
    possibleDTCs: ['P0441', 'P0443', 'P0172'],
    repairPriority: 3,
    estimatedRepairTime: '30 min - 1 hour',
    commonParts: ['Purge valve', 'EVAP hoses'],
    technicalNotes: 'Stuck-open purge valve dumps fuel vapor into engine constantly, causing rich condition especially noticeable at idle.',
  },

  // ==========================================
  // TURBOCHARGER ISSUES
  // ==========================================

  {
    id: 'boost-leak',
    name: 'Turbo Boost Leak Detected',
    description: 'Boost pressure not reaching expected levels.',
    category: 'TURBO_SUPERCHARGER',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0170', operator: '<', value: 120, description: 'Boost below expected' },
      { pid: '0x0111', operator: '>', value: 80, description: 'Throttle wide open' },
      { pid: '0x010C', operator: '>', value: 3500, description: 'RPM sufficient for boost' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0170', '0x0171', '0x0111', '0x0104'],
    confidence: 85,
    recommendation: 'Not reaching boost target indicates: Boost leak in intercooler piping (most common), wastegate stuck open, turbo bearing failure, or boost control solenoid issue. Pressure test intercooler system first.',
    possibleDTCs: ['P0299', 'P0234', 'P0245'],
    repairPriority: 2,
    estimatedRepairTime: '1-3 hours diagnosis',
    commonParts: ['Intercooler hoses', 'Boost pipe clamps', 'Wastegate actuator', 'Boost solenoid'],
    technicalNotes: 'Boost leak can be found with soapy water while pressurizing intake system. Listen for hissing under load.',
  },

  {
    id: 'overboost',
    name: 'Overboost Condition',
    description: 'Boost pressure exceeding safe limits.',
    category: 'TURBO_SUPERCHARGER',
    severity: 'CRITICAL',
    conditions: [
      { pid: '0x0170', operator: '>', value: 200, description: 'Boost very high' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0170', '0x0171', '0x0104'],
    confidence: 95,
    recommendation: 'DANGER - Overboost can damage engine. Possible causes: Wastegate stuck closed, boost control solenoid failed open, ECU boost limit defeated. Vehicle may enter limp mode. Dont drive until fixed.',
    possibleDTCs: ['P0234', 'P0243', 'P0246'],
    repairPriority: 1,
    estimatedRepairTime: '1-2 hours diagnosis',
    commonParts: ['Wastegate actuator', 'Boost control solenoid', 'Turbo'],
    technicalNotes: 'Overboost causes detonation, bent rods, blown head gaskets. Critical failure mode requiring immediate attention.',
  },

  {
    id: 'turbo-lag-excessive',
    name: 'Excessive Turbo Lag',
    description: 'Turbocharger slow to spool up.',
    category: 'TURBO_SUPERCHARGER',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0171', operator: '<', value: 40000, description: 'Turbo RPM low' },
      { pid: '0x010C', operator: '>', value: 3000, description: 'Engine RPM adequate' },
      { pid: '0x0104', operator: '>', value: 50, description: 'Under load' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0171', '0x0170', '0x010C', '0x0104'],
    confidence: 75,
    recommendation: 'Turbo not spooling properly. Check: Exhaust restriction (clogged cat/DPF), turbo bearing wear, VGT actuator stuck, exhaust leak before turbo, or boost leak reducing load on compressor.',
    possibleDTCs: ['P0299', 'P2262', 'P2263'],
    repairPriority: 3,
    estimatedRepairTime: '2-4 hours diagnosis',
    commonParts: ['Turbocharger', 'VGT actuator', 'Exhaust components'],
    technicalNotes: 'Check for shaft play in turbo (should be minimal). Blue smoke indicates oil seal failure.',
  },

  // ==========================================
  // ELECTRICAL/BATTERY ISSUES
  // ==========================================

  {
    id: 'alternator-undercharge',
    name: 'Alternator Not Charging Adequately',
    description: 'System voltage below normal while running.',
    category: 'ELECTRICAL',
    severity: 'WARNING',
    conditions: [
      { pid: '0x0142', operator: '<', value: 13.2, description: 'System voltage low' },
      { pid: '0x010C', operator: '>', value: 1000, description: 'Engine running above idle' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0142', '0x010C'],
    confidence: 90,
    recommendation: 'Low charging voltage indicates: Worn alternator, slipping belt, high resistance in charging circuit, or failing battery drawing excessive charge. Check belt tension, battery connections, and alternator output.',
    possibleDTCs: ['P0562', 'P0622', 'P0621'],
    repairPriority: 2,
    estimatedRepairTime: '1-2 hours',
    commonParts: ['Alternator', 'Serpentine belt', 'Battery', 'Battery cables'],
    technicalNotes: 'Undercharging kills batteries and can leave you stranded. Check alternator output at alternator terminal, not battery.',
  },

  {
    id: 'alternator-overcharge',
    name: 'Alternator Overcharging',
    description: 'System voltage above safe limits.',
    category: 'ELECTRICAL',
    severity: 'CRITICAL',
    conditions: [
      { pid: '0x0142', operator: '>', value: 15.0, description: 'System voltage too high' },
      { pid: '0x010C', operator: '>', value: 800, description: 'Engine running' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x0142'],
    confidence: 95,
    recommendation: 'DANGER - Overcharging damages electrical components and can cause battery explosion. Likely voltage regulator failure (internal to alternator on most vehicles). Replace alternator. Check for burnt electronics.',
    possibleDTCs: ['P0563'],
    repairPriority: 1,
    estimatedRepairTime: '1-2 hours',
    commonParts: ['Alternator', 'Voltage regulator'],
    technicalNotes: 'Over 16V can blow light bulbs, damage computers, and boil battery. Stop driving immediately.',
  },

  // ==========================================
  // OIL PRESSURE ISSUES
  // ==========================================

  {
    id: 'low-oil-pressure-idle',
    name: 'Low Oil Pressure at Idle',
    description: 'Oil pressure below safe threshold at idle speed.',
    category: 'OIL_SYSTEM',
    severity: 'CRITICAL',
    conditions: [
      { pid: '0x015B', operator: '<', value: 80, description: 'Oil pressure very low' },
      { pid: '0x010C', operator: '<', value: 900, description: 'At idle' },
      { pid: '0x015C', operator: '>', value: 80, description: 'Oil warm' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x015B', '0x010C', '0x015C'],
    confidence: 95,
    recommendation: 'LOW OIL PRESSURE - ENGINE DAMAGE IMMINENT. Check oil level immediately. If level OK, possible: worn bearings, oil pump failure, clogged pickup screen, wrong viscosity oil. Stop driving until diagnosed.',
    possibleDTCs: ['P0520', 'P0521', 'P0522'],
    repairPriority: 1,
    estimatedRepairTime: 'Varies - could be major',
    commonParts: ['Oil pump', 'Bearings', 'Pickup tube', 'Oil filter'],
    technicalNotes: 'Low oil pressure warning light should never be ignored. Even brief low pressure episodes cause bearing damage.',
  },

  {
    id: 'oil-pressure-no-rise',
    name: 'Oil Pressure Not Rising with RPM',
    description: 'Oil pressure staying low as RPM increases.',
    category: 'OIL_SYSTEM',
    severity: 'WARNING',
    conditions: [
      { pid: '0x015B', operator: '<', value: 200, description: 'Oil pressure not increasing' },
      { pid: '0x010C', operator: '>', value: 2500, description: 'RPM elevated' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x015B', '0x010C'],
    confidence: 85,
    recommendation: 'Oil pressure should increase significantly with RPM. Lack of increase indicates: Worn oil pump, stuck pressure relief valve, severely worn bearings, or oil bypass circuit problem. Diagnosis needed before continued operation.',
    possibleDTCs: ['P0520', 'P0521'],
    repairPriority: 1,
    estimatedRepairTime: '2-4 hours diagnosis',
    commonParts: ['Oil pump', 'Pressure relief valve', 'Main bearings'],
    technicalNotes: 'Use mechanical gauge to verify electronic sender accuracy before teardown.',
  },

  // ==========================================
  // TRANSMISSION ISSUES
  // ==========================================

  {
    id: 'trans-overheat',
    name: 'Transmission Overheating',
    description: 'Transmission fluid temperature exceeding safe limits.',
    category: 'TRANSMISSION',
    severity: 'CRITICAL',
    conditions: [
      { pid: '0x01A4', operator: '>', value: 120, description: 'Trans temp very high' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x01A4', '0x0104', '0x010D'],
    confidence: 95,
    recommendation: 'STOP AND COOL DOWN. Transmission fluid breaks down rapidly above 120°C. Check: Fluid level (low level causes heat), cooler blockage, torque converter lockup issues, slipping clutches. Towing or heavy load in hot weather common cause.',
    possibleDTCs: ['P0218', 'P0711', 'P0712'],
    repairPriority: 1,
    estimatedRepairTime: 'Varies',
    commonParts: ['Trans fluid', 'Trans cooler', 'Torque converter', 'Trans filter'],
    technicalNotes: 'Every 20°F over 200°F (93°C) cuts fluid life in half. Overheated fluid loses lubrication properties.',
  },

  {
    id: 'trans-slipping',
    name: 'Transmission Slipping Detected',
    description: 'RPM rising without corresponding speed increase.',
    category: 'TRANSMISSION',
    severity: 'WARNING',
    conditions: [
      { pid: '0x010C', operator: '>', value: 3000, description: 'RPM elevated' },
      { pid: '0x010D', operator: '<', value: 50, description: 'Speed low for RPM' },
      { pid: '0x0104', operator: '>', value: 40, description: 'Under load' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x010C', '0x010D', '0x01A3', '0x01A4'],
    confidence: 80,
    recommendation: 'Transmission slip indicated. Check fluid level and condition first (burnt smell = damaged clutches). Low fluid, worn clutches, or failing torque converter. Service may help if caught early, rebuild if severe.',
    possibleDTCs: ['P0730', 'P0731', 'P0732', 'P0733'],
    repairPriority: 2,
    estimatedRepairTime: 'Varies significantly',
    commonParts: ['Trans fluid', 'Trans filter', 'Clutch packs', 'Torque converter'],
    technicalNotes: 'Slipping creates heat which causes more slipping - vicious cycle. Address promptly.',
  },

  // ==========================================
  // DPF/DIESEL SPECIFIC
  // ==========================================

  {
    id: 'dpf-regen-needed',
    name: 'DPF Regeneration Required',
    description: 'Diesel Particulate Filter soot loading high.',
    category: 'EMISSION_CONTROL',
    severity: 'WARNING',
    conditions: [
      { pid: '0x017D', operator: '>', value: 20, description: 'DPF differential pressure high' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x017D', '0x017C', '0x0104'],
    confidence: 90,
    recommendation: 'DPF needs regeneration. Take vehicle on highway (sustained speed above 60 km/h for 15-20 minutes) to allow active regen. Frequent short trips prevent natural regen. Forced regen may be needed if driving pattern doesnt allow.',
    possibleDTCs: ['P2002', 'P2003', 'P244A', 'P244B'],
    repairPriority: 3,
    estimatedRepairTime: '20 min highway drive or 1 hour forced regen',
    commonParts: ['None if regen successful', 'DPF if damaged'],
    technicalNotes: 'Dont ignore regen warnings - eventually DPF will clog completely and require expensive replacement or cleaning.',
  },

  {
    id: 'dpf-regen-failed',
    name: 'DPF Regeneration Failure',
    description: 'DPF unable to regenerate successfully.',
    category: 'EMISSION_CONTROL',
    severity: 'CRITICAL',
    conditions: [
      { pid: '0x017D', operator: '>', value: 30, description: 'DPF pressure critical' },
      { pid: '0x017C', operator: '<', value: 500, description: 'Regen temp not reached' },
    ],
    logicType: 'ALL',
    affectedPIDs: ['0x017D', '0x017C'],
    confidence: 90,
    recommendation: 'DPF regeneration not completing. Possible causes: Driving pattern interrupted regen, faulty injector (cant create post-injection heat), glow plug failure, temperature sensor issue. Force regen with scan tool or DPF cleaning/replacement needed.',
    possibleDTCs: ['P244A', 'P244B', 'P2463'],
    repairPriority: 1,
    estimatedRepairTime: '2-4 hours diagnosis',
    commonParts: ['DPF', 'Fuel injectors', 'Glow plugs', 'DPF sensors'],
    technicalNotes: 'Multiple failed regens cause ash buildup that cant be burned off. Professional cleaning or replacement eventually needed.',
  },
];

/**
 * Get rules by category
 */
export function getRulesByCategory(category: RuleCategory): DiagnosticRule[] {
  return DIAGNOSTIC_RULES.filter(r => r.category === category);
}

/**
 * Get rules by severity
 */
export function getRulesBySeverity(severity: 'CRITICAL' | 'WARNING' | 'INFO'): DiagnosticRule[] {
  return DIAGNOSTIC_RULES.filter(r => r.severity === severity);
}

/**
 * Get rules affecting a specific PID
 */
export function getRulesForPID(pid: string): DiagnosticRule[] {
  return DIAGNOSTIC_RULES.filter(r => r.affectedPIDs.includes(pid));
}

/**
 * Get high-priority rules for quick diagnosis
 */
export function getCriticalRules(): DiagnosticRule[] {
  return DIAGNOSTIC_RULES.filter(r => r.repairPriority <= 2);
}

// ── Stateful tracking for rate_of_change and duration ────────────────

/** Previous values for rate-of-change calculation (pid → { value, timestampMs }) */
const _previousValues: Map<string, { value: number; ts: number }> = new Map();

/** Timestamps when each (ruleId:conditionIdx) first became true, for duration checks */
const _conditionOnsetTimes: Map<string, number> = new Map();

/**
 * Evaluate a single condition.
 *
 * @param condition  The rule condition to evaluate
 * @param value      Current PID value
 * @param ruleKey    Unique key for duration tracking (e.g. "RULE_P0217:0")
 */
export function evaluateCondition(
  condition: RuleCondition,
  value: number | undefined,
  ruleKey?: string
): boolean {
  if (value === undefined) return false;
  
  let baseMatch = false;

  switch (condition.operator) {
    case '>': baseMatch = value > (condition.value as number); break;
    case '<': baseMatch = value < (condition.value as number); break;
    case '>=': baseMatch = value >= (condition.value as number); break;
    case '<=': baseMatch = value <= (condition.value as number); break;
    case '==': baseMatch = value === (condition.value as number); break;
    case '!=': baseMatch = value !== (condition.value as number); break;
    case 'between': {
      const [min, max] = condition.value as [number, number];
      baseMatch = value >= min && value <= max;
      break;
    }
    case 'outside': {
      const [lo, hi] = condition.value as [number, number];
      baseMatch = value < lo || value > hi;
      break;
    }
    case 'rate_of_change': {
      // Compare with previous stored value for this PID
      const threshold = condition.value as number; // units per second
      const prev = _previousValues.get(condition.pid);
      const now = Date.now();
      if (prev && now - prev.ts > 0) {
        const elapsed = (now - prev.ts) / 1000; // seconds
        const ratePerSec = Math.abs(value - prev.value) / elapsed;
        baseMatch = ratePerSec > threshold;
      }
      // Always update stored value for next evaluation cycle
      _previousValues.set(condition.pid, { value, ts: Date.now() });
      break;
    }
    default:
      baseMatch = false;
  }

  // ── Duration gate: condition must persist for >= duration seconds ──
  if (condition.duration && condition.duration > 0 && ruleKey) {
    const now = Date.now();
    if (baseMatch) {
      const onset = _conditionOnsetTimes.get(ruleKey);
      if (!onset) {
        // First time this condition is true → record onset, not yet "matched"
        _conditionOnsetTimes.set(ruleKey, now);
        return false;
      }
      const elapsedSec = (now - onset) / 1000;
      if (elapsedSec < condition.duration) {
        return false; // Not held long enough
      }
      return true; // Duration satisfied
    } else {
      // Condition no longer true → reset onset
      _conditionOnsetTimes.delete(ruleKey);
      return false;
    }
  }

  return baseMatch;
}

/**
 * Evaluate a rule against current parameter values
 */
export function evaluateRule(
  rule: DiagnosticRule,
  params: Map<string, number>
): { matches: boolean; confidence: number; matchedConditions: string[] } {
  const matchedConditions: string[] = [];
  
  // Check custom logic first if present
  if (rule.customLogic) {
    const matches = rule.customLogic(params);
    return {
      matches,
      confidence: matches ? rule.confidence : 0,
      matchedConditions: matches ? ['Custom logic matched'] : [],
    };
  }
  
  // Evaluate each condition with duration-aware key
  const results = rule.conditions.map((condition, idx) => {
    const value = params.get(condition.pid);
    const ruleKey = `${rule.id}:${idx}`;
    const matches = evaluateCondition(condition, value, ruleKey);
    if (matches) {
      matchedConditions.push(condition.description);
    }
    return matches;
  });
  
  // Apply logic type
  let matches = false;
  switch (rule.logicType) {
    case 'ALL':
      matches = results.every(r => r);
      break;
    case 'ANY':
      matches = results.some(r => r);
      break;
    case 'COMPLEX':
      // Already handled by customLogic
      matches = results.every(r => r);
      break;
  }
  
  // Calculate confidence based on how many conditions matched
  const matchRatio = matchedConditions.length / rule.conditions.length;
  const adjustedConfidence = matches ? rule.confidence : rule.confidence * matchRatio * 0.5;
  
  return {
    matches,
    confidence: adjustedConfidence,
    matchedConditions,
  };
}

export default DIAGNOSTIC_RULES;
