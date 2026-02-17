'use client';

import { useDiagnosticStore } from '@/store';
import { ConnectionPhase } from './phases/connection-phase';
import { BrandSelectPhase } from './phases/brand-select-phase';
import { VINPhase } from './phases/vin-phase';
import { TopologyPhase } from './phases/topology-phase';
import { DTCPhase } from './phases/dtc-phase';
import { LiveDataPhase } from './phases/live-data-phase';
import { AnalysisPhase } from './phases/analysis-phase';
import { ReportPhase } from './phases/report-phase';
import { PhaseNavigation } from './phase-navigation';

export function DiagnosticFlow() {
  const { currentPhase } = useDiagnosticStore();

  const renderPhase = () => {
    switch (currentPhase) {
      case 'CONNECTION':
        return <ConnectionPhase />;
      case 'BRAND_SELECT':
        return <BrandSelectPhase />;
      case 'VIN_DETECTION':
      case 'VEHICLE_PROFILE':
        return <VINPhase />;
      case 'TOPOLOGY_SCAN':
      case 'SYSTEM_DIAGNOSIS':
        return <TopologyPhase />;
      case 'LIVE_DATA':
        return <LiveDataPhase />;
      case 'ROOT_CAUSE_ANALYSIS':
      case 'ACTION_RECOMMENDATION':
        return <AnalysisPhase />;
      case 'DTC_CLEARING':
      case 'VALIDATION':
        return <DTCPhase />;
      case 'REPORT_GENERATION':
      case 'COMPLETE':
        return <ReportPhase />;
      default:
        return <ConnectionPhase />;
    }
  };

  return (
    <div className="flex flex-row h-full gap-6 overflow-hidden">
      <div className="w-[300px] flex-shrink-0 h-full overflow-y-auto pr-2">
        <PhaseNavigation />
      </div>
      <div className="flex-1 animate-fade-in h-full overflow-y-auto no-scrollbar rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
        {renderPhase()}
      </div>
    </div>
  );
}
