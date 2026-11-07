/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileText,
  AlertOctagon,
  HelpCircle,
  CheckCircle,
  Shield,
  X,
  Lock,
  Unlock,
  Terminal,
} from 'lucide-react';
import { ScenarioInjectPart } from '../types/exercise';
import { soundEngine } from '../utils/audio';

interface FacilitatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentInject: ScenarioInjectPart;
  releasedEvidenceIds: Set<string>;
  onToggleReleaseEvidence: (packetId: string) => void;
  onSelectInjectPart: (index: number) => void;
  allInjectParts: ScenarioInjectPart[];
}

export const FacilitatorDrawer: React.FC<FacilitatorDrawerProps> = ({
  isOpen,
  onClose,
  currentInject,
  releasedEvidenceIds,
  onToggleReleaseEvidence,
  onSelectInjectPart,
  allInjectParts,
}) => {
  if (!isOpen) return null;

  const guidance = currentInject.facilitatorGuidance;

  return (
    <aside
      className="fixed top-18 right-4 bottom-24 z-30 pointer-events-auto flex flex-col bg-slate-900/98 border border-amber-600/60 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden text-slate-100 transition-all duration-300"
      style={{ width: 'min(500px, calc(100vw - 32px))' }}
      aria-label="Facilitator Exercise Control & Secret Inject Guide"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Facilitator Control & Inject Guide
              </h2>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-[11px] text-amber-400 font-mono">
                Director Eyes Only
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Exercise guidance, traps, and evidence release</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Facilitator Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Production RBAC Architecture Notice */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 leading-tight">
        <strong className="text-amber-400">Architecture Notice:</strong> In this client demonstration, facilitator privileges are simulated in the browser. In production enterprise exercises, facilitator controls and unreleased injects are strictly enforced via server-authoritative RBAC.
      </div>

      {/* Content Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {/* Quick Inject Switcher */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Jump to Delivery Part (15 Parts Total)
          </span>
          <select
            value={currentInject.partIndex}
            onChange={e => onSelectInjectPart(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
          >
            {allInjectParts.map(inj => (
              <option key={inj.id} value={inj.partIndex}>
                Part {inj.partIndex + 1} ({inj.id}) — {inj.injectTitle.replace(/^Inject [0-9.AB]+: /, '')}
              </option>
            ))}
          </select>
        </div>

        {/* Evidence Packets Release Section */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wide">
              <FileText className="w-4 h-4" />
              <span>Evidence Packets for this Inject</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentInject.evidencePackets.length} Available
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {currentInject.evidencePackets.map(pkt => {
              const isReleased = releasedEvidenceIds.has(pkt.id);

              return (
                <div
                  key={pkt.id}
                  className={`p-3 rounded-xl border transition-colors ${
                    isReleased
                      ? 'bg-slate-900 border-cyan-500/70'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{pkt.title}</span>
                        <span className="text-slate-500 text-xs">·</span>
                        <span className="text-[11px] text-slate-400 font-mono uppercase">
                          {pkt.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{pkt.summary}</p>
                    </div>

                    <button
                      onClick={() => {
                        onToggleReleaseEvidence(pkt.id);
                        soundEngine.playSelect();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                        isReleased
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-sm'
                      }`}
                    >
                      {isReleased ? (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Revoke</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3" />
                          <span>Release to Players</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Technical details snippet */}
                  <ul className="text-[11px] text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {pkt.technicalDetails.map((td, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-slate-600">·</span>
                        <span>{td}</span>
                      </li>
                    ))}
                  </ul>

                  {pkt.rawSnippet && (
                    <div className="mt-2 p-2 rounded-lg bg-black/70 border border-slate-800 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                      <code>{pkt.rawSnippet}</code>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Adversary Behind-the-Scenes */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs uppercase tracking-wide">
            <Terminal className="w-4 h-4 text-rose-400" />
            <span>Adversary Behind-the-Scenes (Glass Heron & Raven)</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            {guidance.adversaryStrategy}
          </p>
        </div>

        {/* Deliberate Tabletop Traps */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wide">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span>Deliberate Traps for Participants</span>
          </div>
          <ul className="space-y-1 text-slate-300 text-xs">
            {guidance.deliberateTraps.map((trap, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">·</span>
                <span>{trap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Probing Discussion Questions */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wide">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Facilitator Probing Discussion Questions</span>
          </div>
          <ol className="space-y-1.5 text-slate-300 text-xs list-decimal list-inside">
            {guidance.probingQuestions.map((q, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="text-slate-200">{q}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Expected Decisions & Sound Playbook Actions */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs uppercase tracking-wide">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Expected Decisions & Playbook Benchmarks</span>
          </div>
          <ul className="space-y-1 text-slate-300 text-xs">
            {guidance.expectedDecisions.map((ed, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{ed}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Regulatory Statutes (clean unboxed text with separators) */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Governing Regulatory Statutes
          </span>
          <div className="text-slate-300 text-xs flex flex-wrap items-center gap-x-2 gap-y-1">
            {guidance.regulatoryConsiderations.map((reg, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-600">·</span>}
                <span className="font-mono text-[11px] text-cyan-300">{reg}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
