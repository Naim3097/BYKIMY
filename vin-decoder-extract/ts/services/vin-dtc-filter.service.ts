// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - VIN-SPECIFIC DTC FILTER SERVICE
// Intelligent DTC Filtering Based on Vehicle Configuration
// ============================================================

import { VINDecoded, DTCDefinition, DiagnosticTroubleCode, ECUType } from '@/types';

export interface DTCFilterCriteria {
  vinData: VINDecoded;
  ecuTypes: ECUType[];
  includeGenericCodes: boolean;
  includeManufacturerCodes: boolean;
}

export interface FilteredDTCResult {
  code: string;
  definition: DTCDefinition;
  relevance: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_APPLICABLE';
  relevanceReason: string[];
}

export class VINSpecificDTCFilterService {
  /**
   * Filter DTC definitions based on vehicle configuration
   * Removes irrelevant DTCs (e.g., diesel codes on petrol vehicle)
   */
  filterDTCsByVehicle(
    allDTCs: DTCDefinition[],
    vinData: VINDecoded,
    ecuTypes: ECUType[]
  ): FilteredDTCResult[] {
    const filtered: FilteredDTCResult[] = [];

    for (const dtc of allDTCs) {
      const analysis = this.analyzeDTCRelevance(dtc, vinData, ecuTypes);
      
      if (analysis.relevance !== 'NOT_APPLICABLE') {
        filtered.push({
          code: dtc.code,
          definition: dtc,
          relevance: analysis.relevance,
          relevanceReason: analysis.reasons
        });
      }
    }

    // Sort by relevance
    return filtered.sort((a, b) => {
      const relevanceOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1, 'NOT_APPLICABLE': 0 };
      return relevanceOrder[b.relevance] - relevanceOrder[a.relevance];
    });
  }

  /**
   * Analyze DTC relevance for a specific vehicle
   */
  private analyzeDTCRelevance(
    dtc: DTCDefinition,
    vinData: VINDecoded,
    ecuTypes: ECUType[]
  ): { relevance: FilteredDTCResult['relevance']; reasons: string[] } {
    const reasons: string[] = [];
    let relevanceScore = 50; // Base score

    // === FUEL TYPE FILTERING ===
    if (this.isDieselOnlyCode(dtc.code) && vinData.fuelType !== 'DIESEL') {
      return { relevance: 'NOT_APPLICABLE', reasons: ['Diesel-only DTC on non-diesel vehicle'] };
    }
    if (this.isPetrolOnlyCode(dtc.code) && vinData.fuelType === 'DIESEL') {
      return { relevance: 'NOT_APPLICABLE', reasons: ['Petrol-only DTC on diesel vehicle'] };
    }

    // === HYBRID/EV FILTERING ===
    if (this.isHybridOnlyCode(dtc.code)) {
      if (vinData.fuelType === 'HYBRID' || vinData.fuelType === 'PLUGIN_HYBRID') {
        relevanceScore += 30;
        reasons.push('Hybrid-specific DTC');
      } else {
        return { relevance: 'NOT_APPLICABLE', reasons: ['Hybrid-only DTC on non-hybrid vehicle'] };
      }
    }

    if (this.isEVOnlyCode(dtc.code)) {
      if (vinData.fuelType === 'ELECTRIC') {
        relevanceScore += 30;
        reasons.push('EV-specific DTC');
      } else {
        return { relevance: 'NOT_APPLICABLE', reasons: ['EV-only DTC on non-EV vehicle'] };
      }
    }

    // === TRANSMISSION TYPE FILTERING ===
    if (this.isManualTransmissionCode(dtc.code) && vinData.transmissionType !== 'MANUAL') {
      return { relevance: 'NOT_APPLICABLE', reasons: ['Manual transmission DTC on automatic vehicle'] };
    }
    if (this.isAutomaticTransmissionCode(dtc.code) && vinData.transmissionType === 'MANUAL') {
      return { relevance: 'NOT_APPLICABLE', reasons: ['Automatic transmission DTC on manual vehicle'] };
    }
    if (this.isCVTCode(dtc.code)) {
      if (vinData.transmissionType === 'CVT') {
        relevanceScore += 20;
        reasons.push('CVT-specific DTC');
      } else {
        return { relevance: 'NOT_APPLICABLE', reasons: ['CVT DTC on non-CVT vehicle'] };
      }
    }

    // === DRIVE TYPE FILTERING ===
    if (this.isAWDOnlyCode(dtc.code)) {
      if (vinData.driveType === 'AWD' || vinData.driveType === '4WD') {
        relevanceScore += 20;
        reasons.push('AWD/4WD-specific DTC');
      } else {
        return { relevance: 'NOT_APPLICABLE', reasons: ['AWD DTC on FWD/RWD vehicle'] };
      }
    }

    // === ECU TYPE FILTERING ===
    if (!ecuTypes.includes(dtc.system)) {
      relevanceScore -= 30;
      reasons.push(`ECU ${dtc.system} not detected on vehicle`);
    } else {
      relevanceScore += 10;
    }

    // === MANUFACTURER FILTERING ===
    if (this.isManufacturerSpecificCode(dtc.code)) {
      const targetManufacturer = this.extractManufacturerFromCode(dtc.code);
      if (targetManufacturer && targetManufacturer.toLowerCase() === vinData.brand.toLowerCase()) {
        relevanceScore += 20;
        reasons.push(`${vinData.brand}-specific DTC`);
      } else if (targetManufacturer) {
        return { relevance: 'NOT_APPLICABLE', reasons: [`${targetManufacturer}-specific DTC on ${vinData.brand} vehicle`] };
      }
    }

    // === MODEL YEAR FILTERING ===
    const codeYear = this.extractModelYearRequirement(dtc.code);
    if (codeYear) {
      if (vinData.modelYear >= codeYear) {
        relevanceScore += 10;
        reasons.push(`Introduced in ${codeYear}+ models`);
      } else {
        relevanceScore -= 20;
        reasons.push(`Code typically for ${codeYear}+ models (vehicle is ${vinData.modelYear})`);
      }
    }

    // === EMISSION STANDARD FILTERING ===
    if (dtc.emissionRelevant) {
      const vehicleEmissionLevel = this.parseEmissionStandard(vinData.emissionStandard);
      const requiredEmissionLevel = this.extractEmissionRequirement(dtc.description);
      
      if (requiredEmissionLevel && vehicleEmissionLevel < requiredEmissionLevel) {
        relevanceScore -= 20;
        reasons.push(`Code for Euro ${requiredEmissionLevel}+ (vehicle is Euro ${vehicleEmissionLevel})`);
      }
    }

    // === DETERMINE FINAL RELEVANCE ===
    if (relevanceScore >= 70) {
      return { relevance: 'HIGH', reasons };
    } else if (relevanceScore >= 40) {
      return { relevance: 'MEDIUM', reasons };
    } else {
      return { relevance: 'LOW', reasons };
    }
  }

  /**
   * Check if DTC is diesel-only
   */
  private isDieselOnlyCode(code: string): boolean {
    const dieselPatterns = [
      /^P00[4-9][0-9]/, // Diesel fuel system codes
      /^P01[0-2][0-9]/, // Diesel injection codes
      /^P2[0-4][0-9][0-9]/, // Diesel particulate filter
      /^P242[0-9]/, // DPF codes
      /^P244[0-9]/, // DPF temperature
      /^P245[0-9]/  // DPF regeneration
    ];
    return dieselPatterns.some(pattern => pattern.test(code)) ||
           code.includes('DPF') || code.includes('Glow Plug') || 
           code.includes('Diesel') || code.includes('Injector Quantity');
  }

  /**
   * Check if DTC is petrol-only
   */
  private isPetrolOnlyCode(code: string): boolean {
    return code.includes('Spark Plug') || code.includes('Ignition Coil') ||
           /^P030[0-9]/.test(code) || // Misfire codes
           /^P050[0-9]/.test(code);   // Evaporative emission codes
  }

  /**
   * Check if DTC is hybrid-only
   */
  private isHybridOnlyCode(code: string): boolean {
    return /^P[A-C]6[0-9]{2}/.test(code) || // Hybrid battery codes
           code.includes('High Voltage') || code.includes('HV Battery') ||
           code.includes('Hybrid') || code.includes('Electric Motor') ||
           /^P1[A-F][0-9]{2}/.test(code); // Manufacturer hybrid codes
  }

  /**
   * Check if DTC is EV-only
   */
  private isEVOnlyCode(code: string): boolean {
    return code.includes('Battery Pack') || code.includes('Charging System') ||
           code.includes('DC Fast Charge') || code.includes('Regenerative Braking');
  }

  /**
   * Check if DTC is manual transmission specific
   */
  private isManualTransmissionCode(code: string): boolean {
    return code.includes('Clutch') && !code.includes('Torque Converter Clutch');
  }

  /**
   * Check if DTC is automatic transmission specific
   */
  private isAutomaticTransmissionCode(code: string): boolean {
    return code.includes('Torque Converter') || code.includes('Shift Solenoid') ||
           /^P07[0-9]{2}/.test(code) || // Transmission codes
           code.includes('Transmission Fluid Pressure');
  }

  /**
   * Check if DTC is CVT-specific
   */
  private isCVTCode(code: string): boolean {
    return code.includes('CVT') || code.includes('Continuously Variable') ||
           code.includes('Pulley') || code.includes('CVT Belt');
  }

  /**
   * Check if DTC is AWD/4WD specific
   */
  private isAWDOnlyCode(code: string): boolean {
    return code.includes('Transfer Case') || code.includes('Front Differential') ||
           code.includes('Rear Differential') || code.includes('AWD') ||
           /^P[A-C]4[0-9]{2}/.test(code); // AWD system codes
  }

  /**
   * Check if DTC is manufacturer-specific
   */
  private isManufacturerSpecificCode(code: string): boolean {
    // Manufacturer-specific codes start with 1, 2, or 3 (rather than 0)
    return /^[PC][1-3][0-9]{3}/.test(code);
  }

  /**
   * Extract manufacturer from DTC description
   */
  private extractManufacturerFromCode(code: string): string | null {
    // This would use OEM code ranges
    // For example:
    // - Toyota: P1xxx range specific to Toyota
    // - Honda: Different P1xxx range
    // This requires OEM code database mapping
    return null; // Simplified for now
  }

  /**
   * Extract model year requirement from DTC
   */
  private extractModelYearRequirement(code: string): number | null {
    // Some codes only exist on newer vehicles (e.g., ADAS codes on 2018+)
    const adasCodes = /^P[A-C][0-9]{3}/;
    if (adasCodes.test(code)) {
      return 2018; // ADAS typically 2018+
    }
    return null;
  }

  /**
   * Parse emission standard to numeric level
   */
  private parseEmissionStandard(standard: string): number {
    const match = standard.match(/Euro (\d+)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0; // Unknown
  }

  /**
   * Extract emission requirement from DTC description
   */
  private extractEmissionRequirement(description: string): number | null {
    const match = description.match(/Euro (\d+)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  /**
   * Filter active DTCs by relevance
   */
  filterActiveDTCs(
    activeDTCs: DiagnosticTroubleCode[],
    vinData: VINDecoded,
    ecuTypes: ECUType[]
  ): DiagnosticTroubleCode[] {
    return activeDTCs.filter(dtc => {
      const analysis = this.analyzeDTCRelevance(dtc.definition, vinData, ecuTypes);
      return analysis.relevance !== 'NOT_APPLICABLE';
    });
  }

  /**
   * Get DTC statistics by relevance
   */
  getDTCStatistics(
    allDTCs: DTCDefinition[],
    vinData: VINDecoded,
    ecuTypes: ECUType[]
  ): {
    total: number;
    byRelevance: Record<string, number>;
    filtered: number;
  } {
    const filtered = this.filterDTCsByVehicle(allDTCs, vinData, ecuTypes);
    const byRelevance = {
      'HIGH': 0,
      'MEDIUM': 0,
      'LOW': 0
    };

    for (const result of filtered) {
      byRelevance[result.relevance]++;
    }

    return {
      total: allDTCs.length,
      byRelevance,
      filtered: filtered.length
    };
  }
}

export default new VINSpecificDTCFilterService();
