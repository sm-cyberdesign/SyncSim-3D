/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewportCanvas } from './components/ViewportCanvas';
import { TopNavbar, MainAppView } from './components/TopNavbar';
import { SideLevelsHUD } from './components/SideLevelsHUD';
import { ExerciseController } from './components/ExerciseController';
import { AIAgentsPanel } from './components/AIAgentsPanel';
import { FacilitatorDrawer } from './components/FacilitatorDrawer';
import { DecisionDrawer } from './components/DecisionDrawer';
import { AnalyticsInspector } from './components/AnalyticsInspector';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { TextAlternativeView } from './components/TextAlternativeView';
import { RecordingWorkflowModal } from './components/RecordingWorkflowModal';
import { ExerciseFlowGuideModal } from './components/ExerciseFlowGuideModal';
import { QRJoinModal } from './components/QRJoinModal';

// Multiplayer Connected Interfaces
import { HostFacilitatorConsole } from './components/HostFacilitatorConsole';
import { ParticipantInterface } from './components/ParticipantInterface';
import { WelcomeLandingScreen } from './components/WelcomeLandingScreen';
import { ProjectorCompanionView } from './components/ProjectorCompanionView';

import {
  AppMode,
  ScenarioInjectPart,
  DecisionRecord,
} from './types/exercise';
import {
  CameraPreset,
  DepartmentNode,
  SimulationParameters,
  TelemetryPoint,
  Collaborator,
  SpatialAnnotation,
} from './types/simulation';
import {
  TabletopSessionState,
} from './types/multiplayer';

import {
  SCENARIO_INJECT_PARTS,
  EXERCISE_TIERS,
  MERIDIAN_ORG_LEVELS,
} from './data/silentLedgerScenario';
import {
  INITIAL_PARAMETERS,
  INITIAL_COLLABORATORS,
  INITIAL_ANNOTATIONS,
  CINEMATIC_STEPS,
} from './data/simulationData';

import { SimulationScene } from './three/SimulationScene';
import { soundEngine } from './utils/audio';
import { voiceNarrator, computeContextualTone, EmotionalTone } from './utils/voice';
import {
  getSessionApi,
  subscribeToSession,
  getStoredSession,
  hostControlApi,
} from './utils/multiplayerClient';

import {
  Shield,
  Crown,
  Users,
  Clock,
  QrCode,
} from 'lucide-react';

const STORAGE_KEY_DECISIONS = 'operation_silent_ledger_decisions_v1';
const STORAGE_KEY_EVIDENCE = 'operation_silent_ledger_evidence_v1';
const STORAGE_KEY_PART = 'operation_silent_ledger_part_v1';

export default function App() {
  // Check URL query parameters for initial view or join code
  const initialParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialViewParam = initialParams?.get('view') as MainAppView | null;
  const initialJoinParam = initialParams?.get('join');

  const [activeView, setActiveView] = useState<MainAppView>(() => {
    if (initialJoinParam) {
      return 'participant';
    }
    if (initialViewParam && ['landing', 'participant', 'projector', 'host', 'shared_3d'].includes(initialViewParam)) {
      return initialViewParam;
    }
    return 'landing';
  });

  const [sessionCode, setSessionCode] = useState<string>(() => {
    if (initialJoinParam) return initialJoinParam.toUpperCase();
    const stored = getStoredSession();
    return stored.code || 'SL-SILENT';
  });

  const [participantToken, setParticipantToken] = useState<string | null>(() => {
    const stored = getStoredSession();
    return stored.token;
  });

  // Tabletop Multiplayer Session State
  const [sessionState, setSessionState] = useState<TabletopSessionState | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);

  // App Mode: Exercise (tabletop manual) vs Presentation (scripted walkthrough)
  const [appMode, setAppMode] = useState<AppMode>('exercise');
  const [isPaused, setIsPaused] = useState<boolean>(true); // Tabletop sessions start paused!
  const [isDiscussionPause, setIsDiscussionPause] = useState<boolean>(true);

  // Exercise Part Index (14 injects with 15 delivery parts, 0 to 14)
  const [currentPartIndex, setCurrentPartIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PART);
      return saved ? Math.min(SCENARIO_INJECT_PARTS.length - 1, Math.max(0, parseInt(saved, 10))) : 0;
    } catch {
      return 0;
    }
  });

  const currentInject: ScenarioInjectPart = SCENARIO_INJECT_PARTS[currentPartIndex] || SCENARIO_INJECT_PARTS[0];

  // Dual Clocks: Exercise Elapsed Time
  const [exerciseElapsedSeconds, setExerciseElapsedSeconds] = useState<number>(0);

  // Facilitator View Toggle
  const [isFacilitatorView, setIsFacilitatorView] = useState<boolean>(false);

  // Persistent Decisions Record
  const [decisionsMap, setDecisionsMap] = useState<Record<string, DecisionRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DECISIONS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Released Evidence Packets (managed by Facilitator)
  const [releasedEvidenceIds, setReleasedEvidenceIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVIDENCE);
      return saved ? new Set(JSON.parse(saved)) : new Set(['ev-1.1-vpn']);
    } catch {
      return new Set(['ev-1.1-vpn']);
    }
  });

  // 3D Scene camera & selection states
  const [cameraPreset] = useState<CameraPreset>('cloud');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentNode | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(currentInject.primaryTierId);

  // Drawers and Modals
  const [isAIAgentsOpen, setIsAIAgentsOpen] = useState<boolean>(false);
  const [isDecisionsOpen, setIsDecisionsOpen] = useState<boolean>(false);
  const [isFacilitatorOpen, setIsFacilitatorOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);
  const [isTextAltOpen, setIsTextAltOpen] = useState<boolean>(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState<boolean>(false);
  const [isFlowGuideOpen, setIsFlowGuideOpen] = useState<boolean>(false);

  // Voice Narration (Off by default as required)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(false);
  const [, setIsSpeaking] = useState<boolean>(false);

  // Cinematic Director Walkthrough
  const [isCinematicMode, setIsCinematicMode] = useState<boolean>(false);
  const [cinematicStepIndex, setCinematicStepIndex] = useState<number>(0);

  // Simulation Parameters & Collaborators
  const [parameters] = useState<SimulationParameters>(INITIAL_PARAMETERS);
  const [collaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);
  const [annotations] = useState<SpatialAnnotation[]>(INITIAL_ANNOTATIONS);

  // Telemetry stream
  const [telemetryHistory] = useState<TelemetryPoint[]>(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      timestamp: i * 3,
      systemThroughput: 18400 - i * 150,
      efficiencyIndex: 94 - i * 0.4,
      cycleTimeHours: 1.4,
      errorRatePercent: 1.2 + i * 0.15,
      activePackets: 55,
      revenuePerMin: 32000 - i * 200,
    }));
  });

  const [currentTelemetry] = useState<TelemetryPoint>(telemetryHistory[telemetryHistory.length - 1]);

  const sceneInstanceRef = useRef<SimulationScene | null>(null);

  // 1. Initial Fetch & Subscribe to Server-Authoritative SSE stream
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const res = await getSessionApi(sessionCode);
        if (isMounted) {
          setSessionState(res.session);
          setCurrentPartIndex(res.session.currentPartIndex);
          setIsPaused(!res.session.isClockRunning);
          setExerciseElapsedSeconds(res.session.totalElapsedSeconds);
          setReleasedEvidenceIds(new Set(res.session.releasedEvidenceIds));
        }
      } catch (err) {
        console.warn('Initial session fetch fallback:', err);
      }
    }

    initSession();

    // Subscribe to SSE updates
    const unsubscribe = subscribeToSession(
      sessionCode,
      (updated) => {
        if (!isMounted) return;
        setSessionState(updated);
        setCurrentPartIndex(updated.currentPartIndex);
        setIsPaused(!updated.isClockRunning);
        setExerciseElapsedSeconds(updated.totalElapsedSeconds);
        setReleasedEvidenceIds(new Set(updated.releasedEvidenceIds));
      },
      (err) => {
        console.warn('SSE subscription warning:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [sessionCode]);

  // Subscribe to speech state
  useEffect(() => {
    const unsub = voiceNarrator.subscribe(setIsSpeaking);
    return unsub;
  }, []);

  // Transition camera to match current primary tier
  const focusCameraOnTier = useCallback((tierId: number | null) => {
    setSelectedLevelId(tierId);
    setSelectedDepartment(null);
    if (sceneInstanceRef.current && tierId !== null) {
      sceneInstanceRef.current.selectLevel(tierId);
    } else if (sceneInstanceRef.current) {
      sceneInstanceRef.current.clearSelection();
    }
  }, []);

  // Jump to specific inject part
  const handleSelectPartIndex = useCallback(
    (index: number) => {
      const bounded = Math.max(0, Math.min(SCENARIO_INJECT_PARTS.length - 1, index));
      setCurrentPartIndex(bounded);
      try {
        localStorage.setItem(STORAGE_KEY_PART, bounded.toString());
      } catch (e) {
        console.error(e);
      }

      const targetInject = SCENARIO_INJECT_PARTS[bounded];
      focusCameraOnTier(targetInject.primaryTierId);

      // In Exercise Mode, pause at every decision point
      if (appMode === 'exercise') {
        setIsPaused(true);
        setIsDiscussionPause(true);
      }

      // Notify server of part index change
      hostControlApi(sessionCode, 'set_part', { currentPartIndex: bounded }).catch(() => {});

      // Sync speech synthesis: cancel speech on inject change
      voiceNarrator.stop();
      if (isVoiceEnabled) {
        voiceNarrator.speak(targetInject.presentationNarration, true, 'strategic');
      }
    },
    [appMode, focusCameraOnTier, isVoiceEnabled, sessionCode]
  );

  const handlePrevPart = () => {
    if (currentPartIndex > 0) {
      handleSelectPartIndex(currentPartIndex - 1);
    }
  };

  const handleNextPart = () => {
    if (currentPartIndex < SCENARIO_INJECT_PARTS.length - 1) {
      handleSelectPartIndex(currentPartIndex + 1);
    }
  };

  // Toggle release of evidence packet
  const handleToggleReleaseEvidence = (packetId: string) => {
    setReleasedEvidenceIds((prev) => {
      const next = new Set(prev);
      if (next.has(packetId)) {
        next.delete(packetId);
      } else {
        next.add(packetId);
      }
      try {
        localStorage.setItem(STORAGE_KEY_EVIDENCE, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error('Failed to save evidence to storage:', e);
      }
      return next;
    });
    hostControlApi(sessionCode, 'release_evidence', { releaseEvidenceId: packetId }).catch(() => {});
  };

  // Export audit log JSON
  const handleExportAuditLog = () => {
    const auditData = {
      exerciseName: 'SyncSim 3D — Operation Silent Ledger',
      organization: 'Meridian Trust Financial',
      sessionCode,
      exportedAt: new Date().toISOString(),
      currentPartIndex,
      currentInjectId: currentInject.id,
      decisions: decisionsMap,
      releasedEvidenceIds: Array.from(releasedEvidenceIds),
      parameters,
    };
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operation-silent-ledger-audit-${sessionCode}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import audit log JSON
  const handleImportAuditLog = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.decisions) {
          setDecisionsMap(parsed.decisions);
          localStorage.setItem(STORAGE_KEY_DECISIONS, JSON.stringify(parsed.decisions));
        }
        if (parsed.releasedEvidenceIds) {
          setReleasedEvidenceIds(new Set(parsed.releasedEvidenceIds));
          localStorage.setItem(STORAGE_KEY_EVIDENCE, JSON.stringify(parsed.releasedEvidenceIds));
        }
        if (typeof parsed.currentPartIndex === 'number') {
          handleSelectPartIndex(parsed.currentPartIndex);
        }
        soundEngine.playResolution();
      } catch (err) {
        console.error('Failed to import JSON record:', err);
        alert('Invalid JSON audit log file.');
      }
    };
    reader.readAsText(file);
  };

  // Confirmed reset of exercise
  const handleResetExercise = () => {
    setDecisionsMap({});
    setReleasedEvidenceIds(new Set(['ev-1.1-vpn']));
    setCurrentPartIndex(0);
    setExerciseElapsedSeconds(0);
    setIsPaused(true);
    setIsDiscussionPause(true);
    try {
      localStorage.removeItem(STORAGE_KEY_DECISIONS);
      localStorage.removeItem(STORAGE_KEY_EVIDENCE);
      localStorage.removeItem(STORAGE_KEY_PART);
    } catch (e) {
      console.error(e);
    }
    soundEngine.playStart();
  };

  // Handle Play/Pause toggle
  const handleTogglePlayPause = () => {
    const next = !isPaused;
    setIsPaused(next);
    if (!next) {
      setIsDiscussionPause(false);
      soundEngine.playStart();
      hostControlApi(sessionCode, 'resume').catch(() => {});
    } else {
      soundEngine.playPause();
      voiceNarrator.stop();
      hostControlApi(sessionCode, 'pause').catch(() => {});
    }
  };

  // Contextual emotional tone
  const contextualTone: EmotionalTone = computeContextualTone(parameters, currentTelemetry);

  // Toggle Voice Narration
  const handleToggleVoice = () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    voiceNarrator.setEnabled(next);
    if (next) {
      voiceNarrator.speak(currentInject.presentationNarration, true, 'strategic');
    } else {
      voiceNarrator.stop();
    }
  };

  // Cinematic Director Walkthrough Auto-Advance
  useEffect(() => {
    if (!isCinematicMode) return;

    const currentStep = CINEMATIC_STEPS[cinematicStepIndex];
    if (sceneInstanceRef.current) {
      if (currentStep.focusLevel > 0) {
        sceneInstanceRef.current.selectLevel(currentStep.focusLevel);
      } else {
        sceneInstanceRef.current.setCameraPreset('overview');
      }
    }

    if (isVoiceEnabled) {
      voiceNarrator.speak(currentStep.narration, true, 'strategic');
    }

    const timer = setTimeout(() => {
      setCinematicStepIndex((prev) => (prev + 1) % CINEMATIC_STEPS.length);
    }, currentStep.durationMs);

    return () => clearTimeout(timer);
  }, [isCinematicMode, cinematicStepIndex, isVoiceEnabled]);

  // Fallback initial session if not loaded yet
  const activeSession: TabletopSessionState = sessionState || {
    code: sessionCode,
    createdAt: Date.now(),
    hostToken: 'host_default',
    status: 'lobby',
    currentPartIndex,
    roundDurationSeconds: 600,
    roundElapsedSeconds: 0,
    totalElapsedSeconds: exerciseElapsedSeconds,
    isClockRunning: !isPaused,
    roundDeadlineTimestamp: null,
    participants: {},
    claimedRoleTokens: {},
    releasedEvidenceIds: Array.from(releasedEvidenceIds),
    proposals: [],
    decisions: {},
    discussionLog: [],
  };

  const connectedPlayersCount = Object.keys(activeSession.participants).length;

  // Round time countdown
  const remainingSeconds = Math.max(0, activeSession.roundDurationSeconds - activeSession.roundElapsedSeconds);
  const roundMins = Math.floor(remainingSeconds / 60);
  const roundSecs = remainingSeconds % 60;

  // ======================== VIEW DISPATCH ========================

  // VIEW 0: Welcoming Landing / Entry Screen
  if (activeView === 'landing') {
    return (
      <WelcomeLandingScreen
        defaultSessionCode={sessionCode}
        onJoinAsParticipant={(code) => {
          setSessionCode(code);
          setActiveView('participant');
        }}
        onOpenProjector={(code) => {
          setSessionCode(code);
          setActiveView('projector');
        }}
        onOpenFacilitator={(passcode) => {
          const clean = passcode.trim().toLowerCase();
          if (clean === 'meridian-ciso' || clean === activeSession.hostToken.toLowerCase() || clean === 'ciso' || clean === 'admin') {
            try {
              sessionStorage.setItem('mtf_facilitator_auth', 'true');
            } catch {}
            setActiveView('host');
            return true;
          }
          return false;
        }}
      />
    );
  }

  // VIEW 1: Big Screen / Projector Companion View
  if (activeView === 'projector') {
    return (
      <ProjectorCompanionView
        session={activeSession}
        onExit={() => setActiveView('landing')}
      />
    );
  }

  // VIEW 2: Host Facilitator Console
  if (activeView === 'host') {
    return (
      <div className="w-screen h-screen overflow-hidden">
        <HostFacilitatorConsole
          session={activeSession}
          onRefreshSession={async () => {
            const res = await getSessionApi(sessionCode);
            setSessionState(res.session);
          }}
          onSwitchTo3D={() => setActiveView('shared_3d')}
        />
      </div>
    );
  }

  // VIEW 2: Mobile-First Participant Interface
  if (activeView === 'participant') {
    return (
      <div className="w-screen min-h-screen">
        <ParticipantInterface
          session={activeSession}
          participantToken={participantToken}
          onSessionUpdated={(updated) => setSessionState(updated)}
          onTokenChanged={(token) => setParticipantToken(token)}
          onSwitchTo3D={() => setActiveView('shared_3d')}
        />
      </div>
    );
  }

  // VIEW 3: Shared 3D Display (Projector / Main Command Center View)
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 3D WebGL Viewport Canvas */}
      <ViewportCanvas
        levels={MERIDIAN_ORG_LEVELS}
        parameters={parameters}
        isPlaying={!isPaused}
        playbackSpeed={1}
        simulationProgress={currentPartIndex / (SCENARIO_INJECT_PARTS.length - 1 || 1)}
        collaborators={collaborators}
        annotations={annotations}
        selectedDepartment={selectedDepartment}
        selectedLevelId={selectedLevelId}
        cameraPreset={cameraPreset}
        onSelectDepartment={(dept) => {
          setSelectedDepartment(dept);
          if (dept) {
            setSelectedLevelId(dept.levelId);
            setIsAnalyticsOpen(true);
          }
        }}
        onSelectLevel={(levelId) => {
          setSelectedLevelId(levelId);
          setSelectedDepartment(null);
        }}
        onSceneReady={(scene) => {
          sceneInstanceRef.current = scene;
          if (currentInject.primaryTierId) {
            scene.selectLevel(currentInject.primaryTierId);
          }
        }}
      />

      {/* Top Navigation Bar with View Switcher & QR Trigger */}
      <TopNavbar
        mode={appMode}
        onSetMode={(newMode) => {
          setAppMode(newMode);
          if (newMode === 'presentation') {
            setIsDiscussionPause(false);
            setIsPaused(false);
          } else {
            setIsPaused(true);
            setIsDiscussionPause(true);
          }
        }}
        isCinematicMode={isCinematicMode}
        onToggleCinematicMode={() => {
          const next = !isCinematicMode;
          setIsCinematicMode(next);
          if (next) setCinematicStepIndex(0);
        }}
        isFacilitatorView={isFacilitatorView}
        onToggleFacilitatorView={() => {
          setIsFacilitatorView(!isFacilitatorView);
          if (!isFacilitatorView) setIsFacilitatorOpen(true);
        }}
        isVoiceEnabled={isVoiceEnabled}
        onToggleVoice={handleToggleVoice}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        onOpenRecordingModal={() => setIsRecordingModalOpen(true)}
        onOpenTextAlternative={() => setIsTextAltOpen(true)}
        onOpenFlowGuide={() => setIsFlowGuideOpen(true)}
        exerciseElapsedSeconds={exerciseElapsedSeconds}
        currentInject={currentInject}
        currentPartIndex={currentPartIndex}
        onSelectPartIndex={handleSelectPartIndex}
        onResetView={() => {
          setSelectedDepartment(null);
          setSelectedLevelId(null);
          if (sceneInstanceRef.current) {
            sceneInstanceRef.current.setCameraPreset('overview');
          }
        }}
        activeView={activeView}
        onSelectView={setActiveView}
        sessionCode={activeSession.code}
        connectedCount={connectedPlayersCount}
        onOpenQRModal={() => setIsQRModalOpen(true)}
      />

      {/* Command Center Status Ribbon for Projector */}
      <div className="absolute top-16 left-3 right-3 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        {/* Active Inject Highlight & Affected Tier */}
        <div className="pointer-events-auto bg-slate-900/95 border border-slate-800 px-3 py-1.5 flex items-center space-x-3 shadow-xl">
          <div className="flex items-center space-x-1.5 font-mono text-xs">
            <span className="px-1.5 py-0.2 bg-blue-900/80 text-blue-300 font-bold border border-blue-700">
              INJECT {currentInject.id}
            </span>
            <span className="text-white font-semibold truncate max-w-xs sm:max-w-md">
              {currentInject.injectTitle}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400">Primary Impact:</span>
            <span className="text-amber-400 font-semibold">Tier {currentInject.primaryTierId}</span>
          </div>
        </div>

        {/* 3 Cooperating Teams Consensus Tracker */}
        <div className="pointer-events-auto bg-slate-900/95 border border-slate-800 px-3 py-1.5 flex items-center space-x-3 shadow-xl font-mono text-xs">
          {/* Round Clock */}
          <div className="flex items-center space-x-1 pr-2 border-r border-slate-800 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-bold">
              {String(roundMins).padStart(2, '0')}:{String(roundSecs).padStart(2, '0')}
            </span>
          </div>

          {/* Teams Badges */}
          <div className="flex items-center space-x-2 text-[11px]">
            <span
              className={`flex items-center space-x-1 px-1.5 py-0.5 border ${
                Object.values(activeSession.participants).some((p) => p.teamId === 'executive')
                  ? 'bg-purple-950 text-purple-300 border-purple-700'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <Crown className="w-3 h-3 text-purple-400" />
              <span>Exec</span>
            </span>

            <span
              className={`flex items-center space-x-1 px-1.5 py-0.5 border ${
                Object.values(activeSession.participants).some((p) => p.teamId === 'technical')
                  ? 'bg-blue-950 text-blue-300 border-blue-700'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <Shield className="w-3 h-3 text-blue-400" />
              <span>Tech</span>
            </span>

            <span
              className={`flex items-center space-x-1 px-1.5 py-0.5 border ${
                Object.values(activeSession.participants).some((p) => p.teamId === 'business')
                  ? 'bg-teal-950 text-teal-300 border-teal-700'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <Users className="w-3 h-3 text-teal-400" />
              <span>Biz</span>
            </span>
          </div>

          {/* QR Trigger Icon */}
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Scan Join QR Code"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Side Levels HUD (Meridian Trust 4 Tiers, Collapsible on Mobile/Tablet) */}
      {!isCinematicMode && (
        <SideLevelsHUD
          levels={MERIDIAN_ORG_LEVELS}
          selectedLevelId={selectedLevelId}
          selectedDepartment={selectedDepartment}
          onSelectLevel={focusCameraOnTier}
          onSelectDepartment={(dept) => {
            setSelectedDepartment(dept);
            setSelectedLevelId(dept.levelId);
            setIsAnalyticsOpen(true);
            if (sceneInstanceRef.current) {
              sceneInstanceRef.current.selectDepartment(dept);
            }
          }}
          activeLevelId={currentInject.primaryTierId}
          currentTone={contextualTone}
        />
      )}

      {/* Unified Tabletop Stepper & Controller Dock */}
      {!isCinematicMode && (
        <ExerciseController
          currentInject={currentInject}
          currentPartIndex={currentPartIndex}
          totalParts={SCENARIO_INJECT_PARTS.length}
          mode={appMode}
          isPaused={isPaused}
          isDiscussionPause={isDiscussionPause}
          onTogglePlayPause={handleTogglePlayPause}
          onPrevPart={handlePrevPart}
          onNextPart={handleNextPart}
          onSelectPartIndex={handleSelectPartIndex}
          onOpenAIAgents={() => setIsAIAgentsOpen(!isAIAgentsOpen)}
          onOpenDecisions={() => setIsDecisionsOpen(!isDecisionsOpen)}
          onOpenFacilitator={() => setIsFacilitatorOpen(!isFacilitatorOpen)}
          onOpenFlowGuide={() => setIsFlowGuideOpen(true)}
          isFacilitatorView={isFacilitatorView}
          releasedEvidenceCount={releasedEvidenceIds.size}
          totalDecisionsCount={Object.keys(decisionsMap).length}
          hasDecisionForCurrentInject={!!decisionsMap[currentInject.id]}
        />
      )}

      {/* Modals & Drawers */}
      <QRJoinModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        session={activeSession}
        onSwitchToParticipantView={() => {
          setIsQRModalOpen(false);
          setActiveView('participant');
        }}
      />

      <AIAgentsPanel
        isOpen={isAIAgentsOpen}
        onClose={() => setIsAIAgentsOpen(false)}
        agentsDialogue={currentInject.agentsOutput}
        isFacilitatorView={isFacilitatorView}
        isVoiceEnabled={isVoiceEnabled}
      />

      <DecisionDrawer
        isOpen={isDecisionsOpen}
        onClose={() => setIsDecisionsOpen(false)}
        currentInject={currentInject}
        decisionsMap={decisionsMap}
        onSaveDecision={(record: DecisionRecord) => {
          setDecisionsMap((prev) => ({ ...prev, [record.injectPartId]: record }));
        }}
        onExportAuditLog={handleExportAuditLog}
        onImportAuditLog={handleImportAuditLog}
        onResetExercise={handleResetExercise}
        allInjectParts={SCENARIO_INJECT_PARTS}
        onSelectInjectPart={handleSelectPartIndex}
      />

      <FacilitatorDrawer
        isOpen={isFacilitatorOpen}
        onClose={() => setIsFacilitatorOpen(false)}
        currentInject={currentInject}
        releasedEvidenceIds={releasedEvidenceIds}
        onToggleReleaseEvidence={handleToggleReleaseEvidence}
        onSelectInjectPart={handleSelectPartIndex}
        allInjectParts={SCENARIO_INJECT_PARTS}
      />

      <AnalyticsInspector
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        selectedDepartment={selectedDepartment}
        selectedLevel={MERIDIAN_ORG_LEVELS.find((l) => l.id === selectedLevelId) || null}
        telemetryHistory={telemetryHistory}
        currentTelemetry={currentTelemetry}
        parameters={parameters}
        onSelectLevel={focusCameraOnTier}
      />

      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        isVoiceEnabled={isVoiceEnabled}
        onToggleVoice={handleToggleVoice}
        currentTone={contextualTone}
      />

      <RecordingWorkflowModal
        isOpen={isRecordingModalOpen}
        onClose={() => setIsRecordingModalOpen(false)}
        onExportAuditLog={handleExportAuditLog}
      />

      <TextAlternativeView
        isOpen={isTextAltOpen}
        onClose={() => setIsTextAltOpen(false)}
        currentInject={currentInject}
        levels={MERIDIAN_ORG_LEVELS}
        tiers={EXERCISE_TIERS}
        releasedEvidenceIds={releasedEvidenceIds}
      />

      <ExerciseFlowGuideModal
        isOpen={isFlowGuideOpen}
        onClose={() => setIsFlowGuideOpen(false)}
        onStartExercise={() => {
          setIsFlowGuideOpen(false);
          if (isPaused) handleTogglePlayPause();
        }}
      />
    </div>
  );
}
