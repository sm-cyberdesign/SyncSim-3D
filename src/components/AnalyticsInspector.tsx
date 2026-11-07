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
  Server,
  Cpu,
  HardDrive,
  Thermometer,
  Network,
  Fan,
  Layers,
  Shield,
  DollarSign,
  Info,
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
  const svgHeight = 65;
  const points = telemetryHistory.slice(-20);
  const minVal = Math.min(...points.map(p => p.systemThroughput), 5000);
  const maxVal = Math.max(...points.map(p => p.systemThroughput), 25000);

  const pathD = points
    .map((pt, idx) => {
      const x = (idx / (points.length - 1 || 1)) * svgWidth;
      const y = svgHeight - ((pt.systemThroughput - minVal) / (maxVal - minVal || 1)) * (svgHeight - 14) - 7;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <aside
      className="fixed top-18 right-3 sm:right-4 bottom-24 z-30 pointer-events-auto flex flex-col bg-slate-900/98 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100 backdrop-blur-md transition-all duration-300"
      style={{ width: 'min(400px, calc(100vw - 32px))' }}
      aria-label="Banking Operational Telemetry Inspector"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Banking & Threat Telemetry
            </h2>
            <p className="text-[10px] text-slate-400">Meridian Trust operational telemetry</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Honest Defensible Metrics Disclaimer */}
      <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 text-[10px] text-slate-400">
        <Info className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
        <span>
          <strong>Simulation Values:</strong> Illustrative estimates. Data not yet certified by forensics is marked "Unknown".
        </span>
      </div>

      {/* Content Body */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
        {/* Core Banking Rail Telemetry */}
        <div className="rounded-xl p-3 bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Core Ledger & Settlement Rail
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {Math.round(currentTelemetry.systemThroughput).toLocaleString()} Tx/sec
            </span>
          </div>

          {/* Sparkline */}
          <div className="h-16 w-full flex items-center justify-center bg-slate-950/90 rounded-lg p-1.5 border border-slate-800/80">
            <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
              <defs>
                <linearGradient id="telemetryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={`${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`}
                fill="url(#telemetryGrad)"
              />
              <path
                d={pathD}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Settlement Latency:</span>
              <span className="text-cyan-300 font-mono font-bold">
                {(currentTelemetry.cycleTimeHours * 10).toFixed(1)} ms
              </span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Threat Anomaly Rate:</span>
              <span className="text-rose-400 font-mono font-bold">
                {currentTelemetry.errorRatePercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Financial & Liquidity Runway Buffer */}
        <div className="rounded-xl p-3 bg-slate-950/70 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            Intraday Balance Sheet Liquidity Buffer
          </span>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Primary Cash Reserves:</span>
              <span className="font-mono text-emerald-400 font-bold">$2.40 Billion</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Pending Outflow Inquiries:</span>
              <span className="font-mono text-amber-400 font-bold">$1.82 Billion</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Fed Discount Window Collateral:</span>
              <span className="font-mono text-cyan-400 font-bold">$4.10 Billion (Pledged)</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-amber-500 h-full w-[75%]" />
            </div>
            <span className="text-[10px] text-slate-500 block text-right">
              75% of primary cash buffer stressed
            </span>
          </div>
        </div>

        {/* Selected Department / Hardware Inspector */}
        {selectedDepartment ? (
          <div className="rounded-xl p-3 bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                Node Specification: {selectedDepartment.name}
              </span>
            </div>

            <p className="text-[11px] text-slate-300">{selectedDepartment.activeInitiative}</p>

            {selectedDepartment.hardware && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Chassis:</span>
                  <span className="text-slate-200 font-mono truncate max-w-[180px]">
                    {selectedDepartment.hardware.serverChassis}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Processor:</span>
                  <span className="text-slate-200 font-mono truncate max-w-[180px]">
                    {selectedDepartment.hardware.processor}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Memory:</span>
                  <span className="text-slate-200 font-mono">{selectedDepartment.hardware.memoryRam}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Storage / SAN:</span>
                  <span className="text-slate-200 font-mono">{selectedDepartment.hardware.storageSan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Operating Temp:</span>
                  <span className="text-emerald-400 font-mono">
                    {selectedDepartment.hardware.operatingTempC}°C
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-slate-500 text-[11px]">
            Click any 3D server rack or department node in the model to inspect hardware telemetry.
          </div>
        )}
      </div>
    </aside>
  );
};
