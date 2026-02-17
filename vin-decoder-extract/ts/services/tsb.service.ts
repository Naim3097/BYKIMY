// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - TSB SERVICE
// Technical Service Bulletin Integration
// Data Source: NHTSA TSB Database + OEM Resources
// ============================================================

import { VINDecoded } from '@/types';

export interface TSB {
  id: string;
  tsbNumber: string;
  manufacturer: string;
  bulletinDate: string;
  title: string;
  summary: string;
  affectedModels: string[];
  affectedYears: number[];
  affectedVINRange?: {
    start: string;
    end: string;
  };
  category: TSBCategory;
  severity: 'INFO' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  relatedDTCs: string[];
  symptoms: string[];
  diagnosis: string[];
  repairProcedure: string[];
  partsRequired: Array<{
    partNumber: string;
    description: string;
    quantity: number;
  }>;
  laborHours: number;
  supersededBy?: string;
  dataSource: 'NHTSA' | 'OEM' | 'COMMUNITY';
  url?: string;
}

export type TSBCategory =
  | 'ENGINE'
  | 'TRANSMISSION'
  | 'ELECTRICAL'
  | 'BRAKES'
  | 'SUSPENSION'
  | 'BODY'
  | 'HVAC'
  | 'INFOTAINMENT'
  | 'SAFETY'
  | 'EMISSION'
  | 'FUEL_SYSTEM'
  | 'SOFTWARE_UPDATE'
  | 'OTHER';

export interface TSBMatch {
  tsb: TSB;
  matchConfidence: number; // 0-100
  matchReason: string[];
}

export class TSBService {
  private tsbDatabase: TSB[] = [];
  private nhtsaApiBase = 'https://api.nhtsa.gov/products/vehicle/tsbs';
  private dataLoaded = false;

  constructor() {
    this.loadLocalTSBDatabase();
  }

  /**
   * Find TSBs relevant to a specific VIN
   */
  async findTSBsByVIN(vinData: VINDecoded, currentDTCs?: string[]): Promise<TSBMatch[]> {
    await this.ensureLoaded();
    const matches: TSBMatch[] = [];

    // Filter by manufacturer and model year
    const relevantTSBs = this.tsbDatabase.filter(tsb => 
      tsb.manufacturer.toLowerCase() === vinData.manufacturer.toLowerCase() &&
      tsb.affectedYears.includes(vinData.modelYear) &&
      (tsb.affectedModels.length === 0 || tsb.affectedModels.some(model => 
        vinData.model.toLowerCase().includes(model.toLowerCase())
      ))
    );

    for (const tsb of relevantTSBs) {
      const matchReason: string[] = [];
      let confidence = 50; // Base confidence for manufacturer + year match

      // Check VIN range if specified
      if (tsb.affectedVINRange) {
        const vinSerial = vinData.serialNumber;
        if (vinSerial >= tsb.affectedVINRange.start && vinSerial <= tsb.affectedVINRange.end) {
          confidence += 30;
          matchReason.push('VIN within affected range');
        }
      } else {
        confidence += 10; // No VIN restriction means broader applicability
      }

      // Check if current DTCs are mentioned in TSB
      if (currentDTCs && currentDTCs.length > 0) {
        const dtcMatch = tsb.relatedDTCs.some(tsbDtc => 
          currentDTCs.includes(tsbDtc)
        );
        if (dtcMatch) {
          confidence += 20;
          matchReason.push('Active DTC matches TSB');
        }
      }

      // Check model match
      if (tsb.affectedModels.some(model => 
        vinData.model.toLowerCase() === model.toLowerCase()
      )) {
        confidence += 10;
        matchReason.push('Exact model match');
      }

      matches.push({
        tsb,
        matchConfidence: Math.min(confidence, 100),
        matchReason
      });
    }

    // Sort by confidence and severity
    return matches.sort((a, b) => {
      const severityWeight = {
        'CRITICAL': 4,
        'HIGH': 3,
        'MODERATE': 2,
        'INFO': 1
      };
      const severityDiff = severityWeight[b.tsb.severity] - severityWeight[a.tsb.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.matchConfidence - a.matchConfidence;
    });
  }

  /**
   * Fetch TSBs from NHTSA API (USA vehicles only)
   */
  async fetchNHTSATSBs(make: string, model: string, year: number): Promise<TSB[]> {
    try {
      const response = await fetch(
        `${this.nhtsaApiBase}?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
        { signal: AbortSignal.timeout(10000) }
      );

      if (!response.ok) {
        console.warn(`NHTSA TSB API returned ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      return (data.results || []).map((item: any) => ({
        id: `nhtsa-${item.NHTSAId}`,
        tsbNumber: item.Component || 'N/A',
        manufacturer: make,
        bulletinDate: item.DateAdded || new Date().toISOString(),
        title: item.Summary || 'No title',
        summary: item.Summary || '',
        affectedModels: [model],
        affectedYears: [year],
        category: this.categorizeTSB(item.Summary || ''),
        severity: 'INFO',
        relatedDTCs: [],
        symptoms: [],
        diagnosis: [],
        repairProcedure: [],
        partsRequired: [],
        laborHours: 0,
        dataSource: 'NHTSA',
        url: item.url
      } as TSB));
    } catch (error) {
      console.error('Failed to fetch NHTSA TSBs:', error);
      return [];
    }
  }

  /**
   * Search TSBs by DTC code
   */
  async searchByDTC(dtcCode: string): Promise<TSB[]> {
    await this.ensureLoaded();
    return this.tsbDatabase.filter(tsb => 
      tsb.relatedDTCs.includes(dtcCode)
    );
  }

  /**
   * Search TSBs by symptom keywords
   */
  async searchBySymptom(symptom: string): Promise<TSB[]> {
    await this.ensureLoaded();
    const lowerSymptom = symptom.toLowerCase();
    return this.tsbDatabase.filter(tsb =>
      tsb.symptoms.some(s => s.toLowerCase().includes(lowerSymptom)) ||
      tsb.title.toLowerCase().includes(lowerSymptom) ||
      tsb.summary.toLowerCase().includes(lowerSymptom)
    );
  }

  /**
   * Load local TSB database from JSON file
   */
  private async loadLocalTSBDatabase(): Promise<void> {
    if (this.dataLoaded) return;
    
    try {
      // Load from JSON file
      const response = await fetch('/data/tsb-database.json');
      if (response.ok) {
        const data = await response.json();
        this.tsbDatabase = data.tsbs || [];
        this.dataLoaded = true;
        console.log(`✓ TSB Database loaded: ${this.tsbDatabase.length} bulletins`);
      } else {
        console.warn('TSB database file not found, using empty database');
      }
    } catch (error) {
      console.error('Failed to load TSB database:', error);
      this.tsbDatabase = [];
    }
  }

  /**
   * Ensure database is loaded before operations
   */
  private async ensureLoaded(): Promise<void> {
    if (!this.dataLoaded) {
      await this.loadLocalTSBDatabase();
    }
  }

  /**
   * Categorize TSB based on content analysis
   */
  private categorizeTSB(text: string): TSBCategory {
    const lower = text.toLowerCase();
    
    if (lower.includes('engine') || lower.includes('motor')) return 'ENGINE';
    if (lower.includes('transmission') || lower.includes('gearbox')) return 'TRANSMISSION';
    if (lower.includes('brake') || lower.includes('abs')) return 'BRAKES';
    if (lower.includes('electrical') || lower.includes('battery') || lower.includes('wiring')) return 'ELECTRICAL';
    if (lower.includes('suspension') || lower.includes('steering')) return 'SUSPENSION';
    if (lower.includes('airbag') || lower.includes('seatbelt') || lower.includes('safety')) return 'SAFETY';
    if (lower.includes('emissions') || lower.includes('catalyst')) return 'EMISSION';
    if (lower.includes('software') || lower.includes('firmware') || lower.includes('update')) return 'SOFTWARE_UPDATE';
    if (lower.includes('hvac') || lower.includes('air conditioning') || lower.includes('climate')) return 'HVAC';
    if (lower.includes('infotainment') || lower.includes('radio') || lower.includes('display')) return 'INFOTAINMENT';
    if (lower.includes('fuel') || lower.includes('injector')) return 'FUEL_SYSTEM';
    
    return 'OTHER';
  }

  /**
   * Get TSB statistics for a vehicle
   */
  async getTSBStatistics(vinData: VINDecoded): Promise<{
    totalTSBs: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    recentTSBs: TSB[];
  }> {
    await this.ensureLoaded();
    const relevantTSBs = this.tsbDatabase.filter(tsb =>
      tsb.manufacturer.toLowerCase() === vinData.manufacturer.toLowerCase() &&
      tsb.affectedYears.includes(vinData.modelYear)
    );

    const bySeverity: Record<string, number> = {
      'CRITICAL': 0,
      'HIGH': 0,
      'MODERATE': 0,
      'INFO': 0
    };

    const byCategory: Record<string, number> = {};

    for (const tsb of relevantTSBs) {
      bySeverity[tsb.severity]++;
      byCategory[tsb.category] = (byCategory[tsb.category] || 0) + 1;
    }

    const recentTSBs = relevantTSBs
      .sort((a, b) => new Date(b.bulletinDate).getTime() - new Date(a.bulletinDate).getTime())
      .slice(0, 5);

    return {
      totalTSBs: relevantTSBs.length,
      bySeverity,
      byCategory,
      recentTSBs
    };
  }
}

export default new TSBService();
