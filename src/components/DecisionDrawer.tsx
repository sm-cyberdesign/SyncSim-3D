/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  FileDown,
  FileUp,
  RotateCcw,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { ScenarioInjectPart, DecisionRecord } from '../types/exercise';
import { soundEngine } from '../utils/audio';

interface DecisionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentInject: ScenarioInjectPart;
  decisionsMap: Record<string, DecisionRecord>;
  onSaveDecision: (record: DecisionRecord) => void;
  onExportAuditLog: () => void;
  onImportAuditLog: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetExercise: () => void;
  allInjectParts: ScenarioInjectPart[];
  onSelectInjectPart: (index: number) => void;
}

export const DecisionDrawer: React.FC<DecisionDrawerProps> = ({
  isOpen,
  onClose,
  currentInject,
  decisionsMap,
  onSaveDecision,
  onExportAuditLog,
  onImportAuditLog,
  onResetExercise,
  allInjectParts,
  onSelectInjectPart,
}) => {
  const [viewTab, setViewTab] = useState<'current' | 'history'>('current');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [authorizedBy, setAuthorizedBy] = useState<string>('Incident Commander');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Sync state when currentInject changes
  React.useEffect(() => {
    const existing = decisionsMap[currentInject.id];
    if (existing) {
      setSelectedOptionId(existing.selectedOptionId || '');
      setRationale(existing.playerRationale || '');
      setAuthorizedBy(existing.authorizedBy || 'Incident Commander');
    } else {
      setSelectedOptionId('');
      setRationale('');
      setAuthorizedBy('Incident Commander');
    }
  }, [currentInject.id, decisionsMap]);

  if (!isOpen) return null;

  const decisionPrompt = currentInject.decisionPrompt;
  const currentRecord = decisionsMap[currentInject.id];

  const handleSave = () => {
    if (!decisionPrompt) return;
    const record: DecisionRecord = {
      injectPartId: currentInject.id,
      decisionPrompt: decisionPrompt.prompt,
      options: decisionPrompt.options,
      selectedOptionId: selectedOptionId || undefined,
      playerRationale: rationale,
      authorizedBy: authorizedBy,
      recordedAtTimestamp: new Date().toLocaleTimeString(),
    };
    onSaveDecision(record);
    soundEngine.playResolution();
  };

  const totalDecisionsCount = Object.keys(decisionsMap).filter(k => decisionsMap[k]?.selectedOptionId).length;

  return (
    <aside
      className="fixed top-18 right-4 bottom-24 z-30 pointer-events-auto flex flex-col bg-slate-900/98 border border-slate-800 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden text-slate-100 transition-all duration-300"
      style={{ width: 'min(500px, calc(100vw - 32px))' }}
      aria-label="Tabletop Decisions & Governance Record"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Exercise Decision Record
              </h2>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-[11px] font-mono tabular-nums text-emerald-400">
                {totalDecisionsCount} of 15 Decided
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Tabletop governance actions & accountability</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Decisions Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1">
        <button
          onClick={() => setViewTab('current')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            viewTab === 'current'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <span>Current Inject ({currentInject.id})</span>
        </button>
        <button
          onClick={() => setViewTab('history')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            viewTab === 'history'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <span>Audit Log & Export</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {viewTab === 'current' ? (
          decisionPrompt ? (
            <div className="space-y-4">
              {/* Context Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Strategic Problem
                </span>
                <p className="text-xs font-bold text-white leading-snug">
                  {decisionPrompt.prompt}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800">
                  {decisionPrompt.governanceContext}
                </p>
              </div>

              {/* Options Radio List */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Action Pathways (Select Team Response)
                </span>

                {decisionPrompt.options.map(opt => {
                  const isSelected = selectedOptionId === opt.id;

                  return (
                    <label
                      key={opt.id}
                      className={`block p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-slate-800/80 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="decision-option"
                          checked={isSelected}
                          onChange={() => setSelectedOptionId(opt.id)}
                          className="mt-0.5 text-emerald-500 focus:ring-emerald-400"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-white text-xs">{opt.label}</span>
                            <span
                              className={`text-[10px] font-mono capitalize ${
                                opt.impactScore === 'positive'
                                  ? 'text-emerald-400'
                                  : opt.impactScore === 'neutral'
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              Impact: {opt.impactScore}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">{opt.summary}</p>

                          {/* Multi-tier Impact Breakdown */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                            <div>
                              <span className="text-amber-400 font-semibold block">Tier 4 (Governance):</span>
                              <span className="text-slate-400">{opt.tierImpact.tier4}</span>
                            </div>
                            <div>
                              <span className="text-cyan-400 font-semibold block">Tier 3 (SOC/IR):</span>
                              <span className="text-slate-400">{opt.tierImpact.tier3}</span>
                            </div>
                            <div>
                              <span className="text-purple-400 font-semibold block">Tier 2 (Infra):</span>
                              <span className="text-slate-400">{opt.tierImpact.tier2}</span>
                            </div>
                            <div>
                              <span className="text-rose-400 font-semibold block">Tier 1 (Customer):</span>
                              <span className="text-slate-400">{opt.tierImpact.tier1}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Rationale & Sign-off Fields */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Team Operational Rationale & Statutory Justification
                  </label>
                  <textarea
                    rows={3}
                    value={rationale}
                    onChange={e => setRationale(e.target.value)}
                    placeholder="Document why the team chose this option, regulatory trade-offs considered, and mitigation steps..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Authorized Sign-Off Officer
                  </label>
                  <select
                    value={authorizedBy}
                    onChange={e => setAuthorizedBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                  >
                    <option value="Incident Commander">Incident Commander (Tier 3 Authorization)</option>
                    <option value="Sarah Chen, CISO">Sarah Chen, Chief Information Security Officer</option>
                    <option value="Marcus Vance, CRO">Marcus Vance, Chief Risk Officer & Legal Counsel</option>
                    <option value="CEO & Board Executive Committee">CEO & Board Executive Committee (Tier 4 Approval)</option>
                  </select>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Decision to Exercise Audit Record</span>
                </button>

                {currentRecord?.recordedAtTimestamp && (
                  <p className="text-[11px] text-center text-slate-400">
                    Logged at {currentRecord.recordedAtTimestamp} by {currentRecord.authorizedBy}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-600" />
              <p>No decision prompt configured for this specific inject.</p>
            </div>
          )
        ) : (
          /* Audit History & JSON Export/Import Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Exercise Timeline ({totalDecisionsCount} of 15 Decided)
              </span>

              <button
                onClick={onExportAuditLog}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center gap-1.5 transition-colors"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* List of all parts */}
            <div className="space-y-2">
              {allInjectParts.map(inj => {
                const rec = decisionsMap[inj.id];
                const hasDecision = Boolean(rec?.selectedOptionId);
                const opt = inj.decisionPrompt?.options.find(o => o.id === rec?.selectedOptionId);

                return (
                  <div
                    key={inj.id}
                    onClick={() => onSelectInjectPart(inj.partIndex)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      inj.id === currentInject.id
                        ? 'bg-slate-800 border-cyan-500'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-white text-xs">
                        Inject {inj.id}: {inj.injectTitle.replace(/^Inject [0-9.AB]+: /, '')}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase ${
                          hasDecision ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {hasDecision ? 'Decided' : 'Pending'}
                      </span>
                    </div>

                    {opt ? (
                      <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800 mt-1.5 space-y-0.5">
                        <strong className="text-emerald-400 block">{opt.label}</strong>
                        {rec.playerRationale && (
                          <p className="text-slate-400 text-[10px] italic">
                            "{rec.playerRationale}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 italic mt-0.5">
                        Awaiting team deliberation and governance record.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Import & Reset Section */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Session Persistence & Data Management
              </span>

              <div className="flex items-center gap-2">
                <label className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <FileUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Import JSON Record</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportAuditLog}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="py-2 px-3 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reset All</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmed Reset Modal */}
      {showResetConfirm && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/60 rounded-2xl p-4 max-w-sm w-full space-y-3 text-slate-100 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Confirm Exercise Reset</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will clear all logged tabletop decisions, reset evidence release states, and return to Part 1. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetExercise();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/50"
              >
                Yes, Reset Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
