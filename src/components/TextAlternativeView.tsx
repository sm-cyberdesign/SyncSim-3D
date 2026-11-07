/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Layers,
  Shield,
  Bot,
  Compass,
  Server,
  Activity,
  FileText,
  CheckSquare,
} from 'lucide-react';
import { ScenarioInjectPart, TierDefinition } from '../types/exercise';
import { OrgLevelInfo } from '../types/simulation';

interface TextAlternativeViewProps {
  isOpen: boolean;
  onClose: () => void;
  currentInject: ScenarioInjectPart;
  levels: OrgLevelInfo[];
  tiers: TierDefinition[];
  releasedEvidenceIds: Set<string>;
}

export const TextAlternativeView: React.FC<TextAlternativeViewProps> = ({
  isOpen,
  onClose,
  currentInject,
  levels,
  tiers,
  releasedEvidenceIds,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Accessible Text Alternative View for Operation Silent Ledger"
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md overflow-y-auto p-4 md:p-8 text-slate-100 font-sans"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white">
                SyncSim 3D · Operation Silent Ledger (Accessible Text Alternative)
              </h1>
              <span className="text-slate-500 text-sm">·</span>
              <span className="text-xs text-cyan-400 font-medium">
                Meridian Trust Financial
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Screen reader accessible, non-WebGL structured representation of the 4-tier tabletop cybersecurity exercise.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Return to 3D Viewport"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Scenario Inject Status */}
        <section aria-labelledby="current-inject-title" className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
              Part {currentInject.partIndex + 1} of 15 (Inject {currentInject.id})
            </span>
            <span className="text-xs text-slate-400">
              Simulated Date/Time: <strong>{currentInject.simulatedDateTime}</strong> ({currentInject.incidentDate})
            </span>
          </div>

          <h2 id="current-inject-title" className="text-lg font-bold text-white">
            {currentInject.injectTitle}
          </h2>

          <div className="text-sm text-slate-300 space-y-2">
            <p><strong>Overview:</strong> {currentInject.overview}</p>
            <p><strong>Operational Impact:</strong> {currentInject.operationalImpact}</p>
          </div>

          {/* Technical Telemetry Table */}
          <div className="mt-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Technical Telemetry & Anomaly Metrics (Illustrative Estimates)
            </h3>
            <table className="w-full text-xs text-left border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-950 text-slate-400">
                  <th className="p-2 border border-slate-800">Metric Indicator</th>
                  <th className="p-2 border border-slate-800">Observed Value</th>
                  <th className="p-2 border border-slate-800">Verification Status</th>
                </tr>
              </thead>
              <tbody>
                {currentInject.technicalTelemetry.map((m, idx) => (
                  <tr key={idx} className="border border-slate-800 hover:bg-slate-800/40">
                    <td className="p-2 border border-slate-800 font-medium text-slate-300">{m.metricName}</td>
                    <td className="p-2 border border-slate-800 font-mono text-cyan-300">{m.value}</td>
                    <td className="p-2 border border-slate-800 text-slate-400">
                      {m.isEstimatedOrUnknown ? 'Unknown / Pending Audit' : 'Telemetry Confirmed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4 Banking Tiers Status */}
        <section aria-labelledby="banking-tiers-heading" className="space-y-3">
          <h2 id="banking-tiers-heading" className="text-base font-bold text-white uppercase tracking-wider">
            Meridian Trust Financial — 4 Operational Tiers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {levels.map(lvl => {
              const tierDef = tiers.find(t => t.id === lvl.id);

              return (
                <div key={lvl.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white" style={{ color: lvl.accentColor }}>
                      Level {lvl.id}: {lvl.name.replace(/^Level [0-9]: /, '')}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {tierDef?.badge || 'NOMINAL'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{lvl.description}</p>
                  <p className="text-xs text-slate-300">
                    <strong>Stakeholders:</strong> {tierDef?.operationalStakeholder || 'Executive Staff'}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Active Departmental Nodes:
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {lvl.departments.map(dept => (
                        <li key={dept.id}>
                          <span className="font-semibold">{dept.name}</span>: {dept.activeInitiative} (Health: {dept.health}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Scripted AI Characters Dialogue */}
        <section aria-labelledby="ai-agents-heading" className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="ai-agents-heading" className="text-base font-bold text-white">
              Specialized AI Character Outputs (Scripted Simulation)
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              [Scripted Simulation Content]
            </span>
          </div>

          <div className="space-y-3">
            {currentInject.agentsOutput.map((ag, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span style={{ color: ag.badgeColor }}>{ag.agentName}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{ag.timestamp}</span>
                </div>
                {ag.metadataNotice && (
                  <span className="text-[10px] text-amber-400 font-mono block">
                    {ag.metadataNotice}
                  </span>
                )}
                <p className="text-xs text-slate-200 leading-relaxed">{ag.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Decision Prompt & Options */}
        {currentInject.decisionPrompt && (
          <section aria-labelledby="decision-heading" className="p-4 rounded-xl bg-slate-900 border border-emerald-800/40 space-y-3">
            <h2 id="decision-heading" className="text-base font-bold text-emerald-300">
              Exercise Decision Prompt
            </h2>
            <p className="text-sm font-semibold text-white">{currentInject.decisionPrompt.prompt}</p>
            <p className="text-xs text-slate-400">{currentInject.decisionPrompt.governanceContext}</p>

            <div className="space-y-2 pt-2">
              {currentInject.decisionPrompt.options.map(opt => (
                <div key={opt.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-bold text-white mb-1">
                    <span>{opt.label}</span>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">{opt.impactScore}</span>
                  </div>
                  <p className="text-slate-300 mb-1">{opt.summary}</p>
                  <p className="text-[11px] text-slate-400">
                    <strong>Tier 4:</strong> {opt.tierImpact.tier4} | <strong>Tier 3:</strong> {opt.tierImpact.tier3} | <strong>Tier 2:</strong> {opt.tierImpact.tier2} | <strong>Tier 1:</strong> {opt.tierImpact.tier1}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
