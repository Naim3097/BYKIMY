// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - SMART SCAN SERVICE
// VIN-Based ECU Topology Prediction
// Reduces scan time from 90s to 10-15s for known vehicles
// ============================================================

import { VINDecoded } from '@/types';

export interface ECUExpectation {
  address: number;          // 0x7E0, 0x7A0, etc.
  name: string;             // "ECM (Engine Control Module)"
  type: string;             // "ECM", "TCM", "ABS", etc.
  protocol: string;         // "UDS", "KWP2000"
  critical: boolean;        // Must be present (ECM/TCM)
  optional: boolean;        // May not be present (ACC, LKA)
  probeMethod: 'STANDARD' | 'OBD' | 'EXTENDED';  // Which probe method to use first
}

export interface VehicleECUProfile {
  manufacturer: string;
  brand: string;
  models: string[];
  years: number[];
  vinPatterns: string[];    // Regex patterns to match VINs
  expectedECUs: ECUExpectation[];
  notes?: string;
}

class SmartScanService {
  private profiles: VehicleECUProfile[] = [];

  constructor() {
    this.loadProfiles();
  }

  /**
   * Load ECU profiles for Malaysian and ASEAN vehicles
   */
  private loadProfiles(): void {
    this.profiles = [
      // PROTON SAGA VVT (2016-2024) - FL/FL2 Platform
      {
        manufacturer: 'Proton',
        brand: 'Proton',
        models: ['Saga'],
        years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^MHFL', '^MDM.*SAGA'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (Punch CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'OBD' },
          { address: 0x7A0, name: 'ABS (Bosch)', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7A2, name: 'SRS (Autoliv)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x760, name: 'BCM (Proton)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x730, name: 'EPS (Proton)', type: 'EPS', protocol: 'UDS', critical: false, optional: true, probeMethod: 'EXTENDED' },
        ],
        notes: 'Punch CVT at 0x7E1 responds to OBD Mode 01, not standard UDS',
      },

      // PROTON PERSONA/IRIZ (2016-2024) - CM Platform
      {
        manufacturer: 'Proton',
        brand: 'Proton',
        models: ['Persona', 'Iriz'],
        years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^MHCP', '^MHCR', '^MDM.*(PERSONA|IRIZ)'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (Punch CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'OBD' },
          { address: 0x7A0, name: 'ABS (Bosch)', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7A2, name: 'SRS (Autoliv)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x760, name: 'BCM (Proton)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x730, name: 'EPS (Proton)', type: 'EPS', protocol: 'UDS', critical: false, optional: true, probeMethod: 'EXTENDED' },
          { address: 0x7C4, name: 'IPC (Instrument Cluster)', type: 'IPC', protocol: 'UDS', critical: false, optional: true, probeMethod: 'EXTENDED' },
        ],
      },

      // PROTON X50/X70 (2020-2024) - Geely BE Platform
      {
        manufacturer: 'Proton',
        brand: 'Proton',
        models: ['X50', 'X70'],
        years: [2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^MHXF', '^L6T', '^MDM.*(X50|X70)'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (7DCT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7B0, name: 'ABS/ESP (Geely)', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x780, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x760, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7C0, name: 'Gateway', type: 'GW', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7C4, name: 'IPC (Instrument)', type: 'IPC', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7A8, name: 'ACC (Adaptive Cruise)', type: 'ACC', protocol: 'UDS', critical: false, optional: true, probeMethod: 'EXTENDED' },
          { address: 0x7AA, name: 'LKA (Lane Keep)', type: 'LKA', protocol: 'UDS', critical: false, optional: true, probeMethod: 'EXTENDED' },
        ],
        notes: 'Geely CMA platform, ADAS features optional',
      },

      // PERODUA MYVI (2018-2024) - DNGA Platform
      {
        manufacturer: 'Perodua',
        brand: 'Perodua',
        models: ['Myvi'],
        years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^MHK', '^MNE.*MYVI'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (D-CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'OBD' },
          { address: 0x7B0, name: 'ABS/VSC (Advics)', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x780, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7C0, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7C4, name: 'IPC (Meter)', type: 'IPC', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x790, name: 'EPS (Steering)', type: 'EPS', protocol: 'UDS', critical: false, optional: true, probeMethod: 'EXTENDED' },
        ],
        notes: 'DNGA platform, shares ECU architecture with Toyota Vios',
      },

      // PERODUA ATIVA (2021-2024) - DNGA-B Platform
      {
        manufacturer: 'Perodua',
        brand: 'Perodua',
        models: ['Ativa'],
        years: [2021, 2022, 2023, 2024],
        vinPatterns: ['^MHK.*ATIVA', '^MNE.*ATIVA'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (D-CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7B0, name: 'ABS/VSC', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x780, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7C0, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7C4, name: 'IPC (Meter)', type: 'IPC', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x790, name: 'EPS (Steering)', type: 'EPS', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7A8, name: 'ACC (Cruise)', type: 'ACC', protocol: 'UDS', critical: false, optional: true, probeMethod: 'EXTENDED' },
          { address: 0x7AA, name: 'LKA (Lane Keep)', type: 'LKA', protocol: 'UDS', critical: false, optional: true, probeMethod: 'EXTENDED' },
        ],
        notes: 'ASA 3.0 ADAS system, ACC/LKA on higher variants only',
      },

      // TOYOTA VIOS/YARIS (2019-2024) - DNGA Platform
      {
        manufacturer: 'Toyota',
        brand: 'Toyota',
        models: ['Vios', 'Yaris'],
        years: [2019, 2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^MR0', '^MR1', '^9BR.*VIOS'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7B0, name: 'ABS/VSC', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7B3, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x750, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7C4, name: 'IPC (Meter)', type: 'IPC', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
      },

      // HONDA CITY/CIVIC (2020-2024)
      {
        manufacturer: 'Honda',
        brand: 'Honda',
        models: ['City', 'Civic'],
        years: [2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^MLP', '^MLH', '^19X.*CITY'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x18DA10F1, name: 'TCM (CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7D0, name: 'ABS/VSA', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7D4, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x760, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7C4, name: 'IPC (Instrument)', type: 'IPC', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
        notes: 'Honda uses 29-bit addressing for some ECUs',
      },

      // PERODUA AXIA/BEZZA (2014-2024) - DNGA-B Platform
      {
        manufacturer: 'Perodua',
        brand: 'Perodua',
        models: ['Axia', 'Bezza'],
        years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^MHK.*AXI', '^MHK.*BEZ', '^MNE.*(AXIA|BEZZA)'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'OBD' },
          { address: 0x7B0, name: 'ABS/VSC', type: 'ABS', protocol: 'UDS', critical: false, optional: true, probeMethod: 'STANDARD' },
          { address: 0x780, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: false, optional: true, probeMethod: 'STANDARD' },
          { address: 0x7C0, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
        notes: 'Base Axia may lack ABS/VSC and SRS on lower variants',
      },

      // PERODUA ALZA (2022-2024) - DNGA-B Platform (D27A)
      {
        manufacturer: 'Perodua',
        brand: 'Perodua',
        models: ['Alza'],
        years: [2022, 2023, 2024],
        vinPatterns: ['^MHK.*ALZA', '^MNE.*ALZA'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (D-CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7B0, name: 'ABS/VSC', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x780, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7C0, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7C4, name: 'IPC (Meter)', type: 'IPC', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x790, name: 'EPS (Steering)', type: 'EPS', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
        notes: 'New gen Alza, DNGA platform shared with Avanza',
      },

      // PROTON EXORA (2009-2024) - GE/GF Platform (refreshed)
      {
        manufacturer: 'Proton',
        brand: 'Proton',
        models: ['Exora'],
        years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^MHGE', '^MDM.*EXORA'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (Punch CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'OBD' },
          { address: 0x7A0, name: 'ABS (Bosch)', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7A2, name: 'SRS (Autoliv)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x760, name: 'BCM (Proton)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
        notes: 'Campro CFE turbo with Punch CVT',
      },

      // TOYOTA HILUX (2016-2024)
      {
        manufacturer: 'Toyota',
        brand: 'Toyota',
        models: ['Hilux'],
        years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^MR0.*HILUX', '^MR1.*HL'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (6AT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7B0, name: 'ABS/VSC', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7B3, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x750, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
        notes: 'Diesel 2GD/1GD-FTV variants common in Malaysia',
      },

      // TOYOTA CAMRY (2019-2024)
      {
        manufacturer: 'Toyota',
        brand: 'Toyota',
        models: ['Camry'],
        years: [2019, 2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^MR0.*CAM', '^JT.*CAM'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (8AT/CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7B0, name: 'ABS/VSC', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7B3, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x750, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7C4, name: 'IPC (Meter)', type: 'IPC', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
      },

      // NISSAN ALMERA (2020-2024) - N18 Platform
      {
        manufacturer: 'Nissan',
        brand: 'Nissan',
        models: ['Almera'],
        years: [2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^VSS.*ALMERA', '^MDHBN'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (XTRONIC CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E2, name: 'ABS/VDC', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E3, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E4, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
        notes: 'Nissan uses standard 0x7Ex addressing',
      },

      // HYUNDAI CRETA / KONA / ELANTRA (2020-2024)
      {
        manufacturer: 'Hyundai',
        brand: 'Hyundai',
        models: ['Creta', 'Kona', 'Elantra', 'Tucson'],
        years: [2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^KMH', '^MAL.*HYU'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (IVT/DCT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E2, name: 'ABS/ESC', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E3, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E4, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E5, name: 'EPS (Steering)', type: 'EPS', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
        notes: 'Hyundai/Kia share platform — standard 0x7E0-7E7 addressing',
      },

      // KIA SELTOS / SPORTAGE / CARNIVAL (2020-2024)
      {
        manufacturer: 'Kia',
        brand: 'Kia',
        models: ['Seltos', 'Sportage', 'Carnival', 'Cerato'],
        years: [2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^KNA', '^KND', '^U5Y'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (IVT/DCT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E2, name: 'ABS/ESC', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E3, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E4, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
        notes: 'Shared Hyundai-Kia platform, standard addressing',
      },

      // MAZDA 2/3/CX-5 (2019-2024)
      {
        manufacturer: 'Mazda',
        brand: 'Mazda',
        models: ['2', '3', 'CX-3', 'CX-5', 'CX-30'],
        years: [2019, 2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^JM', '^MM6'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (SKYACTIV-Drive)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E2, name: 'ABS/DSC', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E3, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E4, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E5, name: 'EPS (Steering)', type: 'EPS', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
        notes: 'SKYACTIV platform, standard 0x7Ex addressing',
      },

      // HONDA HR-V / CR-V (2022-2024)
      {
        manufacturer: 'Honda',
        brand: 'Honda',
        models: ['HR-V', 'CR-V'],
        years: [2022, 2023, 2024],
        vinPatterns: ['^MLP.*HRV', '^MLH.*CRV', '^MHR'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x18DA10F1, name: 'TCM (CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7D0, name: 'ABS/VSA', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7D4, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x760, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7C4, name: 'IPC (Instrument)', type: 'IPC', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
        notes: 'Honda uses 29-bit addressing for some ECUs',
      },

      // MITSUBISHI TRITON/XPANDER (2019-2024)
      {
        manufacturer: 'Mitsubishi',
        brand: 'Mitsubishi',
        models: ['Triton', 'Xpander'],
        years: [2019, 2020, 2021, 2022, 2023, 2024],
        vinPatterns: ['^MMA', '^MMB'],
        expectedECUs: [
          { address: 0x7E0, name: 'ECM (Engine)', type: 'ECM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E1, name: 'TCM (6AT/CVT)', type: 'TCM', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E2, name: 'ABS', type: 'ABS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E3, name: 'SRS (Airbag)', type: 'SRS', protocol: 'UDS', critical: true, optional: false, probeMethod: 'STANDARD' },
          { address: 0x7E4, name: 'BCM (Body)', type: 'BCM', protocol: 'UDS', critical: false, optional: false, probeMethod: 'STANDARD' },
        ],
        notes: 'Standard OBD addressing, Triton = diesel variant common in MY',
      },
    ];

    console.log(`✓ Smart scan: Loaded ${this.profiles.length} vehicle ECU profiles`);
  }

  /**
   * Get expected ECU list based on VIN data
   */
  getExpectedECUs(vinData: VINDecoded): ECUExpectation[] | null {
    // Try to match a profile
    for (const profile of this.profiles) {
      // Check manufacturer/brand match
      if (profile.brand.toLowerCase() !== vinData.brand.toLowerCase()) {
        continue;
      }

      // Check model match
      if (!profile.models.some(model => 
        vinData.model.toLowerCase().includes(model.toLowerCase())
      )) {
        continue;
      }

      // Check year match
      if (vinData.modelYear && !profile.years.includes(vinData.modelYear)) {
        continue;
      }

      // Found a match!
      console.log(`✓ Smart scan: Matched profile for ${profile.brand} ${profile.models.join('/')} (${vinData.modelYear || 'unknown year'})`);
      console.log(`  Expected ${profile.expectedECUs.length} ECUs (${profile.expectedECUs.filter(e => e.critical).length} critical)`);
      
      if (profile.notes) {
        console.log(`  Note: ${profile.notes}`);
      }

      return profile.expectedECUs;
    }

    // No profile match - return null (will fallback to full scan)
    console.log(`⚠ Smart scan: No profile match for ${vinData.brand} ${vinData.model} ${vinData.modelYear || ''}`);
    return null;
  }

  /**
   * Get scan strategy (which addresses to probe, in what order)
   */
  getScanStrategy(vinData: VINDecoded): {
    priorityAddresses: number[];    // Critical ECUs to scan first
    optionalAddresses: number[];    // Non-critical ECUs to scan if time permits
    fallbackToFullScan: boolean;    // If false, skip full 40-address scan
  } {
    const expectedECUs = this.getExpectedECUs(vinData);

    if (!expectedECUs) {
      // Unknown vehicle - do full scan
      return {
        priorityAddresses: [],
        optionalAddresses: [],
        fallbackToFullScan: true,
      };
    }

    // Known vehicle - smart scan
    const priorityAddresses = expectedECUs
      .filter(ecu => ecu.critical || !ecu.optional)
      .map(ecu => ecu.address);

    const optionalAddresses = expectedECUs
      .filter(ecu => !ecu.critical && ecu.optional)
      .map(ecu => ecu.address);

    return {
      priorityAddresses,
      optionalAddresses,
      fallbackToFullScan: false, // Skip full scan for known vehicles
    };
  }

  /**
   * Check if all critical ECUs were found
   */
  validateTopology(
    vinData: VINDecoded,
    discoveredAddresses: number[]
  ): {
    allCriticalFound: boolean;
    missingCritical: ECUExpectation[];
    unexpectedECUs: number[];
    warnings: string[];
  } {
    const expected = this.getExpectedECUs(vinData);

    if (!expected) {
      // Unknown vehicle - can't validate
      return {
        allCriticalFound: true,
        missingCritical: [],
        unexpectedECUs: [],
        warnings: [],
      };
    }

    const criticalECUs = expected.filter(ecu => ecu.critical);
    const expectedAddresses = expected.map(ecu => ecu.address);

    const missingCritical = criticalECUs.filter(
      ecu => !discoveredAddresses.includes(ecu.address)
    );

    const unexpectedECUs = discoveredAddresses.filter(
      addr => !expectedAddresses.includes(addr)
    );

    const warnings: string[] = [];

    if (missingCritical.length > 0) {
      warnings.push(
        `⚠️ Missing ${missingCritical.length} critical ECU(s): ${missingCritical.map(e => e.name).join(', ')}`
      );
    }

    if (unexpectedECUs.length > 0) {
      warnings.push(
        `ℹ️ Found ${unexpectedECUs.length} unexpected ECU(s) at: ${unexpectedECUs.map(a => '0x' + a.toString(16).toUpperCase()).join(', ')}`
      );
    }

    return {
      allCriticalFound: missingCritical.length === 0,
      missingCritical,
      unexpectedECUs,
      warnings,
    };
  }

  /**
   * Get all supported manufacturers
   */
  getSupportedManufacturers(): string[] {
    return Array.from(new Set(this.profiles.map(p => p.manufacturer)));
  }

  /**
   * Get profile statistics
   */
  getStats(): {
    totalProfiles: number;
    manufacturers: string[];
    totalModels: number;
    yearRange: { min: number; max: number };
    avgECUsPerVehicle: number;
  } {
    const manufacturers = this.getSupportedManufacturers();
    const allModels = this.profiles.flatMap(p => p.models);
    const allYears = this.profiles.flatMap(p => p.years);
    const avgECUs = this.profiles.reduce((sum, p) => sum + p.expectedECUs.length, 0) / this.profiles.length;

    return {
      totalProfiles: this.profiles.length,
      manufacturers,
      totalModels: new Set(allModels).size,
      yearRange: {
        min: Math.min(...allYears),
        max: Math.max(...allYears),
      },
      avgECUsPerVehicle: Math.round(avgECUs * 10) / 10,
    };
  }
}

// Singleton instance
export const smartScanService = new SmartScanService();
