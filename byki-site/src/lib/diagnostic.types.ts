// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - TYPE DEFINITIONS
// Complete type system for automotive diagnostics
// ============================================================

// ============ VEHICLE IDENTIFICATION ============
export interface VINData {
  vin: string;
  isValid: boolean;
  checkDigitValid: boolean;
  decoded: VINDecoded | null;
}

export interface VINDecoded {
  manufacturer: string;
  manufacturerCode: string;
  brand: string;
  model: string;
  modelYear: number;
  engineCode: string;
  engineType: string;
  engineDisplacement: string;
  transmissionType: 'AUTOMATIC' | 'MANUAL' | 'CVT' | 'DCT' | 'UNKNOWN';
  driveType: 'FWD' | 'RWD' | 'AWD' | '4WD' | 'UNKNOWN';
  bodyStyle: string;
  fuelType: 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'PLUGIN_HYBRID' | 'UNKNOWN';
  emissionStandard: string;
  marketRegion: 'JP' | 'EU' | 'US' | 'MY' | 'ASEAN' | 'CN' | 'OTHER';
  plantCountry: string;
  plantCity: string;
  serialNumber: string;
}

export interface VehicleProfile {
  id: string;
  vin: string;
  vinData: VINDecoded;
  supportedProtocols: OBDProtocol[];
  expectedECUs: ECUType[];
  availablePIDs: string[];
  dtcDefinitions: Record<string, DTCDefinition>;
  createdAt: Date;
  lastScanned: Date;
}

// ============ OBD COMMUNICATION ============
export type OBDProtocol = 
  | 'CAN_11BIT_500K'
  | 'CAN_29BIT_500K'
  | 'CAN_11BIT_250K'
  | 'CAN_29BIT_250K'
  | 'ISO_15765_4'
  | 'ISO_14230_4_KWP'
  | 'ISO_9141_2'
  | 'SAE_J1850_PWM'
  | 'SAE_J1850_VPW';

export type ECUType = 
  | 'ECM'   // Engine Control Module
  | 'TCM'   // Transmission Control Module
  | 'ABS'   // Anti-lock Braking System
  | 'SRS'   // Supplemental Restraint System (Airbag)
  | 'BCM'   // Body Control Module
  | 'EPS'   // Electric Power Steering
  | 'HVAC'  // Climate Control
  | 'IPC'   // Instrument Panel Cluster
  | 'TPMS'  // Tire Pressure Monitoring
  | 'PDC'   // Park Distance Control
  | 'ACC'   // Adaptive Cruise Control
  | 'LKA'   // Lane Keep Assist
  | 'ADAS'  // Advanced Driver Assistance
  | 'IMMO'  // Immobilizer
  | 'GW'    // Gateway Module
  | 'OTHER';

export type ECUStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'NOT_SCANNED';

export type CommunicationQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'NO_RESPONSE';

export interface ECUInfo {
  type: ECUType;
  name: string;
  address: string;
  status: ECUStatus;
  protocol: OBDProtocol | null;
  firmwareVersion: string | null;
  hardwareVersion: string | null;
  partNumber: string | null;
  voltage: number | null;
  communicationQuality: CommunicationQuality;
  dtcCount: {
    stored: number;
    pending: number;
    permanent: number;
    history: number;
  };
  lastResponse: Date | null;
  scanDuration: number; // ms
}

// ============ DIAGNOSTIC TROUBLE CODES ============
export type DTCStatus = 'STORED' | 'PENDING' | 'PERMANENT' | 'HISTORY';

export type DTCSeverity = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface DTCDefinition {
  code: string;
  description: string;
  oemDescription: string | null;
  system: ECUType;
  category: DTCCategory;
  severity: DTCSeverity;
  driveImpact: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  safetyImpact: boolean;
  emissionRelevant: boolean;
  possibleCauses: string[];
  possibleSymptoms: string[];
  recommendedActions: string[];
  relatedCodes: string[];
}

export type DTCCategory = 
  | 'POWERTRAIN'
  | 'CHASSIS'
  | 'BODY'
  | 'NETWORK'
  | 'MANUFACTURER';

export interface DiagnosticTroubleCode {
  code: string;
  status: DTCStatus;
  sourceECU: ECUType;
  definition: DTCDefinition;
  freezeFrame: FreezeFrameData | null;
  firstDetected: Date;
  occurrenceCount: number;
  clearedHistory: ClearAttempt[];
}

export interface FreezeFrameData {
  timestamp: Date;
  engineRPM: number | null;
  vehicleSpeed: number | null;
  coolantTemp: number | null;
  engineLoad: number | null;
  fuelPressure: number | null;
  intakeMAP: number | null;
  intakeAirTemp: number | null;
  throttlePosition: number | null;
  oxygenSensorReadings: Record<string, number>;
  fuelTrimShort: number | null;
  fuelTrimLong: number | null;
}

export interface ClearAttempt {
  timestamp: Date;
  success: boolean;
  returnedAfterMs: number | null;
  markedAsHardFault: boolean;
}

// ============ LIVE DATA ============
export interface LiveDataParameter {
  pid: string;
  name: string;
  value: number | string | boolean | null;
  unit: string;
  normalRange: {
    min: number;
    max: number;
  } | null;
  currentDeviation: number; // percentage from normal
  confidence: number; // 0-1
  category: LiveDataCategory;
  description: string;
  lastUpdated: Date;
}

export type LiveDataCategory = 
  | 'ENGINE_CORE'
  | 'FUEL_SYSTEM'
  | 'IGNITION'
  | 'EMISSION'
  | 'TEMPERATURE'
  | 'SPEED_LOAD'
  | 'OXYGEN_SENSORS'
  | 'EVAP_SYSTEM'
  | 'CATALYST'
  | 'VOLTAGE'
  | 'TRANSMISSION'
  | 'BRAKES'
  | 'STEERING'
  | 'BODY_ELECTRICAL';

export interface LiveDataSnapshot {
  timestamp: Date;
  parameters: LiveDataParameter[];
  vinHash: string;
  sessionId: string;
}

// ============ DIAGNOSTIC INTELLIGENCE ============
export interface DiagnosticCase {
  caseId: string;
  symptoms: string[];
  affectedSystems: ECUType[];
  relatedDTCs: string[];
  liveDataAnomalies: LiveDataAnomaly[];
  confidence: number; // 0-1
  rootCause: RootCauseAnalysis;
  recommendedActions: ActionRecommendation[];
  status: CaseStatus;
  createdAt: Date;
  resolvedAt: Date | null;
}

export interface LiveDataAnomaly {
  parameter: string;
  expectedRange: string;
  actualValue: string;
  deviationPercent: number;
  significance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RootCauseAnalysis {
  primaryCause: string;
  confidence: number;
  explanation: string;
  secondaryCauses: Array<{
    cause: string;
    probability: number;
  }>;
  supportingEvidence: string[];
  whatToTestNext: string[];
  whatNOTToReplace: string[];
}

export interface ActionRecommendation {
  priority: number;
  action: string;
  type: 'PHYSICAL_CHECK' | 'COMPONENT_TEST' | 'REPLACEMENT' | 'SOFTWARE_UPDATE' | 'CALIBRATION' | 'CLEAR_AND_VERIFY';
  estimatedTime: string;
  requiredTools: string[];
  partNumbers: string[];
  notes: string;
}

export type CaseStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'MONITORING';

// ============ TOPOLOGY & SYSTEM SCAN ============
export interface TopologyScan {
  id: string;
  vehicleProfile: VehicleProfile;
  startTime: Date;
  endTime: Date | null;
  status: ScanStatus;
  ecus: ECUInfo[];
  totalDTCs: number;
  criticalIssues: number;
  topologyIssues: TopologyIssue[];
}

export type ScanStatus = 
  | 'INITIALIZING'
  | 'VIN_DETECTION'
  | 'TOPOLOGY_DISCOVERY'
  | 'ECU_SCANNING'
  | 'DTC_READING'
  | 'LIVE_DATA_CAPTURE'
  | 'ANALYSIS'
  | 'COMPLETE'
  | 'ERROR'
  | 'CANCELLED';

export interface TopologyIssue {
  type: 'MISSING_ECU' | 'DEGRADED_ECU' | 'CAN_BUS_ERROR' | 'POWER_ISSUE' | 'GATEWAY_ERROR';
  affectedECUs: ECUType[];
  description: string;
  severity: DTCSeverity;
  possibleCauses: string[];
}

// ============ DIAGNOSTIC SESSION ============
export interface DiagnosticSession {
  id: string;
  vehicleVIN: string;
  vehicleProfile: VehicleProfile;
  startTime: Date;
  endTime: Date | null;
  status: SessionStatus;
  currentPhase: DiagnosticPhase;
  topologyScan: TopologyScan | null;
  dtcs: DiagnosticTroubleCode[];
  liveDataSnapshots: LiveDataSnapshot[];
  diagnosticCases: DiagnosticCase[];
  clearingAttempts: ClearingSession[];
  report: DiagnosticReport | null;
}

export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABORTED';

export type DiagnosticPhase = 
  | 'CONNECTION'
  | 'BRAND_SELECT'
  | 'VIN_DETECTION'
  | 'VEHICLE_PROFILE'
  | 'TOPOLOGY_SCAN'
  | 'SYSTEM_DIAGNOSIS'
  | 'LIVE_DATA'
  | 'ROOT_CAUSE_ANALYSIS'
  | 'ACTION_RECOMMENDATION'
  | 'DTC_CLEARING'
  | 'VALIDATION'
  | 'REPORT_GENERATION'
  | 'COMPLETE';

// ============ NEW OBD MODE TYPES ============

export interface ReadinessMonitors {
  milOn: boolean;
  dtcCount: number;
  monitors: ReadinessMonitor[];
}

export interface ReadinessMonitor {
  name: string;
  available: boolean;
  complete: boolean;
}

export interface MonitoringTestResult {
  testId: number;
  component: string;
  value: number;
  minLimit: number;
  maxLimit: number;
  passed: boolean;
  healthPct: number;
}

export interface O2SensorTestResult {
  sensor: string;
  richToLeanThreshold: number;
  leanToRichThreshold: number;
  lowVoltage: number;
  highVoltage: number;
  responseTime: number;
}

export interface VehicleInfoExtended {
  vin: string;
  calibrationIds: string[];
  calibrationVerification: string[];
  ecuName: string;
}

export interface VehicleScan {
  id: string;
  vin: string;
  scannedAt: string;
  brand: string;
  model: string;
  year: number;
  confirmedDtcs: string[];
  pendingDtcs: string[];
  permanentDtcs: string[];
  healthScore: number | null;
  monitoringTests: MonitoringTestResult[];
}

export interface ClearResults {
  cleared: string[];
  returned: string[];
  permanent: string[];
  preReadiness: ReadinessMonitors | null;
  postReadiness: ReadinessMonitors | null;
}

export interface ComponentHealthScore {
  component: string;
  healthPct: number;
  status: 'good' | 'warning' | 'critical';
}

// ============ KNOWLEDGE GRAPH & LEARNING ============
export interface DiagnosticKnowledge {
  id: string;
  category: 'DTC_PATTERN' | 'SYMPTOM_CORRELATION' | 'FIX_OUTCOME' | 'COMPONENT_FAILURE';
  vehicleMake: string;
  vehicleModel: string;
  yearRange: { start: number; end: number };
  region: MarketRegion;
  data: KnowledgeData;
  confidenceScore: number;
  occurrenceCount: number;
  successRate: number;
  lastUpdated: Date;
  source: 'WORKSHOP' | 'OEM' | 'COMMUNITY' | 'AI_INFERRED';
}

export type KnowledgeData = 
  | DTCPatternKnowledge
  | SymptomCorrelationKnowledge
  | FixOutcomeKnowledge
  | ComponentFailureKnowledge;

export interface DTCPatternKnowledge {
  type: 'DTC_PATTERN';
  primaryDTC: string;
  associatedDTCs: string[];
  liveDataSignature: Array<{ pid: string; range: { min: number; max: number } }>;
  commonCauses: Array<{ cause: string; probability: number }>;
  falsePositiveIndicators: string[];
}

export interface SymptomCorrelationKnowledge {
  type: 'SYMPTOM_CORRELATION';
  symptom: string;
  correlatedDTCs: Array<{ dtc: string; correlation: number }>;
  correlatedLiveData: Array<{ pid: string; deviation: string }>;
  rootCauses: Array<{ cause: string; probability: number }>;
}

export interface FixOutcomeKnowledge {
  type: 'FIX_OUTCOME';
  dtcCode: string;
  attemptedFix: string;
  successRate: number;
  avgTimeToReturn: number | null; // days, null if permanent fix
  conditions: string[];
  notRecommendedIf: string[];
}

export interface ComponentFailureKnowledge {
  type: 'COMPONENT_FAILURE';
  component: string;
  commonFailureModes: string[];
  avgMileageAtFailure: number;
  warningSignsDTCs: string[];
  warningSignsLiveData: Array<{ pid: string; threshold: string }>;
  preventiveMeasures: string[];
}

export interface CaseImprovement {
  caseId: string;
  originalConfidence: number;
  improvedConfidence: number;
  improvementSource: 'SIMILAR_CASE' | 'FIX_FEEDBACK' | 'OEM_DATA' | 'EXPERT_REVIEW';
  appliedKnowledge: string[];
  timestamp: Date;
}

// ============ LEGAL & OEM COMPLIANCE ============
export type MarketRegion = 'MY' | 'SG' | 'TH' | 'ID' | 'PH' | 'VN' | 'ASEAN' | 'ASEAN_OTHER' | 'JP' | 'US' | 'EU' | 'CN' | 'AU' | 'GLOBAL';

export interface LegalRestriction {
  region: MarketRegion;
  restrictionType: 'BLOCKED' | 'WARNING' | 'LICENSED_ONLY' | 'OEM_TOOL_ONLY';
  description: string;
  regulation: string | null;
  effectiveDate: Date | null;
}

export interface OEMBoundary {
  make: string;
  model: string | null; // null = all models
  yearRange: { start: number; end: number } | null;
  region: MarketRegion;
  supportedFeatures: OEMFeatureSupport[];
  restrictions: OEMRestriction[];
  notes: string;
}

export interface OEMFeatureSupport {
  feature: OEMFeature;
  support: 'FULL' | 'PARTIAL' | 'READ_ONLY' | 'NOT_SUPPORTED';
  notes: string | null;
}

export type OEMFeature = 
  | 'DTC_READ'
  | 'DTC_CLEAR'
  | 'LIVE_DATA'
  | 'FREEZE_FRAME'
  | 'ACTUATOR_TEST'
  | 'CALIBRATION'
  | 'CODING'
  | 'PROGRAMMING'
  | 'KEY_LEARNING'
  | 'IMMOBILIZER';

export interface OEMRestriction {
  feature: OEMFeature;
  reason: string;
  alternative: string | null;
  legalReference: string | null;
}

export interface ComplianceCheck {
  feature: OEMFeature;
  vehicle: { make: string; model: string; year: number };
  region: MarketRegion;
  isAllowed: boolean;
  restrictions: LegalRestriction[];
  warnings: string[];
  requiresConsent: boolean;
  consentText: string | null;
}

// ============ DTC CLEARING ============
export interface ClearingSession {
  id: string;
  timestamp: Date;
  targetECUs: ECUType[];
  preconditionsMet: ClearingPreconditions;
  results: ClearingResult[];
  validationScan: TopologyScan | null;
}

export interface ClearingPreconditions {
  batteryVoltageOK: boolean;
  batteryVoltage: number;
  ignitionStateCorrect: boolean;
  engineOff: boolean;
  criticalFaultsResolved: boolean;
  pendingCriticalFaults: string[];
}

export interface ClearingResult {
  ecu: ECUType;
  success: boolean;
  clearedCodes: string[];
  returnedImmediately: string[];
  hardFaults: string[];
  errorMessage: string | null;
}

// ============ DIAGNOSTIC REPORT ============
export interface DiagnosticReport {
  id: string;
  sessionId: string;
  generatedAt: Date;
  vehicleInfo: VINDecoded;
  systemsScanned: ECUInfo[];
  faultSummary: FaultSummary;
  rootCauseAnalysis: RootCauseAnalysis[];
  repairRecommendations: ActionRecommendation[];
  postClearStatus: PostClearStatus | null;
  technicianNotes: string;
  customerSummary: string;
}

export interface FaultSummary {
  totalFaults: number;
  criticalFaults: number;
  safetyRelated: number;
  emissionRelated: number;
  faultsBySystem: Record<ECUType, DiagnosticTroubleCode[]>;
  clearedFaults: number;
  remainingFaults: number;
}

export interface PostClearStatus {
  scanTime: Date;
  allClear: boolean;
  returnedFaults: DiagnosticTroubleCode[];
  hardFaults: string[];
  liveDataNormalized: boolean;
}

// ============ BLUETOOTH/OBD DEVICE ============
export interface OBDDevice {
  id: string;
  name: string;
  type: 'BLE' | 'CLASSIC' | 'USB' | 'WIFI';
  connected: boolean;
  batteryLevel: number | null;
  firmwareVersion: string | null;
  lastSeen: Date;
  signalStrength: number | null;
}

export interface ConnectionStatus {
  device: OBDDevice | null;
  vehicleConnected: boolean;
  ignitionState: 'OFF' | 'ACC' | 'ON' | 'START' | 'UNKNOWN';
  batteryVoltage: number | null;
  protocol: OBDProtocol | null;
}

// ============ UI STATE ============
export interface DiagnosticUIState {
  currentStep: DiagnosticPhase;
  isConnecting: boolean;
  isScanning: boolean;
  scanProgress: number; // 0-100
  currentECU: ECUType | null;
  notifications: UINotification[];
  activePanel: 'overview' | 'topology' | 'dtc' | 'live-data' | 'analysis' | 'report';
}

export interface UINotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  persistent: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// ============ DATABASE MODELS (Firebase/Firestore) ============
export interface VehicleScanDoc {
  vin: string;
  scannedAt: any; // Firebase Timestamp
  brand: string;
  model: string;
  year: number;
  ecusFound: ECUInfo[];
  confirmedDtcs: DiagnosticTroubleCode[];
  pendingDtcs: DiagnosticTroubleCode[];
  permanentDtcs: DiagnosticTroubleCode[];
  freezeFrames: Record<string, FreezeFrameData>;
  monitoringTests: MonitoringTestResult[];
  readinessMonitors: ReadinessMonitors | null;
  liveDataSnapshot: LiveDataParameter[];
  dtcsCleared: ClearResults | null;
  diagnosticCases: DiagnosticCase[];
  overallHealthScore: number;
}
