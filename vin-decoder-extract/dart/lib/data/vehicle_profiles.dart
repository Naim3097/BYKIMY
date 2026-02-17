/// Vehicle profiles — brand-specific ELM327 init sequences and module headers.
/// Ported from BYKI X1's proven "secret recipes" for Malaysian vehicles.

class VehicleProfile {
  final String id;
  final String brand;
  final String model;
  final String protocolCmd; // e.g., "ATSP6" or "ATSP0"
  final List<String> initCommands; // Special setup like ATCAF0
  final Map<String, String> moduleHeaders; // Custom headers for this car

  const VehicleProfile({
    required this.id,
    required this.brand,
    required this.model,
    required this.protocolCmd,
    this.initCommands = const [],
    this.moduleHeaders = const {},
  });
}

// THE "SECRET RECIPES"
final List<VehicleProfile> supportedVehicles = [
  // ===========================================================================
  // 1. PERODUA (DNGA & Modern CAN)
  // Covers: Myvi (G3/Facelift), Ativa, Alza (DNGA), Axia (DNGA), Bezza (2020+), Aruz
  // ===========================================================================
  VehicleProfile(
    id: 'perodua_dnga',
    brand: 'Perodua',
    model: 'DNGA / Modern CAN (Myvi G3, Ativa, Alza, Axia, Bezza, Aruz)',
    protocolCmd: 'ATSP6', // ISO 15765-4 CAN (11 bit ID, 500 kbaud)
    initCommands: [
      'ATSH7E0', // Target Engine by default
      'ATH1', // Headers ON (Critical)
      'ATAL', // Allow Long Messages
      'ATSTFF', // Max Timeout (v1.5 Chip Fix)
    ],
    moduleHeaders: {
      'ECM': '7E0', // Engine Control Module → 7E8
      'TCM': '7E1', // D-CVT / 4AT → 7E9 (may not respond on manual trans)
      'ABS': '7B0', // Skid Control / VSC → 7B8
      'SRS': '780', // Airbag System → 788
      'IPC': '7C4', // Combination Meter / Instrument Cluster → 7CC
      'BCM': '7C0', // Body Control Module → 7C8
      'EPS': '790', // Electric Power Steering → 798
    },
  ),

  // ===========================================================================
  // 2. PROTON (Geely Platform)
  // Covers: X50, X70, X90, S70
  // ===========================================================================
  VehicleProfile(
    id: 'proton_geely',
    brand: 'Proton',
    model: 'X-Series / S70 (Geely Platform)',
    protocolCmd: 'ATSP6', // Standard CAN for Geely
    initCommands: [
      'ATSH7E0',
      'ATH1',
      'ATAL',
      'ATSTFF',
    ],
    moduleHeaders: {
      'ECM': '7E0',
      'TCM': '7E1', // DCT
      'ABS': '7A0', // Geely often uses 7A0 or 7B0, we try 7A0 first
      'SRS': '780',
      'BCM': '740', // Geely BCM often lower
    },
  ),

  // ===========================================================================
  // 3. PROTON (Campro VVT / Punch CVT)
  // Covers: Saga VVT, Persona VVT, Iriz, Exora (Bold/RC)
  // ===========================================================================
  VehicleProfile(
    id: 'proton_vvt',
    brand: 'Proton',
    model: 'Saga / Persona / Iriz / Exora (VVT/Campro)',
    protocolCmd: 'ATSP0', // Auto is safer for older Protons
    initCommands: [
      'ATSH7E0',
      'ATH1',
      'ATCAF0', // <-- RAW MODE! Critical for Punch CVT & Campro ECU
      'ATAL',
    ],
    moduleHeaders: {
      'ECM': '7E0',
      'TCM': '7E1', // Punch CVT
      'ABS': '7A0', // Proton ABS
      'SRS': '7A2', // Proton SRS often 7A2
      'BCM': '760', // Proton BCM
      'EPS': '730', // Proton EPS
    },
  ),

  // ===========================================================================
  // 4. HONDA (CAN-Bus)
  // Covers: City (GM6/GN2), Civic (FC/FE), HR-V, Jazz (GK), CR-V
  // ===========================================================================
  VehicleProfile(
    id: 'honda_can',
    brand: 'Honda',
    model: 'City / Civic / HR-V / Jazz / CR-V (CAN)',
    protocolCmd: 'ATSP6', // ISO 15765-4 CAN
    initCommands: [
      'ATSH7E0',
      'ATH1',
      'ATAL',
      'ATSTFF',
    ],
    moduleHeaders: {
      'ECM': '7E0',
      'TCM': '7E1', // CVT
      'ABS': '7A0', // Honda ABS often 7A0
      'SRS': '780', // Honda SRS
      'IPC': '7C4', // Honda Meter
      'BCM': '7C0', // Honda BCM
      'EPS': '790', // Honda EPS
    },
  ),

  // ===========================================================================
  // 5. TOYOTA (Shared Architecture)
  // Covers: Vios, Yaris, Altis, Veloz (DNGA-based but Toyota badged)
  // ===========================================================================
  VehicleProfile(
    id: 'toyota_can',
    brand: 'Toyota',
    model: 'Vios / Yaris / Altis / Veloz',
    protocolCmd: 'ATSP6',
    initCommands: [
      'ATSH7E0',
      'ATH1',
      'ATAL',
      'ATSTFF',
    ],
    moduleHeaders: {
      'ECM': '7E0',
      'TCM': '7E1', // CVT
      'ABS': '7B0', // Toyota ABS
      'SRS': '780', // Toyota SRS
      'IPC': '7C0',
      'BCM': '750',
      'EPS': '790',
    },
  ),

  // ===========================================================================
  // 6. GENERIC (Fallback)
  // ===========================================================================
  VehicleProfile(
    id: 'generic',
    brand: 'Generic',
    model: 'Auto Detect (All Other Cars)',
    protocolCmd: 'ATSP0',
    initCommands: ['ATH1', 'ATAL', 'ATSTFF'],
  ),
];
