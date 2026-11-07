/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Compass,
  Shield,
  Layers,
  Bot,
  CheckSquare,
  Clock,
  ArrowRight,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface ExerciseFlowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExercise?: () => void;
}

export const ExerciseFlowGuideModal: React.FC<ExerciseFlowGuideModalProps> = ({
  isOpen,
  onClose,
  onStartExercise,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tabletop Exercise Flow & Architecture Guide"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div>
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              Tabletop Exercise Architecture · Operation Silent Ledger
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              How the Exercise Works & User Flow
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              A 5-phase operational loop connecting 3D infrastructure telemetry, specialized AI advisory, and executive governance.
            </p>
          </div>

          <button
            onClick={() => {
              onClose();
              soundEngine.playSelect();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Section 1: The 5-Phase Tabletop Loop */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-cyan-400">01.</span>
              <span>The Tabletop Incident Lifecycle</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {/* Step 1 */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono font-bold text-cyan-400 mb-1">
                    Phase 1
                  </div>
                  <div className="text-xs font-bold text-white mb-1">
                    Inject Delivery
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Scenario inject drops with simulated date/time. The 3D camera sweeps to the affected banking tier.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono font-bold text-cyan-400 mb-1">
                    Phase 2
                  </div>
                  <div className="text-xs font-bold text-white mb-1">
                    AI Correlation
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    SENTINEL evaluates alerts. COMPASS briefs executives. Raven leaves adversary footprints.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono font-bold text-amber-400 mb-1">
                    Phase 3
                  </div>
                  <div className="text-xs font-bold text-white mb-1">
                    Discussion Pause
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Simulation halts automatically. The team deliberates trade-offs between containment, liquidity, and customer impact.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono font-bold text-emerald-400 mb-1">
                    Phase 4
                  </div>
                  <div className="text-xs font-bold text-white mb-1">
                    Decision Record
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Authorized commander signs off on a strategy, logs operational rationale, and commits to the audit log.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono font-bold text-purple-400 mb-1">
                    Phase 5
                  </div>
                  <div className="text-xs font-bold text-white mb-1">
                    Downstream Cascade
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Next inject tests consequences: extortion demands, Wire freeze, branch panic, or regulatory summons.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Four Infrastructure Tiers */}
          <div className="border-t border-slate-800 pt-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-cyan-400">02.</span>
              <span>Meridian Trust Financial · 4 Infrastructure Tiers</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-cyan-400">Level 4 · Executive Crisis Team</span>
                  <span className="text-[10px] text-slate-500 font-mono">Governance & Legal</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Board of Directors, General Counsel, Chief Risk Officer, and Investor Relations. Governs regulatory reporting (SEC 8-K / NYDFS 72h) and ransomware payment policy.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400">Level 3 · SOC & Incident Response</span>
                  <span className="text-[10px] text-slate-500 font-mono">Security Operations</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Cyber Defense Center, Forensics Unit, Threat Intelligence, and IAM Operations. Controls credential revocation, host isolation, and perimeter defense.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-400">Level 2 · Banking Infrastructure</span>
                  <span className="text-[10px] text-slate-500 font-mono">Core Ledger & Vendor Links</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Core Banking DB, SWIFT/Fedwire Gateways, VEEAM immutable storage, and FinTech Partner API bridges. Vulnerable to lateral movement and ransomware encryption.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-rose-400">Level 1 · Customers, Branches & Payments</span>
                  <span className="text-[10px] text-slate-500 font-mono">Public Impact & Retail</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  42 Mid-Atlantic Branches, ATM Network, Mobile App, Commercial Wire Desk, and Customer Contact Center. Experiences real-world transaction rejections and liquidity runs.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: The 3 Specialized AI Characters */}
          <div className="border-t border-slate-800 pt-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-cyan-400">03.</span>
              <span>Specialized AI Characters (Scripted Simulation Content)</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">SENTINEL</span>
                    <span className="text-[11px] text-cyan-300">Blue Team Correlation Engine</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Correlates alerts across the environment. <strong>Tier 1 automated actions</strong> (e.g. initial packet capture, alert tagging) run automatically. <strong>Tier 2/3 containment actions</strong> (host isolation, credential revocation) strictly require authorized human credentials.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">COMPASS</span>
                    <span className="text-[11px] text-amber-300">Executive Decision Advisor</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Synthesizes operational state into executive options. <strong>Critical Vulnerability:</strong> COMPASS relies on SENTINEL’s ticket feed. If telemetry lags by &gt;45 minutes, COMPASS displays a stale information warning and falls back to manual executive briefing.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">RAVEN</span>
                    <span className="text-[11px] text-rose-300">GLASS HERON Adversary AI Telemetry</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Facilitator-only intelligence revealing how the threat actor utilizes generative techniques for spearphishing and credential evasion. Players observe only unexplained anomalies and log footprints.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Exercise vs Presentation Modes */}
          <div className="border-t border-slate-800 pt-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-cyan-400">04.</span>
              <span>Mode Differences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="text-xs font-bold text-cyan-300 mb-1">Exercise Mode (Default)</div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Designed for active tabletop participants. Starts paused. Automatically pauses at each decision inject. Blank decision records require participant input and authorized sign-off. Full audit log exportable.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="text-xs font-bold text-slate-200 mb-1">Presentation Mode</div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Designed for executive briefings and portfolio walkthroughs. Auto-advances across scenario milestones with narration voice enabled and pre-annotated outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Press <kbd className="font-mono text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">Space</kbd> to pause/resume or use bottom dock buttons.
          </div>

          <button
            onClick={() => {
              onClose();
              if (onStartExercise) onStartExercise();
              soundEngine.playSelect();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Got It · Enter Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
