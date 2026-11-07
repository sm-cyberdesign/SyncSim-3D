/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OrgLevelInfo, DepartmentNode } from '../types/simulation';
import { ChevronLeft, ChevronRight, Layers, Shield } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { EmotionalTone } from '../utils/voice';

interface SideLevelsHUDProps {
  levels: OrgLevelInfo[];
  selectedLevelId: number | null;
  selectedDepartment: DepartmentNode | null;
  onSelectLevel: (levelId: number) => void;
  onSelectDepartment: (dept: DepartmentNode) => void;
  activeLevelId?: number;
  currentTone?: EmotionalTone;
}

export const SideLevelsHUD: React.FC<SideLevelsHUDProps> = ({
  levels,
  selectedLevelId,
  selectedDepartment,
  onSelectLevel,
  onSelectDepartment,
  activeLevelId = 2,
  currentTone = 'calm',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sort levels top to bottom: Level 4 at top, Level 1 at bottom
  const sortedLevels = [...levels].sort((a, b) => b.id - a.id);

  return (
    <aside
      className={`fixed top-18 left-3 sm:left-4 z-20 pointer-events-auto transition-all duration-300 flex flex-col ${
        isCollapsed ? '-translate-x-[calc(100%-30px)]' : 'translate-x-0'
      }`}
      style={{ width: 'min(310px, calc(100vw - 32px))' }}
      aria-label="Meridian Trust Financial Infrastructure Tiers"
    >
      {/* Container Card */}
      <div className="bg-slate-900/98 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col text-slate-100 backdrop-blur-md">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-xs font-bold text-white tracking-tight uppercase">
              Infrastructure Tiers
            </h2>
            <p className="text-[11px] text-slate-400">Meridian Trust operational levels</p>
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
        <div className="p-3 space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto">
          {sortedLevels.map((lvl, idx) => {
            const isCurrentActive = activeLevelId === lvl.id;
            const isSelected = selectedLevelId === lvl.id;

            return (
              <div key={lvl.id} className="relative">
                {/* Connecting subtle hairline line between tiers */}
                {idx < sortedLevels.length - 1 && (
                  <div className="absolute left-4 top-full w-px h-2.5 bg-slate-800 z-0 pointer-events-none" />
                )}

                <div
                  className={`rounded-xl p-3 transition-colors border text-left ${
                    isCurrentActive
                      ? 'bg-slate-950/90 border-cyan-400 shadow-md ring-1 ring-cyan-500/50'
                      : isSelected
                      ? 'bg-slate-950/70 border-slate-700'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top row: Level title & status */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <button
                      onClick={() => {
                        onSelectLevel(lvl.id);
                        soundEngine.playSelect();
                      }}
                      className="flex items-center gap-1.5 text-left group"
                    >
                      <span
                        className="text-xs font-bold group-hover:underline"
                        style={{ color: lvl.accentColor }}
                      >
                        Level {lvl.id}
                      </span>
                      <span className="text-[11px] font-medium text-slate-300 truncate max-w-[140px]">
                        {lvl.name.replace(/^Level [0-9]: /, '')}
                      </span>
                    </button>

                    {isCurrentActive && (
                      <span className="text-[10px] text-cyan-400 font-mono font-semibold uppercase">
                        Active Inject
                      </span>
                    )}
                  </div>

                  {/* Operational Subtitle */}
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-2">
                    {lvl.subname}
                  </p>

                  {/* Department Node Buttons */}
                  <div className="space-y-1">
                    {lvl.departments.map(dept => {
                      const isDeptSelected = selectedDepartment?.id === dept.id;

                      return (
                        <button
                          key={dept.id}
                          onClick={() => {
                            onSelectDepartment(dept);
                            soundEngine.playSelect();
                          }}
                          className={`w-full px-2 py-1 rounded-lg text-left text-[11px] flex items-center justify-between gap-1 transition-colors ${
                            isDeptSelected
                              ? 'bg-slate-800 text-white font-medium shadow-sm'
                              : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{dept.name}</span>
                          <span
                            className={`font-mono tabular-nums text-[11px] ${
                              dept.health >= 90
                                ? 'text-emerald-400'
                                : dept.health >= 75
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {dept.health}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
