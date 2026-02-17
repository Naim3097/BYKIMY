'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  FileText, 
  Wrench, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  Users
} from 'lucide-react';
import { TSB, TSBMatch, tsbService } from '@/services';
import type { VINDecoded } from '@/types';

interface TSBDisplayProps {
  vinData: VINDecoded;
  activeDTCs?: string[];
}

export function TSBDisplay({ vinData, activeDTCs = [] }: TSBDisplayProps) {
  const [tsbMatches, setTSBMatches] = useState<TSBMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadTSBs();
  }, [vinData, activeDTCs]);

  const loadTSBs = async () => {
    setLoading(true);
    try {
      const matches = await tsbService.findTSBsByVIN(vinData, activeDTCs);
      setTSBMatches(matches);
    } catch (error) {
      console.error('Failed to load TSBs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: TSB['severity']) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MODERATE': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'INFO': return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: TSB['severity']) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="w-5 h-5" />;
      case 'HIGH': return <AlertTriangle className="w-5 h-5" />;
      case 'MODERATE': return <Info className="w-5 h-5" />;
      case 'INFO': return <FileText className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-byki-primary"></div>
          <span className="text-slate-600">Checking Technical Service Bulletins...</span>
        </div>
      </div>
    );
  }

  if (tsbMatches.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center gap-3 text-emerald-600">
          <CheckCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold text-lg">No TSBs Found</h3>
            <p className="text-sm text-slate-600">No known technical service bulletins for this vehicle.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-3">
          <FileText className="w-6 h-6 text-purple-600" />
          <h3 className="font-bold text-xl text-purple-900">Technical Service Bulletins</h3>
        </div>
        <p className="text-purple-700 text-sm">
          {tsbMatches.length} manufacturer bulletin{tsbMatches.length > 1 ? 's' : ''} found for this vehicle.
          {activeDTCs.length > 0 && ` Matched with ${activeDTCs.length} active DTCs.`}
        </p>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {tsbMatches.map((match, index) => {
            const tsb = match.tsb;
            const isExpanded = expandedId === tsb.id;

            return (
              <motion.div
                key={tsb.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden"
              >
                {/* TSB Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : tsb.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(tsb.severity)}`}>
                          <div className="flex items-center gap-1.5">
                            {getSeverityIcon(tsb.severity)}
                            {tsb.severity}
                          </div>
                        </span>
                        <span className="text-sm font-mono text-slate-600">{tsb.tsbNumber}</span>
                        <span className="text-xs text-slate-500">{new Date(tsb.bulletinDate).toLocaleDateString('en-MY')}</span>
                      </div>
                      <h4 className="font-semibold text-lg text-slate-900 mb-1">{tsb.title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{tsb.summary}</p>
                      
                      {/* Match Info */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-1.5 text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          {match.matchConfidence}% Match
                        </div>
                        {match.matchReason.map((reason, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        ▼
                      </motion.div>
                    </button>
                  </div>
                </div>

                {/* TSB Details (Expanded) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-slate-200"
                    >
                      <div className="p-5 space-y-4 bg-slate-50">
                        {/* Affected Models */}
                        <div>
                          <h5 className="font-semibold text-sm text-slate-700 mb-2">Affected Models</h5>
                          <div className="flex flex-wrap gap-2">
                            {tsb.affectedModels.map(model => (
                              <span key={model} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm">
                                {model}
                              </span>
                            ))}
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm">
                              {tsb.affectedYears.join(', ')}
                            </span>
                          </div>
                        </div>

                        {/* Symptoms */}
                        {tsb.symptoms.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-sm text-slate-700 mb-2">Symptoms</h5>
                            <ul className="space-y-1">
                              {tsb.symptoms.map((symptom, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                  <span className="text-amber-500 mt-1">•</span>
                                  {symptom}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Related DTCs */}
                        {tsb.relatedDTCs.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-sm text-slate-700 mb-2">Related DTCs</h5>
                            <div className="flex flex-wrap gap-2">
                              {tsb.relatedDTCs.map(dtc => {
                                const isActive = activeDTCs.includes(dtc);
                                return (
                                  <span 
                                    key={dtc} 
                                    className={`px-3 py-1 rounded-lg text-sm font-mono ${
                                      isActive 
                                        ? 'bg-red-100 text-red-700 border border-red-300' 
                                        : 'bg-white border border-slate-200'
                                    }`}
                                  >
                                    {dtc} {isActive && '(Active)'}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Repair Procedure */}
                        <div>
                          <h5 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
                            <Wrench className="w-4 h-4" />
                            Repair Procedure
                          </h5>
                          <ol className="space-y-2">
                            {tsb.repairProcedure.map((step, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="font-semibold text-byki-primary min-w-[20px]">{i + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Parts Required */}
                        {tsb.partsRequired.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-sm text-slate-700 mb-2">Parts Required</h5>
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                  <tr>
                                    <th className="text-left p-2 font-semibold">Part Number</th>
                                    <th className="text-left p-2 font-semibold">Description</th>
                                    <th className="text-center p-2 font-semibold">Qty</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tsb.partsRequired.map((part, i) => (
                                    <tr key={i} className="border-t border-slate-100">
                                      <td className="p-2 font-mono text-xs">{part.partNumber}</td>
                                      <td className="p-2">{part.description}</td>
                                      <td className="p-2 text-center">{part.quantity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Labor Hours */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-slate-600" />
                            <span className="font-semibold text-slate-700">Estimated Labor</span>
                          </div>
                          <span className="text-lg font-bold text-byki-primary">{tsb.laborHours} hour{tsb.laborHours > 1 ? 's' : ''}</span>
                        </div>

                        {/* Data Source */}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Source: {tsb.dataSource}</span>
                          {tsb.url && (
                            <a href={tsb.url} target="_blank" rel="noopener noreferrer" className="text-byki-primary hover:underline">
                              View Official Bulletin →
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
