/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  History,
  Video,
  Volume2,
  VolumeX,
  RotateCcw,
  Users,
  Compass,
  Tag,
  Mic,
  MicOff,
  Settings,
  Layers,
} from 'lucide-react';
import { SimulationMode, Collaborator } from '../types/simulation';
import { soundEngine } from '../utils/audio';
import { EmotionalTone, EMOTIONAL_TONE_PROFILES } from '../utils/voice';

interface TopNavbarProps {
  mode: SimulationMode;
  onSetMode: (mode: SimulationMode) => void;
  isCinematicMode: boolean;
  onToggleCinematicMode: () => void;
  collaborators: Collaborator[];
  isMuted: boolean;
  onToggleMute: () => void;
  onResetView: () => void;
  onOpenCollaborators: () => void;
  alignmentScore: number;
  showLabels: boolean;
  onToggleLabels: () => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  onOpenVoiceSettings: () => void;
  currentTone: EmotionalTone;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  mode,
  onSetMode,
  isCinematicMode,
  onToggleCinematicMode,
  collaborators,
  isMuted,
  onToggleMute,
  onResetView,
  onOpenCollaborators,
  alignmentScore,
  showLabels,
  onToggleLabels,
  isVoiceEnabled,
  onToggleVoice,
  onOpenVoiceSettings,
  currentTone,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-3.5 flex items-center justify-between">
      {/* Left: Branding & App Spec Badge */}
      <div className="pointer-events-auto flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-xl shadow-black/50 text-slate-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Activity className="w-4 h-4 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">
                OrgFlow 3D
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-700/50 text-cyan-300">
                Live 4-Tier
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Organizational Levels Simulation & Analytics
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Live vs Historical */}
        <div className="pointer-events-auto flex items-center bg-slate-900/95 p-1 rounded-xl border border-slate-700/80 shadow-xl shadow-black/50">
          <button
            onClick={() => {
              onSetMode('live');
              soundEngine.playSelect();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'live'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Simulation Mode</span>
          </button>
          <button
            onClick={() => {
              onSetMode('historical');
              soundEngine.playSelect();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'historical'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historical Data View</span>
          </button>
        </div>
      </div>

      {/* Right: Cinematic Director Mode, Multi-User Team Alignment & Settings */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        {/* Cinematic Director Mode (Video Clip View) */}
        <button
          onClick={() => {
            onToggleCinematicMode();
            soundEngine.playSelect();
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all shadow-xl shadow-black/50 ${
            isCinematicMode
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500 shadow-rose-900/40 animate-none'
              : 'bg-slate-900/95 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:text-white'
          }`}
          title="Watch automated video-style walkthrough of organizational levels"
        >
          <Video className="w-4 h-4 text-cyan-400" />
          <span>{isCinematicMode ? 'Exit Director Clip' : 'Director Video Mode'}</span>
        </button>

        {/* Multi-User Collaboration Alignment Badge */}
        <button
          onClick={() => {
            onOpenCollaborators();
            soundEngine.playSelect();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-xl shadow-black/50 hover:bg-slate-800 transition-colors"
          title="View team alignment and shared parameter proposals"
        >
          <div className="flex -space-x-1.5 overflow-hidden">
            {collaborators.map(c => (
              <div
                key={c.id}
                style={{ backgroundColor: c.avatarColor }}
                className="w-5 h-5 rounded-full ring-2 ring-slate-900 flex items-center justify-center text-[9px] font-bold text-white uppercase"
                title={`${c.name} (${c.role})`}
              >
                {c.name.charAt(0)}
              </div>
            ))}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[10px] text-slate-400 leading-none">Team Alignment</div>
            <div className="text-xs font-bold text-emerald-400 leading-none mt-0.5">
              {alignmentScore}% Sync
            </div>
          </div>
        </button>

        {/* Side Tiers Panel Toggle */}
        <button
          onClick={() => {
            onToggleLabels();
            soundEngine.playSelect();
          }}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all shadow-xl shadow-black/50 ${
            showLabels
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-900/95 border-slate-700/80 text-slate-400 hover:text-white'
          }`}
          title="Toggle Side Tier Labels Panel (outside 3D model)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Side Tiers: {showLabels ? 'On' : 'Off'}</span>
        </button>

        {/* Optional Voice Narration Toggle & Voice Settings */}
        <div className="flex items-center bg-slate-900/95 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl shadow-black/50">
          <button
            onClick={() => {
              onToggleVoice();
              soundEngine.playSelect();
            }}
            className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-all ${
              isVoiceEnabled
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Optional Voice Narration with Contextual Emotional Tone Modulation"
          >
            {isVoiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Voice: {isVoiceEnabled ? 'On' : 'Off'}</span>
            {isVoiceEnabled && (
              <span
                style={{ backgroundColor: EMOTIONAL_TONE_PROFILES[currentTone].color }}
                className="w-2 h-2 rounded-full shrink-0 ring-1 ring-slate-950"
                title={`Emotional tone: ${EMOTIONAL_TONE_PROFILES[currentTone].label}`}
              />
            )}
          </button>

          <button
            onClick={() => {
              onOpenVoiceSettings();
              soundEngine.playSelect();
            }}
            className="p-2 border-l border-slate-750 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Voice & Emotional Tone Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Audio Mute/Unmute */}
        <button
          onClick={() => {
            onToggleMute();
            soundEngine.setMuted(!isMuted);
          }}
          className="p-2 rounded-xl bg-slate-900/95 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-xl shadow-black/50"
          title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Reset View Button */}
        <button
          onClick={() => {
            onResetView();
            soundEngine.playSelect();
          }}
          className="p-2 rounded-xl bg-slate-900/95 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-xl shadow-black/50"
          title="Reset Camera to Overview"
        >
          <Compass className="w-4 h-4 text-cyan-400" />
        </button>
      </div>
    </header>
  );
};
