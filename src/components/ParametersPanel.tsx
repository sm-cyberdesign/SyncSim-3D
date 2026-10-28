/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  SimulationParameters,
  Collaborator,
  ParameterProposal,
} from '../types/simulation';
import {
  Sliders,
  X,
  Users,
  Check,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldAlert,
  Cpu,
  RotateCcw,
} from 'lucide-react';
import { INITIAL_PARAMETERS } from '../data/simulationData';
import { soundEngine } from '../utils/audio';

interface ParametersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: SimulationParameters;
  onUpdateParameters: (params: SimulationParameters) => void;
  collaborators: Collaborator[];
  proposals: ParameterProposal[];
  onVoteProposal: (proposalId: string, voteYes: boolean) => void;
  onApplyProposal: (proposal: ParameterProposal) => void;
  onCreateProposal: (title: string, changes: Partial<SimulationParameters>) => void;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  isOpen,
  onClose,
  parameters,
  onUpdateParameters,
  collaborators,
  proposals,
  onVoteProposal,
  onApplyProposal,
  onCreateProposal,
}) => {
  const [activeTab, setActiveTab] = useState<'parameters' | 'collaboration'>('parameters');
  const [newTitle, setNewTitle] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  if (!isOpen) return null;

  const handleSlider = (key: keyof SimulationParameters, value: number) => {
    onUpdateParameters({
      ...parameters,
      [key]: value,
    });
  };

  const handleReset = () => {
    onUpdateParameters(INITIAL_PARAMETERS);
    soundEngine.playSelect();
  };

  return (
    <aside className="fixed top-18 left-4 bottom-24 w-88 max-w-[calc(100vw-32px)] z-30 pointer-events-auto flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Simulation Controls</h2>
            <p className="text-[11px] text-slate-400">Refine parameters & align team</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 px-3 pt-2 gap-2 bg-slate-950/40">
        <button
          onClick={() => {
            setActiveTab('parameters');
            soundEngine.playSelect();
          }}
          className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'parameters'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Parameters
        </button>
        <button
          onClick={() => {
            setActiveTab('collaboration');
            soundEngine.playSelect();
          }}
          className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'collaboration'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Team Proposals</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-300">
            {proposals.length}
          </span>
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {activeTab === 'parameters' ? (
          <>
            {/* Quick Presets */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Scenario Presets
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    onUpdateParameters({
                      ...parameters,
                      workloadDemand: 100,
                      automationRate: 72,
                      crossDeptLatency: 1.2,
                      incidentRate: 3.5,
                    });
                    soundEngine.playSelect();
                  }}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-center font-medium border border-slate-700 hover:border-slate-600 transition-all"
                >
                  Balanced
                </button>
                <button
                  onClick={() => {
                    onUpdateParameters({
                      ...parameters,
                      workloadDemand: 175,
                      automationRate: 88,
                      crossDeptLatency: 0.8,
                      incidentRate: 2.0,
                    });
                    soundEngine.playSelect();
                  }}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 text-center font-medium border border-cyan-500/30 hover:border-cyan-500/60 transition-all"
                >
                  Peak Blitz
                </button>
                <button
                  onClick={() => {
                    onUpdateParameters({
                      ...parameters,
                      workloadDemand: 130,
                      automationRate: 50,
                      crossDeptLatency: 2.6,
                      incidentRate: 11.5,
                    });
                    soundEngine.playSelect();
                  }}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-rose-300 text-center font-medium border border-rose-500/30 hover:border-rose-500/60 transition-all"
                >
                  Stress Drill
                </button>
              </div>
            </div>

            {/* Slider 1: Workload Demand */}
            <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  Workload Demand
                </span>
                <span className="font-mono text-cyan-400 font-bold">{parameters.workloadDemand}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                step={5}
                value={parameters.workloadDemand}
                onChange={e => handleSlider('workloadDemand', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Low (20%)</span>
                <span>Nominal (100%)</span>
                <span>Surge (200%)</span>
              </div>
            </div>

            {/* Slider 2: Automation Rate */}
            <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  Automation Rate
                </span>
                <span className="font-mono text-emerald-400 font-bold">{parameters.automationRate}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={2}
                value={parameters.automationRate}
                onChange={e => handleSlider('automationRate', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Manual (10%)</span>
                <span>Autonomous (100%)</span>
              </div>
            </div>

            {/* Slider 3: Cross-Department Latency */}
            <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Dept Handoff Latency
                </span>
                <span className="font-mono text-amber-400 font-bold">{parameters.crossDeptLatency}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={3.0}
                step={0.1}
                value={parameters.crossDeptLatency}
                onChange={e => handleSlider('crossDeptLatency', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Agile (0.5x)</span>
                <span>Standard (1.2x)</span>
                <span>Siloed (3.0x)</span>
              </div>
            </div>

            {/* Slider 4: Incident Rate */}
            <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Incident / Anomaly Rate
                </span>
                <span className="font-mono text-rose-400 font-bold">{parameters.incidentRate}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={0.5}
                value={parameters.incidentRate}
                onChange={e => handleSlider('incidentRate', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Flawless (0%)</span>
                <span>Degraded (15%)</span>
              </div>
            </div>

            {/* Slider 5: R&D Budget Multiplier */}
            <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  R&D Budget Multiplier
                </span>
                <span className="font-mono text-purple-400 font-bold">{parameters.rdBudgetMultiplier}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={3.0}
                step={0.1}
                value={parameters.rdBudgetMultiplier}
                onChange={e => handleSlider('rdBudgetMultiplier', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Reset Defaults button */}
            <button
              onClick={handleReset}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-medium flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Baseline Parameters</span>
            </button>
          </>
        ) : (
          /* Multi-User Collaboration & Proposals Tab */
          <div className="space-y-3">
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
              <div className="text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Collaborative Decision Engine
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Team members propose parameter adjustments. Vote to reach consensus and automatically sync the live 3D simulation!
              </p>
            </div>

            {/* Proposals List */}
            {proposals.map(prop => (
              <div
                key={prop.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 space-y-2 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-100">{prop.title}</h3>
                    <div className="text-[10px] text-cyan-400 font-medium">By {prop.proposerName}</div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {prop.votesYes} For / {prop.votesNo} Against
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {prop.description}
                </p>

                {/* Proposed Changes Diff */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Object.entries(prop.changes).map(([k, v]) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono"
                    >
                      {k}: <strong className="text-white">{v}</strong>
                    </span>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onVoteProposal(prop.id, true);
                        soundEngine.playSelect();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 flex items-center gap-1 transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Vote Yes</span>
                    </button>
                    <button
                      onClick={() => {
                        onVoteProposal(prop.id, false);
                        soundEngine.playSelect();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 flex items-center gap-1 transition-colors"
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>Vote No</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onApplyProposal(prop);
                      soundEngine.playStart();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply Consensus</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Submit new proposal prompt */}
            <button
              onClick={() => setShowNewModal(true)}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-900/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Propose Current Parameters to Team</span>
            </button>
          </div>
        )}
      </div>

      {/* New Proposal Modal Modal */}
      {showNewModal && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
          <div className="text-xs font-bold text-white">Share Parameter Proposal</div>
          <input
            type="text"
            placeholder="Proposal title (e.g. Q4 Sprint Acceleration)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowNewModal(false)}
              className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (newTitle.trim()) {
                  onCreateProposal(newTitle.trim(), parameters);
                  setNewTitle('');
                  setShowNewModal(false);
                  soundEngine.playSelect();
                }
              }}
              disabled={!newTitle.trim()}
              className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs disabled:opacity-50"
            >
              Submit to Team
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
