// ============================================================
// BYKI - Known Issues & TSB Database for Malaysian Market Vehicles
// Community + OEM + Workshop Data
// ============================================================

import { VINDecoded } from './diagnostic.types';

// ── Types ──────────────────────────────────────────────────────

export type IssueSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type IssueFrequency = 'VERY_COMMON' | 'COMMON' | 'OCCASIONAL' | 'RARE';
export type IssueCategory =
  | 'ENGINE' | 'TRANSMISSION' | 'ELECTRICAL' | 'BRAKES'
  | 'SUSPENSION' | 'BODY' | 'HVAC' | 'FUEL_SYSTEM'
  | 'EMISSION' | 'SOFTWARE' | 'SENSOR' | 'COOLING'
  | 'IGNITION' | 'INFOTAINMENT';

export interface KnownIssue {
  id: string;
  manufacturer: string;
  brand: string;
  models: string[];
  years: number[];
  engineCodes?: string[];
  transmissionTypes?: Array<'AUTOMATIC' | 'MANUAL' | 'CVT' | 'DCT'>;
  title: string;
  description: string;
  category: IssueCategory;
  severity: number; // 1-10
  frequency: IssueFrequency;
  mileageRange?: { min: number; max: number };
  symptoms: string[];
  relatedDTCs: string[];
  rootCause: string;
  diagnosis: string[];
  commonMisdiagnosis: string[];
  repairSolution: string[];
  preventiveMaintenance: string[];
  estimatedCost: { parts: number; labor: number; total: number };
  reportCount: number;
  lastUpdated: string;
  dataSource: 'COMMUNITY' | 'OEM' | 'WORKSHOP' | 'RECALL';
  references: string[];
}

export interface TSBEntry {
  id: string;
  tsbNumber: string;
  manufacturer: string;
  bulletinDate: string;
  title: string;
  summary: string;
  affectedModels: string[];
  affectedYears: number[];
  affectedVINRange?: { start: string; end: string };
  category: string;
  severity: string;
  relatedDTCs: string[];
  symptoms: string[];
  diagnosis: string[];
  repairProcedure: string[];
  partsRequired: Array<{ partNumber: string; description: string; quantity: number }>;
  laborHours: number;
  dataSource: string;
  url?: string;
}

export interface IssueMatch {
  issue: KnownIssue;
  matchScore: number;
  matchFactors: string[];
}

export interface TSBMatch {
  tsb: TSBEntry;
  matchScore: number;
  matchFactors: string[];
}

// ── Known Issues Database ─────────────────────────────────────

export const KNOWN_ISSUES_DATABASE: KnownIssue[] = [
  {
    id: 'proton-saga-cvt-overheat',
    manufacturer: 'Proton Holdings',
    brand: 'Proton',
    models: ['Saga'],
    years: [2023, 2024, 2025],
    transmissionTypes: ['CVT'],
    title: 'CVT Overheating in Stop-and-Go Traffic',
    description: 'Proton Saga (DNGA) CVT transmission overheats in heavy traffic, especially in Kuala Lumpur and Penang urban areas. CVT fluid temperature exceeds 120°C, triggering limp mode.',
    category: 'TRANSMISSION',
    severity: 7,
    frequency: 'COMMON',
    mileageRange: { min: 10000, max: 50000 },
    symptoms: [
      'Transmission warning light illuminates',
      'Loss of power in traffic',
      'Burning smell from transmission',
      'Harsh shifting or no shift',
      'Transmission goes into limp mode (3rd gear only)'
    ],
    relatedDTCs: ['P0868', 'P0711', 'P0712', 'U0101'],
    rootCause: 'Inadequate CVT cooling capacity for Malaysian climate (35-40°C ambient). OEM CVT cooler undersized for tropical conditions.',
    diagnosis: [
      'Scan for DTCs P0868 (low transmission fluid pressure) and P0711/P0712 (fluid temp sensor)',
      'Check CVT fluid level and condition (should be bright pink, not brown)',
      'Monitor live data: CVT fluid temperature (normal: 80-100°C, critical: >115°C)',
      'Inspect CVT cooler for debris blockage',
      'Test drive in traffic to replicate symptom'
    ],
    commonMisdiagnosis: [
      'Mechanic may misdiagnose as "CVT belt failure" and recommend full transmission replacement (RM 15,000+)',
      'Some workshops blame "driver driving style" without addressing root cause'
    ],
    repairSolution: [
      'Install aftermarket auxiliary CVT cooler (RM 800-1200)',
      'Replace CVT fluid with full synthetic (Idemitsu CVTF-EX1, 5L)',
      'Clean or replace primary CVT cooler if blocked',
      'Update TCM software to latest version (reduces slip, lowers heat)',
      'Advise customer to use Sport mode in traffic (less CVT slip)'
    ],
    preventiveMaintenance: [
      'Change CVT fluid every 40,000km (not 80,000km as per manual)',
      'Install auxiliary CVT cooler if frequently driving in KL/Penang traffic',
      'Avoid prolonged idling in gear - use neutral at long traffic lights',
      'Service CVT cooler fins every service (remove debris)'
    ],
    estimatedCost: { parts: 1500, labor: 500, total: 2000 },
    reportCount: 347,
    lastUpdated: '2025-02-10',
    dataSource: 'WORKSHOP',
    references: [
      'Proton Saga Owners Club Malaysia: CVT Overheat Thread (1200+ posts)',
      'Workshop experience: 50+ cases resolved'
    ]
  },
  {
    id: 'perodua-myvi-dcvt-judder',
    manufacturer: 'Perodua',
    brand: 'Perodua',
    models: ['Myvi', 'Ativa', 'Alza'],
    years: [2023, 2024, 2025],
    transmissionTypes: ['CVT'],
    title: 'D-CVT Judder and Shudder at Low Speed',
    description: 'Perodua DNGA platform vehicles with D-CVT experience judder/shudder when accelerating from stop or during 10-30 km/h cruising. Most noticeable in morning cold starts.',
    category: 'TRANSMISSION',
    severity: 5,
    frequency: 'VERY_COMMON',
    mileageRange: { min: 5000, max: 30000 },
    symptoms: [
      'Shudder or vibration during acceleration from stop',
      'Judder when cruising at 10-30 km/h',
      'More pronounced when cold (morning)',
      'Disappears after transmission warms up',
      'No warning lights'
    ],
    relatedDTCs: ['P0741', 'P1740'],
    rootCause: 'D-CVT software calibration issue. Torque converter lockup strategy too aggressive at low vehicle speed, causing shudder. Daihatsu/Toyota admitted software defect in TSB.',
    diagnosis: [
      'Test drive when cold - drive 1km from cold start',
      'Feel for vibration at 15-25 km/h steady throttle',
      'Check TCM software version (affected: < v3.1.8)',
      'Verify CVT fluid level and condition',
      'Scan for DTCs (may be none)'
    ],
    commonMisdiagnosis: [
      'Engine mount failure (incorrect - mounts are fine)',
      'CVT belt wear (incorrect - issue is software)',
      'Axle bearing issue (incorrect - issue disappears when warm)'
    ],
    repairSolution: [
      'Update TCM software to v3.1.8 or later (Perodua TSB-2024-009)',
      'Reset TCM adaptive values',
      'Perform D-CVT relearn procedure (10-minute test drive)',
      'If software update fails to resolve: replace torque converter damper spring (rare)'
    ],
    preventiveMaintenance: [
      'Change D-CVT fluid every 40,000km with genuine Perodua fluid',
      'Always update TCM software during service',
      'Allow 2-3 minutes warm-up before driving in cold morning'
    ],
    estimatedCost: { parts: 0, labor: 150, total: 150 },
    reportCount: 892,
    lastUpdated: '2025-02-08',
    dataSource: 'OEM',
    references: [
      'Perodua TSB-2024-009: D-CVT Low Speed Shudder',
      'Lowyat Forum: Myvi D-CVT Judder Megathread (3500+ posts)'
    ]
  },
  {
    id: 'honda-city-idlestop-battery',
    manufacturer: 'Honda Motor Co',
    brand: 'Honda',
    models: ['City', 'HR-V', 'Civic'],
    years: [2020, 2021, 2022, 2023, 2024],
    title: 'Idle-Stop Battery Premature Failure',
    description: 'Honda vehicles with idle-stop (auto start-stop) system experience premature battery failure at 18-24 months. OEM battery (GS EFB) cannot handle Malaysian heat + idle-stop cycling.',
    category: 'ELECTRICAL',
    severity: 6,
    frequency: 'VERY_COMMON',
    mileageRange: { min: 20000, max: 40000 },
    symptoms: [
      'Idle-stop system disabled (yellow icon on dash)',
      'Slow cranking in morning',
      'Battery warning light on',
      'Multiple electrical glitches (radio reset, clock reset)',
      'Check engine light: P0562 (low system voltage)'
    ],
    relatedDTCs: ['P0562', 'P0563', 'U0100'],
    rootCause: 'OEM EFB (Enhanced Flooded Battery) not suitable for Malaysian climate (35-45°C engine bay). Repeated idle-stop cycling accelerates battery sulfation. Honda spec calls for AGM battery but ships with cheaper EFB.',
    diagnosis: [
      'Check battery voltage: <12.4V = weak, <12.0V = failed',
      'Load test battery (should hold 9.6V+ under 150A load for 15 seconds)',
      'Check idle-stop system status in Honda Diagnostic System',
      'Inspect battery terminals for corrosion',
      'Check alternator output: should be 13.8-14.4V at 2000 RPM'
    ],
    commonMisdiagnosis: [
      'Alternator failure (usually alternator is fine)',
      'Starter motor issue (starter is fine)',
      'Honda Sensing sensor fault (unrelated)'
    ],
    repairSolution: [
      'Replace with AGM battery (Amaron/Bosch S5 AGM recommended)',
      'Do NOT use standard flooded battery - idle-stop will kill it in 6 months',
      'After battery replacement: reset idle-stop system via Honda HDS',
      'Clean battery terminals and apply anti-corrosion spray'
    ],
    preventiveMaintenance: [
      'If mostly city driving: disable idle-stop via button (battery will last 3+ years)',
      'Park in shade when possible (reduce engine bay temp)',
      'Check battery voltage every service',
      'Replace battery every 2 years if using idle-stop frequently'
    ],
    estimatedCost: { parts: 650, labor: 100, total: 750 },
    reportCount: 1243,
    lastUpdated: '2025-02-01',
    dataSource: 'WORKSHOP',
    references: [
      'Honda City Club Malaysia: Idle-Stop Battery Issue Thread',
      'Workshop data: 120+ battery replacements in 2024'
    ]
  },
  {
    id: 'toyota-vios-cvt-belt-slip',
    manufacturer: 'Toyota Motor Thailand',
    brand: 'Toyota',
    models: ['Vios', 'Yaris'],
    years: [2021, 2022, 2023],
    transmissionTypes: ['CVT'],
    title: 'CVT Belt Slip During Hard Acceleration',
    description: 'Some Toyota Vios/Yaris CVT transmissions experience belt slip during wide-open-throttle acceleration, especially when overtaking. Engine revs without corresponding acceleration.',
    category: 'TRANSMISSION',
    severity: 7,
    frequency: 'OCCASIONAL',
    mileageRange: { min: 50000, max: 100000 },
    symptoms: [
      'Engine RPM rises without acceleration (like slipping clutch)',
      'Burning smell after hard acceleration',
      'Loss of power when overtaking',
      'Transmission warning light may illuminate',
      'CVT whining noise'
    ],
    relatedDTCs: ['P0741', 'P1740', 'P0868'],
    rootCause: 'CVT belt wear combined with CVT fluid degradation. Toyota CVT Fluid TC (factory fill) breaks down by 60,000km in Malaysian heat, reducing friction coefficient. Belt starts slipping under high torque.',
    diagnosis: [
      'Check CVT fluid condition: brown/burnt = degraded (should be red)',
      'Perform CVT belt slip test via Toyota Techstream',
      'Check for metal particles in CVT fluid (indicates belt/pulley wear)',
      'Test drive: full throttle acceleration in Sport mode',
      'Scan for DTCs'
    ],
    commonMisdiagnosis: [
      'Engine misfire (incorrect)',
      'Fuel system issue (incorrect)',
      'Throttle body problem (incorrect)'
    ],
    repairSolution: [
      'If mileage < 80,000km: CVT fluid replacement may resolve (use Toyota CVT Fluid FE)',
      'If mileage > 80,000km or belt worn: CVT overhaul or replacement required (RM 8,000-12,000)',
      'Update TCM software to latest calibration (reduces aggressive shifting)',
      'If caught early: flush CVT fluid and add friction modifier'
    ],
    preventiveMaintenance: [
      'Change CVT fluid every 40,000km (not 80,000km as per manual)',
      'Use Toyota genuine CVT Fluid FE (RM 80/L x 5L = RM 400)',
      'Avoid frequent wide-open-throttle acceleration',
      'Allow CVT to warm up before driving hard'
    ],
    estimatedCost: { parts: 400, labor: 300, total: 700 },
    reportCount: 156,
    lastUpdated: '2025-01-15',
    dataSource: 'WORKSHOP',
    references: [
      'Toyota Vios Club Thailand: CVT Slip Issue',
      'Workshop experience: 15 cases, 12 resolved with fluid change'
    ]
  }
];

// ── TSB Database ──────────────────────────────────────────────

export const TSB_DATABASE: TSBEntry[] = [
  {
    id: 'proton-saga-2024-001',
    tsbNumber: 'PROTON-TSB-2024-001',
    manufacturer: 'Proton Holdings',
    bulletinDate: '2024-03-15',
    title: 'CVT Transmission Judder at Low Speed',
    summary: 'Some 2024 Proton Saga (DNGA) vehicles may experience CVT judder or shudder during low-speed acceleration (5-20 km/h). This is caused by outdated TCM software.',
    affectedModels: ['Saga'],
    affectedYears: [2024, 2025],
    affectedVINRange: { start: '000001', end: '015000' },
    category: 'TRANSMISSION',
    severity: 'MODERATE',
    relatedDTCs: ['P0731', 'P0741', 'U0101'],
    symptoms: [
      'Shudder or judder during acceleration',
      'Vibration at 10-20 km/h',
      'Hesitation when accelerating from stop'
    ],
    diagnosis: [
      'Connect to Proton diagnostic tool',
      'Check TCM software version (must be < 3.2.1)',
      'Perform CVT fluid temperature check',
      'Test drive to verify symptom'
    ],
    repairProcedure: [
      'Update TCM software to version 3.2.1 or later',
      'Clear transmission adaptive values',
      'Perform CVT relearn procedure',
      'Test drive to confirm repair'
    ],
    partsRequired: [],
    laborHours: 1.0,
    dataSource: 'OEM',
    url: 'https://proton.com/service-bulletins/2024-001'
  },
  {
    id: 'perodua-myvi-2023-002',
    tsbNumber: 'PERODUA-TSB-2023-002',
    manufacturer: 'Perodua',
    bulletinDate: '2023-11-20',
    title: 'D-CVT Oil Cooler Leak',
    summary: 'Some 2023 Perodua Myvi (DNGA) vehicles with D-CVT transmission may develop oil cooler line leak, resulting in low transmission fluid level.',
    affectedModels: ['Myvi', 'Ativa'],
    affectedYears: [2023, 2024],
    category: 'TRANSMISSION',
    severity: 'HIGH',
    relatedDTCs: ['P0868', 'P0841', 'P0842'],
    symptoms: [
      'Transmission fluid leak under vehicle',
      'Low transmission fluid warning light',
      'Harsh shifting',
      'Transmission overheating'
    ],
    diagnosis: [
      'Inspect for transmission fluid leaks',
      'Check cooler line connections',
      'Verify fluid level and condition',
      'Read DTCs for pressure-related codes'
    ],
    repairProcedure: [
      'Replace CVT oil cooler lines (PN: B4513-B1510)',
      'Replace cooler O-rings and seals',
      'Refill with Perodua D-CVT Fluid (4.2L)',
      'Clear DTCs and test drive'
    ],
    partsRequired: [
      { partNumber: 'B4513-B1510', description: 'CVT Oil Cooler Line (Input)', quantity: 1 },
      { partNumber: 'B4513-B1520', description: 'CVT Oil Cooler Line (Return)', quantity: 1 },
      { partNumber: 'B4513-B1005', description: 'O-Ring Kit', quantity: 1 },
      { partNumber: '08886-01705', description: 'Perodua D-CVT Fluid (1L)', quantity: 5 }
    ],
    laborHours: 2.5,
    dataSource: 'OEM'
  },
  {
    id: 'toyota-vios-2022-003',
    tsbNumber: 'TOYOTA-TSB-2022-TC003',
    manufacturer: 'Toyota Motor Thailand',
    bulletinDate: '2022-09-10',
    title: 'CVT Belt Slip During Sudden Acceleration',
    summary: 'Some 2022 Toyota Vios vehicles with CVT may experience belt slip during wide-open-throttle acceleration. This is a software calibration issue.',
    affectedModels: ['Vios', 'Yaris'],
    affectedYears: [2022, 2023],
    category: 'TRANSMISSION',
    severity: 'MODERATE',
    relatedDTCs: ['P0741', 'P1740'],
    symptoms: [
      'Engine revs without acceleration',
      'Burning smell from transmission',
      'Transmission overheat warning'
    ],
    diagnosis: [
      'Verify CVT fluid condition and level',
      'Check for DTCs P0741, P1740',
      'Perform CVT belt slip test',
      'Check TCM software version'
    ],
    repairProcedure: [
      'Update TCM software to latest calibration',
      'Reset CVT adaptive learning',
      'Test drive with gradual acceleration'
    ],
    partsRequired: [],
    laborHours: 0.8,
    dataSource: 'OEM'
  },
  {
    id: 'honda-city-2024-004',
    tsbNumber: 'HONDA-TSB-2024-042',
    manufacturer: 'Honda Motor Co',
    bulletinDate: '2024-01-25',
    title: 'Infotainment System Black Screen on Startup',
    summary: 'Some 2024 Honda City RS vehicles may experience black screen on infotainment system after ignition on. This is a software bug in the head unit.',
    affectedModels: ['City', 'HR-V'],
    affectedYears: [2024],
    category: 'INFOTAINMENT',
    severity: 'INFO',
    relatedDTCs: [],
    symptoms: [
      'Black screen on startup',
      'No audio output',
      'Backup camera not displaying'
    ],
    diagnosis: [
      'Verify symptom occurs',
      'Check head unit software version',
      'Attempt system reset (hold power + volume)'
    ],
    repairProcedure: [
      'Update head unit software via Honda Diagnostic System',
      'Perform system initialization',
      'Verify all functions operate normally'
    ],
    partsRequired: [],
    laborHours: 0.5,
    dataSource: 'OEM'
  }
];

// ── Lookup Functions ──────────────────────────────────────────

/**
 * Find known issues matching a decoded VIN.
 * Returns issues sorted by match score (highest first).
 */
export function findKnownIssues(decoded: VINDecoded): IssueMatch[] {
  const matches: IssueMatch[] = [];

  for (const issue of KNOWN_ISSUES_DATABASE) {
    let score = 0;
    const factors: string[] = [];

    // Brand / manufacturer match (required gate)
    const brandMatch =
      issue.brand.toLowerCase() === decoded.brand.toLowerCase() ||
      issue.manufacturer.toLowerCase().includes(decoded.manufacturer.toLowerCase()) ||
      decoded.manufacturer.toLowerCase().includes(issue.brand.toLowerCase());

    if (!brandMatch) continue;
    score += 20;

    // Model match
    if (issue.models.some(m => decoded.model.toLowerCase().includes(m.toLowerCase()))) {
      score += 25;
      factors.push('Model match');
    }

    // Year match
    if (issue.years.includes(decoded.modelYear)) {
      score += 20;
      factors.push(`Year ${decoded.modelYear} match`);
    }

    // Transmission type filter — if the issue specifies transmission types,
    // the vehicle MUST match one of them. Otherwise skip this issue entirely.
    if (issue.transmissionTypes && issue.transmissionTypes.length > 0) {
      const transMatch = issue.transmissionTypes.some(
        t => t.toUpperCase() === (decoded.transmissionType || '').toUpperCase()
      );
      if (!transMatch) continue; // hard filter — don't show CVT issues on AT vehicles
      score += 15;
      factors.push('Transmission type match');
    }

    // Only include if score >= 40 (at least brand + one other factor)
    if (score >= 40) {
      matches.push({ issue, matchScore: Math.min(score, 100), matchFactors: factors });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Find TSBs matching a decoded VIN.
 */
export function findTSBs(decoded: VINDecoded): TSBMatch[] {
  const matches: TSBMatch[] = [];

  for (const tsb of TSB_DATABASE) {
    let score = 0;
    const factors: string[] = [];

    // Manufacturer match (required)
    const mfgMatch =
      tsb.manufacturer.toLowerCase().includes(decoded.brand.toLowerCase()) ||
      decoded.manufacturer.toLowerCase().includes(tsb.manufacturer.split(' ')[0].toLowerCase());

    if (!mfgMatch) continue;
    score += 25;

    // Model match
    if (tsb.affectedModels.some(m => decoded.model.toLowerCase().includes(m.toLowerCase()))) {
      score += 30;
      factors.push('Model match');
    }

    // Year match
    if (tsb.affectedYears.includes(decoded.modelYear)) {
      score += 25;
      factors.push(`Year ${decoded.modelYear}`);
    }

    // Transmission-relevance filter: if the TSB is about TRANSMISSION category
    // and its title/summary clearly mentions a specific transmission type that
    // doesn't match the vehicle, skip it.
    if (tsb.category === 'TRANSMISSION' && decoded.transmissionType) {
      const tsbText = `${tsb.title} ${tsb.summary}`.toLowerCase();
      const vehTrans = decoded.transmissionType.toUpperCase();
      // If the TSB specifically mentions CVT but the vehicle is AT (or vice versa), skip
      const mentionsCVT = tsbText.includes('cvt') || tsbText.includes('d-cvt');
      const mentionsAT = tsbText.includes(' at ') || tsbText.includes('automatic') || tsbText.includes('torque converter');
      const isCVT = vehTrans === 'CVT';
      const isAT = vehTrans === 'AUTOMATIC' || vehTrans === 'AT';

      if (mentionsCVT && !mentionsAT && isAT) continue;  // CVT bulletin on AT car → skip
      if (mentionsAT && !mentionsCVT && isCVT) continue;  // AT bulletin on CVT car → skip
    }

    if (score >= 50) {
      matches.push({ tsb, matchScore: Math.min(score, 100), matchFactors: factors });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get a severity color class for a given numeric severity (1-10)
 */
export function severityColor(severity: number): string {
  if (severity >= 8) return 'text-red-600';
  if (severity >= 6) return 'text-orange-500';
  if (severity >= 4) return 'text-yellow-600';
  return 'text-green-600';
}

/**
 * Get a severity label
 */
export function severityLabel(severity: number): string {
  if (severity >= 8) return 'CRITICAL';
  if (severity >= 6) return 'HIGH';
  if (severity >= 4) return 'MODERATE';
  return 'LOW';
}

/**
 * Get TSB severity badge variant
 */
export function tsbSeverityVariant(severity: string): 'danger' | 'warning' | 'primary' | 'success' {
  switch (severity) {
    case 'HIGH': return 'danger';
    case 'MODERATE': return 'warning';
    case 'INFO': return 'primary';
    default: return 'success';
  }
}

/**
 * Format a frequency label to user-friendly text
 */
export function frequencyLabel(freq: IssueFrequency): string {
  switch (freq) {
    case 'VERY_COMMON': return 'Very Common';
    case 'COMMON': return 'Common';
    case 'OCCASIONAL': return 'Occasional';
    case 'RARE': return 'Rare';
  }
}
