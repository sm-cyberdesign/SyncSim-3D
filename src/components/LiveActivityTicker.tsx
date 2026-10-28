import React from 'react';
import { LIVE_EVENTS_SEQUENCE } from '../data/simulationData';
import { Volume2, VolumeX, Mic, MicOff, Radio, Sparkles, Settings, HeartPulse, AlertTriangle } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { EmotionalTone, EMOTIONAL_TONE_PROFILES } from '../utils/voice';

interface LiveActivityTickerProps {
  currentEvent: typeof LIVE_EVENTS_SEQUENCE[0];
  isVoiceEnabled: boolean;
  isSpeaking: boolean;
  currentTone: EmotionalTone;
  onToggleVoice: () => void;
  onReplayVoice: () => void;
  onOpenVoiceSettings: () => void;
}

export const LiveActivityTicker: React.FC<LiveActivityTickerProps> = ({
  currentEvent,
  isVoiceEnabled,
  isSpeaking,
  currentTone,
  onToggleVoice,
  onReplayVoice,
  onOpenVoiceSettings,
}) => {
  const toneProfile = EMOTIONAL_TONE_PROFILES[currentTone] || EMOTIONAL_TONE_PROFILES.calm;

  // Select phrase tailored to current emotional tone
  let tonePhrase = currentEvent.voicePhrase;
  if (currentTone === 'urgent' && currentEvent.urgentVoicePhrase) {
    tonePhrase = currentEvent.urgentVoicePhrase;
  } else if (currentTone === 'calm' && currentEvent.calmVoicePhrase) {
    tonePhrase = currentEvent.calmVoicePhrase;
  } else if (currentTone === 'energized' && currentEvent.energizedVoicePhrase) {
    tonePhrase = currentEvent.energizedVoicePhrase;
  }

  const isUrgent = currentTone === 'urgent';

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-25 pointer-events-auto" style={{ width: 'min(860px, 94vw)' }}>
      <div
        className={`bg-slate-900/95 rounded-xl px-3.5 py-2 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 text-slate-100 transition-colors duration-300 border ${
          isUrgent ? 'border-rose-500/70 shadow-rose-950/40' : 'border-slate-700/80'
        }`}
      >
        {/* Left: Active Level & Live Activity Badge */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Emotional Tone Indicator Badge */}
          <div
            style={{
              backgroundColor: toneProfile.bgColor,
              borderColor: toneProfile.borderColor,
              color: toneProfile.color,
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border shrink-0 text-[10px] font-bold font-mono tracking-wider"
          >
            {isUrgent ? (
              <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
            ) : (
              <HeartPulse className="w-3 h-3 shrink-0" style={{ color: toneProfile.color }} />
            )}
            <span>{toneProfile.badge}</span>
          </div>

          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white flex items-center gap-2 truncate">
              <span>{currentEvent.levelStatus}</span>
              <span className="text-[10px] text-slate-400 font-normal hidden md:inline">
                ({toneProfile.label} Tone)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate hidden sm:block">
              {tonePhrase}
            </p>
          </div>
        </div>

        {/* Right: Optional Voice to tell what is happening */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              onToggleVoice();
              soundEngine.playSelect();
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              isVoiceEnabled
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
            title={isVoiceEnabled ? 'Voice Narration is ON (Click to disable)' : 'Enable Voice Narration to hear what is happening'}
          >
            {isVoiceEnabled ? (
              <>
                <Mic className="w-3.5 h-3.5 text-white" />
                <span>Voice ON</span>
                {isSpeaking && (
                  <span className="w-2 h-2 rounded-full bg-cyan-300 ring-2 ring-cyan-500/50" title="Speaking now" />
                )}
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Voice Off</span>
              </>
            )}
          </button>

          {isVoiceEnabled && (
            <button
              onClick={() => {
                onReplayVoice();
                soundEngine.playSelect();
              }}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 transition-colors"
              title="Hear description of what is happening now"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => {
              onOpenVoiceSettings();
              soundEngine.playSelect();
            }}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Voice Narration Settings & Natural Voice Selector"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
