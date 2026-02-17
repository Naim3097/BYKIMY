// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - SERVICE EXPORTS
// Central export for all diagnostic services
// ============================================================

// Agent Bridge (primary interface to Rust agent)
export { agentBridge } from './agent-bridge';
export type { AgentStatus, VciDevice, VciConnected, DiscoveredEcu, DtcResult, PidValue } from './agent-bridge';

// Agent Type Mappers
export {
  mapDiscoveredEcu,
  mapDtcResult,
  mapPidValue,
  mapFreezeFrame,
  mapEcuAddressToType,
  calculateOverallHealthScore,
  generateDiagnosticNarrative,
} from './agent-types';

// Core Services
export { bluetoothService } from './bluetooth.service';
export { vinDecoder } from './vin-decoder.service';
export { obdDiagnosticService } from './obd-diagnostic.service';

// Mock Data Service (used internally by agentBridge in demo mode)
export { 
  mockDataService, 
  MOCK_VIN_DATA, 
  MOCK_ECUS, 
  MOCK_DTCS, 
  MOCK_LIVE_DATA, 
  MOCK_DIAGNOSTIC_CASE 
} from './mock-data.service';

// Scan History (Firebase)
export { scanHistoryService } from './scan-history.service';

// Advanced Diagnostic Services
export { knowledgeGraphService } from './knowledge-graph.service';
export { legalComplianceService } from './legal-compliance.service';

// Intelligent Data Analysis
export { liveDataAnalyzerService, PARAMETER_RELATIONSHIPS } from './live-data-analyzer.service';

// Advanced Live Data Analyzer (v2 - Comprehensive)
export { 
  advancedLiveDataAnalyzer,
  type DiagnosticInsight,
  type ParameterHealth,
  type SystemHealth,
  type CorrelationAnalysis,
  type AnalysisResult,
  type PrioritizedAction,
  type PredictiveAlert,
} from './advanced-live-data-analyzer.service';
