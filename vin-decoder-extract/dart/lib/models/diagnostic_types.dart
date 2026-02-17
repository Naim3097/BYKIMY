// ============================================================
// BYKI WORKSHOP DIAGNOSTIC — DART TYPE DEFINITIONS
// Complete type system for automotive diagnostics
// ============================================================

// ============ ENUMS ============

enum OBDProtocol {
  can11bit500k,
  can29bit500k,
  can11bit250k,
  can29bit250k,
  iso15765_4,
  iso15765_11bit,
  iso14230_4Kwp,
  iso14230,
  iso9141_2,
  saeJ1850Pwm,
  saeJ1850Vpw,
}

enum ECUType {
  engine,
  transmission,
  abs,
  airbag,
  body,
  steering,
  hvac,
  instrument,
  tpms,
  parkAssist,
  gateway,
  headlamp,
  immobilizer,
  adas,
  acc,
  lka,
  unknown,
  other,
}

enum ECUStatus { online, offline, degraded, notScanned }

enum CommunicationQuality { excellent, good, fair, poor, noResponse }

enum DTCStatus { confirmed, pending, permanent, history }

enum DTCCategory { emission, powertrain, chassis, body, network, manufacturer }

enum DriveImpact { info, minor, warning, moderate, significant, high, critical, none, low, medium }

enum TransmissionType { automatic, manual, cvt, dct, unknown }

enum DriveType { fwd, rwd, awd, fourWd, unknown }

enum FuelType { petrol, diesel, hybrid, electric, pluginHybrid, unknown }

enum MarketRegion { jp, eu, us, my, asean, cn, other, sg, th, id, ph, vn, aseanOther, au, global }

enum CaseStatus { open, investigating, resolved, monitoring }

enum Significance { minor, low, medium, major, high, critical }

enum ActionType {
  diagnose,
  test,
  inspect,
  repair,
  replace,
  maintenance,
  clear,
  monitor,
  physicalCheck,
  componentTest,
  replacement,
  softwareUpdate,
  calibration,
  clearAndVerify,
}

enum ScanStatus {
  initializing,
  vinDetection,
  topologyDiscovery,
  ecuScanning,
  dtcReading,
  liveDataCapture,
  analysis,
  complete,
  error,
  cancelled,
}

enum SessionStatus { active, paused, completed, aborted }

enum DiagnosticPhase {
  connection,
  brandSelect,
  vinDetection,
  vehicleProfile,
  topologyScan,
  systemDiagnosis,
  liveData,
  rootCauseAnalysis,
  actionRecommendation,
  dtcClearing,
  validation,
  reportGeneration,
  complete,
}

enum LiveDataCategory {
  engine,
  fuelSystem,
  airIntake,
  temperature,
  speed,
  fuel,
  electrical,
  environmental,
  o2Sensors,
  exhaust,
  turbo,
  transmission,
  ignition,
  emission,
  speedLoad,
  oxygenSensors,
  evapSystem,
  catalyst,
  voltage,
  brakes,
  steering,
  bodyElectrical,
}

enum KnowledgeCategory { dtcPattern, symptomCorrelation, fixOutcome, componentFailure }

enum KnowledgeSource { workshop, workshopData, oem, community, aiInferred }

enum OEMFeature {
  dtcRead,
  dtcClear,
  liveData,
  freezeFrame,
  actuatorTest,
  calibration,
  coding,
  programming,
  keyLearning,
  immobilizer,
}

enum OEMSupportLevel { full, partial, readOnly, notSupported }

enum RestrictionType { blocked, warning, licensedOnly, oemToolOnly }

enum TopologyIssueType { missingEcu, degradedEcu, canBusError, powerIssue, gatewayError }

enum DeviceType { ble, bluetooth, classic, usb, wifi }

enum IgnitionState { off, acc, on, start, unknown }

enum NotificationType { info, success, warning, error }

enum ComponentHealthStatus { good, warning, critical }

enum MonitorStatus { complete, notReady, notAvailable }

// ============ VEHICLE IDENTIFICATION ============

class VINData {
  final String vin;
  final bool isValid;
  final bool checkDigitValid;
  final VINDecoded? decoded;

  const VINData({
    String? raw,
    String? vin,
    required this.isValid,
    this.checkDigitValid = false,
    this.decoded,
  }) : vin = vin ?? raw ?? '';

  String get fullVin => vin;
}

class VINDecoded {
  final String manufacturer;
  final String brand;
  final String model;
  final int modelYear;
  final String? engineCode;
  final String? engineType;
  final String? engineDisplacement;
  final TransmissionType? transmissionType;
  final DriveType driveType;
  final String? bodyStyle;
  final FuelType fuelType;
  final String? emissionStandard;
  final MarketRegion marketRegion;
  final String? plantCountry;
  final String? plantCity;
  final String? serialNumber;
  final String? manufacturerCode;
  final String? wmi;
  final String? vds;
  final String? vis;
  final String? country;
  final String? assemblyPlant;

  const VINDecoded({
    required this.manufacturer,
    this.manufacturerCode,
    required this.brand,
    required this.model,
    required this.modelYear,
    this.engineCode,
    this.engineType,
    this.engineDisplacement,
    this.transmissionType,
    this.driveType = DriveType.unknown,
    this.bodyStyle,
    this.fuelType = FuelType.unknown,
    this.emissionStandard,
    this.marketRegion = MarketRegion.other,
    this.plantCountry,
    this.plantCity,
    this.serialNumber,
    this.wmi,
    this.vds,
    this.vis,
    this.country,
    this.assemblyPlant,
  });

  int get year => modelYear;
  String? get engine => engineType ?? engineCode;
  String? get transmission => transmissionType?.name;
  String? get bodyType => bodyStyle;
  String? get obd2Protocol => null;
}

class VehicleProfile {
  final String id;
  final String vin;
  final VINDecoded vinData;
  final List<OBDProtocol> supportedProtocols;
  final List<ECUType> expectedECUs;
  final List<String> availablePIDs;
  final Map<String, DTCDefinition> dtcDefinitions;
  final DateTime createdAt;
  final DateTime lastScanned;

  const VehicleProfile({
    required this.id,
    required this.vin,
    required this.vinData,
    required this.supportedProtocols,
    required this.expectedECUs,
    required this.availablePIDs,
    required this.dtcDefinitions,
    required this.createdAt,
    required this.lastScanned,
  });
}

// ============ ECU INFO ============

class DTCCount {
  final int confirmed;
  final int pending;
  final int permanent;

  const DTCCount({
    this.confirmed = 0,
    this.pending = 0,
    this.permanent = 0,
  });

  int get total => confirmed + pending + permanent;
  int get stored => confirmed;
}

class ECUInfo {
  final String? id;
  final ECUType type;
  final String name;
  final String address;
  final String? responseAddress;
  final ECUStatus status;
  final OBDProtocol? protocol;
  final String? firmwareVersion;
  final String? hardwareVersion;
  final String? partNumber;
  final double? voltage;
  final int? responseTimeMs;
  final CommunicationQuality communicationQuality;
  final List<int>? supportedPids;
  final DTCCount dtcCount;
  final DateTime? lastSeen;
  final DateTime? lastResponse;
  final int? scanDuration;

  const ECUInfo({
    this.id,
    required this.type,
    required this.name,
    required this.address,
    this.responseAddress,
    required this.status,
    this.protocol,
    this.firmwareVersion,
    this.hardwareVersion,
    this.partNumber,
    this.voltage,
    this.responseTimeMs,
    this.communicationQuality = CommunicationQuality.good,
    this.supportedPids,
    this.dtcCount = const DTCCount(),
    this.lastSeen,
    this.lastResponse,
    this.scanDuration,
  });

  int? get responseTime => responseTimeMs ?? scanDuration;
  int get pendingDtcCount => dtcCount.pending;

  ECUInfo copyWith({
    String? id,
    ECUType? type,
    String? name,
    String? address,
    String? responseAddress,
    ECUStatus? status,
    OBDProtocol? protocol,
    String? firmwareVersion,
    String? hardwareVersion,
    String? partNumber,
    double? voltage,
    int? responseTimeMs,
    CommunicationQuality? communicationQuality,
    List<int>? supportedPids,
    DTCCount? dtcCount,
    DateTime? lastSeen,
    DateTime? lastResponse,
    int? scanDuration,
  }) {
    return ECUInfo(
      id: id ?? this.id,
      type: type ?? this.type,
      name: name ?? this.name,
      address: address ?? this.address,
      responseAddress: responseAddress ?? this.responseAddress,
      status: status ?? this.status,
      protocol: protocol ?? this.protocol,
      firmwareVersion: firmwareVersion ?? this.firmwareVersion,
      hardwareVersion: hardwareVersion ?? this.hardwareVersion,
      partNumber: partNumber ?? this.partNumber,
      voltage: voltage ?? this.voltage,
      responseTimeMs: responseTimeMs ?? this.responseTimeMs,
      communicationQuality: communicationQuality ?? this.communicationQuality,
      supportedPids: supportedPids ?? this.supportedPids,
      dtcCount: dtcCount ?? this.dtcCount,
      lastSeen: lastSeen ?? this.lastSeen,
      lastResponse: lastResponse ?? this.lastResponse,
      scanDuration: scanDuration ?? this.scanDuration,
    );
  }
}

// ============ DIAGNOSTIC TROUBLE CODES ============

class DTCDefinition {
  final String? code;
  final String? officialDescription;
  final String? userDescription;
  final String? oemDescription;
  final ECUType? system;
  final DTCCategory? category;
  final int? severity;
  final DriveImpact? driveImpact;
  final bool? safetyImpact;
  final bool? emissionRelevant;
  final List<String> possibleCauses;
  final List<String> symptoms;
  final List<String>? possibleSymptoms;
  final List<String>? recommendedActions;
  final List<String>? relatedCodes;
  final List<String>? affectedSystems;
  final ({double min, double max, String currency})? estimatedRepairCost;
  final double? laborHours;

  const DTCDefinition({
    this.code,
    this.officialDescription,
    this.userDescription,
    this.oemDescription,
    this.system,
    this.category,
    this.severity,
    this.driveImpact,
    this.safetyImpact,
    this.emissionRelevant,
    this.possibleCauses = const [],
    this.symptoms = const [],
    this.possibleSymptoms,
    this.recommendedActions,
    this.relatedCodes,
    this.affectedSystems,
    this.estimatedRepairCost,
    this.laborHours,
  });

  String get description => officialDescription ?? userDescription ?? '';
}

class DiagnosticTroubleCode {
  final String code;
  final DTCStatus status;
  final DTCCategory? category;
  final String? description;
  final DriveImpact? severity;
  final String? sourceECU;
  final DTCDefinition? definition;
  final FreezeFrameData? freezeFrame;
  final DateTime? firstSeen;
  final int occurrenceCount;
  final List<ClearAttempt>? clearedHistory;

  const DiagnosticTroubleCode({
    required this.code,
    required this.status,
    this.category,
    this.description,
    this.severity,
    this.sourceECU,
    this.definition,
    this.freezeFrame,
    this.firstSeen,
    this.occurrenceCount = 1,
    this.clearedHistory,
  });

  String? get ecuSource => sourceECU;
  DriveImpact? get driveImpact => severity ?? definition?.driveImpact;
  DateTime? get firstDetected => firstSeen;
}

class FreezeFrameData {
  final DateTime? timestamp;
  final double? rpm;
  final double? speed;
  final double? coolantTemp;
  final double? engineLoad;
  final double? fuelTrim;
  final double? fuelTrim1;
  final double? fuelTrim2;
  final double? intakeMAP;
  final double? intakeTemp;
  final double? mapPressure;
  final double? throttlePos;
  final double? voltage;
  final String? dtcCode;
  final double? engineRPM;
  final double? vehicleSpeed;
  final double? fuelPressure;
  final double? intakeAirTemp;
  final double? throttlePosition;
  final Map<String, double> oxygenSensorReadings;
  final double? fuelTrimShort;
  final double? fuelTrimLong;
  final double? load;

  const FreezeFrameData({
    this.timestamp,
    this.rpm,
    this.speed,
    this.coolantTemp,
    this.engineLoad,
    this.fuelTrim,
    this.fuelTrim1,
    this.fuelTrim2,
    this.intakeMAP,
    this.intakeTemp,
    this.mapPressure,
    this.throttlePos,
    this.voltage,
    this.dtcCode,
    this.engineRPM,
    this.vehicleSpeed,
    this.fuelPressure,
    this.intakeAirTemp,
    this.throttlePosition,
    this.oxygenSensorReadings = const {},
    this.fuelTrimShort,
    this.fuelTrimLong,
    this.load,
  });
}

class ClearAttempt {
  final DateTime timestamp;
  final bool success;
  final int? returnedAfterMs;
  final bool markedAsHardFault;

  const ClearAttempt({
    required this.timestamp,
    required this.success,
    this.returnedAfterMs,
    required this.markedAsHardFault,
  });
}

// ============ LIVE DATA ============

class LiveDataParameter {
  final String? id;
  final String pid;
  final String name;
  final dynamic value;
  final String unit;
  final NormalRange? normalRange;
  final double? normalMin;
  final double? normalMax;
  final double? currentDeviation;
  final double? confidence;
  final LiveDataCategory? category;
  final String? description;
  final DateTime? lastUpdated;
  final DateTime? timestamp;

  const LiveDataParameter({
    this.id,
    required this.pid,
    required this.name,
    this.value,
    required this.unit,
    this.normalRange,
    this.normalMin,
    this.normalMax,
    this.currentDeviation,
    this.confidence,
    this.category,
    this.description,
    this.lastUpdated,
    this.timestamp,
  });

  LiveDataParameter copyWith({
    String? id,
    String? pid,
    String? name,
    dynamic value,
    String? unit,
    NormalRange? normalRange,
    double? normalMin,
    double? normalMax,
    double? currentDeviation,
    double? confidence,
    LiveDataCategory? category,
    String? description,
    DateTime? lastUpdated,
    DateTime? timestamp,
  }) {
    return LiveDataParameter(
      id: id ?? this.id,
      pid: pid ?? this.pid,
      name: name ?? this.name,
      value: value ?? this.value,
      unit: unit ?? this.unit,
      normalRange: normalRange ?? this.normalRange,
      normalMin: normalMin ?? this.normalMin,
      normalMax: normalMax ?? this.normalMax,
      currentDeviation: currentDeviation ?? this.currentDeviation,
      confidence: confidence ?? this.confidence,
      category: category ?? this.category,
      description: description ?? this.description,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}

class NormalRange {
  final double min;
  final double max;

  const NormalRange({required this.min, required this.max});
}

class LiveDataSnapshot {
  final DateTime timestamp;
  final List<LiveDataParameter> parameters;
  final String vinHash;
  final String sessionId;

  const LiveDataSnapshot({
    required this.timestamp,
    required this.parameters,
    required this.vinHash,
    required this.sessionId,
  });
}

// ============ DIAGNOSTIC INTELLIGENCE ============

class DiagnosticCase {
  final String? id;
  final String? caseId;
  final String? dtcCode;
  final String? title;
  final String? description;
  final List<String>? symptoms;
  final List<ECUType>? affectedSystems;
  final List<String>? relatedDTCs;
  final List<LiveDataAnomaly>? liveDataAnomalies;
  final double? confidence;
  final RootCauseAnalysis? rootCause;
  final List<ActionRecommendation>? recommendedActions;
  final List<ActionRecommendation>? recommendations;
  final CaseStatus? status;
  final DateTime? createdAt;
  final DateTime? resolvedAt;

  const DiagnosticCase({
    this.id,
    this.caseId,
    this.dtcCode,
    this.title,
    this.description,
    this.symptoms,
    this.affectedSystems,
    this.relatedDTCs,
    this.liveDataAnomalies,
    this.confidence,
    this.rootCause,
    this.recommendedActions,
    this.recommendations,
    this.status,
    this.createdAt,
    this.resolvedAt,
  });
}

class LiveDataAnomaly {
  final String parameter;
  final String expectedRange;
  final String actualValue;
  final double deviationPercent;
  final Significance significance;

  const LiveDataAnomaly({
    required this.parameter,
    required this.expectedRange,
    required this.actualValue,
    required this.deviationPercent,
    required this.significance,
  });
}

class RootCauseAnalysis {
  final String primaryCause;
  final double confidence;
  final String? explanation;
  final List<SecondaryCause>? secondaryCauses;
  final List<String>? supportingEvidence;
  final List<String>? whatToTestNext;
  final List<String>? whatNOTToReplace;
  final List<ActionRecommendation>? recommendations;

  const RootCauseAnalysis({
    required this.primaryCause,
    required this.confidence,
    this.explanation,
    this.secondaryCauses,
    this.supportingEvidence,
    this.whatToTestNext,
    this.whatNOTToReplace,
    this.recommendations,
  });
}

class SecondaryCause {
  final String cause;
  final double? probability;
  final double? likelihood;

  const SecondaryCause({
    required this.cause,
    this.probability,
    this.likelihood,
  });
}

class ActionRecommendation {
  final int? priority;
  final String action;
  final ActionType? type;
  final String? estimatedTime;
  final ({double min, double max, String currency})? estimatedCost;
  final Significance? significance;
  final List<String>? requiredTools;
  final List<String>? partNumbers;
  final String? notes;

  const ActionRecommendation({
    this.priority,
    required this.action,
    this.type,
    this.estimatedTime,
    this.estimatedCost,
    this.significance,
    this.requiredTools,
    this.partNumbers,
    this.notes,
  });
}

// ============ TOPOLOGY & SYSTEM SCAN ============

class TopologyScan {
  final String id;
  final VehicleProfile vehicleProfile;
  final DateTime startTime;
  final DateTime? endTime;
  final ScanStatus status;
  final List<ECUInfo> ecus;
  final int totalDTCs;
  final int criticalIssues;
  final List<TopologyIssue> topologyIssues;

  const TopologyScan({
    required this.id,
    required this.vehicleProfile,
    required this.startTime,
    this.endTime,
    required this.status,
    required this.ecus,
    required this.totalDTCs,
    required this.criticalIssues,
    required this.topologyIssues,
  });
}

class TopologyIssue {
  final TopologyIssueType type;
  final List<ECUType> affectedECUs;
  final String description;
  final int severity;
  final List<String> possibleCauses;

  const TopologyIssue({
    required this.type,
    required this.affectedECUs,
    required this.description,
    required this.severity,
    required this.possibleCauses,
  });
}

// ============ DIAGNOSTIC SESSION ============

class DiagnosticSession {
  final String id;
  final String vehicleVIN;
  final VehicleProfile vehicleProfile;
  final DateTime startTime;
  final DateTime? endTime;
  final SessionStatus status;
  final DiagnosticPhase currentPhase;
  final TopologyScan? topologyScan;
  final List<DiagnosticTroubleCode> dtcs;
  final List<LiveDataSnapshot> liveDataSnapshots;
  final List<DiagnosticCase> diagnosticCases;
  final List<ClearingSession> clearingAttempts;
  final DiagnosticReport? report;

  const DiagnosticSession({
    required this.id,
    required this.vehicleVIN,
    required this.vehicleProfile,
    required this.startTime,
    this.endTime,
    required this.status,
    required this.currentPhase,
    this.topologyScan,
    required this.dtcs,
    required this.liveDataSnapshots,
    required this.diagnosticCases,
    required this.clearingAttempts,
    this.report,
  });
}

// ============ OBD MODE TYPES ============

class ReadinessMonitors {
  final MonitorStatus? misfire;
  final MonitorStatus? fuelSystem;
  final MonitorStatus? components;
  final MonitorStatus? catalyst;
  final MonitorStatus? heatedCatalyst;
  final MonitorStatus? oxygenSensor;
  final MonitorStatus? oxygenSensorHeater;
  final MonitorStatus? evapSystem;
  final MonitorStatus? evaporativeSystem;
  final MonitorStatus? secondaryAir;
  final MonitorStatus? acRefrigerant;
  final MonitorStatus? exhaustGasSensor;
  final MonitorStatus? egr;

  const ReadinessMonitors({
    this.misfire,
    this.fuelSystem,
    this.components,
    this.catalyst,
    this.heatedCatalyst,
    this.oxygenSensor,
    this.oxygenSensorHeater,
    this.evapSystem,
    this.evaporativeSystem,
    this.secondaryAir,
    this.acRefrigerant,
    this.exhaustGasSensor,
    this.egr,
  });

  List<ReadinessMonitor> toList() {
    final items = <ReadinessMonitor>[];
    void add(String name, MonitorStatus? status) {
      if (status != null) {
        items.add(ReadinessMonitor(
          name: name,
          available: status != MonitorStatus.notAvailable,
          complete: status == MonitorStatus.complete,
        ));
      }
    }
    add('Misfire', misfire);
    add('Fuel System', fuelSystem);
    add('Components', components);
    add('Catalyst', catalyst);
    add('Heated Catalyst', heatedCatalyst);
    add('Oxygen Sensor', oxygenSensor);
    add('O2 Sensor Heater', oxygenSensorHeater);
    add('Evap System', evapSystem ?? evaporativeSystem);
    add('Secondary Air', secondaryAir);
    add('A/C Refrigerant', acRefrigerant);
    add('Exhaust Gas Sensor', exhaustGasSensor);
    add('EGR', egr);
    return items;
  }
}

class ReadinessMonitor {
  final String name;
  final bool available;
  final bool complete;

  const ReadinessMonitor({
    required this.name,
    required this.available,
    required this.complete,
  });

  bool get supported => available;
}

class MonitoringTestResult {
  final int testId;
  final String component;
  final double value;
  final double minLimit;
  final double maxLimit;
  final bool passed;
  final double healthPct;

  const MonitoringTestResult({
    required this.testId,
    required this.component,
    required this.value,
    required this.minLimit,
    required this.maxLimit,
    required this.passed,
    required this.healthPct,
  });
}

class O2SensorTestResult {
  final String sensor;
  final double richToLeanThreshold;
  final double leanToRichThreshold;
  final double lowVoltage;
  final double highVoltage;
  final double responseTime;

  const O2SensorTestResult({
    required this.sensor,
    required this.richToLeanThreshold,
    required this.leanToRichThreshold,
    required this.lowVoltage,
    required this.highVoltage,
    required this.responseTime,
  });
}

class VehicleInfoExtended {
  final String vin;
  final List<String> calibrationIds;
  final List<String> calibrationVerification;
  final String ecuName;

  const VehicleInfoExtended({
    required this.vin,
    required this.calibrationIds,
    required this.calibrationVerification,
    required this.ecuName,
  });
}

class VehicleScan {
  final String id;
  final String vin;
  final String scannedAt;
  final String? brand;
  final String? model;
  final int? year;
  final List<String>? confirmedDtcs;
  final List<String>? pendingDtcs;
  final List<String>? permanentDtcs;
  final double? healthScore;
  final double? overallHealthScore;
  final int? totalDtcCount;
  final List<MonitoringTestResult>? monitoringTests;

  const VehicleScan({
    required this.id,
    required this.vin,
    required this.scannedAt,
    this.brand,
    this.model,
    this.year,
    this.confirmedDtcs,
    this.pendingDtcs,
    this.permanentDtcs,
    this.healthScore,
    this.overallHealthScore,
    this.totalDtcCount,
    this.monitoringTests,
  });
}

class ClearResults {
  final dynamic cleared;
  final dynamic returned;
  final dynamic permanent;
  final dynamic hardFaults;
  final ReadinessMonitors? preReadiness;
  final ReadinessMonitors? postReadiness;

  const ClearResults({
    this.cleared,
    this.returned,
    this.permanent,
    this.hardFaults,
    this.preReadiness,
    this.postReadiness,
  });
}

class ComponentHealthScore {
  final String component;
  final double healthPct;
  final ComponentHealthStatus status;

  const ComponentHealthScore({
    required this.component,
    required this.healthPct,
    required this.status,
  });
}

// ============ KNOWLEDGE GRAPH ============

class DiagnosticKnowledge {
  final String id;
  final KnowledgeCategory category;
  final String? vehicleMake;
  final String? vehicleModel;
  final YearRange? yearRange;
  final MarketRegion? region;
  final double confidenceScore;
  final int occurrenceCount;
  final double successRate;
  final DateTime lastUpdated;
  final KnowledgeSource source;
  final dynamic data;
  final DTCPatternKnowledge? dtcPattern;
  final SymptomCorrelationKnowledge? symptomCorrelation;
  final FixOutcomeKnowledge? fixOutcome;
  final ComponentFailureKnowledge? componentFailure;

  const DiagnosticKnowledge({
    required this.id,
    required this.category,
    this.vehicleMake,
    this.vehicleModel,
    this.yearRange,
    this.region,
    required this.confidenceScore,
    required this.occurrenceCount,
    required this.successRate,
    required this.lastUpdated,
    required this.source,
    this.data,
    this.dtcPattern,
    this.symptomCorrelation,
    this.fixOutcome,
    this.componentFailure,
  });
}

class YearRange {
  final int start;
  final int end;
  const YearRange({required this.start, required this.end});
}

class DTCPatternKnowledge {
  final String? primaryDTC;
  final String? dtcCode;
  final List<String>? associatedDTCs;
  final List<LiveDataSignature>? liveDataSignature;
  final List<SecondaryCause>? commonCauses;
  final String? commonCause;
  final List<String>? fixSteps;
  final List<String>? falsePositiveIndicators;
  final double? avgRepairCostMYR;
  final double? avgLaborHours;
  final double? recurrenceRate;

  const DTCPatternKnowledge({
    this.primaryDTC,
    this.dtcCode,
    this.associatedDTCs,
    this.liveDataSignature,
    this.commonCauses,
    this.commonCause,
    this.fixSteps,
    this.falsePositiveIndicators,
    this.avgRepairCostMYR,
    this.avgLaborHours,
    this.recurrenceRate,
  });
}

class LiveDataSignature {
  final String pid;
  final NormalRange range;

  const LiveDataSignature({required this.pid, required this.range});
}

class SymptomCorrelationKnowledge {
  final String symptom;
  final List<DTCCorrelation> correlatedDTCs;
  final List<PIDDeviation> correlatedLiveData;
  final List<SecondaryCause> rootCauses;

  const SymptomCorrelationKnowledge({
    required this.symptom,
    required this.correlatedDTCs,
    required this.correlatedLiveData,
    required this.rootCauses,
  });
}

class DTCCorrelation {
  final String dtc;
  final double correlation;
  const DTCCorrelation({required this.dtc, required this.correlation});
}

class PIDDeviation {
  final String pid;
  final String deviation;
  const PIDDeviation({required this.pid, required this.deviation});
}

class FixOutcomeKnowledge {
  final String? dtcCode;
  final String? fixApplied;
  final String? attemptedFix;
  final double successRate;
  final int? sampleSize;
  final int? avgTimeToReturn;
  final double? avgCostMYR;
  final List<String>? conditions;
  final List<String>? notRecommendedIf;
  final String? notes;

  const FixOutcomeKnowledge({
    this.dtcCode,
    this.fixApplied,
    this.attemptedFix,
    required this.successRate,
    this.sampleSize,
    this.avgTimeToReturn,
    this.avgCostMYR,
    this.conditions,
    this.notRecommendedIf,
    this.notes,
  });
}

class ComponentFailureKnowledge {
  final String component;
  final List<String>? commonFailureModes;
  final int? avgMileageAtFailure;
  final int? avgFailureMileage;
  final double? avgRepairCostMYR;
  final List<String>? warningSignsDTCs;
  final List<WarningSignLiveData>? warningSignsLiveData;
  final List<String>? preventiveMeasures;

  const ComponentFailureKnowledge({
    required this.component,
    this.commonFailureModes,
    this.avgMileageAtFailure,
    this.avgFailureMileage,
    this.avgRepairCostMYR,
    this.warningSignsDTCs,
    this.warningSignsLiveData,
    this.preventiveMeasures,
  });
}

class WarningSignLiveData {
  final String pid;
  final String? threshold;
  final String? condition;
  const WarningSignLiveData({required this.pid, this.threshold, this.condition});
}

// ============ LEGAL & COMPLIANCE ============

class LegalRestriction {
  final MarketRegion region;
  final RestrictionType restrictionType;
  final String description;
  final String? regulation;
  final DateTime? effectiveDate;

  const LegalRestriction({
    required this.region,
    required this.restrictionType,
    required this.description,
    this.regulation,
    this.effectiveDate,
  });
}

class OEMBoundary {
  final String make;
  final String? model;
  final YearRange? yearRange;
  final MarketRegion region;
  final List<OEMFeatureSupport> supportedFeatures;
  final List<OEMRestriction> restrictions;
  final String notes;

  const OEMBoundary({
    required this.make,
    this.model,
    this.yearRange,
    required this.region,
    required this.supportedFeatures,
    required this.restrictions,
    required this.notes,
  });
}

class OEMFeatureSupport {
  final OEMFeature feature;
  final OEMSupportLevel support;
  final String? notes;

  const OEMFeatureSupport({
    required this.feature,
    required this.support,
    this.notes,
  });
}

class OEMRestriction {
  final OEMFeature feature;
  final String reason;
  final String? alternative;
  final String? legalReference;

  const OEMRestriction({
    required this.feature,
    required this.reason,
    this.alternative,
    this.legalReference,
  });
}

class ComplianceCheck {
  final OEMFeature feature;
  final VehicleComplianceInfo vehicle;
  final MarketRegion region;
  final bool isAllowed;
  final List<LegalRestriction> restrictions;
  final List<String> warnings;
  final bool requiresConsent;
  final String? consentText;

  const ComplianceCheck({
    required this.feature,
    required this.vehicle,
    required this.region,
    required this.isAllowed,
    required this.restrictions,
    required this.warnings,
    required this.requiresConsent,
    this.consentText,
  });
}

class VehicleComplianceInfo {
  final String make;
  final String model;
  final int year;

  const VehicleComplianceInfo({
    required this.make,
    required this.model,
    required this.year,
  });
}

// ============ DTC CLEARING ============

class ClearingSession {
  final String id;
  final DateTime timestamp;
  final List<ECUType> targetECUs;
  final ClearingPreconditions preconditionsMet;
  final List<ClearingResult> results;
  final TopologyScan? validationScan;

  const ClearingSession({
    required this.id,
    required this.timestamp,
    required this.targetECUs,
    required this.preconditionsMet,
    required this.results,
    this.validationScan,
  });
}

class ClearingPreconditions {
  final bool batteryVoltageOK;
  final double batteryVoltage;
  final bool ignitionStateCorrect;
  final bool engineOff;
  final bool criticalFaultsResolved;
  final List<String> pendingCriticalFaults;

  const ClearingPreconditions({
    required this.batteryVoltageOK,
    required this.batteryVoltage,
    required this.ignitionStateCorrect,
    required this.engineOff,
    required this.criticalFaultsResolved,
    required this.pendingCriticalFaults,
  });
}

class ClearingResult {
  final ECUType ecu;
  final bool success;
  final List<String> clearedCodes;
  final List<String> returnedImmediately;
  final List<String> hardFaults;
  final String? errorMessage;

  const ClearingResult({
    required this.ecu,
    required this.success,
    required this.clearedCodes,
    required this.returnedImmediately,
    required this.hardFaults,
    this.errorMessage,
  });
}

// ============ DIAGNOSTIC REPORT ============

class DiagnosticReport {
  final String id;
  final String sessionId;
  final DateTime generatedAt;
  final VINDecoded vehicleInfo;
  final List<ECUInfo> systemsScanned;
  final FaultSummary faultSummary;
  final List<RootCauseAnalysis> rootCauseAnalysis;
  final List<ActionRecommendation> repairRecommendations;
  final PostClearStatus? postClearStatus;
  final String technicianNotes;
  final String customerSummary;

  const DiagnosticReport({
    required this.id,
    required this.sessionId,
    required this.generatedAt,
    required this.vehicleInfo,
    required this.systemsScanned,
    required this.faultSummary,
    required this.rootCauseAnalysis,
    required this.repairRecommendations,
    this.postClearStatus,
    required this.technicianNotes,
    required this.customerSummary,
  });
}

class FaultSummary {
  final int totalFaults;
  final int criticalFaults;
  final int safetyRelated;
  final int emissionRelated;
  final Map<ECUType, List<DiagnosticTroubleCode>> faultsBySystem;
  final int clearedFaults;
  final int remainingFaults;

  const FaultSummary({
    required this.totalFaults,
    required this.criticalFaults,
    required this.safetyRelated,
    required this.emissionRelated,
    required this.faultsBySystem,
    required this.clearedFaults,
    required this.remainingFaults,
  });
}

class PostClearStatus {
  final DateTime scanTime;
  final bool allClear;
  final List<DiagnosticTroubleCode> returnedFaults;
  final List<String> hardFaults;
  final bool liveDataNormalized;

  const PostClearStatus({
    required this.scanTime,
    required this.allClear,
    required this.returnedFaults,
    required this.hardFaults,
    required this.liveDataNormalized,
  });
}

// ============ BLUETOOTH/OBD DEVICE ============

class OBDDevice {
  final String id;
  final String name;
  final DeviceType type;
  final String? address;
  final bool? connected;
  final int? batteryLevel;
  final String? firmwareVersion;
  final DateTime? lastSeen;
  final int? signalStrength;

  const OBDDevice({
    required this.id,
    required this.name,
    required this.type,
    this.address,
    this.connected,
    this.batteryLevel,
    this.firmwareVersion,
    this.lastSeen,
    this.signalStrength,
  });
}

class ConnectionStatus {
  final OBDDevice? device;
  final bool vehicleConnected;
  final bool? connected;
  final IgnitionState? ignitionState;
  final double? batteryVoltage;
  final double? voltage;
  final OBDProtocol? protocol;

  const ConnectionStatus({
    this.device,
    this.vehicleConnected = false,
    this.connected,
    this.ignitionState,
    this.batteryVoltage,
    this.voltage,
    this.protocol,
  });
}

// ============ UI STATE ============

class UINotification {
  final String id;
  final NotificationType type;
  final String title;
  final String message;
  final DateTime? timestamp;
  final bool persistent;

  const UINotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.timestamp,
    this.persistent = false,
  });
}
