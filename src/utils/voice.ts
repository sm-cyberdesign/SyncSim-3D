/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  isNatural: boolean;
}

export type VoicePersona = 'executive' | 'technical' | 'studio';

export type EmotionalTone = 'calm' | 'urgent' | 'energized' | 'strategic';

export interface EmotionalToneConfig {
  tone: EmotionalTone;
  label: string;
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
  rateMultiplier: number;
  pitchMultiplier: number;
  volumeMultiplier: number;
  description: string;
}

export const EMOTIONAL_TONE_PROFILES: Record<EmotionalTone, EmotionalToneConfig> = {
  calm: {
    tone: 'calm',
    label: 'Calm & Steady',
    badge: 'SYSTEM STABLE',
    color: '#34d399',
    bgColor: 'rgba(6, 78, 59, 0.4)',
    borderColor: 'rgba(52, 211, 153, 0.5)',
    rateMultiplier: 0.90, // Unhurried, reassuring
    pitchMultiplier: 0.94, // Grounded, warm frequency
    volumeMultiplier: 0.92,
    description: 'Low error rates, balanced load, and optimal organizational equilibrium',
  },
  urgent: {
    tone: 'urgent',
    label: 'Urgent & Alert',
    badge: 'INCIDENT ANOMALY',
    color: '#f87171',
    bgColor: 'rgba(127, 29, 29, 0.45)',
    borderColor: 'rgba(248, 113, 113, 0.7)',
    rateMultiplier: 1.15, // Fast-paced, alert, intense
    pitchMultiplier: 1.10, // Higher frequency alert with tension
    volumeMultiplier: 1.0,
    description: 'Elevated error rates, handoff bottlenecks, or degraded operational health',
  },
  energized: {
    tone: 'energized',
    label: 'Energized & Surging',
    badge: 'VELOCITY SURGE',
    color: '#38bdf8',
    bgColor: 'rgba(12, 74, 110, 0.4)',
    borderColor: 'rgba(56, 189, 248, 0.6)',
    rateMultiplier: 1.04, // Dynamic, upbeat momentum
    pitchMultiplier: 1.03, // Bright, resonant
    volumeMultiplier: 0.98,
    description: 'High throughput blitz, rapid sprint delivery, and transaction surges',
  },
  strategic: {
    tone: 'strategic',
    label: 'Strategic & Measured',
    badge: 'EXECUTIVE FOCUS',
    color: '#fbbf24',
    bgColor: 'rgba(120, 53, 15, 0.4)',
    borderColor: 'rgba(251, 191, 36, 0.6)',
    rateMultiplier: 0.88, // Deliberate, executive gravitas
    pitchMultiplier: 0.96, // Authoritative, thoughtful
    volumeMultiplier: 0.95,
    description: 'Executive mandate alignment, resource rebalancing, and governance review',
  },
};

// Compute emotional tone based on live simulation health and parameters
export function computeContextualTone(
  parameters: { workloadDemand: number; crossDeptLatency: number; incidentRate: number },
  telemetry: { errorRatePercent: number; efficiencyIndex: number; systemThroughput: number }
): EmotionalTone {
  // Urgent: High error rate or high incident rate or excessive cross-dept bottleneck
  if (
    telemetry.errorRatePercent >= 4.5 ||
    parameters.incidentRate >= 5.5 ||
    (parameters.crossDeptLatency >= 2.4 && telemetry.efficiencyIndex < 80)
  ) {
    return 'urgent';
  }

  // Energized: High throughput demand under healthy efficiency
  if (
    parameters.workloadDemand >= 130 &&
    telemetry.systemThroughput >= 3400 &&
    telemetry.errorRatePercent < 4.0
  ) {
    return 'energized';
  }

  // Calm: High efficiency, very low errors
  if (telemetry.efficiencyIndex >= 89 && telemetry.errorRatePercent <= 3.0) {
    return 'calm';
  }

  // Default: Strategic measured oversight
  return 'strategic';
}

// Advanced Voice Narrator with natural human cadence, voice selection, and emotional tone modulation
class VoiceNarrator {
  private isEnabled: boolean = false;
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private listeners: Set<(speaking: boolean) => void> = new Set();
  private toneListeners: Set<(tone: EmotionalTone) => void> = new Set();

  private persona: VoicePersona = 'executive';
  private currentTone: EmotionalTone = 'calm';
  private isAutoToneEnabled: boolean = true;
  private baseRate: number = 0.92;
  private basePitch: number = 0.98;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const all = window.speechSynthesis.getVoices();

    // Filter out known mechanical/robotic synthesizers (eSpeak, mbrola, dummy)
    this.availableVoices = all.filter(v => {
      const lower = v.name.toLowerCase();
      return !lower.includes('espeak') && !lower.includes('mbrola') && !lower.includes('dummy');
    });

    // Auto-select the most natural sounding English voice available
    const naturalKeywords = [
      'natural',
      'google us english',
      'google uk english female',
      'microsoft jenny',
      'microsoft guy',
      'microsoft aria',
      'samantha',
      'ava',
      'victoria',
      'karen',
      'serena',
      'daniel',
      'oliver',
    ];

    const bestNaturalVoice =
      this.availableVoices.find(v => {
        const lower = v.name.toLowerCase();
        return naturalKeywords.some(k => lower.includes(k));
      }) ||
      this.availableVoices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('desktop')) ||
      this.availableVoices.find(v => v.lang.startsWith('en')) ||
      all[0] ||
      null;

    if (!this.selectedVoice && bestNaturalVoice) {
      this.selectedVoice = bestNaturalVoice;
    }
  }

  public getVoiceList(): VoiceOption[] {
    return this.availableVoices
      .filter(v => v.lang.startsWith('en'))
      .map(v => {
        const lower = v.name.toLowerCase();
        const isNatural =
          lower.includes('natural') ||
          lower.includes('google') ||
          lower.includes('samantha') ||
          lower.includes('ava') ||
          lower.includes('jenny');
        return {
          id: v.name,
          name: v.name,
          lang: v.lang,
          isNatural,
        };
      });
  }

  public setVoiceByName(name: string) {
    const found = this.availableVoices.find(v => v.name === name);
    if (found) {
      this.selectedVoice = found;
    }
  }

  public getSelectedVoiceName(): string {
    return this.selectedVoice?.name || '';
  }

  public setPersona(persona: VoicePersona) {
    this.persona = persona;
    switch (persona) {
      case 'executive':
        this.baseRate = 0.90;
        this.basePitch = 0.98;
        break;
      case 'technical':
        this.baseRate = 0.96;
        this.basePitch = 1.0;
        break;
      case 'studio':
        this.baseRate = 0.88;
        this.basePitch = 0.95;
        break;
    }
  }

  public getPersona(): VoicePersona {
    return this.persona;
  }

  public setTone(tone: EmotionalTone) {
    if (this.currentTone !== tone) {
      this.currentTone = tone;
      this.notifyTone();
    }
  }

  public getTone(): EmotionalTone {
    return this.currentTone;
  }

  public setAutoToneEnabled(enabled: boolean) {
    this.isAutoToneEnabled = enabled;
  }

  public getAutoToneEnabled(): boolean {
    return this.isAutoToneEnabled;
  }

  public setBaseRate(rate: number) {
    this.baseRate = Math.min(1.4, Math.max(0.7, rate));
  }

  public getBaseRate(): number {
    return this.baseRate;
  }

  public setBasePitch(pitch: number) {
    this.basePitch = Math.min(1.3, Math.max(0.7, pitch));
  }

  public getBasePitch(): number {
    return this.basePitch;
  }

  public subscribe(cb: (speaking: boolean) => void): () => void {
    this.listeners.add(cb);
    cb(this.isSpeaking);
    return () => this.listeners.delete(cb);
  }

  public subscribeTone(cb: (tone: EmotionalTone) => void): () => void {
    this.toneListeners.add(cb);
    cb(this.currentTone);
    return () => this.toneListeners.delete(cb);
  }

  private notifySpeaking() {
    this.listeners.forEach(cb => cb(this.isSpeaking));
  }

  private notifyTone() {
    this.toneListeners.forEach(cb => cb(this.currentTone));
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  // Pre-process and modulate text according to emotional tone and human cadence
  private humanizeText(raw: string, tone: EmotionalTone): string {
    let text = raw
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .replace(/(\b(?:approved|deployed|ingesting|fulfilled|surging)\b)/gi, '$1,')
      .trim();

    // Context-aware emotional inflection prefix
    if (tone === 'urgent' && !text.toLowerCase().includes('alert') && !text.toLowerCase().includes('attention')) {
      text = `Alert: ${text}`;
    } else if (tone === 'energized' && !text.toLowerCase().includes('momentum') && !text.toLowerCase().includes('surge')) {
      text = `High momentum: ${text}`;
    }

    return text;
  }

  public speak(text: string, priority: boolean = false, overrideTone?: EmotionalTone) {
    if (!this.isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (priority || window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const activeTone = overrideTone || this.currentTone;
    const profile = EMOTIONAL_TONE_PROFILES[activeTone] || EMOTIONAL_TONE_PROFILES.calm;

    const cleanText = this.humanizeText(text, activeTone);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // Modulate rate, pitch, and volume dynamically based on emotional tone profile
    utterance.rate = Math.min(1.4, Math.max(0.65, this.baseRate * profile.rateMultiplier));
    utterance.pitch = Math.min(1.4, Math.max(0.65, this.basePitch * profile.pitchMultiplier));
    utterance.volume = Math.min(1.0, 0.95 * profile.volumeMultiplier);

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notifySpeaking();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifySpeaking();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifySpeaking();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public testVoice(tone?: EmotionalTone) {
    const testTone = tone || this.currentTone;
    let sample = '';
    switch (testTone) {
      case 'urgent':
        sample = 'Alert: Incident rate has spiked past critical thresholds! Platform latency is degrading handoff pipelines.';
        break;
      case 'calm':
        sample = 'Systems are nominal. All organizational tiers are performing in steady state with low defect rates.';
        break;
      case 'energized':
        sample = 'Surge velocity active! Peak throughput is scaling smoothly across distributed cloud clusters with heavy transaction volume.';
        break;
      case 'strategic':
        sample = 'Executive governance is reviewing portfolio allocation to balance team capacity and strategic OKRs.';
        break;
    }
    this.speak(sample, true, testTone);
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifySpeaking();
    }
  }
}

export const voiceNarrator = new VoiceNarrator();
