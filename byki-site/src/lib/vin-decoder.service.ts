// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - VIN DECODER SERVICE
// Decodes VIN to vehicle specifications
// ============================================================

import { VINData, VINDecoded } from './diagnostic.types';

// World Manufacturer Identifier (WMI) Database
const WMI_DATABASE: Record<string, { manufacturer: string; brand: string; country: string }> = {
  // TOYOTA
  'JTD': { manufacturer: 'Toyota Motor Corporation', brand: 'Toyota', country: 'Japan' },
  'JTE': { manufacturer: 'Toyota Motor Corporation', brand: 'Toyota', country: 'Japan' },
  'JTF': { manufacturer: 'Toyota Motor Corporation', brand: 'Toyota', country: 'Japan' },
  'JTH': { manufacturer: 'Toyota Motor Corporation', brand: 'Lexus', country: 'Japan' },
  'JTJ': { manufacturer: 'Toyota Motor Corporation', brand: 'Lexus', country: 'Japan' },
  'JTK': { manufacturer: 'Toyota Motor Corporation', brand: 'Toyota', country: 'Japan' },
  'JTL': { manufacturer: 'Toyota Motor Corporation', brand: 'Toyota', country: 'Japan' },
  'JTM': { manufacturer: 'Toyota Motor Corporation', brand: 'Toyota', country: 'Japan' },
  'JTN': { manufacturer: 'Toyota Motor Corporation', brand: 'Toyota', country: 'Japan' },
  '4T1': { manufacturer: 'Toyota Motor Manufacturing', brand: 'Toyota', country: 'USA' },
  '5TD': { manufacturer: 'Toyota Motor Manufacturing', brand: 'Toyota', country: 'USA' },
  '2T1': { manufacturer: 'Toyota Motor Manufacturing Canada', brand: 'Toyota', country: 'Canada' },
  'MR0': { manufacturer: 'Toyota Motor Thailand', brand: 'Toyota', country: 'Thailand' },
  'MHF': { manufacturer: 'Toyota Motor Thailand', brand: 'Toyota', country: 'Thailand' },
  
  // HONDA
  'JHM': { manufacturer: 'Honda Motor Co', brand: 'Honda', country: 'Japan' },
  'SHH': { manufacturer: 'Honda of the UK', brand: 'Honda', country: 'UK' },
  '1HG': { manufacturer: 'Honda of America', brand: 'Honda', country: 'USA' },
  '2HG': { manufacturer: 'Honda Canada', brand: 'Honda', country: 'Canada' },
  '93H': { manufacturer: 'Honda Brazil', brand: 'Honda', country: 'Brazil' },
  
  // NISSAN
  'JN1': { manufacturer: 'Nissan Motor Co', brand: 'Nissan', country: 'Japan' },
  'JN6': { manufacturer: 'Nissan Motor Co', brand: 'Nissan', country: 'Japan' },
  '1N4': { manufacturer: 'Nissan North America', brand: 'Nissan', country: 'USA' },
  '5N1': { manufacturer: 'Nissan North America', brand: 'Nissan', country: 'USA' },
  'JN8': { manufacturer: 'Nissan Motor Co', brand: 'Nissan', country: 'Japan' },
  'JNK': { manufacturer: 'Nissan Motor Co', brand: 'Infiniti', country: 'Japan' },
  
  // MAZDA
  'JM1': { manufacturer: 'Mazda Motor Corporation', brand: 'Mazda', country: 'Japan' },
  'JM3': { manufacturer: 'Mazda Motor Corporation', brand: 'Mazda', country: 'Japan' },
  '1YV': { manufacturer: 'Mazda USA', brand: 'Mazda', country: 'USA' },
  
  // MITSUBISHI
  'JA3': { manufacturer: 'Mitsubishi Motors', brand: 'Mitsubishi', country: 'Japan' },
  'JA4': { manufacturer: 'Mitsubishi Motors', brand: 'Mitsubishi', country: 'Japan' },
  'JMB': { manufacturer: 'Mitsubishi Motors', brand: 'Mitsubishi', country: 'Japan' },
  'JMY': { manufacturer: 'Mitsubishi Fuso', brand: 'Mitsubishi', country: 'Japan' },
  
  // SUBARU
  'JF1': { manufacturer: 'Subaru Corporation', brand: 'Subaru', country: 'Japan' },
  'JF2': { manufacturer: 'Subaru Corporation', brand: 'Subaru', country: 'Japan' },
  '4S3': { manufacturer: 'Subaru of Indiana', brand: 'Subaru', country: 'USA' },
  '4S4': { manufacturer: 'Subaru of Indiana', brand: 'Subaru', country: 'USA' },
  
  // BMW
  'WBA': { manufacturer: 'BMW AG', brand: 'BMW', country: 'Germany' },
  'WBS': { manufacturer: 'BMW M GmbH', brand: 'BMW M', country: 'Germany' },
  'WBY': { manufacturer: 'BMW AG', brand: 'BMW i', country: 'Germany' },
  '5UX': { manufacturer: 'BMW USA', brand: 'BMW', country: 'USA' },
  
  // MERCEDES-BENZ
  'WDB': { manufacturer: 'Daimler AG', brand: 'Mercedes-Benz', country: 'Germany' },
  'WDD': { manufacturer: 'Daimler AG', brand: 'Mercedes-Benz', country: 'Germany' },
  'WDC': { manufacturer: 'Daimler AG', brand: 'Mercedes-Benz', country: 'Germany' },
  '4JG': { manufacturer: 'Mercedes-Benz USA', brand: 'Mercedes-Benz', country: 'USA' },
  
  // AUDI
  'WAU': { manufacturer: 'Audi AG', brand: 'Audi', country: 'Germany' },
  'WUA': { manufacturer: 'Audi AG', brand: 'Audi', country: 'Germany' },
  'TRU': { manufacturer: 'Audi Hungary', brand: 'Audi', country: 'Hungary' },
  
  // VOLKSWAGEN
  'WVW': { manufacturer: 'Volkswagen AG', brand: 'Volkswagen', country: 'Germany' },
  'WVG': { manufacturer: 'Volkswagen AG', brand: 'Volkswagen', country: 'Germany' },
  '3VW': { manufacturer: 'Volkswagen Mexico', brand: 'Volkswagen', country: 'Mexico' },
  
  // FORD
  '1FA': { manufacturer: 'Ford Motor Company', brand: 'Ford', country: 'USA' },
  '1FB': { manufacturer: 'Ford Motor Company', brand: 'Ford', country: 'USA' },
  '1FC': { manufacturer: 'Ford Motor Company', brand: 'Ford', country: 'USA' },
  '1FD': { manufacturer: 'Ford Motor Company', brand: 'Ford', country: 'USA' },
  '1FM': { manufacturer: 'Ford Motor Company', brand: 'Ford', country: 'USA' },
  '1FT': { manufacturer: 'Ford Motor Company', brand: 'Ford', country: 'USA' },
  '2FA': { manufacturer: 'Ford Canada', brand: 'Ford', country: 'Canada' },
  '3FA': { manufacturer: 'Ford Mexico', brand: 'Ford', country: 'Mexico' },
  
  // HYUNDAI
  'KMH': { manufacturer: 'Hyundai Motor Company', brand: 'Hyundai', country: 'South Korea' },
  '5NP': { manufacturer: 'Hyundai USA', brand: 'Hyundai', country: 'USA' },
  
  // KIA
  'KNA': { manufacturer: 'Kia Motors', brand: 'Kia', country: 'South Korea' },
  'KND': { manufacturer: 'Kia Motors', brand: 'Kia', country: 'South Korea' },
  '5XY': { manufacturer: 'Kia USA', brand: 'Kia', country: 'USA' },
  
  // PROTON
  'PM1': { manufacturer: 'Proton Holdings', brand: 'Proton', country: 'Malaysia' },
  
  // PERODUA
  'PL1': { manufacturer: 'Perodua', brand: 'Perodua', country: 'Malaysia' },

  // SUZUKI
  'JS1': { manufacturer: 'Suzuki Motor Corporation', brand: 'Suzuki', country: 'Japan' },
  'JS2': { manufacturer: 'Suzuki Motor Corporation', brand: 'Suzuki', country: 'Japan' },
  'JS3': { manufacturer: 'Suzuki Motor Corporation', brand: 'Suzuki', country: 'Japan' },
  'TSM': { manufacturer: 'Suzuki Motor Corporation', brand: 'Suzuki', country: 'Japan' },

  // ISUZU
  'JAA': { manufacturer: 'Isuzu Motors', brand: 'Isuzu', country: 'Japan' },
  'JAL': { manufacturer: 'Isuzu Motors', brand: 'Isuzu', country: 'Japan' },
  'MP1': { manufacturer: 'Isuzu Thailand', brand: 'Isuzu', country: 'Thailand' },

  // MINI
  'WMW': { manufacturer: 'BMW AG (MINI)', brand: 'Mini', country: 'Germany/UK' },

  // PORSCHE
  'WP0': { manufacturer: 'Porsche AG', brand: 'Porsche', country: 'Germany' },
  'WP1': { manufacturer: 'Porsche AG', brand: 'Porsche', country: 'Germany' },

  // PEUGEOT
  'VF3': { manufacturer: 'Peugeot SA', brand: 'Peugeot', country: 'France' },

  // VOLVO
  'YV1': { manufacturer: 'Volvo Cars', brand: 'Volvo', country: 'Sweden' },
  'YV4': { manufacturer: 'Volvo Cars', brand: 'Volvo', country: 'Sweden' },
  'LVY': { manufacturer: 'Volvo Cars China', brand: 'Volvo', country: 'China' },

  // GEELY (owner of Proton and Volvo)
  'L6T': { manufacturer: 'Geely Auto', brand: 'Geely', country: 'China' },

  // ASEAN-ASSEMBLY WMIs (Expanded Coverage for Malaysian Workshops)
  'MA1': { manufacturer: 'Mahindra India', brand: 'Mahindra', country: 'India' },
  'MA3': { manufacturer: 'Mahindra India', brand: 'Mahindra', country: 'India' },
  'MA6': { manufacturer: 'Mahindra India', brand: 'Mahindra', country: 'India' },
  'MBJ': { manufacturer: 'Mitsubishi Thailand', brand: 'Mitsubishi', country: 'Thailand' },
  'MRH': { manufacturer: 'Honda Thailand', brand: 'Honda', country: 'Thailand' },
  'MNB': { manufacturer: 'Ford Thailand', brand: 'Ford', country: 'Thailand' },
  'MMA': { manufacturer: 'Mitsubishi Thailand', brand: 'Mitsubishi', country: 'Thailand' },
  'MMB': { manufacturer: 'Mitsubishi Thailand', brand: 'Mitsubishi', country: 'Thailand' },
  'MMT': { manufacturer: 'Mitsubishi Thailand', brand: 'Mitsubishi', country: 'Thailand' },
  'MHR': { manufacturer: 'Honda Indonesia', brand: 'Honda', country: 'Indonesia' },
  'MHB': { manufacturer: 'Honda Indonesia', brand: 'Honda', country: 'Indonesia' },
  'MHK': { manufacturer: 'Honda Malaysia', brand: 'Honda', country: 'Malaysia' },
  'MCL': { manufacturer: 'Hyundai Indonesia', brand: 'Hyundai', country: 'Indonesia' },
  'ML3': { manufacturer: 'Mazda Thailand', brand: 'Mazda', country: 'Thailand' },
  'MNT': { manufacturer: 'Nissan Thailand', brand: 'Nissan', country: 'Thailand' },
  'MNM': { manufacturer: 'Nissan Thailand', brand: 'Nissan', country: 'Thailand' },
  'MS0': { manufacturer: 'Suzuki Thailand', brand: 'Suzuki', country: 'Thailand' },
  'MSU': { manufacturer: 'Suzuki Thailand', brand: 'Suzuki', country: 'Thailand' },
  'MPA': { manufacturer: 'Isuzu Philippines', brand: 'Isuzu', country: 'Philippines' },
  'MR1': { manufacturer: 'Toyota Thailand', brand: 'Toyota', country: 'Thailand' },
  'MR2': { manufacturer: 'Toyota Thailand', brand: 'Toyota', country: 'Thailand' },
  'MRA': { manufacturer: 'Toyota Indonesia', brand: 'Toyota', country: 'Indonesia' },
  'MRZ': { manufacturer: 'Honda Thailand', brand: 'Honda', country: 'Thailand' },
  'MBR': { manufacturer: 'BMW Thailand', brand: 'BMW', country: 'Thailand' },
  'MNE': { manufacturer: 'Nissan Malaysia', brand: 'Nissan', country: 'Malaysia' },
  'MNA': { manufacturer: 'Nissan Thailand', brand: 'Nissan', country: 'Thailand' },
  'MP9': { manufacturer: 'Isuzu Thailand', brand: 'Isuzu', country: 'Thailand' },
  'MP3': { manufacturer: 'Isuzu Thailand', brand: 'Isuzu', country: 'Thailand' },
  'MLP': { manufacturer: 'Isuzu Philippines', brand: 'Isuzu', country: 'Philippines' },
  'MFG': { manufacturer: 'Ford Thailand', brand: 'Ford', country: 'Thailand' },
  'MFE': { manufacturer: 'Ford Philippines', brand: 'Ford', country: 'Philippines' },
  'MVM': { manufacturer: 'Volkswagen Thailand', brand: 'Volkswagen', country: 'Thailand' },
  'MYX': { manufacturer: 'Hyundai Thailand', brand: 'Hyundai', country: 'Thailand' },
  'MKT': { manufacturer: 'Kia Thailand', brand: 'Kia', country: 'Thailand' },
  'MLB': { manufacturer: 'Lamborghini Thailand', brand: 'Lamborghini', country: 'Thailand' },
  'MMR': { manufacturer: 'Mercedes-Benz Thailand', brand: 'Mercedes-Benz', country: 'Thailand' },
  'MMC': { manufacturer: 'Mercedes-Benz Indonesia', brand: 'Mercedes-Benz', country: 'Indonesia' },
  'MPF': { manufacturer: 'Peugeot Malaysia', brand: 'Peugeot', country: 'Malaysia' },
  'MKL': { manufacturer: 'Kia Malaysia', brand: 'Kia', country: 'Malaysia' },
  'MC9': { manufacturer: 'Chevrolet Thailand', brand: 'Chevrolet', country: 'Thailand' },
  'MSM': { manufacturer: 'Suzuki Malaysia', brand: 'Suzuki', country: 'Malaysia' },
  'MTH': { manufacturer: 'Thairung Thailand', brand: 'Thairung', country: 'Thailand' },
  'MTF': { manufacturer: 'Tan Chong Motor Thailand', brand: 'Nissan', country: 'Thailand' },
  'MDM': { manufacturer: 'DRB-HICOM', brand: 'Proton', country: 'Malaysia' },
  'ML0': { manufacturer: 'Renault Thailand', brand: 'Renault', country: 'Thailand' },
  'MC0': { manufacturer: 'Changan Thailand', brand: 'Changan', country: 'Thailand' },
  'ML6': { manufacturer: 'MG Motor Thailand', brand: 'MG', country: 'Thailand' },
  'ML1': { manufacturer: 'MG Motor Thailand', brand: 'MG', country: 'Thailand' },
  'MG1': { manufacturer: 'GWM Thailand', brand: 'Haval', country: 'Thailand' },
  'MBB': { manufacturer: 'BYD Thailand', brand: 'BYD', country: 'Thailand' },

  // CHERY
  'LVV': { manufacturer: 'Chery Automobile', brand: 'Chery', country: 'China' },
  'L6Y': { manufacturer: 'Chery Automobile', brand: 'Chery', country: 'China' },

  // GWM (Haval)
  'LGW': { manufacturer: 'Great Wall Motor', brand: 'Haval', country: 'China' },
  'LGX': { manufacturer: 'Great Wall Motor', brand: 'Haval', country: 'China' },
  'LZW': { manufacturer: 'Great Wall Motor', brand: 'ORA', country: 'China' },

  // BYD (Electric Vehicles)
  'LFP': { manufacturer: 'BYD Auto', brand: 'BYD', country: 'China' },
  'LGB': { manufacturer: 'BYD Auto', brand: 'BYD', country: 'China' },
  'LYB': { manufacturer: 'BYD Auto', brand: 'BYD', country: 'China' },

  // TESLA
  '5YJ': { manufacturer: 'Tesla Inc', brand: 'Tesla', country: 'USA' },
  '7SA': { manufacturer: 'Tesla Inc (Germany)', brand: 'Tesla', country: 'Germany' },
  'LRW': { manufacturer: 'Tesla Inc (China)', brand: 'Tesla', country: 'China' },

  // RIVIAN
  '7FD': { manufacturer: 'Rivian Automotive', brand: 'Rivian', country: 'USA' },

  // LUCID
  '5YH': { manufacturer: 'Lucid Motors', brand: 'Lucid', country: 'USA' },

  // NIO
  'L1N': { manufacturer: 'NIO Auto', brand: 'NIO', country: 'China' },
  'LNP': { manufacturer: 'NIO Auto', brand: 'NIO', country: 'China' },

  // XPENG
  'LXV': { manufacturer: 'XPeng Motors', brand: 'XPeng', country: 'China' },

  // POLESTAR
  'LPS': { manufacturer: 'Polestar (Volvo)', brand: 'Polestar', country: 'China' },
  'YV2': { manufacturer: 'Polestar (Volvo)', brand: 'Polestar', country: 'Sweden' },
};

// Model year encoding
const YEAR_CODES: Record<string, number> = {
  'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
  'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
  'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
  'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
  'Y': 2030,
  // Digit codes: 30-year cycle. 1-9 maps to 2001-2009 (or 2031-2039).
  // We use a heuristic: if the resulting year is >currentYear+1, subtract 30.
  '1': 2001, '2': 2002, '3': 2003, '4': 2004,
  '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009,
};

// Check digit weights for VIN validation
const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
const VIN_TRANSLITERATION: Record<string, number> = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
  'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
};

export class VINDecoderService {
  
  // Validate VIN format and check digit
  validateVIN(vin: string): { isValid: boolean; checkDigitValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const upperVin = vin.toUpperCase();

    // Invalid characters check (I, O, Q not allowed) — check BEFORE cleaning
    if (/[IOQ]/.test(upperVin)) {
      errors.push('Contains invalid characters (I, O, or Q)');
    }

    const cleanVIN = upperVin.replace(/[^A-HJ-NPR-Z0-9]/g, '');

    // Length check
    if (cleanVIN.length !== 17) {
      errors.push(`Invalid length: ${cleanVIN.length} (expected 17)`);
    }

    // Check digit validation (position 9)
    // Note: Check digit is mandatory for North American VINs only.
    // Non-NA VINs (EU, JP, ASEAN) may have any character at position 9.
    const checkDigitValid = this.validateCheckDigit(cleanVIN);
    const isNorthAmerican = cleanVIN.length >= 1 && '12345'.includes(cleanVIN[0]);

    if (!checkDigitValid && isNorthAmerican) {
      errors.push('Check digit validation failed');
    }

    return {
      isValid: errors.length === 0,
      checkDigitValid,
      errors
    };
  }

  private validateCheckDigit(vin: string): boolean {
    if (vin.length !== 17) return false;

    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = vin[i];
      const value = VIN_TRANSLITERATION[char];
      if (value === undefined) return false;
      sum += value * VIN_WEIGHTS[i];
    }

    const remainder = sum % 11;
    const checkDigit = remainder === 10 ? 'X' : remainder.toString();
    
    return vin[8] === checkDigit;
  }

  // Decode VIN to vehicle information
  decode(vin: string): VINData {
    const cleanVIN = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    const validation = this.validateVIN(cleanVIN);

    if (!validation.isValid) {
      return {
        vin: cleanVIN,
        isValid: false,
        checkDigitValid: validation.checkDigitValid,
        decoded: null
      };
    }

    const decoded = this.decodeVIN(cleanVIN);

    return {
      vin: cleanVIN,
      isValid: true,
      checkDigitValid: validation.checkDigitValid,
      decoded
    };
  }

  private decodeVIN(vin: string): VINDecoded {
    const wmi = vin.substring(0, 3);
    const vds = vin.substring(3, 9);
    const vis = vin.substring(9, 17);
    
    let wmiInfo = this.lookupWMI(wmi);
    const modelYear = this.decodeModelYear(vin[9]);
    const plantCode = vin[10];
    const serialNumber = vin.substring(11, 17);

    // Determine market region
    const marketRegion = this.determineMarketRegion(vin);

    // SPECIAL CASE: Proton vehicles manufactured by Perodua
    // Perodua (PL1) manufactures Proton Saga/Persona/Iriz at their Rawang plant
    // VDS codes BL/BM=Saga, BT=Persona, BV/BW=Iriz indicate Proton-branded vehicles
    const vdsPrefix = vds.substring(0, 2);
    const protonVdsCodes = ['BL', 'BM', 'BT', 'BV', 'BW', 'BY', 'CK', 'CL'];
    if (wmi === 'PL1' && protonVdsCodes.includes(vdsPrefix)) {
      // This is a Proton vehicle manufactured by Perodua
      wmiInfo = {
        manufacturer: 'Perodua (for Proton)',
        brand: 'Proton',
        country: 'Malaysia'
      };
    }

    // Try to decode model/engine from VDS (manufacturer-specific)
    const modelInfo = this.decodeModelInfo(wmiInfo.brand, vds);

    return {
      manufacturer: wmiInfo.manufacturer,
      manufacturerCode: wmi,
      brand: wmiInfo.brand,
      model: modelInfo.model,
      modelYear,
      engineCode: modelInfo.engineCode,
      engineType: modelInfo.engineType,
      engineDisplacement: modelInfo.displacement,
      transmissionType: modelInfo.transmission,
      driveType: modelInfo.driveType,
      bodyStyle: modelInfo.bodyStyle,
      fuelType: modelInfo.fuelType,
      emissionStandard: this.determineEmissionStandard(modelYear, marketRegion),
      marketRegion,
      plantCountry: wmiInfo.country,
      plantCity: this.getPlantCity(wmiInfo.brand, plantCode),
      serialNumber
    };
  }

  private lookupWMI(wmi: string): { manufacturer: string; brand: string; country: string } {
    return WMI_DATABASE[wmi] || {
      manufacturer: 'Unknown Manufacturer',
      brand: 'Unknown',
      country: 'Unknown'
    };
  }

  private decodeModelYear(code: string): number {
    const year = YEAR_CODES[code];
    if (!year) return new Date().getFullYear(); // fallback to current year
    // For digit codes, the 30-year cycle means 2001-2009 and 2031-2039 share codes.
    // If decoded year is in the future (>currentYear+1), it's likely the older cycle.
    const currentYear = new Date().getFullYear();
    if (year > currentYear + 1) return year - 30;
    return year;
  }

  private determineMarketRegion(vin: string): 'JP' | 'EU' | 'US' | 'MY' | 'ASEAN' | 'CN' | 'OTHER' {
    const firstChar = vin[0];
    
    if ('12345'.includes(firstChar)) return 'US';
    if ('J'.includes(firstChar)) return 'JP';
    if ('STUVWXYZ'.includes(firstChar)) return 'EU';
    if ('L'.includes(firstChar)) return 'CN';
    // Malaysian manufacturers (Proton PM*, Perodua PL*)
    if (firstChar === 'P') {
      const wmi2 = vin.substring(0, 2);
      if (wmi2 === 'PM' || wmi2 === 'PL') return 'MY';
      return 'ASEAN';
    }
    if (firstChar === 'M') return 'ASEAN';
    
    return 'OTHER';
  }

  private decodeModelInfo(brand: string, vds: string): {
    model: string;
    engineCode: string;
    engineType: string;
    displacement: string;
    transmission: 'AUTOMATIC' | 'MANUAL' | 'CVT' | 'DCT' | 'UNKNOWN';
    driveType: 'FWD' | 'RWD' | 'AWD' | '4WD' | 'UNKNOWN';
    bodyStyle: string;
    fuelType: 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'PLUGIN_HYBRID' | 'UNKNOWN';
  } {
    // Brand-specific VDS decode tables (positions 4-9 of VIN)
    // VDS encoding is manufacturer-specific; we use the first 2-3 characters
    // to identify model/body, remaining for engine/transmission.
    const vds1 = vds[0]; // typically body/model
    const vds2 = vds[1]; // typically engine/restraint
    const vds3 = vds[2]; // typically transmission/drive
    const vdsPrefix = vds.substring(0, 2);

    const brandLower = brand.toLowerCase();

    // ---- TOYOTA ----
    if (brandLower === 'toyota') {
      const toyotaModels: Record<string, { model: string; body: string }> = {
        'BU': { model: 'Vios', body: 'Sedan' },
        'BA': { model: 'Yaris', body: 'Hatchback' },
        'BF': { model: 'Corolla Altis', body: 'Sedan' },
        'BK': { model: 'Camry', body: 'Sedan' },
        'BH': { model: 'RAV4', body: 'SUV' },
        'HK': { model: 'Camry', body: 'Sedan' },
        'HP': { model: 'Prius', body: 'Hatchback' },
        'HU': { model: 'Fortuner', body: 'SUV' },
        'GR': { model: 'Hilux', body: 'Pickup' },
        'GS': { model: 'Hilux', body: 'Pickup' },
        'DH': { model: 'Corolla Cross', body: 'SUV' },
        'DJ': { model: 'Corolla Cross Hybrid', body: 'SUV' },
        'FH': { model: 'Rush', body: 'SUV' },
        'FJ': { model: 'Avanza', body: 'MPV' },
        'HR': { model: 'Land Cruiser', body: 'SUV' },
        'HV': { model: 'Innova', body: 'MPV' },
        'KE': { model: 'Veloz', body: 'MPV' },
        'ZA': { model: 'Yaris Cross', body: 'SUV' },
      };
      const match = toyotaModels[vdsPrefix];
      const engineMap: Record<string, { code: string; type: string; disp: string }> = {
        'A': { code: '2NR-FE', type: 'Inline-4 DOHC', disp: '1.5L' },
        'B': { code: '1NR-VE', type: 'Inline-4 DOHC', disp: '1.3L' },
        'C': { code: '2ZR-FE', type: 'Inline-4 DOHC VVT-i', disp: '1.8L' },
        'D': { code: '2AR-FE', type: 'Inline-4 DOHC VVT-i', disp: '2.5L' },
        'E': { code: '2GR-FE', type: 'V6 DOHC VVT-i', disp: '3.5L' },
        'F': { code: '1GD-FTV', type: 'Inline-4 Diesel Turbo', disp: '2.8L' },
        'G': { code: '2GD-FTV', type: 'Inline-4 Diesel Turbo', disp: '2.4L' },
        'K': { code: '2ZR-FXE', type: 'Inline-4 Atkinson', disp: '1.8L' },
      };
      const eng = engineMap[vds2] || { code: vds.substring(0, 3), type: 'Inline-4', disp: '1.5L' };
      const transMap: Record<string, 'CVT' | 'AUTOMATIC' | 'MANUAL'> = {
        'A': 'CVT', 'B': 'AUTOMATIC', 'C': 'MANUAL', 'E': 'CVT',
      };
      // Derive drive type from model
      const driveType = (match?.model === 'Hilux' || match?.model === 'Fortuner') ? '4WD' as const : 
                         match?.model === 'RAV4' ? 'AWD' as const : 'FWD' as const;
      return {
        model: match?.model || 'Toyota Vehicle',
        engineCode: eng.code,
        engineType: eng.type,
        displacement: eng.disp,
        transmission: transMap[vds3] || 'AUTOMATIC',
        driveType,
        bodyStyle: match?.body || 'Sedan',
        fuelType: vds2 === 'F' || vds2 === 'G' ? 'DIESEL' : vds2 === 'K' ? 'HYBRID' : 'PETROL',
      };
    }

    // ---- HONDA ----
    if (brandLower === 'honda') {
      const hondaModels: Record<string, { model: string; body: string }> = {
        'GM': { model: 'City', body: 'Sedan' },
        'GN': { model: 'Jazz', body: 'Hatchback' },
        'FC': { model: 'Civic', body: 'Sedan' },
        'FK': { model: 'Civic', body: 'Hatchback' },
        'RW': { model: 'CR-V', body: 'SUV' },
        'RU': { model: 'HR-V', body: 'SUV' },
        'GK': { model: 'Jazz', body: 'Hatchback' },
      };
      const match = hondaModels[vdsPrefix];
      return {
        model: match?.model || 'Honda Vehicle',
        engineCode: match?.model === 'Civic' ? 'L15B7' : 'L15B',
        engineType: 'Inline-4 DOHC i-VTEC',
        displacement: '1.5L',
        transmission: 'CVT',
        driveType: 'FWD',
        bodyStyle: match?.body || 'Sedan',
        fuelType: 'PETROL',
      };
    }

    // ---- PERODUA ----
    if (brandLower === 'perodua') {
      const peroduaModels: Record<string, { model: string; body: string; engine: string; disp: string; trans: 'CVT' | 'AUTOMATIC' }> = {
        'S9': { model: 'Myvi', body: 'Hatchback', engine: '2NR-VE', disp: '1.5L', trans: 'CVT' },
        'S1': { model: 'Myvi', body: 'Hatchback', engine: '1NR-VE', disp: '1.3L', trans: 'AUTOMATIC' },
        'S5': { model: 'Axia', body: 'Hatchback', engine: '1KR-VE', disp: '1.0L', trans: 'AUTOMATIC' },
        'S6': { model: 'Axia', body: 'Hatchback', engine: '3NR-VE', disp: '1.2L', trans: 'CVT' },
        'D4': { model: 'Bezza', body: 'Sedan', engine: '1KR-VE', disp: '1.0L', trans: 'AUTOMATIC' },
        'D5': { model: 'Bezza', body: 'Sedan', engine: '1NR-VE', disp: '1.3L', trans: 'CVT' },
        'A1': { model: 'Alza', body: 'MPV', engine: '2NR-VE', disp: '1.5L', trans: 'CVT' },
        'A2': { model: 'Ativa', body: 'SUV', engine: '1KR-VET', disp: '1.0L Turbo', trans: 'CVT' },
      };
      const match = peroduaModels[vdsPrefix];
      return {
        model: match?.model || 'Perodua Vehicle',
        engineCode: match?.engine || vds.substring(0, 3),
        engineType: 'Inline-3/4 DOHC',
        displacement: match?.disp || '1.3L',
        transmission: match?.trans || 'CVT',
        driveType: 'FWD',
        bodyStyle: match?.body || 'Hatchback',
        fuelType: 'PETROL',
      };
    }

    // ---- PROTON ----
    if (brandLower === 'proton') {
      const protonModels: Record<string, { model: string; body: string; engine: string; disp: string; trans: 'CVT' | 'AUTOMATIC' | 'DCT' | 'MANUAL' }> = {
        // Saga models (includes Perodua-manufactured variants)
        'BL': { model: 'Saga', body: 'Sedan', engine: '1.3L VVT', disp: '1.3L', trans: 'AUTOMATIC' },
        'BM': { model: 'Saga', body: 'Sedan', engine: '1.3L VVT', disp: '1.3L', trans: 'MANUAL' },
        'BS': { model: 'Saga', body: 'Sedan', engine: '1.3L VVT', disp: '1.3L', trans: 'CVT' },
        // Persona models
        'BT': { model: 'Persona', body: 'Sedan', engine: '1.6L VVT', disp: '1.6L', trans: 'CVT' },
        'BU': { model: 'Persona', body: 'Sedan', engine: '1.6L VVT', disp: '1.6L', trans: 'MANUAL' },
        // Iriz models
        'BV': { model: 'Iriz', body: 'Hatchback', engine: '1.3L VVT', disp: '1.3L', trans: 'CVT' },
        'BW': { model: 'Iriz', body: 'Hatchback', engine: '1.6L VVT', disp: '1.6L', trans: 'CVT' },
        // SUV models
        'BY': { model: 'X50', body: 'SUV', engine: '1.5 TGDi', disp: '1.5L Turbo', trans: 'DCT' },
        'CK': { model: 'X70', body: 'SUV', engine: '1.8 TGDi', disp: '1.8L Turbo', trans: 'AUTOMATIC' },
        'CL': { model: 'X90', body: 'SUV', engine: '1.5 TGDi', disp: '1.5L Turbo', trans: 'DCT' },
      };
      
      // Check for Saga special case: Perodua-manufactured Saga uses 'BT' VDS prefix
      // Distinguished from Persona by 3rd character (Saga='3', Persona='5' typically)
      if (vdsPrefix === 'BT' && vds[2] === '3') {
        return {
          model: 'Saga',
          engineCode: '1.3L VVT',
          engineType: 'Inline-4 VVT',
          displacement: '1.3L',
          transmission: 'AUTOMATIC',
          driveType: 'FWD',
          bodyStyle: 'Sedan',
          fuelType: 'PETROL',
        };
      }
      
      const match = protonModels[vdsPrefix];
      return {
        model: match?.model || 'Proton Vehicle',
        engineCode: match?.engine || vds.substring(0, 3),
        engineType: match?.disp.includes('Turbo') ? 'Inline-3/4 Turbo' : 'Inline-4 VVT',
        displacement: match?.disp || '1.5L',
        transmission: match?.trans || 'AUTOMATIC',
        driveType: 'FWD',
        bodyStyle: match?.body || 'Sedan',
        fuelType: 'PETROL',
      };
    }

    // ---- NISSAN ----
    if (brandLower === 'nissan') {
      const nissanModels: Record<string, { model: string; body: string }> = {
        'AA': { model: 'Almera', body: 'Sedan' },
        'JA': { model: 'X-Trail', body: 'SUV' },
        'JN': { model: 'Navara', body: 'Pickup' },
        'DD': { model: 'Serena', body: 'MPV' },
        'GN': { model: 'Kicks', body: 'SUV' },
        'HN': { model: 'Almera Turbo', body: 'Sedan' },
        'UA': { model: 'Leaf', body: 'Hatchback' },
        'J1': { model: 'Note', body: 'Hatchback' },
      };
      const match = nissanModels[vdsPrefix];
      return {
        model: match?.model || 'Nissan Vehicle',
        engineCode: match?.model === 'Almera' ? 'HR10DET' : 'QR25DE',
        engineType: match?.model === 'Almera' ? 'Inline-3 Turbo' : 'Inline-4',
        displacement: match?.model === 'Almera' ? '1.0L Turbo' : '2.5L',
        transmission: 'CVT',
        driveType: 'FWD',
        bodyStyle: match?.body || 'Sedan',
        fuelType: 'PETROL',
      };
    }

    // ---- MAZDA ----
    if (brandLower === 'mazda') {
      const mazdaModels: Record<string, { model: string; body: string; engine: string; disp: string }> = {
        'D': { model: 'Mazda 2', body: 'Hatchback', engine: 'SkyActiv-G 1.5', disp: '1.5L' },
        'B': { model: 'Mazda 3', body: 'Sedan', engine: 'SkyActiv-G 2.0', disp: '2.0L' },
        'G': { model: 'Mazda 6', body: 'Sedan', engine: 'SkyActiv-G 2.5', disp: '2.5L' },
        'K': { model: 'CX-5', body: 'SUV', engine: 'SkyActiv-G 2.5', disp: '2.5L' },
        'N': { model: 'CX-3', body: 'SUV', engine: 'SkyActiv-G 2.0', disp: '2.0L' },
        'L': { model: 'CX-30', body: 'SUV', engine: 'SkyActiv-G 2.0', disp: '2.0L' },
        'M': { model: 'CX-8', body: 'SUV', engine: 'SkyActiv-G 2.5T', disp: '2.5L Turbo' },
        'T': { model: 'BT-50', body: 'Pickup', engine: '3.0 Diesel', disp: '3.0L Diesel' },
        'H': { model: 'CX-9', body: 'SUV', engine: 'SkyActiv-G 2.5T', disp: '2.5L Turbo' },
      };
      const match = mazdaModels[vds1];
      return {
        model: match?.model || 'Mazda Vehicle',
        engineCode: match?.engine || 'SkyActiv-G 2.0',
        engineType: match?.disp?.includes('Diesel') ? 'Inline-4 SkyActiv-D Diesel' : 'Inline-4 SkyActiv',
        displacement: match?.disp || '2.0L',
        transmission: 'AUTOMATIC',
        driveType: match?.body === 'Pickup' ? '4WD' : 'FWD',
        bodyStyle: match?.body || 'Sedan',
        fuelType: match?.disp?.includes('Diesel') ? 'DIESEL' : 'PETROL',
      };
    }

    // ---- BMW ----
    if (brandLower === 'bmw' || brandLower === 'bmw m' || brandLower === 'bmw i') {
      const bmwModels: Record<string, { model: string; body: string }> = {
        '3': { model: '3 Series', body: 'Sedan' },
        'A': { model: '3 Series', body: 'Sedan' },
        '5': { model: '5 Series', body: 'Sedan' },
        'J': { model: '5 Series', body: 'Sedan' },
        '1': { model: '1 Series', body: 'Hatchback' },
        'F': { model: '1 Series', body: 'Hatchback' },
        'R': { model: 'X1', body: 'SUV' },
        'L': { model: 'X3', body: 'SUV' },
        'P': { model: 'X5', body: 'SUV' },
        '2': { model: '2 Series', body: 'Sedan' },
        '7': { model: '7 Series', body: 'Sedan' },
      };
      const match = bmwModels[vds1];
      return {
        model: match?.model || 'BMW Vehicle',
        engineCode: 'B48',
        engineType: 'Inline-4 TwinPower Turbo',
        displacement: '2.0L Turbo',
        transmission: 'AUTOMATIC',
        driveType: match?.body === 'SUV' ? 'AWD' : 'RWD',
        bodyStyle: match?.body || 'Sedan',
        fuelType: 'PETROL',
      };
    }

    // ---- MERCEDES-BENZ ----
    if (brandLower === 'mercedes-benz') {
      const mbModels: Record<string, { model: string; body: string }> = {
        '0': { model: 'A-Class', body: 'Hatchback' },
        '1': { model: 'E-Class', body: 'Sedan' },
        '2': { model: 'C-Class', body: 'Sedan' },
        '3': { model: 'GLC', body: 'SUV' },
        '4': { model: 'GLA', body: 'SUV' },
        '5': { model: 'GLB', body: 'SUV' },
        '6': { model: 'GLE', body: 'SUV' },
        '7': { model: 'S-Class', body: 'Sedan' },
        '8': { model: 'CLA', body: 'Sedan' },
      };
      const match = mbModels[vds1];
      return {
        model: match?.model || 'Mercedes Vehicle',
        engineCode: 'M274',
        engineType: 'Inline-4 Turbo',
        displacement: '2.0L Turbo',
        transmission: 'AUTOMATIC',
        driveType: match?.body === 'SUV' ? 'AWD' : 'RWD',
        bodyStyle: match?.body || 'Sedan',
        fuelType: 'PETROL',
      };
    }

    // ---- VOLKSWAGEN ----
    if (brandLower === 'volkswagen') {
      return {
        model: vds1 === 'A' ? 'Golf' : vds1 === '3' ? 'Passat' : 'VW Vehicle',
        engineCode: 'EA211 1.4 TSI',
        engineType: 'Inline-4 Turbo',
        displacement: '1.4L Turbo',
        transmission: 'DCT',
        driveType: 'FWD',
        bodyStyle: vds1 === 'A' ? 'Hatchback' : 'Sedan',
        fuelType: 'PETROL',
      };
    }

    // ---- HYUNDAI ----
    if (brandLower === 'hyundai') {
      const hyundaiModels: Record<string, { model: string; body: string; engine: string; disp: string }> = {
        'AL': { model: 'i10', body: 'Hatchback', engine: 'Kappa 1.0', disp: '1.0L' },
        'AD': { model: 'Elantra', body: 'Sedan', engine: 'Nu 2.0', disp: '2.0L' },
        'BD': { model: 'Tucson', body: 'SUV', engine: 'Nu 2.0', disp: '2.0L' },
        'OS': { model: 'Kona', body: 'SUV', engine: 'Gamma 1.6T', disp: '1.6L Turbo' },
        'NE': { model: 'Tucson', body: 'SUV', engine: 'Smartstream 1.6T', disp: '1.6L Turbo' },
        'SU': { model: 'Santa Fe', body: 'SUV', engine: 'Theta II 2.4', disp: '2.4L' },
        'CN': { model: 'Sonata', body: 'Sedan', engine: 'Smartstream 2.5', disp: '2.5L' },
      };
      const match = hyundaiModels[vdsPrefix];
      return {
        model: match?.model || 'Hyundai Vehicle',
        engineCode: match?.engine || vds.substring(0, 3),
        engineType: 'Inline-4',
        displacement: match?.disp || '2.0L',
        transmission: 'AUTOMATIC',
        driveType: 'FWD',
        bodyStyle: match?.body || 'Sedan',
        fuelType: 'PETROL',
      };
    }

    // ---- KIA ----
    if (brandLower === 'kia') {
      const kiaModels: Record<string, { model: string; body: string; engine: string; disp: string }> = {
        'DE': { model: 'Picanto', body: 'Hatchback', engine: 'Kappa 1.0', disp: '1.0L' },
        'BD': { model: 'Cerato', body: 'Sedan', engine: 'Nu 2.0', disp: '2.0L' },
        'QL': { model: 'Sportage', body: 'SUV', engine: 'Nu 2.0', disp: '2.0L' },
        'NQ': { model: 'Sportage', body: 'SUV', engine: 'Smartstream 1.6T', disp: '1.6L Turbo' },
        'JA': { model: 'Seltos', body: 'SUV', engine: 'Smartstream 1.6', disp: '1.6L' },
        'MV': { model: 'Carnival', body: 'MPV', engine: 'Smartstream 2.2D', disp: '2.2L Diesel' },
      };
      const match = kiaModels[vdsPrefix];
      return {
        model: match?.model || 'Kia Vehicle',
        engineCode: match?.engine || vds.substring(0, 3),
        engineType: 'Inline-4',
        displacement: match?.disp || '2.0L',
        transmission: 'AUTOMATIC',
        driveType: 'FWD',
        bodyStyle: match?.body || 'Sedan',
        fuelType: match?.disp?.includes('Diesel') ? 'DIESEL' : 'PETROL',
      };
    }

    // ---- MITSUBISHI ----
    if (brandLower === 'mitsubishi') {
      const mitsuModels: Record<string, { model: string; body: string; engine: string; disp: string }> = {
        'AA': { model: 'Attrage', body: 'Sedan', engine: '3A92', disp: '1.2L' },
        'AX': { model: 'Xpander', body: 'MPV', engine: '4A91', disp: '1.5L' },
        'AY': { model: 'Xpander Cross', body: 'MPV', engine: '4A91', disp: '1.5L' },
        'ZA': { model: 'Outlander', body: 'SUV', engine: '4J11', disp: '2.0L' },
        'ZK': { model: 'Outlander PHEV', body: 'SUV', engine: '4B12+Electric', disp: '2.4L PHEV' },
        'KB': { model: 'Triton', body: 'Pickup', engine: '4N15', disp: '2.4L Diesel Turbo' },
        'KJ': { model: 'Pajero Sport', body: 'SUV', engine: '4N15', disp: '2.4L Diesel Turbo' },
        'GA': { model: 'ASX', body: 'SUV', engine: '4B10', disp: '2.0L' },
      };
      const match = mitsuModels[vdsPrefix];
      return {
        model: match?.model || (vds1 === 'A' ? 'Attrage' : vds1 === 'Z' ? 'Outlander' : 'Mitsubishi Vehicle'),
        engineCode: match?.engine || (vds1 === 'A' ? '3A92' : '4J11'),
        engineType: match?.disp?.includes('Diesel') ? 'Inline-4 Turbo Diesel' : 'Inline-4',
        displacement: match?.disp || (vds1 === 'A' ? '1.2L' : '2.0L'),
        transmission: 'CVT',
        driveType: match?.body === 'Pickup' || match?.model === 'Pajero Sport' ? '4WD' : 'FWD',
        bodyStyle: match?.body || (vds1 === 'Z' ? 'SUV' : 'Sedan'),
        fuelType: match?.disp?.includes('Diesel') ? 'DIESEL' : match?.disp?.includes('PHEV') ? 'PLUGIN_HYBRID' : 'PETROL',
      };
    }

    // ---- SUBARU ----
    if (brandLower === 'subaru') {
      return {
        model: vds1 === 'G' ? 'XV' : vds1 === 'S' ? 'Forester' : 'Subaru Vehicle',
        engineCode: 'FB20',
        engineType: 'Flat-4 Boxer',
        displacement: '2.0L',
        transmission: 'CVT',
        driveType: 'AWD',
        bodyStyle: 'SUV',
        fuelType: 'PETROL',
      };
    }

    // ---- FORD ----
    if (brandLower === 'ford') {
      const fordModels: Record<string, { model: string; body: string; engine: string; disp: string; fuel: 'PETROL' | 'DIESEL' }> = {
        'GZ': { model: 'Ranger', body: 'Pickup', engine: '2.0 EcoBlue', disp: '2.0L Turbo Diesel', fuel: 'DIESEL' },
        'CJ': { model: 'Ranger', body: 'Pickup', engine: '3.2 Duratorq', disp: '3.2L Diesel', fuel: 'DIESEL' },
        'FP': { model: 'Focus', body: 'Hatchback', engine: '1.5 EcoBoost', disp: '1.5L Turbo', fuel: 'PETROL' },
        'RM': { model: 'Everest', body: 'SUV', engine: '2.0 EcoBlue', disp: '2.0L Turbo Diesel', fuel: 'DIESEL' },
      };
      const match = fordModels[vdsPrefix];
      return {
        model: match?.model || 'Ford Vehicle',
        engineCode: match?.engine || vds.substring(0, 3),
        engineType: match?.fuel === 'DIESEL' ? 'Inline-4 Turbo Diesel' : 'Inline-4 Turbo',
        displacement: match?.disp || '2.0L',
        transmission: 'AUTOMATIC',
        driveType: match?.body === 'Pickup' || match?.body === 'SUV' ? '4WD' : 'FWD',
        bodyStyle: match?.body || 'Sedan',
        fuelType: match?.fuel || 'PETROL',
      };
    }

    // ---- LEXUS ----
    if (brandLower === 'lexus') {
      const lexusModels: Record<string, { model: string; body: string; engine: string; disp: string }> = {
        'AZ': { model: 'NX 300', body: 'SUV', engine: '8AR-FTS', disp: '2.0L Turbo' },
        'AA': { model: 'UX 200', body: 'SUV', engine: 'M20A-FKS', disp: '2.0L' },
        'BE': { model: 'IS 300', body: 'Sedan', engine: '8AR-FTS', disp: '2.0L Turbo' },
        'BF': { model: 'ES 300h', body: 'Sedan', engine: 'A25A-FXS', disp: '2.5L Hybrid' },
        'BK': { model: 'RX 350', body: 'SUV', engine: '2GR-FKS', disp: '3.5L V6' },
      };
      const match = lexusModels[vdsPrefix];
      return {
        model: match?.model || 'Lexus Vehicle',
        engineCode: match?.engine || vds.substring(0, 3),
        engineType: match?.disp?.includes('V6') ? 'V6 DOHC' : 'Inline-4 DOHC',
        displacement: match?.disp || '2.0L',
        transmission: 'AUTOMATIC',
        driveType: 'FWD',
        bodyStyle: match?.body || 'Sedan',
        fuelType: match?.disp?.includes('Hybrid') ? 'HYBRID' : 'PETROL',
      };
    }

    // ---- SUZUKI ----
    if (brandLower === 'suzuki') {
      const suzukiModels: Record<string, { model: string; body: string; engine: string; disp: string }> = {
        'FK': { model: 'Swift', body: 'Hatchback', engine: 'K12C', disp: '1.2L' },
        'MA': { model: 'Ertiga', body: 'MPV', engine: 'K15B', disp: '1.5L' },
        'RA': { model: 'Vitara', body: 'SUV', engine: 'K14C-DITC', disp: '1.4L Turbo' },
      };
      const match = suzukiModels[vdsPrefix];
      return {
        model: match?.model || 'Suzuki Vehicle',
        engineCode: match?.engine || vds.substring(0, 3),
        engineType: 'Inline-4 DOHC',
        displacement: match?.disp || '1.5L',
        transmission: 'AUTOMATIC',
        driveType: 'FWD',
        bodyStyle: match?.body || 'Hatchback',
        fuelType: 'PETROL',
      };
    }

    // ---- ISUZU ----
    if (brandLower === 'isuzu') {
      return {
        model: vds1 === 'T' ? 'D-Max' : vds1 === 'U' ? 'MU-X' : 'Isuzu Vehicle',
        engineCode: '4JJ3-TCX',
        engineType: 'Inline-4 Turbo Diesel',
        displacement: '3.0L Diesel',
        transmission: 'AUTOMATIC',
        driveType: '4WD',
        bodyStyle: vds1 === 'T' ? 'Pickup' : 'SUV',
        fuelType: 'DIESEL',
      };
    }

    // ---- MINI ----
    if (brandLower === 'mini') {
      return {
        model: vds1 === 'X' || vds1 === 'W' ? 'Cooper S' : 'Cooper',
        engineCode: 'B48A20',
        engineType: 'Inline-4 TwinPower Turbo',
        displacement: '2.0L Turbo',
        transmission: 'AUTOMATIC',
        driveType: 'FWD',
        bodyStyle: 'Hatchback',
        fuelType: 'PETROL',
      };
    }

    // ---- PORSCHE ----
    if (brandLower === 'porsche') {
      return {
        model: vds1 === '9' ? 'Macan' : vds1 === 'Y' ? 'Cayenne' : 'Porsche Vehicle',
        engineCode: vds.substring(0, 3),
        engineType: 'Inline-4 Turbo',
        displacement: '2.0L Turbo',
        transmission: 'DCT',
        driveType: 'AWD',
        bodyStyle: 'SUV',
        fuelType: 'PETROL',
      };
    }

    // ---- PEUGEOT ----
    if (brandLower === 'peugeot') {
      return {
        model: vds1 === 'M' ? '3008' : vds1 === 'N' ? '5008' : vds1 === 'H' ? '2008' : 'Peugeot Vehicle',
        engineCode: 'PureTech 1.6',
        engineType: 'Inline-4 Turbo',
        displacement: '1.6L Turbo',
        transmission: 'AUTOMATIC',
        driveType: 'FWD',
        bodyStyle: 'SUV',
        fuelType: 'PETROL',
      };
    }

    // ---- VOLVO ----
    if (brandLower === 'volvo') {
      const volvoModels: Record<string, { model: string; body: string; engine: string; disp: string; fuel: 'PETROL' | 'DIESEL' | 'HYBRID' | 'PLUGIN_HYBRID' }> = {
        'FS': { model: 'S60', body: 'Sedan', engine: 'B4204T30', disp: '2.0L Turbo', fuel: 'PETROL' },
        'FW': { model: 'S90', body: 'Sedan', engine: 'B4204T23', disp: '2.0L Turbo', fuel: 'PETROL' },
        'LF': { model: 'V60', body: 'Wagon', engine: 'B4204T30', disp: '2.0L Turbo', fuel: 'PETROL' },
        'LW': { model: 'V90', body: 'Wagon', engine: 'B4204T23', disp: '2.0L Turbo', fuel: 'PETROL' },
        'XC': { model: 'XC40', body: 'SUV', engine: 'B4204T47', disp: '2.0L Turbo', fuel: 'PETROL' },
        'LZ': { model: 'XC60', body: 'SUV', engine: 'B4204T23', disp: '2.0L Turbo', fuel: 'PETROL' },
        'LC': { model: 'XC90', body: 'SUV', engine: 'B4204T35', disp: '2.0L Twin-Charged', fuel: 'PLUGIN_HYBRID' },
      };
      const match = volvoModels[vdsPrefix];
      return {
        model: match?.model || 'Volvo Vehicle',
        engineCode: match?.engine || vds.substring(0, 3),
        engineType: 'Inline-4 Turbo (Drive-E)',
        displacement: match?.disp || '2.0L Turbo',
        transmission: 'AUTOMATIC',
        driveType: match?.model === 'XC90' || match?.model === 'V90' ? 'AWD' : 'FWD',
        bodyStyle: match?.body || 'Sedan',
        fuelType: match?.fuel || 'PETROL',
      };
    }

    // Fallback — use VDS raw data, no hardcoded values
    return {
      model: `${brand} Vehicle`,
      engineCode: vds.substring(0, 3),
      engineType: 'Unknown',
      displacement: 'Unknown',
      transmission: 'UNKNOWN',
      driveType: 'UNKNOWN',
      bodyStyle: 'Unknown',
      fuelType: 'UNKNOWN'
    };
  }

  private determineEmissionStandard(year: number, region: string): string {
    if (region === 'EU') {
      if (year >= 2025) return 'Euro 7';
      if (year >= 2020) return 'Euro 6d';
      if (year >= 2015) return 'Euro 6';
      return 'Euro 5 or earlier';
    }
    
    if (region === 'US') {
      if (year >= 2025) return 'EPA Tier 3';
      if (year >= 2017) return 'EPA Tier 3';
      return 'EPA Tier 2';
    }

    if (region === 'ASEAN' || region === 'MY') {
      if (year >= 2023) return 'Euro 4M';
      return 'Euro 2M/Euro 3';
    }

    return 'Unknown';
  }

  private getPlantCity(brand: string, code: string): string {
    // Simplified plant code lookup
    const plants: Record<string, Record<string, string>> = {
      'Toyota': {
        'A': 'Toyota City, Japan',
        'B': 'Tahara, Japan', 
        'C': 'Georgetown, USA',
        'D': 'Tsutsumi, Japan',
        'T': 'Chachoengsao, Thailand'
      },
      'Honda': {
        'A': 'Marysville, USA',
        'C': 'Alliston, Canada',
        'H': 'Saitama, Japan'
      }
    };

    return plants[brand]?.[code] || `Plant ${code}`;
  }
}

// Singleton instance
export const vinDecoder = new VINDecoderService();

export function decodeVIN(vin: string): VINDecoded | null {
  return vinDecoder.decode(vin).decoded;
}
