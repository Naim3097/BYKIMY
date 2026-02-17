// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - CHROME WEB BLUETOOTH (GATT) SERVICE
// Handles BLE communication with OBD-II adapters
// ============================================================

import { OBDDevice, OBDProtocol, ConnectionStatus } from '@/types';

// Standard OBD-II Bluetooth UUIDs
const OBD_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const OBD_CHARACTERISTIC_TX = '0000fff1-0000-1000-8000-00805f9b34fb';
const OBD_CHARACTERISTIC_RX = '0000fff2-0000-1000-8000-00805f9b34fb';

// Alternative UUIDs for different OBD adapters
const ALTERNATE_SERVICE_UUIDS = [
  '0000ffe0-0000-1000-8000-00805f9b34fb', // Common ELM327
  '00001101-0000-1000-8000-00805f9b34fb', // SPP
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Custom
];

export type BluetoothEventType = 
  | 'connecting' 
  | 'connected' 
  | 'disconnected' 
  | 'data' 
  | 'error'
  | 'scanning';

export interface BluetoothEvent {
  type: BluetoothEventType;
  device?: OBDDevice;
  data?: string;
  error?: Error;
}

type BluetoothEventCallback = (event: BluetoothEvent) => void;

class ChromeGATTService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private eventListeners: BluetoothEventCallback[] = [];
  private responseBuffer: string = '';
  private isConnected: boolean = false;

  // Check if Web Bluetooth is supported
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 
           'bluetooth' in navigator;
  }

  // Subscribe to events
  addEventListener(callback: BluetoothEventCallback): () => void {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter(cb => cb !== callback);
    };
  }

  private emit(event: BluetoothEvent): void {
    this.eventListeners.forEach(cb => cb(event));
  }

  // Scan and connect to OBD device
  async connect(): Promise<OBDDevice | null> {
    if (!this.isSupported()) {
      this.emit({ type: 'error', error: new Error('Web Bluetooth not supported') });
      return null;
    }

    try {
      this.emit({ type: 'scanning' });

      // Request device — try name filters first, fall back to acceptAllDevices
      try {
        this.device = await navigator.bluetooth.requestDevice({
          filters: [
            { namePrefix: 'OBD' },
            { namePrefix: 'ELM' },
            { namePrefix: 'BYKI' },
            { namePrefix: 'Vgate' },
            { namePrefix: 'iCar' },
            { namePrefix: 'Vlink' },
            { namePrefix: 'V-LINK' },
            { namePrefix: 'OBDII' },
            { namePrefix: 'Android' },
            { services: [OBD_SERVICE_UUID] },
            { services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] },
          ],
          optionalServices: [OBD_SERVICE_UUID, ...ALTERNATE_SERVICE_UUIDS],
        });
      } catch {
        // Name filters missed the device — show ALL nearby BLE devices
        this.device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [OBD_SERVICE_UUID, ...ALTERNATE_SERVICE_UUIDS],
        });
      }

      if (!this.device) {
        throw new Error('No device selected');
      }

      this.emit({ type: 'connecting' });

      // Connect to GATT server
      this.server = await this.device.gatt?.connect() ?? null;
      
      if (!this.server) {
        throw new Error('Failed to connect to GATT server');
      }

      // Find the OBD service
      let service: BluetoothRemoteGATTService | null = null;
      
      for (const uuid of [OBD_SERVICE_UUID, ...ALTERNATE_SERVICE_UUIDS]) {
        try {
          service = await this.server.getPrimaryService(uuid);
          if (service) break;
        } catch {
          continue;
        }
      }

      if (!service) {
        throw new Error('OBD service not found on device');
      }

      // Get characteristics
      const characteristics = await service.getCharacteristics();
      
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          this.txCharacteristic = char;
        }
        if (char.properties.notify || char.properties.read) {
          this.rxCharacteristic = char;
        }
      }

      if (!this.txCharacteristic || !this.rxCharacteristic) {
        throw new Error('Required characteristics not found');
      }

      // Subscribe to notifications
      await this.rxCharacteristic.startNotifications();
      this.rxCharacteristic.addEventListener(
        'characteristicvaluechanged',
        this.handleDataReceived.bind(this)
      );

      // Handle disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        this.emit({ type: 'disconnected' });
      });

      this.isConnected = true;

      const obdDevice: OBDDevice = {
        id: this.device.id,
        name: this.device.name || 'Unknown OBD Device',
        type: 'BLE',
        connected: true,
        batteryLevel: null,
        firmwareVersion: null,
        lastSeen: new Date(),
        signalStrength: null,
      };

      this.emit({ type: 'connected', device: obdDevice });

      // Initialize ELM327
      await this.initializeAdapter();

      return obdDevice;

    } catch (error) {
      this.emit({ type: 'error', error: error as Error });
      return null;
    }
  }

  // Handle incoming data from OBD device
  private handleDataReceived(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    
    if (!value) return;

    const decoder = new TextDecoder();
    const data = decoder.decode(value);
    
    this.responseBuffer += data;

    // Check for complete response (ends with > prompt)
    if (this.responseBuffer.includes('>')) {
      const response = this.responseBuffer.trim().replace('>', '');
      this.responseBuffer = '';
      this.emit({ type: 'data', data: response });
    }
  }

  // Send command to OBD device
  async sendCommand(command: string): Promise<string> {
    if (!this.txCharacteristic || !this.isConnected) {
      throw new Error('Not connected to OBD device');
    }

    return new Promise(async (resolve, reject) => {
      let removeHandler: (() => void) | null = null;

      const timeout = setTimeout(() => {
        // Clean up listener to prevent leak
        if (removeHandler) removeHandler();
        reject(new Error('Command timeout'));
      }, 5000);

      const handler = (event: BluetoothEvent) => {
        if (event.type === 'data') {
          clearTimeout(timeout);
          if (removeHandler) removeHandler();
          resolve(event.data || '');
        }
      };

      removeHandler = this.addEventListener(handler);

      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(command + '\r');
        await this.txCharacteristic!.writeValue(data);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  // Initialize ELM327 adapter
  private async initializeAdapter(): Promise<void> {
    try {
      // Reset adapter
      await this.sendCommand('ATZ');
      await this.delay(1000);

      // Echo off
      await this.sendCommand('ATE0');
      
      // Line feeds off
      await this.sendCommand('ATL0');
      
      // Headers on (to see ECU addresses)
      await this.sendCommand('ATH1');
      
      // Spaces off (cleaner parsing)
      await this.sendCommand('ATS0');
      
      // Auto protocol detection
      await this.sendCommand('ATSP0');
      
      // Adaptive timing
      await this.sendCommand('ATAT2');

    } catch (error) {
      console.error('Adapter initialization error:', error);
    }
  }

  // Set protocol manually if needed
  async setProtocol(protocol: OBDProtocol): Promise<void> {
    const protocolMap: Record<OBDProtocol, string> = {
      'CAN_11BIT_500K': 'ATSP6',
      'CAN_29BIT_500K': 'ATSP7',
      'CAN_11BIT_250K': 'ATSP8',
      'CAN_29BIT_250K': 'ATSP9',
      'ISO_15765_4': 'ATSP6',
      'ISO_14230_4_KWP': 'ATSP5',
      'ISO_9141_2': 'ATSP3',
      'SAE_J1850_PWM': 'ATSP1',
      'SAE_J1850_VPW': 'ATSP2',
    };

    const cmd = protocolMap[protocol];
    if (cmd) {
      await this.sendCommand(cmd);
    }
  }

  // Read VIN from vehicle
  async readVIN(): Promise<string | null> {
    try {
      // Mode 09, PID 02 - VIN
      const response = await this.sendCommand('0902');
      return this.parseVINResponse(response);
    } catch (error) {
      console.error('VIN read error:', error);
      return null;
    }
  }

  private parseVINResponse(response: string): string | null {
    // Handle both space-on and space-off (ATS0) formats
    // With spaces: "49 02 01 57 46 30..."
    // Without spaces: "490201574630..."
    const lines = response.split('\n').map(l => l.trim()).filter(Boolean);
    
    let vinHex = '';
    for (const line of lines) {
      const clean = line.replace(/\s/g, ''); // remove all spaces
      // Look for Mode 09 PID 02 response header: 4902
      const idx = clean.indexOf('4902');
      if (idx !== -1) {
        // Skip header: "4902" + 2-char sequence number = 6 chars
        vinHex += clean.substring(idx + 6);
      }
    }

    if (!vinHex) return null;

    // Convert hex to ASCII
    let vin = '';
    for (let i = 0; i < vinHex.length; i += 2) {
      const byte = parseInt(vinHex.substr(i, 2), 16);
      if (byte > 31 && byte < 127) { // printable ASCII
        vin += String.fromCharCode(byte);
      }
    }

    return vin.length === 17 ? vin : null;
  }

  // Read DTCs from specific ECU
  async readDTCs(mode: '03' | '07' | '0A' = '03'): Promise<string[]> {
    try {
      const response = await this.sendCommand(mode);
      return this.parseDTCResponse(response);
    } catch (error) {
      console.error('DTC read error:', error);
      return [];
    }
  }

  private parseDTCResponse(response: string): string[] {
    const dtcs: string[] = [];
    const lines = response.split('\n').map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      // Remove all spaces to handle both ATS0 on/off
      const clean = line.replace(/\s/g, '');
      
      // Skip lines that are just prompts or errors
      if (clean === 'NODATA' || clean === 'ERROR' || clean === 'UNABLE TO CONNECT') continue;

      // Strip mode response byte (43=Mode03, 47=Mode07, 4A=Mode0A)
      let hex = clean;
      if (hex.startsWith('43') || hex.startsWith('47') || hex.startsWith('4A')) {
        hex = hex.substring(2);
      }

      // Parse DTC pairs (each DTC = 4 hex chars = 2 bytes)
      for (let i = 0; i + 3 < hex.length; i += 4) {
        const byte1 = hex.substring(i, i + 2);
        const byte2 = hex.substring(i + 2, i + 4);
        if (/^[0-9A-F]{2}$/i.test(byte1) && /^[0-9A-F]{2}$/i.test(byte2)) {
          const dtc = this.decodeDTC(byte1, byte2);
          if (dtc) dtcs.push(dtc);
        }
      }
    }

    return dtcs;
  }

  private decodeDTC(byte1: string, byte2: string): string | null {
    const b1 = parseInt(byte1, 16);
    const b2 = parseInt(byte2, 16);

    if (b1 === 0 && b2 === 0) return null;

    const prefixes = ['P', 'C', 'B', 'U'];
    const prefix = prefixes[(b1 >> 6) & 0x03];
    const digit1 = (b1 >> 4) & 0x03;
    const digit2 = b1 & 0x0F;
    const digit3 = (b2 >> 4) & 0x0F;
    const digit4 = b2 & 0x0F;

    return `${prefix}${digit1}${digit2.toString(16).toUpperCase()}${digit3.toString(16).toUpperCase()}${digit4.toString(16).toUpperCase()}`;
  }

  // Clear DTCs
  async clearDTCs(): Promise<boolean> {
    try {
      const response = await this.sendCommand('04');
      return response.includes('44') || response.includes('OK');
    } catch (error) {
      console.error('DTC clear error:', error);
      return false;
    }
  }

  // Read PID value
  async readPID(mode: string, pid: string): Promise<string> {
    try {
      return await this.sendCommand(`${mode}${pid}`);
    } catch (error) {
      console.error(`PID read error (${pid}):`, error);
      return '';
    }
  }

  // Read battery voltage
  async readBatteryVoltage(): Promise<number | null> {
    try {
      const response = await this.sendCommand('ATRV');
      const match = response.match(/(\d+\.?\d*)V/i);
      return match ? parseFloat(match[1]) : null;
    } catch (error) {
      return null;
    }
  }

  // Disconnect from device
  disconnect(): void {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.txCharacteristic = null;
    this.rxCharacteristic = null;
    this.isConnected = false;
    this.emit({ type: 'disconnected' });
  }

  // Get connection status
  getConnectionStatus(): ConnectionStatus {
    return {
      device: this.device ? {
        id: this.device.id,
        name: this.device.name || 'Unknown',
        type: 'BLE',
        connected: this.isConnected,
        batteryLevel: null,
        firmwareVersion: null,
        lastSeen: new Date(),
        signalStrength: null,
      } : null,
      vehicleConnected: this.isConnected,
      ignitionState: 'UNKNOWN',
      batteryVoltage: null,
      protocol: null,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const bluetoothService = new ChromeGATTService();
