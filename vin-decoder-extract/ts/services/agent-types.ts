// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - AGENT TYPE MAPPERS
// Maps Rust agent DTOs → Frontend types
// ============================================================

import {
  ECUInfo,
  ECUType,
  ECUStatus,
  CommunicationQuality,
  DiagnosticTroubleCode,
  DTCStatus,
  DTCSeverity,
  DTCCategory,
  LiveDataParameter,
  LiveDataCategory,
  FreezeFrameData as FrontendFreezeFrame,
} from '@/types';
import { getDTCByCode } from '@/data/dtc-service';
import { OBD2_PARAMETERS } from '@/data/obd2-parameters';
import type { DiscoveredEcu, DtcResult, PidValue } from './agent-bridge';

// ============ ECU Mapping ============

const ECU_ADDRESS_MAP: Record<number, { type: ECUType; name: string }> = {
  0x7E0: { type: 'ECM', name: 'Engine Control Module' },
  0x7E1: { type: 'TCM', name: 'Transmission Control Module' },
  0x7E2: { type: 'ABS', name: 'Anti-lock Braking System' },
  0x7E3: { type: 'SRS', name: 'Supplemental Restraint System' },
  0x7E4: { type: 'BCM', name: 'Body Control Module' },
  0x7E5: { type: 'EPS', name: 'Electric Power Steering' },
  0x7E6: { type: 'HVAC', name: 'Climate Control Module' },
  0x7E7: { type: 'IPC', name: 'Instrument Panel Cluster' },
  0x7B0: { type: 'ABS', name: 'Anti-lock Braking System' },
  0x7B7: { type: 'SRS', name: 'Supplemental Restraint System' },
  0x7C6: { type: 'BCM', name: 'Body Control Module' },
  0x7A0: { type: 'EPS', name: 'Electric Power Steering' },
  0x7A8: { type: 'IMMO', name: 'Immobilizer' },
};

export function mapEcuAddressToType(requestId: number): ECUType {
  return ECU_ADDRESS_MAP[requestId]?.type || 'OTHER';
}

export function mapDiscoveredEcu(dto: DiscoveredEcu): ECUInfo {
  const mapped = ECU_ADDRESS_MAP[dto.request_arb_id];
  const quality: CommunicationQuality =
    dto.response_time_ms < 100 ? 'EXCELLENT' :
    dto.response_time_ms < 300 ? 'GOOD' :
    dto.response_time_ms < 600 ? 'FAIR' : 'POOR';

  return {
    type: mapped?.type || (dto.ecu_type as ECUType) || 'OTHER',
    name: mapped?.name || dto.name || `ECU 0x${dto.request_arb_id.toString(16).toUpperCase()}`,
    address: dto.request_arb_id.toString(16).toUpperCase(),
    status: 'ONLINE' as ECUStatus,
    protocol: dto.protocol as any || 'CAN_11BIT_500K',
    firmwareVersion: dto.firmware_version || null,
    hardwareVersion: dto.hardware_version || null,
    partNumber: null,
    voltage: dto.voltage || null,
    communicationQuality: quality,
    dtcCount: { stored: 0, pending: 0, permanent: 0, history: 0 },
    lastResponse: new Date(),
    scanDuration: dto.response_time_ms,
  };
}

// ============ DTC Mapping ============

export function mapDtcResult(
  dto: DtcResult,
  category: 'confirmed' | 'pending' | 'permanent'
): DiagnosticTroubleCode {
  const status: DTCStatus =
    category === 'confirmed' ? 'STORED' :
    category === 'pending' ? 'PENDING' : 'PERMANENT';

  const dtcInfo = getDTCByCode(dto.code);
  const dtcCategory: DTCCategory =
    dto.code.startsWith('P') ? 'POWERTRAIN' :
    dto.code.startsWith('C') ? 'CHASSIS' :
    dto.code.startsWith('B') ? 'BODY' :
    dto.code.startsWith('U') ? 'NETWORK' : 'MANUFACTURER';

  // Derive source ECU from DTC prefix + sub-range
  // P00xx-P06xx = ECM (engine), P07xx = TCM (transmission)
  // P08xx-P09xx = ECM, P0Axx = Hybrid, P2xxx/P3xxx = manufacturer
  const getEcuFromCode = (code: string): string => {
    if (code.startsWith('C')) return 'ABS';
    if (code.startsWith('B')) return 'BCM';
    if (code.startsWith('U')) return 'GW';
    if (code.startsWith('P')) {
      const numPart = code.slice(1);
      // P07xx are transmission codes
      if (numPart.startsWith('07')) return 'TCM';
      // P06xx upper range (P060x-P069x) can be ECM monitoring
      // P0Axx are hybrid/EV battery codes
      if (numPart.startsWith('0A')) return 'HV_BATT';
      return 'ECM';
    }
    return 'ECM';
  };
  const sourceECU = getEcuFromCode(dto.code);

  const defaultSeverity: DTCSeverity =
    category === 'permanent' ? 8 :
    category === 'confirmed' ? 6 : 3;

  const severityMap: Record<string, DTCSeverity> = {
    critical: 9,
    warning: 6,
    info: 3,
  };

  return {
    code: dto.code,
    status,
    sourceECU: sourceECU as any,
    definition: dtcInfo ? {
      code: dto.code,
      description: dtcInfo.official_description || dto.description || 'Unknown fault',
      oemDescription: null,
      system: (dtcInfo.system || 'ECM') as ECUType,
      category: dtcCategory,
      severity: severityMap[dtcInfo.severity] ?? defaultSeverity,
      driveImpact: defaultSeverity >= 8 ? 'HIGH' : defaultSeverity >= 6 ? 'MEDIUM' : 'LOW',
      safetyImpact: dtcCategory === 'CHASSIS' || dtcCategory === 'BODY',
      emissionRelevant: dtcCategory === 'POWERTRAIN',
      possibleCauses: dtcInfo.common_causes || [],
      possibleSymptoms: [dtcInfo.workshop_diagnosis || dtcInfo.user_explanation].filter(Boolean),
      recommendedActions: [],
      relatedCodes: dtcInfo.related_codes || [],
    } : {
      code: dto.code,
      description: dto.description || 'Unknown fault code',
      oemDescription: null,
      system: 'ECM',
      category: dtcCategory,
      severity: defaultSeverity,
      driveImpact: 'MEDIUM',
      safetyImpact: false,
      emissionRelevant: dtcCategory === 'POWERTRAIN',
      possibleCauses: [],
      possibleSymptoms: [],
      recommendedActions: ['Investigate further'],
      relatedCodes: [],
    },
    freezeFrame: null,
    firstDetected: new Date(),
    occurrenceCount: 1,
    clearedHistory: [],
  };
}

// ============ PID Mapping ============

const PID_CATEGORY_MAP: Record<number, LiveDataCategory> = {
  0x04: 'ENGINE_CORE',     // Engine Load
  0x05: 'TEMPERATURE',     // Coolant Temp
  0x06: 'FUEL_SYSTEM',     // STFT B1
  0x07: 'FUEL_SYSTEM',     // LTFT B1
  0x0B: 'ENGINE_CORE',     // Intake MAP
  0x0C: 'ENGINE_CORE',     // RPM
  0x0D: 'SPEED_LOAD',      // Speed
  0x0E: 'IGNITION',        // Timing Advance
  0x0F: 'TEMPERATURE',     // Intake Air Temp
  0x10: 'FUEL_SYSTEM',     // MAF
  0x11: 'ENGINE_CORE',     // Throttle
  0x14: 'OXYGEN_SENSORS',  // O2 B1S1
  0x1F: 'ENGINE_CORE',     // Runtime
  0x21: 'ENGINE_CORE',     // Distance w/ MIL
  0x2F: 'FUEL_SYSTEM',     // Fuel Level
  0x31: 'ENGINE_CORE',     // Distance since clear
  0x33: 'ENGINE_CORE',     // Barometric pressure
  0x42: 'VOLTAGE',         // Control module voltage
  0x46: 'TEMPERATURE',     // Ambient temp
  0x49: 'ENGINE_CORE',     // Accelerator pedal
  0x4C: 'ENGINE_CORE',     // Commanded throttle
  0x5C: 'TEMPERATURE',     // Oil temp
};

const PID_NORMAL_RANGES: Record<number, { min: number; max: number }> = {
  0x04: { min: 0, max: 100 },
  0x05: { min: -40, max: 215 },
  0x06: { min: -100, max: 99.2 },
  0x07: { min: -100, max: 99.2 },
  0x0B: { min: 0, max: 255 },
  0x0C: { min: 0, max: 16384 },
  0x0D: { min: 0, max: 255 },
  0x0E: { min: -64, max: 63.5 },
  0x0F: { min: -40, max: 215 },
  0x10: { min: 0, max: 655.35 },
  0x11: { min: 0, max: 100 },
  0x14: { min: 0, max: 1.275 },
  0x1F: { min: 0, max: 65535 },
  0x21: { min: 0, max: 65535 },
  0x2F: { min: 0, max: 100 },
  0x31: { min: 0, max: 65535 },
  0x33: { min: 0, max: 255 },
  0x42: { min: 0, max: 65.535 },
  0x46: { min: -40, max: 215 },
  0x49: { min: 0, max: 100 },
  0x4C: { min: 0, max: 100 },
  0x5C: { min: -40, max: 210 },
};

/**
 * Tropical climate adjustments for ASEAN/MY market.
 * Shifts normal operating ranges to account for higher ambient temps.
 */
const TROPICAL_ADJUSTMENTS: Record<number, { minDelta: number; maxDelta: number }> = {
  0x05: { minDelta: 0, maxDelta: 10 },   // Coolant temp: up to 115°C normal in tropics
  0x0F: { minDelta: 0, maxDelta: 15 },   // Intake air temp: higher ambient (up to 50°C+)
  0x46: { minDelta: 5, maxDelta: 15 },   // Ambient temp: tropical baseline higher
  0x5C: { minDelta: 0, maxDelta: 10 },   // Oil temp: runs hotter in tropical climate
};

/** Get PID normal range adjusted for region */
function getRegionAdjustedRange(
  pid: number,
  region?: string
): { min: number; max: number } | null {
  const base = PID_NORMAL_RANGES[pid];
  if (!base) return null;
  if (region === 'MY' || region === 'ASEAN') {
    const adj = TROPICAL_ADJUSTMENTS[pid];
    if (adj) {
      return {
        min: base.min + adj.minDelta,
        max: base.max + adj.maxDelta,
      };
    }
  }
  return base;
}

export function mapPidValue(dto: PidValue, region?: string): LiveDataParameter {
  const normalRange = getRegionAdjustedRange(dto.pid, region) || PID_NORMAL_RANGES[dto.pid] || null;
  const category = PID_CATEGORY_MAP[dto.pid] || 'ENGINE_CORE';
  const rangeSpan = normalRange ? normalRange.max - normalRange.min : 1;
  const midpoint = normalRange ? (normalRange.max + normalRange.min) / 2 : dto.value;
  const deviation = normalRange
    ? Math.abs(((dto.value - midpoint) / (rangeSpan / 2)) * 100)
    : 0;

  return {
    pid: `0x01${dto.pid.toString(16).padStart(2, '0').toUpperCase()}`,
    name: dto.name,
    value: Math.round(dto.value * 100) / 100,
    unit: dto.unit,
    normalRange,
    currentDeviation: Math.round(deviation * 10) / 10,
    confidence: 1,
    category,
    description: dto.name,
    lastUpdated: new Date(),
  };
}

// ============ Freeze Frame Mapping ============

export function mapFreezeFrame(dto: {
  dtcCode: string;
  values: { pid: number; name: string; value: number; unit: string }[];
}): FrontendFreezeFrame {
  return {
    timestamp: new Date(),
    engineRPM: dto.values.find((v) => v.pid === 0x0C)?.value ?? null,
    vehicleSpeed: dto.values.find((v) => v.pid === 0x0D)?.value ?? null,
    coolantTemp: dto.values.find((v) => v.pid === 0x05)?.value ?? null,
    engineLoad: dto.values.find((v) => v.pid === 0x04)?.value ?? null,
    fuelPressure: null,
    intakeMAP: dto.values.find((v) => v.pid === 0x0B)?.value ?? null,
    intakeAirTemp: dto.values.find((v) => v.pid === 0x0F)?.value ?? null,
    throttlePosition: dto.values.find((v) => v.pid === 0x11)?.value ?? null,
    oxygenSensorReadings: {},
    fuelTrimShort: dto.values.find((v) => v.pid === 0x06)?.value ?? null,
    fuelTrimLong: dto.values.find((v) => v.pid === 0x07)?.value ?? null,
  };
}

// ============ Health Score Calculation ============

export function calculateOverallHealthScore(
  tests: { healthPct: number }[]
): number {
  if (tests.length === 0) return 100;
  const sum = tests.reduce((s, t) => s + t.healthPct, 0);
  return Math.round((sum / tests.length) * 10) / 10;
}

// ============ Diagnostic Narrative Generator ============

export function generateDiagnosticNarrative(data: {
  vinData?: { brand: string; model: string; modelYear: number } | null;
  confirmedDtcs: DiagnosticTroubleCode[];
  pendingDtcs: DiagnosticTroubleCode[];
  permanentDtcs: DiagnosticTroubleCode[];
  monitoringTests: { component: string; healthPct: number }[];
  freezeFrames: Record<string, FrontendFreezeFrame>;
}): string {
  const lines: string[] = [];
  const vehicle = data.vinData
    ? `${data.vinData.modelYear} ${data.vinData.brand} ${data.vinData.model}`
    : 'Vehicle';

  lines.push(`**Diagnostic Summary — ${vehicle}**\n`);

  // Confirmed DTCs
  if (data.confirmedDtcs.length > 0) {
    for (const dtc of data.confirmedDtcs) {
      lines.push(`**Active Fault: ${dtc.code} — ${dtc.definition.description}**`);
      const ff = data.freezeFrames[dtc.code];
      if (ff) {
        const parts: string[] = [];
        if (ff.engineRPM != null) parts.push(`RPM ${ff.engineRPM.toLocaleString()}`);
        if (ff.vehicleSpeed != null) parts.push(`Speed ${ff.vehicleSpeed} km/h`);
        if (ff.coolantTemp != null) parts.push(`Coolant ${ff.coolantTemp}°C`);
        if (ff.engineLoad != null) parts.push(`Load ${ff.engineLoad}%`);
        if (parts.length > 0) {
          lines.push(`At fault trigger: ${parts.join(', ')}.`);
        }
      }
      if (dtc.definition.possibleCauses.length > 0) {
        lines.push(`Likely causes: ${dtc.definition.possibleCauses.slice(0, 3).join('; ')}.`);
      }
      lines.push('');
    }
  } else {
    lines.push('No active fault codes detected.\n');
  }

  // Pending DTCs
  if (data.pendingDtcs.length > 0) {
    lines.push(`**Pending Faults (may confirm soon):**`);
    for (const dtc of data.pendingDtcs) {
      lines.push(`- ${dtc.code}: ${dtc.definition.description}`);
    }
    lines.push('');
  }

  // Permanent DTCs
  if (data.permanentDtcs.length > 0) {
    lines.push(`**Permanent Faults (require drive cycle to clear):**`);
    for (const dtc of data.permanentDtcs) {
      lines.push(`- ${dtc.code}: ${dtc.definition.description}`);
    }
    lines.push('');
  }

  // Health predictions
  const failing = data.monitoringTests.filter((t) => t.healthPct < 20);
  if (failing.length > 0) {
    lines.push(`**Components Approaching Failure:**`);
    for (const t of failing) {
      lines.push(`- ${t.component}: ${t.healthPct.toFixed(1)}% margin remaining`);
    }
    lines.push('');
  }

  // Recommendation
  if (data.confirmedDtcs.length > 0) {
    lines.push(`**Recommendation:** Address ${data.confirmedDtcs[0].code} first. Re-scan after repair to verify fix and check if related faults clear.`);
  } else if (failing.length > 0) {
    lines.push(`**Recommendation:** Monitor ${failing[0].component} closely — preventive maintenance recommended before fault code triggers.`);
  } else {
    lines.push(`**Recommendation:** Vehicle systems are operating within normal parameters. Schedule next check-up per manufacturer interval.`);
  }

  return lines.join('\n');
}
