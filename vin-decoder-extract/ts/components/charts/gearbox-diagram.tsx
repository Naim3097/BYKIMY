'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GearboxInfo, 
  GearboxPart, 
  findGearboxByVehicle,
  getHighRiskParts 
} from '@/data/gearbox-database';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Zap,
  Settings,
  Cpu,
  Circle,
  X
} from 'lucide-react';

interface GearboxDiagramProps {
  make: string;
  model: string;
  engine?: string;
  transmissionType?: string;
  onClose?: () => void;
  isVisible: boolean;
}

// Part category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: any; color: string; bgColor: string }> = {
  CASE: { icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  GEAR: { icon: Settings, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  BEARING: { icon: Circle, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  SEAL: { icon: Circle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  SOLENOID: { icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  VALVE: { icon: Settings, color: 'text-red-600', bgColor: 'bg-red-100' },
  CLUTCH: { icon: Circle, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  BELT: { icon: Circle, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  PULLEY: { icon: Settings, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  SENSOR: { icon: Cpu, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  ELECTRONICS: { icon: Cpu, color: 'text-violet-600', bgColor: 'bg-violet-100' },
};

const RISK_COLORS = {
  LOW: 'border-emerald-400 bg-emerald-50',
  MEDIUM: 'border-amber-400 bg-amber-50',
  HIGH: 'border-red-400 bg-red-50',
};

export function GearboxDiagram({ make, model, engine, transmissionType, onClose, isVisible }: GearboxDiagramProps) {
  const [gearbox, setGearbox] = useState<GearboxInfo | null>(null);
  const [selectedPart, setSelectedPart] = useState<GearboxPart | null>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    const found = findGearboxByVehicle(make, model, engine);
    setGearbox(found);
    
    // Auto-trigger exploded view animation after load
    if (found) {
      setTimeout(() => {
        setShowAnimation(false);
        setIsExploded(true);
      }, 1500);
    }
  }, [make, model, engine]);

  if (!isVisible) return null;

  const highRiskParts = gearbox ? getHighRiskParts(gearbox) : [];
  const maxLayer = gearbox ? Math.max(...gearbox.parts.map(p => p.layer)) : 1;

  // Calculate exploded position offset based on layer
  const getExplodedOffset = (layer: number) => {
    if (!isExploded) return 0;
    const centerLayer = maxLayer / 2;
    return (layer - centerLayer) * 8; // 8% offset per layer from center
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {gearbox?.gearboxFamily || 'Transmission Diagram'}
                </h2>
                <p className="text-slate-400">
                  {gearbox?.make} {gearbox?.model} • {gearbox?.transmissionType} • {gearbox?.manufacturer}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Explode Toggle - only show for node-based diagrams */}
              {gearbox && !gearbox.diagramImage && (
                <button
                  onClick={() => setIsExploded(!isExploded)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    isExploded 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  )}
                >
                  {isExploded ? '🔓 Exploded View' : '🔒 Collapsed View'}
                </button>
              )}
              
              {/* View Type Badge */}
              {gearbox?.diagramImage && (
                <div className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  📋 Technical Reference
                </div>
              )}
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(90vh-100px)]">
            {/* Interactive Diagram Area */}
            <div className="flex-1 relative p-6 overflow-hidden">
              {/* Background Grid */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Transmission Type Badge */}
              <div className="absolute top-4 left-4 z-20">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider",
                    gearbox?.transmissionType === 'CVT' && "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
                    gearbox?.transmissionType === 'DCT' && "bg-purple-500/20 text-purple-300 border border-purple-500/30",
                    gearbox?.transmissionType === 'AT' && "bg-blue-500/20 text-blue-300 border border-blue-500/30",
                    gearbox?.transmissionType === 'MT' && "bg-orange-500/20 text-orange-300 border border-orange-500/30",
                  )}
                >
                  {gearbox?.gearCount ? `${gearbox.gearCount}-Speed ` : ''}{gearbox?.transmissionType}
                </motion.div>
              </div>

              {/* Loading/Scanning Animation */}
              {showAnimation && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 1.2, duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center z-30"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-24 h-24 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 mx-auto mb-4"
                    />
                    <p className="text-emerald-400 font-medium">Analyzing Transmission...</p>
                  </div>
                </motion.div>
              )}

              {/* Parts Diagram - Show image if available, otherwise show node diagram */}
              <div className="relative w-full h-full">
                {gearbox?.diagramImage ? (
                  /* Technical Diagram Image View */
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center p-4"
                  >
                    <div className="relative w-full h-full bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                      {/* Diagram Image */}
                      <img 
                        src={gearbox.diagramImage}
                        alt={`${gearbox.gearboxFamily} Technical Diagram`}
                        className="w-full h-full object-contain p-4"
                      />
                      
                      {/* Image Overlay Badge */}
                      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-600">
                        <p className="text-xs text-slate-400">Technical Reference Diagram</p>
                        <p className="text-sm font-semibold text-white">{gearbox.manufacturer} {gearbox.gearboxFamily}</p>
                      </div>
                      
                      {/* Zoom Controls */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button 
                          className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-600 text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
                          title="Zoom functionality coming soon"
                        >
                          🔍
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Node-based Interactive Diagram */
                  gearbox?.parts.map((part, index) => {
                    const config = CATEGORY_CONFIG[part.category] || CATEGORY_CONFIG.GEAR;
                    const yOffset = getExplodedOffset(part.layer);
                    const isHighlighted = activeLayer === null || activeLayer === part.layer;
                    const isSelected = selectedPart?.id === part.id;

                    return (
                      <motion.div
                        key={part.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: isHighlighted ? 1 : 0.3,
                          scale: 1,
                          y: yOffset,
                          x: 0
                        }}
                        transition={{ 
                          delay: showAnimation ? 0.5 + index * 0.05 : 0,
                          type: "spring",
                          damping: 20,
                          stiffness: 300
                        }}
                        className="absolute cursor-pointer group"
                        style={{
                          left: `${part.position.x}%`,
                          top: `${part.position.y}%`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: part.layer + (isSelected ? 100 : 0),
                        }}
                        onClick={() => setSelectedPart(isSelected ? null : part)}
                        onMouseEnter={() => setActiveLayer(part.layer)}
                        onMouseLeave={() => setActiveLayer(null)}
                      >
                        {/* Part Node */}
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all shadow-lg",
                            isSelected 
                              ? "border-emerald-400 bg-emerald-500 ring-4 ring-emerald-400/30" 
                              : `${RISK_COLORS[part.failureRisk]} border-opacity-50`,
                            "hover:ring-4 hover:ring-white/20"
                          )}
                        >
                          <config.icon className={cn(
                            "w-5 h-5",
                            isSelected ? "text-white" : config.color
                          )} />
                        </motion.div>

                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl border border-slate-700">
                            <p className="font-semibold">{part.name}</p>
                            <p className="text-slate-400">Layer {part.layer} • {part.failureRisk} Risk</p>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                        </div>

                        {/* Connection Lines (for adjacent layers) */}
                        {isExploded && part.layer < maxLayer && (
                          <svg 
                            className="absolute pointer-events-none opacity-30"
                            style={{ 
                              width: '2px', 
                              height: '30px',
                              left: '50%',
                              top: '100%',
                              transform: 'translateX(-50%)'
                            }}
                          >
                            <line x1="1" y1="0" x2="1" y2="30" stroke="white" strokeDasharray="4,4" />
                          </svg>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Info Sidebar */}
            <div className="w-80 bg-slate-800/50 border-l border-slate-700 p-6 overflow-y-auto">
              {/* Gearbox Info */}
              {gearbox && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-white">{gearbox.parts.length}</p>
                      <p className="text-xs text-slate-400">Components</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-red-400">{highRiskParts.length}</p>
                      <p className="text-xs text-slate-400">High Risk</p>
                    </div>
                  </div>

                  {/* Calibration Risk */}
                  <div className={cn(
                    "rounded-xl p-4 border",
                    gearbox.calibrationRisk === 'CRITICAL' && "bg-red-500/10 border-red-500/30",
                    gearbox.calibrationRisk === 'HIGH' && "bg-orange-500/10 border-orange-500/30",
                    gearbox.calibrationRisk === 'MODERATE' && "bg-yellow-500/10 border-yellow-500/30",
                    gearbox.calibrationRisk === 'LOW' && "bg-emerald-500/10 border-emerald-500/30",
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={cn(
                        "w-5 h-5",
                        gearbox.calibrationRisk === 'CRITICAL' && "text-red-400",
                        gearbox.calibrationRisk === 'HIGH' && "text-orange-400",
                        gearbox.calibrationRisk === 'MODERATE' && "text-yellow-400",
                        gearbox.calibrationRisk === 'LOW' && "text-emerald-400",
                      )} />
                      <span className="text-white font-semibold text-sm">Calibration Risk</span>
                    </div>
                    <p className={cn(
                      "text-lg font-bold",
                      gearbox.calibrationRisk === 'CRITICAL' && "text-red-400",
                      gearbox.calibrationRisk === 'HIGH' && "text-orange-400",
                      gearbox.calibrationRisk === 'MODERATE' && "text-yellow-400",
                      gearbox.calibrationRisk === 'LOW' && "text-emerald-400",
                    )}>
                      {gearbox.calibrationRisk}
                    </p>
                  </div>

                  {/* Service Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Service Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fluid Type</span>
                        <span className="text-white font-medium">{gearbox.fluidType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Capacity</span>
                        <span className="text-white font-medium">{gearbox.fluidCapacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Interval</span>
                        <span className="text-white font-medium">{gearbox.serviceInterval}</span>
                      </div>
                    </div>
                  </div>

                  {/* Common Issues */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Known Issues</h4>
                    <div className="space-y-2">
                      {gearbox.commonIssues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Part Details */}
                  <AnimatePresence mode="wait">
                    {selectedPart && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                          <span className="text-white font-semibold text-sm">Selected Component</span>
                        </div>
                        <h5 className="text-white font-bold mb-2">{selectedPart.name}</h5>
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-400">
                            Category: <span className="text-slate-200">{selectedPart.category}</span>
                          </p>
                          <p className="text-slate-400">
                            Layer: <span className="text-slate-200">{selectedPart.layer}</span>
                          </p>
                          <p className="text-slate-400">
                            Risk: <span className={cn(
                              selectedPart.failureRisk === 'HIGH' && "text-red-400",
                              selectedPart.failureRisk === 'MEDIUM' && "text-amber-400",
                              selectedPart.failureRisk === 'LOW' && "text-emerald-400",
                            )}>{selectedPart.failureRisk}</span>
                          </p>
                          <p className="text-slate-400">
                            Serviceable: <span className="text-slate-200">{selectedPart.isServiceable ? 'Yes' : 'No'}</span>
                          </p>
                          {selectedPart.notes && (
                            <p className="text-amber-300 mt-2 text-xs italic">
                              ⚠️ {selectedPart.notes}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Layer Filter */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Layer Filter</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setActiveLayer(null)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          activeLayer === null 
                            ? "bg-emerald-500 text-white" 
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        )}
                      >
                        All
                      </button>
                      {Array.from({ length: maxLayer }, (_, i) => i + 1).map(layer => (
                        <button
                          key={layer}
                          onClick={() => setActiveLayer(activeLayer === layer ? null : layer)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                            activeLayer === layer 
                              ? "bg-emerald-500 text-white" 
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          )}
                        >
                          L{layer}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No Gearbox Found */}
              {!gearbox && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Info className="w-12 h-12 text-slate-500 mb-4" />
                  <p className="text-slate-400">
                    No transmission data found for this vehicle.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default GearboxDiagram;
