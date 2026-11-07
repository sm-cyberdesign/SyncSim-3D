/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Smartphone,
  Tv,
  Lock,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Cpu,
  AlertCircle,
} from 'lucide-react';

interface WelcomeLandingScreenProps {
  onJoinAsParticipant: (sessionCode: string) => void;
  onOpenProjector: (sessionCode: string) => void;
  onOpenFacilitator: (passcode: string) => boolean;
  defaultSessionCode?: string;
}

export const WelcomeLandingScreen: React.FC<WelcomeLandingScreenProps> = ({
  onJoinAsParticipant,
  onOpenProjector,
  onOpenFacilitator,
  defaultSessionCode = 'SL-SILENT',
}) => {
  const [sessionCode, setSessionCode] = useState(defaultSessionCode);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showFacilitatorModal, setShowFacilitatorModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const handleJoinClick = () => {
    const code = sessionCode.trim().toUpperCase() || 'SL-SILENT';
    onJoinAsParticipant(code);
  };

  const handleProjectorClick = () => {
    const code = sessionCode.trim().toUpperCase() || 'SL-SILENT';
    onOpenProjector(code);
  };

  const handleFacilitatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    const success = onOpenFacilitator(passcode.trim());
    if (!success) {
      setPasscodeError('Invalid facilitator passcode. Please verify with the exercise director.');
    } else {
      setShowFacilitatorModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Top Bank Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
                Meridian Trust Financial
              </div>
              <div className="text-[11px] text-slate-400">
                Crisis Operations Center
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Active Incident Net</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {sessionCode}
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero & Action Section */}
      <main className="flex-1 max-w-xl mx-auto w-full px-5 py-8 sm:py-14 flex flex-col justify-center">
        {/* Incident Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono uppercase tracking-wider mb-5 w-fit">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Exercise Level 1 Alert • Glass Heron Intrusion</span>
        </div>

        {/* Title and Pitch */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
          OPERATION SILENT LEDGER
        </h1>
        <p className="mt-2 text-lg sm:text-xl font-medium text-slate-300">
          A multiplayer cybersecurity crisis exercise.
        </p>
        <p className="mt-3 text-base sm:text-lg text-slate-400 leading-relaxed">
          Your bank is under attack. Work together to lead its response.
        </p>

        {/* Session Code Card / Entry */}
        <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
            <span>EXERCISE SESSION CODE</span>
            <button
              onClick={() => setShowCodeInput(!showCodeInput)}
              className="text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
            >
              {showCodeInput ? 'Use default code' : 'Change code'}
            </button>
          </div>

          {showCodeInput ? (
            <div className="mb-4">
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="e.g. SL-SILENT"
                maxLength={12}
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-lg tracking-widest uppercase focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 min-h-[44px]"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-sm mb-4">
              <span className="text-slate-400">Session:</span>
              <span className="text-amber-400 font-bold tracking-wider">{sessionCode}</span>
            </div>
          )}

          {/* Primary Action: Join Exercise */}
          <button
            onClick={handleJoinClick}
            className="w-full min-h-[48px] px-6 py-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-semibold text-base flex items-center justify-center space-x-2.5 shadow-lg shadow-rose-950/40 transition-colors cursor-pointer"
          >
            <Smartphone className="w-5 h-5" />
            <span>Join exercise</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          {/* Secondary Action: Big Screen / Projector */}
          <button
            onClick={handleProjectorClick}
            className="w-full mt-3 min-h-[44px] px-4 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm flex items-center justify-center space-x-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Tv className="w-4 h-4 text-blue-400" />
            <span>Big screen / Projector</span>
          </button>
        </div>

        {/* 3 Cooperating Teams Pill Preview */}
        <div className="mt-8 grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/40">
            <div className="text-[11px] font-mono uppercase text-purple-400 font-semibold">Executive</div>
            <div className="text-xs text-slate-400 mt-0.5">Governance & Disclosure</div>
          </div>
          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40">
            <div className="text-[11px] font-mono uppercase text-blue-400 font-semibold">Technical</div>
            <div className="text-xs text-slate-400 mt-0.5">SOC & Containment</div>
          </div>
          <div className="p-3 rounded-lg bg-teal-950/30 border border-teal-800/40">
            <div className="text-[11px] font-mono uppercase text-teal-400 font-semibold">Business</div>
            <div className="text-xs text-slate-400 mt-0.5">Payments & Branches</div>
          </div>
        </div>

        {/* Essential Rules Brief */}
        <div className="mt-6 flex items-start space-x-2 text-xs text-slate-500 leading-normal">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Teams cooperate to contain the crisis. Designated decision-makers submit actions; peers propose and debate. Scripted simulation characters guide telemetry.
          </span>
        </div>
      </main>

      {/* Footer with Discreet Facilitator Link */}
      <footer className="border-t border-slate-800/60 bg-slate-950 px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center space-x-3">
            <span>Meridian Trust Financial Incident Response</span>
            <span>•</span>
            <span>Revision 6 Scenario</span>
          </div>

          <div>
            <button
              onClick={() => setShowFacilitatorModal(true)}
              className="inline-flex items-center space-x-1.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer py-1"
            >
              <Lock className="w-3 h-3" />
              <span>Facilitator sign-in</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Facilitator Sign-In Modal */}
      {showFacilitatorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-2.5 text-amber-400 mb-2">
              <Lock className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Facilitator Sign-In</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Enter the exercise director passcode to manage rounds, unseal evidence, and view hidden adversary intelligence.
            </p>

            <form onSubmit={handleFacilitatorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  FACILITATOR PASSCODE
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="e.g. meridian-ciso"
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-amber-400 min-h-[44px]"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Default passcode: <code className="text-slate-400">meridian-ciso</code>
                </p>
              </div>

              {passcodeError && (
                <div className="flex items-center space-x-2 p-2 rounded bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passcodeError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFacilitatorModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs min-h-[44px] cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
