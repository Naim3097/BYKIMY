// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - MOCK DATA SERVICE
// Provides realistic mock data for UI development
// ============================================================

import {
  VINDecoded,
  ECUInfo,
  ECUType,
  DiagnosticTroubleCode,
  LiveDataParameter,
  DiagnosticCase,
  TopologyScan,
  DiagnosticSession,
  DiagnosticReport,
} from '@/types';

// Sample decoded VIN data
export const MOCK_VIN_DATA: VINDecoded = {
  manufacturer: 'Proton Holdings',
  manufacturerCode: 'PM1',
  brand: 'Proton',
  model: 'Saga',
  modelYear: 2024,
  engineCode: '1.3L VVT',
  engineType: 'Inline-4 VVT',
  engineDisplacement: '1.3L',
  transmissionType: 'AUTOMATIC',
  driveType: 'FWD',
  bodyStyle: 'Sedan',
  fuelType: 'PETROL',
  emissionStandard: 'Euro 4',
  marketRegion: 'MY',
  plantCountry: 'Malaysia',
  plantCity: 'Tanjung Malim, Malaysia',
  serialNumber: '234567',
};

// Sample ECU data with realistic scenarios
export const MOCK_ECUS: ECUInfo[] = [
  {
    type: 'ECM',
    name: 'Engine Control Module',
    address: '7E0',
    status: 'ONLINE',
    protocol: 'CAN_11BIT_500K',
    firmwareVersion: 'ECM-2022-v3.4.1',
    hardwareVersion: 'HW2.0',
    partNumber: '89661-06K10',
    voltage: 12.4,
    communicationQuality: 'EXCELLENT',
    dtcCount: { stored: 2, pending: 1, permanent: 0, history: 3 },
    lastResponse: new Date(),
    scanDuration: 245,
  },
  {
    type: 'TCM',
    name: 'Transmission Control Module',
    address: '7E1',
    status: 'ONLINE',
    protocol: 'CAN_11BIT_500K',
    firmwareVersion: 'TCM-2022-v2.1.0',
    hardwareVersion: 'HW1.5',
    partNumber: '89530-06120',
    voltage: 12.3,
    communicationQuality: 'GOOD',
    dtcCount: { stored: 0, pending: 0, permanent: 0, history: 0 },
    lastResponse: new Date(),
    scanDuration: 189,
  },
  {
    type: 'ABS',
    name: 'Anti-lock Braking System',
    address: '7B0',
    status: 'ONLINE',
    protocol: 'CAN_11BIT_500K',
    firmwareVersion: 'ABS-v4.2.0',
    hardwareVersion: 'HW3.0',
    partNumber: '44540-06140',
    voltage: 12.4,
    communicationQuality: 'EXCELLENT',
    dtcCount: { stored: 1, pending: 0, permanent: 0, history: 1 },
    lastResponse: new Date(),
    scanDuration: 167,
  },
  {
    type: 'SRS',
    name: 'Supplemental Restraint System',
    address: '7B7',
    status: 'ONLINE',
    protocol: 'CAN_11BIT_500K',
    firmwareVersion: 'SRS-v2.8.0',
    hardwareVersion: 'HW2.1',
    partNumber: '89170-06820',
    voltage: 12.4,
    communicationQuality: 'EXCELLENT',
    dtcCount: { stored: 0, pending: 0, permanent: 0, history: 0 },
    lastResponse: new Date(),
    scanDuration: 156,
  },
  {
    type: 'BCM',
    name: 'Body Control Module',
    address: '7C6',
    status: 'ONLINE',
    protocol: 'CAN_11BIT_500K',
    firmwareVersion: 'BCM-v5.1.2',
    hardwareVersion: 'HW4.0',
    partNumber: '89221-06410',
    voltage: 12.3,
    communicationQuality: 'GOOD',
    dtcCount: { stored: 0, pending: 1, permanent: 0, history: 2 },
    lastResponse: new Date(),
    scanDuration: 201,
  },
  {
    type: 'EPS',
    name: 'Electric Power Steering',
    address: '7A0',
    status: 'ONLINE',
    protocol: 'CAN_11BIT_500K',
    firmwareVersion: 'EPS-v3.0.1',
    hardwareVersion: 'HW2.0',
    partNumber: '45250-06620',
    voltage: 12.4,
    communicationQuality: 'EXCELLENT',
    dtcCount: { stored: 0, pending: 0, permanent: 0, history: 0 },
    lastResponse: new Date(),
    scanDuration: 134,
  },
  {
    type: 'IMMO',
    name: 'Immobilizer',
    address: '7A8',
    status: 'ONLINE',
    protocol: 'CAN_11BIT_500K',
    firmwareVersion: 'IMMO-v1.4.0',
    hardwareVersion: 'HW1.0',
    partNumber: '89784-06010',
    voltage: 12.4,
    communicationQuality: 'GOOD',
    dtcCount: { stored: 0, pending: 0, permanent: 0, history: 0 },
    lastResponse: new Date(),
    scanDuration: 98,
  },
];

// Sample DTCs
export const MOCK_DTCS: DiagnosticTroubleCode[] = [
  {
    code: 'P0171',
    status: 'STORED',
    sourceECU: 'ECM',
    definition: {
      code: 'P0171',
      description: 'System Too Lean (Bank 1)',
      oemDescription: 'The A/F ratio feedback control is lean beyond the allowable limit.',
      system: 'ECM',
      category: 'POWERTRAIN',
      severity: 6,
      driveImpact: 'MEDIUM',
      safetyImpact: false,
      emissionRelevant: true,
      possibleCauses: [
        'Intake manifold air leak',
        'Mass Air Flow sensor dirty or faulty',
        'Fuel pressure too low',
        'Clogged fuel filter',
        'Faulty fuel injector(s)',
        'Exhaust leak before O2 sensor',
      ],
      possibleSymptoms: [
        'Rough idle',
        'Hesitation during acceleration',
        'Increased fuel consumption',
        'Engine surging',
        'Hard start when cold',
      ],
      recommendedActions: [
        'Check for vacuum leaks using smoke test',
        'Inspect and clean MAF sensor',
        'Test fuel pressure',
        'Inspect fuel injectors',
        'Check exhaust manifold for leaks',
      ],
      relatedCodes: ['P0172', 'P0174', 'P0175', 'P0101'],
    },
    freezeFrame: {
      timestamp: new Date(),
      engineRPM: 780,
      vehicleSpeed: 0,
      coolantTemp: 92,
      engineLoad: 23,
      fuelPressure: 38,
      intakeMAP: 32,
      intakeAirTemp: 31,
      throttlePosition: 12,
      oxygenSensorReadings: { 'B1S1': 0.45, 'B1S2': 0.62 },
      fuelTrimShort: 18.4,
      fuelTrimLong: 12.1,
    },
    firstDetected: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    occurrenceCount: 15,
    clearedHistory: [],
  },
  {
    code: 'P0300',
    status: 'PENDING',
    sourceECU: 'ECM',
    definition: {
      code: 'P0300',
      description: 'Random/Multiple Cylinder Misfire Detected',
      oemDescription: 'Misfire detected in multiple cylinders during the past 1000 engine revolutions.',
      system: 'ECM',
      category: 'POWERTRAIN',
      severity: 8,
      driveImpact: 'HIGH',
      safetyImpact: true,
      emissionRelevant: true,
      possibleCauses: [
        'Worn or fouled spark plugs',
        'Faulty ignition coil(s)',
        'Vacuum leak',
        'Low fuel pressure',
        'Clogged fuel injectors',
        'Low compression',
        'Camshaft position sensor issue',
      ],
      possibleSymptoms: [
        'Engine vibration',
        'Loss of power',
        'Rough or unstable idle',
        'Hesitation under load',
        'Increased emissions',
        'Catalytic converter damage risk',
      ],
      recommendedActions: [
        'Inspect and replace spark plugs',
        'Test ignition coils',
        'Check for vacuum leaks',
        'Perform compression test',
        'Test fuel pressure and injectors',
        'Check timing chain/belt condition',
      ],
      relatedCodes: ['P0301', 'P0302', 'P0303', 'P0304'],
    },
    freezeFrame: {
      timestamp: new Date(),
      engineRPM: 1200,
      vehicleSpeed: 35,
      coolantTemp: 88,
      engineLoad: 45,
      fuelPressure: 42,
      intakeMAP: 48,
      intakeAirTemp: 29,
      throttlePosition: 28,
      oxygenSensorReadings: { 'B1S1': 0.52, 'B1S2': 0.58 },
      fuelTrimShort: 8.2,
      fuelTrimLong: 6.4,
    },
    firstDetected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    occurrenceCount: 3,
    clearedHistory: [],
  },
  {
    code: 'C0035',
    status: 'STORED',
    sourceECU: 'ABS',
    definition: {
      code: 'C0035',
      description: 'Left Front Wheel Speed Sensor Circuit',
      oemDescription: 'Abnormal signal from the left front wheel speed sensor detected.',
      system: 'ABS',
      category: 'CHASSIS',
      severity: 7,
      driveImpact: 'HIGH',
      safetyImpact: true,
      emissionRelevant: false,
      possibleCauses: [
        'Damaged wheel speed sensor',
        'Corroded or damaged wiring',
        'Poor sensor connector contact',
        'Damaged tone ring',
        'Excessive sensor air gap',
        'Metallic debris on sensor',
      ],
      possibleSymptoms: [
        'ABS warning light illuminated',
        'Traction control disabled',
        'Stability control disabled',
        'Speedometer fluctuation',
        'Harsh ABS activation',
      ],
      recommendedActions: [
        'Inspect wheel speed sensor and wiring',
        'Check sensor air gap (0.5-1.5mm typical)',
        'Clean sensor and tone ring',
        'Test sensor resistance (1000-2000 ohms typical)',
        'Check for wheel bearing play',
      ],
      relatedCodes: ['C0040', 'C0045', 'C0050'],
    },
    freezeFrame: null,
    firstDetected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    occurrenceCount: 8,
    clearedHistory: [],
  },
];

// Sample Live Data
export const MOCK_LIVE_DATA: LiveDataParameter[] = [
  {
    pid: '0C',
    name: 'Engine RPM',
    value: 780,
    unit: 'rpm',
    normalRange: { min: 600, max: 7000 },
    currentDeviation: 2.5,
    confidence: 1,
    category: 'ENGINE_CORE',
    description: 'Current engine revolutions per minute',
    lastUpdated: new Date(),
  },
  {
    pid: '0D',
    name: 'Vehicle Speed',
    value: 0,
    unit: 'km/h',
    normalRange: { min: 0, max: 200 },
    currentDeviation: 0,
    confidence: 1,
    category: 'SPEED_LOAD',
    description: 'Current vehicle speed',
    lastUpdated: new Date(),
  },
  {
    pid: '05',
    name: 'Coolant Temperature',
    value: 92,
    unit: '°C',
    normalRange: { min: 70, max: 105 },
    currentDeviation: 5.1,
    confidence: 1,
    category: 'TEMPERATURE',
    description: 'Engine coolant temperature',
    lastUpdated: new Date(),
  },
  {
    pid: '04',
    name: 'Engine Load',
    value: 18.5,
    unit: '%',
    normalRange: { min: 0, max: 100 },
    currentDeviation: 0,
    confidence: 1,
    category: 'ENGINE_CORE',
    description: 'Calculated engine load percentage',
    lastUpdated: new Date(),
  },
  {
    pid: '11',
    name: 'Throttle Position',
    value: 12.3,
    unit: '%',
    normalRange: { min: 0, max: 100 },
    currentDeviation: 0,
    confidence: 1,
    category: 'ENGINE_CORE',
    description: 'Throttle valve position',
    lastUpdated: new Date(),
  },
  {
    pid: '06',
    name: 'Short Term Fuel Trim (Bank 1)',
    value: 15.2,
    unit: '%',
    normalRange: { min: -10, max: 10 },
    currentDeviation: 52,
    confidence: 1,
    category: 'FUEL_SYSTEM',
    description: 'Short-term fuel adjustment - HIGH indicates lean condition',
    lastUpdated: new Date(),
  },
  {
    pid: '07',
    name: 'Long Term Fuel Trim (Bank 1)',
    value: 11.8,
    unit: '%',
    normalRange: { min: -10, max: 10 },
    currentDeviation: 18,
    confidence: 1,
    category: 'FUEL_SYSTEM',
    description: 'Long-term fuel adjustment - HIGH indicates persistent lean condition',
    lastUpdated: new Date(),
  },
  {
    pid: '10',
    name: 'MAF Air Flow Rate',
    value: 2.85,
    unit: 'g/s',
    normalRange: { min: 1.5, max: 4.0 },
    currentDeviation: 3.6,
    confidence: 1,
    category: 'FUEL_SYSTEM',
    description: 'Mass air flow sensor reading',
    lastUpdated: new Date(),
  },
  {
    pid: '0B',
    name: 'Intake Manifold Pressure',
    value: 32,
    unit: 'kPa',
    normalRange: { min: 25, max: 80 },
    currentDeviation: 5.7,
    confidence: 1,
    category: 'ENGINE_CORE',
    description: 'Intake manifold absolute pressure',
    lastUpdated: new Date(),
  },
  {
    pid: '14',
    name: 'O2 Sensor 1 Voltage',
    value: 0.45,
    unit: 'V',
    normalRange: { min: 0.1, max: 0.9 },
    currentDeviation: 10,
    confidence: 1,
    category: 'OXYGEN_SENSORS',
    description: 'Bank 1 Sensor 1 voltage - switching expected',
    lastUpdated: new Date(),
  },
  {
    pid: '42',
    name: 'Control Module Voltage',
    value: 12.4,
    unit: 'V',
    normalRange: { min: 12, max: 14.7 },
    currentDeviation: 7.2,
    confidence: 1,
    category: 'VOLTAGE',
    description: 'Battery/charging system voltage',
    lastUpdated: new Date(),
  },
  {
    pid: '0F',
    name: 'Intake Air Temperature',
    value: 31,
    unit: '°C',
    normalRange: { min: 10, max: 50 },
    currentDeviation: 3.3,
    confidence: 1,
    category: 'TEMPERATURE',
    description: 'Air temperature entering the engine',
    lastUpdated: new Date(),
  },
];

// Sample Diagnostic Case
export const MOCK_DIAGNOSTIC_CASE: DiagnosticCase = {
  caseId: 'DX-ECM-001',
  symptoms: ['Rough idle', 'High fuel trim readings', 'Hesitation on acceleration'],
  affectedSystems: ['ECM'],
  relatedDTCs: ['P0171', 'P0300'],
  liveDataAnomalies: [
    {
      parameter: 'Short Term Fuel Trim',
      expectedRange: '-10% to +10%',
      actualValue: '+15.2%',
      deviationPercent: 52,
      significance: 'HIGH',
    },
    {
      parameter: 'Long Term Fuel Trim',
      expectedRange: '-10% to +10%',
      actualValue: '+11.8%',
      deviationPercent: 18,
      significance: 'MEDIUM',
    },
  ],
  confidence: 0.87,
  rootCause: {
    primaryCause: 'Intake Manifold Vacuum Leak',
    confidence: 0.87,
    explanation: 'The combination of high positive fuel trim values (both short and long term) with normal O2 sensor readings indicates unmetered air is entering the engine after the MAF sensor. The lean condition (P0171) and random misfires (P0300) are consistent with vacuum leak symptoms. The freeze frame data shows the issue is most pronounced at idle when manifold vacuum is highest.',
    secondaryCauses: [
      { cause: 'Dirty or faulty MAF sensor', probability: 0.65 },
      { cause: 'Failing fuel pressure regulator', probability: 0.35 },
      { cause: 'Partially clogged fuel injector(s)', probability: 0.25 },
    ],
    supportingEvidence: [
      'STFT +15.2% exceeds ±10% threshold',
      'LTFT +11.8% shows adaptive trim has compensated',
      'Combined trim (+27%) indicates significant lean condition',
      'P0300 misfire at idle supports vacuum leak diagnosis',
      'Freeze frame shows issue present at idle (780 RPM)',
    ],
    whatToTestNext: [
      'Perform smoke test for vacuum leaks',
      'Inspect intake manifold gasket',
      'Check PCV valve and hoses',
      'Inspect throttle body gasket',
      'Check brake booster vacuum hose',
    ],
    whatNOTToReplace: [
      'O2 sensors (readings appear normal)',
      'Fuel pump (pressure within spec)',
      'Catalytic converter (not the root cause)',
      'Ignition coils (symptom, not cause)',
    ],
  },
  recommendedActions: [
    {
      priority: 1,
      action: 'Perform intake smoke test to locate vacuum leak',
      type: 'PHYSICAL_CHECK',
      estimatedTime: '30 minutes',
      requiredTools: ['Smoke machine', 'Flashlight'],
      partNumbers: [],
      notes: 'Pay close attention to intake manifold gasket area and PCV connections',
    },
    {
      priority: 2,
      action: 'Inspect and clean MAF sensor',
      type: 'COMPONENT_TEST',
      estimatedTime: '15 minutes',
      requiredTools: ['MAF cleaner spray', 'Torx screwdriver'],
      partNumbers: ['MAF-CLN-001'],
      notes: 'Use only MAF-specific cleaner, do not touch sensing element',
    },
    {
      priority: 3,
      action: 'Replace intake manifold gasket if leak found',
      type: 'REPLACEMENT',
      estimatedTime: '2 hours',
      requiredTools: ['Socket set', 'Torque wrench', 'Gasket scraper'],
      partNumbers: ['17171-28020'],
      notes: 'Follow proper torque sequence for manifold bolts',
    },
  ],
  status: 'INVESTIGATING',
  createdAt: new Date(),
  resolvedAt: null,
};

// Mock service for simulating real-time data updates
export class MockDataService {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  // Subscribe to live data updates
  subscribeLiveData(callback: (data: LiveDataParameter[]) => void): () => void {
    if (!this.listeners.has('liveData')) {
      this.listeners.set('liveData', new Set());
    }
    this.listeners.get('liveData')!.add(callback);

    return () => {
      this.listeners.get('liveData')?.delete(callback);
    };
  }

  // Simulate live data updates
  startLiveDataSimulation(): () => void {
    const interval = setInterval(() => {
      const updatedData = MOCK_LIVE_DATA.map(param => ({
        ...param,
        value: this.simulateValueChange(param),
        lastUpdated: new Date(),
      }));

      this.listeners.get('liveData')?.forEach(cb => cb(updatedData));
    }, 500);

    return () => clearInterval(interval);
  }

  private simulateValueChange(param: LiveDataParameter): number | string | boolean | null {
    if (typeof param.value !== 'number') return param.value;

    const variance = param.normalRange 
      ? (param.normalRange.max - param.normalRange.min) * 0.02
      : param.value * 0.02;

    return param.value + (Math.random() - 0.5) * variance;
  }

  // Simulate ECU scan
  async simulateTopologyScan(
    onProgress: (ecu: ECUType, progress: number) => void
  ): Promise<ECUInfo[]> {
    const ecus: ECUInfo[] = [];
    
    for (let i = 0; i < MOCK_ECUS.length; i++) {
      const ecu = MOCK_ECUS[i];
      onProgress(ecu.type, ((i + 1) / MOCK_ECUS.length) * 100);
      
      await this.delay(300 + Math.random() * 200);
      ecus.push({ ...ecu, lastResponse: new Date() });
    }

    return ecus;
  }

  // Simulate DTC reading
  async simulateDTCRead(): Promise<DiagnosticTroubleCode[]> {
    await this.delay(500);
    return MOCK_DTCS;
  }

  // Simulate DTC clearing
  async simulateDTCClear(): Promise<{ success: boolean; returnedCodes: string[] }> {
    await this.delay(1000);
    
    // Simulate that one code returns immediately (hard fault)
    return {
      success: true,
      returnedCodes: ['C0035'], // ABS code returns - it's a hard fault
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockDataService = new MockDataService();
