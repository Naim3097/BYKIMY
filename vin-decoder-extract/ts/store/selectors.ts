// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - ZUSTAND SELECTORS
// Optimized selectors to prevent unnecessary re-renders
// Components should use these instead of destructuring the entire store
// ============================================================

import { useDiagnosticStore } from './diagnostic.store';

// ============ Connection Selectors ============
export const useConnectionStatus = () => useDiagnosticStore(s => s.connectionStatus);
export const useIsConnected = () => useDiagnosticStore(s => s.isConnected);
export const useIsConnecting = () => useDiagnosticStore(s => s.isConnecting);
export const useCurrentPhase = () => useDiagnosticStore(s => s.currentPhase);
export const useDevice = () => useDiagnosticStore(s => s.device);

// ============ Vehicle Selectors ============
export const useSelectedBrand = () => useDiagnosticStore(s => s.selectedBrand);
export const useVin = () => useDiagnosticStore(s => s.vin);
export const useVinData = () => useDiagnosticStore(s => s.vinData);
export const useVehicleInfoExtended = () => useDiagnosticStore(s => s.vehicleInfoExtended);

// ============ Diagnostic Selectors ============
export const useDtcs = () => useDiagnosticStore(s => s.dtcs);
export const usePendingDtcs = () => useDiagnosticStore(s => s.pendingDtcs);
export const usePermanentDtcs = () => useDiagnosticStore(s => s.permanentDtcs);
export const useEcus = () => useDiagnosticStore(s => s.ecus);
export const useLiveData = () => useDiagnosticStore(s => s.liveData);
export const useSupportedPids = () => useDiagnosticStore(s => s.supportedPids);
export const useFreezeFrames = () => useDiagnosticStore(s => s.freezeFrames);
export const useReadinessMonitors = () => useDiagnosticStore(s => s.readinessMonitors);
export const useMonitoringTests = () => useDiagnosticStore(s => s.monitoringTests);
export const useO2SensorTests = () => useDiagnosticStore(s => s.o2SensorTests);

// ============ Scan State Selectors ============
export const useIsScanning = () => useDiagnosticStore(s => s.isScanning);
export const useScanProgress = () => useDiagnosticStore(s => s.scanProgress);
export const useOverallHealthScore = () => useDiagnosticStore(s => s.overallHealthScore);
export const useDiagnosticNarrative = () => useDiagnosticStore(s => s.diagnosticNarrative);

// ============ UI State Selectors ============
export const useNotifications = () => useDiagnosticStore(s => s.notifications);
export const useActivePanel = () => useDiagnosticStore(s => s.activePanel);
export const useIsClearing = () => useDiagnosticStore(s => s.isClearing);

// ============ Derived Selectors ============
export const useTotalDtcCount = () => useDiagnosticStore(s =>
  s.dtcs.length + s.pendingDtcs.length + s.permanentDtcs.length
);
export const useHasActiveFaults = () => useDiagnosticStore(s => s.dtcs.length > 0);
export const useOnlineEcuCount = () => useDiagnosticStore(s =>
  s.ecus.filter(e => e.status === 'ONLINE').length
);
export const useBatteryVoltage = () => useDiagnosticStore(s => s.connectionStatus.batteryVoltage);

// ============ Workshop Selectors ============
export const useTechnicianName = () => useDiagnosticStore(s => s.technicianName);
export const useWorkshopName = () => useDiagnosticStore(s => s.workshopName);
export const useCurrentRegion = () => useDiagnosticStore(s => s.currentRegion);
