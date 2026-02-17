/// VIN decoder service — ported from vin-decoder.service.ts
/// Validates and decodes Vehicle Identification Numbers with
/// brand-specific model/engine/transmission lookup.
/// Includes optional NHTSA vPIC API enrichment for online mode.

import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/diagnostic_types.dart';

// ── WMI Database ──────────────────────────────────────────

class WMIEntry {
  final String manufacturer;
  final String brand;
  final String country;
  const WMIEntry(this.manufacturer, this.brand, this.country);
}

const Map<String, WMIEntry> _wmiDatabase = {
  // ── Japanese ──────────────────────────────────────────
  'JTD': WMIEntry('Toyota', 'Toyota', 'Japan'),
  'JTE': WMIEntry('Toyota', 'Toyota', 'Japan'),
  'JTN': WMIEntry('Toyota', 'Toyota', 'Japan'),
  'JTK': WMIEntry('Toyota', 'Toyota', 'Japan'),
  'JTM': WMIEntry('Toyota', 'Toyota', 'Japan'),
  'JTH': WMIEntry('Lexus', 'Lexus', 'Japan'),
  'JTJ': WMIEntry('Lexus', 'Lexus', 'Japan'),
  'JHM': WMIEntry('Honda', 'Honda', 'Japan'),
  'JHL': WMIEntry('Honda', 'Honda', 'Japan'),
  'JHG': WMIEntry('Honda', 'Honda', 'Japan'),
  'JN1': WMIEntry('Nissan', 'Nissan', 'Japan'),
  'JN3': WMIEntry('Nissan', 'Nissan', 'Japan'),
  'JN6': WMIEntry('Nissan', 'Nissan', 'Japan'),
  'JN8': WMIEntry('Nissan', 'Nissan', 'Japan'),
  'JMZ': WMIEntry('Mazda', 'Mazda', 'Japan'),
  'JM1': WMIEntry('Mazda', 'Mazda', 'Japan'),
  'JM3': WMIEntry('Mazda', 'Mazda', 'Japan'),
  'JA3': WMIEntry('Mitsubishi', 'Mitsubishi', 'Japan'),
  'JA4': WMIEntry('Mitsubishi', 'Mitsubishi', 'Japan'),
  'JMB': WMIEntry('Mitsubishi', 'Mitsubishi', 'Japan'),
  'JMY': WMIEntry('Mitsubishi', 'Mitsubishi', 'Japan'),
  'JF1': WMIEntry('Subaru', 'Subaru', 'Japan'),
  'JF2': WMIEntry('Subaru', 'Subaru', 'Japan'),
  'JS3': WMIEntry('Suzuki', 'Suzuki', 'Japan'),
  'JS2': WMIEntry('Suzuki', 'Suzuki', 'Japan'),
  'JSA': WMIEntry('Suzuki', 'Suzuki', 'Japan'),
  'JDA': WMIEntry('Daihatsu', 'Daihatsu', 'Japan'),
  'JDB': WMIEntry('Daihatsu', 'Daihatsu', 'Japan'),
  'JYA': WMIEntry('Yamaha', 'Yamaha', 'Japan'),
  'JKA': WMIEntry('Kawasaki', 'Kawasaki', 'Japan'),

  // ── German ────────────────────────────────────────────
  'WBA': WMIEntry('BMW', 'BMW', 'Germany'),
  'WBS': WMIEntry('BMW M', 'BMW', 'Germany'),
  'WBY': WMIEntry('BMW', 'BMW', 'Germany'),
  'WDB': WMIEntry('Mercedes-Benz', 'Mercedes-Benz', 'Germany'),
  'WDC': WMIEntry('Mercedes-Benz', 'Mercedes-Benz', 'Germany'),
  'WDD': WMIEntry('Mercedes-Benz', 'Mercedes-Benz', 'Germany'),
  'WDF': WMIEntry('Mercedes-Benz', 'Mercedes-Benz', 'Germany'),
  'WMX': WMIEntry('Mercedes-AMG', 'Mercedes-Benz', 'Germany'),
  'WAU': WMIEntry('Audi', 'Audi', 'Germany'),
  'WAP': WMIEntry('Audi', 'Audi', 'Germany'),
  'WA1': WMIEntry('Audi', 'Audi', 'Germany'),
  'WVW': WMIEntry('Volkswagen', 'Volkswagen', 'Germany'),
  'WV2': WMIEntry('Volkswagen', 'Volkswagen', 'Germany'),
  'WV1': WMIEntry('Volkswagen', 'Volkswagen', 'Germany'),
  'WP0': WMIEntry('Porsche', 'Porsche', 'Germany'),
  'WP1': WMIEntry('Porsche', 'Porsche', 'Germany'),
  'WMW': WMIEntry('Mini', 'Mini', 'Germany'),
  'WF0': WMIEntry('Ford', 'Ford', 'Germany'),

  // ── Korean ────────────────────────────────────────────
  'KNA': WMIEntry('Kia', 'Kia', 'South Korea'),
  'KNB': WMIEntry('Kia', 'Kia', 'South Korea'),
  'KNC': WMIEntry('Kia', 'Kia', 'South Korea'),
  'KND': WMIEntry('Kia', 'Kia', 'South Korea'),
  'KNH': WMIEntry('Kia', 'Kia', 'South Korea'),
  'KMH': WMIEntry('Hyundai', 'Hyundai', 'South Korea'),
  'KME': WMIEntry('Hyundai', 'Hyundai', 'South Korea'),
  'KM8': WMIEntry('Hyundai', 'Hyundai', 'South Korea'),
  'KMJ': WMIEntry('Hyundai', 'Hyundai', 'South Korea'),
  'KPT': WMIEntry('SsangYong', 'SsangYong', 'South Korea'),
  'KPA': WMIEntry('SsangYong', 'SsangYong', 'South Korea'),

  // ── Malaysian ─────────────────────────────────────────
  'PMP': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PMH': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PM0': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PMR': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PMA': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PMB': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PMC': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PMD': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PME': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PMG': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PMJ': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PML': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PM3': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PM2': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PM1': WMIEntry('Proton', 'Proton', 'Malaysia'),
  'PL1': WMIEntry('Perodua', 'Perodua', 'Malaysia'),
  'PMK': WMIEntry('Perodua', 'Perodua', 'Malaysia'),
  'PLA': WMIEntry('Perodua', 'Perodua', 'Malaysia'),

  // ── ASEAN Assembly ────────────────────────────────────
  'MHF': WMIEntry('Toyota Motor Thailand', 'Toyota', 'Thailand'),
  'MHK': WMIEntry('Honda Thailand', 'Honda', 'Thailand'),
  'MNT': WMIEntry('Nissan Thailand', 'Nissan', 'Thailand'),
  'MNA': WMIEntry('Mitsubishi Thailand', 'Mitsubishi', 'Thailand'),
  'MPA': WMIEntry('Isuzu Thailand', 'Isuzu', 'Thailand'),
  'MMT': WMIEntry('Mitsubishi Thailand', 'Mitsubishi', 'Thailand'),
  'MBJ': WMIEntry('Mazda Thailand', 'Mazda', 'Thailand'),
  'MMB': WMIEntry('Mitsubishi Thailand', 'Mitsubishi', 'Thailand'),
  'MHR': WMIEntry('Honda Indonesia', 'Honda', 'Indonesia'),
  'MHG': WMIEntry('Mitsubishi Indonesia', 'Mitsubishi', 'Indonesia'),
  'MHY': WMIEntry('Toyota Indonesia', 'Toyota', 'Indonesia'),
  'MK3': WMIEntry('Suzuki Indonesia', 'Suzuki', 'Indonesia'),
  'MLH': WMIEntry('Honda Philippines', 'Honda', 'Philippines'),
  'MN3': WMIEntry('Ford Thailand', 'Ford', 'Thailand'),
  'MRH': WMIEntry('Honda Vietnam', 'Honda', 'Vietnam'),

  // ── USA ───────────────────────────────────────────────
  '1G1': WMIEntry('Chevrolet', 'Chevrolet', 'USA'),
  '1G2': WMIEntry('Pontiac', 'Pontiac', 'USA'),
  '1GC': WMIEntry('Chevrolet', 'Chevrolet', 'USA'),
  '1GM': WMIEntry('GMC', 'GMC', 'USA'),
  '1GT': WMIEntry('GMC', 'GMC', 'USA'),
  '1FA': WMIEntry('Ford', 'Ford', 'USA'),
  '1FB': WMIEntry('Ford', 'Ford', 'USA'),
  '1FC': WMIEntry('Ford', 'Ford', 'USA'),
  '1FD': WMIEntry('Ford', 'Ford', 'USA'),
  '1FM': WMIEntry('Ford', 'Ford', 'USA'),
  '1FT': WMIEntry('Ford', 'Ford', 'USA'),
  '1FU': WMIEntry('Freightliner', 'Freightliner', 'USA'),
  '1FV': WMIEntry('Freightliner', 'Freightliner', 'USA'),
  '1GK': WMIEntry('GM (Buick/GMC)', 'GMC', 'USA'),
  '1HG': WMIEntry('Honda (US)', 'Honda', 'USA'),
  '1J4': WMIEntry('Jeep', 'Jeep', 'USA'),
  '1J8': WMIEntry('Jeep', 'Jeep', 'USA'),
  '1C3': WMIEntry('Chrysler', 'Chrysler', 'USA'),
  '1C4': WMIEntry('Chrysler', 'Chrysler', 'USA'),
  '1C6': WMIEntry('Ram', 'Ram', 'USA'),
  '1D7': WMIEntry('Dodge', 'Dodge', 'USA'),
  '1N4': WMIEntry('Nissan (US)', 'Nissan', 'USA'),
  '1N6': WMIEntry('Nissan (US)', 'Nissan', 'USA'),
  '1LN': WMIEntry('Lincoln', 'Lincoln', 'USA'),
  '1ME': WMIEntry('Mercury', 'Mercury', 'USA'),
  '1ZV': WMIEntry('Ford (US)', 'Ford', 'USA'),
  '19U': WMIEntry('Acura (US)', 'Acura', 'USA'),

  // ── Canada ────────────────────────────────────────────
  '2G1': WMIEntry('Chevrolet Canada', 'Chevrolet', 'Canada'),
  '2HG': WMIEntry('Honda Canada', 'Honda', 'Canada'),
  '2HK': WMIEntry('Honda Canada', 'Honda', 'Canada'),
  '2HM': WMIEntry('Hyundai Canada', 'Hyundai', 'Canada'),
  '2T1': WMIEntry('Toyota Canada', 'Toyota', 'Canada'),
  '2T3': WMIEntry('Toyota Canada', 'Toyota', 'Canada'),

  // ── Mexico ────────────────────────────────────────────
  '3FA': WMIEntry('Ford Mexico', 'Ford', 'Mexico'),
  '3G1': WMIEntry('GM Mexico', 'Chevrolet', 'Mexico'),
  '3GN': WMIEntry('GM Mexico', 'GMC', 'Mexico'),
  '3HG': WMIEntry('Honda Mexico', 'Honda', 'Mexico'),
  '3N1': WMIEntry('Nissan Mexico', 'Nissan', 'Mexico'),
  '3VW': WMIEntry('VW Mexico', 'Volkswagen', 'Mexico'),
  '3TM': WMIEntry('Toyota Mexico', 'Toyota', 'Mexico'),

  // ── UK ────────────────────────────────────────────────
  'SAL': WMIEntry('Land Rover', 'Land Rover', 'UK'),
  'SAJ': WMIEntry('Jaguar', 'Jaguar', 'UK'),
  'SCA': WMIEntry('Rolls-Royce', 'Rolls-Royce', 'UK'),
  'SCB': WMIEntry('Bentley', 'Bentley', 'UK'),
  'SCF': WMIEntry('Aston Martin', 'Aston Martin', 'UK'),
  'SHH': WMIEntry('Honda (UK)', 'Honda', 'UK'),

  // ── French ────────────────────────────────────────────
  'VF1': WMIEntry('Renault', 'Renault', 'France'),
  'VF3': WMIEntry('Peugeot', 'Peugeot', 'France'),
  'VF7': WMIEntry('Citroën', 'Citroën', 'France'),
  'VF8': WMIEntry('Bugatti', 'Bugatti', 'France'),
  'VR1': WMIEntry('DS Automobiles', 'DS', 'France'),

  // ── Italian ───────────────────────────────────────────
  'ZAR': WMIEntry('Alfa Romeo', 'Alfa Romeo', 'Italy'),
  'ZCF': WMIEntry('Iveco', 'Iveco', 'Italy'),
  'ZFF': WMIEntry('Ferrari', 'Ferrari', 'Italy'),
  'ZHW': WMIEntry('Lamborghini', 'Lamborghini', 'Italy'),
  'ZFA': WMIEntry('Fiat', 'Fiat', 'Italy'),
  'ZAM': WMIEntry('Maserati', 'Maserati', 'Italy'),

  // ── Spanish ───────────────────────────────────────────
  'VSS': WMIEntry('SEAT', 'SEAT', 'Spain'),
  'VS6': WMIEntry('Ford Spain', 'Ford', 'Spain'),

  // ── Czech ─────────────────────────────────────────────
  'TMB': WMIEntry('Škoda', 'Škoda', 'Czech Republic'),

  // ── Swedish ───────────────────────────────────────────
  'YV1': WMIEntry('Volvo', 'Volvo', 'Sweden'),
  'YV4': WMIEntry('Volvo', 'Volvo', 'Sweden'),
  'YS3': WMIEntry('Saab', 'Saab', 'Sweden'),

  // ── Indian ────────────────────────────────────────────
  'MA1': WMIEntry('Mahindra', 'Mahindra', 'India'),
  'MA3': WMIEntry('Suzuki India', 'Suzuki', 'India'),
  'MA6': WMIEntry('GM India', 'Chevrolet', 'India'),
  'MA7': WMIEntry('Mitsubishi India', 'Mitsubishi', 'India'),
  'MAJ': WMIEntry('Ford India', 'Ford', 'India'),
  'MAK': WMIEntry('Honda India', 'Honda', 'India'),
  'MAL': WMIEntry('Hyundai India', 'Hyundai', 'India'),
  'MAT': WMIEntry('Tata Motors', 'Tata', 'India'),
  'MBH': WMIEntry('Suzuki India (Maruti)', 'Maruti Suzuki', 'India'),

  // ── Chinese ───────────────────────────────────────────
  'LB2': WMIEntry('Geely', 'Geely', 'China'),
  'L6T': WMIEntry('Geely', 'Geely', 'China'),
  'LB1': WMIEntry('Geely', 'Geely', 'China'),
  'LGX': WMIEntry('BYD', 'BYD', 'China'),
  'LBV': WMIEntry('BYD', 'BYD', 'China'),
  'LGJ': WMIEntry('BYD', 'BYD', 'China'),
  'LZW': WMIEntry('GWM/Haval', 'Haval', 'China'),
  'LVS': WMIEntry('Chery', 'Chery', 'China'),
  'LVV': WMIEntry('Chery', 'Chery', 'China'),
  'LSV': WMIEntry('SAIC Volkswagen', 'Volkswagen', 'China'),
  'LSG': WMIEntry('SAIC GM', 'Buick', 'China'),
  'LFV': WMIEntry('FAW-Volkswagen', 'Volkswagen', 'China'),
  'LFP': WMIEntry('FAW Toyota', 'Toyota', 'China'),
  'LGW': WMIEntry('Great Wall', 'GWM', 'China'),
  'LJD': WMIEntry('Dongfeng Honda', 'Honda', 'China'),
  'LJC': WMIEntry('Dongfeng Nissan', 'Nissan', 'China'),
  'LDC': WMIEntry('Dongfeng', 'Dongfeng', 'China'),
  'LDY': WMIEntry('Zhongtong', 'Zhongtong', 'China'),
  'LHG': WMIEntry('GAC Honda', 'Honda', 'China'),
  'LTV': WMIEntry('GAC Toyota', 'Toyota', 'China'),
  'LTA': WMIEntry('GAC', 'GAC', 'China'),
  'LS5': WMIEntry('SAIC MG', 'MG', 'China'),
  'LPS': WMIEntry('Changan PSA', 'Peugeot', 'China'),
  'LNB': WMIEntry('NIO', 'NIO', 'China'),
  'LRW': WMIEntry('Tesla China', 'Tesla', 'China'),
  'LNA': WMIEntry('Changan', 'Changan', 'China'),
  'LNC': WMIEntry('Changan', 'Changan', 'China'),
  'LBE': WMIEntry('Beijing Hyundai', 'Hyundai', 'China'),
  'LS4': WMIEntry('SAIC Motor', 'Roewe', 'China'),
  'LVZ': WMIEntry('Chery', 'Chery', 'China'),
  'LPA': WMIEntry('Changan Ford', 'Ford', 'China'),
  'LPR': WMIEntry('XPeng', 'XPeng', 'China'),
  'LMG': WMIEntry('GAC Aion', 'Aion', 'China'),
  'LSJ': WMIEntry('SAIC MG', 'MG', 'China'),

  // ── Turkish ───────────────────────────────────────────
  'NMT': WMIEntry('Toyota Turkey', 'Toyota', 'Turkey'),
  'NM0': WMIEntry('Ford Turkey', 'Ford', 'Turkey'),
  'NM4': WMIEntry('Tofas (Fiat)', 'Fiat', 'Turkey'),
  'NMB': WMIEntry('Hyundai Turkey', 'Hyundai', 'Turkey'),

  // ── Australian ────────────────────────────────────────
  '6T1': WMIEntry('Toyota Australia', 'Toyota', 'Australia'),
  '6FP': WMIEntry('Ford Australia', 'Ford', 'Australia'),
  '6MM': WMIEntry('Mitsubishi Australia', 'Mitsubishi', 'Australia'),

  // ── South African ─────────────────────────────────────
  'AAV': WMIEntry('VW South Africa', 'Volkswagen', 'South Africa'),
  'AHT': WMIEntry('Toyota SA', 'Toyota', 'South Africa'),
  'ADH': WMIEntry('Mercedes-Benz SA', 'Mercedes-Benz', 'South Africa'),

  // ── US EV / Specialty ─────────────────────────────────
  '5YJ': WMIEntry('Tesla', 'Tesla', 'USA'),
  '7SA': WMIEntry('Tesla', 'Tesla', 'USA'),
  '5UX': WMIEntry('BMW (US)', 'BMW', 'USA'),
  '4T1': WMIEntry('Toyota (US)', 'Toyota', 'USA'),
  '4T3': WMIEntry('Toyota (US)', 'Toyota', 'USA'),
  '4T4': WMIEntry('Toyota (US)', 'Toyota', 'USA'),
  '5TD': WMIEntry('Toyota (US)', 'Toyota', 'USA'),
  '5TF': WMIEntry('Toyota (US)', 'Toyota', 'USA'),
  '5NM': WMIEntry('Hyundai (US)', 'Hyundai', 'USA'),
  '5NP': WMIEntry('Hyundai (US)', 'Hyundai', 'USA'),
  '5XY': WMIEntry('Kia (US)', 'Kia', 'USA'),
  'KNJ': WMIEntry('Genesis', 'Genesis', 'South Korea'),
  'KMT': WMIEntry('Genesis', 'Genesis', 'South Korea'),
};

// ── Year codes ────────────────────────────────────────────

const Map<String, int> _yearCodes = {
  '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
  '6': 2006, '7': 2007, '8': 2008, '9': 2009, 'A': 2010,
  'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015,
  'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020,
  'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025,
  'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029, 'Y': 2030,
};

// ── VIN check digit ───────────────────────────────────────

const List<int> _vinWeights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

const Map<String, int> _vinTransliteration = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
  'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
};

// ── VIN Validation Result ─────────────────────────────────

class VINValidationResult {
  final bool isValid;
  final bool checkDigitValid;
  final List<String> errors;
  const VINValidationResult({
    required this.isValid,
    required this.checkDigitValid,
    required this.errors,
  });
}

// ── Service ───────────────────────────────────────────────

class VINDecoderService {
  /// Validate a VIN string.
  VINValidationResult validateVIN(String vin) {
    final v = vin.toUpperCase().trim();
    final errors = <String>[];

    if (v.length != 17) {
      errors.add('VIN must be exactly 17 characters (got ${v.length})');
    }
    if (RegExp(r'[IOQ]').hasMatch(v)) {
      errors.add('VIN must not contain I, O, or Q');
    }
    if (!RegExp(r'^[A-HJ-NPR-Z0-9]{17}$').hasMatch(v) && v.length == 17) {
      errors.add('VIN contains invalid characters');
    }

    final checkValid = v.length == 17 ? _validateCheckDigit(v) : false;

    return VINValidationResult(
      isValid: errors.isEmpty,
      // Check digit is only mandatory for North American (NAFTA) VINs.
      // Position 1 chars: 1,4,5 = USA; 2 = Canada; 3 = Mexico
      checkDigitValid: _isNaftaVin(v) ? checkValid : true,
      errors: errors,
    );
  }

  /// Returns true if VIN originates from a NAFTA country (US, Canada, Mexico)
  /// which mandates ISO 3779 check digit at position 9.
  bool _isNaftaVin(String vin) {
    if (vin.isEmpty) return false;
    final first = vin[0];
    return first == '1' || first == '4' || first == '5' || // USA
           first == '2' ||                                  // Canada
           first == '3';                                    // Mexico
  }

  bool _validateCheckDigit(String vin) {
    int sum = 0;
    for (int i = 0; i < 17; i++) {
      final val = _vinTransliteration[vin[i]] ?? 0;
      sum += val * _vinWeights[i];
    }
    final remainder = sum % 11;
    final expected = remainder == 10 ? 'X' : '$remainder';
    return vin[8] == expected;
  }

  /// Full decode — returns VINData with raw + decoded + vehicle profile.
  VINData decode(String rawVin) {
    final vin = rawVin.toUpperCase().trim();
    final validation = validateVIN(vin);
    final decoded = _decodeVIN(vin);

    return VINData(
      raw: vin,
      isValid: validation.isValid,
      decoded: decoded,
    );
  }

  VINDecoded _decodeVIN(String vin) {
    final wmi = vin.substring(0, 3);
    final vds = vin.substring(3, 9);
    final vis = vin.substring(9);
    final wmiInfo = _wmiDatabase[wmi];
    final year = _decodeModelYear(vin.length >= 10 ? vin[9] : '');
    final region = _determineMarketRegion(vin);
    final brand = wmiInfo?.brand ?? 'Unknown';
    final modelInfo = _decodeModelInfo(brand, vds);

    return VINDecoded(
      wmi: wmi,
      vds: vds,
      vis: vis,
      manufacturer: wmiInfo?.manufacturer ?? 'Unknown',
      brand: brand,
      country: wmiInfo?.country ?? 'Unknown',
      modelYear: year,
      assemblyPlant: vin.length >= 11 ? vin[10] : '',
      serialNumber: vin.length >= 12 ? vin.substring(11) : '',
      model: modelInfo['model'] ?? 'Unknown',
      engineType: modelInfo['engine'] ?? 'Unknown',
      transmissionType: _parseTransmissionType(modelInfo['transmission']),
      driveType: _parseDriveType(modelInfo['driveType']),
      bodyStyle: modelInfo['bodyType'],
      fuelType: _parseFuelType(modelInfo['fuelType']),
      marketRegion: region,
      emissionStandard: _determineEmissionStandard(year, region),
    );
  }

  TransmissionType _parseTransmissionType(String? value) {
    if (value == null) return TransmissionType.unknown;
    final v = value.toLowerCase();
    if (v.contains('auto') || v.contains('at')) return TransmissionType.automatic;
    if (v.contains('manual') || v.contains('mt')) return TransmissionType.manual;
    if (v.contains('cvt')) return TransmissionType.cvt;
    if (v.contains('dct')) return TransmissionType.dct;
    return TransmissionType.unknown;
  }

  DriveType _parseDriveType(String? value) {
    if (value == null) return DriveType.unknown;
    final v = value.toLowerCase();
    if (v.contains('fwd') || v.contains('front')) return DriveType.fwd;
    if (v.contains('rwd') || v.contains('rear')) return DriveType.rwd;
    if (v.contains('awd') || v.contains('all')) return DriveType.awd;
    if (v.contains('4wd') || v.contains('four')) return DriveType.fourWd;
    return DriveType.unknown;
  }

  FuelType _parseFuelType(String? value) {
    if (value == null) return FuelType.unknown;
    final v = value.toLowerCase();
    if (v.contains('petrol') || v.contains('gasoline')) return FuelType.petrol;
    if (v.contains('diesel')) return FuelType.diesel;
    if (v.contains('hybrid')) return FuelType.hybrid;
    if (v.contains('electric') || v.contains('ev')) return FuelType.electric;
    return FuelType.unknown;
  }

  int _decodeModelYear(String code) {
    return _yearCodes[code.toUpperCase()] ?? DateTime.now().year;
  }

  MarketRegion _determineMarketRegion(String vin) {
    if (vin.isEmpty) return MarketRegion.other;
    final first = vin[0];
    if (first == 'J') return MarketRegion.jp;
    if ('STUVWXYZ'.contains(first)) return MarketRegion.eu;
    if ('12345'.contains(first)) return MarketRegion.us;
    if (first == 'P') return MarketRegion.my;
    if (first == 'M') return MarketRegion.asean;
    if (first == 'L') return MarketRegion.cn;
    return MarketRegion.other;
  }

  Map<String, String?> _decodeModelInfo(String brand, String vds) {
    // Brand-specific VDS decode tables (simplified — representative samples)
    switch (brand) {
      case 'Toyota':
        return {
          'model': _toyotaModelLookup(vds),
          'engine': _toyotaEngineLookup(vds),
          'transmission': null,
          'driveType': null,
          'bodyType': 'Sedan',
          'fuelType': 'Petrol',
        };
      case 'Honda':
        return {
          'model': _hondaModelLookup(vds),
          'engine': _hondaEngineLookup(vds),
          'transmission': null,
          'driveType': null,
          'bodyType': 'Sedan',
          'fuelType': 'Petrol',
        };
      case 'Proton':
        return {
          'model': _protonModelLookup(vds),
          'engine': _protonEngineLookup(vds),
          'transmission': null,
          'driveType': 'FWD',
          'bodyType': 'Sedan',
          'fuelType': 'Petrol',
        };
      case 'Perodua':
        return {
          'model': _peroduaModelLookup(vds),
          'engine': _peroduaEngineLookup(vds),
          'transmission': null,
          'driveType': 'FWD',
          'bodyType': 'Hatchback',
          'fuelType': 'Petrol',
        };
      case 'Kia':
        return {
          'model': _kiaModelLookup(vds),
          'engine': _kiaEngineLookup(vds),
          'transmission': null,
          'driveType': 'FWD',
          'bodyType': 'Sedan',
          'fuelType': 'Petrol',
        };
      case 'Hyundai':
        return {
          'model': _hyundaiModelLookup(vds),
          'engine': _hyundaiEngineLookup(vds),
          'transmission': null,
          'driveType': 'FWD',
          'bodyType': 'Sedan',
          'fuelType': 'Petrol',
        };
      case 'BMW':
        return {
          'model': _bmwModelLookup(vds),
          'engine': _bmwEngineLookup(vds),
          'transmission': null,
          'driveType': 'RWD',
          'bodyType': 'Sedan',
          'fuelType': 'Petrol',
        };
      case 'Mercedes-Benz':
        return {
          'model': _mercedesModelLookup(vds),
          'engine': _mercedesEngineLookup(vds),
          'transmission': null,
          'driveType': 'RWD',
          'bodyType': 'Sedan',
          'fuelType': 'Petrol',
        };
      case 'Nissan':
        return {
          'model': _nissanModelLookup(vds),
          'engine': _nissanEngineLookup(vds),
          'transmission': null,
          'driveType': null,
          'bodyType': 'Sedan',
          'fuelType': 'Petrol',
        };
      case 'Mazda':
        return {
          'model': _mazdaModelLookup(vds),
          'engine': null,
          'transmission': null,
          'driveType': 'FWD',
          'bodyType': 'Sedan',
          'fuelType': 'Petrol',
        };
      case 'Mitsubishi':
        return {
          'model': _mitsubishiModelLookup(vds),
          'engine': null,
          'transmission': null,
          'driveType': null,
          'bodyType': null,
          'fuelType': 'Petrol',
        };
      default:
        return {
          'model': 'Unknown',
          'engine': 'Unknown',
          'transmission': null,
          'driveType': null,
          'bodyType': null,
          'fuelType': null,
        };
    }
  }

  // ── Brand-specific model lookups ──

  String _toyotaModelLookup(String vds) {
    final c = vds.isNotEmpty ? vds[0] : '';
    switch (c) {
      case 'A': return 'Vios';
      case 'B': return 'Yaris';
      case 'E': return 'Corolla Altis';
      case 'G': return 'Camry';
      case 'H': return 'Hilux';
      case 'K': return 'Fortuner';
      default: return 'Unknown';
    }
  }

  String _toyotaEngineLookup(String vds) {
    if (vds.length < 4) return 'Unknown';
    final e = vds.substring(1, 3);
    switch (e) {
      case 'NR': return '2NR-FE 1.5L';
      case 'ZR': return '2ZR-FE 1.8L';
      case 'AR': return '2AR-FE 2.5L';
      case 'GD': return '1GD-FTV 2.8L Diesel';
      default: return 'Unknown';
    }
  }

  String _hondaModelLookup(String vds) {
    final c = vds.isNotEmpty ? vds[0] : '';
    switch (c) {
      case 'G': return 'City';
      case 'F': return 'Civic';
      case 'K': return 'Jazz';
      case 'R': return 'HR-V';
      case 'S': return 'CR-V';
      default: return 'Unknown';
    }
  }

  String _hondaEngineLookup(String vds) {
    if (vds.length < 3) return 'Unknown';
    final e = vds.substring(1, 3);
    switch (e) {
      case '15': return 'L15B 1.5L';
      case '1T': return 'L15B7 1.5L Turbo';
      case '18': return 'R18Z 1.8L';
      default: return 'Unknown';
    }
  }

  String _protonModelLookup(String vds) {
    final c = vds.isNotEmpty ? vds[0] : '';
    switch (c) {
      case 'A': return 'Saga';
      case 'B': return 'Persona';
      case 'C': return 'Iriz';
      case 'D': return 'X50';
      case 'E': return 'X70';
      case 'F': return 'X90';
      default: return 'Unknown';
    }
  }

  String _protonEngineLookup(String vds) {
    if (vds.length < 3) return 'Unknown';
    final e = vds.substring(1, 3);
    switch (e) {
      case '13': return '1.3 VVT';
      case '16': return '1.6 VVT';
      case '15': return '1.5 TGDi';
      case '18': return '1.8 TGDi';
      default: return 'Unknown';
    }
  }

  String _peroduaModelLookup(String vds) {
    final c = vds.isNotEmpty ? vds[0] : '';
    switch (c) {
      case 'A': return 'Axia';
      case 'B': return 'Bezza';
      case 'M': return 'Myvi';
      case 'L': return 'Alza';
      case 'T': return 'Ativa';
      default: return 'Unknown';
    }
  }

  String _peroduaEngineLookup(String vds) {
    if (vds.length < 3) return 'Unknown';
    final e = vds.substring(1, 3);
    switch (e) {
      case '1K': return '1KR-VE 1.0L';
      case '1N': return '1NR-VE 1.3L';
      case '2N': return '2NR-VE 1.5L';
      case '3N': return '3NR-VE 1.2L';
      case '1T': return '1KR-VET 1.0L Turbo';
      default: return 'Unknown';
    }
  }

  // ── Kia lookups ──

  String _kiaModelLookup(String vds) {
    final c = vds.isNotEmpty ? vds[0] : '';
    switch (c) {
      case 'A': return 'Picanto';
      case 'B': return 'Rio';
      case 'C': return 'Cerato';
      case 'D': return 'Optima/K5';
      case 'E': return 'Sportage';
      case 'F': return 'Sorento';
      case 'G': return 'Carnival';
      case 'H': return 'Seltos';
      case 'J': return 'Stinger';
      default: return 'Unknown';
    }
  }

  String _kiaEngineLookup(String vds) {
    if (vds.length < 3) return 'Unknown';
    final e = vds.substring(1, 3);
    switch (e) {
      case '10': return 'Kappa 1.0L';
      case '1T': return 'Kappa 1.0L T-GDi';
      case '16': return 'Gamma 1.6L';
      case '6T': return 'Gamma 1.6L T-GDi';
      case '20': return 'Nu 2.0L';
      case '25': return 'Theta II 2.5L';
      default: return 'Unknown';
    }
  }

  // ── Hyundai lookups ──

  String _hyundaiModelLookup(String vds) {
    final c = vds.isNotEmpty ? vds[0] : '';
    switch (c) {
      case 'A': return 'i10';
      case 'B': return 'i20';
      case 'C': return 'Elantra';
      case 'D': return 'Sonata';
      case 'E': return 'Tucson';
      case 'F': return 'Santa Fe';
      case 'G': return 'Kona';
      case 'H': return 'Venue';
      case 'J': return 'Ioniq';
      default: return 'Unknown';
    }
  }

  String _hyundaiEngineLookup(String vds) {
    if (vds.length < 3) return 'Unknown';
    final e = vds.substring(1, 3);
    switch (e) {
      case '10': return 'Kappa 1.0L';
      case '1T': return 'Kappa 1.0L T-GDi';
      case '16': return 'Gamma 1.6L';
      case '6T': return 'Gamma 1.6L T-GDi';
      case '20': return 'Nu 2.0L';
      case '25': return 'Theta II 2.5L';
      default: return 'Unknown';
    }
  }

  // ── BMW lookups ──

  String _bmwModelLookup(String vds) {
    final c = vds.isNotEmpty ? vds[0] : '';
    switch (c) {
      case 'A': return '1 Series';
      case 'C': return '3 Series';
      case 'D': return '4 Series';
      case 'E': return '5 Series';
      case 'G': return '7 Series';
      case 'H': return 'X1';
      case 'J': return 'X3';
      case 'K': return 'X5';
      default: return 'Unknown';
    }
  }

  String _bmwEngineLookup(String vds) {
    if (vds.length < 3) return 'Unknown';
    final e = vds.substring(1, 3);
    switch (e) {
      case '15': return 'B38 1.5L 3-cyl Turbo';
      case '20': return 'B48 2.0L 4-cyl Turbo';
      case '30': return 'B58 3.0L 6-cyl Turbo';
      default: return 'Unknown';
    }
  }

  // ── Mercedes lookups ──

  String _mercedesModelLookup(String vds) {
    final c = vds.isNotEmpty ? vds[0] : '';
    switch (c) {
      case 'A': return 'A-Class';
      case 'C': return 'C-Class';
      case 'E': return 'E-Class';
      case 'S': return 'S-Class';
      case 'G': return 'GLA';
      case 'H': return 'GLC';
      case 'J': return 'GLE';
      default: return 'Unknown';
    }
  }

  String _mercedesEngineLookup(String vds) {
    if (vds.length < 3) return 'Unknown';
    final e = vds.substring(1, 3);
    switch (e) {
      case '15': return 'M282 1.3L Turbo';
      case '20': return 'M264 2.0L Turbo';
      case '30': return 'M256 3.0L I6 Turbo';
      default: return 'Unknown';
    }
  }

  // ── Nissan lookups ──

  String _nissanModelLookup(String vds) {
    final c = vds.isNotEmpty ? vds[0] : '';
    switch (c) {
      case 'A': return 'Almera';
      case 'B': return 'Navara';
      case 'C': return 'X-Trail';
      case 'D': return 'Serena';
      case 'E': return 'Sylphy';
      case 'F': return 'Kicks';
      default: return 'Unknown';
    }
  }

  String _nissanEngineLookup(String vds) {
    if (vds.length < 3) return 'Unknown';
    final e = vds.substring(1, 3);
    switch (e) {
      case 'HR': return 'HR16DE 1.6L';
      case 'MR': return 'MR20DD 2.0L';
      case 'QR': return 'QR25DE 2.5L';
      case 'YD': return 'YD25DDTi 2.5L Diesel';
      default: return 'Unknown';
    }
  }

  // ── Mazda lookups ──

  String _mazdaModelLookup(String vds) {
    final c = vds.isNotEmpty ? vds[0] : '';
    switch (c) {
      case 'A': return 'Mazda2';
      case 'B': return 'Mazda3';
      case 'C': return 'Mazda6';
      case 'D': return 'CX-3';
      case 'E': return 'CX-5';
      case 'F': return 'CX-8';
      case 'G': return 'CX-30';
      default: return 'Unknown';
    }
  }

  // ── Mitsubishi lookups ──

  String _mitsubishiModelLookup(String vds) {
    final c = vds.isNotEmpty ? vds[0] : '';
    switch (c) {
      case 'A': return 'Attrage';
      case 'B': return 'Triton';
      case 'C': return 'ASX';
      case 'D': return 'Outlander';
      case 'E': return 'Xpander';
      case 'F': return 'Pajero Sport';
      default: return 'Unknown';
    }
  }

  String _determineEmissionStandard(int year, MarketRegion region) {
    switch (region) {
      case MarketRegion.eu:
        if (year >= 2020) return 'Euro 6d';
        if (year >= 2014) return 'Euro 6';
        if (year >= 2009) return 'Euro 5';
        return 'Euro 4';
      case MarketRegion.us:
        if (year >= 2017) return 'Tier 3';
        return 'Tier 2';
      case MarketRegion.my:
      case MarketRegion.asean:
        if (year >= 2020) return 'Euro 4 (MY)';
        return 'Euro 2 (MY)';
      default:
        return 'Unknown';
    }
  }

  // ── NHTSA vPIC API Optional Enrichment ──────────────────

  /// Enriches VINData with NHTSA vPIC API data when online.
  /// Free API, no key required. Results cached in [_nhtsaCache].
  /// Falls back silently if offline or API fails.
  Future<VINData> decodeWithEnrichment(String rawVin) async {
    final base = decode(rawVin);
    if (!base.isValid || rawVin.length != 17) return base;

    final vin = rawVin.toUpperCase().trim();

    // Check cache first
    if (_nhtsaCache.containsKey(vin)) {
      return _mergeNhtsaData(base, _nhtsaCache[vin]!);
    }

    try {
      final uri = Uri.parse(
        'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/$vin?format=json',
      );
      final response = await http.get(uri).timeout(
        const Duration(seconds: 5),
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body) as Map<String, dynamic>;
        final results = json['Results'] as List<dynamic>? ?? [];
        final data = <String, String>{};

        for (final r in results) {
          final variable = r['Variable'] as String? ?? '';
          final value = r['Value'] as String?;
          if (value != null && value.isNotEmpty && value != 'Not Applicable') {
            data[variable] = value;
          }
        }

        _nhtsaCache[vin] = data;
        return _mergeNhtsaData(base, data);
      }
    } catch (e) {
      debugPrint('BYKI: NHTSA vPIC enrichment failed: $e');
    }

    return base;
  }

  /// Merge NHTSA vPIC fields into existing VINData, preferring
  /// existing brand-specific data when it has a real value.
  VINData _mergeNhtsaData(VINData base, Map<String, String> nhtsa) {
    final d = base.decoded;
    if (d == null) return base;

    final nhtsaBrand = nhtsa['Make'] ?? '';
    final nhtsaModel = nhtsa['Model'] ?? '';
    final nhtsaYear = int.tryParse(nhtsa['Model Year'] ?? '');
    final nhtsaEngine = nhtsa['Displacement (L)'];
    final nhtsaCylinders = nhtsa['Engine Number of Cylinders'];
    final nhtsaFuel = nhtsa['Fuel Type - Primary'];
    final nhtsaBody = nhtsa['Body Class'];
    final nhtsaDrive = nhtsa['Drive Type'];
    final nhtsaPlantCountry = nhtsa['Plant Country'];
    final nhtsaPlantCity = nhtsa['Plant City'];
    final nhtsaEngineConfig = nhtsa['Engine Configuration'];

    String? enrichedEngine = d.engineType;
    if ((enrichedEngine == null || enrichedEngine == 'Unknown') &&
        nhtsaEngine != null) {
      final cylStr = nhtsaCylinders != null ? '${nhtsaCylinders}cyl' : '';
      final configStr = nhtsaEngineConfig ?? '';
      enrichedEngine = '${nhtsaEngine}L $configStr $cylStr'.trim();
    }

    return VINData(
      vin: base.vin,
      isValid: base.isValid,
      checkDigitValid: base.checkDigitValid,
      decoded: VINDecoded(
        wmi: d.wmi,
        vds: d.vds,
        vis: d.vis,
        manufacturer: d.manufacturer,
        brand: d.brand != 'Unknown' ? d.brand : (nhtsaBrand.isNotEmpty ? nhtsaBrand : d.brand),
        country: d.country,
        model: d.model != 'Unknown' ? d.model : (nhtsaModel.isNotEmpty ? nhtsaModel : d.model),
        modelYear: nhtsaYear ?? d.modelYear,
        assemblyPlant: d.assemblyPlant,
        serialNumber: d.serialNumber,
        engineType: enrichedEngine,
        transmissionType: d.transmissionType,
        driveType: d.driveType != DriveType.unknown
            ? d.driveType
            : _parseDriveType(nhtsaDrive),
        bodyStyle: d.bodyStyle ?? nhtsaBody,
        fuelType: d.fuelType != FuelType.unknown
            ? d.fuelType
            : _parseFuelType(nhtsaFuel),
        marketRegion: d.marketRegion,
        emissionStandard: d.emissionStandard,
        plantCountry: d.plantCountry ?? nhtsaPlantCountry,
        plantCity: d.plantCity ?? nhtsaPlantCity,
      ),
    );
  }

  /// In-memory cache for NHTSA responses to avoid repeat calls.
  static final Map<String, Map<String, String>> _nhtsaCache = {};

  /// Clear the NHTSA cache (e.g. on app restart).
  static void clearNhtsaCache() => _nhtsaCache.clear();
}

/// Singleton instance.
final vinDecoder = VINDecoderService();
