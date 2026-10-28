/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OrgLevelInfo, DepartmentNode } from '../types/simulation';
import { LIVE_EVENTS_SEQUENCE } from '../data/simulationData';
import { ChevronLeft, ChevronRight, Layers, ArrowDown, ArrowUp, Activity, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

import { EmotionalTone, EMOTIONAL_TONE_PROFILES } from '../utils/voice';

interface SideLevelsHUDProps {
  levels: OrgLevelInfo[];
  currentEvent: typeof LIVE_EVENTS_SEQUENCE[0];
  selectedLevelId: number | null;
  selectedDepartment: DepartmentNode | null;
  onSelectLevel: (levelId: number) => void;
  onSelectDepartment: (dept: DepartmentNode) => void;
  currentTone?: EmotionalTone;
}

export const SideLevelsHUD: React.FC<SideLevelsHUDProps> = ({
  levels,
  currentEvent,
  selectedLevelId,
  selectedDepartment,
  onSelectLevel,
  onSelectDepartment,
  currentTone = 'calm',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sort levels top to bottom: Level 4 at top, Level 1 at bottom
  const sortedLevels = [...levels].sort((a, b) => b.id - a.id);

  return (
    <aside
      className={`fixed top-18 left-4 z-20 pointer-events-auto transition-all duration-300 flex flex-col ${
        isCollapsed ? '-translate-x-[calc(100%-28px)]' : 'translate-x-0'
      }`}
      style={{ width: 'min(310px, calc(100vw - 32px))' }}
    >
      {/* Container Card */}
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight uppercase">
                Organizational Tiers
              </h2>
              <p className="text-[10px] text-slate-400">Live operational cascade</p>
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Tiers Panel' : 'Collapse Tiers Panel'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Levels List outside the 3D model */}
        <div className="p-2.5 space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
          {sortedLevels.map((lvl, idx) => {
            const isCurrentActive = currentEvent.activeLevelId === lvl.id;
            const isSelected = selectedLevelId === lvl.id;

            return (
              <div key={lvl.id} className="relative">
                {/* Connecting vertical conduit between cards */}
                {idx < sortedLevels.length - 1 && (
                  <div className="absolute left-4 top-full w-0.5 h-2 bg-slate-700 z-0 pointer-events-none" />
                )}

                <div
                  className={`rounded-xl p-2.5 transition-all border text-left ${
                    isCurrentActive
                      ? currentTone === 'urgent'
                        ? 'bg-slate-950/90 border-rose-500 shadow-md shadow-rose-950/50 ring-1 ring-rose-500/50'
                        : 'bg-slate-950/90 border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                      : isSelected
                      ? 'bg-slate-950/70 border-slate-600'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top row: Level Badge & Subtitle */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <button
                      onClick={() => {
                        onSelectLevel(lvl.id);
                        soundEngine.playSelect();
                      }}
                      className="flex items-center gap-1.5 text-left group"
                    >
                      <span
                        style={{ backgroundColor: lvl.accentColor }}
                        className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-slate-950"
                      />
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Level {lvl.id}
                      </span>
                    </button>

                    {isCurrentActive && (
                      <span
                        style={{ color: currentEvent.badgeColor }}
                        className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-900 border border-current"
                      >
                        {currentEvent.levelStatusBadge}
                      </span>
                    )}
                  </div>

                  {/* Level title */}
                  <div className="text-[11px] font-semibold text-slate-300 leading-tight mb-1">
                    {lvl.name.split(':')[1]?.trim() || lvl.name}
                  </div>

                  {/* Real-time What's Happening Action Label */}
                  {isCurrentActive ? (
                    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-lg p-1.5 text-[10px] text-cyan-300 font-medium leading-relaxed mb-1.5">
                      {currentEvent.levelStatus}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 line-clamp-1 mb-1.5">
                      {lvl.subname}
                    </div>
                  )}

                  {/* Department Chips */}
                  <div className="flex flex-wrap gap-1">
                    {lvl.departments.map(dept => {
                      const isDeptSelected = selectedDepartment?.id === dept.id;
                      const deptAction = (currentEvent.departmentActions as Record<string, string | undefined>)[dept.id];

                      return (
                        <button
                          key={dept.id}
                          onClick={() => {
                            onSelectDepartment(dept);
                            soundEngine.playSelect();
                          }}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-all text-left truncate max-w-full ${
                            isDeptSelected
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : isCurrentActive && deptAction
                              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                          title={`${dept.name}: ${deptAction || `${dept.throughput} ops/hr`}`}
                        >
                          {dept.name.split(' ')[0]} {dept.name.split(' ')[1] || ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Flow Direction Indicator */}
        <div className="p-2 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>Cascade Flow:</span>
          </span>
          <span className="text-cyan-300 font-semibold">{currentEvent.conduitLabel}</span>
        </div>
      </div>
    </aside>
  );
};
