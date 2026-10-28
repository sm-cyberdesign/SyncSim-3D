/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CinematicStep } from '../types/simulation';
import { Video, ChevronLeft, ChevronRight, X, Volume2, Mic, MicOff } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface DirectorSubtitlesProps {
  currentStep: CinematicStep;
  currentStepIndex: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onCloseDirector: () => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  onSpeakNarration: (text: string) => void;
}

export const DirectorSubtitles: React.FC<DirectorSubtitlesProps> = ({
  currentStep,
  currentStepIndex,
  totalSteps,
  onPrevStep,
  onNextStep,
  onCloseDirector,
  isVoiceEnabled,
  onToggleVoice,
  onSpeakNarration,
}) => {
  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-30 pointer-events-auto" style={{ width: 'min(780px, 92vw)' }}>
      {/* Video Clip Presentation Overlay Card */}
      <div className="bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl shadow-cyan-950/50 backdrop-blur-none text-slate-100 flex flex-col gap-2">
        {/* Header row */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
              Live Video Walkthrough
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-semibold text-cyan-300">
              {currentStep.phase}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <button
              onClick={() => {
                onCloseDirector();
                soundEngine.playSelect();
              }}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Close Director Mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Narrative text */}
        <div className="py-1">
          <h2 className="text-sm sm:text-base font-bold text-white mb-1">
            {currentStep.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {currentStep.narration}
          </p>
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-8 bg-cyan-400'
                    : idx < currentStepIndex
                    ? 'w-3 bg-cyan-800'
                    : 'w-3 bg-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onToggleVoice();
                soundEngine.playSelect();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isVoiceEnabled
                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
              title="Toggle Voice Narration"
            >
              {isVoiceEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>Voice</span>
            </button>

            {isVoiceEnabled && (
              <button
                onClick={() => {
                  onSpeakNarration(currentStep.narration);
                  soundEngine.playSelect();
                }}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 transition-colors"
                title="Speak this narration now"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => {
                onPrevStep();
                soundEngine.playSelect();
              }}
              disabled={currentStepIndex === 0}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none text-xs font-medium flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                onNextStep();
                soundEngine.playSelect();
              }}
              disabled={currentStepIndex === totalSteps - 1}
              className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <span>Next Phase</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
