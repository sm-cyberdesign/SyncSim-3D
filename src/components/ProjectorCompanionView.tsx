/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Clock,
  Users,
  Shield,
  Crown,
  Building2,
  CheckCircle2,
  QrCode,
  ArrowLeft,
  Tv,
  Layers,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { TabletopSessionState, EXERCISE_TEAMS } from '../types/multiplayer';
import { SCENARIO_INJECT_PARTS, MERIDIAN_ORG_LEVELS } from '../data/silentLedgerScenario';
import { getJoinUrl } from '../utils/multiplayerClient';
import { ViewportCanvas } from './ViewportCanvas';
import { INITIAL_PARAMETERS, INITIAL_COLLABORATORS, INITIAL_ANNOTATIONS } from '../data/simulationData';

interface ProjectorCompanionViewProps {
  session: TabletopSessionState;
  onExit: () => void;
}

export const ProjectorCompanionView: React.FC<ProjectorCompanionViewProps> = ({
  session,
  onExit,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [force3DView, setForce3DView] = useState(false);

  const joinUrl = getJoinUrl(session.code);
  const currentPart = SCENARIO_INJECT_PARTS[session.currentPartIndex] || SCENARIO_INJECT_PARTS[0];

  // Connected players count & grouping
  const participantsList = Object.values(session.participants || {});
  const execPlayers = participantsList.filter((p) => p.teamId === 'executive');
  const techPlayers = participantsList.filter((p) => p.teamId === 'technical');
  const bizPlayers = participantsList.filter((p) => p.teamId === 'business');

  // Decision status for current inject
  const currentDecision = session.decisions?.[currentPart.id];

  // Round countdown
  const remainingSeconds = Math.max(0, session.roundDurationSeconds - session.roundElapsedSeconds);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  // Determine if we should show the Pre-Start Lobby view vs Active 3D Command Center
  const isLobby = !force3DView && (session.status === 'lobby' || (session.currentPartIndex === 0 && !session.isClockRunning && Object.keys(session.decisions || {}).length === 0));

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Projector Header */}
      <header className="z-30 h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onExit}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Return to Welcome Screen"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
                Meridian Trust Financial
              </div>
              <div className="text-sm font-bold text-white tracking-wide">
                Operation Silent Ledger • Big Screen Command Display
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center space-x-4">
          {/* Round Clock (Large and bold) */}
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono">
            <Clock className={`w-4 h-4 ${remainingSeconds < 120 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-xs text-slate-400">ROUND CLOCK:</span>
            <span className={`text-base font-bold ${remainingSeconds < 120 ? 'text-rose-400' : 'text-white'}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Toggle between Lobby and 3D View */}
          <button
            onClick={() => setForce3DView(!force3DView)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
          >
            {force3DView ? <Tv className="w-3.5 h-3.5 text-blue-400" /> : <Layers className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{force3DView ? 'Show Lobby Cards' : 'View 3D Model'}</span>
          </button>

          {/* QR Button for latecomers */}
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-semibold flex items-center space-x-1.5 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Join QR ({session.code})</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      {isLobby ? (
        /* PRE-START LOBBY FOR BIG SCREEN */
        <main className="flex-1 overflow-y-auto p-8 sm:p-12 flex flex-col justify-center max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Huge Title & Scenario Briefing */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider">
                <span>Multiplayer Cybersecurity Tabletop • Revision 6</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none font-sans">
                OPERATION SILENT LEDGER
              </h1>

              <p className="text-xl sm:text-2xl text-slate-300 font-light leading-relaxed">
                A critical third-party vendor has been breached. Glass Heron is probing the core banking perimeter.
              </p>

              {/* Waiting Status Bar */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-white">
                    Waiting for the facilitator to begin...
                  </div>
                  <div className="text-xs text-slate-400">
                    Join on your smartphone using the QR code. All roles will be briefed before the first decision round.
                  </div>
                </div>
              </div>

              {/* Team Readiness Cards */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                {/* Executive Team */}
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-purple-400 text-xs font-mono font-bold uppercase">
                      <Crown className="w-3.5 h-3.5" />
                      <span>Executive</span>
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-200">
                      {execPlayers.length}/4
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 line-clamp-1">
                    {execPlayers.length > 0
                      ? execPlayers.map((p) => p.displayName).join(', ')
                      : 'Awaiting leaders...'}
                  </div>
                </div>

                {/* Technical Team */}
                <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-blue-400 text-xs font-mono font-bold uppercase">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Technical</span>
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-200">
                      {techPlayers.length}/4
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 line-clamp-1">
                    {techPlayers.length > 0
                      ? techPlayers.map((p) => p.displayName).join(', ')
                      : 'Awaiting responders...'}
                  </div>
                </div>

                {/* Business Team */}
                <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-teal-400 text-xs font-mono font-bold uppercase">
                      <Users className="w-3.5 h-3.5" />
                      <span>Business</span>
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-900/60 text-teal-200">
                      {bizPlayers.length}/4
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 line-clamp-1">
                    {bizPlayers.length > 0
                      ? bizPlayers.map((p) => p.displayName).join(', ')
                      : 'Awaiting ops & PR...'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Giant QR Code Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-7 shadow-2xl flex flex-col items-center max-w-sm w-full text-center">
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-3">
                  Scan to Join on Mobile
                </div>

                {/* Big QR Canvas */}
                <div className="p-4 bg-white rounded-xl shadow-inner my-2">
                  <QRCodeSVG
                    value={joinUrl}
                    size={220}
                    level="M"
                    includeMargin={false}
                  />
                </div>

                <div className="mt-4 space-y-1 w-full">
                  <div className="text-xs text-slate-400 font-mono">OR OPEN BROWSER AND ENTER:</div>
                  <div className="text-2xl font-black font-mono tracking-widest text-amber-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    {session.code}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate pt-1">
                    {joinUrl}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 w-full flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Connected Participants:</span>
                  <span className="text-white font-bold text-sm bg-slate-800 px-2.5 py-0.5 rounded">
                    {participantsList.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* ACTIVE 3D COMMAND CENTER WITH BIG-SCREEN HUD */
        <div className="relative flex-1 w-full h-full">
          {/* 3D WebGL Canvas */}
          <ViewportCanvas
            levels={MERIDIAN_ORG_LEVELS}
            parameters={INITIAL_PARAMETERS}
            isPlaying={session.isClockRunning}
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

          {/* Projector Big Screen Floating HUD */}
          <div className="absolute top-4 left-4 right-4 pointer-events-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Active Inject Highlight */}
            <div className="pointer-events-auto bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-md max-w-xl">
              <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 font-bold">
                  INJECT {currentPart.id}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">{currentPart.simulatedDateTime}</span>
                <span className="text-slate-400">•</span>
                <span className="text-amber-400 font-semibold">Tier {currentPart.primaryTierId} Primary Focus</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {currentPart.injectTitle}
              </h2>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {currentPart.overview}
              </p>
            </div>

            {/* Decision Consensus Tracker for 3 Teams */}
            <div className="pointer-events-auto bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-md flex flex-col space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Team Deliberation</span>
                {currentDecision && (
                  <span className="inline-flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Decision Recorded</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Exec */}
                <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center space-x-1.5 ${
                  execPlayers.length > 0 ? 'bg-purple-950/80 border-purple-700 text-purple-200' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <Crown className="w-3.5 h-3.5 text-purple-400" />
                  <span>Executive</span>
                </div>

                {/* Tech */}
                <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center space-x-1.5 ${
                  techPlayers.length > 0 ? 'bg-blue-950/80 border-blue-700 text-blue-200' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Technical</span>
                </div>

                {/* Biz */}
                <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center space-x-1.5 ${
                  bizPlayers.length > 0 ? 'bg-teal-950/80 border-teal-700 text-teal-200' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  <span>Business</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Decision Outcome Banner if recorded */}
          {currentDecision && (
            <div className="absolute bottom-6 left-6 right-6 pointer-events-none flex justify-center">
              <div className="pointer-events-auto bg-emerald-950/95 border-2 border-emerald-600 rounded-xl px-6 py-3.5 shadow-2xl backdrop-blur-md max-w-2xl text-center space-y-1">
                <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>OFFICIAL DECISION SUBMITTED BY {currentDecision.submittedByRole}</span>
                </div>
                <div className="text-sm font-semibold text-white">
                  "{currentDecision.actionSummary}"
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pop-up QR Modal for Late Arrivals */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white font-sans">Scan to Join Tabletop</h3>
            <div className="p-3 bg-white rounded-xl inline-block">
              <QRCodeSVG value={joinUrl} size={180} />
            </div>
            <div className="text-xs font-mono text-slate-300">
              Session: <span className="font-bold text-amber-400">{session.code}</span>
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
