/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export interface PhaseDefinition {
  phaseNumber: 1 | 2 | 3 | 4;
  title: string;
  shortTitle: string;
  injectIds: string[];
  partIndices: number[];
  timeframe: string;
  description: string;
}

export const OPERATION_PHASES: PhaseDefinition[] = [
  {
    phaseNumber: 1,
    title: 'Infiltration & Stealth',
    shortTitle: 'Infiltration',
    injectIds: ['1.1', '1.2', '1.3'],
    partIndices: [0, 1, 2],
    timeframe: 'Day 1 · 02:00 – 07:30 EDT',
    description: 'Vendor IT compromise via Apex Managed Services and stealth reconnaissance across core banking clusters.',
  },
  {
    phaseNumber: 2,
    title: 'Detection & Escalation',
    shortTitle: 'Detection',
    injectIds: ['2.1', '2.2', '2.3', '2.4'],
    partIndices: [3, 4, 5, 6],
    timeframe: 'Day 1 · 08:15 – 14:00 EDT',
    description: 'SENTINEL SIEM alert correlation, COMPASS briefing lag, and Crisis Management Team declaration.',
  },
  {
    phaseNumber: 3,
    title: 'Disruption & Extortion',
    shortTitle: 'Disruption',
    injectIds: ['3.1', '3.2', '3.3', '3.4'],
    partIndices: [7, 8, 9, 10],
    timeframe: 'Day 2 · 06:00 – 16:45 EDT',
    description: 'Interbank Fedwire freeze, 185-branch ATM withdrawal surge, and $15M ransomware ultimatum.',
  },
  {
    phaseNumber: 4,
    title: 'Recovery & Governance',
    shortTitle: 'Recovery',
    injectIds: ['4.1A', '4.1B', '4.2', '4.3'],
    partIndices: [11, 12, 13, 14],
    timeframe: 'Day 3 – Day 4 · 08:00 – 18:30 EDT',
    description: 'Air-gapped backup restoration, cash logistics dispatch, credential eradication, and SEC 8-K disclosure.',
  },
];

interface PhaseStepIndicatorProps {
  currentPartIndex: number;
  onSelectPartIndex?: (index: number) => void;
  className?: string;
}

export const PhaseStepIndicator: React.FC<PhaseStepIndicatorProps> = ({
  currentPartIndex,
  onSelectPartIndex,
  className = '',
}) => {
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);

  // Find active phase
  const activePhase = OPERATION_PHASES.find(p => p.partIndices.includes(currentPartIndex)) || OPERATION_PHASES[0];

  const handlePhaseClick = (firstPartIndex: number) => {
    if (onSelectPartIndex) {
      onSelectPartIndex(firstPartIndex);
      soundEngine.playSelect();
    }
  };

  const handleSubStepClick = (e: React.MouseEvent, partIndex: number) => {
    e.stopPropagation();
    if (onSelectPartIndex) {
      onSelectPartIndex(partIndex);
      soundEngine.playSelect();
    }
  };

  return (
    <div
      className={`relative flex items-center bg-slate-900/95 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-xl shadow-black/60 text-xs ${className}`}
      aria-label="Operation Silent Ledger 4-Phase Progress Indicator"
    >
      {/* Desktop & Tablet: 4-Phase Segmented Indicator */}
      <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
        {OPERATION_PHASES.map((phase, idx) => {
          const isCurrentPhase = phase.phaseNumber === activePhase.phaseNumber;
          const isCompleted = currentPartIndex > Math.max(...phase.partIndices);
          const isUpcoming = currentPartIndex < Math.min(...phase.partIndices);

          // Calculate completed steps in this phase
          const completedCount = phase.partIndices.filter(pIdx => pIdx <= currentPartIndex).length;
          const totalInPhase = phase.partIndices.length;

          return (
            <div key={phase.phaseNumber} className="flex items-center">
              {/* Phase Step Button */}
              <div
                className="relative group"
                onMouseEnter={() => setHoveredPhase(phase.phaseNumber)}
                onMouseLeave={() => setHoveredPhase(null)}
              >
                <button
                  type="button"
                  onClick={() => handlePhaseClick(phase.partIndices[0])}
                  className={`flex flex-col gap-1 px-2 py-1 rounded-lg transition-colors text-left cursor-pointer ${
                    isCurrentPhase
                      ? 'bg-slate-800 text-white shadow-sm'
                      : isCompleted
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                  }`}
                  title={`${phase.title} (${phase.timeframe}) — Click to jump`}
                >
                  {/* Top line: Number, Title and status */}
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span
                      className={`font-mono text-[10px] font-bold ${
                        isCurrentPhase
                          ? 'text-cyan-400'
                          : isCompleted
                          ? 'text-emerald-400'
                          : 'text-slate-600'
                      }`}
                    >
                      {isCompleted ? '✓' : `0${phase.phaseNumber}`}
                    </span>
                    <span
                      className={`text-[11px] font-semibold tracking-tight ${
                        isCurrentPhase
                          ? 'text-white'
                          : isCompleted
                          ? 'text-slate-300'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="hidden xl:inline">{phase.title}</span>
                      <span className="xl:hidden">{phase.shortTitle}</span>
                    </span>

                    {/* Step fraction */}
                    <span className="font-mono tabular-nums text-[10px] text-slate-500 ml-0.5">
                      {isCurrentPhase ? `${completedCount}/${totalInPhase}` : ''}
                    </span>
                  </div>

                  {/* Micro Progress Track with individual inject pips */}
                  <div className="flex items-center gap-1 w-full pt-0.5">
                    {phase.partIndices.map((partIdx, pipIdx) => {
                      const isPipCompleted = currentPartIndex > partIdx;
                      const isPipActive = currentPartIndex === partIdx;

                      return (
                        <button
                          key={partIdx}
                          type="button"
                          onClick={e => handleSubStepClick(e, partIdx)}
                          className={`h-1 flex-1 rounded-full transition-all cursor-pointer ${
                            isPipActive
                              ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50 ring-1 ring-cyan-300'
                              : isPipCompleted
                              ? 'bg-emerald-500'
                              : 'bg-slate-800 hover:bg-slate-700'
                          }`}
                          title={`Jump to Part ${partIdx + 1} (${phase.injectIds[pipIdx]})`}
                        />
                      );
                    })}
                  </div>
                </button>

                {/* Hover Tooltip with Phase Narrative & Timeframe */}
                {hoveredPhase === phase.phaseNumber && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-64 p-2.5 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl text-slate-200 pointer-events-none animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-mono text-cyan-400 font-bold uppercase">
                        Phase 0{phase.phaseNumber} · {phase.shortTitle}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {phase.timeframe}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {phase.description}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Injects included:</span>
                      <span className="font-mono text-cyan-300 font-semibold">
                        {phase.injectIds.join(', ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Separator between phases */}
              {idx < OPERATION_PHASES.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-700 shrink-0 mx-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Compact View (< md): High-density clean progress */}
      <div className="flex md:hidden items-center gap-2 w-full justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-mono text-cyan-400 font-bold">
            Phase 0{activePhase.phaseNumber}/04
          </span>
          <span className="text-slate-600 text-xs">·</span>
          <span className="text-xs font-bold text-white truncate max-w-[130px]">
            {activePhase.shortTitle}
          </span>
        </div>

        {/* 4-Segment Mobile Progress Bar */}
        <div className="flex items-center gap-1 w-24 shrink-0">
          {OPERATION_PHASES.map(p => {
            const isPhaseDone = currentPartIndex > Math.max(...p.partIndices);
            const isPhaseCurrent = p.phaseNumber === activePhase.phaseNumber;

            return (
              <button
                key={p.phaseNumber}
                type="button"
                onClick={() => handlePhaseClick(p.partIndices[0])}
                className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                  isPhaseCurrent
                    ? 'bg-cyan-400'
                    : isPhaseDone
                    ? 'bg-emerald-500'
                    : 'bg-slate-800'
                }`}
                title={`Jump to Phase ${p.phaseNumber}: ${p.title}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
