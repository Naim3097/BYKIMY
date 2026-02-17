/**
 * BYKI WORKSHOP DIAGNOSTIC - COMPREHENSIVE DATA EXPORTS
 * 
 * This barrel file exports all comprehensive automotive diagnostic data:
 * - OBD-II Parameters: Complete parameter definitions with normal ranges
 * - Parameter Correlations: Cross-parameter relationships for validation
 * - Diagnostic Rules: Comprehensive rule engine for fault detection
 * - DTC Database: Complete 4565+ code diagnostic trouble code reference from BYKI X1
 * 
 * Note: The DTC database is the same format used in BYKI X1 Flutter app
 * for full compatibility during future migration.
 */

// ==========================================
// OBD-II PARAMETERS
// ==========================================
export type {
  OBD2Parameter,
  FailureMode,
  ParameterCategory,
} from './obd2-parameters';

export {
  OBD2_PARAMETERS,
  getParametersByCategory,
  getCriticalParameters,
  getRelatedParameters,
  getExpectedRange,
} from './obd2-parameters';

// ==========================================
// PARAMETER CORRELATIONS
// ==========================================
export type {
  ParameterCorrelation,
  CorrelationCondition,
  CorrelationCategory,
} from './parameter-correlations';

export {
  PARAMETER_CORRELATIONS,
  getCorrelationsByCategory,
  getCorrelationsForParameter,
  getCriticalCorrelations,
} from './parameter-correlations';

// ==========================================
// DIAGNOSTIC RULES
// ==========================================
export type {
  DiagnosticRule,
  RuleCondition,
  RuleCategory,
} from './diagnostic-rules';

export {
  DIAGNOSTIC_RULES,
  getRulesByCategory,
  getRulesBySeverity,
  evaluateCondition,
  evaluateRule,
} from './diagnostic-rules';

// ==========================================
// COMPREHENSIVE DTC TYPES (BYKI X1 Compatible)
// ==========================================
export type {
  DTCFaultCode,
  DTCDatabase,
  DTCCodeCategory,
  DTCSeverity,
  RepairDifficulty,
  DTCMetadata,
  DTCCategories,
  CategoryDefinition,
  SeverityLevel,
  DTCAnalysisResult,
  SuggestedAction,
  DTCGroupedBySystem,
  DTCSearchResult,
  DTCLiveDataCorrelation,
  TriggerCondition,
  DTCReportSection,
  FullDTCReport,
} from './dtc-types';

// ==========================================
// COMPREHENSIVE DTC SERVICE (4565+ CODES)
// ==========================================
export {
  // Core lookup
  getDTCByCode,
  getDTCsByCodes,
  isDTCKnown,
  getDTCsByCategory,
  getDTCsBySeverity,
  getDTCsBySystem,
  getRelatedDTCs,
  
  // Search
  searchDTCs,
  searchBySystem,
  
  // Analysis & Grouping
  groupDTCsBySystem,
  analyzeDTCs,
  getPrioritizedDTCs,
  
  // Cost Estimation
  calculateTotalRepairCost,
  calculateTotalLaborHours,
  
  // Live Data Correlation
  getDTCsForLiveDataAnomaly,
  DTC_PID_CORRELATIONS,
  
  // Report Generation
  generateDTCReport,
  
  // Metadata
  getDTCDatabaseMetadata,
  getDTCCategories,
  getSeverityLevels,
  getTotalDTCCount,
  getDTCDistribution,
  getAllSystems,
  
  // Direct database access
  dtcDatabase,
} from './dtc-service';

// ==========================================
// GEARBOX DATABASE
// ==========================================
export type {
  TransmissionFamily,
  TransmissionRisk,
  GearboxInfo,
  GearboxPart,
} from './gearbox-database';

export {
  GEARBOX_DATABASE,
  findGearboxByVehicle,
  getPartsByCategory,
  getHighRiskParts,
} from './gearbox-database';
