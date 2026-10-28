/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  DepartmentNode,
  OrgLevelInfo,
  TelemetryPoint,
  SimulationParameters,
} from '../types/simulation';
import {
  BarChart3,
  X,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface AnalyticsInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDepartment: DepartmentNode | null;
  selectedLevel: OrgLevelInfo | null;
  telemetryHistory: TelemetryPoint[];
  currentTelemetry: TelemetryPoint;
  parameters: SimulationParameters;
  onSelectLevel: (levelId: number | null) => void;
}

export const AnalyticsInspector: React.FC<AnalyticsInspectorProps> = ({
  isOpen,
  onClose,
  selectedDepartment,
  selectedLevel,
  telemetryHistory,
  currentTelemetry,
  parameters,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  // Generate SVG path for live telemetry throughput sparkline
  const svgWidth = 260;
  const svgHeight = 70;
  const points = telemetryHistory.slice(-20);
  const minVal = Math.min(...points.map(p => p.systemThroughput), 1000);
  const maxVal = Math.max(...points.map(p => p.systemThroughput), 5000);

  const pathD = points
    .map((pt, idx) => {
      const x = (idx / (points.length - 1 || 1)) * svgWidth;
      const y = svgHeight - ((pt.systemThroughput - minVal) / (maxVal - minVal || 1)) * (svgHeight - 14) - 7;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <aside className="fixed top-18 right-4 bottom-24 w-92 max-w-[calc(100vw-32px)] z-30 pointer-events-auto flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Live Telemetry Analytics</h2>
            <p className="text-[11px] text-slate-400">Real-time simulation sync</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Selected Department or Level Inspector Card */}
        {selectedDepartment ? (
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span
                style={{ backgroundColor: selectedDepartment.color + '22', color: selectedDepartment.color }}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-current"
              >
                Level {selectedDepartment.levelId} Pod
              </span>
              <span className="text-[11px] text-slate-400">{selectedDepartment.category}</span>
            </div>

            <h3 className="text-sm font-bold text-white">{selectedDepartment.name}</h3>

            <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Headcount</div>
                <div className="text-xs font-bold text-slate-200">{selectedDepartment.headcount}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Throughput</div>
                <div className="text-xs font-bold text-cyan-400">{selectedDepartment.throughput}/hr</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Health</div>
                <div className="text-xs font-bold text-emerald-400">{selectedDepartment.health}%</div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 mb-0.5 font-medium">Active Strategic Initiative</div>
              <div className="text-xs font-medium text-slate-200 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                {selectedDepartment.activeInitiative}
              </div>
            </div>

            {selectedDepartment.blockers.length > 0 && (
              <div className="bg-rose-950/40 border border-rose-800/60 p-2 rounded-lg text-rose-300">
                <div className="flex items-center gap-1 font-semibold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Active Cross-Team Blocker
                </div>
                <div className="text-[11px] mt-0.5 text-rose-200">
                  {selectedDepartment.blockers.join(', ')}
                </div>
              </div>
            )}
          </div>
        ) : selectedLevel ? (
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-500/40 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Selected Architectural Tier
            </div>
            <h3 className="text-sm font-bold text-white">{selectedLevel.name}</h3>
            <p className="text-slate-300 text-[11px]">{selectedLevel.description}</p>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">{selectedLevel.kpis.primaryMetric}</div>
                <div className="text-xs font-bold text-cyan-400">{selectedLevel.kpis.primaryValue}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Tier Efficiency</div>
                <div className="text-xs font-bold text-emerald-400">{selectedLevel.kpis.efficiency}%</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 text-[11px]">
            Click any 3D Level floor or Department Pod to inspect localized metrics and active blockers.
          </div>
        )}

        {/* Global Live Telemetry Sparkline */}
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Ingestion Throughput</span>
            </div>
            <span className="font-mono text-cyan-400 font-bold">
              {currentTelemetry.systemThroughput.toFixed(0)} ops/s
            </span>
          </div>

          {/* SVG sparkline */}
          <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800/80">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-16 overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>-60s</span>
              <span>Live Now</span>
            </div>
          </div>
        </div>

        {/* Real-time KPI Metric Matrix */}
        <div className="grid grid-cols-2 gap-2">
          {/* Efficiency Index */}
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Alignment Index
            </div>
            <div className="text-base font-bold font-mono text-emerald-400">
              {currentTelemetry.efficiencyIndex.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500">
              Baseline: 88.0% (+{(currentTelemetry.efficiencyIndex - 88).toFixed(1)}%)
            </div>
          </div>

          {/* Cycle Time */}
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              E2E Cycle Time
            </div>
            <div className="text-base font-bold font-mono text-cyan-400">
              {currentTelemetry.cycleTimeHours.toFixed(2)}h
            </div>
            <div className="text-[10px] text-slate-500">
              Handoff: {parameters.crossDeptLatency}x delay
            </div>
          </div>

          {/* Error Rate */}
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Incident Anomaly
            </div>
            <div className="text-base font-bold font-mono text-rose-400">
              {currentTelemetry.errorRatePercent.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500">
              Budget: 5.0% SLA
            </div>
          </div>

          {/* Revenue Generated */}
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Value Velocity
            </div>
            <div className="text-base font-bold font-mono text-amber-400">
              ${(currentTelemetry.revenuePerMin / 1000).toFixed(1)}k/min
            </div>
            <div className="text-[10px] text-slate-500">
              Demand: {parameters.workloadDemand}%
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
