'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Users, 
  TrendingUp, 
  DollarSign, 
  FileSearch,
  Wrench,
  ShieldAlert,
  BookOpen,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { KnownIssue, IssueMatch, knownIssuesService } from '@/services';
import type { VINDecoded } from '@/types';

interface KnownIssuesDisplayProps {
  vinData: VINDecoded;
  activeDTCs?: string[];
  symptoms?: string[];
}

export function KnownIssuesDisplay({ vinData, activeDTCs = [], symptoms = [] }: KnownIssuesDisplayProps) {
  const [issueMatches, setIssueMatches] = useState<IssueMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadKnownIssues();
  }, [vinData, activeDTCs, symptoms]);

  const loadKnownIssues = async () => {
    setLoading(true);
    try {
      const matches = await knownIssuesService.findIssuesByVehicle(
        vinData,
        undefined, // currentMileage - can be added later if available
        activeDTCs
      );
      setIssueMatches(matches);
    } catch (error) {
      console.error('Failed to load known issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: KnownIssue['severity']) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MODERATE': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getFrequencyColor = (frequency: KnownIssue['frequency']) => {
    switch (frequency) {
      case 'VERY_COMMON': return 'text-red-600 bg-red-50';
      case 'COMMON': return 'text-orange-600 bg-orange-50';
      case 'OCCASIONAL': return 'text-amber-600 bg-amber-50';
      case 'RARE': return 'text-blue-600 bg-blue-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toLocaleString('en-MY')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-byki-primary"></div>
          <span className="text-slate-600">Checking Known Issues Database...</span>
        </div>
      </div>
    );
  }

  if (issueMatches.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center gap-3 text-emerald-600">
          <CheckCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold text-lg">No Known Issues Found</h3>
            <p className="text-sm text-slate-600">No widespread issues reported for this vehicle configuration.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-6 h-6 text-orange-600" />
          <h3 className="font-bold text-xl text-orange-900">Community Known Issues</h3>
        </div>
        <p className="text-orange-700 text-sm">
          {issueMatches.length} known issue{issueMatches.length > 1 ? 's' : ''} found with{' '}
          {issueMatches.reduce((sum, m) => sum + m.issue.reportCount, 0).toLocaleString()} community reports.
        </p>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {issueMatches.map((match, index) => {
            const issue = match.issue;
            const isExpanded = expandedId === issue.id;

            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden"
              >
                {/* Issue Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getFrequencyColor(issue.frequency)}`}>
                          {issue.frequency.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                          <Users className="w-3 h-3" />
                          {issue.reportCount.toLocaleString()} reports
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-lg text-slate-900 mb-1">{issue.title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{issue.description}</p>
                      
                      {/* Match Info */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          {match.matchConfidence}% Match
                        </div>
                        {match.matchedSymptoms.map((symptom, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            ✓ {symptom}
                          </span>
                        ))}
                        {match.matchedDTCs.map((dtc, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-mono">
                            {dtc}
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

                {/* Issue Details (Expanded) */}
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
                        {/* Affected Vehicles */}
                        <div>
                          <h5 className="font-semibold text-sm text-slate-700 mb-2">Affected Vehicles</h5>
                          <div className="flex flex-wrap gap-2">
                            {issue.models.map(model => (
                              <span key={model} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm">
                                {model}
                              </span>
                            ))}
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm">
                              {issue.years.join(', ')}
                            </span>
                            {issue.transmissionTypes?.map(trans => (
                              <span key={trans} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm">
                                {trans}
                              </span>
                            ))}
                          </div>
                          {issue.mileageRange && (
                            <p className="text-xs text-slate-500 mt-2">
                              Typically occurs at {issue.mileageRange.min.toLocaleString()}-{issue.mileageRange.max.toLocaleString()} km
                            </p>
                          )}
                        </div>

                        {/* Symptoms */}
                        <div>
                          <h5 className="font-semibold text-sm text-slate-700 mb-2">Common Symptoms</h5>
                          <ul className="space-y-1">
                            {issue.symptoms.map((symptom, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span>
                                {symptom}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Root Cause */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="font-semibold text-sm text-blue-900 mb-2">Root Cause</h5>
                          <p className="text-sm text-blue-800">{issue.rootCause}</p>
                        </div>

                        {/* Common Misdiagnosis Warning */}
                        {issue.commonMisdiagnosis.length > 0 && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h5 className="font-semibold text-sm text-red-900 mb-2 flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4" />
                              ⚠️ Common Misdiagnosis (AVOID)
                            </h5>
                            <ul className="space-y-1">
                              {issue.commonMisdiagnosis.map((misdiag, i) => (
                                <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  {misdiag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Diagnosis Steps */}
                        <div>
                          <h5 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
                            <FileSearch className="w-4 h-4" />
                            Diagnosis Procedure
                          </h5>
                          <ol className="space-y-2">
                            {issue.diagnosis.map((step, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="font-semibold text-byki-primary min-w-[20px]">{i + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Repair Solution */}
                        <div>
                          <h5 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
                            <Wrench className="w-4 h-4" />
                            Repair Solution
                          </h5>
                          <ol className="space-y-2">
                            {issue.repairSolution.map((step, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="font-semibold text-emerald-600 min-w-[20px]">{i + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Preventive Maintenance */}
                        {issue.preventiveMaintenance.length > 0 && (
                          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <h5 className="font-semibold text-sm text-emerald-900 mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Preventive Maintenance
                            </h5>
                            <ul className="space-y-1">
                              {issue.preventiveMaintenance.map((step, i) => (
                                <li key={i} className="text-sm text-emerald-800 flex items-start gap-2">
                                  <span className="text-emerald-500 mt-1">✓</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Estimated Cost */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-white rounded-lg border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">Parts</div>
                            <div className="text-lg font-bold text-slate-900">
                              {formatCurrency(issue.estimatedCost.parts)}
                            </div>
                          </div>
                          <div className="p-4 bg-white rounded-lg border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">Labor</div>
                            <div className="text-lg font-bold text-slate-900">
                              {formatCurrency(issue.estimatedCost.labor)}
                            </div>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-byki-primary to-purple-600 rounded-lg text-white">
                            <div className="text-xs opacity-90 mb-1">Total Estimate</div>
                            <div className="text-lg font-bold">
                              {formatCurrency(issue.estimatedCost.total)}
                            </div>
                          </div>
                        </div>

                        {/* References */}
                        {issue.references.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              References & Reports
                            </h5>
                            <div className="space-y-2">
                              {issue.references.map((ref, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                                >
                                  <div className="text-sm text-slate-700">{ref}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Community Stats */}
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3 h-3" />
                            {issue.reportCount.toLocaleString()} confirmed cases
                          </span>
                          <span>Updated: {new Date(issue.lastUpdated).toLocaleDateString('en-MY')}</span>
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
