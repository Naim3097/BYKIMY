'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Accordion } from '@/components/ui/Accordion';
import { decodeVIN } from '@/lib/vin-decoder.service';
import { findGearboxByVehicle, GearboxInfo } from '@/lib/gearbox-database';
import { VINDecoded } from '@/lib/diagnostic.types';
import {
  findKnownIssues,
  findTSBs,
  severityLabel,
  tsbSeverityVariant,
  frequencyLabel,
  type IssueMatch,
  type TSBMatch,
} from '@/lib/known-issues';
import {
  searchDTCs,
  lookupDTC,
  dtcSeverityVariant,
  dtcCategoryLabel,
  dtcDifficultyLabel,
  type DTCFaultCode,
} from '@/lib/dtc-lookup';

/* ─── Helpers ──────────────────────────────────────────── */
function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-xs font-bold text-byki-dark-gray/60 uppercase tracking-wide mb-1">{label}</span>
      <p className="text-[15px] font-bold text-byki-black">{children}</p>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────── */
export default function VinDecoderPage() {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VINDecoded | null>(null);
  const [gearbox, setGearbox] = useState<GearboxInfo | null>(null);
  const [knownIssues, setKnownIssues] = useState<IssueMatch[]>([]);
  const [tsbs, setTsbs] = useState<TSBMatch[]>([]);
  const [error, setError] = useState('');

  // DTC lookup state
  const [dtcQuery, setDtcQuery] = useState('');
  const [dtcResults, setDtcResults] = useState<DTCFaultCode[]>([]);
  const [dtcLoading, setDtcLoading] = useState(false);
  const [dtcSearched, setDtcSearched] = useState(false);

  function handleDecode() {
    setError('');
    setResult(null);
    setGearbox(null);
    setKnownIssues([]);
    setTsbs([]);
    setLoading(true);

    try {
      if (!vin || vin.length !== 17) {
        throw new Error('Please enter a valid 17-character VIN.');
      }

      const decoded = decodeVIN(vin.trim());

      if (!decoded) {
        throw new Error('Could not decode this VIN. Please check and try again.');
      }

      setResult(decoded);

      // Gearbox lookup
      const foundGearbox = findGearboxByVehicle(
        decoded.brand, decoded.model, decoded.engineCode, decoded.transmissionType,
      );
      if (foundGearbox) {
        setGearbox(foundGearbox);
      } else {
        const partial = findGearboxByVehicle(decoded.brand, decoded.model, undefined, decoded.transmissionType);
        if (partial) setGearbox(partial);
      }

      // Known issues
      setKnownIssues(findKnownIssues(decoded));

      // TSBs
      setTsbs(findTSBs(decoded));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while decoding.');
    } finally {
      setLoading(false);
    }
  }

  const handleDTCSearch = useCallback(async () => {
    if (!dtcQuery.trim()) return;
    setDtcLoading(true);
    setDtcSearched(true);
    try {
      const code = dtcQuery.trim().toUpperCase();
      if (/^[PBCU]\d{4}$/.test(code)) {
        const exact = await lookupDTC(code);
        if (exact) {
          setDtcResults([exact]);
          return;
        }
      }
      const results = await searchDTCs(dtcQuery, 15);
      setDtcResults(results);
    } catch {
      setDtcResults([]);
    } finally {
      setDtcLoading(false);
    }
  }, [dtcQuery]);

  return (
    <div className="bg-byki-light-gray min-h-screen pb-24">

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-byki-light-gray">
        <Container>
          <div className="max-w-3xl">
            <SectionLabel>Intelligence</SectionLabel>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-byki-black leading-[1.1]">
              VIN <span className="text-byki-green">Decoder</span>
            </h1>
            <p className="mt-6 text-lg text-byki-dark-gray max-w-2xl leading-relaxed">
              Enter your 17-character VIN to decode factory specs, transmission data, known issues, TSBs, and more.
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <div className="space-y-10">

          {/* ── VIN Input Card ──────────────────────────── */}
          <div className="bg-white rounded-2xl border border-byki-medium-gray/50 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <div className="space-y-4">
              <label htmlFor="vin-input" className="block text-sm font-bold text-byki-black">
                Vehicle Identification Number (VIN)
              </label>
              <div className="flex gap-3 flex-col md:flex-row">
                <input
                  id="vin-input"
                  type="text"
                  className="flex-1 rounded-xl bg-byki-light-gray border border-byki-medium-gray/50 px-5 py-4 text-lg font-mono uppercase tracking-widest text-byki-black placeholder:text-byki-dark-gray/40 focus:ring-2 focus:ring-byki-green/30 focus:border-byki-green outline-none transition"
                  placeholder="ENTER 17-DIGIT VIN"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && vin.length === 17 && handleDecode()}
                  maxLength={17}
                />
                <Button
                  onClick={handleDecode}
                  disabled={loading || vin.length !== 17}
                  variant="primary"
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {loading ? 'Decoding...' : 'Decode'}
                </Button>
              </div>
            </div>
            {error && (
              <div className="mt-4 rounded-xl p-4 bg-red-50 text-red-600 border border-red-100 text-sm flex items-center gap-2">
                <span className="font-bold">Error:</span>
                <span>{error}</span>
              </div>
            )}
            <p className="mt-4 text-xs text-byki-dark-gray/60">
              * Supports most Malaysian market vehicles including Perodua, Proton, Toyota, Honda, and more.
            </p>
          </div>

          {/* ── Results ────────────────────────────────── */}
          {result && (
            <div className="space-y-8">

              {/* ── Vehicle Identity ───────────────────── */}
              <div className="bg-white rounded-2xl border border-byki-medium-gray/50 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <h2 className="text-xl font-bold text-byki-black mb-6 pb-4 border-b border-byki-medium-gray/30">
                  Vehicle Identity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoField label="Manufacturer">{result.manufacturer}</InfoField>
                  <InfoField label="Model">
                    <span className="flex items-center gap-2">
                      {result.brand} {result.model}
                      <span className="rounded-full bg-byki-green/10 text-byki-green text-xs px-2 py-0.5 font-bold">
                        {result.modelYear}
                      </span>
                    </span>
                  </InfoField>
                  <InfoField label="Engine">{result.engineType} ({result.engineCode})</InfoField>
                  <InfoField label="Transmission">
                    {result.transmissionType}{result.driveType ? ` · ${result.driveType}` : ''}
                  </InfoField>
                  <InfoField label="Assembly">
                    <span className="font-mono text-byki-dark-gray">{result.plantCity}, {result.plantCountry}</span>
                  </InfoField>
                  <InfoField label="Body / Market">
                    <span className="font-mono text-byki-dark-gray">{result.bodyStyle} / {result.marketRegion}</span>
                  </InfoField>
                </div>
              </div>

              {/* ── Transmission Profile ───────────────── */}
              <div className="bg-white rounded-2xl border border-byki-medium-gray/50 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-byki-medium-gray/30">
                  <h2 className="text-xl font-bold text-byki-black">Transmission Profile</h2>
                  {gearbox ? (
                    <Badge variant="success">Identified</Badge>
                  ) : (
                    <Badge variant="warning">Not Verified</Badge>
                  )}
                </div>

                {gearbox ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <InfoField label="Type">{gearbox.transmissionType} / {gearbox.gearboxFamily}</InfoField>
                        <InfoField label="Manufacturer"><span className="font-mono text-sm">{gearbox.manufacturer}</span></InfoField>
                        <InfoField label="Fluid"><span className="font-mono text-sm">{gearbox.fluidType}</span></InfoField>
                        <InfoField label="Capacity"><span className="font-mono text-sm">{gearbox.fluidCapacity}</span></InfoField>
                        <InfoField label="Service"><span className="font-mono text-sm">{gearbox.serviceInterval}</span></InfoField>
                        <InfoField label="Tools">
                          {gearbox.requiresSpecialTool ? (
                            <span className="text-red-600 font-bold text-sm">Required</span>
                          ) : (
                            <span className="text-byki-green font-bold text-sm">Not Required</span>
                          )}
                        </InfoField>
                      </div>

                      <div className="bg-byki-light-gray rounded-xl p-4 border border-byki-medium-gray/30">
                        <h3 className="font-bold text-sm text-byki-black mb-2">Common Issues</h3>
                        {gearbox.commonIssues && gearbox.commonIssues.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1 text-sm text-byki-dark-gray">
                            {gearbox.commonIssues.map((issue, idx) => (
                              <li key={idx}>{issue}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-byki-dark-gray/60">No common issues reported.</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-byki-dark-green text-white rounded-xl p-6">
                        <h3 className="text-sm text-white/60 mb-1">Calibration Risk</h3>
                        <div className="text-3xl font-bold">{gearbox.calibrationRisk}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl p-4 border border-byki-medium-gray/50 bg-byki-light-gray">
                          <span className="block text-xs font-bold text-byki-dark-gray/60 uppercase mb-1">Gears</span>
                          <span className="text-2xl font-bold text-byki-black">{gearbox.gearCount > 0 ? gearbox.gearCount : 'CVT'}</span>
                        </div>
                        <div className="rounded-xl p-4 border border-byki-medium-gray/50 bg-byki-light-gray">
                          <span className="block text-xs font-bold text-byki-dark-gray/60 uppercase mb-1">Adaptation</span>
                          {gearbox.supportsAdaptiveReset ? (
                            <span className="text-byki-green font-bold">Supported</span>
                          ) : (
                            <span className="text-byki-dark-gray">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-byki-light-gray rounded-xl border border-dashed border-byki-medium-gray">
                    <h3 className="font-bold text-byki-dark-gray mb-2">Gearbox Data Not Found</h3>
                    <p className="text-byki-dark-gray/60 max-w-sm mx-auto text-sm">
                      We identified the vehicle as a <strong>{result.brand} {result.model}</strong>, but don&apos;t have a gearbox match for this variant yet.
                    </p>
                  </div>
                )}
              </div>

              {/* ── Known Issues ───────────────────────── */}
              <div className="bg-white rounded-2xl border border-byki-medium-gray/50 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-byki-medium-gray/30">
                  <h2 className="text-xl font-bold text-byki-black">Known Issues</h2>
                  <Badge variant={knownIssues.length > 0 ? 'danger' : 'success'}>
                    {knownIssues.length} {knownIssues.length === 1 ? 'Issue' : 'Issues'}
                  </Badge>
                </div>

                {knownIssues.length > 0 ? (
                  <div className="space-y-3">
                    {knownIssues.map(({ issue, matchScore, matchFactors }) => (
                      <Accordion key={issue.id} title={issue.title}>
                        <div className="space-y-5 pt-4">
                          {/* Meta row */}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="danger">{severityLabel(issue.severity)}</Badge>
                            <Badge variant="gray">{frequencyLabel(issue.frequency)}</Badge>
                            <Badge variant="gray">{issue.category}</Badge>
                            <span className="text-byki-dark-gray/50 text-xs px-2 py-0.5">{matchScore}% match</span>
                          </div>

                          {/* Description */}
                          <p className="text-[15px] text-byki-dark-gray leading-relaxed">{issue.description}</p>

                          {/* Root Cause */}
                          <div>
                            <h4 className="text-xs font-bold text-byki-dark-gray/60 uppercase mb-2">Root Cause</h4>
                            <p className="text-byki-dark-gray bg-byki-light-gray rounded-xl p-4 border-l-2 border-byki-green">
                              {issue.rootCause}
                            </p>
                          </div>

                          {/* Symptoms */}
                          <div>
                            <h4 className="text-xs font-bold text-byki-dark-gray/60 uppercase mb-2">Symptoms</h4>
                            <ul className="bg-byki-light-gray rounded-xl p-4 space-y-2">
                              {issue.symptoms.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-byki-dark-gray">
                                  <span className="text-byki-green font-bold">›</span> {s}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Related DTCs */}
                          {issue.relatedDTCs.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-byki-dark-gray/60 uppercase mb-2">Related DTCs</h4>
                              <div className="flex flex-wrap gap-2">
                                {issue.relatedDTCs.map(dtc => (
                                  <span key={dtc} className="bg-byki-light-gray text-byki-dark-gray px-2 py-1 font-mono text-sm rounded-lg border border-byki-medium-gray/50">
                                    {dtc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Repair Solution */}
                          <div>
                            <h4 className="text-xs font-bold text-byki-dark-gray/60 uppercase mb-2">Repair Solution</h4>
                            <ol className="list-decimal list-inside space-y-2 text-byki-dark-gray text-sm font-medium">
                              {issue.repairSolution.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ol>
                          </div>

                          {/* Misdiagnosis warning */}
                          {issue.commonMisdiagnosis.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-900 text-sm">
                              <h4 className="font-bold text-xs uppercase mb-2">Common Misdiagnosis</h4>
                              <ul className="space-y-1">
                                {issue.commonMisdiagnosis.map((m, i) => (
                                  <li key={i}>&bull; {m}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Cost + mileage + reports row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-byki-medium-gray/30 pt-4">
                            <div>
                              <span className="text-xs font-bold text-byki-dark-gray/60 uppercase block mb-1">Est. Cost</span>
                              <p className="font-mono font-bold text-byki-black">RM {issue.estimatedCost.total.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-byki-dark-gray/60 uppercase block mb-1">Mileage Range</span>
                              <p className="font-mono text-byki-dark-gray">
                                {issue.mileageRange ? `${(issue.mileageRange.min / 1000).toFixed(0)}k – ${(issue.mileageRange.max / 1000).toFixed(0)}k km` : '—'}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-byki-dark-gray/60 uppercase block mb-1">Reports</span>
                              <p className="font-mono text-byki-dark-gray">{issue.reportCount.toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Match factors */}
                          <div className="text-xs text-byki-dark-gray/40 font-mono">
                            Matched by: {matchFactors.join(', ')} · Source: {issue.dataSource} · Updated: {issue.lastUpdated}
                          </div>
                        </div>
                      </Accordion>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-byki-light-gray rounded-xl border border-dashed border-byki-medium-gray">
                    <h3 className="font-bold text-byki-dark-gray mb-2">No Known Issues</h3>
                    <p className="text-byki-dark-gray/60 max-w-sm mx-auto text-sm">
                      We don&apos;t have any known issues on file for this {result.brand} {result.model} ({result.modelYear}).
                    </p>
                  </div>
                )}
              </div>

              {/* ── TSBs ───────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-byki-medium-gray/50 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-byki-medium-gray/30">
                  <h2 className="text-xl font-bold text-byki-black">Technical Service Bulletins</h2>
                  <Badge variant={tsbs.length > 0 ? 'primary' : 'success'}>
                    {tsbs.length} TSB{tsbs.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {tsbs.length > 0 ? (
                  <div className="space-y-6">
                    {tsbs.map(({ tsb, matchScore, matchFactors }) => (
                      <div key={tsb.id} className="border-b border-byki-medium-gray/30 last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-byki-black">{tsb.tsbNumber}</span>
                              <Badge variant={tsbSeverityVariant(tsb.severity)}>{tsb.severity}</Badge>
                              <Badge variant="default">{tsb.category}</Badge>
                            </div>
                            <h3 className="font-bold text-lg text-byki-black">{tsb.title}</h3>
                          </div>
                          <span className="text-xs font-mono text-byki-dark-gray/50">{tsb.bulletinDate}</span>
                        </div>

                        <p className="text-byki-dark-gray mb-4">{tsb.summary}</p>

                        {/* Symptoms */}
                        {tsb.symptoms.length > 0 && (
                          <div className="mb-4 text-sm">
                            <span className="font-bold text-byki-dark-gray/60 text-xs uppercase">Symptoms: </span>
                            <span className="font-medium text-byki-dark-gray">{tsb.symptoms.join(' · ')}</span>
                          </div>
                        )}

                        {/* Repair procedure */}
                        <div className="bg-byki-light-gray rounded-xl p-4 border border-byki-medium-gray/30 text-sm">
                          <strong className="block mb-2 text-xs text-byki-dark-gray/60 uppercase">Repair Procedure</strong>
                          <ol className="list-decimal list-inside space-y-1 mb-3 text-byki-dark-gray">
                            {tsb.repairProcedure.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                          <div className="flex justify-between text-xs text-byki-dark-gray/50 font-mono">
                            <span>Labour: {tsb.laborHours}h</span>
                            <span>Source: {tsb.dataSource}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-byki-light-gray rounded-xl border border-dashed border-byki-medium-gray">
                    <h3 className="font-bold text-byki-dark-gray mb-2">No TSBs Found</h3>
                    <p className="text-byki-dark-gray/60 max-w-sm mx-auto text-sm">
                      No technical service bulletins match this {result.brand} {result.model} ({result.modelYear}).
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── DTC Lookup Section (always visible) ──── */}
          <div className="pt-8">
            <div className="bg-byki-dark-green text-white rounded-2xl p-8 md:p-12 overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">DTC Lookup</h2>
                    <p className="text-white/60 max-w-xl text-[15px]">
                      Search the BYKI diagnostic database — enter a DTC code (e.g. P0420) or keyword.
                    </p>
                  </div>
                  <span className="hidden md:block font-mono text-white/40 text-sm">4,565+ codes</span>
                </div>

                <div className="flex flex-col md:flex-row gap-3 mb-10">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-lg font-mono uppercase tracking-widest text-white placeholder:text-white/30 focus:outline-none focus:border-byki-green focus:bg-white/15 transition-all"
                      value={dtcQuery}
                      onChange={(e) => setDtcQuery(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleDTCSearch()}
                      placeholder="P0420, MISFIRE, CATALYST..."
                    />
                  </div>
                  <Button
                    onClick={handleDTCSearch}
                    disabled={dtcLoading || !dtcQuery.trim()}
                    variant="primary"
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    {dtcLoading ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {/* DTC Results */}
                {dtcSearched && (
                  <div className="space-y-4">
                    {dtcResults.length > 0 ? (
                      dtcResults.map(dtc => (
                        <div key={dtc.code} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold font-mono text-byki-green">{dtc.code}</span>
                              <Badge variant={dtcSeverityVariant(dtc.severity)}>
                                {dtc.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="secondary" className="bg-white/10 text-white border-none">{dtcCategoryLabel(dtc.category)}</Badge>
                            </div>
                            <span className="text-xs text-white/40">{dtc.system}</span>
                          </div>

                          <p className="text-lg font-bold mb-2">{dtc.official_description}</p>
                          <p className="text-white/70 mb-6 text-[15px]">{dtc.user_explanation}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                            <div>
                              <h4 className="text-xs font-bold text-white/40 uppercase mb-2">Common Causes</h4>
                              <ul className="space-y-1 text-sm text-white/80">
                                {dtc.common_causes.slice(0, 4).map((c, i) => (
                                  <li key={i} className="flex gap-2">
                                    <span className="text-byki-green">›</span> {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white/40 uppercase mb-2">Workshop Diagnosis</h4>
                              <p className="text-sm text-white/60">{dtc.workshop_diagnosis}</p>
                            </div>
                          </div>

                          <div className="flex gap-6 pt-4 border-t border-white/10 text-xs font-mono text-white/50">
                            <span>Cost: RM {dtc.estimated_cost.min}–{dtc.estimated_cost.max}</span>
                            <span>Labour: {dtc.labor_hours}h</span>
                            <span>Difficulty: {dtcDifficultyLabel(dtc.repair_difficulty)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-white/40 border border-white/10 border-dashed rounded-xl">
                        <p>No matching DTC codes found for &ldquo;{dtcQuery}&rdquo;</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 pb-8">
            <p className="text-xs text-byki-dark-gray/50">
              BYKI Diagnostic Data Services · 4,565+ DTCs · Last Updated Feb 2026
            </p>
          </div>

        </div>
      </Container>
    </div>
  );
}
