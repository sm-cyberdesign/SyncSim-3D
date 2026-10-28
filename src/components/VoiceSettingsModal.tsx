/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  voiceNarrator,
  VoiceOption,
  VoicePersona,
  EmotionalTone,
  EMOTIONAL_TONE_PROFILES,
} from '../utils/voice';
import { Mic, Volume2, X, Sliders, Play, Check, HeartPulse, Sparkles, Activity } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  currentTone: EmotionalTone;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  isVoiceEnabled,
  onToggleVoice,
  currentTone,
}) => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [persona, setPersona] = useState<VoicePersona>('executive');
  const [rate, setRate] = useState<number>(0.92);
  const [pitch, setPitch] = useState<number>(0.98);
  const [isAutoTone, setIsAutoTone] = useState<boolean>(true);
  const [activePreviewTone, setActivePreviewTone] = useState<EmotionalTone>(currentTone);

  useEffect(() => {
    if (isOpen) {
      setVoices(voiceNarrator.getVoiceList());
      setSelectedVoice(voiceNarrator.getSelectedVoiceName());
      setPersona(voiceNarrator.getPersona());
      setRate(voiceNarrator.getBaseRate());
      setPitch(voiceNarrator.getBasePitch());
      setIsAutoTone(voiceNarrator.getAutoToneEnabled());
      setActivePreviewTone(currentTone);
    }
  }, [isOpen, currentTone]);

  if (!isOpen) return null;

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    voiceNarrator.setVoiceByName(voiceName);
  };

  const handlePersonaChange = (p: VoicePersona) => {
    setPersona(p);
    voiceNarrator.setPersona(p);
    setRate(voiceNarrator.getBaseRate());
    setPitch(voiceNarrator.getBasePitch());
  };

  const handleTestTone = (tone: EmotionalTone) => {
    setActivePreviewTone(tone);
    voiceNarrator.setEnabled(true);
    voiceNarrator.testVoice(tone);
    if (tone === 'urgent') {
      soundEngine.playAlert();
    } else {
      soundEngine.playSelect();
    }
  };

  const currentProfile = EMOTIONAL_TONE_PROFILES[currentTone];

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/90 p-5 text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Voice & Emotional Tone Engine</h2>
              <p className="text-xs text-slate-400">Context-aware human modulation & natural voices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Voice Narration Toggle */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Voice Narration System</div>
            <div className="text-[11px] text-slate-400">Live operational events narrated with contextual tone</div>
          </div>
          <button
            onClick={() => {
              onToggleVoice();
              soundEngine.playSelect();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isVoiceEnabled
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {isVoiceEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Emotional Tone Modulation (Active Section) */}
        <div className="p-3.5 bg-slate-950/90 border border-slate-750 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-xs font-bold text-white">Live Emotional Tone Modulation</div>
                <div className="text-[10px] text-slate-400">Acoustics modulate automatically based on system health</div>
              </div>
            </div>

            {/* Current Active Tone Badge */}
            <div
              style={{
                backgroundColor: currentProfile.bgColor,
                borderColor: currentProfile.borderColor,
                color: currentProfile.color,
              }}
              className="px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-wider"
            >
              {currentProfile.badge}
            </div>
          </div>

          {/* Tone Profiles Grid */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(EMOTIONAL_TONE_PROFILES) as EmotionalTone[]).map(toneKey => {
              const prof = EMOTIONAL_TONE_PROFILES[toneKey];
              const isSelected = (isAutoTone ? currentTone : activePreviewTone) === toneKey;

              return (
                <div
                  key={toneKey}
                  style={{
                    backgroundColor: isSelected ? prof.bgColor : 'rgba(15, 23, 42, 0.5)',
                    borderColor: isSelected ? prof.borderColor : 'rgba(51, 65, 85, 0.6)',
                  }}
                  className={`p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between gap-1.5`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: prof.color }} className="text-xs font-bold">
                        {prof.label}
                      </span>
                      <button
                        onClick={() => handleTestTone(toneKey)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title={`Listen to sample of ${prof.label}`}
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                      {prof.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-t border-slate-800/80 pt-1">
                    <span>Speed: {prof.rateMultiplier}x</span>
                    <span>Pitch: {prof.pitchMultiplier}x</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Dynamic phrasing adapts automatically as incident rates or demand surge.</span>
            <button
              onClick={() => {
                const next = !isAutoTone;
                setIsAutoTone(next);
                voiceNarrator.setAutoToneEnabled(next);
                soundEngine.playSelect();
              }}
              className="text-xs font-semibold text-cyan-400 hover:underline shrink-0 ml-2"
            >
              {isAutoTone ? 'Auto-Sync: ON' : 'Manual Mode'}
            </button>
          </div>
        </div>

        {/* Voice Persona Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Base Voice Persona
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'executive' as VoicePersona, label: 'Executive', sub: 'Calm & Measured' },
              { id: 'technical' as VoicePersona, label: 'Technical', sub: 'Crisp & Direct' },
              { id: 'studio' as VoicePersona, label: 'Documentary', sub: 'Deep & Cinematic' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handlePersonaChange(item.id)}
                className={`p-2 rounded-xl border text-left transition-all ${
                  persona === item.id
                    ? 'bg-cyan-950/80 border-cyan-400 text-white ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-slate-400">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* System Voice Selection Dropdown */}
        {voices.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Installed Voice Model
            </label>
            <select
              value={selectedVoice}
              onChange={e => handleVoiceChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {voices.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.isNatural ? '★ (Natural Neural)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Speed & Pitch Controls */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Base Pacing</span>
              <span className="font-mono text-cyan-400">{rate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.75}
              max={1.15}
              step={0.02}
              value={rate}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setRate(val);
                voiceNarrator.setBaseRate(val);
              }}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Base Pitch</span>
              <span className="font-mono text-cyan-400">{pitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.8}
              max={1.2}
              step={0.02}
              value={pitch}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setPitch(val);
                voiceNarrator.setBasePitch(val);
              }}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Footer with Test Current Tone Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => handleTestTone(currentTone)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-cyan-400" />
            <span>Test Current Tone ({currentProfile.label})</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
