/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  Sparkles,
  Shield,
  FileText,
  Clock,
  Volume2,
  VolumeX,
  Video,
  RotateCcw,
  BookOpen,
  QrCode,
  Sliders,
  Smartphone,
  Tv,
} from 'lucide-react';
import { AppMode, ScenarioInjectPart } from '../types/exercise';
import { soundEngine } from '../utils/audio';
import { PhaseStepIndicator } from './PhaseStepIndicator';

export type MainAppView = 'landing' | 'projector' | 'shared_3d' | 'host' | 'participant';

interface TopNavbarProps {
  mode: AppMode;
  onSetMode: (mode: AppMode) => void;
  isCinematicMode: boolean;
  onToggleCinematicMode: () => void;
  isFacilitatorView: boolean;
  onToggleFacilitatorView: () => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  onOpenVoiceSettings: () => void;
  onOpenRecordingModal: () => void;
  onOpenTextAlternative: () => void;
  onOpenFlowGuide: () => void;
  exerciseElapsedSeconds: number;
  currentInject: ScenarioInjectPart;
  currentPartIndex: number;
  onSelectPartIndex?: (index: number) => void;
  onResetView: () => void;
  
  // Multiplayer props
  activeView: MainAppView;
  onSelectView: (view: MainAppView) => void;
  sessionCode?: string;
  connectedCount?: number;
  onOpenQRModal?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  mode,
  onSetMode,
  isCinematicMode,
  onToggleCinematicMode,
  isFacilitatorView,
  onToggleFacilitatorView,
  isVoiceEnabled,
  onToggleVoice,
  onOpenVoiceSettings,
  onOpenRecordingModal,
  onOpenTextAlternative,
  onOpenFlowGuide,
  exerciseElapsedSeconds,
  currentInject,
  currentPartIndex,
  onSelectPartIndex,
  onResetView,
  activeView = 'shared_3d',
  onSelectView,
  sessionCode = 'SL-SILENT',
  connectedCount = 0,
  onOpenQRModal,
}) => {
  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-2 sm:p-3 flex items-center justify-between gap-2 max-w-full">
      {/* Zone 1: Brand Wordmark & Multiplayer Mode Switcher */}
      <div className="pointer-events-auto flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-1.5 sm:py-2 bg-slate-900/95 border border-slate-800 shadow-xl shadow-black/60 text-slate-100">
          <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white whitespace-nowrap">
                SyncSim 3D
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">·</span>
              <span className="text-xs font-medium text-cyan-400 whitespace-nowrap hidden sm:inline">
                Operation Silent Ledger
              </span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight flex items-center gap-1.5 whitespace-nowrap font-mono">
              <span className="text-amber-400">{sessionCode}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">{connectedCount} Joined</span>
            </div>
          </div>
        </div>

        {/* Connected Interfaces Selector */}
        <div className="hidden lg:flex items-center bg-slate-900/95 p-0.5 border border-slate-800 shadow-xl shadow-black/60 font-mono text-xs">
          <button
            onClick={() => onSelectView('landing')}
            className={`px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'landing'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Welcome / Home Screen"
          >
            <span>Home</span>
          </button>
          <button
            onClick={() => onSelectView('projector')}
            className={`px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'projector'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Big Screen / Projector View"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Big Screen</span>
          </button>
          <button
            onClick={() => onSelectView('shared_3d')}
            className={`px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'shared_3d'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Command Center 3D View"
          >
            <span>3D Model</span>
          </button>
          <button
            onClick={() => onSelectView('participant')}
            className={`px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'participant'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile Participant View"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Participant</span>
          </button>
          <button
            onClick={() => onSelectView('host')}
            className={`px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'host'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Facilitator Control Console"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Facilitator</span>
          </button>
        </div>

        {/* Join QR Button */}
        {onOpenQRModal && (
          <button
            onClick={onOpenQRModal}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold shadow-md transition-colors whitespace-nowrap cursor-pointer"
            title="Display Join QR Code for Players"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Join QR</span>
          </button>
        )}
      </div>

      {/* Zone 2: Visual 4-Phase Step Indicator */}
      <div className="pointer-events-auto flex items-center gap-2">
        <PhaseStepIndicator
          currentPartIndex={currentPartIndex}
          onSelectPartIndex={onSelectPartIndex}
        />

        {/* Clocks & Flow Guide on wider viewports */}
        <div className="hidden 2xl:flex items-center gap-3 bg-slate-900/95 px-3 py-2 border border-slate-800 shadow-xl shadow-black/60 text-xs text-slate-300">
          <button
            onClick={onOpenFlowGuide}
            className="flex items-center gap-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200 transition-colors whitespace-nowrap pr-2.5 border-r border-slate-800 cursor-pointer"
            title="Open Step-by-Step Tabletop Flow Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Flow Guide</span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Clock:</span>
            <span className="font-mono tabular-nums font-bold text-white">
              {formatTimer(exerciseElapsedSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Zone 3: Actions (Facilitator Toggle, Audio, Flow Guide, Screen Recording) */}
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Flow Guide Button (visible on md to xl screens) */}
        <button
          onClick={onOpenFlowGuide}
          className="hidden md:flex 2xl:hidden px-2.5 py-1.5 bg-slate-900/95 border border-slate-800 text-cyan-300 hover:text-cyan-200 text-xs font-medium items-center gap-1.5 shadow-md transition-colors whitespace-nowrap cursor-pointer"
          title="Open Step-by-Step Exercise Flow Guide"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline">Flow Guide</span>
        </button>

        {/* Facilitator View Toggle */}
        <button
          onClick={() => {
            onToggleFacilitatorView();
            soundEngine.playSelect();
          }}
          className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md whitespace-nowrap cursor-pointer border ${
            isFacilitatorView
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
              : 'bg-slate-900/95 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
          title="Toggle Director / Facilitator Guidance & Evidence Controls"
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isFacilitatorView ? 'Facilitator View' : 'Player View'}</span>
          <span className="sm:hidden">{isFacilitatorView ? 'Director' : 'Player'}</span>
        </button>

        {/* Accessible Non-3D Text Alternative View */}
        <button
          onClick={onOpenTextAlternative}
          className="px-2 sm:px-2.5 py-1.5 bg-slate-900/95 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 shadow-md transition-colors whitespace-nowrap cursor-pointer"
          title="Accessible Non-3D Tabular View"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline">Text Alt</span>
        </button>

        {/* Voice Narration Toggle */}
        <button
          onClick={() => {
            onToggleVoice();
            soundEngine.playSelect();
          }}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer border ${
            isVoiceEnabled
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              : 'bg-slate-900/95 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title={isVoiceEnabled ? 'Voice Narration: ON (Click to mute)' : 'Voice Narration: OFF (Click to unmute)'}
        >
          {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden xl:inline">{isVoiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
        </button>

        {/* Screen Recording Modal */}
        <button
          onClick={onOpenRecordingModal}
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-900/95 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 shadow-md transition-colors whitespace-nowrap cursor-pointer"
          title="Record Tabletop Video Walkthrough"
        >
          <Video className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden xl:inline">Record</span>
        </button>

        {/* Reset Camera View */}
        <button
          onClick={onResetView}
          className="p-2 bg-slate-900/95 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs shadow-md transition-colors cursor-pointer"
          title="Reset 3D Camera Orbit"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
