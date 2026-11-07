/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Crown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  Send,
  Lock,
  ChevronRight,
  Info,
  LogOut,
  Sparkles,
  Layers,
  ArrowRight,
  Check,
  X,
  FileCheck,
  Building2,
  RefreshCw,
  Compass,
  Eye,
  Radio,
} from 'lucide-react';
import {
  TabletopSessionState,
  EXERCISE_TEAMS,
  TeamId,
  HumanRoleDefinition,
} from '../types/multiplayer';
import { SCENARIO_INJECT_PARTS, MERIDIAN_ORG_LEVELS } from '../data/silentLedgerScenario';
import {
  joinSessionRoleApi,
  leaveSessionRoleApi,
  proposeActionApi,
  upvoteProposalApi,
  submitTeamDecisionApi,
  crossTeamApproveApi,
  pingSessionApi,
} from '../utils/multiplayerClient';
import { ViewportCanvas } from './ViewportCanvas';
import { INITIAL_PARAMETERS, INITIAL_COLLABORATORS, INITIAL_ANNOTATIONS } from '../data/simulationData';

interface ParticipantInterfaceProps {
  session: TabletopSessionState;
  participantToken: string | null;
  onSessionUpdated: (session: TabletopSessionState) => void;
  onTokenChanged: (token: string | null) => void;
  onSwitchTo3D: () => void;
}

export function ParticipantInterface({
  session,
  participantToken,
  onSessionUpdated,
  onTokenChanged,
  onSwitchTo3D,
}: ParticipantInterfaceProps) {
  // Onboarding step tracking: 1: name, 2: team, 3: role, 4: summary & ready
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [displayName, setDisplayName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId>('executive');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In-game 4 primary navigation tabs
  const [activeTab, setActiveTab] = useState<'now' | 'team' | 'evidence' | 'my_role'>('now');

  // Interactive decision card state
  const [customProposalOpen, setCustomProposalOpen] = useState(false);
  const [customActionText, setCustomActionText] = useState('');
  const [proposalRationale, setProposalRationale] = useState('');

  // 3D modal viewer state for mobile
  const [show3DModal, setShow3DModal] = useState(false);

  // Expanded evidence card
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);

  const currentParticipant = participantToken ? session.participants?.[participantToken] : null;
  const currentPart = SCENARIO_INJECT_PARTS[session.currentPartIndex] || SCENARIO_INJECT_PARTS[0];

  // Derive current role definition
  let currentRoleDef: HumanRoleDefinition | null = null;
  if (currentParticipant) {
    const team = EXERCISE_TEAMS[currentParticipant.teamId];
    currentRoleDef = team?.roles.find((r) => r.id === currentParticipant.roleId) || null;
  }

  // Periodic keepalive ping
  useEffect(() => {
    if (!participantToken) return;
    const interval = setInterval(() => {
      pingSessionApi(session.code, participantToken);
    }, 15000);
    return () => clearInterval(interval);
  }, [participantToken, session.code]);

  // Sync readiness with current participant state
  useEffect(() => {
    if (currentParticipant && !isReady) {
      // Reconnected user who already has a claimed role
      setIsReady(true);
    }
  }, [currentParticipant, isReady]);

  // Round countdown
  const remainingSeconds = Math.max(0, session.roundDurationSeconds - session.roundElapsedSeconds);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isUrgent = remainingSeconds < 120 && session.isClockRunning;

  // Handle claiming role (Step 3 -> Step 4 -> Complete)
  const handleClaimRole = async (roleId: string) => {
    if (!displayName.trim()) {
      setOnboardingStep(1);
      setJoinError('Please enter your name first.');
      return;
    }
    setJoinError(null);
    setIsSubmitting(true);
    try {
      const res = await joinSessionRoleApi(session.code, displayName.trim(), roleId, participantToken || undefined);
      onTokenChanged(res.token);
      onSessionUpdated(res.session);
      setSelectedRoleId(roleId);
      setOnboardingStep(4); // Move to summary card
    } catch (err: any) {
      setJoinError(err.message || 'That role was just claimed. Please choose another.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle leaving
  const handleLeaveRole = async () => {
    if (!participantToken) return;
    try {
      await leaveSessionRoleApi(session.code, participantToken);
    } catch (e) {
      console.error(e);
    }
    onTokenChanged(null);
    setIsReady(false);
    setOnboardingStep(2);
  };

  // Handle proposing an option
  const handleProposeOption = async (optionId: string, label: string) => {
    if (!participantToken) return;
    setIsSubmitting(true);
    try {
      const res = await proposeActionApi(session.code, participantToken, {
        partId: currentPart.id,
        optionId,
        customActionText: label,
        rationale: 'Proposed via action card deliberation.',
        citedEvidenceIds: [],
      });
      onSessionUpdated(res.session);
    } catch (err: any) {
      alert(err.message || 'Failed to submit proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle upvoting
  const handleUpvote = async (proposalId: string) => {
    if (!participantToken) return;
    try {
      await upvoteProposalApi(session.code, participantToken, proposalId);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle submitting official decision
  const handleSubmitDecision = async (optionId: string, label: string, summary: string) => {
    if (!participantToken || !currentRoleDef) return;
    setIsSubmitting(true);
    try {
      const res = await submitTeamDecisionApi(session.code, participantToken, {
        partId: currentPart.id,
        optionId,
        actionSummary: `${label}: ${summary}`,
        rationale: `Authorized submission by ${currentRoleDef.title} (${currentParticipant?.displayName})`,
        tierImpactNotes: `Targeting Primary Impact Tier ${currentPart.primaryTierId}`,
      });
      onSessionUpdated(res.session);
    } catch (err: any) {
      alert(err.message || 'Failed to submit official decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle custom action proposal
  const handleCustomProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantToken || !customActionText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await proposeActionApi(session.code, participantToken, {
        partId: currentPart.id,
        customActionText: customActionText.trim(),
        rationale: proposalRationale.trim() || 'Alternative tactical proposal.',
        citedEvidenceIds: [],
      });
      onSessionUpdated(res.session);
      setCustomActionText('');
      setProposalRationale('');
      setCustomProposalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to submit alternative proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cross team approval
  const handleApprovalAction = async (status: 'approved' | 'rejected') => {
    if (!participantToken || !currentRoleDef) return;
    try {
      const res = await crossTeamApproveApi(session.code, participantToken, {
        partId: currentPart.id,
        roleId: currentRoleDef.id,
        status,
        comments: `Action ${status} by ${currentRoleDef.title}`,
      });
      onSessionUpdated(res.session);
    } catch (err: any) {
      alert(err.message || 'Failed to process approval.');
    }
  };

  // Decision options for current inject
  const options = currentPart.decisionPrompt?.options || [];
  const currentDecision = session.decisions?.[currentPart.id];

  // Proposals for current inject
  const currentProposals = (session.proposals || []).filter((p) => p.partId === currentPart.id);

  // Released evidence for current inject or all released
  const releasedPackets = (currentPart.evidencePackets || []).filter((ev) =>
    (session.releasedEvidenceIds || []).includes(ev.id)
  );

  // Check if current participant has submission authority
  const hasSubmissionAuthority =
    currentRoleDef?.decisionAuthority === 'Primary Decision Maker' ||
    currentRoleDef?.id === 'role_incident_commander';

  // =========================================================================
  // ONBOARDING FLOW (If not claimed role or not completed Step 4)
  // =========================================================================
  if (!currentParticipant || !isReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
        {/* Onboarding Header */}
        <header className="border-b border-slate-800 bg-slate-900/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Meridian Trust Financial
              </div>
              <div className="text-xs text-white font-medium">Participant Onboarding</div>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">
            {session.code}
          </div>
        </header>

        {/* Onboarding Container */}
        <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col justify-center">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-1.5 text-xs font-mono">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                onboardingStep === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                1
              </span>
              <span className={onboardingStep === 1 ? 'text-white font-semibold' : 'text-slate-500'}>
                Name
              </span>
              <span className="text-slate-700">/</span>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                onboardingStep === 2 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                2
              </span>
              <span className={onboardingStep === 2 ? 'text-white font-semibold' : 'text-slate-500'}>
                Team
              </span>
              <span className="text-slate-700">/</span>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                onboardingStep === 3 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                3
              </span>
              <span className={onboardingStep === 3 ? 'text-white font-semibold' : 'text-slate-500'}>
                Role
              </span>
              <span className="text-slate-700">/</span>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                onboardingStep === 4 ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                4
              </span>
              <span className={onboardingStep === 4 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                Ready
              </span>
            </div>
          </div>

          {/* STEP 1: DISPLAY NAME */}
          {onboardingStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Welcome to Operation Silent Ledger
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Enter your name or callsign to appear in team communications and decision logs.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Your Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-base focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 min-h-[48px]"
                />
              </div>

              {joinError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {joinError}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!displayName.trim()) {
                    setJoinError('Please enter a display name to continue.');
                    return;
                  }
                  setJoinError(null);
                  setOnboardingStep(2);
                }}
                className="w-full min-h-[48px] px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-base flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Continue to Team Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: TEAM SELECTION */}
          {onboardingStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Choose Your Team</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Three teams cooperate to defend Meridian Trust Financial. Select your focus area:
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Executive Crisis Team Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeamId('executive');
                    setOnboardingStep(3);
                  }}
                  className="w-full text-left p-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border-2 border-purple-800 hover:border-purple-500 transition-all cursor-pointer min-h-[64px]"
                >
                  <div className="flex items-center space-x-3 mb-1.5">
                    <div className="p-2 rounded-lg bg-purple-900/80 text-purple-300 border border-purple-700">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-white">Executive Crisis Team</div>
                      <div className="text-xs font-mono text-purple-300">Governance & Disclosure</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 pl-11">
                    Governance, public statements, regulatory notifications (SEC/NYDFS), board escalation, and enterprise liquidity.
                  </p>
                </button>

                {/* Technical Response Team Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeamId('technical');
                    setOnboardingStep(3);
                  }}
                  className="w-full text-left p-4 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border-2 border-blue-800 hover:border-blue-500 transition-all cursor-pointer min-h-[64px]"
                >
                  <div className="flex items-center space-x-3 mb-1.5">
                    <div className="p-2 rounded-lg bg-blue-900/80 text-blue-300 border border-blue-700">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-white">Technical Response Team</div>
                      <div className="text-xs font-mono text-blue-300">SOC & Infrastructure</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 pl-11">
                    Containment, forensics, isolation, threat eradication, Sentinel AI alert triage, and system restoration.
                  </p>
                </button>

                {/* Business & Communications Team Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeamId('business');
                    setOnboardingStep(3);
                  }}
                  className="w-full text-left p-4 rounded-xl bg-teal-950/40 hover:bg-teal-900/50 border-2 border-teal-800 hover:border-teal-500 transition-all cursor-pointer min-h-[64px]"
                >
                  <div className="flex items-center space-x-3 mb-1.5">
                    <div className="p-2 rounded-lg bg-teal-900/80 text-teal-300 border border-teal-700">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-white">Business & Communications Team</div>
                      <div className="text-xs font-mono text-teal-300">Payments & PR</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 pl-11">
                    Branch operations, treasury wire clearing, customer communications, truth-sheet scripts, and payment networks.
                  </p>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(1)}
                  className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Back to name entry
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ROLE SELECTION */}
          {onboardingStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Select Your Role
                  </h2>
                  <p className="text-xs text-slate-400">
                    Roles in {EXERCISE_TEAMS[selectedTeamId].name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOnboardingStep(2)}
                  className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer font-mono"
                >
                  Change team
                </button>
              </div>

              {joinError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {joinError}
                </div>
              )}

              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {EXERCISE_TEAMS[selectedTeamId].roles.map((role) => {
                  const claimedToken = session.claimedRoleTokens?.[role.id];
                  const isTaken = !!claimedToken;
                  const claimedBy = isTaken ? session.participants?.[claimedToken]?.displayName : null;

                  return (
                    <button
                      key={role.id}
                      type="button"
                      disabled={isTaken || isSubmitting}
                      onClick={() => handleClaimRole(role.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all min-h-[56px] ${
                        isTaken
                          ? 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-amber-400 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">{role.title}</span>
                        {isTaken ? (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-400">
                            Taken ({claimedBy || 'Occupied'})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-mono font-semibold">
                            Available
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-normal">
                        {role.authorityScope}
                      </p>

                      <div className="mt-2 flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                          {role.decisionAuthority}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">{role.callsign}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(2)}
                  className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Back to team selection
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ROLE SUMMARY AND READINESS */}
          {onboardingStep === 4 && currentRoleDef && (
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-slate-900 border-2 border-emerald-500/60 space-y-4">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono uppercase tracking-wider">
                  <Check className="w-4 h-4" />
                  <span>Role Confirmed</span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white">
                    You are the {currentRoleDef.title}
                  </h2>
                  <div className="text-xs font-mono text-amber-400 mt-0.5">
                    Callsign: {currentRoleDef.callsign} • {EXERCISE_TEAMS[currentRoleDef.teamId].name}
                  </div>
                </div>

                {/* 3 Concise Responsibilities */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <div className="text-xs font-mono text-slate-400 uppercase">
                    Your Core Responsibilities:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {currentRoleDef.responsibilities.slice(0, 3).map((resp, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Authority Scope */}
                <div className="pt-2 border-t border-slate-800 text-xs">
                  <span className="font-mono text-slate-400">Your Authority: </span>
                  <span className="text-slate-200 font-medium">
                    {currentRoleDef.decisionAuthority} ({currentRoleDef.authorityScope})
                  </span>
                </div>
              </div>

              {/* I'm Ready Button */}
              <button
                type="button"
                onClick={() => setIsReady(true)}
                className="w-full min-h-[50px] px-6 py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold text-base flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 transition-colors cursor-pointer"
              >
                <span>I'm Ready — Enter Tabletop</span>
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>

        <footer className="border-t border-slate-800/60 bg-slate-950 px-4 py-3 text-center text-xs text-slate-500 font-mono">
          Meridian Trust Financial • Tabletop Multiplayer Onboarding
        </footer>
      </div>
    );
  }

  // =========================================================================
  // MOBILE GAME HOME (Primary In-Session Experience)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white pb-20">
      {/* Top Mobile Ribbon */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-none">
              {currentRoleDef?.title || 'Crisis Participant'}
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${session.isClockRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{currentParticipant?.displayName}</span>
              <span>•</span>
              <span className="text-amber-400">{currentRoleDef?.callsign}</span>
            </div>
          </div>
        </div>

        {/* Round Clock and 3D trigger */}
        <div className="flex items-center space-x-2">
          {/* Round Clock Badge */}
          <div className={`px-2.5 py-1 rounded-md border font-mono text-xs flex items-center space-x-1.5 ${
            isUrgent
              ? 'bg-rose-950 border-rose-700 text-rose-300 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-400' : 'text-amber-400'}`} />
            <span className="font-bold">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Optional 3D View Modal Trigger */}
          <button
            onClick={() => setShow3DModal(true)}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 cursor-pointer"
            title="View 3D Model"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area: Answers 3 Questions Instantly */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-4 space-y-4">
        {/* Core 3 Questions Above The Fold Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          {/* 1. What happened? */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center space-x-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>What Happened? • Inject {currentPart.id}</span>
            </div>
            <h1 className="text-base font-bold text-white leading-snug">
              {currentPart.injectTitle}
            </h1>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {currentPart.overview}
            </p>
          </div>

          {/* 2. What do I need to do? */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">
              What Do I Need To Do?
            </div>
            <p className="text-xs text-slate-200 leading-normal">
              {hasSubmissionAuthority
                ? `As ${currentRoleDef?.title}, review team proposals and submit Meridian Trust's official action below.`
                : `Deliberate with your team. Tap to support or propose an action card for your team lead.`}
            </p>
          </div>

          {/* 3. How long do I have? */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Time Remaining:</span>
            <span className={`font-bold ${isUrgent ? 'text-rose-400' : 'text-slate-200'}`}>
              {minutes}m {seconds}s ({session.isClockRunning ? 'Active Round' : 'Discussion Paused'})
            </span>
          </div>
        </div>

        {/* TAB 1: NOW (DECISIONS THAT FEEL LIKE PLAY) */}
        {activeTab === 'now' && (
          <div className="space-y-4">
            {/* If Decision Already Recorded */}
            {currentDecision && (
              <div className="p-4 rounded-xl bg-emerald-950/70 border-2 border-emerald-500 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                  <FileCheck className="w-4 h-4" />
                  <span>Decision Recorded</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {currentDecision.actionSummary}
                </div>
                <div className="text-xs text-slate-300">
                  {currentDecision.rationale}
                </div>
                <div className="text-[11px] font-mono text-emerald-300 pt-1 border-t border-emerald-800">
                  Authorized by {currentDecision.submittedByRole} ({currentDecision.submittedByName})
                </div>
              </div>
            )}

            {/* 2-4 Decision Action Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase">
                <span>Action Options ({options.length})</span>
                <span className="text-amber-400">Deliberate & Vote</span>
              </div>

              {options.map((opt) => {
                const optProposals = currentProposals.filter((p) => p.optionId === opt.id);
                const totalVotes = optProposals.reduce((sum, p) => sum + (p.upvotes?.length || 0) + 1, 0);

                return (
                  <div
                    key={opt.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md"
                  >
                    <div>
                      <div className="text-sm font-bold text-white leading-snug">
                        {opt.label}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {opt.summary}
                      </p>
                    </div>

                    {/* Tradeoff / Impact Note */}
                    {opt.tierImpact && (
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-normal">
                        <span className="font-semibold text-slate-300">Tradeoff: </span>
                        <span>{opt.tierImpact.tier2 || opt.tierImpact.tier1 || opt.tierImpact.tier4}</span>
                      </div>
                    )}

                    {/* Action Buttons for this Card */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
                      {/* Propose / Upvote Button */}
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleProposeOption(opt.id, opt.label)}
                        className="min-h-[44px] px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-xs font-medium text-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                        <span>I Support This</span>
                        {totalVotes > 0 && (
                          <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono font-bold text-[10px]">
                            {totalVotes}
                          </span>
                        )}
                      </button>

                      {/* Official Submit Button for Authorized Roles */}
                      {hasSubmissionAuthority && !currentDecision && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSubmitDecision(opt.id, opt.label, opt.summary)}
                          className="min-h-[44px] px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-rose-950/50 transition-colors cursor-pointer"
                        >
                          <span>Submit this decision</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Suggest Another Approach Accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCustomProposalOpen(!customProposalOpen)}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-slate-900 border border-dashed border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 hover:text-white flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>+ Suggest another approach</span>
              </button>

              {customProposalOpen && (
                <form onSubmit={handleCustomProposal} className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Proposed Custom Action
                    </label>
                    <textarea
                      rows={2}
                      value={customActionText}
                      onChange={(e) => setCustomActionText(e.target.value)}
                      placeholder="Specify concrete containment, communication, or recovery steps..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Operational Rationale
                    </label>
                    <input
                      type="text"
                      value={proposalRationale}
                      onChange={(e) => setProposalRationale(e.target.value)}
                      placeholder="Why is this optimal given current constraints?"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setCustomProposalOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-400 cursor-pointer min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !customActionText.trim()}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer min-h-[44px]"
                    >
                      Propose to Team
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Cross-Team Approvals Section (if any required) */}
            {currentDecision?.crossTeamApprovals && currentDecision.crossTeamApprovals.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 space-y-3">
                <div className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Cross-Team Approvals Required</span>
                </div>

                <div className="space-y-2">
                  {currentDecision.crossTeamApprovals.map((app, idx) => {
                    const isMyApproval = app.requiredRoleId === currentRoleDef?.id;
                    return (
                      <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{app.requiredRoleName}</div>
                          <div className="text-[11px] font-mono text-slate-400">
                            Status: <span className={app.status === 'approved' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{app.status}</span>
                          </div>
                        </div>

                        {isMyApproval && app.status === 'pending' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleApprovalAction('approved')}
                              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs min-h-[44px] cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApprovalAction('rejected')}
                              className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs min-h-[44px] cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TEAM (WHO IS ONLINE & PROPOSALS) */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Cooperating Teams Roster</h2>

            <div className="space-y-3">
              {(Object.keys(EXERCISE_TEAMS) as TeamId[]).map((teamId) => {
                const team = EXERCISE_TEAMS[teamId];
                const members = Object.values(session.participants || {}).filter((p) => p.teamId === teamId);

                return (
                  <div key={teamId} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {teamId === 'executive' && <Crown className="w-4 h-4 text-purple-400" />}
                        {teamId === 'technical' && <Shield className="w-4 h-4 text-blue-400" />}
                        {teamId === 'business' && <Users className="w-4 h-4 text-teal-400" />}
                        <span className="font-bold text-sm text-white">{team.name}</span>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {members.length} Connected
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {members.length > 0 ? (
                        members.map((m) => {
                          const rDef = team.roles.find((r) => r.id === m.roleId);
                          return (
                            <div key={m.token} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded bg-slate-950/70 border border-slate-800">
                              <span className="font-medium text-slate-200">{m.displayName}</span>
                              <span className="text-slate-400 font-mono text-[11px]">{rDef?.title || m.roleId}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-xs text-slate-500 italic py-1">No participants yet</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Proposals Deliberation Feed */}
            <div className="pt-2 space-y-2">
              <h3 className="text-xs font-mono text-slate-400 uppercase">Live Proposals for Inject {currentPart.id}</h3>
              {currentProposals.length > 0 ? (
                currentProposals.map((prop) => (
                  <div key={prop.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{prop.participantName}</span>
                      <button
                        onClick={() => handleUpvote(prop.id)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{prop.upvotes?.length || 1}</span>
                      </button>
                    </div>
                    <div className="text-slate-300 font-medium">{prop.customActionText}</div>
                    {prop.rationale && <div className="text-slate-400 italic text-[11px]">{prop.rationale}</div>}
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-slate-900/50 border border-dashed border-slate-800 text-xs text-slate-500 text-center">
                  No custom proposals submitted yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EVIDENCE & SIMULATED MESSAGES */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Unsealed Incident Evidence</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Facilitator-released packets and simulated AI correlation feeds.
              </p>
            </div>

            {/* Simulated AI Agent Outputs (SENTINEL & COMPASS only, RAVEN hidden) */}
            <div className="space-y-2.5">
              <div className="text-xs font-mono text-slate-400 uppercase">
                Simulated AI Telemetry & Briefings
              </div>

              {(currentPart.agentsOutput || [])
                .filter((ag) => !ag.isFacilitatorOnly)
                .map((agent) => (
                  <div
                    key={agent.agentId}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold" style={{ color: agent.badgeColor }}>
                        {agent.agentName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[10px] text-slate-400 border border-slate-800">
                        {agent.scriptedBadge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {agent.text}
                    </p>
                    {agent.metadataNotice && (
                      <div className="text-[10px] font-mono text-slate-400 pt-1">
                        Note: {agent.metadataNotice}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Released Evidence Packets */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-mono text-slate-400 uppercase">
                Released Artifacts ({releasedPackets.length})
              </div>

              {releasedPackets.length > 0 ? (
                releasedPackets.map((pkt) => {
                  const isExpanded = expandedEvidenceId === pkt.id;
                  return (
                    <div
                      key={pkt.id}
                      onClick={() => setExpandedEvidenceId(isExpanded ? null : pkt.id)}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{pkt.title}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px]">
                          Verified Fact
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{pkt.summary}</p>

                      {isExpanded && pkt.technicalDetails && (
                        <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-[11px] text-slate-400">
                          {pkt.technicalDetails.map((td, i) => (
                            <div key={i}>• {td}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-xs text-slate-500 text-center">
                  Awaiting evidence unsealing by the exercise facilitator.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MY ROLE */}
        {activeTab === 'my_role' && currentRoleDef && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-xs font-mono text-amber-400 uppercase">
                {EXERCISE_TEAMS[currentRoleDef.teamId].name}
              </div>
              <h2 className="text-xl font-black text-white">{currentRoleDef.title}</h2>
              <div className="text-xs text-slate-300 font-mono">
                Callsign: <span className="text-white font-bold">{currentRoleDef.callsign}</span> • Seniority: {currentRoleDef.seniority}
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
                <span className="font-mono text-slate-400 uppercase block">Authority Scope:</span>
                <span className="text-slate-200">{currentRoleDef.authorityScope}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5">
                <span className="font-mono text-slate-400 uppercase block">Key Responsibilities:</span>
                <ul className="space-y-1 text-slate-300">
                  {currentRoleDef.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* View 3D Model Option */}
            <button
              type="button"
              onClick={() => setShow3DModal(true)}
              className="w-full min-h-[48px] px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Open 3D Spatial Banking Model</span>
            </button>

            {/* Leave Role Button */}
            <button
              type="button"
              onClick={handleLeaveRole}
              className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave / Switch Role</span>
            </button>
          </div>
        )}
      </main>

      {/* Bottom Sticky 4-Item Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md px-3 py-2">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {/* 1. NOW */}
          <button
            type="button"
            onClick={() => setActiveTab('now')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
              activeTab === 'now' ? 'bg-amber-400/10 text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-medium">Now</span>
          </button>

          {/* 2. TEAM */}
          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
              activeTab === 'team' ? 'bg-amber-400/10 text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-medium">Team</span>
          </button>

          {/* 3. EVIDENCE */}
          <button
            type="button"
            onClick={() => setActiveTab('evidence')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
              activeTab === 'evidence' ? 'bg-amber-400/10 text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-medium">Evidence</span>
          </button>

          {/* 4. MY ROLE */}
          <button
            type="button"
            onClick={() => setActiveTab('my_role')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
              activeTab === 'my_role' ? 'bg-amber-400/10 text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-medium">My Role</span>
          </button>
        </div>
      </nav>

      {/* Optional Lightweight 3D Modal for Mobile */}
      {show3DModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
          <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase">
              Meridian Trust 4-Tier Architecture
            </div>
            <button
              onClick={() => setShow3DModal(false)}
              className="px-3 py-1.5 rounded bg-slate-800 text-white text-xs font-medium cursor-pointer"
            >
              Close 3D
            </button>
          </div>
          <div className="flex-1 relative">
            <ViewportCanvas
              levels={MERIDIAN_ORG_LEVELS}
              parameters={INITIAL_PARAMETERS}
              isPlaying={false}
              playbackSpeed={1}
              simulationProgress={session.currentPartIndex / (SCENARIO_INJECT_PARTS.length - 1 || 1)}
              collaborators={INITIAL_COLLABORATORS}
              annotations={INITIAL_ANNOTATIONS}
              selectedDepartment={null}
              selectedLevelId={currentPart.primaryTierId}
              cameraPreset="cloud"
              onSelectDepartment={() => {}}
              onSelectLevel={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
