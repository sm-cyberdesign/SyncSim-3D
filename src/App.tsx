/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewportCanvas } from './components/ViewportCanvas';
import { TopNavbar } from './components/TopNavbar';
import { BottomControlDock } from './components/BottomControlDock';
import { ParametersPanel } from './components/ParametersPanel';
import { AnalyticsInspector } from './components/AnalyticsInspector';
import { HistoricalViewOverlay } from './components/HistoricalViewOverlay';
import { CollaboratorsModal } from './components/CollaboratorsModal';
import { DirectorSubtitles } from './components/DirectorSubtitles';
import { SideLevelsHUD } from './components/SideLevelsHUD';
import { LiveActivityTicker } from './components/LiveActivityTicker';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import {
  SimulationMode,
  CameraPreset,
  DepartmentNode,
  SimulationParameters,
  TelemetryPoint,
  HistoricalSnapshot,
  ParameterProposal,
  SpatialAnnotation,
  Collaborator,
} from './types/simulation';
import {
  ORG_LEVELS,
  INITIAL_PARAMETERS,
  HISTORICAL_SNAPSHOTS,
  INITIAL_COLLABORATORS,
  INITIAL_ANNOTATIONS,
  INITIAL_PROPOSALS,
  CINEMATIC_STEPS,
  LIVE_EVENTS_SEQUENCE,
} from './data/simulationData';
import { SimulationScene } from './three/SimulationScene';
import { soundEngine } from './utils/audio';
import { voiceNarrator, computeContextualTone, EmotionalTone } from './utils/voice';

export default function App() {
  // App view modes
  const [mode, setMode] = useState<SimulationMode>('live');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');

  // Hierarchy selections
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentNode | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);

  // Simulation Parameters & Collaborators
  const [parameters, setParameters] = useState<SimulationParameters>(INITIAL_PARAMETERS);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);
  const [annotations, setAnnotations] = useState<SpatialAnnotation[]>(INITIAL_ANNOTATIONS);
  const [proposals, setProposals] = useState<ParameterProposal[]>(INITIAL_PROPOSALS);

  // Historical data
  const [selectedSnapshot, setSelectedSnapshot] = useState<HistoricalSnapshot>(HISTORICAL_SNAPSHOTS[0]);

  // Drawer / Modal states
  const [isParametersOpen, setIsParametersOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(true);
  const [isCollaboratorsOpen, setIsCollaboratorsOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Cinematic Director Mode (Video Clip presentation)
  const [isCinematicMode, setIsCinematicMode] = useState<boolean>(false);
  const [cinematicStepIndex, setCinematicStepIndex] = useState<number>(0);

  // In-Model 3D Labels & Voice Narration
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const lastSpokenPhaseRef = useRef<string>('');

  // Subscribe to voice speaking state
  useEffect(() => {
    const unsub = voiceNarrator.subscribe(setIsSpeaking);
    return unsub;
  }, []);

  // Real-time telemetry records
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      timestamp: i * 3,
      systemThroughput: 3100 + Math.sin(i * 0.5) * 450,
      efficiencyIndex: 91 + Math.cos(i * 0.4) * 2,
      cycleTimeHours: 1.4 + Math.sin(i * 0.2) * 0.1,
      errorRatePercent: 2.5 + Math.cos(i) * 0.3,
      activePackets: 65,
      revenuePerMin: 12400 + i * 200,
    }));
  });

  const [currentTelemetry, setCurrentTelemetry] = useState<TelemetryPoint>(telemetryHistory[telemetryHistory.length - 1]);

  const sceneInstanceRef = useRef<SimulationScene | null>(null);

  // Determine current active organizational event
  const currentEvent =
    LIVE_EVENTS_SEQUENCE.find(
      ev => simulationProgress >= ev.progressMin && simulationProgress < ev.progressMax
    ) || LIVE_EVENTS_SEQUENCE[0];

  // Dynamic emotional tone computed from real-time simulation health and parameters
  const contextualTone: EmotionalTone = computeContextualTone(parameters, currentTelemetry);
  const prevToneRef = useRef<EmotionalTone>('calm');

  // Sync contextual tone and play transition cue
  useEffect(() => {
    if (voiceNarrator.getAutoToneEnabled()) {
      voiceNarrator.setTone(contextualTone);
    }
    if (prevToneRef.current !== contextualTone) {
      if (contextualTone === 'urgent') {
        soundEngine.playAlert();
      } else if (prevToneRef.current === 'urgent' && contextualTone === 'calm') {
        soundEngine.playResolution();
      }
      prevToneRef.current = contextualTone;
    }
  }, [contextualTone]);

  // Helper to get phrasing adapted to current emotional tone
  const getPhraseForTone = useCallback((event: typeof LIVE_EVENTS_SEQUENCE[0], tone: EmotionalTone) => {
    if (tone === 'urgent' && event.urgentVoicePhrase) return event.urgentVoicePhrase;
    if (tone === 'calm' && event.calmVoicePhrase) return event.calmVoicePhrase;
    if (tone === 'energized' && event.energizedVoicePhrase) return event.energizedVoicePhrase;
    return event.voicePhrase;
  }, []);

  // Compute live telemetry synced with parameters and simulation pulse
  const calculateTelemetry = useCallback(
    (progress: number, params: SimulationParameters): TelemetryPoint => {
      const demandMul = params.workloadDemand / 100;
      const autoMul = params.automationRate / 70;
      const latencyPenalty = (params.crossDeptLatency - 1.0) * 4;
      const incidentPenalty = params.incidentRate * 0.8;

      const wave = Math.sin(progress * Math.PI * 4) * 350;
      const systemThroughput = Math.max(800, 3200 * demandMul * autoMul + wave);
      const efficiencyIndex = Math.min(99.5, Math.max(50, 92 + (autoMul - 1) * 8 - latencyPenalty - incidentPenalty));
      const cycleTimeHours = Math.max(0.4, (1.8 * params.crossDeptLatency) / (params.automationRate / 50));
      const errorRatePercent = Math.max(0.2, params.incidentRate * (params.workloadDemand / 100));
      const revenuePerMin = Math.max(2000, 12800 * demandMul * (efficiencyIndex / 90));

      return {
        timestamp: Math.floor(progress * 60),
        systemThroughput,
        efficiencyIndex,
        cycleTimeHours,
        errorRatePercent,
        activePackets: Math.floor(40 + demandMul * 45),
        revenuePerMin,
      };
    },
    []
  );

  // Playback timer & telemetry streamer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = window.setInterval(() => {
      setSimulationProgress(prev => {
        const next = (prev + 0.006 * playbackSpeed) % 1;
        const pt = calculateTelemetry(next, parameters);
        setCurrentTelemetry(pt);
        setTelemetryHistory(hist => [...hist.slice(-24), pt]);
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, parameters, calculateTelemetry]);

  // Cinematic Director Auto-Advance
  useEffect(() => {
    if (!isCinematicMode) return;

    const currentStep = CINEMATIC_STEPS[cinematicStepIndex];
    if (sceneInstanceRef.current) {
      if (currentStep.focusLevel > 0) {
        sceneInstanceRef.current.selectLevel(currentStep.focusLevel);
      } else {
        sceneInstanceRef.current.setCameraPreset('cinematic');
      }
    }

    if (isVoiceEnabled) {
      voiceNarrator.speak(currentStep.narration, true, contextualTone);
    }

    const timer = setTimeout(() => {
      setCinematicStepIndex(prev => (prev + 1) % CINEMATIC_STEPS.length);
    }, currentStep.durationMs);

    return () => clearTimeout(timer);
  }, [isCinematicMode, cinematicStepIndex, isVoiceEnabled, contextualTone]);

  // Live simulation voice narration on phase change with emotional tone modulation
  useEffect(() => {
    if (!isVoiceEnabled || !isPlaying || isCinematicMode) return;

    if (currentEvent.levelStatus !== lastSpokenPhaseRef.current) {
      lastSpokenPhaseRef.current = currentEvent.levelStatus;
      const phrase = getPhraseForTone(currentEvent, contextualTone);
      voiceNarrator.speak(phrase, false, contextualTone);
    }
  }, [currentEvent, isVoiceEnabled, isPlaying, isCinematicMode, contextualTone, getPhraseForTone]);

  const handleToggleVoice = () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    voiceNarrator.setEnabled(next);
    if (next) {
      if (isCinematicMode) {
        voiceNarrator.speak(CINEMATIC_STEPS[cinematicStepIndex].narration, true, contextualTone);
      } else {
        const phrase = getPhraseForTone(currentEvent, contextualTone);
        voiceNarrator.speak(phrase, true, contextualTone);
      }
    }
  };

  // Handle Level Selection
  const handleSelectLevel = (levelId: number | null) => {
    setSelectedLevelId(levelId);
    if (!levelId) {
      setSelectedDepartment(null);
    } else {
      // Find preset name
      const presetMap: Record<number, CameraPreset> = {
        4: 'executive',
        3: 'engineering',
        2: 'cloud',
        1: 'market',
      };
      if (presetMap[levelId]) {
        setCameraPreset(presetMap[levelId]);
      }
    }
  };

  // Handle Department Selection
  const handleSelectDepartment = (dept: DepartmentNode | null) => {
    setSelectedDepartment(dept);
    if (dept) {
      setSelectedLevelId(dept.levelId);
      setIsAnalyticsOpen(true);
    }
  };

  // Handle Camera Preset Selection
  const handleSelectCameraPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    if (preset === 'overview') {
      setSelectedDepartment(null);
      setSelectedLevelId(null);
    } else if (preset === 'executive') {
      setSelectedLevelId(4);
    } else if (preset === 'engineering') {
      setSelectedLevelId(3);
    } else if (preset === 'cloud') {
      setSelectedLevelId(2);
    } else if (preset === 'market') {
      setSelectedLevelId(1);
    }
  };

  // Proposal voting
  const handleVoteProposal = (proposalId: string, voteYes: boolean) => {
    setProposals(prev =>
      prev.map(p => {
        if (p.id === proposalId) {
          return {
            ...p,
            votesYes: voteYes ? p.votesYes + 1 : p.votesYes,
            votesNo: !voteYes ? p.votesNo + 1 : p.votesNo,
            hasUserVoted: true,
          };
        }
        return p;
      })
    );
  };

  // Apply consensus proposal changes
  const handleApplyProposal = (proposal: ParameterProposal) => {
    setParameters(prev => ({
      ...prev,
      ...proposal.changes,
    }));
  };

  // Create new user proposal
  const handleCreateProposal = (title: string, changes: Partial<SimulationParameters>) => {
    const newProp: ParameterProposal = {
      id: `prop-${Date.now()}`,
      proposerName: 'You (Lead Architect)',
      title,
      description: 'Custom parameter proposal submitted by Lead Architect for team consensus alignment.',
      changes,
      votesYes: 1,
      votesNo: 0,
      hasUserVoted: true,
    };
    setProposals(prev => [newProp, ...prev]);
  };

  // Add 3D Spatial Annotation Pin
  const handleAddAnnotation = (levelId: number, content: string) => {
    const targetLvl = ORG_LEVELS.find(l => l.id === levelId);
    const yPos = targetLvl ? targetLvl.yPosition + 0.3 : 4;
    const angle = Math.random() * Math.PI * 2;
    const dist = 3.5 + Math.random() * 2.5;

    const newAnnot: SpatialAnnotation = {
      id: `annot-${Date.now()}`,
      authorId: 'user-self',
      authorName: 'You (Lead Architect)',
      levelId,
      position: [Math.cos(angle) * dist, yPos, Math.sin(angle) * dist],
      content,
      createdAt: 'Just now',
      votes: 1,
    };
    setAnnotations(prev => [newAnnot, ...prev]);
  };

  const handleVoteAnnotation = (annotId: string) => {
    setAnnotations(prev =>
      prev.map(a => (a.id === annotId ? { ...a, votes: a.votes + 1 } : a))
    );
  };

  // Calculate team alignment score
  const alignmentScore = Math.round(
    Math.min(99, Math.max(72, currentTelemetry.efficiencyIndex - (parameters.crossDeptLatency - 1.0) * 3))
  );

  const selectedLevel = ORG_LEVELS.find(l => l.id === selectedLevelId) || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 3D WebGL Viewport Canvas */}
      <ViewportCanvas
        levels={ORG_LEVELS}
        parameters={parameters}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        simulationProgress={simulationProgress}
        collaborators={collaborators}
        annotations={annotations}
        selectedDepartment={selectedDepartment}
        selectedLevelId={selectedLevelId}
        cameraPreset={cameraPreset}
        onSelectDepartment={handleSelectDepartment}
        onSelectLevel={handleSelectLevel}
        onSceneReady={scene => {
          sceneInstanceRef.current = scene;
        }}
      />

      {/* Side Levels & Operational Actions HUD (docked on side outside 3D model) */}
      {showLabels && !isCinematicMode && (
        <SideLevelsHUD
          levels={ORG_LEVELS}
          currentEvent={currentEvent}
          selectedLevelId={selectedLevelId}
          selectedDepartment={selectedDepartment}
          onSelectLevel={handleSelectLevel}
          onSelectDepartment={handleSelectDepartment}
          currentTone={contextualTone}
        />
      )}

      {/* Top Navigation Bar */}
      <TopNavbar
        mode={mode}
        onSetMode={newMode => {
          setMode(newMode);
          if (newMode === 'historical') {
            setIsPlaying(false);
          }
        }}
        isCinematicMode={isCinematicMode}
        onToggleCinematicMode={() => {
          const next = !isCinematicMode;
          setIsCinematicMode(next);
          if (next) {
            setCinematicStepIndex(0);
            setIsPlaying(true);
          }
        }}
        collaborators={collaborators}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onResetView={() => handleSelectCameraPreset('overview')}
        onOpenCollaborators={() => setIsCollaboratorsOpen(true)}
        alignmentScore={alignmentScore}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        isVoiceEnabled={isVoiceEnabled}
        onToggleVoice={handleToggleVoice}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        currentTone={contextualTone}
      />

      {/* Live Activity Ticker (shows what is happening live across levels with voice trigger) */}
      {!isCinematicMode && mode === 'live' && (
        <LiveActivityTicker
          currentEvent={currentEvent}
          isVoiceEnabled={isVoiceEnabled}
          isSpeaking={isSpeaking}
          currentTone={contextualTone}
          onToggleVoice={handleToggleVoice}
          onReplayVoice={() =>
            voiceNarrator.speak(getPhraseForTone(currentEvent, contextualTone), true, contextualTone)
          }
          onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        />
      )}

      {/* Cinematic Director Subtitles (Video Clip Walkthrough) */}
      {isCinematicMode && (
        <DirectorSubtitles
          currentStep={CINEMATIC_STEPS[cinematicStepIndex]}
          currentStepIndex={cinematicStepIndex}
          totalSteps={CINEMATIC_STEPS.length}
          onPrevStep={() => setCinematicStepIndex(prev => Math.max(0, prev - 1))}
          onNextStep={() => setCinematicStepIndex(prev => (prev + 1) % CINEMATIC_STEPS.length)}
          onCloseDirector={() => setIsCinematicMode(false)}
          isVoiceEnabled={isVoiceEnabled}
          onToggleVoice={handleToggleVoice}
          onSpeakNarration={text => voiceNarrator.speak(text, true, contextualTone)}
        />
      )}

      {/* Voice Settings & Natural Voice Selector Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        isVoiceEnabled={isVoiceEnabled}
        onToggleVoice={handleToggleVoice}
        currentTone={contextualTone}
      />

      {/* Historical Data View Overlay (when mode === 'historical') */}
      {mode === 'historical' && (
        <HistoricalViewOverlay
          snapshots={HISTORICAL_SNAPSHOTS}
          selectedSnapshot={selectedSnapshot}
          onSelectSnapshot={snap => {
            setSelectedSnapshot(snap);
            setTelemetryHistory(snap.telemetryHistory);
            setCurrentTelemetry(snap.telemetryHistory[0]);
          }}
          onApplySnapshotToLive={snapParams => {
            setParameters(snapParams);
            setMode('live');
            setIsPlaying(true);
          }}
          onClose={() => setMode('live')}
        />
      )}

      {/* Parameters Tuning & Collaborative Proposals Drawer */}
      <ParametersPanel
        isOpen={isParametersOpen}
        onClose={() => setIsParametersOpen(false)}
        parameters={parameters}
        onUpdateParameters={setParameters}
        collaborators={collaborators}
        proposals={proposals}
        onVoteProposal={handleVoteProposal}
        onApplyProposal={handleApplyProposal}
        onCreateProposal={handleCreateProposal}
      />

      {/* Synchronized Real-Time Analytics Inspector Drawer */}
      <AnalyticsInspector
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        selectedDepartment={selectedDepartment}
        selectedLevel={selectedLevel}
        telemetryHistory={telemetryHistory}
        currentTelemetry={currentTelemetry}
        parameters={parameters}
        onSelectLevel={handleSelectLevel}
      />

      {/* Multi-User Collaboration & 3D Spatial Pins Modal */}
      <CollaboratorsModal
        isOpen={isCollaboratorsOpen}
        onClose={() => setIsCollaboratorsOpen(false)}
        collaborators={collaborators}
        annotations={annotations}
        onAddAnnotation={handleAddAnnotation}
        onVoteAnnotation={handleVoteAnnotation}
      />

      {/* Collapsible Unified Bottom Control Dock */}
      <BottomControlDock
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        progress={simulationProgress}
        cameraPreset={cameraPreset}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onSetSpeed={setPlaybackSpeed}
        onSeek={p => {
          setSimulationProgress(p);
          const pt = calculateTelemetry(p, parameters);
          setCurrentTelemetry(pt);
        }}
        onReset={() => {
          setSimulationProgress(0);
          setIsPlaying(true);
        }}
        onSelectCameraPreset={handleSelectCameraPreset}
        onOpenParameters={() => setIsParametersOpen(!isParametersOpen)}
        onOpenAnalytics={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
        onOpenCollaborators={() => setIsCollaboratorsOpen(true)}
        isParametersOpen={isParametersOpen}
        isAnalyticsOpen={isAnalyticsOpen}
      />
    </div>
  );
}
