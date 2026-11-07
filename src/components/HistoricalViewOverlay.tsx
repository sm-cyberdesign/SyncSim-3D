/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HistoricalSnapshot, SimulationParameters } from '../types/simulation';
import { History, Calendar, CheckCircle, TrendingUp, AlertOctagon, ArrowRight, Play, Server } from 'lucide-react';
import { soundEngine } from '../utils/audio';

import datacenterRacksImg from '../assets/images/datacenter_server_racks_1793152805912.jpg';
import edgeNocImg from '../assets/images/edge_network_noc_1793152806611.jpg';
import engineeringLabImg from '../assets/images/engineering_systems_lab_1793152806463.jpg';

interface HistoricalViewOverlayProps {
  snapshots: HistoricalSnapshot[];
  selectedSnapshot: HistoricalSnapshot;
  onSelectSnapshot: (snapshot: HistoricalSnapshot) => void;
  onApplySnapshotToLive: (params: SimulationParameters) => void;
  onClose: () => void;
}

const SNAPSHOT_IMAGES: Record<string, string> = {
  'snap-q4-blitz': engineeringLabImg,
  'snap-black-swan': datacenterRacksImg,
  'snap-post-agile': edgeNocImg,
};

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
          {snapshots.map(snap => {
            const img = SNAPSHOT_IMAGES[snap.id] || datacenterRacksImg;
            return (
              <button
                key={snap.id}
                onClick={() => {
                  onSelectSnapshot(snap);
                  soundEngine.playSelect();
                }}
                className={`p-2.5 rounded-xl text-left border transition-all overflow-hidden flex flex-col justify-between ${
                  selectedSnapshot.id === snap.id
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-950/40'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="relative h-14 w-full rounded-lg overflow-hidden mb-2 border border-slate-800">
                  <img src={img} alt={snap.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <span className="absolute bottom-1 left-1.5 text-[9px] font-mono text-amber-300 font-bold flex items-center gap-1">
                    <Server className="w-2.5 h-2.5" />
                    Archive {snap.date}
                  </span>
                </div>
                <div className="text-xs font-bold text-white line-clamp-1">{snap.title}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>{snap.incidentCount} incidents</span>
                  <span className="font-mono text-amber-400 font-bold">{snap.avgEfficiency}% Eff</span>
                </div>
              </button>
            );
          })}
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
