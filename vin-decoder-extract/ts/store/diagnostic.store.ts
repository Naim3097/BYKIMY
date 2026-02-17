// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - ZUSTAND STORE
// Global state management for diagnostic session
// ============================================================

import { create } from 'zustand';
import {
  DiagnosticPhase,
  ECUInfo,
  DiagnosticTroubleCode,
  LiveDataParameter,
  DiagnosticCase,
  VINDecoded,
  OBDDevice,
  ConnectionStatus,
  UINotification,
  DiagnosticKnowledge,
  ComplianceCheck,
  MarketRegion,
  ReadinessMonitors,
  FreezeFrameData,
  MonitoringTestResult,
  O2SensorTestResult,
  VehicleInfoExtended,
  VehicleScan,
  ClearResults,
} from '@/types';

interface DiagnosticState {
  // Connection State
  device: OBDDevice | null;
  connectionStatus: ConnectionStatus;
  isConnecting: boolean;
  isConnected: boolean;

  // Session State
  currentPhase: DiagnosticPhase;
  sessionId: string | null;
  sessionStartTime: Date | null;

  // Vehicle Information
  selectedBrand: string | null;
  vin: string | null;
  vinData: VINDecoded | null;
  vinValidation: { isValid: boolean; errors: string[] } | null;

  // Scan State
  isScanning: boolean;
  scanProgress: number;
  currentECU: string | null;
  ecus: ECUInfo[];

  // Diagnostics
  dtcs: DiagnosticTroubleCode[];
  liveData: LiveDataParameter[];
  diagnosticCases: DiagnosticCase[];

  // New OBD Mode Data
  readinessMonitors: ReadinessMonitors | null;
  pendingDtcs: DiagnosticTroubleCode[];
  permanentDtcs: DiagnosticTroubleCode[];
  freezeFrames: Record<string, FreezeFrameData>;
  monitoringTests: MonitoringTestResult[];
  overallHealthScore: number | null;
  o2SensorTests: O2SensorTestResult[];
  vehicleInfoExtended: VehicleInfoExtended | null;
  supportedPids: number[];
  scanHistory: VehicleScan[];
  clearResults: ClearResults | null;
  diagnosticNarrative: string | null;

  // Knowledge Graph
  relatedKnowledge: DiagnosticKnowledge[];
  knowledgeConfidence: number;

  // Legal & Compliance
  currentRegion: MarketRegion;
  complianceChecks: ComplianceCheck[];
  hasComplianceWarnings: boolean;

  // UI State
  activePanel: 'overview' | 'topology' | 'dtc' | 'live-data' | 'analysis' | 'report';
  notifications: UINotification[];
  isClearing: boolean;

  // Workshop Identity
  technicianName: string;
  workshopName: string;

  // Actions
  setDevice: (device: OBDDevice | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setConnecting: (connecting: boolean) => void;
  setConnected: (connected: boolean) => void;
  
  setCurrentPhase: (phase: DiagnosticPhase) => void;
  startSession: () => void;
  endSession: () => void;

  setSelectedBrand: (brand: string | null) => void;
  setVIN: (vin: string | null) => void;
  setVINData: (data: VINDecoded | null) => void;
  setVINValidation: (validation: { isValid: boolean; errors: string[] } | null) => void;

  setScanning: (scanning: boolean) => void;
  setScanProgress: (progress: number) => void;
  setCurrentECU: (ecu: string | null) => void;
  setECUs: (ecus: ECUInfo[]) => void;
  updateECU: (ecu: ECUInfo) => void;

  setDTCs: (dtcs: DiagnosticTroubleCode[]) => void;
  addDTC: (dtc: DiagnosticTroubleCode) => void;
  clearDTCs: () => void;
  setClearing: (clearing: boolean) => void;

  setLiveData: (data: LiveDataParameter[]) => void;
  updateLiveDataParameter: (param: LiveDataParameter) => void;

  setDiagnosticCases: (cases: DiagnosticCase[]) => void;
  addDiagnosticCase: (diagnosticCase: DiagnosticCase) => void;

  // New OBD Mode Actions
  setReadinessMonitors: (monitors: ReadinessMonitors) => void;
  setPendingDtcs: (dtcs: DiagnosticTroubleCode[]) => void;
  setPermanentDtcs: (dtcs: DiagnosticTroubleCode[]) => void;
  setFreezeFrame: (dtcCode: string, data: FreezeFrameData) => void;
  setMonitoringTests: (tests: MonitoringTestResult[]) => void;
  setOverallHealthScore: (score: number) => void;
  setO2SensorTests: (tests: O2SensorTestResult[]) => void;
  setVehicleInfoExtended: (info: VehicleInfoExtended) => void;
  setSupportedPids: (pids: number[]) => void;
  setScanHistory: (history: VehicleScan[]) => void;
  setClearResults: (results: ClearResults) => void;
  setDiagnosticNarrative: (narrative: string) => void;

  // Knowledge Actions
  setRelatedKnowledge: (knowledge: DiagnosticKnowledge[]) => void;
  setKnowledgeConfidence: (confidence: number) => void;

  // Compliance Actions
  setCurrentRegion: (region: MarketRegion) => void;
  setComplianceChecks: (checks: ComplianceCheck[]) => void;
  setHasComplianceWarnings: (hasWarnings: boolean) => void;

  setActivePanel: (panel: 'overview' | 'topology' | 'dtc' | 'live-data' | 'analysis' | 'report') => void;
  addNotification: (notification: Omit<UINotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Workshop Identity Actions
  setTechnicianName: (name: string) => void;
  setWorkshopName: (name: string) => void;

  // Reset
  resetSession: () => void;
}

const initialState = {
  device: null,
  connectionStatus: {
    device: null,
    vehicleConnected: false,
    ignitionState: 'UNKNOWN' as const,
    batteryVoltage: null,
    protocol: null,
  },
  isConnecting: false,
  isConnected: false,

  currentPhase: 'CONNECTION' as DiagnosticPhase,
  sessionId: null,
  sessionStartTime: null,

  selectedBrand: null,
  vin: null,
  vinData: null,
  vinValidation: null,

  isScanning: false,
  scanProgress: 0,
  currentECU: null,
  ecus: [],

  dtcs: [],
  liveData: [],
  diagnosticCases: [],

  // New OBD Mode Data
  readinessMonitors: null,
  pendingDtcs: [],
  permanentDtcs: [],
  freezeFrames: {},
  monitoringTests: [],
  overallHealthScore: null,
  o2SensorTests: [],
  vehicleInfoExtended: null,
  supportedPids: [],
  scanHistory: [],
  clearResults: null,
  diagnosticNarrative: null,

  // Knowledge
  relatedKnowledge: [],
  knowledgeConfidence: 0,

  // Compliance
  currentRegion: 'MY' as MarketRegion,
  complianceChecks: [],
  hasComplianceWarnings: false,

  activePanel: 'overview' as const,
  notifications: [],
  isClearing: false,

  // Workshop Identity
  technicianName: 'Operator',
  workshopName: 'BYKI Diagnostic',
};

export const useDiagnosticStore = create<DiagnosticState>((set, get) => ({
  ...initialState,

  // Connection Actions
  setDevice: (device) => set({ device }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setConnected: (connected) => set({ isConnected: connected }),

  // Session Actions
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
  startSession: () => set({
    sessionId: `BYKI-${Date.now()}`,
    sessionStartTime: new Date(),
    // Don't reset currentPhase here — caller sets the appropriate phase after
  }),
  endSession: () => set({
    currentPhase: 'COMPLETE',
  }),

  // VIN Actions
  setSelectedBrand: (brand) => set({ selectedBrand: brand }),
  setVIN: (vin) => set({ vin }),
  setVINData: (data) => set({ vinData: data }),
  setVINValidation: (validation) => set({ vinValidation: validation }),

  // Scan Actions
  setScanning: (scanning) => set({ isScanning: scanning }),
  setScanProgress: (progress) => set({ scanProgress: progress }),
  setCurrentECU: (ecu) => set({ currentECU: ecu }),
  setECUs: (ecus) => set({ ecus }),
  updateECU: (ecu) => set((state) => ({
    ecus: state.ecus.map((e) => (e.type === ecu.type ? ecu : e)),
  })),

  // DTC Actions
  setDTCs: (dtcs) => set({ dtcs }),
  addDTC: (dtc) => set((state) => ({
    dtcs: [...state.dtcs, dtc],
  })),
  clearDTCs: () => set({ dtcs: [] }),
  setClearing: (clearing) => set({ isClearing: clearing }),

  // Live Data Actions
  setLiveData: (data) => set({ liveData: data }),
  updateLiveDataParameter: (param) => set((state) => ({
    liveData: state.liveData.map((p) => (p.pid === param.pid ? param : p)),
  })),

  // Diagnostic Case Actions
  setDiagnosticCases: (cases) => set({ diagnosticCases: cases }),
  addDiagnosticCase: (diagnosticCase) => set((state) => ({
    diagnosticCases: [...state.diagnosticCases, diagnosticCase],
  })),

  // New OBD Mode Actions
  setReadinessMonitors: (monitors) => set({ readinessMonitors: monitors }),
  setPendingDtcs: (dtcs) => set({ pendingDtcs: dtcs }),
  setPermanentDtcs: (dtcs) => set({ permanentDtcs: dtcs }),
  setFreezeFrame: (dtcCode, data) => set((state) => ({
    freezeFrames: { ...state.freezeFrames, [dtcCode]: data },
  })),
  setMonitoringTests: (tests) => set({ monitoringTests: tests }),
  setOverallHealthScore: (score) => set({ overallHealthScore: score }),
  setO2SensorTests: (tests) => set({ o2SensorTests: tests }),
  setVehicleInfoExtended: (info) => set({ vehicleInfoExtended: info }),
  setSupportedPids: (pids) => set({ supportedPids: pids }),
  setScanHistory: (history) => set({ scanHistory: history }),
  setClearResults: (results) => set({ clearResults: results }),
  setDiagnosticNarrative: (narrative) => set({ diagnosticNarrative: narrative }),

  // Knowledge Actions
  setRelatedKnowledge: (knowledge) => set({ relatedKnowledge: knowledge }),
  setKnowledgeConfidence: (confidence) => set({ knowledgeConfidence: confidence }),

  // Compliance Actions
  setCurrentRegion: (region) => set({ currentRegion: region }),
  setComplianceChecks: (checks) => set({ complianceChecks: checks }),
  setHasComplianceWarnings: (hasWarnings) => set({ hasComplianceWarnings: hasWarnings }),

  // UI Actions
  setActivePanel: (panel) => set({ activePanel: panel }),
  addNotification: (notification) => set((state) => ({
    notifications: [
      ...state.notifications,
      {
        ...notification,
        id: `notif-${Date.now()}`,
        timestamp: new Date(),
      },
    ],
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
  clearNotifications: () => set({ notifications: [] }),

  // Workshop Identity Actions
  setTechnicianName: (name) => set({ technicianName: name }),
  setWorkshopName: (name) => set({ workshopName: name }),

  // Reset
  resetSession: () => set(initialState),
}));
