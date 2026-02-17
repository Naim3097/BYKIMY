// ============================================================
// BYKI WORKSHOP DIAGNOSTIC — RIVERPOD STATE MANAGEMENT
// Ported 1:1 from Zustand diagnostic.store.ts
// ============================================================

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/diagnostic_types.dart';

/// Main diagnostic state — mirrors the Zustand store exactly
class DiagnosticState {
  // Connection State
  final OBDDevice? device;
  final ConnectionStatus connectionStatus;
  final bool isConnecting;
  final bool isConnected;

  // Session State
  final DiagnosticPhase currentPhase;
  final String? sessionId;
  final DateTime? sessionStartTime;

  // Vehicle Information
  final String? selectedBrand;
  final String? vin;
  final VINData? vinData;
  final VINValidation? vinValidation;

  // Scan State
  final bool isScanning;
  final double scanProgress;
  final String? currentECU;
  final List<ECUInfo> ecus;

  // Diagnostics
  final List<DiagnosticTroubleCode> dtcs;
  final List<LiveDataParameter> liveData;
  final List<DiagnosticCase> diagnosticCases;

  // OBD Mode Data
  final ReadinessMonitors? readinessMonitors;
  final List<DiagnosticTroubleCode> pendingDtcs;
  final List<DiagnosticTroubleCode> permanentDtcs;
  final Map<String, FreezeFrameData> freezeFrames;
  final List<MonitoringTestResult> monitoringTests;
  final double? overallHealthScore;
  final List<O2SensorTestResult> o2SensorTests;
  final VehicleInfoExtended? vehicleInfoExtended;
  final List<int> supportedPids;
  final List<VehicleScan> scanHistory;
  final ClearResults? clearResults;
  final String? diagnosticNarrative;

  // Knowledge Graph
  final List<DiagnosticKnowledge> relatedKnowledge;
  final double knowledgeConfidence;

  // Legal & Compliance
  final MarketRegion currentRegion;
  final List<ComplianceCheck> complianceChecks;
  final bool hasComplianceWarnings;

  // UI State
  final String activePanel;
  final List<UINotification> notifications;
  final bool isClearing;

  // Workshop Identity
  final String technicianName;
  final String workshopName;

  const DiagnosticState({
    this.device,
    this.connectionStatus = const ConnectionStatus(
      vehicleConnected: false,
      ignitionState: IgnitionState.unknown,
    ),
    this.isConnecting = false,
    this.isConnected = false,
    this.currentPhase = DiagnosticPhase.connection,
    this.sessionId,
    this.sessionStartTime,
    this.selectedBrand,
    this.vin,
    this.vinData,
    this.vinValidation,
    this.isScanning = false,
    this.scanProgress = 0,
    this.currentECU,
    this.ecus = const [],
    this.dtcs = const [],
    this.liveData = const [],
    this.diagnosticCases = const [],
    this.readinessMonitors,
    this.pendingDtcs = const [],
    this.permanentDtcs = const [],
    this.freezeFrames = const {},
    this.monitoringTests = const [],
    this.overallHealthScore,
    this.o2SensorTests = const [],
    this.vehicleInfoExtended,
    this.supportedPids = const [],
    this.scanHistory = const [],
    this.clearResults,
    this.diagnosticNarrative,
    this.relatedKnowledge = const [],
    this.knowledgeConfidence = 0,
    this.currentRegion = MarketRegion.my,
    this.complianceChecks = const [],
    this.hasComplianceWarnings = false,
    this.activePanel = 'overview',
    this.notifications = const [],
    this.isClearing = false,
    this.technicianName = 'Operator',
    this.workshopName = 'BYKI Diagnostic',
  });

  DiagnosticState copyWith({
    OBDDevice? device,
    ConnectionStatus? connectionStatus,
    bool? isConnecting,
    bool? isConnected,
    DiagnosticPhase? currentPhase,
    String? sessionId,
    DateTime? sessionStartTime,
    String? selectedBrand,
    String? vin,
    VINData? vinData,
    VINValidation? vinValidation,
    bool? isScanning,
    double? scanProgress,
    String? currentECU,
    List<ECUInfo>? ecus,
    List<DiagnosticTroubleCode>? dtcs,
    List<LiveDataParameter>? liveData,
    List<DiagnosticCase>? diagnosticCases,
    ReadinessMonitors? readinessMonitors,
    List<DiagnosticTroubleCode>? pendingDtcs,
    List<DiagnosticTroubleCode>? permanentDtcs,
    Map<String, FreezeFrameData>? freezeFrames,
    List<MonitoringTestResult>? monitoringTests,
    double? overallHealthScore,
    List<O2SensorTestResult>? o2SensorTests,
    VehicleInfoExtended? vehicleInfoExtended,
    List<int>? supportedPids,
    List<VehicleScan>? scanHistory,
    ClearResults? clearResults,
    String? diagnosticNarrative,
    List<DiagnosticKnowledge>? relatedKnowledge,
    double? knowledgeConfidence,
    MarketRegion? currentRegion,
    List<ComplianceCheck>? complianceChecks,
    bool? hasComplianceWarnings,
    String? activePanel,
    List<UINotification>? notifications,
    bool? isClearing,
    String? technicianName,
    String? workshopName,
  }) {
    return DiagnosticState(
      device: device ?? this.device,
      connectionStatus: connectionStatus ?? this.connectionStatus,
      isConnecting: isConnecting ?? this.isConnecting,
      isConnected: isConnected ?? this.isConnected,
      currentPhase: currentPhase ?? this.currentPhase,
      sessionId: sessionId ?? this.sessionId,
      sessionStartTime: sessionStartTime ?? this.sessionStartTime,
      selectedBrand: selectedBrand ?? this.selectedBrand,
      vin: vin ?? this.vin,
      vinData: vinData ?? this.vinData,
      vinValidation: vinValidation ?? this.vinValidation,
      isScanning: isScanning ?? this.isScanning,
      scanProgress: scanProgress ?? this.scanProgress,
      currentECU: currentECU ?? this.currentECU,
      ecus: ecus ?? this.ecus,
      dtcs: dtcs ?? this.dtcs,
      liveData: liveData ?? this.liveData,
      diagnosticCases: diagnosticCases ?? this.diagnosticCases,
      readinessMonitors: readinessMonitors ?? this.readinessMonitors,
      pendingDtcs: pendingDtcs ?? this.pendingDtcs,
      permanentDtcs: permanentDtcs ?? this.permanentDtcs,
      freezeFrames: freezeFrames ?? this.freezeFrames,
      monitoringTests: monitoringTests ?? this.monitoringTests,
      overallHealthScore: overallHealthScore ?? this.overallHealthScore,
      o2SensorTests: o2SensorTests ?? this.o2SensorTests,
      vehicleInfoExtended: vehicleInfoExtended ?? this.vehicleInfoExtended,
      supportedPids: supportedPids ?? this.supportedPids,
      scanHistory: scanHistory ?? this.scanHistory,
      clearResults: clearResults ?? this.clearResults,
      diagnosticNarrative: diagnosticNarrative ?? this.diagnosticNarrative,
      relatedKnowledge: relatedKnowledge ?? this.relatedKnowledge,
      knowledgeConfidence: knowledgeConfidence ?? this.knowledgeConfidence,
      currentRegion: currentRegion ?? this.currentRegion,
      complianceChecks: complianceChecks ?? this.complianceChecks,
      hasComplianceWarnings: hasComplianceWarnings ?? this.hasComplianceWarnings,
      activePanel: activePanel ?? this.activePanel,
      notifications: notifications ?? this.notifications,
      isClearing: isClearing ?? this.isClearing,
      technicianName: technicianName ?? this.technicianName,
      workshopName: workshopName ?? this.workshopName,
    );
  }
}

class VINValidation {
  final bool isValid;
  final List<String> errors;
  const VINValidation({required this.isValid, required this.errors});
}

/// Main diagnostic store notifier — all 38 actions
class DiagnosticNotifier extends StateNotifier<DiagnosticState> {
  DiagnosticNotifier() : super(const DiagnosticState());

  // Connection Actions
  void setDevice(OBDDevice? device) => state = state.copyWith(device: device);
  void setConnectionStatus(ConnectionStatus status) =>
      state = state.copyWith(connectionStatus: status);
  void setConnecting(bool connecting) =>
      state = state.copyWith(isConnecting: connecting);
  void setConnected(bool connected) =>
      state = state.copyWith(isConnected: connected);

  // Session Actions
  void setCurrentPhase(DiagnosticPhase phase) =>
      state = state.copyWith(currentPhase: phase);
  void startSession() => state = state.copyWith(
        sessionId: 'BYKI-${DateTime.now().millisecondsSinceEpoch}',
        sessionStartTime: DateTime.now(),
      );
  void endSession() =>
      state = state.copyWith(currentPhase: DiagnosticPhase.complete);

  // VIN Actions
  void setSelectedBrand(String? brand) =>
      state = state.copyWith(selectedBrand: brand);
  void setVIN(String? vin) => state = state.copyWith(vin: vin);
  void setVINData(VINData? data) => state = state.copyWith(vinData: data);
  void setVINValidation(VINValidation? validation) =>
      state = state.copyWith(vinValidation: validation);

  // Scan Actions
  void setScanning(bool scanning) =>
      state = state.copyWith(isScanning: scanning);
  void setScanProgress(double progress) =>
      state = state.copyWith(scanProgress: progress);
  void setCurrentECU(String? ecu) =>
      state = state.copyWith(currentECU: ecu);
  void setECUs(List<ECUInfo> ecus) => state = state.copyWith(ecus: ecus);
  void updateECU(ECUInfo ecu) {
    final updated = state.ecus.map((e) => e.type == ecu.type ? ecu : e).toList();
    state = state.copyWith(ecus: updated);
  }

  // DTC Actions
  void setDTCs(List<DiagnosticTroubleCode> dtcs) =>
      state = state.copyWith(dtcs: dtcs);
  void addDTC(DiagnosticTroubleCode dtc) =>
      state = state.copyWith(dtcs: [...state.dtcs, dtc]);
  void clearDTCs() => state = state.copyWith(dtcs: []);
  void setClearing(bool clearing) =>
      state = state.copyWith(isClearing: clearing);

  // Live Data Actions
  void setLiveData(List<LiveDataParameter> data) =>
      state = state.copyWith(liveData: data);
  void updateLiveDataParameter(LiveDataParameter param) {
    final updated =
        state.liveData.map((p) => p.pid == param.pid ? param : p).toList();
    state = state.copyWith(liveData: updated);
  }

  // Diagnostic Case Actions
  void setDiagnosticCases(List<DiagnosticCase> cases) =>
      state = state.copyWith(diagnosticCases: cases);
  void addDiagnosticCase(DiagnosticCase diagnosticCase) =>
      state = state.copyWith(
          diagnosticCases: [...state.diagnosticCases, diagnosticCase]);

  // OBD Mode Actions
  void setReadinessMonitors(ReadinessMonitors monitors) =>
      state = state.copyWith(readinessMonitors: monitors);
  void setPendingDtcs(List<DiagnosticTroubleCode> dtcs) =>
      state = state.copyWith(pendingDtcs: dtcs);
  void setPermanentDtcs(List<DiagnosticTroubleCode> dtcs) =>
      state = state.copyWith(permanentDtcs: dtcs);
  void setFreezeFrame(String dtcCode, FreezeFrameData data) =>
      state = state.copyWith(
          freezeFrames: {...state.freezeFrames, dtcCode: data});
  void setMonitoringTests(List<MonitoringTestResult> tests) =>
      state = state.copyWith(monitoringTests: tests);
  void setOverallHealthScore(double score) =>
      state = state.copyWith(overallHealthScore: score);
  void setO2SensorTests(List<O2SensorTestResult> tests) =>
      state = state.copyWith(o2SensorTests: tests);
  void setVehicleInfoExtended(VehicleInfoExtended info) =>
      state = state.copyWith(vehicleInfoExtended: info);
  void setSupportedPids(List<int> pids) =>
      state = state.copyWith(supportedPids: pids);
  void setScanHistory(List<VehicleScan> history) =>
      state = state.copyWith(scanHistory: history);
  void setClearResults(ClearResults results) =>
      state = state.copyWith(clearResults: results);
  void setDiagnosticNarrative(String narrative) =>
      state = state.copyWith(diagnosticNarrative: narrative);

  // Knowledge Actions
  void setRelatedKnowledge(List<DiagnosticKnowledge> knowledge) =>
      state = state.copyWith(relatedKnowledge: knowledge);
  void setKnowledgeConfidence(double confidence) =>
      state = state.copyWith(knowledgeConfidence: confidence);

  // Compliance Actions
  void setCurrentRegion(MarketRegion region) =>
      state = state.copyWith(currentRegion: region);
  void setComplianceChecks(List<ComplianceCheck> checks) =>
      state = state.copyWith(complianceChecks: checks);
  void setHasComplianceWarnings(bool hasWarnings) =>
      state = state.copyWith(hasComplianceWarnings: hasWarnings);

  // UI Actions
  void setActivePanel(String panel) =>
      state = state.copyWith(activePanel: panel);
  void addNotification(UINotification notification) =>
      state = state.copyWith(
          notifications: [...state.notifications, notification]);
  void removeNotification(String id) =>
      state = state.copyWith(
          notifications:
              state.notifications.where((n) => n.id != id).toList());
  void clearNotifications() =>
      state = state.copyWith(notifications: []);

  // Workshop Identity Actions
  void setTechnicianName(String name) =>
      state = state.copyWith(technicianName: name);
  void setWorkshopName(String name) =>
      state = state.copyWith(workshopName: name);

  // Reset
  void resetSession() => state = const DiagnosticState();
}

/// Global diagnostic store provider
final diagnosticProvider =
    StateNotifierProvider<DiagnosticNotifier, DiagnosticState>((ref) {
  return DiagnosticNotifier();
});

// ============ CONVENIENCE SELECTORS ============

/// Current phase
final currentPhaseProvider = Provider<DiagnosticPhase>((ref) {
  return ref.watch(diagnosticProvider).currentPhase;
});

/// Connection status
final isConnectedProvider = Provider<bool>((ref) {
  return ref.watch(diagnosticProvider).isConnected;
});

/// All confirmed DTCs
final confirmedDtcsProvider = Provider<List<DiagnosticTroubleCode>>((ref) {
  return ref.watch(diagnosticProvider).dtcs;
});

/// All pending DTCs
final pendingDtcsProvider = Provider<List<DiagnosticTroubleCode>>((ref) {
  return ref.watch(diagnosticProvider).pendingDtcs;
});

/// All permanent DTCs
final permanentDtcsProvider = Provider<List<DiagnosticTroubleCode>>((ref) {
  return ref.watch(diagnosticProvider).permanentDtcs;
});

/// Total DTC count
final totalDtcCountProvider = Provider<int>((ref) {
  final state = ref.watch(diagnosticProvider);
  return state.dtcs.length +
      state.pendingDtcs.length +
      state.permanentDtcs.length;
});

/// ECU list
final ecusProvider = Provider<List<ECUInfo>>((ref) {
  return ref.watch(diagnosticProvider).ecus;
});

/// Live data parameters
final liveDataProvider = Provider<List<LiveDataParameter>>((ref) {
  return ref.watch(diagnosticProvider).liveData;
});

/// Scanning status
final isScanningProvider = Provider<bool>((ref) {
  return ref.watch(diagnosticProvider).isScanning;
});

/// Scan progress
final scanProgressProvider = Provider<double>((ref) {
  return ref.watch(diagnosticProvider).scanProgress;
});

/// Health score
final healthScoreProvider = Provider<double?>((ref) {
  return ref.watch(diagnosticProvider).overallHealthScore;
});
