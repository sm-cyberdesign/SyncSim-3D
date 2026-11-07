# SyncSim 3D — Operation Silent Ledger

**Multiplayer 3D Cybersecurity Tabletop Exercise & Presentation Platform**  
*Simulated Entity: Meridian Trust Financial*

---

## Executive Overview

**SyncSim 3D — Operation Silent Ledger** transforms complex enterprise cybersecurity incident response into a gamified, role-based tabletop exercise from a CISO's perspective, coupled with a 3D command-center projector display. 

Participants scan a QR code with their mobile phone, join an exercise session, select an available human role in one of three cooperating teams, and work together through automatically timed incident rounds.

---

## The Three Cooperating Human Teams

Participants collaborate as a single financial institution—**Meridian Trust Financial**—divided into three specialized operational bodies:

### 1. Executive Crisis Team (`#7C3AED`, Purple, Crown)
- **Scope:** Governance, board oversight, regulatory disclosures (NYDFS 500, SEC Form 8-K), and enterprise liquidity.
- **Roles:**
  - **Incident Commander / Deputy CISO:** Overall incident strategy, executive containment orders, escalating response posture.
  - **Chief Executive Officer (CEO):** Enterprise liability, regulatory notification sign-off, Board communications, extortion stance.
  - **Chief Financial Officer (CFO):** Liquidity preservation, Fed discount window invocation, wire authorization limits.
  - **General Counsel / Chief Legal Officer:** Legal privilege enforcement, regulatory deadlines (NYDFS 72h, SEC 4-day, GDPR).

### 2. Technical Response Team (`#2563EB`, Blue, Shield)
- **Scope:** SOC triage, threat containment, credential revocation, forensic log preservation, and clean-room recovery.
- **Roles:**
  - **Incident Response Lead:** Containment playbooks, network isolation, credential invalidation.
  - **Senior SOC Analyst:** Alert correlation, Sentinel AI analysis, SIEM queries, NetFlow extraction.
  - **Identity & Cloud Infrastructure Lead:** Active Directory reset, Okta token revocation, PAM vaults, privileged service credentials.
  - **Core Banking & Recovery Lead:** Mainframe restoration, immutable air-gapped snapshots, tape archive validation.

### 3. Business & Communications Team (`#0F766E`, Teal, Users)
- **Scope:** Payment pipelines, branch operations, cash replenishment, customer advisories, and media briefings.
- **Roles:**
  - **Payments & Treasury Operations Manager:** Fedwire, ACH settlement pipelines, SWIFT messaging, liquidity thresholds.
  - **Customer & Branch Operations Director:** Retail branch network, cash caps ($500/day emergency limits), call center truth sheets.
  - **Strategic Communications Lead:** Customer advisories, press briefings, leak rebuttal, social sentiment management.
  - **Crisis Management Coordinator (Scribe):** Exercise chronolog, cross-team decision records, audit preservation.

---

## Simulated AI Characters (Strictly Non-Selectable)

All three AI characters are explicitly labeled `[Scripted Simulation Content]` and **cannot be selected as player roles**:

1. **RAVEN (Adversary AI — Glass Heron):**
   - Facilitator-only visibility in default play. Players only observe suspected anomaly signatures.
2. **SENTINEL (SOC Correlation AI):**
   - Correlates multi-source telemetry. Tier 1 automated actions (token revocation) vs Tier 2/3 human-gated actions (network shutdown, Kerberos resets).
3. **COMPASS (Executive Advisor AI):**
   - Advises leadership using operational ticket feeds. Models stale-information failure during heavy ticket backlog, forcing direct verbal briefings.

---

## Three Connected Interfaces

1. **Shared 3D Display (`?view=shared_3d`):**
   - High-impact 3D visualization for command-center projectors or large monitors.
   - 4-Tier infrastructure highlighting based on active inject.
   - Synchronized round clock, active inject summary, and 3-team consensus badges.
   - Quick QR Code modal for room onboarding.
   - Accessible Non-3D Text Alternative view.

2. **Host / Facilitator Console (`?view=host`):**
   - Create sessions with custom codes (e.g. `SL-SILENT`).
   - Manage team roster and atomic role reservations.
   - Start, pause, resume, extend round (+2m), and emergency halt ("THIS IS AN EXERCISE STOP").
   - Evidence manager: unseal technical artifacts to players on demand.
   - Confidential intelligence: adversary strategy, deliberate table traps, and probing questions.
   - Evaluator rubric: score teams across Operational Continuity, Regulatory Compliance, Customer Trust, and Financial Prudence, with downloadable After-Action Review (AAR) reports.

3. **Mobile Participant Interface (`?view=participant`):**
   - Mobile-first web application accessible directly by scanning the join QR code.
   - Live atomic role claim prevention (no duplicate role ownership).
   - Synchronized round timer and inject briefing.
   - Role-tailored evidence locker with unsealed forensic artifacts.
   - Action proposal and peer upvoting.
   - Official team decision submission by authorized roles.
   - Cross-team approval requests (e.g., Legal Counsel sign-off on regulatory notice, CFO on wire freeze).
   - Real-time table feed and discussion chronolog.

---

## Server Architecture & Real-Time Sync

- **Server-Authoritative Express Backend:** Runs on port 3000 alongside Vite dev middleware in dev mode (`tsx server.ts`).
- **Real-Time Server-Sent Events (SSE):** Push instant state updates to all connected phones, host consoles, and 3D projector displays with automatic reconnect and keep-alive heartbeats.
- **Atomic Role Reservations:** Server validates role availability atomically upon request; claims are tied to secure participant tokens.
- **Reconnection Handling:** Players reconnect using their stored session token and automatically resume their role and pending actions.
- **Idempotent Decision Submissions:** Guards against duplicate commits or race conditions during tense decision rounds.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start full-stack development server on port 3000
npm run dev

# Run TypeScript linter
npm run lint

# Production build
npm run build
```

Open `http://localhost:3000` to view the Shared 3D Display, or navigate to `http://localhost:3000/?view=host` for Facilitator controls and `http://localhost:3000/?view=participant` for mobile player views.
