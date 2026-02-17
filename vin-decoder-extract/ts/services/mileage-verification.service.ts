// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - MILEAGE VERIFICATION SERVICE
// Odometer Fraud Detection & Validation
// ============================================================

import { VINDecoded } from '@/types';

export interface MileageRecord {
  vin: string;
  mileage: number;
  recordedDate: string;
  source: MileageSource;
  location?: string;
  notes?: string;
  verified: boolean;
}

export type MileageSource =
  | 'DIAGNOSTIC_SCAN' // From our diagnostic tool
  | 'SERVICE_CENTER' // Official service center
  | 'INSURANCE' // Insurance claim records
  | 'INSPECTION' // Vehicle inspection (Puspakom, JPJ)
  | 'MARKETPLACE' // Marketplace listing (Carsome, myTukar)
  | 'USER_REPORTED' // Owner self-reported
  | 'COMMUNITY'; // Community contribution

export interface MileageAnalysis {
  currentMileage: number;
  verified: boolean;
  isConsistent: boolean;
  fraudRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
 riskScore: number; // 0-100
  confidence: number; // 0-100
  findings: string[];
  redFlags: string[];
  flags: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  recommendations: string[];
  mileageHistory: MileageRecord[];
  historicalRecords: MileageRecord[];
  predictedMileage: {
    estimatedMileage: number;
    minExpected: number;
    maxExpected: number;
    usage: 'LOW' | 'NORMAL' | 'HIGH';
    confidence: number;
  } | null;
  discrepancy: number | null; // Difference between reported and predicted
}

export interface AnnualMileageData {
  year: number;
  startMileage: number;
  endMileage: number;
  annualKm: number;
  isTypical: boolean;
}

export class MileageVerificationService {
  private mileageDatabase: Map<string, MileageRecord[]> = new Map();
  
  // Average annual mileage by vehicle type (Malaysia)
  private readonly TYPICAL_ANNUAL_MILEAGE = {
    'SEDAN': 15000, // KM per year
    'SUV': 18000,
    'TRUCK': 20000,
    'COMMERCIAL': 35000,
    'TAXI_RIDESHARE': 60000
  };

  constructor() {
    this.loadMileageDatabase();
  }

  /**
   * Analyze mileage for potential fraud
   */
  async analyzeMileage(
    vin: string,
    currentMileage: number,
    vinData: VINDecoded,
    odometerSource: 'ECM' | 'CLUSTER' | 'MANUAL' = 'ECM'
  ): Promise<MileageAnalysis> {
    const history = this.getMileageHistory(vin);
    const findings: string[] = [];
    const redFlags: string[] = [];
    let fraudRisk: MileageAnalysis['fraudRisk'] = 'NONE';
    let confidence = 50;

    // Record this reading
    await this.recordMileage({
      vin,
      mileage: currentMileage,
      recordedDate: new Date().toISOString(),
      source: odometerSource === 'ECM' ? 'DIAGNOSTIC_SCAN' : 'USER_REPORTED',
      verified: odometerSource === 'ECM'
    });

    // === FRAUD DETECTION LOGIC ===

    // 1. Check for mileage rollback
    if (history.length > 0) {
      const lastRecord = history[history.length - 1];
      const mileageDiff = currentMileage - lastRecord.mileage;
      const daysDiff = (new Date().getTime() - new Date(lastRecord.recordedDate).getTime()) / (1000 * 60 * 60 * 24);

      if (mileageDiff < 0) {
        redFlags.push(`⚠️ MILEAGE ROLLBACK DETECTED: ${Math.abs(mileageDiff)}km reduction from last reading`);
        fraudRisk = 'CRITICAL';
        confidence = 95;
      } else if (daysDiff > 0) {
        const dailyKm = mileageDiff / daysDiff;
        const annualKm = dailyKm * 365;

        if (annualKm < 2000) {
          redFlags.push(`Unusually low mileage: only ${Math.round(annualKm)}km/year (typical: 15,000km)`);
          fraudRisk = fraudRisk === 'NONE' ? 'MEDIUM' : fraudRisk;
        } else if (annualKm > 50000 && vinData.bodyStyle !== 'Commercial') {
          redFlags.push(`Unusually high mileage: ${Math.round(annualKm)}km/year (may be ex-taxi or rideshare)`);
          findings.push('Vehicle may have been used for commercial purposes');
        }
      }
    }

    // 2. Predict expected mileage based on vehicle age
    const vehicleAge = new Date().getFullYear() - vinData.modelYear;
    const expectedMileage = vehicleAge * this.TYPICAL_ANNUAL_MILEAGE['SEDAN'];
    const discrepancy = currentMileage - expectedMileage;
    const discrepancyPercent = (Math.abs(discrepancy) / expectedMileage) * 100;

    findings.push(`Vehicle age: ${vehicleAge} years`);
    findings.push(`Expected mileage: ${expectedMileage.toLocaleString()}km`);
    findings.push(`Actual mileage: ${currentMileage.toLocaleString()}km`);
    findings.push(`Discrepancy: ${discrepancy > 0 ? '+' : ''}${discrepancy.toLocaleString()}km (${discrepancyPercent.toFixed(1)}%)`);

    if (discrepancyPercent > 40 && discrepancy < 0) {
      redFlags.push(`Mileage ${discrepancyPercent.toFixed(0)}% below expected - possible odometer tampering`);
      fraudRisk = fraudRisk === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
      confidence = Math.max(confidence, 75);
    } else if (discrepancyPercent > 50 && discrepancy > 0) {
      findings.push(`High mileage vehicle - ${discrepancyPercent.toFixed(0)}% above average`);
    }

    // 3. Check for cluster replacement without mileage correction
    const clusterReplacementPattern = this.detectClusterReplacement(history);
    if (clusterReplacementPattern) {
      redFlags.push('Possible instrument cluster replacement detected - mileage may be incorrect');
      fraudRisk = fraudRisk === 'NONE' ? 'MEDIUM' : fraudRisk;
    }

    // 4. Check ECM vs Cluster mileage mismatch
    // (This would require reading both ECM and cluster odometer)
    if (odometerSource === 'MANUAL') {
      findings.push('⚠️ Mileage manually reported - not verified from ECM');
      confidence -= 20;
    } else {
      findings.push('✓ Mileage read from ECM (reliable source)');
      confidence += 20;
    }

    // 5. Cross-reference with external databases (if available)
    // const externalRecords = await this.queryExternalDatabase(vin);
    // This would integrate with Puspakom, JPJ, insurance databases

    // === CONFIDENCE CALCULATION ===
    const historyCount = history.length;
    if (historyCount > 5) {
      confidence += 20;
      findings.push(`Strong mileage history: ${historyCount} previous records`);
    } else if (historyCount === 0) {
      confidence -= 10;
      findings.push('No previous mileage records - first time scan');
    }

    if (fraudRisk === 'NONE' && discrepancyPercent < 20) {
      fraudRisk = 'LOW';
      findings.push('✓ Mileage appears consistent with vehicle age');
    }

    // Build recommendations
    const recommendations: string[] = [];
    if (fraudRisk === 'HIGH' || fraudRisk === 'CRITICAL') {
      recommendations.push('Request official service history and receipts');
      recommendations.push('Verify mileage with previous owners');
      recommendations.push('Check for cluster replacement records');
      recommendations.push('Consider professional pre-purchase inspection');
    }
    if (odometerSource === 'MANUAL') {
      recommendations.push('Connect to ECM to verify odometer reading');
    }

    // Build flags array
    const flags = redFlags.map(flag => ({
      type: 'FRAUD_WARNING',
      severity: fraudRisk,
      description: flag
    }));

    // Build predicted mileage object
    const predictedMileageObj = expectedMileage ? {
      estimatedMileage: expectedMileage,
      minExpected: Math.floor(expectedMileage * 0.7),
      maxExpected: Math.ceil(expectedMileage * 1.3),
      usage: (currentMileage / expectedMileage) < 0.8 ? 'LOW' as const : 
             (currentMileage / expectedMileage) > 1.2 ? 'HIGH' as const : 
             'NORMAL' as const,
      confidence: confidence
    } : null;

    return {
      currentMileage,
      verified: odometerSource === 'ECM',
      isConsistent: fraudRisk === 'NONE' || fraudRisk === 'LOW',
      fraudRisk,
      riskLevel: fraudRisk,
      riskScore: fraudRisk === 'CRITICAL' ? 90 : fraudRisk === 'HIGH' ? 70 : fraudRisk === 'MEDIUM' ? 50 : fraudRisk === 'LOW' ? 25 : 10,
      confidence: Math.min(Math.max(confidence, 0), 100),
      findings,
      redFlags,
      flags,
      recommendations,
      mileageHistory: history,
      historicalRecords: history,
      predictedMileage: predictedMileageObj,
      discrepancy
    };
  }

  /**
   * Record mileage reading
   */
  async recordMileage(record: MileageRecord): Promise<void> {
    const history = this.mileageDatabase.get(record.vin) || [];
    history.push(record);
    this.mileageDatabase.set(record.vin, history);
    
    // In production, this would also save to Firebase/backend
    // await firestore.collection('mileage_records').add(record);
  }

  /**
   * Get mileage history for a VIN
   */
  getMileageHistory(vin: string): MileageRecord[] {
    return (this.mileageDatabase.get(vin) || []).sort((a, b) =>
      new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime()
    );
  }

  /**
   * Detect instrument cluster replacement (sudden jumps)
   */
  private detectClusterReplacement(history: MileageRecord[]): boolean {
    if (history.length < 3) return false;

    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];
      const mileageDiff = curr.mileage - prev.mileage;
      const daysDiff = (new Date(curr.recordedDate).getTime() - new Date(prev.recordedDate).getTime()) / (1000 * 60 * 60 * 24);

      // Sudden large jump backward (e.g., 150,000km -> 50,000km)
      if (mileageDiff < -10000) {
        return true;
      }

      // Or sudden unrealistic jump forward (e.g., 1000km in 1 day)
      if (daysDiff > 0 && (mileageDiff / daysDiff) > 1000) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate annual mileage breakdown
   */
  calculateAnnualMileage(history: MileageRecord[]): AnnualMileageData[] {
    if (history.length < 2) return [];

    const annualData: AnnualMileageData[] = [];
    const sortedHistory = [...history].sort((a, b) =>
      new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime()
    );

    for (let i = 1; i < sortedHistory.length; i++) {
      const prev = sortedHistory[i - 1];
      const curr = sortedHistory[i];
      const year = new Date(curr.recordedDate).getFullYear();
      const annualKm = curr.mileage - prev.mileage;
      const isTypical = annualKm >= 10000 && annualKm <= 25000;

      annualData.push({
        year,
        startMileage: prev.mileage,
        endMileage: curr.mileage,
        annualKm,
        isTypical
      });
    }

    return annualData;
  }

  /**
   * Compare ECM mileage vs Cluster mileage
   */
  async compareOdometers(
    vin: string,
    ecmMileage: number,
    clusterMileage: number
  ): Promise<{
    match: boolean;
    discrepancy: number;
    warning: string | null;
  }> {
    const discrepancy = Math.abs(ecmMileage - clusterMileage);
    const percentDiff = (discrepancy / ecmMileage) * 100;

    let match = true;
    let warning: string | null = null;

    if (discrepancy > 1000) {
      match = false;
      warning = `⚠️ CRITICAL: ECM and cluster mileage differ by ${discrepancy}km (${percentDiff.toFixed(1)}%). Possible odometer tampering.`;
    } else if (discrepancy > 100) {
      match = false;
      warning = `Caution: ECM and cluster mileage differ by ${discrepancy}km. May indicate recent cluster replacement.`;
    }

    return { match, discrepancy, warning };
  }

  /**
   * Generate mileage report for vehicle purchase inspection
   */
  generateInspectionReport(analysis: MileageAnalysis): string {
    let report = '=== MILEAGE VERIFICATION REPORT ===\n\n';
    report += `Current Odometer: ${analysis.currentMileage.toLocaleString()}km\n`;
    report += `Fraud Risk: ${analysis.fraudRisk}\n`;
    report += `Confidence: ${analysis.confidence}%\n\n`;

    if (analysis.predictedMileage) {
      report += `Predicted Mileage: ${analysis.predictedMileage.toLocaleString()}km\n`;
      report += `Discrepancy: ${analysis.discrepancy?.toLocaleString()}km\n\n`;
    }

    if (analysis.redFlags.length > 0) {
      report += '🚩 RED FLAGS:\n';
      analysis.redFlags.forEach(flag => report += `  - ${flag}\n`);
      report += '\n';
    }

    report += 'FINDINGS:\n';
    analysis.findings.forEach(finding => report += `  - ${finding}\n`);
    report += '\n';

    if (analysis.mileageHistory.length > 0) {
      report += 'MILEAGE HISTORY:\n';
      analysis.mileageHistory.forEach(record => {
        const date = new Date(record.recordedDate).toLocaleDateString('en-MY');
        report += `  ${date}: ${record.mileage.toLocaleString()}km (${record.source})\n`;
      });
    } else {
      report += 'No previous mileage history available.\n';
    }

    report += '\n=== END OF REPORT ===\n';
    return report;
  }

  /**
   * Load mileage database (from Firebase/backend in production)
   */
  private loadMileageDatabase(): void {
    // In production, this would load from Firebase Firestore
    // For now, initialize empty
    this.mileageDatabase = new Map();
  }
}

export default new MileageVerificationService();
