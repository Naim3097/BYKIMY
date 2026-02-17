// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - KNOWN ISSUES DATABASE
// Vehicle-Specific Common Fault Patterns
// Community + OEM + Workshop Data Aggregation
// ============================================================

import { VINDecoded, ECUType } from '@/types';

export type IssueSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

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
  severity: IssueSeverity;
  frequency: 'VERY_COMMON' | 'COMMON' | 'OCCASIONAL' | 'RARE';
  mileageRange?: {
    min: number;
    max: number;
  };
  symptoms: string[];
  relatedDTCs: string[];
  rootCause: string;
  diagnosis: string[];
  commonMisdiagnosis: string[];
  repairSolution: string[];
  preventiveMaintenance: string[];
  estimatedCost: {
    parts: number; // MYR
    labor: number; // MYR
    total: number; // MYR
  };
  partsCost: number;
  reportCount: number; // Community reports
  lastUpdated: string;
  dataSource: 'COMMUNITY' | 'OEM' | 'WORKSHOP' | 'RECALL';
  references: string[];
}

export type IssueCategory =
  | 'ENGINE'
  | 'TRANSMISSION'
  | 'ELECTRICAL'
  | 'BRAKES'
  | 'SUSPENSION'
  | 'BODY'
  | 'HVAC'
  | 'FUEL_SYSTEM'
  | 'EMISSION'
  | 'SOFTWARE'
  | 'SENSOR'
  | 'COOLING'
  | 'IGNITION';

export interface IssueMatch {
  issue: KnownIssue;
  matchScore: number; // 0-100
  matchConfidence: number; // 0-100
  matchFactors: string[];
  matchedSymptoms: string[];
  matchedDTCs: string[];
}

export class KnownIssuesService {
  private issuesDatabase: KnownIssue[] = [];
  private dataLoaded = false;

  constructor() {
    this.loadKnownIssuesDatabase();
  }

  /**
   * Ensure database is loaded before operations
   */
  private async ensureLoaded(): Promise<void> {
    if (!this.dataLoaded) {
      await this.loadKnownIssuesDatabase();
    }
  }

  /**
   * Find known issues for a specific vehicle
   */
  async findIssuesByVehicle(
    vinData: VINDecoded,
    currentMileage?: number,
    activeDTCs?: string[]
  ): Promise<IssueMatch[]> {
    await this.ensureLoaded();
    const matches: IssueMatch[] = [];

    for (const issue of this.issuesDatabase) {
      let score = 0;
      const factors: string[] = [];

      // Match manufacturer (required)
      if (issue.manufacturer.toLowerCase() !== vinData.manufacturer.toLowerCase()) {
        continue;
      }
      score += 20;

      // Match model
      if (issue.models.some(m => vinData.model.toLowerCase().includes(m.toLowerCase()))) {
        score += 25;
        factors.push('Model match');
      }

      // Match year
      if (issue.years.includes(vinData.modelYear)) {
        score += 20;
        factors.push('Year match');
      }

      // Match engine code
      if (issue.engineCodes && issue.engineCodes.includes(vinData.engineCode)) {
        score += 15;
        factors.push('Engine code match');
      }

      // Match transmission type
      if (issue.transmissionTypes && issue.transmissionTypes.includes(vinData.transmissionType)) {
        score += 10;
        factors.push('Transmission type match');
      }

      // Match mileage range
      if (currentMileage && issue.mileageRange) {
        if (currentMileage >= issue.mileageRange.min && currentMileage <= issue.mileageRange.max) {
          score += 15;
          factors.push(`Mileage in typical range (${issue.mileageRange.min}-${issue.mileageRange.max}km)`);
        }
      }

      // Match active DTCs
      const matchedDTCs: string[] = [];
      if (activeDTCs && activeDTCs.length > 0 && issue.relatedDTCs.length > 0) {
        const dtcMatches = activeDTCs.filter(dtc => issue.relatedDTCs.includes(dtc));
        matchedDTCs.push(...dtcMatches);
        if (dtcMatches.length > 0) {
          score += 20;
          factors.push(`Active DTC match: ${dtcMatches.join(', ')}`);
        }
      }

      // Match symptoms
      const matchedSymptoms: string[] = [];
      if (customerSymptoms && customerSymptoms.length > 0) {
        for (const symptom of customerSymptoms) {
          for (const issueSymptom of issue.symptoms) {
            if (issueSymptom.toLowerCase().includes(symptom.toLowerCase())) {
              matchedSymptoms.push(issueSymptom);
              break;
            }
          }
        }
      }

      if (score >= 40) { // Minimum threshold
        matches.push({
          issue,
          matchScore: Math.min(score, 100),
          matchConfidence: Math.min(score, 100),
          matchFactors: factors,
          matchedSymptoms,
          matchedDTCs
        });
      }
    }

    // Sort by match score, frequency, and severity
    return matches.sort((a, b) => {
      const frequenсyWeight = {
        'VERY_COMMON': 4,
        'COMMON': 3,
        'OCCASIONAL': 2,
        'RARE': 1
      };
      
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      
      return frequenсyWeight[b.issue.frequency] - frequenсyWeight[a.issue.frequency];
    });
  }

  /**
   * Search issues by DTC code
   */
  async searchByDTC(dtcCode: string): Promise<KnownIssue[]> {
    await this.ensureLoaded();
    return this.issuesDatabase.filter(issue =>
      issue.relatedDTCs.includes(dtcCode)
    ).sort((a, b) => b.reportCount - a.reportCount);
  }

  /**
   * Search issues by symptom
   */
  async searchBySymptom(symptom: string): Promise<KnownIssue[]> {
    await this.ensureLoaded();
    const lowerSymptom = symptom.toLowerCase();
    return this.issuesDatabase.filter(issue =>
      issue.symptoms.some(s => s.toLowerCase().includes(lowerSymptom)) ||
      issue.title.toLowerCase().includes(lowerSymptom) ||
      issue.description.toLowerCase().includes(lowerSymptom)
    );
  }

  /**
   * Get issue statistics for a vehicle
   */
  async getIssueStatistics(vinData: VINDecoded): Promise<{
    totalKnownIssues: number;
    byCategory: Record<string, number>;
    byFrequency: Record<string, number>;
    mostCommonIssues: KnownIssue[];
  }> {
    await this.ensureLoaded();
    const relevantIssues = this.issuesDatabase.filter(issue =>
      issue.manufacturer.toLowerCase() === vinData.manufacturer.toLowerCase() &&
      issue.years.includes(vinData.modelYear)
    );

    const byCategory: Record<string, number> = {};
    const byFrequency: Record<string, number> = {
      'VERY_COMMON': 0,
      'COMMON': 0,
      'OCCASIONAL': 0,
      'RARE': 0
    };

    for (const issue of relevantIssues) {
      byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
      byFrequency[issue.frequency]++;
    }

    const mostCommonIssues = relevantIssues
      .filter(i => i.frequency === 'VERY_COMMON' || i.frequency === 'COMMON')
      .sort((a, b) => b.reportCount - a.reportCount)
      .slice(0, 5);

    return {
      totalKnownIssues: relevantIssues.length,
      byCategory,
      byFrequency,
      mostCommonIssues
    };
  }

  /**
   * Report a new issue (community contribution)
   */
  async reportIssue(issue: Partial<KnownIssue>): Promise<{ success: boolean; id: string }> {
    // This would submit to Firebase/backend for moderation
    const id = `community-${Date.now()}`;
    console.log('Community issue report submitted:', id, issue);
    return { success: true, id };
  }

  /**
   * Load known issues database from JSON file
   */
  private async loadKnownIssuesDatabase(): Promise<void> {
    if (this.dataLoaded) return;
    
    try {
      // Load from JSON file
      const response = await fetch('/data/known-issues-database.json');
      if (response.ok) {
        const data = await response.json();
        this.issuesDatabase = data.issues || [];
        this.dataLoaded = true;
        console.log(`✓ Known Issues Database loaded: ${this.issuesDatabase.length} issues (${data.totalReports} community reports)`);
      } else {
        console.warn('Known issues database file not found, using empty database');
      }
    } catch (error) {
      console.error('Failed to load known issues database:', error);
      this.issuesDatabase = [];
    }
  }
}

export default new KnownIssuesService();
