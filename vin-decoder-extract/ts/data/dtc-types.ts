/**
 * BYKI WORKSHOP DIAGNOSTIC - COMPREHENSIVE DTC TYPE DEFINITIONS
 * 
 * These types match the BYKI X1 all_faultcodes.json structure
 * for full compatibility when migrating to Flutter.
 * 
 * Total codes: 4565+
 * - P series (Powertrain): 3593 codes
 * - B series (Body): 86 codes  
 * - C series (Chassis): 499 codes
 * - U series (Network): 382 codes
 */

// ==========================================
// CORE DTC TYPES - MATCHING BYKI X1 STRUCTURE
// ==========================================

export interface DTCFaultCode {
  code: string;
  category: DTCCodeCategory;
  system: string;
  severity: DTCSeverity;
  official_description: string;
  workshop_diagnosis: string;
  user_explanation: string;
  estimated_cost: {
    min: number;
    max: number;
    currency: string;
  };
  common_causes: string[];
  related_codes: string[];
  repair_difficulty: RepairDifficulty;
  labor_hours: number;
}

export type DTCCodeCategory = 'powertrain' | 'body' | 'chassis' | 'network';
export type DTCSeverity = 'critical' | 'warning' | 'info';
export type RepairDifficulty = 'easy' | 'moderate' | 'difficult' | 'expert';

export interface DTCMetadata {
  version: string;
  last_updated: string;
  total_codes: number;
  description: string;
  market: string;
  currency: string;
  coverage: {
    P_series: number;
    B_series: number;
    C_series: number;
    U_series: number;
  };
  completion_status: string;
  bykicodes_integration: string;
  cleanup_applied: boolean;
  obd2_standard_compliant: boolean;
  malaysian_enhancement: string;
}

export interface DTCCategories {
  powertrain: CategoryDefinition;
  body: CategoryDefinition;
  chassis: CategoryDefinition;
  network: CategoryDefinition;
}

export interface CategoryDefinition {
  code_prefix: string;
  description: string;
  subcategories: {
    generic: string;
    manufacturer: string;
    extended: string;
    reserved: string;
  };
}

export interface SeverityLevel {
  color: string;
  description: string;
  priority: number;
}

export interface DTCDatabase {
  metadata: DTCMetadata;
  categories: DTCCategories;
  severity_levels: {
    critical: SeverityLevel;
    warning: SeverityLevel;
    info: SeverityLevel;
  };
  codes: DTCFaultCode[];
}

// ==========================================
// EXTENDED TYPES FOR WORKSHOP DIAGNOSTICS
// ==========================================

export interface DTCAnalysisResult {
  code: string;
  faultCode: DTCFaultCode | null;
  isKnown: boolean;
  relatedCodes: DTCFaultCode[];
  suggestedActions: SuggestedAction[];
  estimatedTotalCost: {
    min: number;
    max: number;
    currency: string;
  };
  priorityScore: number;
}

export interface SuggestedAction {
  action: string;
  priority: number;
  estimatedTime: string;
  difficulty: RepairDifficulty;
  tools?: string[];
}

export interface DTCGroupedBySystem {
  system: string;
  category: DTCCodeCategory;
  codes: DTCFaultCode[];
  totalEstimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  highestSeverity: DTCSeverity;
}

export interface DTCSearchResult {
  code: DTCFaultCode;
  matchType: 'exact' | 'partial' | 'description' | 'cause';
  relevanceScore: number;
}

// ==========================================
// LIVE DATA INTEGRATION TYPES
// ==========================================

export interface DTCLiveDataCorrelation {
  dtcCode: string;
  relatedPIDs: string[];
  triggerConditions: TriggerCondition[];
  confirmationLogic: string;
}

export interface TriggerCondition {
  pid: string;
  parameterName: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'between';
  value: number | [number, number];
  duration?: number;
}

// ==========================================
// REPORT TYPES
// ==========================================

export interface DTCReportSection {
  title: string;
  codes: DTCFaultCode[];
  summary: string;
  totalCost: {
    min: number;
    max: number;
    currency: string;
  };
  recommendedPriority: number;
}

export interface FullDTCReport {
  vehicleInfo: {
    vin?: string;
    make?: string;
    model?: string;
    year?: number;
  };
  scanDate: Date;
  totalCodesFound: number;
  criticalCodes: DTCReportSection;
  warningCodes: DTCReportSection;
  infoCodes: DTCReportSection;
  systemsAffected: string[];
  estimatedTotalRepairCost: {
    min: number;
    max: number;
    currency: string;
  };
  estimatedTotalLaborHours: number;
  recommendations: string[];
}
