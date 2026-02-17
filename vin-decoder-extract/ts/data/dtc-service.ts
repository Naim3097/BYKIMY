/**
 * BYKI WORKSHOP DIAGNOSTIC - COMPREHENSIVE DTC SERVICE
 * 
 * This service provides access to the complete 4565+ DTC database
 * imported from BYKI X1 (all_faultcodes.json).
 * 
 * Features:
 * - Full P/B/C/U code coverage
 * - Search by code, description, system, or cause
 * - Grouping by system and severity
 * - Cost estimation
 * - Related codes lookup
 * - Live data correlation
 * - Report generation
 */

import type {
  DTCFaultCode,
  DTCDatabase,
  DTCCodeCategory,
  DTCSeverity,
  DTCAnalysisResult,
  DTCGroupedBySystem,
  DTCSearchResult,
  DTCLiveDataCorrelation,
  FullDTCReport,
  DTCReportSection,
  SuggestedAction,
} from './dtc-types';

// Import the comprehensive DTC database
import dtcDatabaseRaw from './all-faultcodes.json';

const dtcDatabase = dtcDatabaseRaw as DTCDatabase;

// ==========================================
// DTC LOOKUP FUNCTIONS
// ==========================================

/**
 * Get a single DTC by its code
 */
export function getDTCByCode(code: string): DTCFaultCode | null {
  const normalizedCode = code.toUpperCase().trim();
  return dtcDatabase.codes.find(c => c.code === normalizedCode) || null;
}

/**
 * Get multiple DTCs by their codes
 */
export function getDTCsByCodes(codes: string[]): Map<string, DTCFaultCode | null> {
  const result = new Map<string, DTCFaultCode | null>();
  codes.forEach(code => {
    result.set(code.toUpperCase().trim(), getDTCByCode(code));
  });
  return result;
}

/**
 * Check if a DTC code exists in the database
 */
export function isDTCKnown(code: string): boolean {
  return getDTCByCode(code) !== null;
}

/**
 * Get all DTCs for a specific category
 */
export function getDTCsByCategory(category: DTCCodeCategory): DTCFaultCode[] {
  return dtcDatabase.codes.filter(c => c.category === category);
}

/**
 * Get all DTCs for a specific severity
 */
export function getDTCsBySeverity(severity: DTCSeverity): DTCFaultCode[] {
  return dtcDatabase.codes.filter(c => c.severity === severity);
}

/**
 * Get all DTCs for a specific system
 */
export function getDTCsBySystem(system: string): DTCFaultCode[] {
  const normalizedSystem = system.toLowerCase().trim();
  return dtcDatabase.codes.filter(c => 
    c.system.toLowerCase().includes(normalizedSystem)
  );
}

/**
 * Get related DTCs for a given code
 */
export function getRelatedDTCs(code: string): DTCFaultCode[] {
  const dtc = getDTCByCode(code);
  if (!dtc || !dtc.related_codes) return [];
  
  return dtc.related_codes
    .map(relCode => getDTCByCode(relCode))
    .filter((d): d is DTCFaultCode => d !== null);
}

// ==========================================
// SEARCH FUNCTIONS
// ==========================================

/**
 * Search DTCs by keyword (searches code, description, causes)
 */
export function searchDTCs(keyword: string, maxResults: number = 50): DTCSearchResult[] {
  const normalizedKeyword = keyword.toLowerCase().trim();
  const results: DTCSearchResult[] = [];

  for (const code of dtcDatabase.codes) {
    let matchType: DTCSearchResult['matchType'] | null = null;
    let relevanceScore = 0;

    // Exact code match
    if (code.code.toLowerCase() === normalizedKeyword) {
      matchType = 'exact';
      relevanceScore = 100;
    }
    // Partial code match
    else if (code.code.toLowerCase().includes(normalizedKeyword)) {
      matchType = 'partial';
      relevanceScore = 80;
    }
    // Description match
    else if (
      code.official_description.toLowerCase().includes(normalizedKeyword) ||
      code.user_explanation.toLowerCase().includes(normalizedKeyword)
    ) {
      matchType = 'description';
      relevanceScore = 60;
    }
    // Cause match
    else if (code.common_causes.some(cause => 
      cause.toLowerCase().includes(normalizedKeyword)
    )) {
      matchType = 'cause';
      relevanceScore = 40;
    }

    if (matchType) {
      results.push({ code, matchType, relevanceScore });
    }

    if (results.length >= maxResults * 2) break;
  }

  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

/**
 * Search by system name
 */
export function searchBySystem(systemKeyword: string): DTCFaultCode[] {
  const normalized = systemKeyword.toLowerCase().trim();
  return dtcDatabase.codes.filter(c => 
    c.system.toLowerCase().includes(normalized)
  );
}

// ==========================================
// GROUPING & ANALYSIS FUNCTIONS
// ==========================================

/**
 * Group DTCs by system
 */
export function groupDTCsBySystem(codes: string[]): DTCGroupedBySystem[] {
  const dtcs = codes
    .map(code => getDTCByCode(code))
    .filter((d): d is DTCFaultCode => d !== null);

  const grouped = new Map<string, DTCFaultCode[]>();
  
  dtcs.forEach(dtc => {
    const key = `${dtc.category}:${dtc.system}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(dtc);
  });

  return Array.from(grouped.entries()).map(([key, groupCodes]) => {
    const [category, system] = key.split(':');
    const costs = groupCodes.map(c => c.estimated_cost);
    const severities = groupCodes.map(c => c.severity);
    
    return {
      system,
      category: category as DTCCodeCategory,
      codes: groupCodes,
      totalEstimatedCost: {
        min: costs.reduce((sum, c) => sum + c.min, 0),
        max: costs.reduce((sum, c) => sum + c.max, 0),
        currency: costs[0]?.currency || 'RM',
      },
      highestSeverity: severities.includes('critical') ? 'critical' :
                       severities.includes('warning') ? 'warning' : 'info',
    };
  });
}

/**
 * Analyze a set of DTCs and provide recommendations
 */
export function analyzeDTCs(codes: string[]): DTCAnalysisResult[] {
  return codes.map(code => {
    const faultCode = getDTCByCode(code);
    const relatedCodes = faultCode ? getRelatedDTCs(code) : [];
    
    const suggestedActions: SuggestedAction[] = [];
    
    if (faultCode) {
      // Generate suggested actions based on the fault code
      suggestedActions.push({
        action: `Diagnose: ${faultCode.workshop_diagnosis}`,
        priority: faultCode.severity === 'critical' ? 1 : 
                 faultCode.severity === 'warning' ? 2 : 3,
        estimatedTime: `${faultCode.labor_hours} hours`,
        difficulty: faultCode.repair_difficulty,
      });

      // Add cause-specific actions
      faultCode.common_causes.slice(0, 3).forEach((cause, index) => {
        suggestedActions.push({
          action: `Check: ${cause}`,
          priority: index + 2,
          estimatedTime: '0.5-1 hours',
          difficulty: 'moderate',
        });
      });
    }

    return {
      code: code.toUpperCase(),
      faultCode,
      isKnown: faultCode !== null,
      relatedCodes,
      suggestedActions,
      estimatedTotalCost: faultCode?.estimated_cost || { min: 0, max: 0, currency: 'RM' },
      priorityScore: faultCode ? 
        (faultCode.severity === 'critical' ? 100 :
         faultCode.severity === 'warning' ? 60 : 30) : 0,
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Get priority-sorted DTCs
 */
export function getPrioritizedDTCs(codes: string[]): DTCFaultCode[] {
  const dtcs = codes
    .map(code => getDTCByCode(code))
    .filter((d): d is DTCFaultCode => d !== null);

  return dtcs.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    
    // Sort by estimated cost (higher first)
    return b.estimated_cost.max - a.estimated_cost.max;
  });
}

// ==========================================
// COST ESTIMATION
// ==========================================

/**
 * Calculate total estimated repair cost for a set of DTCs
 */
export function calculateTotalRepairCost(codes: string[]): {
  min: number;
  max: number;
  currency: string;
  breakdown: { code: string; min: number; max: number }[];
} {
  const breakdown: { code: string; min: number; max: number }[] = [];
  let totalMin = 0;
  let totalMax = 0;

  codes.forEach(code => {
    const dtc = getDTCByCode(code);
    if (dtc) {
      breakdown.push({
        code: dtc.code,
        min: dtc.estimated_cost.min,
        max: dtc.estimated_cost.max,
      });
      totalMin += dtc.estimated_cost.min;
      totalMax += dtc.estimated_cost.max;
    }
  });

  return {
    min: totalMin,
    max: totalMax,
    currency: 'RM',
    breakdown,
  };
}

/**
 * Calculate total labor hours
 */
export function calculateTotalLaborHours(codes: string[]): number {
  return codes.reduce((total, code) => {
    const dtc = getDTCByCode(code);
    return total + (dtc?.labor_hours || 0);
  }, 0);
}

// ==========================================
// LIVE DATA CORRELATION
// ==========================================

/**
 * Get DTCs that might be triggered based on live data conditions
 * This maps PIDs to potential DTCs
 */
export function getDTCsForLiveDataAnomaly(
  anomalyType: string,
  affectedPIDs: string[]
): DTCFaultCode[] {
  const pidToSystemMap: Record<string, string[]> = {
    '0x0104': ['engine', 'fuel'],       // Engine Load
    '0x0105': ['engine', 'cooling'],    // Coolant Temp
    '0x0106': ['fuel', 'emission'],     // STFT B1
    '0x0107': ['fuel', 'emission'],     // LTFT B1
    '0x010A': ['fuel'],                 // Fuel Pressure
    '0x010B': ['engine', 'air'],        // Intake Manifold Pressure
    '0x010C': ['engine'],               // RPM
    '0x010D': ['vehicle', 'speed'],     // Vehicle Speed
    '0x010E': ['engine', 'ignition'],   // Timing Advance
    '0x010F': ['engine', 'air'],        // Intake Air Temp
    '0x0110': ['engine', 'air'],        // MAF
    '0x0111': ['engine', 'throttle'],   // Throttle Position
    '0x0114': ['emission', 'fuel'],     // O2 Sensor B1S1
    '0x0115': ['emission', 'catalyst'], // O2 Sensor B1S2
  };

  const affectedSystems = new Set<string>();
  affectedPIDs.forEach(pid => {
    const systems = pidToSystemMap[pid] || [];
    systems.forEach(s => affectedSystems.add(s));
  });

  // Find DTCs that match the affected systems
  const results: DTCFaultCode[] = [];
  affectedSystems.forEach(system => {
    const systemDTCs = getDTCsBySystem(system);
    results.push(...systemDTCs.slice(0, 10)); // Limit per system
  });

  // Remove duplicates
  const uniqueCodes = new Map<string, DTCFaultCode>();
  results.forEach(dtc => uniqueCodes.set(dtc.code, dtc));

  return Array.from(uniqueCodes.values());
}

/**
 * Known DTC to PID correlations for diagnostic cross-reference
 */
export const DTC_PID_CORRELATIONS: DTCLiveDataCorrelation[] = [
  // ---- FUEL SYSTEM ----
  {
    dtcCode: 'P0171',
    relatedPIDs: ['0x0106', '0x0107', '0x0110', '0x010B', '0x0114'],
    triggerConditions: [
      { pid: '0x0106', parameterName: 'STFT B1', operator: '>', value: 10, duration: 5 },
      { pid: '0x0107', parameterName: 'LTFT B1', operator: '>', value: 8 },
    ],
    confirmationLogic: 'STFT + LTFT > 15%',
  },
  {
    dtcCode: 'P0172',
    relatedPIDs: ['0x0106', '0x0107', '0x0110', '0x010A', '0x0114'],
    triggerConditions: [
      { pid: '0x0106', parameterName: 'STFT B1', operator: '<', value: -10, duration: 5 },
      { pid: '0x0107', parameterName: 'LTFT B1', operator: '<', value: -8 },
    ],
    confirmationLogic: 'STFT + LTFT < -15%',
  },
  {
    dtcCode: 'P0174',
    relatedPIDs: ['0x0108', '0x0109', '0x0110', '0x010B'],
    triggerConditions: [
      { pid: '0x0108', parameterName: 'STFT B2', operator: '>', value: 10, duration: 5 },
      { pid: '0x0109', parameterName: 'LTFT B2', operator: '>', value: 8 },
    ],
    confirmationLogic: 'Bank 2 STFT + LTFT > 15% — check for vacuum leak on B2 side',
  },
  {
    dtcCode: 'P0175',
    relatedPIDs: ['0x0108', '0x0109', '0x0110', '0x010A'],
    triggerConditions: [
      { pid: '0x0108', parameterName: 'STFT B2', operator: '<', value: -10, duration: 5 },
      { pid: '0x0109', parameterName: 'LTFT B2', operator: '<', value: -8 },
    ],
    confirmationLogic: 'Bank 2 running rich — check injectors and fuel pressure',
  },
  {
    dtcCode: 'P0170',
    relatedPIDs: ['0x0106', '0x0107', '0x0108', '0x0109', '0x0110'],
    triggerConditions: [
      { pid: '0x0106', parameterName: 'STFT B1', operator: 'between', value: [-25, 25] },
      { pid: '0x0107', parameterName: 'LTFT B1', operator: 'between', value: [-20, 20] },
    ],
    confirmationLogic: 'Fuel trim adaptation limit reached — look for root cause in MAF or vacuum system',
  },
  {
    dtcCode: 'P0087',
    relatedPIDs: ['0x010A', '0x010C', '0x0104'],
    triggerConditions: [
      { pid: '0x010A', parameterName: 'Fuel Pressure', operator: '<', value: 250 },
    ],
    confirmationLogic: 'Fuel rail pressure below threshold under load — check pump, filter, injectors',
  },

  // ---- MISFIRE ----
  {
    dtcCode: 'P0300',
    relatedPIDs: ['0x010C', '0x0104', '0x010E', '0x0106'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: 'between', value: [600, 900] },
      { pid: '0x0104', parameterName: 'Load', operator: '<', value: 25 },
    ],
    confirmationLogic: 'Low load at idle with fuel trim issues — random misfire',
  },
  {
    dtcCode: 'P0301',
    relatedPIDs: ['0x010C', '0x0104', '0x0106', '0x0114'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: 'between', value: [600, 900] },
    ],
    confirmationLogic: 'Cylinder 1 misfire — check coil, plug, injector on cyl 1',
  },
  {
    dtcCode: 'P0302',
    relatedPIDs: ['0x010C', '0x0104', '0x0106', '0x0114'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: 'between', value: [600, 900] },
    ],
    confirmationLogic: 'Cylinder 2 misfire — swap coil/plug between cylinders to isolate',
  },
  {
    dtcCode: 'P0303',
    relatedPIDs: ['0x010C', '0x0104', '0x0106'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: 'between', value: [600, 900] },
    ],
    confirmationLogic: 'Cylinder 3 misfire — swap coil/plug between cylinders to isolate',
  },
  {
    dtcCode: 'P0304',
    relatedPIDs: ['0x010C', '0x0104', '0x0106'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: 'between', value: [600, 900] },
    ],
    confirmationLogic: 'Cylinder 4 misfire — swap coil/plug between cylinders to isolate',
  },
  {
    dtcCode: 'P0316',
    relatedPIDs: ['0x010C', '0x0142'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: '<', value: 900 },
      { pid: '0x0142', parameterName: 'Battery Voltage', operator: '<', value: 11.5 },
    ],
    confirmationLogic: 'Misfire on startup — check battery voltage and ignition components',
  },

  // ---- O2 SENSORS ----
  {
    dtcCode: 'P0130',
    relatedPIDs: ['0x0114', '0x0106', '0x010C'],
    triggerConditions: [
      { pid: '0x0114', parameterName: 'O2 B1S1', operator: 'between', value: [0.0, 0.1] },
    ],
    confirmationLogic: 'O2 sensor B1S1 stuck lean — check heater circuit and sensor',
  },
  {
    dtcCode: 'P0137',
    relatedPIDs: ['0x0115', '0x0114', '0x0106'],
    triggerConditions: [
      { pid: '0x0115', parameterName: 'O2 B1S2', operator: '<', value: 0.1 },
    ],
    confirmationLogic: 'Downstream O2 stuck low — sensor contaminated or exhaust leak',
  },

  // ---- CATALYST ----
  {
    dtcCode: 'P0420',
    relatedPIDs: ['0x0114', '0x0115', '0x013C'],
    triggerConditions: [
      { pid: '0x0114', parameterName: 'O2 B1S1', operator: 'between', value: [0.1, 0.9] },
    ],
    confirmationLogic: 'Downstream O2 mirrors upstream switching — catalyst inefficiency',
  },
  {
    dtcCode: 'P0430',
    relatedPIDs: ['0x0118', '0x0119', '0x013E'],
    triggerConditions: [
      { pid: '0x0118', parameterName: 'O2 B2S1', operator: 'between', value: [0.1, 0.9] },
    ],
    confirmationLogic: 'Bank 2 catalyst below threshold — compare upstream vs downstream switching rate',
  },

  // ---- COOLANT / THERMOSTAT ----
  {
    dtcCode: 'P0128',
    relatedPIDs: ['0x0105', '0x010C', '0x010D'],
    triggerConditions: [
      { pid: '0x0105', parameterName: 'Coolant Temp', operator: '<', value: 75, duration: 600 },
    ],
    confirmationLogic: 'Coolant temp not reaching operating temp after 10 min drive',
  },
  {
    dtcCode: 'P0116',
    relatedPIDs: ['0x0105', '0x010F', '0x010C'],
    triggerConditions: [
      { pid: '0x0105', parameterName: 'Coolant Temp', operator: 'between', value: [-40, 10] },
    ],
    confirmationLogic: 'ECT reading implausible — compare with IAT at cold start (should be similar)',
  },
  {
    dtcCode: 'P0117',
    relatedPIDs: ['0x0105'],
    triggerConditions: [
      { pid: '0x0105', parameterName: 'Coolant Temp', operator: '>', value: 130 },
    ],
    confirmationLogic: 'ECT reading too high — sensor shorted or actual overheat',
  },
  {
    dtcCode: 'P0118',
    relatedPIDs: ['0x0105'],
    triggerConditions: [
      { pid: '0x0105', parameterName: 'Coolant Temp', operator: '<', value: -30 },
    ],
    confirmationLogic: 'ECT reading too low — sensor open circuit',
  },

  // ---- MAF / AIR FLOW ----
  {
    dtcCode: 'P0101',
    relatedPIDs: ['0x0110', '0x0104', '0x010C', '0x0111'],
    triggerConditions: [
      { pid: '0x0110', parameterName: 'MAF', operator: '<', value: 5 },
      { pid: '0x010C', parameterName: 'RPM', operator: '>', value: 2000 },
    ],
    confirmationLogic: 'MAF reading low for RPM — sensor dirty or intake leak',
  },
  {
    dtcCode: 'P0102',
    relatedPIDs: ['0x0110', '0x010C'],
    triggerConditions: [
      { pid: '0x0110', parameterName: 'MAF', operator: '<', value: 2 },
    ],
    confirmationLogic: 'MAF signal too low — open circuit or sensor failure',
  },
  {
    dtcCode: 'P0103',
    relatedPIDs: ['0x0110', '0x010C'],
    triggerConditions: [
      { pid: '0x0110', parameterName: 'MAF', operator: '>', value: 250 },
    ],
    confirmationLogic: 'MAF signal too high — check for short circuit or water ingestion',
  },

  // ---- IAT ----
  {
    dtcCode: 'P0110',
    relatedPIDs: ['0x010F', '0x0105'],
    triggerConditions: [
      { pid: '0x010F', parameterName: 'IAT', operator: 'between', value: [-40, -40] },
    ],
    confirmationLogic: 'IAT sensor circuit malfunction — check wiring/connector',
  },
  {
    dtcCode: 'P0113',
    relatedPIDs: ['0x010F'],
    triggerConditions: [
      { pid: '0x010F', parameterName: 'IAT', operator: '<', value: -30 },
    ],
    confirmationLogic: 'IAT sensor reading too low — open circuit',
  },

  // ---- THROTTLE ----
  {
    dtcCode: 'P0121',
    relatedPIDs: ['0x0111', '0x0104', '0x010C'],
    triggerConditions: [
      { pid: '0x0111', parameterName: 'Throttle Pos', operator: 'between', value: [0, 100] },
    ],
    confirmationLogic: 'TPS range/performance — erratic readings indicate sensor or wiring issue',
  },
  {
    dtcCode: 'P0122',
    relatedPIDs: ['0x0111'],
    triggerConditions: [
      { pid: '0x0111', parameterName: 'Throttle Pos', operator: '<', value: 1 },
    ],
    confirmationLogic: 'TPS signal low — check 5V reference and ground circuit',
  },

  // ---- IDLE CONTROL ----
  {
    dtcCode: 'P0505',
    relatedPIDs: ['0x010C', '0x0111', '0x0104'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: 'between', value: [400, 1800] },
    ],
    confirmationLogic: 'Idle control system malfunction — check IAC valve or throttle body',
  },
  {
    dtcCode: 'P0507',
    relatedPIDs: ['0x010C', '0x0111', '0x0104'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: '>', value: 900 },
      { pid: '0x0111', parameterName: 'Throttle Pos', operator: '<', value: 5 },
    ],
    confirmationLogic: 'Idle RPM too high — vacuum leak, dirty throttle, or IAC stuck open',
  },

  // ---- CKP / CMP ----
  {
    dtcCode: 'P0335',
    relatedPIDs: ['0x010C'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: '<', value: 100 },
    ],
    confirmationLogic: 'CKP no signal — engine cranks but RPM reads 0, sensor or reluctor fault',
  },
  {
    dtcCode: 'P0340',
    relatedPIDs: ['0x010C'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: '<', value: 200 },
    ],
    confirmationLogic: 'CMP no signal — check sensor, wiring, and timing chain/belt condition',
  },
  {
    dtcCode: 'P0016',
    relatedPIDs: ['0x010C', '0x0104'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: 'between', value: [600, 3000] },
    ],
    confirmationLogic: 'CKP-CMP correlation — timing chain stretch, VVT solenoid, or sensor drift',
  },

  // ---- VVT ----
  {
    dtcCode: 'P0011',
    relatedPIDs: ['0x010C', '0x0104'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: '>', value: 800 },
    ],
    confirmationLogic: 'Intake cam timing over-advanced — check oil level, VVT solenoid, chain tension',
  },
  {
    dtcCode: 'P0014',
    relatedPIDs: ['0x010C', '0x0104'],
    triggerConditions: [
      { pid: '0x010C', parameterName: 'RPM', operator: '>', value: 800 },
    ],
    confirmationLogic: 'Exhaust cam timing over-advanced — check CVVT solenoid, oil condition',
  },

  // ---- EVAP ----
  {
    dtcCode: 'P0440',
    relatedPIDs: ['0x010B'],
    triggerConditions: [],
    confirmationLogic: 'EVAP system malfunction — check fuel cap, purge valve, canister',
  },
  {
    dtcCode: 'P0441',
    relatedPIDs: ['0x010B', '0x0106'],
    triggerConditions: [
      { pid: '0x0106', parameterName: 'STFT B1', operator: 'between', value: [-5, 5] },
    ],
    confirmationLogic: 'EVAP purge flow fault — purge valve not affecting fuel trims when commanded',
  },
  {
    dtcCode: 'P0443',
    relatedPIDs: ['0x010B'],
    triggerConditions: [],
    confirmationLogic: 'EVAP purge valve circuit — check connector and wiring for corrosion',
  },

  // ---- EGR ----
  {
    dtcCode: 'P0401',
    relatedPIDs: ['0x010C', '0x0104', '0x010F'],
    triggerConditions: [
      { pid: '0x0104', parameterName: 'Load', operator: '>', value: 30 },
      { pid: '0x010C', parameterName: 'RPM', operator: '>', value: 1500 },
    ],
    confirmationLogic: 'EGR insufficient flow — check valve, passages, position sensor',
  },

  // ---- TURBO / BOOST ----
  {
    dtcCode: 'P0299',
    relatedPIDs: ['0x010B', '0x0104', '0x010C', '0x0111'],
    triggerConditions: [
      { pid: '0x010B', parameterName: 'Intake Manifold', operator: '<', value: 100 },
      { pid: '0x0104', parameterName: 'Load', operator: '<', value: 40 },
    ],
    confirmationLogic: 'Underboost — check wastegate, boost pressure sensor, intercooler for leaks',
  },
  {
    dtcCode: 'P0234',
    relatedPIDs: ['0x010B', '0x0104', '0x010C'],
    triggerConditions: [
      { pid: '0x010B', parameterName: 'Intake Manifold', operator: '>', value: 200 },
    ],
    confirmationLogic: 'Overboost — wastegate stuck closed or boost control solenoid fault',
  },

  // ---- BATTERY / CHARGING ----
  {
    dtcCode: 'P0562',
    relatedPIDs: ['0x0142', '0x010C'],
    triggerConditions: [
      { pid: '0x0142', parameterName: 'Control Module Voltage', operator: '<', value: 11.5 },
    ],
    confirmationLogic: 'System voltage low — check battery, alternator, ground cables',
  },
  {
    dtcCode: 'P0563',
    relatedPIDs: ['0x0142', '0x010C'],
    triggerConditions: [
      { pid: '0x0142', parameterName: 'Control Module Voltage', operator: '>', value: 16.0 },
    ],
    confirmationLogic: 'System voltage high — alternator overcharging, voltage regulator fault',
  },

  // ---- TRANSMISSION ----
  {
    dtcCode: 'P0700',
    relatedPIDs: ['0x010C', '0x010D', '0x010E'],
    triggerConditions: [],
    confirmationLogic: 'TCM fault flag — read transmission-specific codes for root cause',
  },
  {
    dtcCode: 'P0730',
    relatedPIDs: ['0x010C', '0x010D'],
    triggerConditions: [
      { pid: '0x010D', parameterName: 'Vehicle Speed', operator: '>', value: 20 },
    ],
    confirmationLogic: 'Incorrect gear ratio — compare engine RPM vs vehicle speed for gear slip',
  },
  {
    dtcCode: 'P0715',
    relatedPIDs: ['0x010C', '0x010D'],
    triggerConditions: [
      { pid: '0x010D', parameterName: 'Vehicle Speed', operator: '>', value: 10 },
    ],
    confirmationLogic: 'Input speed sensor circuit — check sensor, connector, ATF level',
  },
  {
    dtcCode: 'P0720',
    relatedPIDs: ['0x010D', '0x010C'],
    triggerConditions: [
      { pid: '0x010D', parameterName: 'Vehicle Speed', operator: '<', value: 5 },
    ],
    confirmationLogic: 'Output speed sensor — no speed signal despite vehicle moving',
  },

  // ---- COMMUNICATION ----
  {
    dtcCode: 'U0100',
    relatedPIDs: ['0x0142'],
    triggerConditions: [
      { pid: '0x0142', parameterName: 'Control Module Voltage', operator: '<', value: 11.0 },
    ],
    confirmationLogic: 'Lost comm with ECM — check battery voltage, CAN bus wiring, ECM power',
  },
  {
    dtcCode: 'U0121',
    relatedPIDs: ['0x0142'],
    triggerConditions: [],
    confirmationLogic: 'Lost comm with ABS/ESC — check CAN wiring to ABS module, module power supply',
  },

  // ---- THROTTLE BODY / DRIVE-BY-WIRE ----
  {
    dtcCode: 'P2101',
    relatedPIDs: ['0x0111', '0x0104', '0x010C'],
    triggerConditions: [
      { pid: '0x0111', parameterName: 'Throttle Pos', operator: '<', value: 10 },
    ],
    confirmationLogic: 'Throttle motor stuck — carbon buildup, motor failure, or relay fault',
  },
  {
    dtcCode: 'P2135',
    relatedPIDs: ['0x0111', '0x010C'],
    triggerConditions: [],
    confirmationLogic: 'TPS A/B voltage mismatch — throttle body replacement usually needed',
  },
];

// ==========================================
// REPORT GENERATION
// ==========================================

/**
 * Generate a full diagnostic report
 */
export function generateDTCReport(
  codes: string[],
  vehicleInfo?: Partial<FullDTCReport['vehicleInfo']>
): FullDTCReport {
  const allDTCs = codes
    .map(code => getDTCByCode(code))
    .filter((d): d is DTCFaultCode => d !== null);

  const critical = allDTCs.filter(d => d.severity === 'critical');
  const warning = allDTCs.filter(d => d.severity === 'warning');
  const info = allDTCs.filter(d => d.severity === 'info');

  const createSection = (codes: DTCFaultCode[], severity: string): DTCReportSection => {
    const totalMin = codes.reduce((sum, c) => sum + c.estimated_cost.min, 0);
    const totalMax = codes.reduce((sum, c) => sum + c.estimated_cost.max, 0);
    
    return {
      title: `${severity.charAt(0).toUpperCase() + severity.slice(1)} Issues`,
      codes,
      summary: codes.length > 0 
        ? `${codes.length} ${severity} issue(s) found affecting: ${[...new Set(codes.map(c => c.system))].join(', ')}`
        : `No ${severity} issues found`,
      totalCost: { min: totalMin, max: totalMax, currency: 'RM' },
      recommendedPriority: severity === 'critical' ? 1 : severity === 'warning' ? 2 : 3,
    };
  };

  const totalCost = calculateTotalRepairCost(codes);
  const totalLabor = calculateTotalLaborHours(codes);
  const systemsAffected = [...new Set(allDTCs.map(d => d.system))];

  const recommendations: string[] = [];
  if (critical.length > 0) {
    recommendations.push('⚠️ CRITICAL: Stop driving and address critical issues immediately');
    critical.forEach(c => {
      recommendations.push(`• ${c.code}: ${c.workshop_diagnosis}`);
    });
  }
  if (warning.length > 0) {
    recommendations.push('⚡ WARNING: Schedule service soon for warning-level issues');
  }
  if (info.length > 0) {
    recommendations.push('ℹ️ INFO: Monitor informational codes during regular service');
  }

  return {
    vehicleInfo: vehicleInfo || {},
    scanDate: new Date(),
    totalCodesFound: codes.length,
    criticalCodes: createSection(critical, 'critical'),
    warningCodes: createSection(warning, 'warning'),
    infoCodes: createSection(info, 'info'),
    systemsAffected,
    estimatedTotalRepairCost: totalCost,
    estimatedTotalLaborHours: totalLabor,
    recommendations,
  };
}

// ==========================================
// METADATA & STATISTICS
// ==========================================

/**
 * Get database metadata
 */
export function getDTCDatabaseMetadata(): DTCDatabase['metadata'] {
  return dtcDatabase.metadata;
}

/**
 * Get category information
 */
export function getDTCCategories(): DTCDatabase['categories'] {
  return dtcDatabase.categories;
}

/**
 * Get severity level definitions
 */
export function getSeverityLevels(): DTCDatabase['severity_levels'] {
  return dtcDatabase.severity_levels;
}

/**
 * Get total count of codes in database
 */
export function getTotalDTCCount(): number {
  return dtcDatabase.codes.length;
}

/**
 * Get code distribution by category
 */
export function getDTCDistribution(): Record<DTCCodeCategory, number> {
  return {
    powertrain: dtcDatabase.codes.filter(c => c.category === 'powertrain').length,
    body: dtcDatabase.codes.filter(c => c.category === 'body').length,
    chassis: dtcDatabase.codes.filter(c => c.category === 'chassis').length,
    network: dtcDatabase.codes.filter(c => c.category === 'network').length,
  };
}

/**
 * Get all unique systems in the database
 */
export function getAllSystems(): string[] {
  const systems = new Set<string>();
  dtcDatabase.codes.forEach(c => systems.add(c.system));
  return Array.from(systems).sort();
}

// ==========================================
// EXPORT DATABASE FOR DIRECT ACCESS
// ==========================================

export { dtcDatabase };
export default dtcDatabase;
