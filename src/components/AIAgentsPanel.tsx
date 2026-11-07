/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Bot,
  Compass,
  AlertTriangle,
  Lock,
  Volume2,
  X,
  Info,
  Clock,
} from 'lucide-react';
import { AgentDialogue, AgentId } from '../types/exercise';
import { soundEngine } from '../utils/audio';
import { voiceNarrator } from '../utils/voice';

interface AIAgentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  agentsDialogue: AgentDialogue[];
  isFacilitatorView: boolean;
  isVoiceEnabled: boolean;
}

export const AIAgentsPanel: React.FC<AIAgentsPanelProps> = ({
  isOpen,
  onClose,
  agentsDialogue,
  isFacilitatorView,
  isVoiceEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<AgentId>('sentinel');
  const [currentlySpeakingAgent, setCurrentlySpeakingAgent] = useState<AgentId | null>(null);

  if (!isOpen) return null;

  const availableAgents: {
    id: AgentId;
    name: string;
    role: string;
    color: string;
    icon: typeof ShieldAlert;
    visibleInPlayerView: boolean;
  }[] = [
    {
      id: 'sentinel',
      name: 'SENTINEL',
      role: 'Blue Team Security Correlation',
      color: '#06b6d4',
      icon: ShieldAlert,
      visibleInPlayerView: true,
    },
    {
      id: 'compass',
      name: 'COMPASS',
      role: 'Executive Decision Advisor',
      color: '#f59e0b',
      icon: Compass,
      visibleInPlayerView: true,
    },
    {
      id: 'raven',
      name: 'RAVEN',
      role: isFacilitatorView ? 'Red Team Adversary (Glass Heron)' : 'Suspected Adversary AI Telemetry',
      color: '#e11d48',
      icon: Bot,
      visibleInPlayerView: isFacilitatorView,
    },
  ];

  const currentDialogue = agentsDialogue.find(d => d.agentId === activeTab);

  const handleSpeakAgentText = (agentId: AgentId, text: string) => {
    if (!isVoiceEnabled) {
      voiceNarrator.setEnabled(true);
    }
    setCurrentlySpeakingAgent(agentId);
    const tone = agentId === 'raven' ? 'urgent' : agentId === 'sentinel' ? 'calm' : 'strategic';
    voiceNarrator.speak(text, true, tone);
  };

  return (
    <aside
      className="fixed top-18 right-4 bottom-24 z-30 pointer-events-auto flex flex-col bg-slate-900/98 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100 transition-all duration-300"
      style={{ width: 'min(440px, calc(100vw - 32px))' }}
      aria-label="AI Characters & Advisory Intelligence"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Specialized AI Characters
              </h2>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-[11px] text-slate-400">
                Scripted Simulation
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Scenario advisory & correlation telemetry</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close AI Agents Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mandatory Scripted Content Disclaimer */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>
          All agent dialogue and outputs are scripted simulation content for this tabletop.
        </span>
      </div>

      {/* Agent Selector Segmented Controls */}
      <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1">
        {availableAgents.map(ag => {
          const isSelected = activeTab === ag.id;
          const Icon = ag.icon;
          const isHiddenToPlayer = ag.id === 'raven' && !isFacilitatorView;

          return (
            <button
              key={ag.id}
              onClick={() => {
                setActiveTab(ag.id);
                soundEngine.playSelect();
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isSelected
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: ag.color }} />
              <span>{ag.name}</span>
              {isHiddenToPlayer && (
                <span className="text-[10px] text-amber-400 font-normal">
                  (Hidden)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Agent Dialogue & Details Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {/* Agent Profile Overview */}
        {activeTab === 'sentinel' && (
          <div className="rounded-xl p-3.5 bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400">
                SENTINEL Engine
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Blue Team Correlation
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Correlates security alerts and automates Tier 1 perimeter token revocations. High-impact Tier 2 and Tier 3 actions (database isolation, domain Krbtgt reset) <strong>strictly require authorized human execution with separate credentials</strong>.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Tier 1 Actions:</span>
                <span className="text-emerald-400 font-medium">Automated Revocation</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Tier 2/3 Actions:</span>
                <span className="text-amber-400 font-medium">Human-Gated Only</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compass' && (
          <div className="rounded-xl p-3.5 bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">
                COMPASS Executive Advisor
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Leadership Decision Support
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Synthesizes situational intelligence for the CEO and Crisis Management Team. Relies entirely on SENTINEL’s ingested telemetry.
            </p>

            {currentDialogue?.staleWarning && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Stale Information Warning Active</span>
                </div>
                <p className="text-[11px] text-rose-200/90 leading-snug">
                  Telemetry lag exceeds 45 minutes. COMPASS briefings are desynchronized from the live incident. Manual executive briefing fallback required.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'raven' && (
          <div className="rounded-xl p-3.5 bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400">
                RAVEN · GLASS HERON Telemetry
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Threat Actor Analytics
              </span>
            </div>

            {isFacilitatorView ? (
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Facilitator Disclosure: Displays adversary deception techniques, Living-off-the-Land (LOLBins) persistence, and automated extortion staging.
              </p>
            ) : (
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Classified Intel · Participant View</span>
                </div>
                <p className="text-slate-400 leading-snug">
                  Direct Raven communications are restricted. Tabletop participants see only anomalous behavioral artifacts and unexplained IOCs detected by SOC sensors.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Current Inject Agent Output */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Simulated Time: {currentDialogue?.timestamp || 'N/A'}</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              Scripted Output
            </span>
          </div>

          {currentDialogue ? (
            <>
              {currentDialogue.metadataNotice && (
                <div className="text-[10px] text-amber-300 font-mono">
                  Notice: {currentDialogue.metadataNotice}
                </div>
              )}

              <p className="text-xs text-slate-200 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                {currentDialogue.text}
              </p>

              {/* Audio Playback Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-[11px] text-slate-400">Voice Synthesis:</span>
                <button
                  onClick={() => handleSpeakAgentText(activeTab, currentDialogue.text)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Play Agent Voice</span>
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No specific dialogue generated for this agent in the current inject delivery part.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};
