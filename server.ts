/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  TabletopSessionState,
  ParticipantSession,
  ActionProposal,
  SubmittedTeamDecision,
  CrossTeamApproval,
  EvaluatorScore,
  EXERCISE_TEAMS,
  TeamId,
} from './src/types/multiplayer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory sessions store
const sessions: Record<string, TabletopSessionState> = {};
// Active SSE client connections keyed by session code
const sseClients: Record<string, Response[]> = {};

// Helper: Broadcast state update to all connected clients for a session
function broadcastSessionState(sessionCode: string) {
  const code = sessionCode.toUpperCase();
  const session = sessions[code];
  if (!session) return;

  const clients = sseClients[code] || [];
  const payload = JSON.stringify({
    type: 'SESSION_UPDATE',
    session,
    serverTime: Date.now(),
  });

  clients.forEach((client) => {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      // client dropped
    }
  });
}

// Background tick for active session timers (server-authoritative clock)
setInterval(() => {
  const now = Date.now();
  Object.values(sessions).forEach((session) => {
    if (session.status === 'active' && session.isClockRunning) {
      session.totalElapsedSeconds += 1;
      session.roundElapsedSeconds += 1;

      // Check if round elapsed reaches duration
      if (session.roundDurationSeconds > 0 && session.roundElapsedSeconds >= session.roundDurationSeconds) {
        // Round time expired: pause and trigger discussion pause
        session.isClockRunning = false;
        session.roundDeadlineTimestamp = null;
        broadcastSessionState(session.code);
      }
    }

    // Ping check: mark participants offline if no ping in 45s
    Object.values(session.participants).forEach((p) => {
      if (p.isOnline && now - p.lastPing > 45000) {
        p.isOnline = false;
      }
    });
  });
}, 1000);

// Helper to generate a friendly session code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'SL-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper to generate random tokens
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Initialize a default starter session for instant multiplayer demonstration
const DEFAULT_CODE = 'SL-SILENT';
sessions[DEFAULT_CODE] = {
  code: DEFAULT_CODE,
  createdAt: Date.now(),
  hostToken: 'host_secret_default',
  status: 'lobby',
  currentPartIndex: 0,
  roundDurationSeconds: 600, // 10 minutes per inject
  roundElapsedSeconds: 0,
  totalElapsedSeconds: 0,
  isClockRunning: false,
  roundDeadlineTimestamp: null,
  participants: {},
  claimedRoleTokens: {},
  releasedEvidenceIds: ['ev-1.1-vpn', 'ev-1.1-crowdstrike'],
  proposals: [],
  decisions: {},
  discussionLog: [
    {
      id: 'msg-init',
      timestamp: Date.now(),
      participantName: 'CISO Tabletop Director',
      roleTitle: 'Exercise Facilitator',
      teamId: 'executive',
      message: 'Welcome to Operation Silent Ledger. Select your assigned team role in the lobby to begin.',
      isSystemNotice: true,
    },
  ],
  evaluation: {
    operationalContinuity: 20,
    regulatoryCompliance: 22,
    customerTrust: 19,
    financialPrudence: 21,
    evaluatorNotes: 'Exercise initialized. Baseline posture normal.',
    awardedBadges: [],
  },
};

// ======================== API ROUTES ========================

// 1. Create a new exercise session
app.post('/api/sessions', (req: Request, res: Response) => {
  const { customCode, roundDurationMinutes = 10 } = req.body;
  let code = (customCode ? customCode.trim().toUpperCase() : generateCode()).replace(/[^A-Z0-9-]/g, '');
  if (!code || sessions[code]) {
    code = generateCode();
  }

  const hostToken = 'host_' + generateToken();
  const roundSeconds = Math.max(60, (roundDurationMinutes || 10) * 60);

  const newSession: TabletopSessionState = {
    code,
    createdAt: Date.now(),
    hostToken,
    status: 'lobby',
    currentPartIndex: 0,
    roundDurationSeconds: roundSeconds,
    roundElapsedSeconds: 0,
    totalElapsedSeconds: 0,
    isClockRunning: false,
    roundDeadlineTimestamp: null,
    participants: {},
    claimedRoleTokens: {},
    releasedEvidenceIds: ['ev-1.1-vpn', 'ev-1.1-crowdstrike'],
    proposals: [],
    decisions: {},
    discussionLog: [
      {
        id: 'msg-start-' + Date.now(),
        timestamp: Date.now(),
        participantName: 'Exercise Control',
        roleTitle: 'Facilitator System',
        teamId: 'executive',
        message: `Session ${code} initialized. Round duration set to ${Math.round(roundSeconds / 60)} minutes.`,
        isSystemNotice: true,
      },
    ],
    evaluation: {
      operationalContinuity: 20,
      regulatoryCompliance: 20,
      customerTrust: 20,
      financialPrudence: 20,
      evaluatorNotes: 'New tabletop session created.',
      awardedBadges: [],
    },
  };

  sessions[code] = newSession;
  res.status(201).json({ code, hostToken, session: newSession });
});

// 2. Get current session state
app.get('/api/sessions/:code', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: `Session ${code} not found.` });
  }
  res.json({ session, serverTime: Date.now() });
});

// 3. Atomic role reservation & join
app.post('/api/sessions/:code/join', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: `Session ${code} not found.` });
  }

  const { displayName, roleId, existingToken } = req.body;
  const name = (displayName || 'Analyst').trim().substring(0, 32);

  // If reconnecting with existing valid token:
  if (existingToken && session.participants[existingToken]) {
    const existing = session.participants[existingToken];
    existing.isOnline = true;
    existing.lastPing = Date.now();
    broadcastSessionState(code);
    return res.json({
      success: true,
      token: existingToken,
      participant: existing,
      session,
    });
  }

  if (!roleId) {
    return res.status(400).json({ error: 'roleId is required.' });
  }

  // Find team for this role
  let targetTeam: TeamId | null = null;
  let roleTitle = '';
  for (const team of Object.values(EXERCISE_TEAMS)) {
    const found = team.roles.find((r) => r.id === roleId);
    if (found) {
      targetTeam = team.id;
      roleTitle = found.title;
      break;
    }
  }

  if (!targetTeam) {
    return res.status(400).json({ error: `Invalid roleId: ${roleId}. AI roles cannot be selected.` });
  }

  // Atomic check: Is role already claimed by another active participant?
  const existingClaimantToken = session.claimedRoleTokens[roleId];
  if (existingClaimantToken && session.participants[existingClaimantToken]?.isOnline) {
    return res.status(409).json({
      error: `Role "${roleTitle}" is already claimed by ${session.participants[existingClaimantToken].displayName}. Please select another role.`,
      claimedRoles: Object.keys(session.claimedRoleTokens),
    });
  }

  // Issue new participant token
  const token = 'usr_' + generateToken();
  const participant: ParticipantSession = {
    token,
    displayName: name,
    roleId,
    teamId: targetTeam,
    joinedAt: Date.now(),
    lastPing: Date.now(),
    isOnline: true,
  };

  session.participants[token] = participant;
  session.claimedRoleTokens[roleId] = token;

  // Log join event
  session.discussionLog.push({
    id: 'log-join-' + Date.now(),
    timestamp: Date.now(),
    participantName: name,
    roleTitle,
    teamId: targetTeam,
    message: `Joined ${EXERCISE_TEAMS[targetTeam].name} as ${roleTitle}.`,
    isSystemNotice: true,
  });

  broadcastSessionState(code);
  res.status(200).json({
    success: true,
    token,
    participant,
    session,
  });
});

// 4. Leave / Release role
app.post('/api/sessions/:code/leave', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  const { token } = req.body;
  const participant = session.participants[token];
  if (participant) {
    delete session.claimedRoleTokens[participant.roleId];
    delete session.participants[token];
    broadcastSessionState(code);
  }
  res.json({ success: true });
});

// 5. Ping / Keepalive
app.post('/api/sessions/:code/ping', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  const { token } = req.body;
  if (token && session.participants[token]) {
    session.participants[token].lastPing = Date.now();
    session.participants[token].isOnline = true;
  }
  res.json({ success: true, serverTime: Date.now() });
});

// 6. Propose an Action
app.post('/api/sessions/:code/propose', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  const { token, partId, optionId, customActionText, rationale, citedEvidenceIds } = req.body;
  const participant = session.participants[token];
  if (!participant) {
    return res.status(401).json({ error: 'Unauthorized participant token.' });
  }

  const proposal: ActionProposal = {
    id: 'prop-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    partId,
    participantToken: token,
    participantName: participant.displayName,
    roleId: participant.roleId,
    teamId: participant.teamId,
    optionId,
    customActionText: (customActionText || '').trim(),
    rationale: (rationale || '').trim(),
    citedEvidenceIds: citedEvidenceIds || [],
    proposedAt: Date.now(),
    upvotes: [token],
  };

  session.proposals.unshift(proposal);

  // Add notification to discussion log
  session.discussionLog.push({
    id: 'prop-msg-' + Date.now(),
    timestamp: Date.now(),
    participantName: participant.displayName,
    roleTitle: participant.roleId,
    teamId: participant.teamId,
    message: `Proposed action for Inject ${partId}: "${proposal.customActionText || 'Selected option ' + optionId}". Rationale: ${proposal.rationale || 'None provided'}`,
    isSystemNotice: false,
  });

  broadcastSessionState(code);
  res.status(201).json({ success: true, proposal, session });
});

// 7. Upvote a proposal
app.post('/api/sessions/:code/upvote', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  const { token, proposalId } = req.body;
  const proposal = session.proposals.find((p) => p.id === proposalId);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found.' });

  if (!proposal.upvotes.includes(token)) {
    proposal.upvotes.push(token);
    broadcastSessionState(code);
  }
  res.json({ success: true, upvotes: proposal.upvotes.length });
});

// 8. Submit official decision (Authorized human roles only!)
app.post('/api/sessions/:code/submit', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  const { token, partId, optionId, actionSummary, rationale, tierImpactNotes } = req.body;
  const participant = session.participants[token];
  if (!participant) {
    return res.status(401).json({ error: 'Unauthorized participant.' });
  }

  // Determine required cross-team approvals depending on the part
  const crossTeamApprovals: CrossTeamApproval[] = [];
  if (partId.startsWith('1.3') || partId.startsWith('2.3')) {
    // Requires Legal Counsel sign-off for statutory notice
    crossTeamApprovals.push({
      requiredRoleId: 'role_general_counsel',
      requiredRoleName: 'General Counsel / Legal',
      status: 'pending',
    });
  }
  if (partId.startsWith('3.1') || partId.startsWith('3.2')) {
    // Requires CFO sign-off for liquidity & wire halts
    crossTeamApprovals.push({
      requiredRoleId: 'role_cfo',
      requiredRoleName: 'Chief Financial Officer',
      status: 'pending',
    });
  }
  if (partId.startsWith('2.4') || partId.startsWith('4.1')) {
    // Requires CEO sign-off for extortion & board disclosure
    crossTeamApprovals.push({
      requiredRoleId: 'role_ceo',
      requiredRoleName: 'Chief Executive Officer',
      status: 'pending',
    });
  }

  const decision: SubmittedTeamDecision = {
    partId,
    optionId,
    actionSummary: actionSummary || 'Official Action Committed',
    rationale: rationale || 'Team consensus reached under CISO governance.',
    submittedByToken: token,
    submittedByRole: participant.roleId,
    submittedByName: participant.displayName,
    submittedAt: Date.now(),
    tierImpactNotes: tierImpactNotes || '',
    crossTeamApprovals,
    isLocked: true,
  };

  session.decisions[partId] = decision;

  // Log system notice
  session.discussionLog.push({
    id: 'dec-msg-' + Date.now(),
    timestamp: Date.now(),
    participantName: participant.displayName,
    roleTitle: participant.roleId,
    teamId: participant.teamId,
    message: `OFFICIAL DECISION SUBMITTED for Inject ${partId} by ${participant.displayName}: "${decision.actionSummary}". Pending approvals: ${crossTeamApprovals.length}`,
    isSystemNotice: true,
  });

  broadcastSessionState(code);
  res.json({ success: true, decision, session });
});

// 9. Cross-Team Approval
app.post('/api/sessions/:code/approve', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  const { token, partId, roleId, status, comments } = req.body;
  const participant = session.participants[token];
  if (!participant) return res.status(401).json({ error: 'Unauthorized.' });

  const decision = session.decisions[partId];
  if (!decision) return res.status(404).json({ error: 'Decision not found.' });

  const approval = decision.crossTeamApprovals.find((a) => a.requiredRoleId === roleId);
  if (!approval) return res.status(400).json({ error: 'Approval requirement not found.' });

  approval.status = status;
  approval.approvedByToken = token;
  approval.comments = comments || '';
  approval.timestamp = Date.now();

  session.discussionLog.push({
    id: 'appr-msg-' + Date.now(),
    timestamp: Date.now(),
    participantName: participant.displayName,
    roleTitle: participant.roleId,
    teamId: participant.teamId,
    message: `${status.toUpperCase()}: ${participant.displayName} (${approval.requiredRoleName}) ${status === 'approved' ? 'authorized' : 'rejected'} decision for Inject ${partId}. ${comments ? 'Comments: ' + comments : ''}`,
    isSystemNotice: true,
  });

  broadcastSessionState(code);
  res.json({ success: true, decision, session });
});

// 10. Post a message to discussion log
app.post('/api/sessions/:code/chat', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  const { token, message } = req.body;
  const participant = session.participants[token];
  if (!participant) return res.status(401).json({ error: 'Unauthorized.' });

  const trimmed = (message || '').trim().substring(0, 500);
  if (!trimmed) return res.status(400).json({ error: 'Message cannot be empty.' });

  session.discussionLog.push({
    id: 'chat-' + Date.now(),
    timestamp: Date.now(),
    participantName: participant.displayName,
    roleTitle: participant.roleId,
    teamId: participant.teamId,
    message: trimmed,
    isSystemNotice: false,
  });

  broadcastSessionState(code);
  res.json({ success: true });
});

// 11. Facilitator Controls
app.post('/api/sessions/:code/control', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  const { action, currentPartIndex, roundDurationMinutes, releaseEvidenceId, haltReason, extendSeconds } = req.body;

  switch (action) {
    case 'start_exercise':
      session.status = 'active';
      session.isClockRunning = true;
      session.roundElapsedSeconds = 0;
      session.roundDeadlineTimestamp = Date.now() + session.roundDurationSeconds * 1000;
      break;

    case 'pause':
      session.isClockRunning = false;
      session.roundDeadlineTimestamp = null;
      break;

    case 'resume':
      if (session.status !== 'emergency_halt') {
        session.status = 'active';
        session.isClockRunning = true;
        const remaining = Math.max(0, session.roundDurationSeconds - session.roundElapsedSeconds);
        session.roundDeadlineTimestamp = Date.now() + remaining * 1000;
      }
      break;

    case 'extend_round':
      const addSec = extendSeconds || 120; // default 2 minutes
      session.roundDurationSeconds += addSec;
      if (session.roundDeadlineTimestamp) {
        session.roundDeadlineTimestamp += addSec * 1000;
      }
      break;

    case 'set_part':
      if (typeof currentPartIndex === 'number' && currentPartIndex >= 0 && currentPartIndex <= 14) {
        session.currentPartIndex = currentPartIndex;
        session.roundElapsedSeconds = 0;
        session.isClockRunning = true;
        session.roundDeadlineTimestamp = Date.now() + session.roundDurationSeconds * 1000;
      }
      break;

    case 'release_evidence':
      if (releaseEvidenceId && !session.releasedEvidenceIds.includes(releaseEvidenceId)) {
        session.releasedEvidenceIds.push(releaseEvidenceId);
        session.discussionLog.push({
          id: 'ev-msg-' + Date.now(),
          timestamp: Date.now(),
          participantName: 'Facilitator Intelligence',
          roleTitle: 'Exercise Control',
          teamId: 'executive',
          message: `NEW EVIDENCE RELEASED: Evidence Packet "${releaseEvidenceId}" is now unsealed for all teams.`,
          isSystemNotice: true,
        });
      }
      break;

    case 'emergency_halt':
      session.status = 'emergency_halt';
      session.isClockRunning = false;
      session.haltReason = haltReason || 'FACILITATOR INITIATED REAL-WORLD INCIDENT STOP. THIS IS AN EXERCISE STOP.';
      session.discussionLog.push({
        id: 'halt-msg-' + Date.now(),
        timestamp: Date.now(),
        participantName: 'EMERGENCY EXERCISE CONTROLLER',
        roleTitle: 'Host Console',
        teamId: 'executive',
        message: `EMERGENCY EXERCISE HALT: ${session.haltReason}`,
        isSystemNotice: true,
      });
      break;

    case 'reassign_role':
      const { targetRoleId, newParticipantToken } = req.body;
      if (targetRoleId && newParticipantToken) {
        session.claimedRoleTokens[targetRoleId] = newParticipantToken;
        if (session.participants[newParticipantToken]) {
          session.participants[newParticipantToken].roleId = targetRoleId;
        }
      }
      break;

    default:
      break;
  }

  broadcastSessionState(code);
  res.json({ success: true, session });
});

// 12. Evaluator Score Update
app.post('/api/sessions/:code/evaluate', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  const { evaluation } = req.body;
  if (evaluation) {
    session.evaluation = evaluation;
    broadcastSessionState(code);
  }
  res.json({ success: true, evaluation: session.evaluation });
});

// 13. Server-Sent Events (SSE) Stream
app.get('/api/sessions/:code/stream', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).send('Session not found.');
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!sseClients[code]) {
    sseClients[code] = [];
  }
  sseClients[code].push(res);

  // Send initial snapshot
  const initialPayload = JSON.stringify({
    type: 'SESSION_INIT',
    session,
    serverTime: Date.now(),
  });
  res.write(`data: ${initialPayload}\n\n`);

  // Keep-alive heartbeat every 15 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    if (sseClients[code]) {
      sseClients[code] = sseClients[code].filter((c) => c !== res);
    }
  });
});

// ======================== STATIC & DEV MIDDLEWARE ========================

async function startServer() {
  if (process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist'))) {
    // In production, serve built dist files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev, load Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[SyncSim 3D Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
