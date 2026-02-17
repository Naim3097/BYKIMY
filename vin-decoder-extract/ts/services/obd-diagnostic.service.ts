// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - OBD DIAGNOSTIC SERVICE
// Core diagnostic engine for vehicle ECU communication
// ============================================================

import { 
  ECUInfo, 
  ECUType, 
  ECUStatus,
  DiagnosticTroubleCode,
  DTCDefinition,
  DTCStatus,
  LiveDataParameter,
  OBDProtocol,
  TopologyScan,
  CommunicationQuality
} from '@/types';
import { bluetoothService } from './bluetooth.service';
import { getDTCByCode } from '@/data/dtc-service';

// Standard OBD-II PIDs
const STANDARD_PIDS: Record<string, { name: string; unit: string; formula: (bytes: number[]) => number; category: string }> = {
  '0C': { name: 'Engine RPM', unit: 'rpm', formula: (b) => ((b[0] * 256) + b[1]) / 4, category: 'ENGINE_CORE' },
  '0D': { name: 'Vehicle Speed', unit: 'km/h', formula: (b) => b[0], category: 'SPEED_LOAD' },
  '05': { name: 'Coolant Temperature', unit: '°C', formula: (b) => b[0] - 40, category: 'TEMPERATURE' },
  '0F': { name: 'Intake Air Temperature', unit: '°C', formula: (b) => b[0] - 40, category: 'TEMPERATURE' },
  '04': { name: 'Engine Load', unit: '%', formula: (b) => (b[0] * 100) / 255, category: 'ENGINE_CORE' },
  '11': { name: 'Throttle Position', unit: '%', formula: (b) => (b[0] * 100) / 255, category: 'ENGINE_CORE' },
  '0B': { name: 'Intake Manifold Pressure', unit: 'kPa', formula: (b) => b[0], category: 'ENGINE_CORE' },
  '10': { name: 'MAF Air Flow Rate', unit: 'g/s', formula: (b) => ((b[0] * 256) + b[1]) / 100, category: 'FUEL_SYSTEM' },
  '06': { name: 'Short Term Fuel Trim (Bank 1)', unit: '%', formula: (b) => ((b[0] - 128) * 100) / 128, category: 'FUEL_SYSTEM' },
  '07': { name: 'Long Term Fuel Trim (Bank 1)', unit: '%', formula: (b) => ((b[0] - 128) * 100) / 128, category: 'FUEL_SYSTEM' },
  '0E': { name: 'Timing Advance', unit: '°', formula: (b) => (b[0] / 2) - 64, category: 'IGNITION' },
  '14': { name: 'O2 Sensor 1 Voltage', unit: 'V', formula: (b) => b[0] / 200, category: 'OXYGEN_SENSORS' },
  '15': { name: 'O2 Sensor 2 Voltage', unit: 'V', formula: (b) => b[0] / 200, category: 'OXYGEN_SENSORS' },
  '1F': { name: 'Runtime Since Start', unit: 'sec', formula: (b) => (b[0] * 256) + b[1], category: 'ENGINE_CORE' },
  '21': { name: 'Distance with MIL On', unit: 'km', formula: (b) => (b[0] * 256) + b[1], category: 'EMISSION' },
  '2F': { name: 'Fuel Tank Level', unit: '%', formula: (b) => (b[0] * 100) / 255, category: 'FUEL_SYSTEM' },
  '33': { name: 'Barometric Pressure', unit: 'kPa', formula: (b) => b[0], category: 'ENGINE_CORE' },
  '42': { name: 'Control Module Voltage', unit: 'V', formula: (b) => ((b[0] * 256) + b[1]) / 1000, category: 'VOLTAGE' },
  '46': { name: 'Ambient Air Temperature', unit: '°C', formula: (b) => b[0] - 40, category: 'TEMPERATURE' },
  '5C': { name: 'Engine Oil Temperature', unit: '°C', formula: (b) => b[0] - 40, category: 'TEMPERATURE' },
};

// ECU Names and Descriptions
const ECU_INFO: Record<ECUType, { name: string; description: string }> = {
  'ECM': { name: 'Engine Control Module', description: 'Controls fuel injection, ignition timing, and emissions' },
  'TCM': { name: 'Transmission Control Module', description: 'Manages automatic transmission shifting and torque converter' },
  'ABS': { name: 'Anti-lock Braking System', description: 'Prevents wheel lockup during braking for stability' },
  'SRS': { name: 'Supplemental Restraint System', description: 'Controls airbags and seatbelt pretensioners' },
  'BCM': { name: 'Body Control Module', description: 'Manages lighting, locks, windows, and body electronics' },
  'EPS': { name: 'Electric Power Steering', description: 'Provides electronically-assisted steering' },
  'HVAC': { name: 'Climate Control Module', description: 'Controls heating, ventilation, and air conditioning' },
  'IPC': { name: 'Instrument Panel Cluster', description: 'Displays vehicle information and warning lights' },
  'TPMS': { name: 'Tire Pressure Monitoring', description: 'Monitors tire pressure and alerts driver' },
  'PDC': { name: 'Park Distance Control', description: 'Ultrasonic parking sensors' },
  'ACC': { name: 'Adaptive Cruise Control', description: 'Maintains speed and distance from vehicles ahead' },
  'LKA': { name: 'Lane Keep Assist', description: 'Helps keep vehicle centered in lane' },
  'ADAS': { name: 'Advanced Driver Assistance', description: 'Integrated safety and driver assist features' },
  'IMMO': { name: 'Immobilizer', description: 'Anti-theft system that prevents unauthorized starting' },
  'GW': { name: 'Gateway Module', description: 'Central communication hub between CAN networks' },
  'OTHER': { name: 'Other Module', description: 'Additional vehicle module' },
};

export class OBDDiagnosticService {
  private isConnected: boolean = false;
  private currentProtocol: OBDProtocol | null = null;

  // Get list of ECUs to scan based on vehicle profile
  getExpectedECUs(): ECUType[] {
    // Base ECUs for all vehicles
    return ['ECM', 'TCM', 'ABS', 'SRS', 'BCM', 'EPS', 'IMMO'];
  }

  // Create ECU info with defaults
  createECUInfo(type: ECUType): ECUInfo {
    const info = ECU_INFO[type];
    return {
      type,
      name: info.name,
      address: this.getECUAddress(type),
      status: 'NOT_SCANNED',
      protocol: null,
      firmwareVersion: null,
      hardwareVersion: null,
      partNumber: null,
      voltage: null,
      communicationQuality: 'NO_RESPONSE',
      dtcCount: { stored: 0, pending: 0, permanent: 0, history: 0 },
      lastResponse: null,
      scanDuration: 0,
    };
  }

  private getECUAddress(type: ECUType): string {
    const addresses: Record<ECUType, string> = {
      'ECM': '7E0',
      'TCM': '7E1',
      'ABS': '7B0',
      'SRS': '7B7',
      'BCM': '7C6',
      'EPS': '7A0',
      'HVAC': '7C4',
      'IPC': '720',
      'TPMS': '750',
      'PDC': '7A6',
      'ACC': '7B2',
      'LKA': '7B4',
      'ADAS': '7B5',
      'IMMO': '7A8',
      'GW': '7E5',
      'OTHER': '7FF',
    };
    return addresses[type] || '7FF';
  }

  // Perform topology scan
  async performTopologyScan(onProgress?: (ecu: ECUType, status: string) => void): Promise<ECUInfo[]> {
    const ecus: ECUInfo[] = [];
    const expectedECUs = this.getExpectedECUs();

    for (const ecuType of expectedECUs) {
      onProgress?.(ecuType, 'scanning');
      
      const ecuInfo = await this.scanECU(ecuType);
      ecus.push(ecuInfo);

      onProgress?.(ecuType, ecuInfo.status);
      
      // Small delay between ECU scans
      await this.delay(200);
    }

    return ecus;
  }

  // Scan individual ECU
  async scanECU(type: ECUType): Promise<ECUInfo> {
    const ecuInfo = this.createECUInfo(type);
    const startTime = Date.now();

    try {
      // Try to establish communication with ECU
      const response = await bluetoothService.sendCommand(`ATSH${this.getECUAddress(type)}`);
      
      if (response.includes('OK')) {
        // Try to read ECU info
        const infoResponse = await bluetoothService.sendCommand('0900'); // Request ECU information
        
        ecuInfo.status = 'ONLINE';
        ecuInfo.communicationQuality = 'GOOD';
        ecuInfo.lastResponse = new Date();
        ecuInfo.protocol = this.currentProtocol;
        
        // Read DTCs for this ECU
        const dtcs = await this.readECUDTCs(type);
        ecuInfo.dtcCount = {
          stored: dtcs.stored.length,
          pending: dtcs.pending.length,
          permanent: dtcs.permanent.length,
          history: 0,
        };
      } else {
        ecuInfo.status = 'OFFLINE';
        ecuInfo.communicationQuality = 'NO_RESPONSE';
      }
    } catch (error) {
      ecuInfo.status = 'OFFLINE';
      ecuInfo.communicationQuality = 'NO_RESPONSE';
    }

    ecuInfo.scanDuration = Date.now() - startTime;
    return ecuInfo;
  }

  // Read DTCs from specific ECU
  async readECUDTCs(ecuType: ECUType): Promise<{ stored: string[]; pending: string[]; permanent: string[] }> {
    try {
      // Set header for specific ECU
      await bluetoothService.sendCommand(`ATSH${this.getECUAddress(ecuType)}`);

      const stored = await bluetoothService.readDTCs('03');
      const pending = await bluetoothService.readDTCs('07');
      const permanent = await bluetoothService.readDTCs('0A');

      return { stored, pending, permanent };
    } catch {
      return { stored: [], pending: [], permanent: [] };
    }
  }

  // Get DTC definition — uses comprehensive 4565+ code database
  getDTCDefinition(code: string): DTCDefinition {
    const dbEntry = getDTCByCode(code);
    const severityMap: Record<string, number> = { critical: 9, warning: 6, info: 3 };
    
    if (dbEntry) {
      return {
        code,
        description: dbEntry.official_description,
        oemDescription: null,
        system: this.getDTCSystem(code),
        category: this.getDTCCategory(code),
        severity: (severityMap[dbEntry.severity] ?? 5) as any,
        driveImpact: dbEntry.severity === 'critical' ? 'HIGH' : dbEntry.severity === 'warning' ? 'MEDIUM' : 'LOW',
        safetyImpact: dbEntry.category === 'chassis' || dbEntry.category === 'body',
        emissionRelevant: dbEntry.category === 'powertrain',
        possibleCauses: dbEntry.common_causes || [],
        possibleSymptoms: [dbEntry.workshop_diagnosis, dbEntry.user_explanation].filter(Boolean),
        recommendedActions: [`Workshop diagnosis: ${dbEntry.workshop_diagnosis}`],
        relatedCodes: dbEntry.related_codes || [],
      };
    }

    return {
      code,
      description: 'Unknown fault code',
      oemDescription: null,
      system: this.getDTCSystem(code),
      category: this.getDTCCategory(code),
      severity: 5 as any,
      driveImpact: 'MEDIUM',
      safetyImpact: false,
      emissionRelevant: false,
      possibleCauses: this.getPossibleCauses(code),
      possibleSymptoms: this.getPossibleSymptoms(code),
      recommendedActions: this.getRecommendedActions(code),
      relatedCodes: this.getRelatedCodes(code),
    };
  }

  private getDTCSystem(code: string): ECUType {
    const prefix = code[0];
    const systemMap: Record<string, ECUType> = {
      'P': 'ECM',
      'C': 'ABS',
      'B': 'BCM',
      'U': 'GW',
    };
    return systemMap[prefix] || 'ECM';
  }

  private getDTCCategory(code: string): 'POWERTRAIN' | 'CHASSIS' | 'BODY' | 'NETWORK' | 'MANUFACTURER' {
    const prefix = code[0];
    const categoryMap: Record<string, 'POWERTRAIN' | 'CHASSIS' | 'BODY' | 'NETWORK'> = {
      'P': 'POWERTRAIN',
      'C': 'CHASSIS',
      'B': 'BODY',
      'U': 'NETWORK',
    };
    return categoryMap[prefix] || 'MANUFACTURER';
  }

  private getPossibleCauses(code: string): string[] {
    // Simplified - would be from database
    const causes: Record<string, string[]> = {
      'P0171': ['Vacuum leak', 'Dirty MAF sensor', 'Weak fuel pump', 'Clogged fuel filter', 'Faulty O2 sensor'],
      'P0300': ['Worn spark plugs', 'Faulty ignition coils', 'Vacuum leaks', 'Low fuel pressure', 'Clogged fuel injectors'],
      'P0420': ['Worn catalytic converter', 'Exhaust leak', 'Faulty O2 sensors', 'Engine running rich/lean'],
    };
    return causes[code] || ['Sensor failure', 'Wiring issue', 'Component malfunction'];
  }

  private getPossibleSymptoms(code: string): string[] {
    const symptoms: Record<string, string[]> = {
      'P0171': ['Rough idle', 'Hesitation on acceleration', 'Poor fuel economy', 'Check engine light'],
      'P0300': ['Engine vibration', 'Loss of power', 'Rough idle', 'Poor fuel economy'],
      'P0420': ['Reduced fuel economy', 'Rotten egg smell', 'Failed emissions test'],
    };
    return symptoms[code] || ['Check engine light', 'Performance issues'];
  }

  private getRecommendedActions(code: string): string[] {
    const actions: Record<string, string[]> = {
      'P0171': ['Check for vacuum leaks', 'Inspect MAF sensor', 'Check fuel pressure', 'Inspect O2 sensors'],
      'P0300': ['Inspect spark plugs', 'Check ignition coils', 'Perform compression test', 'Inspect fuel system'],
      'P0420': ['Check exhaust for leaks', 'Test O2 sensors', 'Monitor catalyst efficiency', 'Consider replacement if failed'],
    };
    return actions[code] || ['Read freeze frame data', 'Inspect related components', 'Clear code and retest'];
  }

  private getRelatedCodes(code: string): string[] {
    const related: Record<string, string[]> = {
      'P0171': ['P0172', 'P0174', 'P0175', 'P0101', 'P0130'],
      'P0300': ['P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306'],
      'P0420': ['P0421', 'P0430', 'P0431', 'P0432'],
    };
    return related[code] || [];
  }

  // Read live data parameters
  async readLiveData(pids: string[]): Promise<LiveDataParameter[]> {
    const parameters: LiveDataParameter[] = [];

    for (const pid of pids) {
      const pidInfo = STANDARD_PIDS[pid];
      if (!pidInfo) continue;

      try {
        const response = await bluetoothService.readPID('01', pid);
        const value = this.parsePIDResponse(response, pid);

        parameters.push({
          pid,
          name: pidInfo.name,
          value: value,
          unit: pidInfo.unit,
          normalRange: this.getNormalRange(pid),
          currentDeviation: this.calculateDeviation(value, pid),
          confidence: 1,
          category: pidInfo.category as any,
          description: pidInfo.name,
          lastUpdated: new Date(),
        });
      } catch {
        // Skip failed PIDs
      }
    }

    return parameters;
  }

  private parsePIDResponse(response: string, pid: string): number | null {
    const pidInfo = STANDARD_PIDS[pid];
    if (!pidInfo) return null;

    try {
      const bytes = response.split(' ')
        .filter(b => /^[0-9A-F]{2}$/i.test(b))
        .slice(2) // Skip mode and PID echo
        .map(b => parseInt(b, 16));

      if (bytes.length === 0) return null;

      return pidInfo.formula(bytes);
    } catch {
      return null;
    }
  }

  private getNormalRange(pid: string): { min: number; max: number } | null {
    const ranges: Record<string, { min: number; max: number }> = {
      '0C': { min: 600, max: 7000 },      // RPM
      '0D': { min: 0, max: 200 },          // Speed
      '05': { min: 70, max: 105 },         // Coolant temp
      '0F': { min: 10, max: 50 },          // IAT
      '04': { min: 0, max: 100 },          // Engine load
      '11': { min: 0, max: 100 },          // Throttle
      '06': { min: -10, max: 10 },         // STFT
      '07': { min: -10, max: 10 },         // LTFT
      '42': { min: 12, max: 14.7 },        // Control module voltage
    };
    return ranges[pid] || null;
  }

  private calculateDeviation(value: number | null, pid: string): number {
    if (value === null) return 0;
    const range = this.getNormalRange(pid);
    if (!range) return 0;

    const midpoint = (range.max + range.min) / 2;
    const deviation = ((value - midpoint) / midpoint) * 100;
    return Math.abs(deviation);
  }

  // Clear DTCs
  async clearDTCs(): Promise<boolean> {
    try {
      return await bluetoothService.clearDTCs();
    } catch {
      return false;
    }
  }

  // Get available PIDs
  getAvailablePIDs(): string[] {
    return Object.keys(STANDARD_PIDS);
  }

  // Get ECU description
  getECUDescription(type: ECUType): { name: string; description: string } {
    return ECU_INFO[type];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const obdDiagnosticService = new OBDDiagnosticService();
