/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HistoricalSnapshot, SimulationParameters } from '../types/simulation';
import { History, Calendar, CheckCircle, TrendingUp, AlertOctagon, ArrowRight, Play } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface HistoricalViewOverlayProps {
  snapshots: HistoricalSnapshot[];
  selectedSnapshot: HistoricalSnapshot;
  onSelectSnapshot: (snapshot: HistoricalSnapshot) => void;
  onApplySnapshotToLive: (params: SimulationParameters) => void;
  onClose: () => void;
}

export const HistoricalViewOverlay: React.FC<HistoricalViewOverlayProps> = ({
  snapshots,
  selectedSnapshot,
  onSelectSnapshot,
  onApplySnapshotToLive,
  onClose,
}) => {
  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-30 pointer-events-auto" style={{ width: 'min(880px, 92vw)' }}>
      <div className="bg-slate-900/98 border border-amber-500/40 rounded-2xl p-4 shadow-2xl shadow-black/90 text-slate-100 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Historical Data Archive</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Read-Only Telemetry
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Compare past organizational states, crisis drill records, and peak production periods
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
          >
            <span>Return to Live Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Snapshot selector chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {snapshots.map(snap => (
            <button
              key={snap.id}
              onClick={() => {
                onSelectSnapshot(snap);
                soundEngine.playSelect();
              }}
              className={`p-3 rounded-xl text-left border transition-all ${
                selectedSnapshot.id === snap.id
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-950/40'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  {snap.date}
                </span>
                <span className="font-mono text-amber-400 font-bold">{snap.avgEfficiency}% Eff</span>
              </div>
              <div className="text-xs font-bold text-white line-clamp-1">{snap.title}</div>
            </button>
          ))}
        </div>

        {/* Selected snapshot deep-dive card */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">{selectedSnapshot.title}</h3>
              <p className="text-xs text-slate-300 mt-0.5">{selectedSnapshot.description}</p>
            </div>

            <button
              onClick={() => {
                onApplySnapshotToLive(selectedSnapshot.parameters);
                soundEngine.playStart();
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Clone Parameters into Live</span>
            </button>
          </div>

          {/* Historical Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 font-mono text-center">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Avg Alignment</div>
              <div className="text-sm font-bold text-amber-400">{selectedSnapshot.avgEfficiency}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Peak Throughput</div>
              <div className="text-sm font-bold text-cyan-400">{selectedSnapshot.peakThroughput} ops/s</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Incident Events</div>
              <div className="text-sm font-bold text-rose-400">{selectedSnapshot.incidentCount} logged</div>
            </div>
          </div>

          {/* Key Event Highlights */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Post-Incident Retrospective Highlights
            </div>
            <ul className="space-y-1">
              {selectedSnapshot.summaryHighlights.map((hl, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
