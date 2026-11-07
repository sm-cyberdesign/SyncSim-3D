/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, CheckCircle, Smartphone, Users, Shield, Crown } from 'lucide-react';
import { getJoinUrl } from '../utils/multiplayerClient';
import { TabletopSessionState, EXERCISE_TEAMS } from '../types/multiplayer';

interface QRJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TabletopSessionState;
  onSwitchToParticipantView: () => void;
}

export function QRJoinModal({
  isOpen,
  onClose,
  session,
  onSwitchToParticipantView,
}: QRJoinModalProps) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const joinUrl = getJoinUrl(session.code);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const claimedCount = Object.keys(session.claimedRoleTokens).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 max-w-md w-full p-6 space-y-5 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider bg-amber-950/60 px-2.5 py-0.5 border border-amber-800">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Participant Join</span>
          </div>
          <h2 className="text-lg font-bold text-white">Scan to Join Tabletop</h2>
          <p className="text-xs text-slate-400">
            Open camera on your mobile device to select an incident response role.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex justify-center">
          <div className="p-4 bg-white border-2 border-slate-700 shadow-xl inline-block">
            <QRCodeSVG value={joinUrl} size={190} level="M" />
          </div>
        </div>

        {/* Session Code & Copy */}
        <div className="space-y-2 text-center">
          <div className="text-xs font-mono text-slate-300">
            Session Code:{' '}
            <span className="font-bold text-amber-400 bg-slate-950 px-2 py-0.5 border border-slate-800 text-sm">
              {session.code}
            </span>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Join URL</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                onClose();
                onSwitchToParticipantView();
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-medium border border-blue-400 cursor-pointer"
            >
              Open Mobile Interface Here
            </button>
          </div>
        </div>

        {/* Roster Preview */}
        <div className="pt-3 border-t border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between font-mono text-slate-400 text-[11px]">
            <span>ROLES CLAIMED: {claimedCount} / 12</span>
            <span>MERIDIAN TRUST FINANCIAL</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
            <div className="p-1.5 bg-purple-950/40 border border-purple-800 text-purple-300">
              <Crown className="w-3 h-3 mx-auto mb-0.5" />
              Executive ({Object.values(session.participants).filter((p) => p.teamId === 'executive').length})
            </div>
            <div className="p-1.5 bg-blue-950/40 border border-blue-800 text-blue-300">
              <Shield className="w-3 h-3 mx-auto mb-0.5" />
              Technical ({Object.values(session.participants).filter((p) => p.teamId === 'technical').length})
            </div>
            <div className="p-1.5 bg-teal-950/40 border border-teal-800 text-teal-300">
              <Users className="w-3 h-3 mx-auto mb-0.5" />
              Business ({Object.values(session.participants).filter((p) => p.teamId === 'business').length})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
