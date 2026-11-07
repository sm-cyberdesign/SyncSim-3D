/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Play,
  Pause,
  Clock,
  AlertTriangle,
  Users,
  Shield,
  Crown,
  FileText,
  CheckCircle,
  XCircle,
  RotateCcw,
  Plus,
  Share2,
  Copy,
  ChevronRight,
  ChevronLeft,
  Eye,
  Sliders,
  Award,
  Download,
  AlertOctagon,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  TabletopSessionState,
  EXERCISE_TEAMS,
  ACHIEVEMENTS,
  EvaluatorScore,
  TeamId,
} from '../types/multiplayer';
import { SCENARIO_INJECT_PARTS, MERIDIAN_ORG_LEVELS } from '../data/silentLedgerScenario';
import {
  hostControlApi,
  evaluateSessionApi,
  getJoinUrl,
} from '../utils/multiplayerClient';

interface HostFacilitatorConsoleProps {
  session: TabletopSessionState;
  onRefreshSession: () => void;
  onSwitchTo3D: () => void;
}

export function HostFacilitatorConsole({
  session,
  onRefreshSession,
  onSwitchTo3D,
}: HostFacilitatorConsoleProps) {
  // Host Passcode Protection
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('mtf_facilitator_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'control' | 'roster' | 'evidence' | 'intel' | 'evaluator'>('control');
  const [copiedLink, setCopiedLink] = useState(false);
  const [haltReasonInput, setHaltReasonInput] = useState('FACILITATOR INITIATED REAL-WORLD INCIDENT STOP. THIS IS AN EXERCISE STOP.');
  const [isHaltConfirmOpen, setIsHaltConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Evaluator state
  const [evalScores, setEvalScores] = useState<EvaluatorScore>(
    session.evaluation || {
      operationalContinuity: 20,
      regulatoryCompliance: 22,
      customerTrust: 19,
      financialPrudence: 21,
      evaluatorNotes: 'Strong initial containment stance; monitored communication channels closely.',
      awardedBadges: ['ach_evidence_first', 'ach_containment_speed'],
    }
  );

  const currentPart = SCENARIO_INJECT_PARTS[session.currentPartIndex] || SCENARIO_INJECT_PARTS[0];
  const joinUrl = getJoinUrl(session.code);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleControl = async (action: string, params: Record<string, any> = {}) => {
    setIsLoading(true);
    try {
      await hostControlApi(session.code, action, params);
      onRefreshSession();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEvaluation = async () => {
    setIsLoading(true);
    try {
      await evaluateSessionApi(session.code, evalScores);
      onRefreshSession();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBadge = (badgeId: string) => {
    setEvalScores((prev) => {
      const exists = prev.awardedBadges.includes(badgeId);
      return {
        ...prev,
        awardedBadges: exists
          ? prev.awardedBadges.filter((b) => b !== badgeId)
          : [...prev.awardedBadges, badgeId],
      };
    });
  };

  // Export After-Action Report (AAR)
  const handleExportAAR = () => {
    const aarData = {
      exerciseName: 'SyncSim 3D — Operation Silent Ledger',
      institution: 'Meridian Trust Financial',
      sessionCode: session.code,
      timestamp: new Date().toISOString(),
      totalDurationSeconds: session.totalElapsedSeconds,
      status: session.status,
      participants: Object.values(session.participants).map((p) => ({
        name: p.displayName,
        role: p.roleId,
        team: p.teamId,
      })),
      decisions: session.decisions,
      proposals: session.proposals,
      evaluation: session.evaluation,
    };

    const blob = new Blob([JSON.stringify(aarData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AAR_Report_Silent_Ledger_${session.code}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Remaining round time
  const remainingSeconds = Math.max(0, session.roundDurationSeconds - session.roundElapsedSeconds);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  // Passcode verification gate
  if (!isAuthenticated) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const code = passcodeInput.trim().toLowerCase();
      if (code === 'meridian-ciso' || code === session.hostToken.toLowerCase() || code === 'ciso' || code === 'admin') {
        setIsAuthenticated(true);
        try {
          sessionStorage.setItem('mtf_facilitator_auth', 'true');
        } catch {}
      } else {
        setAuthError('Invalid facilitator passcode. Default is meridian-ciso.');
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4 select-none">
        <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
          <div className="flex items-center space-x-2.5 text-amber-400">
            <Lock className="w-5 h-5" />
            <h2 className="font-bold text-base text-white">Facilitator Passcode Gate</h2>
          </div>
          <p className="text-xs text-slate-400">
            This console is reserved for the tabletop exercise director and evaluators.
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                EXERCISE DIRECTOR PASSCODE
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="e.g. meridian-ciso"
                autoFocus
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-amber-400 min-h-[44px]"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Default: <code className="text-slate-400">meridian-ciso</code>
              </p>
            </div>

            {authError && (
              <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {authError}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onSwitchTo3D}
                className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer py-2"
              >
                ← Return to 3D View
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs min-h-[44px] cursor-pointer"
              >
                Unlock Console
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans border border-slate-800">
      {/* Top Facilitator Header */}
      <header className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-mono font-semibold">
                Facilitator Control Console
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 font-mono border border-slate-700">
                Code: {session.code}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 uppercase font-mono font-semibold ${
                  session.status === 'emergency_halt'
                    ? 'bg-red-900/60 text-red-200 border border-red-700 animate-pulse'
                    : session.status === 'active'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {session.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-sm font-semibold text-white">
              Meridian Trust Financial — Operation Silent Ledger Tabletop
            </h1>
          </div>
        </div>

        {/* Global Controls & Mode Switcher */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onSwitchTo3D}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium border border-blue-400 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Shared 3D Display</span>
          </button>

          <button
            onClick={() => setIsHaltConfirmOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-700 text-xs font-mono font-semibold cursor-pointer transition-colors"
            title="Facilitator Real-World Incident Stop"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>EMERGENCY HALT</span>
          </button>
        </div>
      </header>

      {/* Emergency Halt Banner if active */}
      {session.status === 'emergency_halt' && (
        <div className="bg-red-950/80 border-b-2 border-red-600 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-red-200 text-xs font-mono">
            <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="font-bold">EXERCISE STOP ACTIVE:</span>
            <span>{session.haltReason || 'Real-world incident or facilitator pause'}</span>
          </div>
          <button
            onClick={() => handleControl('resume')}
            className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white text-xs font-mono border border-red-500 cursor-pointer"
          >
            Resume Exercise
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="px-4 bg-slate-900/60 border-b border-slate-800 flex items-center space-x-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('control')}
          className={`px-3 py-2 border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === 'control'
              ? 'border-amber-400 text-amber-300 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Exercise Timeline & Controls
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3 py-2 border-b-2 font-medium cursor-pointer transition-colors flex items-center space-x-1.5 ${
            activeTab === 'roster'
              ? 'border-amber-400 text-amber-300 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Team Roster & Roles</span>
          <span className="px-1.5 py-0.2 bg-slate-800 text-[10px] font-mono border border-slate-700">
            {Object.keys(session.participants).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-3 py-2 border-b-2 font-medium cursor-pointer transition-colors flex items-center space-x-1.5 ${
            activeTab === 'evidence'
              ? 'border-amber-400 text-amber-300 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Evidence Manager</span>
          <span className="px-1.5 py-0.2 bg-slate-800 text-[10px] font-mono border border-slate-700">
            {session.releasedEvidenceIds.length} released
          </span>
        </button>
        <button
          onClick={() => setActiveTab('intel')}
          className={`px-3 py-2 border-b-2 font-medium cursor-pointer transition-colors flex items-center space-x-1.5 ${
            activeTab === 'intel'
              ? 'border-amber-400 text-amber-300 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Adversary Intel (Raven / Traps)</span>
        </button>
        <button
          onClick={() => setActiveTab('evaluator')}
          className={`px-3 py-2 border-b-2 font-medium cursor-pointer transition-colors flex items-center space-x-1.5 ${
            activeTab === 'evaluator'
              ? 'border-amber-400 text-amber-300 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Evaluator Rubric & AAR</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* TAB: CONTROL */}
        {activeTab === 'control' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Active Inject & Timeline Actions */}
            <div className="lg:col-span-2 space-y-5">
              {/* Active Part Header Card */}
              <div className="p-4 bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-blue-900/60 text-blue-300 font-mono text-xs font-semibold border border-blue-700">
                      Inject {currentPart.id} ({session.currentPartIndex + 1}/15)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Module {currentPart.moduleNumber}: {currentPart.moduleTitle}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 border border-amber-800">
                    Sim: {currentPart.simulatedDateTime}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white">{currentPart.injectTitle}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{currentPart.overview}</p>

                {/* Operational Impact Notice */}
                <div className="p-2.5 bg-slate-950 border-l-2 border-amber-500 text-xs text-slate-300">
                  <strong className="text-amber-400 font-mono uppercase mr-1.5">Impact:</strong>
                  {currentPart.operationalImpact}
                </div>

                {/* Submissions Status for this Part */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Official Decision Status:</span>
                  {session.decisions[currentPart.id] ? (
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-mono">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Committed by {session.decisions[currentPart.id].submittedByName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-amber-400 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Pending Table Consensus</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Facilitator Round Controls */}
              <div className="p-4 bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Round Pacing & Inject Progression
                </h3>

                {/* Timer Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950 border border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Round Clock</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-mono font-bold text-amber-400">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / {Math.round(session.roundDurationSeconds / 60)}m
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Exercise Total</span>
                    <span className="text-2xl font-mono font-bold text-slate-200">
                      {Math.floor(session.totalElapsedSeconds / 60)}m {session.totalElapsedSeconds % 60}s
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {session.isClockRunning ? (
                      <button
                        onClick={() => handleControl('pause')}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center space-x-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold border border-amber-400 cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleControl('resume')}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center space-x-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold border border-emerald-400 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleControl('extend_round', { extendSeconds: 120 })}
                      disabled={isLoading}
                      className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 cursor-pointer"
                      title="Add 2 Minutes"
                    >
                      +2m
                    </button>
                  </div>
                </div>

                {/* Inject Navigation Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleControl('set_part', { currentPartIndex: Math.max(0, session.currentPartIndex - 1) })}
                    disabled={session.currentPartIndex === 0 || isLoading}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs border border-slate-700 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Inject</span>
                  </button>

                  <div className="text-xs font-mono text-slate-400">
                    Step {session.currentPartIndex + 1} of 15
                  </div>

                  <button
                    onClick={() => handleControl('set_part', { currentPartIndex: Math.min(14, session.currentPartIndex + 1) })}
                    disabled={session.currentPartIndex === 14 || isLoading}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs border border-blue-400 cursor-pointer"
                  >
                    <span>Next Inject</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Proposals Feed from Players */}
              <div className="p-4 bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Participant Proposals ({session.proposals.length})
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Updated via SSE Stream</span>
                </div>

                {session.proposals.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3 text-center">
                    No proposals submitted yet. Participants are reviewing evidence and discussing.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {session.proposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="p-2.5 bg-slate-950 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">
                            {prop.participantName}{' '}
                            <span className="text-slate-500 font-normal">({prop.roleId})</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Inject {prop.partId} • {prop.upvotes.length} votes
                          </span>
                        </div>
                        <p className="text-slate-300">{prop.customActionText}</p>
                        {prop.rationale && (
                          <p className="text-[11px] text-slate-400 italic">Rationale: {prop.rationale}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Join QR Code & Live Session Summary */}
            <div className="space-y-5">
              {/* QR Code Join Box */}
              <div className="p-4 bg-slate-900 border border-slate-800 space-y-3 text-center">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Participant Join QR Code
                </span>
                <p className="text-xs text-slate-400">
                  Participants scan with mobile camera to join the tabletop exercise.
                </p>

                <div className="p-3 bg-white inline-block border border-slate-700 shadow-lg mx-auto">
                  <QRCodeSVG value={joinUrl} size={150} level="M" />
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-slate-300">
                    Session Short Code:{' '}
                    <span className="font-bold text-amber-400 bg-slate-950 px-2 py-0.5 border border-slate-800">
                      {session.code}
                    </span>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Join Link</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono break-all px-2">
                    {joinUrl}
                  </p>
                </div>
              </div>

              {/* Discussion Log Stream */}
              <div className="p-4 bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Master Chronolog Feed
                </h3>
                <div className="h-48 overflow-y-auto space-y-1.5 text-xs pr-1 font-mono">
                  {session.discussionLog.map((log) => (
                    <div
                      key={log.id}
                      className={`p-1.5 border-l-2 text-[11px] ${
                        log.isSystemNotice
                          ? 'border-amber-500 bg-amber-950/20 text-amber-200'
                          : 'border-slate-700 bg-slate-950 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{log.participantName}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-slate-200">{log.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ROSTER */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono">
                  Cooperating Human Teams & Roles
                </h2>
                <p className="text-xs text-slate-400">
                  Meridian Trust Financial organizational crisis roles. Participants select an available role. Simulated AI characters (Raven, Sentinel, Compass) are strictly non-selectable.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 border border-emerald-800">
                {Object.keys(session.claimedRoleTokens).length} / 12 Roles Claimed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(EXERCISE_TEAMS).map((team) => (
                <div
                  key={team.id}
                  className="bg-slate-900 border border-slate-800 flex flex-col overflow-hidden"
                  style={{ borderTopColor: team.color, borderTopWidth: '3px' }}
                >
                  <div className="p-3 bg-slate-900/90 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      {team.id === 'executive' && <Crown className="w-4 h-4 text-purple-400" />}
                      {team.id === 'technical' && <Shield className="w-4 h-4 text-blue-400" />}
                      {team.id === 'business' && <Users className="w-4 h-4 text-teal-400" />}
                      <h3 className="text-xs font-bold text-white uppercase">{team.name}</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{team.subtitle}</p>
                  </div>

                  <div className="p-3 space-y-3 flex-1">
                    {team.roles.map((role) => {
                      const claimantToken = session.claimedRoleTokens[role.id];
                      const claimant = claimantToken ? session.participants[claimantToken] : null;

                      return (
                        <div
                          key={role.id}
                          className={`p-2.5 border text-xs space-y-1.5 transition-colors ${
                            claimant
                              ? 'bg-slate-950 border-emerald-800/80'
                              : 'bg-slate-950/50 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{role.title}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 border border-slate-700">
                              {role.callsign}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400">
                            <span className="text-amber-400/90 font-mono">Authority:</span>{' '}
                            {role.decisionAuthority}
                          </div>

                          <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
                            {claimant ? (
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    claimant.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                                  }`}
                                />
                                <span className="font-mono text-emerald-300 font-semibold">
                                  {claimant.displayName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 font-mono italic">
                                Available Slot
                              </span>
                            )}

                            {claimant && (
                              <button
                                onClick={() =>
                                  handleControl('reassign_role', {
                                    targetRoleId: role.id,
                                    newParticipantToken: '',
                                  })
                                }
                                className="text-[10px] text-red-400 hover:text-red-300 font-mono cursor-pointer"
                              >
                                Release
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono">
                  Evidence Packet Release Controller
                </h2>
                <p className="text-xs text-slate-400">
                  Unseal forensic artifacts, NetFlow logs, and intelligence reports for tabletop players.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCENARIO_INJECT_PARTS.flatMap((p) => p.evidencePackets).map((ev) => {
                const isReleased = session.releasedEvidenceIds.includes(ev.id);

                return (
                  <div
                    key={ev.id}
                    className={`p-3.5 border text-xs space-y-2 transition-all ${
                      isReleased
                        ? 'bg-slate-900 border-emerald-700/80'
                        : 'bg-slate-950/80 border-slate-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-200">{ev.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 border border-slate-700">
                          {ev.classification}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Inject {ev.injectPartId}</span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">{ev.summary}</p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        Category: {ev.category}
                      </span>
                      {isReleased ? (
                        <div className="flex items-center space-x-1 text-emerald-400 font-mono text-[11px]">
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unsealed to Players</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleControl('release_evidence', { releaseEvidenceId: ev.id })}
                          disabled={isLoading}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-mono text-[11px] cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unseal Packet</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: INTEL */}
        {activeTab === 'intel' && (
          <div className="space-y-4">
            <div className="p-3 bg-red-950/40 border border-red-800 text-xs space-y-1">
              <div className="flex items-center space-x-2 text-red-400 font-mono font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>CONFIDENTIAL FACILITATOR INTELLIGENCE — NOT FOR PLAYERS</span>
              </div>
              <p className="text-slate-300">
                Adversary tactics (Glass Heron & Raven AI), deliberate cognitive traps, probing questions, and regulatory compliance tripwires for Inject {currentPart.id}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Adversary Strategy */}
              <div className="p-4 bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-mono text-amber-400 font-semibold uppercase">
                  Raven / Glass Heron Maneuvers
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {currentPart.facilitatorGuidance.adversaryStrategy}
                </p>
              </div>

              {/* Deliberate Traps */}
              <div className="p-4 bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-mono text-red-400 font-semibold uppercase">
                  Deliberate Table Traps
                </h4>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {currentPart.facilitatorGuidance.deliberateTraps.map((trap, i) => (
                    <li key={i}>{trap}</li>
                  ))}
                </ul>
              </div>

              {/* Probing Facilitator Questions */}
              <div className="p-4 bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-mono text-blue-400 font-semibold uppercase">
                  Probing Questions for Discussion
                </h4>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {currentPart.facilitatorGuidance.probingQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              {/* Regulatory Considerations */}
              <div className="p-4 bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-mono text-purple-400 font-semibold uppercase">
                  Regulatory & Legal Tripwires
                </h4>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {currentPart.facilitatorGuidance.regulatoryConsiderations.map((reg, i) => (
                    <li key={i}>{reg}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB: EVALUATOR & AAR */}
        {activeTab === 'evaluator' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono">
                  Evaluator Rubric & After-Action Review (AAR)
                </h2>
                <p className="text-xs text-slate-400">
                  Assess team performance across four operational dimensions and award scenario achievements.
                </p>
              </div>
              <button
                onClick={handleExportAAR}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export AAR Report (JSON)</span>
              </button>
            </div>

            {/* Rubric Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-blue-400 font-semibold">Operational Continuity</span>
                  <span className="text-white font-bold">{evalScores.operationalContinuity}/25</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={evalScores.operationalContinuity}
                  onChange={(e) =>
                    setEvalScores({ ...evalScores, operationalContinuity: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Containment vs payment pipe availability balance.</p>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-400 font-semibold">Regulatory Compliance</span>
                  <span className="text-white font-bold">{evalScores.regulatoryCompliance}/25</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={evalScores.regulatoryCompliance}
                  onChange={(e) =>
                    setEvalScores({ ...evalScores, regulatoryCompliance: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">72-hr NYDFS 500, SEC 8-K, and evidence chain.</p>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-teal-400 font-semibold">Customer Trust</span>
                  <span className="text-white font-bold">{evalScores.customerTrust}/25</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={evalScores.customerTrust}
                  onChange={(e) =>
                    setEvalScores({ ...evalScores, customerTrust: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Branch teller liquidity caps and truthful PR scripts.</p>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-semibold">Financial Prudence</span>
                  <span className="text-white font-bold">{evalScores.financialPrudence}/25</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={evalScores.financialPrudence}
                  onChange={(e) =>
                    setEvalScores({ ...evalScores, financialPrudence: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Overdraft protection, Fed window timing, OFAC adherence.</p>
              </div>
            </div>

            {/* Evaluator Notes & Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase">
                  Evaluator Observations & Recommendations
                </h4>
                <textarea
                  rows={4}
                  value={evalScores.evaluatorNotes}
                  onChange={(e) => setEvalScores({ ...evalScores, evaluatorNotes: e.target.value })}
                  placeholder="Record table dynamics, delayed decisions, or commendable team communication..."
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-slate-200 font-sans focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleSaveEvaluation}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium cursor-pointer"
                >
                  Save Rubric Scores
                </button>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase">
                  Award Table Achievements
                </h4>
                <div className="space-y-2">
                  {ACHIEVEMENTS.map((ach) => {
                    const isAwarded = evalScores.awardedBadges.includes(ach.id);
                    return (
                      <div
                        key={ach.id}
                        onClick={() => toggleBadge(ach.id)}
                        className={`p-2 border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isAwarded
                            ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{ach.title}</div>
                          <div className="text-[10px] text-slate-400">{ach.description}</div>
                        </div>
                        <Award
                          className={`w-4 h-4 ml-2 flex-shrink-0 ${
                            isAwarded ? 'text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Halt Confirmation Modal */}
      {isHaltConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-600 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center space-x-2 text-red-400 font-mono font-bold text-sm">
              <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />
              <span>CONFIRM EMERGENCY EXERCISE HALT</span>
            </div>
            <p className="text-xs text-slate-300">
              This initiates an immediate tabletop stop across all player devices. Use only if a real-world cybersecurity or banking incident occurs, or if catastrophic facilitator disruption arises.
            </p>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-mono">Halt Notice Text:</label>
              <input
                type="text"
                value={haltReasonInput}
                onChange={(e) => setHaltReasonInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-red-200 font-mono"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsHaltConfirmOpen(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs border border-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsHaltConfirmOpen(false);
                  handleControl('emergency_halt', { haltReason: haltReasonInput });
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold cursor-pointer"
              >
                EXECUTE EXERCISE STOP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
