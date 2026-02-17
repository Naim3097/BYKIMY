'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gauge, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Clock,
  Database,
  ShieldAlert
} from 'lucide-react';
import { MileageAnalysis, mileageVerificationService } from '@/services';
import type { VINDecoded } from '@/types';

interface MileageVerificationDisplayProps {
  vin: string;
  vinData: VINDecoded;
  clusterOdometer?: number;
  ecmOdometer?: number;
}

export function MileageVerificationDisplay({ 
  vin,
  vinData, 
  clusterOdometer, 
  ecmOdometer 
}: MileageVerificationDisplayProps) {
  const [analysis, setAnalysis] = useState<MileageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clusterOdometer !== undefined || ecmOdometer !== undefined) {
      performAnalysis();
    }
  }, [vin, vinData, clusterOdometer, ecmOdometer]);

  const performAnalysis = async () => {
    setLoading(true);
    try {
      const currentMileage = ecmOdometer || clusterOdometer || 0;
      const odometerSource = ecmOdometer ? 'ECM' : clusterOdometer ? 'CLUSTER' : 'MANUAL';
      
      const result = await mileageVerificationService.analyzeMileage(
        vin,
        currentMileage,
        vinData,
        odometerSource as 'ECM' | 'CLUSTER' | 'MANUAL'
      );
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze mileage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (risk: MileageAnalysis['riskLevel']) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-amber-500';
      case 'LOW': return 'bg-blue-500';
      case 'NONE': return 'bg-emerald-500';
    }
  };

  const getRiskLevelBgColor = (risk: MileageAnalysis['riskLevel']) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-50 border-red-200';
      case 'HIGH': return 'bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'bg-amber-50 border-amber-200';
      case 'LOW': return 'bg-blue-50 border-blue-200';
      case 'NONE': return 'bg-emerald-50 border-emerald-200';
    }
  };

  const getRiskLevelTextColor = (risk: MileageAnalysis['riskLevel']) => {
    switch (risk) {
      case 'CRITICAL': return 'text-red-900';
      case 'HIGH': return 'text-orange-900';
      case 'MEDIUM': return 'text-amber-900';
      case 'LOW': return 'text-blue-900';
      case 'NONE': return 'text-emerald-900';
    }
  };

  const getRiskIcon = (risk: MileageAnalysis['riskLevel']) => {
    switch (risk) {
      case 'CRITICAL':
      case 'HIGH':
        return <ShieldAlert className="w-6 h-6" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-6 h-6" />;
      case 'LOW':
        return <Info className="w-6 h-6" />;
      case 'NONE':
        return <CheckCircle className="w-6 h-6" />;
    }
  };

  // If no odometer data available
  if (!clusterOdometer && !ecmOdometer) {
    return (
      <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 text-slate-600">
          <Info className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">Mileage Verification Not Available</h3>
            <p className="text-xs text-slate-500">Connect to vehicle ECM to verify odometer readings.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-byki-primary"></div>
          <span className="text-slate-600">Analyzing Mileage Data...</span>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className={`rounded-2xl p-6 border ${getRiskLevelBgColor(analysis.riskLevel)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={getRiskLevelTextColor(analysis.riskLevel)}>
              {getRiskIcon(analysis.riskLevel)}
            </div>
            <div>
              <h3 className={`font-bold text-xl ${getRiskLevelTextColor(analysis.riskLevel)}`}>
                Mileage Verification
              </h3>
              <p className={`text-sm ${getRiskLevelTextColor(analysis.riskLevel)} opacity-80`}>
                {analysis.verified ? '✓ Verified' : '⚠ Anomaly Detected'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getRiskLevelTextColor(analysis.riskLevel)}`}>
              {analysis.riskLevel}
            </div>
            <div className="text-xs opacity-70">Risk Level</div>
          </div>
        </div>

        {/* Risk Level Bar */}
        <div className="h-2 bg-white bg-opacity-50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analysis.riskScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full ${getRiskLevelColor(analysis.riskLevel)}`}
          />
        </div>
        <div className="flex justify-between text-xs mt-1 opacity-70">
          <span>Risk Score</span>
          <span className="font-semibold">{analysis.riskScore}%</span>
        </div>
      </div>

      {/* Odometer Readings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cluster Odometer */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-slate-700">Dashboard</span>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {clusterOdometer?.toLocaleString() || 'N/A'} km
          </div>
          <div className="text-xs text-slate-500 mt-1">Instrument Cluster Reading</div>
        </div>

        {/* ECM Odometer */}
        {ecmOdometer && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-slate-700">ECM Memory</span>
              </div>
              {analysis.discrepancy && Math.abs(analysis.discrepancy) > 1000 ? (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {ecmOdometer.toLocaleString()} km
            </div>
            <div className="text-xs text-slate-500 mt-1">Engine Control Module</div>
          </div>
        )}
      </div>

      {/* Discrepancy Alert */}
      {analysis.discrepancy && Math.abs(analysis.discrepancy) > 100 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">Mileage Discrepancy Detected</h4>
              <p className="text-sm text-red-800 mb-3">
                {Math.abs(analysis.discrepancy).toLocaleString()} km difference between dashboard and ECM.
                {analysis.discrepancy > 0 
                  ? ' Dashboard shows HIGHER mileage (unusual - possible ECM replacement).'
                  : ' Dashboard shows LOWER mileage (⚠ potential rollback).'}
              </p>
              <div className="text-xs text-red-700 bg-red-100 rounded-lg p-3">
                <strong>⚠ FRAUD WARNING:</strong> This pattern is consistent with odometer tampering.
                Recommend immediate physical inspection and VIN history check.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flags */}
      {analysis.flags.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5">
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Warning Flags
          </h4>
          <div className="space-y-2">
            {analysis.flags.map((flag, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-amber-600 mt-0.5">⚠</span>
                <div className="flex-1">
                  <div className="font-medium text-sm text-amber-900">{flag.type.replace('_', ' ')}</div>
                  <div className="text-xs text-amber-700 mt-1">{flag.description}</div>
                  <div className="text-xs text-amber-600 font-mono mt-1">Severity: {flag.severity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predicted Mileage */}
      {analysis.predictedMileage && (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5">
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-byki-primary" />
            Predicted Mileage Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Expected Mileage</div>
              <div className="text-xl font-bold text-slate-900">
                {analysis.predictedMileage.estimatedMileage.toLocaleString()} km
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Based on {vinData.modelYear ? new Date().getFullYear() - vinData.modelYear : 0} years
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Confidence Range</div>
              <div className="text-sm font-semibold text-slate-700">
                {analysis.predictedMileage.minExpected.toLocaleString()} -{' '}
                {analysis.predictedMileage.maxExpected.toLocaleString()} km
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {analysis.predictedMileage.confidence}% confidence
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Usage Pattern</div>
              <div className="text-lg font-semibold text-slate-900 capitalize">
                {analysis.predictedMileage.usage}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                ~{(analysis.predictedMileage.estimatedMileage / (new Date().getFullYear() - (vinData.modelYear || new Date().getFullYear()))).toFixed(0)} km/year
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5">
          <h4 className="font-semibold text-slate-900 mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Historical Data */}
      {analysis.historicalRecords.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5">
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            Mileage History
          </h4>
          <div className="space-y-2">
            {analysis.historicalRecords.slice(-5).reverse().map((record, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {record.mileage.toLocaleString()} km
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(record.recordedDate).toLocaleDateString('en-MY')}
                  </div>
                </div>
                <div className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded-full font-mono">
                  {record.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
