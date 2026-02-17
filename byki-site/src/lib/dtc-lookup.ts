// ============================================================
// BYKI - DTC (Diagnostic Trouble Code) Lookup Service
// Loads the 4565+ code database from /data/all-faultcodes.json
// ============================================================

export type DTCCodeCategory = 'powertrain' | 'body' | 'chassis' | 'network';
export type DTCSeverity = 'critical' | 'warning' | 'info';

export interface DTCFaultCode {
  code: string;
  category: DTCCodeCategory;
  system: string;
  severity: DTCSeverity;
  official_description: string;
  workshop_diagnosis: string;
  user_explanation: string;
  estimated_cost: { min: number; max: number; currency: string };
  common_causes: string[];
  related_codes: string[];
  repair_difficulty: 'easy' | 'moderate' | 'difficult' | 'expert';
  labor_hours: number;
}

interface DTCDatabase {
  metadata: {
    version: string;
    total_codes: number;
    last_updated: string;
    market: string;
    currency: string;
    coverage: { P_series: number; B_series: number; C_series: number; U_series: number };
  };
  codes: DTCFaultCode[];
}

// Singleton cache
let cachedDB: DTCDatabase | null = null;
let loadingPromise: Promise<DTCDatabase | null> | null = null;

/**
 * Load the DTC database (lazy, cached)
 */
export async function loadDTCDatabase(): Promise<DTCDatabase | null> {
  if (cachedDB) return cachedDB;
  if (loadingPromise) return loadingPromise;

  loadingPromise = fetch('/data/all-faultcodes.json')
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load DTC database: ${res.status}`);
      return res.json();
    })
    .then((data: DTCDatabase) => {
      cachedDB = data;
      return data;
    })
    .catch(err => {
      console.error('DTC database load error:', err);
      loadingPromise = null;
      return null;
    });

  return loadingPromise;
}

/**
 * Look up a single DTC code
 */
export async function lookupDTC(code: string): Promise<DTCFaultCode | null> {
  const db = await loadDTCDatabase();
  if (!db) return null;
  const normalised = code.toUpperCase().trim();
  return db.codes.find(c => c.code === normalised) || null;
}

/**
 * Look up multiple DTC codes at once
 */
export async function lookupDTCs(codes: string[]): Promise<Map<string, DTCFaultCode | null>> {
  const db = await loadDTCDatabase();
  const result = new Map<string, DTCFaultCode | null>();
  if (!db) {
    codes.forEach(c => result.set(c.toUpperCase().trim(), null));
    return result;
  }
  for (const code of codes) {
    const norm = code.toUpperCase().trim();
    result.set(norm, db.codes.find(c => c.code === norm) || null);
  }
  return result;
}

/**
 * Search DTC database by keyword (code, description, cause)
 */
export async function searchDTCs(keyword: string, maxResults = 20): Promise<DTCFaultCode[]> {
  const db = await loadDTCDatabase();
  if (!db) return [];
  const kw = keyword.toLowerCase().trim();
  if (!kw) return [];

  type Scored = { dtc: DTCFaultCode; score: number };
  const results: Scored[] = [];

  for (const dtc of db.codes) {
    let score = 0;

    // Exact code
    if (dtc.code.toLowerCase() === kw) {
      score = 100;
    } else if (dtc.code.toLowerCase().includes(kw)) {
      score = 80;
    } else if (
      dtc.official_description.toLowerCase().includes(kw) ||
      dtc.user_explanation.toLowerCase().includes(kw)
    ) {
      score = 50;
    } else if (dtc.common_causes.some(c => c.toLowerCase().includes(kw))) {
      score = 30;
    } else if (dtc.system.toLowerCase().includes(kw)) {
      score = 20;
    }

    if (score > 0) {
      results.push({ dtc, score });
      if (results.length > maxResults * 3) break; // perf guard
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(r => r.dtc);
}

/**
 * Get database metadata (total codes, coverage, etc.)
 */
export async function getDTCMeta(): Promise<DTCDatabase['metadata'] | null> {
  const db = await loadDTCDatabase();
  return db?.metadata || null;
}

/**
 * Helper: severity badge colour mapping
 */
export function dtcSeverityVariant(severity: DTCSeverity): 'danger' | 'warning' | 'primary' {
  switch (severity) {
    case 'critical': return 'danger';
    case 'warning': return 'warning';
    case 'info': return 'primary';
  }
}

/**
 * Helper: category label
 */
export function dtcCategoryLabel(cat: DTCCodeCategory): string {
  switch (cat) {
    case 'powertrain': return 'Powertrain';
    case 'body': return 'Body';
    case 'chassis': return 'Chassis';
    case 'network': return 'Network';
  }
}

/**
 * Helper: difficulty label
 */
export function dtcDifficultyLabel(d: string): string {
  switch (d) {
    case 'easy': return 'Easy';
    case 'moderate': return 'Moderate';
    case 'difficult': return 'Difficult';
    case 'expert': return 'Expert Only';
    default: return d;
  }
}
