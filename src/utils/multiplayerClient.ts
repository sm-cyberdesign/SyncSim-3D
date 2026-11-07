/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TabletopSessionState,
  ParticipantSession,
  ActionProposal,
  SubmittedTeamDecision,
  EvaluatorScore,
} from '../types/multiplayer';

const STORAGE_KEY_TOKEN = 'mtf_silent_ledger_player_token';
const STORAGE_KEY_SESSION_CODE = 'mtf_silent_ledger_session_code';

export function getStoredSession(): { token: string | null; code: string | null } {
  try {
    return {
      token: localStorage.getItem(STORAGE_KEY_TOKEN),
      code: localStorage.getItem(STORAGE_KEY_SESSION_CODE),
    };
  } catch {
    return { token: null, code: null };
  }
}

export function saveStoredSession(code: string, token: string) {
  try {
    localStorage.setItem(STORAGE_KEY_SESSION_CODE, code);
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  } catch (err) {
    console.error('Failed to save session to localStorage', err);
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION_CODE);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  } catch (err) {
    console.error('Failed to clear session from localStorage', err);
  }
}

/**
 * Get public reachable mobile URL for QR code
 */
export function getJoinUrl(code: string): string {
  // Check if we are running in an environment with specific hostname
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If running in localhost or dev, construct URL
    return `${origin}/?join=${encodeURIComponent(code)}&view=participant`;
  }
  return `https://ais-dev-6ee4de7no7farxd64nzjvk-751923427782.us-east1.run.app/?join=${encodeURIComponent(code)}&view=participant`;
}

// REST Client functions
export async function createSessionApi(customCode?: string, roundDurationMinutes = 10): Promise<{ code: string; hostToken: string; session: TabletopSessionState }> {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customCode, roundDurationMinutes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create session' }));
    throw new Error(err.error || 'Failed to create session');
  }
  return res.json();
}

export async function getSessionApi(code: string): Promise<{ session: TabletopSessionState; serverTime: number }> {
  const res = await fetch(`/api/sessions/${encodeURIComponent(code)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to load session' }));
    throw new Error(err.error || 'Failed to load session');
  }
  return res.json();
}

export async function joinSessionRoleApi(
  code: string,
  displayName: string,
  roleId: string,
  existingToken?: string
): Promise<{ success: boolean; token: string; participant: ParticipantSession; session: TabletopSessionState }> {
  const res = await fetch(`/api/sessions/${encodeURIComponent(code)}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName, roleId, existingToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to join role' }));
    throw new Error(err.error || 'Failed to join role');
  }
  const data = await res.json();
  if (data.token) {
    saveStoredSession(code, data.token);
  }
  return data;
}

export async function leaveSessionRoleApi(code: string, token: string): Promise<boolean> {
  const res = await fetch(`/api/sessions/${encodeURIComponent(code)}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  clearStoredSession();
  return res.ok;
}

export async function pingSessionApi(code: string, token: string): Promise<void> {
  await fetch(`/api/sessions/${encodeURIComponent(code)}/ping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  }).catch(() => {});
}

export async function proposeActionApi(
  code: string,
  token: string,
  payload: {
    partId: string;
    optionId?: string;
    customActionText: string;
    rationale: string;
    citedEvidenceIds: string[];
  }
): Promise<{ success: boolean; proposal: ActionProposal; session: TabletopSessionState }> {
  const res = await fetch(`/api/sessions/${encodeURIComponent(code)}/propose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...payload }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to propose action' }));
    throw new Error(err.error || 'Failed to propose action');
  }
  return res.json();
}

export async function upvoteProposalApi(code: string, token: string, proposalId: string): Promise<number> {
  const res = await fetch(`/api/sessions/${encodeURIComponent(code)}/upvote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, proposalId }),
  });
  const data = await res.json();
  return data.upvotes || 0;
}

export async function submitTeamDecisionApi(
  code: string,
  token: string,
  payload: {
    partId: string;
    optionId: string;
    actionSummary: string;
    rationale: string;
    tierImpactNotes: string;
  }
): Promise<{ success: boolean; decision: SubmittedTeamDecision; session: TabletopSessionState }> {
  const res = await fetch(`/api/sessions/${encodeURIComponent(code)}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...payload }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to submit decision' }));
    throw new Error(err.error || 'Failed to submit decision');
  }
  return res.json();
}

export async function crossTeamApproveApi(
  code: string,
  token: string,
  payload: {
    partId: string;
    roleId: string;
    status: 'approved' | 'rejected';
    comments?: string;
  }
): Promise<{ success: boolean; session: TabletopSessionState }> {
  const res = await fetch(`/api/sessions/${encodeURIComponent(code)}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...payload }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to process approval' }));
    throw new Error(err.error || 'Failed to process approval');
  }
  return res.json();
}

export async function postChatMessageApi(code: string, token: string, message: string): Promise<void> {
  await fetch(`/api/sessions/${encodeURIComponent(code)}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, message }),
  });
}

export async function hostControlApi(
  code: string,
  action: string,
  params: Record<string, any> = {}
): Promise<{ success: boolean; session: TabletopSessionState }> {
  const res = await fetch(`/api/sessions/${encodeURIComponent(code)}/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to execute host control' }));
    throw new Error(err.error || 'Failed to execute host control');
  }
  return res.json();
}

export async function evaluateSessionApi(
  code: string,
  evaluation: EvaluatorScore
): Promise<{ success: boolean; evaluation: EvaluatorScore }> {
  const res = await fetch(`/api/sessions/${encodeURIComponent(code)}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evaluation }),
  });
  return res.json();
}

/**
 * Server-Sent Events (SSE) Stream Subscriber with automatic retry and polling fallback
 */
export function subscribeToSession(
  code: string,
  onUpdate: (session: TabletopSessionState) => void,
  onError?: (err: any) => void
): () => void {
  let eventSource: EventSource | null = null;
  let isClosed = false;
  let pollInterval: any = null;

  function connect() {
    if (isClosed) return;
    try {
      eventSource = new EventSource(`/api/sessions/${encodeURIComponent(code)}/stream`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.session) {
            onUpdate(data.session);
          }
        } catch {
          // ignore parsing error
        }
      };

      eventSource.onerror = (err) => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (onError) onError(err);

        // Fallback to light polling if SSE disconnects temporarily
        if (!pollInterval && !isClosed) {
          pollInterval = setInterval(async () => {
            try {
              const res = await getSessionApi(code);
              onUpdate(res.session);
            } catch {
              // ignore
            }
          }, 4000);
        }

        // Try to re-establish SSE in 5 seconds
        setTimeout(() => {
          if (!isClosed) {
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
            connect();
          }
        }, 5000);
      };
    } catch (e) {
      if (onError) onError(e);
    }
  }

  connect();

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };
}
