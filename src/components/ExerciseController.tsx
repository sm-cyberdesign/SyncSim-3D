/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Bot,
  CheckSquare,
  Shield,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ScenarioInjectPart, AppMode } from '../types/exercise';
import { soundEngine } from '../utils/audio';

interface ExerciseControllerProps {
  currentInject: ScenarioInjectPart;
  currentPartIndex: number;
  totalParts: number;
  mode: AppMode;
  isPaused: boolean;
  isDiscussionPause: boolean;
  onTogglePlayPause: () => void;
  onPrevPart: () => void;
  onNextPart: () => void;
  onSelectPartIndex: (index: number) => void;
  onOpenAIAgents: () => void;
  onOpenDecisions: () => void;
  onOpenFacilitator: () => void;
  onOpenFlowGuide: () => void;
  isFacilitatorView: boolean;
  releasedEvidenceCount: number;
  totalDecisionsCount: number;
  hasDecisionForCurrentInject: boolean;
}

export const ExerciseController: React.FC<ExerciseControllerProps> = ({
  currentInject,
  currentPartIndex,
  totalParts,
  mode,
  isPaused,
  isDiscussionPause,
  onTogglePlayPause,
  onPrevPart,
  onNextPart,
  onSelectPartIndex,
  onOpenAIAgents,
  onOpenDecisions,
  onOpenFacilitator,
  onOpenFlowGuide,
  isFacilitatorView,
  releasedEvidenceCount,
  totalDecisionsCount,
  hasDecisionForCurrentInject,
}) => {
  const isFirst = currentPartIndex === 0;
  const isLast = currentPartIndex === totalParts - 1;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-2 max-w-4xl w-[calc(100vw-32px)]">
      {/* Prominent Flow Callout when Paused for Deliberation */}
      {isDiscussionPause && mode === 'exercise' && (
        <div className="w-full bg-slate-900/98 border border-amber-500/70 rounded-xl px-4 py-2.5 shadow-2xl shadow-black/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-100 backdrop-blur-md">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Deliberation Required
                </span>
                <span className="text-slate-500 text-xs">·</span>
                <span className="text-xs text-slate-300">
                  {hasDecisionForCurrentInject ? 'Decision recorded for this step' : 'Decision pending'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Review telemetry with SENTINEL and COMPASS, discuss trade-offs, and log the executive action.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={onOpenDecisions}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                hasDecisionForCurrentInject
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {hasDecisionForCurrentInject ? 'Edit Logged Decision' : 'Log Team Decision'}
            </button>
            <button
              onClick={onTogglePlayPause}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              Resume Timeline
            </button>
          </div>
        </div>
      )}

      {/* Main Stepper & HUD Controls Dock */}
      <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl shadow-black/90 px-4 py-3 backdrop-blur-md text-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Step Context & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="min-w-0 flex-1 md:max-w-sm">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="font-semibold text-cyan-400">
                Module {currentInject.moduleNumber}
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono tabular-nums text-slate-300">
                Part {currentPartIndex + 1} of {totalParts}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 truncate">
                {currentInject.id}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white truncate leading-tight mt-0.5">
              {currentInject.injectTitle.replace(/^Inject [0-9.AB]+: /, '')}
            </h3>
          </div>
        </div>

        {/* Center: Stepper Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              onPrevPart();
              soundEngine.playSelect();
            }}
            disabled={isFirst}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              isFirst
                ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'border-slate-800 bg-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-700'
            }`}
            title="Previous Inject Part"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            onClick={() => {
              onTogglePlayPause();
              soundEngine.playSelect();
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md ${
              isPaused
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
            title={isPaused ? 'Resume Exercise Timeline' : 'Pause Exercise Timeline'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={() => {
              onNextPart();
              soundEngine.playSelect();
            }}
            disabled={isLast}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              isLast
                ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'border-slate-800 bg-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-700'
            }`}
            title="Next Inject Part"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Specialized Panels & Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* AI Agents Button */}
          <button
            onClick={onOpenAIAgents}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-800 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open AI Agents & Advisory Panel"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Agents</span>
          </button>

          {/* Decisions Audit Button */}
          <button
            onClick={onOpenDecisions}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-800 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open Decisions & Tabletop Audit Log"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Decisions</span>
            <span className="text-[11px] font-mono tabular-nums text-emerald-400">
              ({totalDecisionsCount}/15)
            </span>
          </button>

          {/* Facilitator Guide Button (if Facilitator View enabled) */}
          {isFacilitatorView && (
            <button
              onClick={onOpenFacilitator}
              className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/60 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open Facilitator Guide & Evidence Injection"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Director Guide</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
