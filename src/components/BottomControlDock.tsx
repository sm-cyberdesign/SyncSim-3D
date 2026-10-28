/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Sliders,
  BarChart3,
  Users,
} from 'lucide-react';
import { CameraPreset } from '../types/simulation';
import { soundEngine } from '../utils/audio';

interface BottomControlDockProps {
  isPlaying: boolean;
  playbackSpeed: number;
  progress: number; // 0 to 1
  cameraPreset: CameraPreset;
  onTogglePlay: () => void;
  onSetSpeed: (speed: number) => void;
  onSeek: (progress: number) => void;
  onReset: () => void;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  onOpenParameters: () => void;
  onOpenAnalytics: () => void;
  onOpenCollaborators: () => void;
  isParametersOpen: boolean;
  isAnalyticsOpen: boolean;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  isPlaying,
  playbackSpeed,
  progress,
  cameraPreset,
  onTogglePlay,
  onSetSpeed,
  onSeek,
  onReset,
  onSelectCameraPreset,
  onOpenParameters,
  onOpenAnalytics,
  onOpenCollaborators,
  isParametersOpen,
  isAnalyticsOpen,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Keyboard shortcut 'H' to toggle dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h' && !e.metaKey && !e.ctrlKey) {
        setIsCollapsed(prev => !prev);
      }
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        onTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay]);

  const formatTime = (p: number) => {
    const totalSeconds = Math.floor(p * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const cameraButtons: { id: CameraPreset; label: string; badge: string }[] = [
    { id: 'overview', label: 'All Levels', badge: 'Full' },
    { id: 'executive', label: 'L4 Strategy', badge: 'Exec' },
    { id: 'engineering', label: 'L3 Systems', badge: 'R&D' },
    { id: 'cloud', label: 'L2 Cloud Data', badge: 'Infra' },
    { id: 'market', label: 'L1 Market Edge', badge: 'Field' },
  ];

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 transition-all duration-300 z-30 pointer-events-auto ${
        isCollapsed ? 'bottom-0 translate-y-[calc(100%-36px)]' : 'bottom-5'
      }`}
      style={{ width: 'min(960px, 94vw)' }}
    >
      {/* Collapse / Expand Tab Button */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="px-4 py-1.5 rounded-t-xl bg-slate-900/95 border-t border-x border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 shadow-lg shadow-black/40 hover:bg-slate-800 transition-colors"
          title="Press 'H' to toggle UI view"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Show Playback & Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cinema Mode (H)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Unified Control Dock Card */}
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 p-3.5 backdrop-blur-none text-slate-100 flex flex-col gap-2.5">
        {/* Top Row: Video Timeline Scrubber & Chapters */}
        <div className="flex items-center gap-3 w-full">
          {/* Play/Pause Button */}
          <button
            onClick={() => {
              onTogglePlay();
              if (isPlaying) {
                soundEngine.playPause();
              } else {
                soundEngine.playStart();
              }
            }}
            className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20 transition-all shrink-0"
            title={isPlaying ? 'Pause Simulation (Space)' : 'Play Live Simulation (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-slate-950" />
            ) : (
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            )}
          </button>

          {/* Reset / Replay */}
          <button
            onClick={() => {
              onReset();
              soundEngine.playSelect();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors shrink-0"
            title="Restart Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Time Display */}
          <div className="font-mono text-xs text-slate-300 shrink-0 w-24">
            <span className="text-cyan-400 font-semibold">{formatTime(progress)}</span>
            <span className="text-slate-500"> / 01:00</span>
          </div>

          {/* Scrubber Bar */}
          <div className="relative flex-1 group py-1 flex items-center cursor-pointer">
            <input
              type="range"
              min={0}
              max={1}
              step={0.005}
              value={progress}
              onChange={e => onSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 group-hover:h-2 transition-all"
            />
            {/* Chapter milestone ticks */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[25%] w-1.5 h-1.5 rounded-full bg-amber-400 pointer-events-none" title="L4 Strategy Phase" />
            <div className="absolute top-1/2 -translate-y-1/2 left-[50%] w-1.5 h-1.5 rounded-full bg-cyan-400 pointer-events-none" title="L3 Engineering Phase" />
            <div className="absolute top-1/2 -translate-y-1/2 left-[75%] w-1.5 h-1.5 rounded-full bg-emerald-400 pointer-events-none" title="L2 Cloud Core Phase" />
          </div>

          {/* Speed Multiplier Selectors */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 shrink-0">
            {[0.5, 1, 2, 4].map(spd => (
              <button
                key={spd}
                onClick={() => {
                  onSetSpeed(spd);
                  soundEngine.playSelect();
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  playbackSpeed === spd
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Row: Camera View Presets & Drawer Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
          {/* Camera View Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Camera:
            </span>
            {cameraButtons.map(btn => (
              <button
                key={btn.id}
                onClick={() => {
                  onSelectCameraPreset(btn.id);
                  soundEngine.playSelect();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  cameraPreset === btn.id
                    ? 'bg-slate-700 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                }`}
              >
                <span>{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Side Drawer Toggle Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenParameters();
                soundEngine.playSelect();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isParametersOpen
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulation Parameters</span>
            </button>

            <button
              onClick={() => {
                onOpenAnalytics();
                soundEngine.playSelect();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isAnalyticsOpen
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Real-Time Analytics</span>
            </button>

            <button
              onClick={() => {
                onOpenCollaborators();
                soundEngine.playSelect();
              }}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Team Pins</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
