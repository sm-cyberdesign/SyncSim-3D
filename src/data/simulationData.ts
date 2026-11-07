/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OrgLevelInfo,
  SimulationParameters,
  HistoricalSnapshot,
  Collaborator,
  SpatialAnnotation,
  ParameterProposal,
  CinematicStep,
} from '../types/simulation';

import { MERIDIAN_ORG_LEVELS } from './silentLedgerScenario';

export const INITIAL_PARAMETERS: SimulationParameters = {
  workloadDemand: 100, // 100% nominal banking transaction volume
  automationRate: 65, // 65% automated Tier 1 containment coverage
  crossDeptLatency: 1.2, // 1.2x cross-tier crisis escalation factor
  incidentRate: 4.2, // 4.2% anomalous request/threat score rate
  rdBudgetMultiplier: 1.5, // 1.5x resilience & security capital buffer
  talentDensity: 100, // 100% SOC & Incident Command staffing capacity
};

export const ORG_LEVELS: OrgLevelInfo[] = MERIDIAN_ORG_LEVELS;

export const HISTORICAL_SNAPSHOTS: HistoricalSnapshot[] = [
  {
    id: 'snap-silent-ledger-baseline',
    title: 'Operation Silent Ledger — Nominal Day-0 Baseline',
    date: 'Oct 23, 2026',
    description:
      'Nominal operational state prior to Apex Managed Services compromise. Core ledger processing 18,400 Tx/s with zero critical anomalies.',
    durationSeconds: 180,
    parameters: {
      workloadDemand: 100,
      automationRate: 70,
      crossDeptLatency: 1.0,
      incidentRate: 1.2,
      rdBudgetMultiplier: 1.5,
      talentDensity: 105,
    },
    avgEfficiency: 95.8,
    peakThroughput: 19800,
    incidentCount: 0,
    summaryHighlights: [
      'Normal nocturnal batch completion across all 185 branches',
      'Fedwire/ACH gateway latency nominal at 14ms',
      'Immutable WORM backup snapshots verified clean with daily cryptographic hashes',
    ],
    telemetryHistory: Array.from({ length: 24 }).map((_, i) => ({
      timestamp: i * 3,
      systemThroughput: 18200 + Math.sin(i * 0.4) * 800,
      efficiencyIndex: 96 + Math.cos(i * 0.3) * 1.5,
      cycleTimeHours: 0.8,
      errorRatePercent: 0.4 + Math.sin(i * 0.2) * 0.1,
      activePackets: 45,
      revenuePerMin: 32000 + i * 400,
    })),
  },
  {
    id: 'snap-previous-tabletop-q2',
    title: 'Q2 2026 Executive Tabletop — Branch Edge Ransomware Drill',
    date: 'May 14, 2026',
    description:
      'Prior simulated ransomware exercise testing retail branch network offline survivability and manual cash receipt procedures.',
    durationSeconds: 120,
    parameters: {
      workloadDemand: 125,
      automationRate: 55,
      crossDeptLatency: 1.8,
      incidentRate: 6.8,
      rdBudgetMultiplier: 1.2,
      talentDensity: 90,
    },
    avgEfficiency: 82.4,
    peakThroughput: 14200,
    incidentCount: 4,
    summaryHighlights: [
      'Branch cash drawer offline limits enforced at $2,500',
      'Tested cellular 5G backup for teller balance inquiries',
      'Identified dependency on third-party vendor single-sign-on tokens',
    ],
    telemetryHistory: Array.from({ length: 24 }).map((_, i) => ({
      timestamp: i * 3,
      systemThroughput: 13500 + Math.sin(i * 0.5) * 600,
      efficiencyIndex: 82 + Math.cos(i * 0.4) * 3,
      cycleTimeHours: 1.6,
      errorRatePercent: 4.8 + Math.cos(i) * 0.5,
      activePackets: 68,
      revenuePerMin: 22000 + i * 300,
    })),
  },
];

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 'lead-incident-commander',
    name: 'You (Incident Commander)',
    role: 'Cyber Incident Command Lead',
    avatarColor: '#06b6d4',
    status: 'active',
    currentFocusLevel: 3,
    cursorPos: [0, 7.2, 0],
  },
  {
    id: 'ciso-meridian',
    name: 'Sarah Chen, CISO',
    role: 'Chief Information Security Officer',
    avatarColor: '#f59e0b',
    status: 'active',
    currentFocusLevel: 3,
    cursorPos: [-3.4, 7.2, 1.8],
  },
  {
    id: 'cro-governance',
    name: 'Marcus Vance, CRO',
    role: 'Chief Risk Officer & Legal Counsel',
    avatarColor: '#10b981',
    status: 'editing',
    currentFocusLevel: 4,
    cursorPos: [-3.2, 11.5, -2.2],
  },
  {
    id: 'head-banking-infra',
    name: 'Elena Rostova, VP Core Infra',
    role: 'Head of Core Banking & Backups',
    avatarColor: '#ec4899',
    status: 'active',
    currentFocusLevel: 2,
    cursorPos: [0, 3.6, 3.6],
  },
];

export const INITIAL_ANNOTATIONS: SpatialAnnotation[] = [
  {
    id: 'annot-1',
    authorId: 'ciso-meridian',
    authorName: 'Sarah Chen, CISO',
    levelId: 2,
    position: [3.8, 4.2, 1.8],
    content: 'CRITICAL CONDUIT: Apex VPN tunnel ingress isolated. All external sessions severed pending forensic triage.',
    createdAt: '12m ago',
    votes: 4,
  },
  {
    id: 'annot-2',
    authorId: 'head-banking-infra',
    authorName: 'Elena Rostova, VP Core Infra',
    levelId: 2,
    position: [0, 4.2, 3.6],
    content: 'IMMUTABLE VAULT: Dell PowerStore WORM snapshot verified clean. Clean-room recovery ready for execution.',
    createdAt: '8m ago',
    votes: 6,
  },
  {
    id: 'annot-3',
    authorId: 'cro-governance',
    authorName: 'Marcus Vance, CRO',
    levelId: 4,
    position: [-3.2, 12.2, -2.2],
    content: 'REGULATORY DEADLINE: NYDFS 72h notification draft sealed for submission. SEC 8-K Item 1.05 evaluation active.',
    createdAt: '4m ago',
    votes: 5,
  },
];

export const INITIAL_PROPOSALS: ParameterProposal[] = [
  {
    id: 'prop-1',
    proposerName: 'Sarah Chen, CISO',
    title: 'Enforce Global Tier 1 Automation & Micro-Segmentation',
    description:
      'Elevate Sentinel automated containment parameters to 85% to immediately revoke rogue sessions, while preserving human gating for Tier 2/3 core database isolation.',
    changes: {
      automationRate: 85,
      crossDeptLatency: 1.1,
    },
    votesYes: 3,
    votesNo: 0,
    hasUserVoted: false,
  },
  {
    id: 'prop-2',
    proposerName: 'Elena Rostova, VP Core Infra',
    title: 'Air-Gapped Immutable Backup Re-validation Window',
    description:
      'Authorize 6-hour clean-room transaction journal reconciliation window to ensure zero malware residue in production restore.',
    changes: {
      workloadDemand: 80,
      incidentRate: 1.5,
    },
    votesYes: 2,
    votesNo: 1,
    hasUserVoted: false,
  },
];

export const CINEMATIC_STEPS: CinematicStep[] = [
  {
    id: 1,
    title: 'Module 1: Infiltration & Vendor Compromise',
    phase: 'Module 1: Supply Chain Infiltration',
    focusLevel: 2, // Tier 2 Banking Infra & Vendor Conduits
    cameraPosition: [12, 6.5, -9],
    cameraTarget: [0, 3.6, 0],
    narration:
      'At 02:14 EDT on Day 1, threat actor GLASS HERON compromises credentials of Apex Managed Services, breaching Meridian Trust Financial’s perimeter over the vendor IPsec VPN tunnel into Tier 2 infrastructure.',
    durationMs: 9500,
  },
  {
    id: 2,
    title: 'Module 2: SOC Correlation & Sentinel Telemetry',
    phase: 'Module 2: Detection & Automated Containment',
    focusLevel: 3, // Tier 3 SOC & Identity
    cameraPosition: [-11, 10, 11],
    cameraTarget: [0, 7.2, 0],
    narration:
      'In Tier 3 Security Operations, SENTINEL correlates anomalous Kerberos ticket creation and bulk database staging. SENTINEL automatically triggers Tier 1 session revocation, but enforces mandatory human authorization for Tier 2 and Tier 3 network isolation.',
    durationMs: 10000,
  },
  {
    id: 3,
    title: 'Module 3: Payment Lock & Branch ATM Outages',
    phase: 'Module 3: Disruption & Customer Impact',
    focusLevel: 1, // Tier 1 Customers & Branches
    cameraPosition: [-13, 4, -10],
    cameraTarget: [0, 0.5, 0],
    narration:
      'By Day 2, interbank Fedwire queues freeze $820 million in commercial payroll, and 420 ATM terminals across 185 branches lose connection. Retail customer queues form on city streets as viral rumors threaten a deposit run.',
    durationMs: 10500,
  },
  {
    id: 4,
    title: 'Module 3: Extortion Demand & Boardroom Crisis',
    phase: 'Module 3: Governance & Sanctions Dilemma',
    focusLevel: 4, // Tier 4 Executive Boardroom
    cameraPosition: [10, 15, 12],
    cameraTarget: [0, 11.5, 0],
    narration:
      'In Tier 4 Boardroom Governance, GLASS HERON demands a $15 million cryptocurrency ransom, threatening to leak 450 gigabytes of customer financial data. The Board deliberates OFAC sanctions laws and rejects extortion payment.',
    durationMs: 10000,
  },
  {
    id: 5,
    title: 'Module 4: Immutable Vault Clean-Room Restore',
    phase: 'Module 4: Recovery & Physical Cash Logistics',
    focusLevel: 2, // Tier 2 Backups & Infra
    cameraPosition: [10, 6, 8],
    cameraTarget: [0, 3.6, 0],
    narration:
      'On Day 3, IT engineers reject tampered online backups and authorize restoration from the air-gapped immutable WORM vault, while armored carrier convoys dispatch $45 million in Federal Reserve currency to replenish branches.',
    durationMs: 10500,
  },
  {
    id: 6,
    title: 'Module 4: Enterprise Eradication & SEC/NYDFS Disclosure',
    phase: 'Module 4: Eradication & Regulatory Accountability',
    focusLevel: 0, // Wide overview
    cameraPosition: [18, 14, 22],
    cameraTarget: [0, 6, 0],
    narration:
      'SENTINEL coordinates a domain-wide Kerberos double reset to purge all adversary persistence. Meridian Trust Financial finalizes SEC Form 8-K and NYDFS filings on time, approving an $18 million zero-trust architecture overhaul.',
    durationMs: 11000,
  },
];

export const LIVE_EVENTS_SEQUENCE = [
  {
    progressMin: 0.0,
    progressMax: 0.22,
    activeLevelId: 2,
    levelStatus: 'Vendor IT Compromise & Lateral Movement Active',
    levelStatusBadge: 'SUPPLY CHAIN INTRUSION',
    badgeColor: '#e11d48',
    departmentActions: {
      'dept-infra-vendor': 'Apex VPN IPsec session active from rogue ASN',
      'dept-infra-ledger': 'Bulk SELECT queries staging 450GB client data',
      'dept-infra-vault': 'Air-gapped WORM vault isolated and safe',
    },
    conduitLabel: 'Adversary Probing Core Banking Conduits ▾',
    voicePhrase: 'Threat actor GLASS HERON has compromised Apex vendor credentials, establishing an unauthorized foothold into Tier 2 banking infrastructure.',
    calmVoicePhrase: 'Initial intrusion indicators isolated to vendor ingress pool. Forensic shadow monitoring tracking adversary lateral movement.',
    urgentVoicePhrase: 'Critical security alert! Apex vendor VPN compromised! Unauthorized data staging underway in core database cluster!',
    energizedVoicePhrase: 'Incident Command mobilized! Rapid threat hunting isolating compromised jump hosts and preserving forensic memory dumps!',
  },
  {
    progressMin: 0.22,
    progressMax: 0.48,
    activeLevelId: 3,
    levelStatus: 'Sentinel Automated Tier 1 Containment & Gated Tier 2/3',
    levelStatusBadge: 'SENTINEL ESCALATION',
    badgeColor: '#06b6d4',
    departmentActions: {
      'dept-soc-sentinel': 'Revoked 14 perimeter session tokens automatically',
      'dept-soc-iam': 'Active Directory shadow account svc-core-sync9 quarantined',
      'dept-soc-csirt': 'Forensic memory capture underway on MTF-JUMP-04',
    },
    conduitLabel: 'Sentinel Automated Rules Propagating ▾',
    voicePhrase: 'SENTINEL correlated the multi-stage attack and terminated active session tokens, awaiting human authorization for core database isolation.',
    calmVoicePhrase: 'Sentinel automated correlation is operating steadily. Fourteen threat tokens revoked with no collateral impact on banking transactions.',
    urgentVoicePhrase: 'Priority-1 escalation in SOC! Shadow domain admin account detected! Human Incident Commander authorization urgently required for Tier 2 network isolation!',
    energizedVoicePhrase: 'Sentinel correlation engine operating at peak efficiency! Multi-vector threat signatures synthesized and locked in real time!',
  },
  {
    progressMin: 0.48,
    progressMax: 0.72,
    activeLevelId: 1,
    levelStatus: 'Payment Queue Lock & Branch Cash Logistics',
    levelStatusBadge: 'CUSTOMER IMPACT',
    badgeColor: '#f43f5e',
    departmentActions: {
      'dept-retail-branches': 'Armored convoys dispatching $45M in cash to 185 branches',
      'dept-retail-atm': '378 ATMs recovering connection via cellular failover',
      'dept-retail-treasury': 'Secondary out-of-band rail verifying $820M payroll wires',
    },
    conduitLabel: 'Restoring Branch & Cash Delivery Rails ▴',
    voicePhrase: 'Interbank payment locks and ATM outages trigger retail customer queues; armored carrier convoys deploy emergency cash replenishment.',
    calmVoicePhrase: 'Branch cash rationing and transparent communications have stabilized waiting queues while payment rails undergo verification.',
    urgentVoicePhrase: 'Field alert! ATM fleet outages causing widespread customer anxiety! Cash replenishment convoys rolling to metropolitan branches!',
    energizedVoicePhrase: 'Treasury operations successfully routing high-value corporate payroll over authenticated secondary clearing channels!',
  },
  {
    progressMin: 0.72,
    progressMax: 0.92,
    activeLevelId: 4,
    levelStatus: 'Extortion Rejection & Regulatory 72h Clock Compliance',
    levelStatusBadge: 'CRISIS GOVERNANCE',
    badgeColor: '#f59e0b',
    departmentActions: {
      'dept-exec-board': 'Board unanimously rejected $15M crypto ransom demand',
      'dept-exec-legal': 'NYDFS 72h notification and SEC Form 8-K drafts approved',
      'dept-exec-compass': 'Compass fallback verbal briefings operating cleanly',
    },
    conduitLabel: 'Board Directives Cascading Across Tiers ▾',
    voicePhrase: 'The Executive Board rejected the fifteen million dollar extortion demand, notifying federal authorities and meeting statutory regulatory deadlines.',
    calmVoicePhrase: 'Boardroom governance remains steady and resolute. Legal counsel confirms compliance with NYDFS and SEC statutory notification requirements.',
    urgentVoicePhrase: 'Boardroom emergency! Extortion deadline ticking! Executive Crisis Team coordinating with Federal Reserve and law enforcement!',
    energizedVoicePhrase: 'Decisive leadership in the boardroom! Zero extortion concessions granted and enterprise resilience mandate approved!',
  },
  {
    progressMin: 0.92,
    progressMax: 1.0,
    activeLevelId: 0,
    levelStatus: 'Clean-Room Restoration & Enterprise Zero-Trust Overhaul',
    levelStatusBadge: 'RECOVERY COMPLETE',
    badgeColor: '#10b981',
    departmentActions: {
      'dept-exec-board': 'Approved $18M zero-trust architecture overhaul',
      'dept-soc-sentinel': 'EDR baseline verified across 3,420 endpoints',
      'dept-infra-ledger': 'Core banking ledger restored from immutable vault',
    },
    conduitLabel: 'Operation Silent Ledger Completed - All Tiers Resilient ▴',
    voicePhrase: 'Operation Silent Ledger exercise concluded. Meridian Trust Financial restored operations from immutable vaults with zero ransom paid.',
    calmVoicePhrase: 'Exercise complete. Systems restored cleanly from air-gapped repositories, and regulatory filings successfully finalized.',
    urgentVoicePhrase: 'Post-incident review underway! Remediation plan mandated to eliminate third-party vendor single points of failure!',
    energizedVoicePhrase: 'Tabletop exercise triumph! Meridian Trust demonstrated total crisis containment, preserving capital and customer trust!',
  },
];
