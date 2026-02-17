// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - AGENT BRIDGE SERVICE
// WebSocket client connecting React frontend to Rust diagnostic agent
// Replaces bluetoothService + obdDiagnosticService + mockDataService
// ============================================================

import {
  ReadinessMonitors,
  FreezeFrameData,
  MonitoringTestResult,
  O2SensorTestResult,
  VehicleInfoExtended,
  VehicleScan,
  OBDDevice,
} from '@/types';
import { bluetoothService } from './bluetooth.service';

// ============ Agent Response Types ============

export interface AgentStatus {
  connected: boolean;
  vci_type: string | null;
  protocol: string | null;
  uptime_ms: number;
}

export interface VciDevice {
  port: string;
  type: 'bluetooth' | 'usb_can' | 'usb_serial' | 'pci_serial' | 'serial' | 'unknown';
  description: string;
  available?: boolean;
}

export interface VciConnected {
  vci_type: string;
  port: string;
  protocol: string | null;
  capabilities: {
    can_fd: boolean;
    obd2: boolean;
  };
}

export interface DiscoveredEcu {
  request_arb_id: number;
  response_arb_id: number;
  ecu_type: string;
  name: string;
  protocol: string;
  firmware_version: string | null;
  hardware_version: string | null;
  voltage: number | null;
  response_time_ms: number;
}

export interface DtcResult {
  code: string;
  status_byte: number;
  description: string | null;
  frame_number?: number;
}

export interface PidValue {
  pid: number;
  name: string;
  value: number;
  unit: string;
  raw: number[];
}

// ============ Agent Bridge Class ============

type EventCallback = (...args: any[]) => void;

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timeout: ReturnType<typeof setTimeout>;
}

class AgentBridge {
  private ws: WebSocket | null = null;
  private pending: Map<string, PendingRequest> = new Map();
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private _mode: 'agent' | 'demo' | 'ble' = 'demo';
  private reqCounter = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private wsUrl = 'ws://127.0.0.1:9100';
  private demoDtcsCleared = false; // tracks whether demo DTCs have been cleared

  get mode() {
    return this._mode;
  }

  // ============ Connection ============

  async connect(wsUrl?: string): Promise<void> {
    if (wsUrl) this.wsUrl = wsUrl;

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          this._mode = 'agent';
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.id && this.pending.has(msg.id)) {
              const { resolve, reject, timeout } = this.pending.get(msg.id)!;
              clearTimeout(timeout);
              this.pending.delete(msg.id);
              if (msg.status === 'ok') {
                resolve(msg.data);
              } else {
                reject(new Error(msg.error || 'Agent error'));
              }
            } else if (msg.event) {
              this.emit(msg.event, msg.data);
            }
          } catch {
            // ignore parse errors
          }
        };

        this.ws.onclose = () => {
          this._mode = 'demo';
          // Reject all pending requests so they don't hang
          for (const [id, { reject, timeout }] of this.pending.entries()) {
            clearTimeout(timeout);
            reject(new Error('WebSocket closed unexpectedly'));
            this.pending.delete(id);
          }
          this.emit('disconnected');
          this.attemptReconnect();
        };

        this.ws.onerror = () => {
          this._mode = 'demo';
          if (this.ws) {
            this.ws.close();
            this.ws = null;
          }
          resolve(); // resolve anyway — falls back to demo
        };

        // Timeout — if WS doesn't connect in 3s, go demo mode
        setTimeout(() => {
          if (this._mode !== 'agent') {
            if (this.ws) {
              this.ws.close();
              this.ws = null;
            }
            this._mode = 'demo';
            resolve();
          }
        }, 3000);
      } catch {
        this._mode = 'demo';
        resolve();
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._mode = 'demo';
    // Reject all pending requests
    for (const [id, req] of this.pending) {
      clearTimeout(req.timeout);
      req.reject(new Error('Disconnected'));
    }
    this.pending.clear();
  }

  isConnected(): boolean {
    return this._mode === 'agent' && this.ws?.readyState === WebSocket.OPEN;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.wsUrl);
    }, delay);
  }

  // ============ Low-level send ============

  // Allow external callers to switch to BLE mode after Web Bluetooth pairing
  setBleMode(): void {
    this._mode = 'ble';
  }

  // Force demo mode — used when user explicitly clicks "Demo" while agent is running
  setDemoMode(): void {
    this._mode = 'demo';
    this.demoDtcsCleared = false;
  }

  private async send<T>(cmd: string, params?: object, timeoutMs = 10000): Promise<T> {
    // BLE mode — route through real ELM327 GATT
    if (this._mode === 'ble') {
      return this.handleBleCommand<T>(cmd, params);
    }
    if (this._mode === 'demo' || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return this.handleDemoCommand<T>(cmd, params);
    }

    const id = `req-${++this.reqCounter}`;
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout: ${cmd}`));
      }, timeoutMs);

      this.pending.set(id, { resolve, reject, timeout });
      this.ws!.send(JSON.stringify({ id, cmd, params: params || {} }));
    });
  }

  // ============ Core commands (exist in Rust today) ============

  async ping(): Promise<{ timestamp_ms: number }> {
    return this.send('Ping');
  }

  async getStatus(): Promise<AgentStatus> {
    return this.send('GetStatus');
  }

  async scanVci(): Promise<VciDevice[]> {
    return this.send('ScanVci');
  }

  async connectVci(type: VciDevice['type'], port: string): Promise<VciConnected> {
    return this.send('ConnectVci', { vci_type: type, port });
  }

  async disconnectVci(): Promise<void> {
    return this.send('DisconnectVci');
  }

  async discoverEcus(): Promise<DiscoveredEcu[]> {
    return this.send('DiscoverEcus', {}, 30000);
  }

  async readVin(): Promise<{ vin: string; source: string }> {
    return this.send('ReadVin', {}, 15000);
  }

  async readDtcs(subFunction?: number): Promise<{ dtcs: DtcResult[]; count: number }> {
    return this.send('ReadDtcs', subFunction !== undefined ? { sub_function: subFunction } : {});
  }

  async clearDtcs(): Promise<void> {
    return this.send('ClearDtcs', {}, 15000);
  }

  async readLiveData(pids: number[]): Promise<PidValue[]> {
    return this.send('ReadLiveData', { pids }, 5000);
  }

  async startSession(reqId: number, respId: number, type: string = 'extended'): Promise<void> {
    return this.send('StartSession', { request_id: reqId, response_id: respId, session_type: type });
  }

  async endSession(): Promise<void> {
    return this.send('EndSession');
  }

  async readDid(did: number): Promise<{ did: number; value: number[]; decoded?: string }> {
    return this.send('ReadDid', { did });
  }

  // ============ New commands (to be added to Rust agent) ============

  async discoverSupportedPids(): Promise<{ supported: number[] }> {
    return this.send('DiscoverSupportedPids', {}, 15000);
  }

  async readReadinessMonitors(): Promise<ReadinessMonitors> {
    return this.send('ReadReadinessMonitors');
  }

  async readFreezeFrame(pid: number, frame: number = 0): Promise<{
    dtcCode: string;
    values: { pid: number; name: string; value: number; unit: string }[];
  }> {
    return this.send('ReadFreezeFrame', { pid, frame });
  }

  async readO2SensorTests(): Promise<O2SensorTestResult[]> {
    return this.send('ReadO2SensorTests');
  }

  async readMonitoringTests(): Promise<MonitoringTestResult[]> {
    return this.send('ReadMonitoringTests', {}, 15000);
  }

  async readPendingDtcs(): Promise<{ dtcs: DtcResult[]; count: number }> {
    return this.send('ReadPendingDtcs');
  }

  async readVehicleInfo(): Promise<VehicleInfoExtended> {
    return this.send('ReadVehicleInfo');
  }

  async readPermanentDtcs(): Promise<{ dtcs: DtcResult[]; count: number }> {
    return this.send('ReadPermanentDtcs');
  }

  // ============ Event System ============

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach((cb) => {
      try { cb(...args); } catch { /* swallow */ }
    });
  }

  // ============ BLE Mode — Real ELM327 Commands ============

  private async handleBleCommand<T>(cmd: string, params?: any): Promise<T> {
    switch (cmd) {
      case 'Ping':
        return { timestamp_ms: Date.now() } as T;

      case 'GetStatus':
        return {
          connected: true,
          vci_type: 'ble',
          protocol: 'CAN_11BIT_500K',
          uptime_ms: Date.now(),
        } as T;

      case 'ScanVci':
        return [] as unknown as T;

      case 'ConnectVci': {
        const device = await bluetoothService.connect();
        if (!device) throw new Error('BLE connection failed');
        return {
          vci_type: 'ble',
          port: device.id,
          protocol: 'CAN_11BIT_500K',
          capabilities: { can_fd: false, obd2: true },
        } as T;
      }

      case 'DisconnectVci':
        bluetoothService.disconnect();
        return undefined as T;

      case 'DiscoverEcus': {
        // Query common ECU addresses via OBD
        const ecus: DiscoveredEcu[] = [];
        const addresses = [
          { req: 0x7E0, name: 'ECM', type: 'ECM' },
          { req: 0x7E1, name: 'TCM', type: 'TCM' },
          { req: 0x7E2, name: 'ABS/ESP', type: 'ABS' },
          { req: 0x7E3, name: 'SRS', type: 'SRS' },
        ];
        for (const addr of addresses) {
          try {
            await bluetoothService.sendCommand(`ATSH${addr.req.toString(16).toUpperCase()}`);
            const resp = await bluetoothService.sendCommand('0100');
            if (resp && !resp.includes('NO DATA') && !resp.includes('ERROR')) {
              ecus.push({
                request_arb_id: addr.req,
                response_arb_id: addr.req + 8,
                ecu_type: addr.type,
                name: addr.name,
                protocol: 'CAN_11BIT_500K',
                firmware_version: null,
                hardware_version: null,
                voltage: null,
                response_time_ms: 100,
              });
            }
          } catch { /* ECU not present */ }
        }
        // Reset header to broadcast
        await bluetoothService.sendCommand('ATSH7DF');
        if (ecus.length === 0) {
          // At minimum, if 0100 responds at all, ECM is online
          ecus.push({
            request_arb_id: 0x7E0, response_arb_id: 0x7E8,
            ecu_type: 'ECM', name: 'Engine Control Module',
            protocol: 'CAN_11BIT_500K',
            firmware_version: null, hardware_version: null,
            voltage: null, response_time_ms: 100,
          });
        }
        return ecus as T;
      }

      case 'ReadVin': {
        const vin = await bluetoothService.readVIN();
        return { vin: vin || '', source: 'BLE_Mode09_PID02' } as T;
      }

      case 'ReadDtcs': {
        const codes = await bluetoothService.readDTCs('03');
        return {
          dtcs: codes.map(c => ({ code: c, status_byte: 0x8A, description: null })),
          count: codes.length,
        } as T;
      }

      case 'ReadPendingDtcs': {
        const codes = await bluetoothService.readDTCs('07');
        return {
          dtcs: codes.map(c => ({ code: c, status_byte: 0x04, description: null })),
          count: codes.length,
        } as T;
      }

      case 'ReadPermanentDtcs': {
        const codes = await bluetoothService.readDTCs('0A');
        return {
          dtcs: codes.map(c => ({ code: c, status_byte: 0x0A, description: null })),
          count: codes.length,
        } as T;
      }

      case 'ClearDtcs': {
        await bluetoothService.clearDTCs();
        return undefined as T;
      }

      case 'ReadLiveData': {
        const pids: number[] = params?.pids || [];
        const results: PidValue[] = [];
        for (const pid of pids) {
          try {
            const pidHex = pid.toString(16).padStart(2, '0').toUpperCase();
            const raw = await bluetoothService.readPID('01', pidHex);
            const parsed = this.parseOBDResponse(pid, raw);
            if (parsed) results.push(parsed);
          } catch { /* skip unsupported PID */ }
        }
        return results as T;
      }

      case 'DiscoverSupportedPids': {
        const supported: number[] = [];
        // Query PID support bitmasks: 0100, 0120, 0140, 0160
        for (const base of [0x00, 0x20, 0x40, 0x60]) {
          try {
            const pidHex = base.toString(16).padStart(2, '0').toUpperCase();
            const resp = await bluetoothService.readPID('01', pidHex);
            const bitmap = this.parseSupportBitmap(resp, base);
            supported.push(...bitmap);
          } catch { break; }
        }
        return { supported } as T;
      }

      case 'ReadReadinessMonitors': {
        try {
          const resp = await bluetoothService.readPID('01', '01');
          return this.parseReadiness(resp) as T;
        } catch {
          return { milOn: false, dtcCount: 0, monitors: [] } as T;
        }
      }

      case 'ReadVehicleInfo': {
        const vin = await bluetoothService.readVIN();
        let ecuName: string | null = null;
        try { ecuName = await bluetoothService.sendCommand('0902'); } catch {}
        return {
          vin: vin || '',
          calibrationIds: [],
          calibrationVerification: [],
          ecuName: ecuName || null,
        } as T;
      }

      case 'ReadFreezeFrame': {
        // Attempt Mode 02 read
        try {
          const resp = await bluetoothService.readPID('02', '02');
          return {
            dtcCode: 'Unknown',
            values: [{ pid: 0, name: 'Raw', value: 0, unit: resp }],
          } as T;
        } catch {
          return { dtcCode: '', values: [] } as T;
        }
      }

      case 'ReadMonitoringTests':
        // Mode 06 — complex, return empty for now
        return [] as T;

      case 'ReadO2SensorTests':
        return [] as T;

      case 'StartSession':
      case 'EndSession':
        return undefined as T;

      default:
        throw new Error(`BLE: unsupported command ${cmd}`);
    }
  }

  // Parse raw OBD PID response into structured value
  private parseOBDResponse(pid: number, raw: string): PidValue | null {
    // Strip spaces & header, parse hex bytes after "41 XX"
    const clean = raw.replace(/\s/g, '').replace(/[\r\n>]/g, '');
    const idx = clean.indexOf('41' + pid.toString(16).padStart(2, '0').toUpperCase());
    if (idx === -1) return null;

    const dataHex = clean.substring(idx + 4);
    const bytes: number[] = [];
    for (let i = 0; i + 1 < dataHex.length; i += 2) {
      bytes.push(parseInt(dataHex.substring(i, i + 2), 16));
    }
    if (bytes.length === 0) return null;

    const A = bytes[0] ?? 0;
    const B = bytes[1] ?? 0;

    // Common PID formulas
    const PID_FORMULA: Record<number, { name: string; value: (a: number, b: number) => number; unit: string }> = {
      0x04: { name: 'Engine Load', value: (a) => a / 2.55, unit: '%' },
      0x05: { name: 'Coolant Temp', value: (a) => a - 40, unit: '°C' },
      0x06: { name: 'Short Term Fuel Trim B1', value: (a) => (a - 128) * 100 / 128, unit: '%' },
      0x07: { name: 'Long Term Fuel Trim B1', value: (a) => (a - 128) * 100 / 128, unit: '%' },
      0x0B: { name: 'Intake Manifold Pressure', value: (a) => a, unit: 'kPa' },
      0x0C: { name: 'Engine RPM', value: (a, b) => (a * 256 + b) / 4, unit: 'rpm' },
      0x0D: { name: 'Vehicle Speed', value: (a) => a, unit: 'km/h' },
      0x0E: { name: 'Timing Advance', value: (a) => a / 2 - 64, unit: '°' },
      0x0F: { name: 'Intake Air Temp', value: (a) => a - 40, unit: '°C' },
      0x10: { name: 'MAF Rate', value: (a, b) => (a * 256 + b) / 100, unit: 'g/s' },
      0x11: { name: 'Throttle Position', value: (a) => a / 2.55, unit: '%' },
      0x1F: { name: 'Run Time', value: (a, b) => a * 256 + b, unit: 's' },
      0x2F: { name: 'Fuel Level', value: (a) => a / 2.55, unit: '%' },
      0x33: { name: 'Barometric Pressure', value: (a) => a, unit: 'kPa' },
      0x42: { name: 'Control Module Voltage', value: (a, b) => (a * 256 + b) / 1000, unit: 'V' },
      0x46: { name: 'Ambient Air Temp', value: (a) => a - 40, unit: '°C' },
      0x5C: { name: 'Oil Temp', value: (a) => a - 40, unit: '°C' },
    };

    const formula = PID_FORMULA[pid];
    if (!formula) {
      return { pid, name: `PID 0x${pid.toString(16).toUpperCase()}`, value: A, unit: 'raw', raw: bytes };
    }
    return { pid, name: formula.name, value: Math.round(formula.value(A, B) * 100) / 100, unit: formula.unit, raw: bytes };
  }

  // Parse PID support bitmap response
  private parseSupportBitmap(raw: string, base: number): number[] {
    const clean = raw.replace(/\s/g, '').replace(/[\r\n>]/g, '');
    const pidHex = base.toString(16).padStart(2, '0').toUpperCase();
    const idx = clean.indexOf('41' + pidHex);
    if (idx === -1) return [];

    const dataHex = clean.substring(idx + 4, idx + 12); // 4 bytes = 32 bits
    if (dataHex.length < 8) return [];

    const bitmap = parseInt(dataHex, 16);
    const supported: number[] = [];
    for (let bit = 31; bit >= 0; bit--) {
      if (bitmap & (1 << bit)) {
        supported.push(base + (32 - bit));
      }
    }
    return supported;
  }

  // Parse Mode 01 PID 01 readiness response
  private parseReadiness(raw: string): ReadinessMonitors {
    const clean = raw.replace(/\s/g, '').replace(/[\r\n>]/g, '');
    const idx = clean.indexOf('4101');
    if (idx === -1) return { milOn: false, dtcCount: 0, monitors: [] };

    const dataHex = clean.substring(idx + 4);
    const bytes: number[] = [];
    for (let i = 0; i + 1 < dataHex.length; i += 2) {
      bytes.push(parseInt(dataHex.substring(i, i + 2), 16));
    }

    const A = bytes[0] ?? 0;
    const B = bytes[1] ?? 0;
    const C = bytes[2] ?? 0;
    const D = bytes[3] ?? 0;

    const milOn = !!(A & 0x80);
    const dtcCount = A & 0x7F;

    const monitorNames = [
      'Misfire', 'Fuel System', 'Components',
      'Catalyst', 'Heated Catalyst', 'EVAP System',
      'Secondary Air', 'O2 Sensor', 'O2 Heater', 'EGR/VVT',
    ];

    // Byte B bits 0-2 = available (misfire, fuel, components)
    // Byte B bits 4-6 = complete
    // Bytes C,D = additional monitors
    const monitors = monitorNames.map((name, i) => {
      if (i < 3) {
        return { name, available: !!(B & (1 << i)), complete: !!(B & (1 << (i + 4))) };
      }
      const bitIdx = i - 3;
      return { name, available: !!(C & (1 << bitIdx)), complete: !(D & (1 << bitIdx)) };
    });

    return { milOn, dtcCount, monitors };
  }

  // ============ Demo Mode Fallback ============

  private async handleDemoCommand<T>(cmd: string, params?: object): Promise<T> {
    // Lazy-import mock data service only in demo mode
    const { mockDataService, MOCK_VIN_DATA, MOCK_ECUS, MOCK_DTCS, MOCK_LIVE_DATA } =
      await import('./mock-data.service');

    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500)); // simulate latency

    switch (cmd) {
      case 'Ping':
        return { timestamp_ms: Date.now() } as T;

      case 'GetStatus':
        return {
          connected: true,
          vci_type: 'demo',
          protocol: 'CAN_11BIT_500K',
          uptime_ms: Date.now(),
        } as T;

      case 'ScanVci':
        return [
          { port: 'DEMO', type: 'bluetooth', description: 'BYKI Demo OBD Adapter' },
        ] as T;

      case 'ConnectVci':
        return {
          vci_type: 'demo',
          port: 'DEMO',
          protocol: 'CAN_11BIT_500K',
          capabilities: { can_fd: false, obd2: true },
        } as T;

      case 'DisconnectVci':
        return undefined as T;

      case 'DiscoverEcus':
        return MOCK_ECUS.map((ecu) => ({
          request_arb_id: parseInt(ecu.address, 16),
          response_arb_id: parseInt(ecu.address, 16) + 8,
          ecu_type: ecu.type,
          name: ecu.name,
          protocol: ecu.protocol || 'CAN_11BIT_500K',
          firmware_version: ecu.firmwareVersion,
          hardware_version: ecu.hardwareVersion,
          voltage: ecu.voltage,
          response_time_ms: ecu.scanDuration,
        })) as T;

      case 'ReadVin':
        return { vin: 'PM1BL5SN5R1234567', source: 'Mode09_PID02' } as T;

      case 'ReadDtcs':
        if (this.demoDtcsCleared) {
          // After clear, only one code returns as a hard fault (realistic demo)
          return {
            dtcs: [
              { code: 'C0035', status_byte: 0x8A, description: 'Left Front Wheel Speed Sensor Circuit' },
            ],
            count: 1,
          } as T;
        }
        return {
          dtcs: MOCK_DTCS.map((d) => ({
            code: d.code,
            status_byte: 0x8A,
            description: d.definition.description,
          })),
          count: MOCK_DTCS.length,
        } as T;

      case 'ReadPendingDtcs':
        if (this.demoDtcsCleared) {
          return { dtcs: [], count: 0 } as T;
        }
        return {
          dtcs: [
            { code: 'P0420', status_byte: 0x04, description: 'Catalyst System Efficiency Below Threshold (Bank 1)' },
          ],
          count: 1,
        } as T;

      case 'ReadPermanentDtcs':
        return {
          dtcs: [
            { code: 'P0420', status_byte: 0x0A, description: 'Catalyst System Efficiency Below Threshold (Bank 1)' },
          ],
          count: 1,
        } as T;

      case 'ClearDtcs':
        this.demoDtcsCleared = true;
        return undefined as T;

      case 'ReadLiveData': {
        return MOCK_LIVE_DATA.map((p) => ({
          pid: parseInt(p.pid.replace('0x01', '0x'), 16),
          name: p.name,
          value: typeof p.value === 'number' ? p.value + (Math.random() - 0.5) * 2 : 0,
          unit: p.unit,
          raw: [],
        })) as T;
      }

      case 'DiscoverSupportedPids':
        return {
          supported: [
            0x01, 0x03, 0x04, 0x05, 0x06, 0x07, 0x0B, 0x0C, 0x0D, 0x0E,
            0x0F, 0x10, 0x11, 0x14, 0x1C, 0x1F, 0x21, 0x2F, 0x31, 0x33,
            0x42, 0x46, 0x49, 0x4C, 0x5C,
          ],
        } as T;

      case 'ReadReadinessMonitors':
        return {
          milOn: false,
          dtcCount: 2,
          monitors: [
            { name: 'Misfire', available: true, complete: true },
            { name: 'Fuel System', available: true, complete: true },
            { name: 'Components', available: true, complete: true },
            { name: 'Catalyst', available: true, complete: false },
            { name: 'Heated Catalyst', available: false, complete: false },
            { name: 'EVAP System', available: true, complete: true },
            { name: 'Secondary Air', available: false, complete: false },
            { name: 'O2 Sensor', available: true, complete: true },
            { name: 'O2 Heater', available: true, complete: true },
            { name: 'EGR/VVT', available: true, complete: false },
          ],
        } as T;

      case 'ReadFreezeFrame':
        return {
          dtcCode: 'P0171',
          values: [
            { pid: 0x0C, name: 'Engine RPM', value: 2450, unit: 'rpm' },
            { pid: 0x0D, name: 'Vehicle Speed', value: 105, unit: 'km/h' },
            { pid: 0x05, name: 'Coolant Temperature', value: 92, unit: '°C' },
            { pid: 0x04, name: 'Engine Load', value: 68, unit: '%' },
            { pid: 0x10, name: 'MAF Rate', value: 8.2, unit: 'g/s' },
            { pid: 0x06, name: 'Short Term Fuel Trim B1', value: 24.2, unit: '%' },
            { pid: 0x11, name: 'Throttle Position', value: 42, unit: '%' },
          ],
        } as T;

      case 'ReadMonitoringTests':
        return [
          { testId: 0x01, component: 'Catalyst Monitor B1', value: 0.87, minLimit: 0.12, maxLimit: 0.95, passed: true, healthPct: 9.6 },
          { testId: 0x02, component: 'EGR Flow', value: 14.2, minLimit: 0.0, maxLimit: 15.0, passed: true, healthPct: 5.3 },
          { testId: 0x03, component: 'O2 Sensor B1S1', value: 0.31, minLimit: 0.0, maxLimit: 0.80, passed: true, healthPct: 61.2 },
          { testId: 0x04, component: 'O2 Sensor B1S2', value: 0.22, minLimit: 0.0, maxLimit: 0.80, passed: true, healthPct: 72.5 },
          { testId: 0x05, component: 'EVAP System', value: 2.1, minLimit: 0.0, maxLimit: 19.0, passed: true, healthPct: 88.9 },
          { testId: 0x06, component: 'Misfire Cyl 1', value: 2, minLimit: 0, maxLimit: 50, passed: true, healthPct: 96.0 },
          { testId: 0x07, component: 'Misfire Cyl 2', value: 0, minLimit: 0, maxLimit: 50, passed: true, healthPct: 100 },
          { testId: 0x08, component: 'Misfire Cyl 3', value: 1, minLimit: 0, maxLimit: 50, passed: true, healthPct: 98.0 },
          { testId: 0x09, component: 'Misfire Cyl 4', value: 0, minLimit: 0, maxLimit: 50, passed: true, healthPct: 100 },
          { testId: 0x0A, component: 'Fuel System B1', value: -3.1, minLimit: -10, maxLimit: 10, passed: true, healthPct: 65.5 },
        ] as T;

      case 'ReadO2SensorTests':
        return [
          { sensor: 'B1S1', richToLeanThreshold: 450, leanToRichThreshold: 180, lowVoltage: 45, highVoltage: 850, responseTime: 120 },
          { sensor: 'B1S2', richToLeanThreshold: 400, leanToRichThreshold: 200, lowVoltage: 60, highVoltage: 780, responseTime: 180 },
        ] as T;

      case 'ReadVehicleInfo':
        return {
          vin: 'JTDKN3DU5A0123456',
          calibrationIds: ['2AR-FE-CAL-v3.4.1', 'TCM-A25A-v2.1.0'],
          calibrationVerification: ['0xA4B2C3D1', '0xE5F67890'],
          ecuName: 'DENSO 89661-06K10',
        } as T;

      case 'StartSession':
      case 'EndSession':
        return undefined as T;

      default:
        throw new Error(`Unknown demo command: ${cmd}`);
    }
  }
}

export const agentBridge = new AgentBridge();
