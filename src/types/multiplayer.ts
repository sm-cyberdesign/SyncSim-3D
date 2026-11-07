/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TeamId = 'executive' | 'technical' | 'business';

export interface HumanRoleDefinition {
  id: string;
  teamId: TeamId;
  title: string;
  callsign: string;
  seniority: 'Executive' | 'Lead' | 'Analyst' | 'Operations';
  decisionAuthority: 'Primary Decision Maker' | 'Cross-Team Approver' | 'Advisory & Proposer' | 'Scribe & Observer';
  authorityScope: string;
  responsibilities: string[];
  keyActions: string[];
  requiredForSession: boolean;
}

export interface TeamDefinition {
  id: TeamId;
  name: string;
  subtitle: string;
  color: string; // hex
  tailwindColor: string;
  iconName: 'Crown' | 'Shield' | 'Users';
  focus: string;
  tierId: number;
  roles: HumanRoleDefinition[];
}

export interface ParticipantSession {
  token: string;
  displayName: string;
  roleId: string;
  teamId: TeamId;
  joinedAt: number;
  lastPing: number;
  isOnline: boolean;
}

export interface ActionProposal {
  id: string;
  partId: string;
  participantToken: string;
  participantName: string;
  roleId: string;
  teamId: TeamId;
  optionId?: string;
  customActionText: string;
  rationale: string;
  citedEvidenceIds: string[];
  proposedAt: number;
  upvotes: string[]; // tokens of participants who upvoted
}

export interface CrossTeamApproval {
  requiredRoleId: string;
  requiredRoleName: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedByToken?: string;
  comments?: string;
  timestamp?: number;
}

export interface SubmittedTeamDecision {
  partId: string;
  optionId: string;
  actionSummary: string;
  rationale: string;
  submittedByToken: string;
  submittedByRole: string;
  submittedByName: string;
  submittedAt: number;
  tierImpactNotes: string;
  crossTeamApprovals: CrossTeamApproval[];
  isLocked: boolean;
}

export interface EvaluatorScore {
  operationalContinuity: number; // 0 - 25
  regulatoryCompliance: number; // 0 - 25
  customerTrust: number; // 0 - 25
  financialPrudence: number; // 0 - 25
  evaluatorNotes: string;
  awardedBadges: string[];
}

export interface TabletopSessionState {
  code: string; // e.g. "SL-4089"
  createdAt: number;
  hostToken: string;
  status: 'lobby' | 'briefing' | 'active' | 'paused' | 'emergency_halt' | 'completed';
  haltReason?: string;
  
  // Exercise Progress
  currentPartIndex: number; // 0 to 14
  roundDurationSeconds: number; // default 600 (10 min)
  roundElapsedSeconds: number;
  totalElapsedSeconds: number;
  isClockRunning: boolean;
  roundDeadlineTimestamp: number | null; // server timestamp for sync
  
  // Participants & Roles
  participants: Record<string, ParticipantSession>; // keyed by token
  claimedRoleTokens: Record<string, string>; // roleId -> participantToken
  
  // Evidence & Releases
  releasedEvidenceIds: string[];
  
  // Proposals & Decisions
  proposals: ActionProposal[];
  decisions: Record<string, SubmittedTeamDecision>; // keyed by partId
  
  // Chat / Discussion Log
  discussionLog: {
    id: string;
    timestamp: number;
    participantName: string;
    roleTitle: string;
    teamId: TeamId;
    message: string;
    isSystemNotice?: boolean;
  }[];
  
  // Evaluator Scores
  evaluation?: EvaluatorScore;
}

export const EXERCISE_TEAMS: Record<TeamId, TeamDefinition> = {
  executive: {
    id: 'executive',
    name: 'Executive Crisis Team',
    subtitle: 'Governance, Board Reporting & Strategic Continuity',
    color: '#7C3AED',
    tailwindColor: 'purple',
    iconName: 'Crown',
    focus: 'Crisis management, legal disclosures, board oversight, regulatory reporting (NYDFS/SEC).',
    tierId: 1,
    roles: [
      {
        id: 'role_incident_commander',
        teamId: 'executive',
        title: 'Incident Commander / Deputy CISO',
        callsign: 'COMMANDER-1',
        seniority: 'Executive',
        decisionAuthority: 'Primary Decision Maker',
        authorityScope: 'Overall incident strategy, executive containment orders, escalating response posture.',
        responsibilities: [
          'Direct the unified tabletop crisis team and synchronize cross-team operations.',
          'Authorize system shutdowns, network isolations, and public statement release.',
          'Manage escalation to Executive Committee, Board of Directors, and Regulators.',
        ],
        keyActions: ['Declare Major Incident', 'Authorize Full Network Severance', 'Approve Public Disclosures'],
        requiredForSession: true,
      },
      {
        id: 'role_ceo',
        teamId: 'executive',
        title: 'Chief Executive Officer (CEO)',
        callsign: 'CHIEF-EXEC',
        seniority: 'Executive',
        decisionAuthority: 'Cross-Team Approver',
        authorityScope: 'Enterprise liability, regulatory notification sign-off, Board communication.',
        responsibilities: [
          'Protect enterprise shareholder trust, customer franchise, and brand integrity.',
          'Review and approve high-impact public advisories and material breach disclosures.',
          'Evaluate extortion payment stance and corporate continuity policies.',
        ],
        keyActions: ['Approve Regulatory Breach Filing', 'Sanction Ransom Stance', 'Address Board of Directors'],
        requiredForSession: true,
      },
      {
        id: 'role_cfo',
        teamId: 'executive',
        title: 'Chief Financial Officer (CFO)',
        callsign: 'FIN-CHIEF',
        seniority: 'Executive',
        decisionAuthority: 'Cross-Team Approver',
        authorityScope: 'Liquidity preservation, Fed discount window invocation, wire authorization limits.',
        responsibilities: [
          'Monitor real-time intraday liquidity balances and Federal Reserve reserve ratios.',
          'Authorize emergency funding facilities and third-party forensic expenditure.',
          'Approve or veto halting core payment processing pipes.',
        ],
        keyActions: ['Invoke Fed Discount Window', 'Approve Forensic Retention Budget', 'Halt Interbank Wires'],
        requiredForSession: false,
      },
      {
        id: 'role_general_counsel',
        teamId: 'executive',
        title: 'General Counsel / Chief Legal Officer',
        callsign: 'LEGAL-1',
        seniority: 'Executive',
        decisionAuthority: 'Cross-Team Approver',
        authorityScope: 'Legal privilege enforcement, regulatory deadlines (NYDFS 72h, SEC 4-day, GDPR).',
        responsibilities: [
          'Establish attorney-client privilege over forensic investigations and logs.',
          'Determine materiality thresholds under SEC Form 8-K disclosure rules.',
          'Evaluate third-party vendor contract liability and indemnification terms.',
        ],
        keyActions: ['Assert Legal Privilege', 'Approve SEC 8-K Notice', 'Review Extortion Sanctions Risk (OFAC)'],
        requiredForSession: true,
      },
    ],
  },
  technical: {
    id: 'technical',
    name: 'Technical Response Team',
    subtitle: 'SOC, Forensics, Identity & Core Infrastructure',
    color: '#2563EB',
    tailwindColor: 'blue',
    iconName: 'Shield',
    focus: 'Detection, threat containment, credential revocation, immutable backup recovery.',
    tierId: 2,
    roles: [
      {
        id: 'role_ir_lead',
        teamId: 'technical',
        title: 'Incident Response Lead',
        callsign: 'IR-ALPHA',
        seniority: 'Lead',
        decisionAuthority: 'Primary Decision Maker',
        authorityScope: 'Technical containment, forensic evidence preservation, threat actor eradication.',
        responsibilities: [
          'Formulate containment playbook and execute host/segment isolation.',
          'Direct forensic artifact capture and validate indicators of compromise (IoCs).',
          'Coordinate Tier 2 & 3 remediation with Identity and Core Banking teams.',
        ],
        keyActions: ['Isolate Compromised Segments', 'Revoke Compromised Credentials', 'Preserve Disk Images'],
        requiredForSession: true,
      },
      {
        id: 'role_soc_analyst',
        teamId: 'technical',
        title: 'Senior SOC Analyst',
        callsign: 'SOC-SENTINEL',
        seniority: 'Analyst',
        decisionAuthority: 'Advisory & Proposer',
        authorityScope: 'Telemetry analysis, alert triage, Sentinel AI verification, SIEM queries.',
        responsibilities: [
          'Correlate Sentinel alert feeds with raw NetFlow and EDR telemetry.',
          'Detect adversary evasion techniques and identify lateral movement paths.',
          'Review Sentinel automated Tier 1 actions and recommend human Tier 2 escalations.',
        ],
        keyActions: ['Query NetFlow Logs', 'Review Sentinel Recommendations', 'Draft Technical Evidence Packets'],
        requiredForSession: true,
      },
      {
        id: 'role_identity_lead',
        teamId: 'technical',
        title: 'Identity & Cloud Infrastructure Lead',
        callsign: 'IAM-SHIELD',
        seniority: 'Lead',
        decisionAuthority: 'Cross-Team Approver',
        authorityScope: 'Active Directory, Okta IdP, PAM vaults, privileged service credentials.',
        responsibilities: [
          'Execute enterprise-wide password resets and invalidate active Kerberos tickets.',
          'Enforce strict MFA conditional access and revoke stolen service account tokens.',
          'Harden cloud IAM policies and restrict vendor privileged access conduits.',
        ],
        keyActions: ['Purge Stolen Admin Tokens', 'Reset Kerberos Golden Ticket', 'Enforce Break-Glass Access'],
        requiredForSession: false,
      },
      {
        id: 'role_recovery_lead',
        teamId: 'technical',
        title: 'Core Banking & Recovery Lead',
        callsign: 'RECOVERY-1',
        seniority: 'Lead',
        decisionAuthority: 'Primary Decision Maker',
        authorityScope: 'Mainframe restoration, immutable air-gapped snapshots, tape archive validation.',
        responsibilities: [
          'Verify integrity of immutable write-once (WORM) offline backups.',
          'Orchestrate bare-metal recovery sequences in isolated cleanroom environments.',
          'Prevent malware re-infection during transactional database restoration.',
        ],
        keyActions: ['Mount Air-Gapped Snapshots', 'Validate Cleanroom Environment', 'Initiate Ledger Replay'],
        requiredForSession: false,
      },
    ],
  },
  business: {
    id: 'business',
    name: 'Business & Communications Team',
    subtitle: 'Payments, Customer Operations, Branch Continuity & PR',
    color: '#0F766E',
    tailwindColor: 'teal',
    iconName: 'Users',
    focus: 'Payment settlements, wire clearing, branch branch readiness, customer communications, media relations.',
    tierId: 4,
    roles: [
      {
        id: 'role_payments_ops',
        teamId: 'business',
        title: 'Payments & Treasury Operations Manager',
        callsign: 'PAYMENTS-1',
        seniority: 'Lead',
        decisionAuthority: 'Primary Decision Maker',
        authorityScope: 'Fedwire, ACH settlement pipelines, SWIFT messaging, liquidity thresholds.',
        responsibilities: [
          'Monitor payment queues, failed transactions, and daylight overdraft exposure.',
          'Enact offline paper/manual settlement procedures for critical corporate payrolls.',
          'Coordinate interbank counterparties and Federal Reserve correspondent banking.',
        ],
        keyActions: ['Enact Wire Clearing Queue', 'Activate Contingency Settlement', 'Notify Clearing House (NACHA)'],
        requiredForSession: true,
      },
      {
        id: 'role_customer_ops',
        teamId: 'business',
        title: 'Customer & Branch Operations Director',
        callsign: 'BRANCH-OPS',
        seniority: 'Operations',
        decisionAuthority: 'Advisory & Proposer',
        authorityScope: 'Retail branch network, ATM network status, call center queues, teller cash drawers.',
        responsibilities: [
          'Deploy emergency teller offline vouchers and cash withdrawal caps ($500/day).',
          'Manage physical branch security, panic queue management, and customer de-escalation.',
          'Arm call center agents with verified truth-sheet scripts.',
        ],
        keyActions: ['Deploy Branch Cash Limits', 'Equip Call Centers with Truth Sheets', 'Dispatch Regional Vault Cash'],
        requiredForSession: true,
      },
      {
        id: 'role_communications_lead',
        teamId: 'business',
        title: 'Strategic Communications Lead',
        callsign: 'COMM-CHIEF',
        seniority: 'Lead',
        decisionAuthority: 'Primary Decision Maker',
        authorityScope: 'Press statements, social media broadcasts, customer push notifications, media briefings.',
        responsibilities: [
          'Draft honest, transparent customer communications adhering to legal constraints.',
          'Counter online social media rumors, deepfake alerts, and sensationalist leaks.',
          'Coordinate executive talking points for broadcast press conferences.',
        ],
        keyActions: ['Issue Customer Status Advisory', 'Hold Press Briefing', 'Counter Misinformation Wave'],
        requiredForSession: true,
      },
      {
        id: 'role_cmt_coordinator',
        teamId: 'business',
        title: 'Crisis Management Coordinator (Scribe)',
        callsign: 'SCRIBE-CHRONO',
        seniority: 'Operations',
        decisionAuthority: 'Scribe & Observer',
        authorityScope: 'Exercise chronolog, cross-team decision records, audit preservation.',
        responsibilities: [
          'Maintain timestamped master event log of all tabletop deliberations and directives.',
          'Verify cross-team approval workflows between Executive, Technical, and Business units.',
          'Compile regulatory audit trail for post-exercise After-Action Review (AAR).',
        ],
        keyActions: ['Log Crucial Deliberation', 'Verify Sign-Off Matrix', 'Generate Incident Chronology'],
        requiredForSession: false,
      },
    ],
  },
};

export const ACHIEVEMENTS = [
  {
    id: 'ach_evidence_first',
    title: 'Chain of Custody Preserved',
    category: 'Forensic Excellence',
    description: 'Prioritized live memory capture and forensic disk duplication before severing critical nodes.',
    icon: 'FileCheck',
  },
  {
    id: 'ach_containment_speed',
    title: 'Decisive Containment',
    category: 'Incident Response',
    description: 'Isolated the FinCorp API gateway and revoked compromised tokens before ransomware lateral spread.',
    icon: 'ShieldCheck',
  },
  {
    id: 'ach_regulatory_punctuality',
    title: '72-Hour Compliance',
    category: 'Governance & Legal',
    description: 'Submitted preliminary NYDFS 500 notification within statutory deadlines with privileged counsel review.',
    icon: 'Scale',
  },
  {
    id: 'ach_truth_in_crisis',
    title: 'Radical Transparency',
    category: 'Public Trust',
    description: 'Refused vague reassurance scripts; issued clear, actionable customer guidance with branch contingency caps.',
    icon: 'Megaphone',
  },
  {
    id: 'ach_clean_restore',
    title: 'Immutable Resurrection',
    category: 'Business Continuity',
    description: 'Validated air-gapped snapshots in an isolated cleanroom, avoiding catastrophic reinfection.',
    icon: 'DatabaseZap',
  },
];
