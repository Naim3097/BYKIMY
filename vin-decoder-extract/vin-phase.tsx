'use client';

import { useState, useEffect } from 'react';
import { useDiagnosticStore } from '@/store';
import { agentBridge, vinDecoder, scanHistoryService } from '@/services';
import { motion } from 'framer-motion';
import { 
  Car, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Fuel,
  Settings,
  MapPin,
  Shield,
  Cog,
  Cpu,
  History,
  Scan
} from 'lucide-react';
import GearboxDiagram from '@/components/charts/gearbox-diagram';
import { findGearboxByVehicle } from '@/data/gearbox-database';
import dynamic from 'next/dynamic';

const VehicleScanner3D = dynamic(
  () => import('@/components/charts/vehicle-scanner-3d'),
  { ssr: false }
);

export function VINPhase() {
  const { 
    setVIN, 
    setVINData, 
    setVINValidation,
    setVehicleInfoExtended,
    setScanHistory,
    setCurrentPhase,
    addNotification,
    vin,
    vinData,
    vinValidation,
    vehicleInfoExtended,
    scanHistory,
    selectedBrand
  } = useDiagnosticStore();

  const [inputVIN, setInputVIN] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [showGearboxDiagram, setShowGearboxDiagram] = useState(false);
  const [show3DScanner, setShow3DScanner] = useState(false);

  const gearboxInfo = vinData ? findGearboxByVehicle(vinData.brand, vinData.model, vinData.engineCode) : null;

  useEffect(() => {
    if (!vin) {
      handleAutoRead();
    }
  }, []);

  const handleAutoRead = async () => {
    setIsReading(true);
    try {
      const result = await agentBridge.readVin();
      const detectedVIN = result.vin;
      setInputVIN(detectedVIN);

      addNotification({
        type: 'success',
        title: 'VIN Detected',
        message: `Vehicle VIN: ${detectedVIN} (via ${result.source})`,
        persistent: false,
      });

      handleDecode(detectedVIN);
    } catch {
      addNotification({
        type: 'warning',
        title: 'VIN Read Failed',
        message: 'Could not auto-read VIN. Please enter manually.',
        persistent: false,
      });
    } finally {
      setIsReading(false);
    }
  };

  const handleDecode = async (vinToUse?: string) => {
    const targetVIN = vinToUse || inputVIN;
    if (!targetVIN) return;

    setIsDecoding(true);

    const validation = vinDecoder.validateVIN(targetVIN);
    setVINValidation(validation);

    if (!validation.isValid) {
      addNotification({
        type: 'warning',
        title: 'VIN Validation Warning',
        message: validation.errors.join(', '),
        persistent: false,
      });
    }

    const decoded = vinDecoder.decode(targetVIN);
    setVIN(targetVIN);
    setVINData(decoded.decoded);
    setIsDecoding(false);

    addNotification({
      type: 'success',
      title: 'Vehicle Identified',
      message: `${decoded.decoded?.brand || 'Unknown'} ${decoded.decoded?.model || 'Unknown'} (${decoded.decoded?.modelYear || '?'})`,
      persistent: false,
    });

    fetchExtendedInfo();
    fetchScanHistory(targetVIN);
  };

  const fetchExtendedInfo = async () => {
    try {
      const info = await agentBridge.readVehicleInfo();
      setVehicleInfoExtended(info);
    } catch {
      // Non-critical
    }
  };

  const fetchScanHistory = async (vinCode: string) => {
    try {
      const history = await scanHistoryService.getHistoryByVin(vinCode);
      setScanHistory(history);
    } catch {
      // Firebase may not be configured
    }
  };

  const handleProceed = () => {
    if (vinData) {
      setCurrentPhase('TOPOLOGY_SCAN');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {selectedBrand && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Selected Manufacturer</p>
              <p className="text-white font-bold text-lg">{selectedBrand}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">Brand-Specific Protocols Active</span>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* VIN Input Section */}
          <div className="space-y-6">
            <div className="byki-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-byki-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Vehicle Identification</h3>
                  <p className="text-sm text-gray-500">VIN-First Philosophy</p>
                </div>
              </div>

              {isReading && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl mb-4">
                  <Loader2 className="w-5 h-5 text-byki-primary animate-spin" />
                  <span className="text-byki-primary font-medium">Reading VIN from ECM...</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2 font-medium">
                    Vehicle Identification Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputVIN}
                      onChange={(e) => setInputVIN(e.target.value.toUpperCase())}
                      placeholder="Enter 17-character VIN"
                      maxLength={17}
                      className="byki-input font-mono text-lg tracking-widest"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      {inputVIN.length}/17
                    </span>
                  </div>
                </div>

                {vinValidation && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl ${
                    vinValidation.isValid 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {vinValidation.isValid ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">
                      {vinValidation.isValid 
                        ? 'VIN validated successfully' 
                        : vinValidation.errors[0]}
                    </span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleAutoRead}
                    disabled={isReading}
                    className="byki-btn byki-btn-secondary flex-1"
                  >
                    {isReading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Car className="w-4 h-4" />
                    )}
                    Auto-Read
                  </button>
                  <button
                    onClick={() => handleDecode()}
                    disabled={inputVIN.length !== 17 || isDecoding}
                    className="byki-btn byki-btn-primary flex-1"
                  >
                    {isDecoding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Decode VIN
                  </button>
                </div>
              </div>
            </div>

            {/* VIN Breakdown */}
            {inputVIN.length === 17 && (
              <div className="byki-card">
                <h4 className="text-sm font-semibold text-gray-600 mb-4">VIN Structure</h4>
                <div className="flex gap-1 font-mono text-lg">
                  <div className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg" title="World Manufacturer ID">
                    {inputVIN.slice(0, 3)}
                  </div>
                  <div className="px-2 py-1 bg-purple-100 text-purple-600 rounded-lg" title="Vehicle Descriptor">
                    {inputVIN.slice(3, 9)}
                  </div>
                  <div className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg" title="Vehicle Identifier">
                    {inputVIN.slice(9, 17)}
                  </div>
                </div>
                <div className="flex gap-1 text-xs text-gray-500 mt-2">
                  <span className="text-blue-500">WMI</span>
                  <span className="text-purple-500 ml-8">VDS</span>
                  <span className="text-emerald-500 ml-16">VIS</span>
                </div>
              </div>
            )}

            {/* ECU Software Info Card */}
            {vehicleInfoExtended && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="byki-card"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">ECU Software Info</h4>
                    <p className="text-xs text-gray-500">Mode 09 — Vehicle Information</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {vehicleInfoExtended.ecuName && (
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">ECU Name</span>
                      <span className="text-gray-800 font-mono font-medium">{vehicleInfoExtended.ecuName}</span>
                    </div>
                  )}
                  {vehicleInfoExtended.calibrationIds?.map((calId: string, i: number) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Cal ID #{i + 1}</span>
                      <span className="text-gray-800 font-mono text-xs">{calId}</span>
                    </div>
                  ))}
                  {vehicleInfoExtended.calibrationVerification?.map((cvn: string, i: number) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">CVN #{i + 1}</span>
                      <span className="text-gray-800 font-mono text-xs">{cvn}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Vehicle Profile Section */}
          <div className="space-y-6">
            {vinData ? (
              <>
                <div className="byki-card byki-card-success">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Car className="w-8 h-8 text-byki-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {vinData.brand} {vinData.model}
                      </h3>
                      <p className="text-byki-primary font-medium">
                        {vinData.modelYear} • {vinData.bodyStyle}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-byki-primary" />
                  </div>
                  
                  {/* 3D Body Scan button — only for Proton Saga */}
                  {vinData.brand?.toLowerCase().includes('proton') && vinData.model?.toLowerCase().includes('saga') && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => setShow3DScanner(true)}
                      className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl border border-emerald-500/30 hover:border-emerald-400/50 transition-all group"
                    >
                      <Scan className="w-5 h-5 text-emerald-400 group-hover:animate-pulse" />
                      <span className="text-emerald-400 font-mono text-sm font-bold tracking-wider">LAUNCH 3D BODY SCAN</span>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    </motion.button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DetailCard
                    icon={Settings}
                    label="Engine"
                    value={vinData.engineCode}
                    subValue={`${vinData.engineDisplacement} ${vinData.engineType}`}
                    color="primary"
                  />
                  
                  <motion.button
                    onClick={() => setShowGearboxDiagram(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="byki-card text-left group relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 relative">
                        <Cog className="w-5 h-5 group-hover:animate-spin" style={{ animationDuration: '2s' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Transmission</p>
                        <p className="text-gray-800 font-semibold">{vinData.transmissionType}</p>
                        <p className="text-xs text-gray-500">{gearboxInfo?.gearboxFamily || vinData.driveType}</p>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                          View Diagram
                        </span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute bottom-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"
                    />
                  </motion.button>
                  
                  <DetailCard
                    icon={Fuel}
                    label="Fuel Type"
                    value={vinData.fuelType}
                    subValue={vinData.emissionStandard}
                    color="accent"
                  />
                  <DetailCard
                    icon={MapPin}
                    label="Market Region"
                    value={vinData.marketRegion}
                    subValue={vinData.plantCity}
                    color="success"
                  />
                </div>

                {/* Scan History Preview */}
                {scanHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="byki-card"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <History className="w-5 h-5 text-purple-600" />
                      <h4 className="text-sm font-semibold text-gray-800">Previous Scans</h4>
                      <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{scanHistory.length}</span>
                    </div>
                    <div className="space-y-2">
                      {scanHistory.slice(0, 3).map((scan, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm">
                          <span className="text-gray-600">
                            {scan.scannedAt ? new Date(scan.scannedAt).toLocaleDateString() : 'Unknown'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{(scan.confirmedDtcs.length + scan.pendingDtcs.length + scan.permanentDtcs.length)} DTCs</span>
                            {scan.healthScore != null && (
                              <span className={`text-xs font-medium ${scan.healthScore >= 80 ? 'text-emerald-600' : scan.healthScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                {scan.healthScore}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={handleProceed}
                  className="w-full byki-btn byki-btn-primary text-lg"
                >
                  <Shield className="w-5 h-5" />
                  Lock Vehicle Profile & Start Scan
                </button>
              </>
            ) : (
              <div className="byki-card h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Car className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Awaiting Vehicle Data
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Enter or auto-read the VIN to identify the vehicle and lock the diagnostic profile
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {vinData && (
        <GearboxDiagram
          make={vinData.brand}
          model={vinData.model}
          engine={vinData.engineCode}
          transmissionType={vinData.transmissionType}
          isVisible={showGearboxDiagram}
          onClose={() => setShowGearboxDiagram(false)}
        />
      )}

      {vinData && vinData.brand?.toLowerCase().includes('proton') && vinData.model?.toLowerCase().includes('saga') && (
        <VehicleScanner3D
          isVisible={show3DScanner}
          onClose={() => setShow3DScanner(false)}
          vehicleName={`${vinData.brand} ${vinData.model} ${vinData.modelYear || ''}`}
          modelUrl="/models/proton-saga-pbr.fbx"
        />
      )}
    </div>
  );
}

function DetailCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  subValue: string;
  color: 'primary' | 'secondary' | 'accent' | 'success';
}) {
  const colorClasses = {
    primary: 'text-byki-primary bg-emerald-50',
    secondary: 'text-emerald-600 bg-emerald-50',
    accent: 'text-amber-600 bg-amber-50',
    success: 'text-byki-primary bg-emerald-50',
  };

  return (
    <div className="byki-card">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-gray-800 font-semibold">{value}</p>
          <p className="text-xs text-gray-500">{subValue}</p>
        </div>
      </div>
    </div>
  );
}
