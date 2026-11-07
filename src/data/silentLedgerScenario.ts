/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ScenarioInjectPart,
  ModuleDefinition,
  TierDefinition,
} from '../types/exercise';
import { OrgLevelInfo } from '../types/simulation';

import executiveCenterImg from '../assets/images/executive_command_center_1793152806402.jpg';
import engineeringLabImg from '../assets/images/engineering_systems_lab_1793152806463.jpg';
import datacenterRacksImg from '../assets/images/datacenter_server_racks_1793152805912.jpg';
import edgeNocImg from '../assets/images/edge_network_noc_1793152806611.jpg';

export const EXERCISE_TIERS: TierDefinition[] = [
  {
    id: 4,
    name: 'Level 4: Executive Crisis Team & Governance',
    subname: 'Boardroom, Legal Counsel, Chief Risk Officer & Regulatory Affairs',
    yPosition: 11.5,
    accentColor: '#f59e0b', // Amber / Gold
    badge: 'GOVERNANCE & LIQUIDITY',
    description:
      'Executive crisis command, emergency board communications, NYDFS/SEC regulatory disclosure obligations, and enterprise liquidity preservation.',
    operationalStakeholder: 'CEO, Chief Legal Officer, CRO, Head of Strategic Communications',
    activeCompromiseLevel: 'nominal',
  },
  {
    id: 3,
    name: 'Level 3: SOC, Identity & Incident Response',
    subname: 'Security Operations, Active Directory/IAM, Threat Intel & Sentinel AI Core',
    yPosition: 7.2,
    accentColor: '#06b6d4', // Cyan / Electric Blue
    badge: 'DETECTION & ACCESS CONTROL',
    description:
      'Continuous monitoring, SIEM correlation, automated Tier 1 containment, multi-factor credential governance, and forensic triage of threat actor persistence.',
    operationalStakeholder: 'CISO, SOC Lead, Incident Commander, Identity & Access Architect',
    activeCompromiseLevel: 'nominal',
  },
  {
    id: 2,
    name: 'Level 2: Banking Infrastructure, Vendor Connections & Backups',
    subname: 'Core Ledger, Managed IT Provider VPN, Fedwire/ACH Gateways & Immutable Vaults',
    yPosition: 3.6,
    accentColor: '#10b981', // Emerald / Teal
    badge: 'TRANSACTION FABRIC & RECOVERY',
    description:
      'Real-time core ledger processing, interbank settlement rails, third-party vendor conduits (Apex Managed Services), and air-gapped immutable backup repositories.',
    operationalStakeholder: 'Head of Core Infrastructure, Database Architect, Backup Vault Admin',
    activeCompromiseLevel: 'nominal',
  },
  {
    id: 1,
    name: 'Level 1: Customers, Branches, Payments & Business Impact',
    subname: 'Retail Branches, ATM Fleet, Mobile Banking Gateway & Commercial Treasury',
    yPosition: 0.5,
    accentColor: '#f43f5e', // Rose / Red
    badge: 'FIELD OPERATIONS & CLIENT FACING',
    description:
      '185 branch operations, 420 cash machines, commercial treasury wire services, customer call centers, and regional public deposit confidence.',
    operationalStakeholder: 'Head of Retail Banking, Head of Treasury, Public Branch Operations',
    activeCompromiseLevel: 'nominal',
  },
];

export const SCENARIO_MODULES: ModuleDefinition[] = [
  {
    moduleNumber: 1,
    title: 'Module 1: Infiltration & Stealth',
    subtitle: 'Vendor IT Compromise, Credential Abuse & Initial Foothold',
    timeframe: 'Day 1 — 02:00 EDT to 07:30 EDT',
    primaryFocus: 'Supply chain compromise via Apex IT Services and stealth staging in core database clusters.',
    injectCount: 3,
  },
  {
    moduleNumber: 2,
    title: 'Module 2: Detection, Correlation & Escalation',
    subtitle: 'Sentinel Threat Telemetry, Stale Briefings & Crisis Declaration',
    timeframe: 'Day 1 — 08:15 EDT to 14:00 EDT',
    primaryFocus: 'Automated Tier 1 response vs gated Tier 2/3 containment, Compass information feed lag, and regulatory clocks.',
    injectCount: 4,
  },
  {
    moduleNumber: 3,
    title: 'Module 3: Disruption, Impact & Extortion',
    subtitle: 'Payment Processing Freeze, Branch Turmoil & Ransom Demands',
    timeframe: 'Day 2 — 06:00 EDT to 16:45 EDT',
    primaryFocus: 'Fedwire latency, branch cash withdrawal surges, $15M crypto ransom ultimatum, and deposit run vulnerability.',
    injectCount: 4,
  },
  {
    moduleNumber: 4,
    title: 'Module 4: Containment, Recovery & Governance',
    subtitle: 'Clean-Room Restoration, Cash Logistics, Eradication & SEC/NYDFS Reporting',
    timeframe: 'Day 3 — 08:00 EDT to Day 4 — 18:30 EDT',
    primaryFocus: 'Verifying air-gapped backups (4.1A), branch liquidity dispatch (4.1B), Sentinel credential purge (4.2), and board review (4.3).',
    injectCount: 4, // 15 parts total because 4.1 has A & B
  },
];

export const SCENARIO_INJECT_PARTS: ScenarioInjectPart[] = [
  // MODULE 1: INFILTRATION & STEALTH
  {
    id: '1.1',
    moduleNumber: 1,
    moduleTitle: 'Module 1: Infiltration & Stealth',
    partIndex: 0,
    injectTitle: 'Inject 1.1: Vendor IT Compromise via Apex Managed Services',
    primaryTierId: 2,
    affectedTiers: [2, 3],
    simulatedDateTime: 'Day 1, 02:14 EDT',
    incidentDate: 'October 24, 2026',
    exerciseTimeOffset: '+00:00:00',
    overview:
      'Threat actor GLASS HERON compromises credentials of Apex Managed Services, a third-party IT vendor contracted by Meridian Trust Financial for night-shift infrastructure maintenance. Compromised vendor credentials are used to access the internal jump host over the vendor IPsec VPN tunnel.',
    operationalImpact:
      'Unscheduled administrative login into the banking perimeter during off-peak batch processing. No alarm triggered yet in legacy threshold monitoring.',
    technicalTelemetry: [
      { metricName: 'Vendor VPN Tunnel Traffic', value: '4.8 MB/s (Elevated off-hours)', isEstimatedOrUnknown: false },
      { metricName: 'Compromised Account', value: 'svc-apex-mgmt@meridiantrust.internal', isEstimatedOrUnknown: false },
      { metricName: 'Session Geo-IP', value: 'Unusual ASN (Routing through cloud proxy)', isEstimatedOrUnknown: false },
      { metricName: 'Adversary Persistence Depth', value: 'Unknown (Pending Memory Dump)', isEstimatedOrUnknown: true },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '02:16 EDT',
        text:
          'GLASS HERON has gained initial footholds through Apex credentials. Reconnaissance scripts are utilizing Living-off-the-Land Binaries (LOLBins) to enumerate internal domain trusts without triggering basic signature scanners.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '02:18 EDT',
        text:
          'Routine maintenance session registered from Apex VPN pool. Session attributes match vendor profile with minor IP anomaly score (18/100). Below automatic Tier 1 containment threshold. Logging session telemetry for 24-hour baseline correlation.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Tier 1 Automated Observation',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '02:20 EDT',
        text:
          'Executive Briefing: Normal nocturnal batch state. Core banking infrastructure reports all scheduled overnight ledger rebalancing within expected operating tolerances.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-1.1-vpn',
        injectPartId: '1.1',
        title: 'Apex VPN Gateway Authentication Log',
        category: 'Identity',
        classification: 'CONFIDENTIAL',
        timestamp: 'Day 1, 02:14:18 EDT',
        summary: 'Successful RADIUS authentication from Apex jump-box range using valid contractor hardware token.',
        technicalDetails: [
          'Source: 198.51.100.44 (Apex Managed Netblock)',
          'User: svc-apex-mgmt (Privileged Vendor Operator)',
          'Auth Protocol: EAP-TLS with valid certificate serial #4892-F19',
          'Target Host: MTF-JUMP-04.corp.meridiantrust.internal',
        ],
        rawSnippet: 'RADIUS-AUTH-OK: svc-apex-mgmt [RADIUS-PORT: 1812] NAS-IP: 10.240.1.1 SESSION-ID: APEX-99418',
        isReleased: false,
      },
      {
        id: 'ev-1.1-pcap',
        injectPartId: '1.1',
        title: 'NetFlow Packet Anomaly Report',
        category: 'Network',
        classification: 'RESTRICTED',
        timestamp: 'Day 1, 02:22:04 EDT',
        summary: 'Slight deviation in RPC port 135 queries directed toward Domain Controller MTF-DC-01.',
        technicalDetails: [
          'High port entropy observed over SMB/RPC conduits',
          'Query frequency: 12 packets/sec throttled to blend with background heartbeat',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Early Vendor Activity Anomaly: How should Meridian Trust respond to the suspicious off-hours Apex login?',
      governanceContext: 'Balancing overnight batch maintenance schedules against initial vendor credential compromise indicators.',
      options: [
        {
          id: 'opt-1.1-a',
          label: 'Immediate Vendor VPN Severance & Global MFA Reset',
          summary: 'Immediately sever Apex VPN conduit and force global MFA reset on all vendor accounts.',
          impactScore: 'neutral',
          tierImpact: {
            tier4: 'Executive team notified of vendor friction; potential batch delays.',
            tier3: 'SOC immediately contains active ingress tunnel.',
            tier2: 'Batch processing runs halt; risk of stalled clearing files.',
            tier1: 'Morning wire transfers and settlement files could lag by 2 hours.',
          },
        },
        {
          id: 'opt-1.1-b',
          label: 'Silent Honeytoken Monitoring & Sentinel Enhanced Telemetry (Recommended)',
          summary: 'Permit session under active shadow capture, deploy honeytokens, and prepare forensic isolation.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'Maintains normal operations while gathering legal attribution evidence.',
            tier3: 'SOC tracks adversary lateral movement and gathers TTPs.',
            tier2: 'Infra remains stable while shadow tap is placed on jump host.',
            tier1: 'Zero customer disruption; early detection window maximized.',
          },
        },
        {
          id: 'opt-1.1-c',
          label: 'Dismiss as Standard Vendor Maintenance Window',
          summary: 'Mark as false positive based on vendor SLA contract and close ticket.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Executive blind spot created.',
            tier3: 'Loss of critical forensic attribution window.',
            tier2: 'Adversary establishes unmonitored foothold in core banking cluster.',
            tier1: 'Severe downstream customer exposure as breach deepens.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'GLASS HERON uses valid credentials and slow RPC pinging specifically designed to avoid tripping SIEM threshold alerts.',
      probingQuestions: [
        'What contractual authority does Meridian Trust have to unilaterally sever vendor access during critical overnight batch processing?',
        'How does the SOC verify whether an Apex engineer is genuinely on shift without tipping off a potential adversary holding the account?',
      ],
      deliberateTraps: [
        'Prematurely severing the vendor VPN without logging active connections will cause the threat actor to switch to pre-planted backup persistence.',
        'Ignoring the anomaly because "it came from a known vendor IP" violates zero-trust principles.',
      ],
      expectedDecisions: [
        'Isolate the specific user session while verifying on-call vendor roster via out-of-band telephone communication.',
        'Escalate SOC alert level to elevated hunting on all domain controller logs.',
      ],
      regulatoryConsiderations: [
        'NYDFS Cybersecurity Regulation 23 NYCRR 500.11 (Third-Party Service Provider Risk).',
      ],
    },
    presentationNarration:
      'At 02:14 EDT on Day 1, an external connection connects to Meridian Trust Financial’s perimeter via Apex Managed Services’ vendor VPN. Using legitimate contractor credentials, threat actor GLASS HERON bypasses perimeter firewalls, planting initial reconnaissance tooling into Tier 2 banking infrastructure.',
  },

  // INJECT 1.2
  {
    id: '1.2',
    moduleNumber: 1,
    moduleTitle: 'Module 1: Infiltration & Stealth',
    partIndex: 1,
    injectTitle: 'Inject 1.2: Anomalous Admin Account Creation & IAM Escalation',
    primaryTierId: 3,
    affectedTiers: [3, 2],
    simulatedDateTime: 'Day 1, 04:42 EDT',
    incidentDate: 'October 24, 2026',
    exerciseTimeOffset: '+00:45:00',
    overview:
      'The threat actor abuses a dormant service account delegation vulnerability to create a shadow administrative account (svc-core-sync9) in Active Directory, assigning it Domain Admin and Core Database Operator privileges.',
    operationalImpact:
      'Privileged security boundaries breached within Tier 3 Identity tier. Adversary gains capability to query transaction ledger structures directly.',
    technicalTelemetry: [
      { metricName: 'New Privileged Accounts', value: '1 (svc-core-sync9)', isEstimatedOrUnknown: false },
      { metricName: 'AD Kerberos Ticket Lifetime', value: 'Overridden to 24h', isEstimatedOrUnknown: false },
      { metricName: 'Privilege Escalation Vector', value: 'CVE-2025-XXXX Kerberos RBCD Abuse', isEstimatedOrUnknown: false },
      { metricName: 'Total Systems Enumerated', value: '48 Tier-2 & Tier-3 nodes', isEstimatedOrUnknown: false },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '04:45 EDT',
        text:
          'Domain escalation complete. Raven has assisted in camouflaging the svc-core-sync9 account by mimicking naming conventions of Meridian’s standard nocturnal synchronization scripts.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '04:48 EDT',
        text:
          'CORRELATION ALERT (Priority 2): Account svc-core-sync9 added to Domain Admins outside standard Change Management window. Automated Tier 1 response: Revoked active Kerberos ticket session and generated IR Ticket #SEC-8921.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Tier 1 Automated Containment Action Executed',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '04:50 EDT',
        text:
          'Executive Summary: SOC ticket SEC-8921 opened for privileged account anomaly. No customer-facing services or transaction processing channels are impacted at this time.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-1.2-ad',
        injectPartId: '1.2',
        title: 'Active Directory Security Event 4720 & 4728',
        category: 'Identity',
        classification: 'EVIDENCE TIER-1',
        timestamp: 'Day 1, 04:42:33 EDT',
        summary: 'Account creation event for svc-core-sync9 followed by immediate membership assignment to Enterprise Admins.',
        technicalDetails: [
          'Caller User: svc-apex-mgmt',
          'Target User: svc-core-sync9',
          'Assigned SID: S-1-5-21-3829104-512 (Domain Admins)',
          'Originating Workstation: MTF-JUMP-04',
        ],
        rawSnippet: 'EventID: 4720 | A user account was created: TargetUserName: svc-core-sync9 | SubjectUserName: svc-apex-mgmt',
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Unauthorized Domain Admin Account: How should the Incident Commander respond to the rogue account?',
      governanceContext: 'Determining whether to perform isolated account deactivation or invoke emergency enterprise-wide credential quarantine.',
      options: [
        {
          id: 'opt-1.2-a',
          label: 'Isolate Rogue Account & Initiate Memory Forensics on MTF-JUMP-04',
          summary: 'Disable svc-core-sync9, snapshot jump host memory, and invoke secondary credential verification.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'CRO briefed on contained internal incident; no regulatory trigger yet.',
            tier3: 'SOC captures volatile memory artifacts; lateral credentials identified.',
            tier2: 'Core systems undisturbed while jump host is quarantined.',
            tier1: 'No customer impact.',
          },
        },
        {
          id: 'opt-1.2-b',
          label: 'Execute Enterprise-Wide Krbtgt Double Reset Immediately',
          summary: 'Force immediate domain-wide Kerberos password reset across all Meridian Trust systems.',
          impactScore: 'neutral',
          tierImpact: {
            tier4: 'Severe operational friction; requires emergency Board notification.',
            tier3: 'Destroys adversary Kerberos tickets, but blinds ongoing detection.',
            tier2: 'Immediate outage across core ledger and automated overnight wire processing.',
            tier1: 'Branch tellers and ATM networks will fail authentication at morning opening.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'GLASS HERON expects the rogue account to be discovered quickly. It serves as a decoy to divert SOC attention while secondary hidden WMI persistence is established.',
      probingQuestions: [
        'Why did Sentinel only execute a Tier 1 automated session revocation rather than disabling the account entirely?',
        'What governance approval is required before initiating a Tier 2/3 active credential purge in a regulated bank?',
      ],
      deliberateTraps: [
        'Assuming that revoking the Kerberos ticket eliminated the adversary, ignoring persistence in scheduled tasks.',
      ],
      expectedDecisions: [
        'Perform memory capture before powering down the infected jump host.',
        'Review all Active Directory changes initiated in the preceding 6 hours.',
      ],
      regulatoryConsiderations: ['FFIEC Cybersecurity Assessment General Principles.'],
    },
    presentationNarration:
      'By 04:42 EDT, the intruder escalates privileges inside Tier 3 Identity infrastructure, synthesizing an unauthorized domain administrative account. SENTINEL automatically triggers Tier 1 session revocation, but the adversary has already staged persistence tools.',
  },

  // INJECT 1.3
  {
    id: '1.3',
    moduleNumber: 1,
    moduleTitle: 'Module 1: Infiltration & Stealth',
    partIndex: 2,
    injectTitle: 'Inject 1.3: Core Banking Reconnaissance & Database Staging',
    primaryTierId: 2,
    affectedTiers: [2, 1],
    simulatedDateTime: 'Day 1, 06:15 EDT',
    incidentDate: 'October 24, 2026',
    exerciseTimeOffset: '+01:15:00',
    overview:
      'The threat actor pivots from the jump host into Tier 2 Core Database cluster DB-PROD-01. Read-only queries extract table schemas for high-net-worth customer deposits, commercial credit facilities, and wire routing tables.',
    operationalImpact:
      'Read access to proprietary banking schema and non-public personal information (NPI). Preparation for potential double-extortion data theft.',
    technicalTelemetry: [
      { metricName: 'Database Read Queries', value: '14,200 SELECT queries (throttled)', isEstimatedOrUnknown: false },
      { metricName: 'Extracted Tables', value: 'tbl_client_master, tbl_wire_routing, tbl_exec_accounts', isEstimatedOrUnknown: false },
      { metricName: 'Estimated Data Staged', value: '450 GB compressed archive', isEstimatedOrUnknown: true },
      { metricName: 'Database Server CPU', value: '28% (Nominal variation)', isEstimatedOrUnknown: false },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '06:18 EDT',
        text:
          'Data staging complete in temporary SQL backup directory (D:\\SQLBackups\\Archive_Temp). Files have been chunked and encrypted with 7-Zip AES-256 using Glass Heron internal key.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '06:21 EDT',
        text:
          'ELEVATED ANOMALY: Large volume of archival reads on DB-PROD-01 during morning opening hours. Action recommendation: Sever database network segment. Note: Tier 2 network isolation requires authorized human execution with separate credentials.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Human Authorization Gated — Tier 2 Action Pending',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '06:24 EDT',
        text:
          'Executive Dashboard: Morning readiness report indicates all 185 branches preparing for 08:00 opening. Core database latency within normal operating limits (14ms).',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-1.3-sql',
        injectPartId: '1.3',
        title: 'SQL Server Audit Log — Bulk SELECT Operations',
        category: 'Forensics',
        classification: 'EVIDENCE TIER-1',
        timestamp: 'Day 1, 06:14:52 EDT',
        summary: 'Non-standard queries enumerating client balances greater than $1,000,000 and wire account routing coordinates.',
        technicalDetails: [
          'Target: DB-PROD-01\\INST01',
          'Application: bcp.exe utility invoked via cmd shell',
          'Output Path: D:\\SQLBackups\\Archive_Temp\\exp_01.dat',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Gated Action Decision: Sentinel requests human authorization to sever the Tier 2 database segment.',
      governanceContext: 'Isolating the database protects customer data from exfiltration but will halt branch teller balance queries across all 185 branches at 08:00 EDT.',
      options: [
        {
          id: 'opt-1.3-a',
          label: 'Authorize Database Network Isolation Immediately (Human Credential Sign-off)',
          summary: 'Authorize Tier 2 network isolation using Incident Commander emergency credentials.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'CEO must declare operational business disruption; branches cannot open.',
            tier3: 'Data exfiltration halted at source.',
            tier2: 'Core database fully quarantined.',
            tier1: '185 branches and mobile app fail immediately at morning rush.',
          },
        },
        {
          id: 'opt-1.3-b',
          label: 'Apply Micro-Segmentation & Restrict Outbound Staging Channels (Recommended)',
          summary: 'Block external egress gateways while maintaining internal intra-subnet database read availability.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'Operations continue while threat is constrained within internal honeynet.',
            tier3: 'External exfiltration paths severed without crashing core banking.',
            tier2: 'Internal database queries succeed; replication monitored.',
            tier1: 'Branches open on time; client confidence maintained.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'The adversary plans to exfiltrate the 450GB archive over cloud storage endpoints before business hours reach peak bandwidth.',
      probingQuestions: [
        'Who in the organization holds the authority to approve a Tier 2 infrastructure isolation that halts retail banking operations?',
        'Why does Sentinel require a human credential rather than executing Tier 2 isolation autonomously?',
      ],
      deliberateTraps: [
        'Authorizing knee-jerk database shutdown without checking if off-site replication was also poisoned.',
      ],
      expectedDecisions: [
        'Egress filtering on firewall edges rather than shutting down database servers directly.',
        'Immediate engagement of external forensic retainer team.',
      ],
      regulatoryConsiderations: ['GLBA Safeguards Rule 16 CFR Part 314.'],
    },
    presentationNarration:
      'At 06:15 EDT, the adversary navigates into Tier 2 Banking Infrastructure, staging 450 GB of sensitive customer deposit and treasury records. SENTINEL recommends severing the database network, but enforces the governance mandate: Tier 2 containment requires authorized human credentials.',
  },

  // MODULE 2: DETECTION, CORRELATION & ESCALATION
  {
    id: '2.1',
    moduleNumber: 2,
    moduleTitle: 'Module 2: Detection, Correlation & Escalation',
    partIndex: 3,
    injectTitle: 'Inject 2.1: Sentinel Alert Escalation & Automated Tier 1 Containment',
    primaryTierId: 3,
    affectedTiers: [3, 2],
    simulatedDateTime: 'Day 1, 08:20 EDT',
    incidentDate: 'October 24, 2026',
    exerciseTimeOffset: '+01:45:00',
    overview:
      'SENTINEL correlates multiple anomalous event streams: unusual vendor VPN session, rogue admin creation, and bulk SQL queries. SENTINEL raises a Level 1 Enterprise Cyber Incident and automatically locks all Tier 1 perimeter session tokens.',
    operationalImpact:
      'Security Operations Center mobilizes emergency triage room. SOC backlog spikes as tickets flood from endpoint sensors.',
    technicalTelemetry: [
      { metricName: 'Sentinel Threat Correlation Score', value: '88/100 (Critical Threat)', isEstimatedOrUnknown: false },
      { metricName: 'Automated Tier 1 Actions Executed', value: '14 session tokens revoked', isEstimatedOrUnknown: false },
      { metricName: 'Pending Tier 2/3 Human Approvals', value: '2 firewall isolation requests', isEstimatedOrUnknown: false },
      { metricName: 'SOC Analyst Queue Depth', value: '42 unassigned high-priority alerts', isEstimatedOrUnknown: false },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '08:22 EDT',
        text:
          'Blue team automated correlation triggered. Raven recommends GLASS HERON initiate distributed telemetry flooding across SOC sensors to degrade human analyst response times.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '08:25 EDT',
        text:
          'ALERT ESCALATION: Multi-stage intrusion signature detected. Automated Tier 1 response executed: 14 vendor sessions terminated. ACTION REQUIRED: Tier 2 firewall policy push to isolate DB-PROD-01 awaiting Human Commander authorization.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Automated Tier 1 Complete | Tier 2 Awaiting Human Sign-off',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '08:28 EDT',
        text:
          'Executive Update: Enterprise security status shifted from Green to Amber. Security leadership has convened in War Room Alpha. No regulatory notifications triggered at this stage.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-2.1-correlation',
        injectPartId: '2.1',
        title: 'Sentinel Multi-Stage Correlation Dossier',
        category: 'Threat Intel',
        classification: 'EVIDENCE TIER-1',
        timestamp: 'Day 1, 08:20:11 EDT',
        summary: 'Synthesized timeline linking Apex VPN credentials, AD shadow account, and SQL staging directory.',
        technicalDetails: [
          'MITRE ATT&CK: T1078 (Valid Accounts), T1098 (Account Manipulation), T1560 (Archive Collected Data)',
          'Confidence: 94%',
          'Threat Actor Signature: GLASS HERON (Russian/Eastern European FIN-motivated nexus)',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Incident Triage & War Room Activation: Should the CISO officially declare a Severity-1 Crisis to the Executive Committee?',
      governanceContext: 'Declaring a Sev-1 activates executive war rooms, board notification protocols, and external forensic counsel retainers.',
      options: [
        {
          id: 'opt-2.1-a',
          label: 'Declare Enterprise Sev-1 & Convene Executive Crisis Team (Recommended)',
          summary: 'Formally invoke Crisis Management Plan and notify Executive Committee & Legal Counsel.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'CEO and CRO mobilize; regulatory clock preparation begins.',
            tier3: 'SOC receives executive backing for restrictive countermeasures.',
            tier2: 'IT infrastructure team transitions to emergency change freeze.',
            tier1: 'Branch managers placed on standby for potential system slowdowns.',
          },
        },
        {
          id: 'opt-2.1-b',
          label: 'Keep Incident Localized to IT Security for Further Investigation',
          summary: 'Avoid alerting the Executive Committee until forensic certainty of exfiltration is proven.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Executive team remains unaware as legal reporting deadlines slip.',
            tier3: 'SOC remains resource-constrained under heavy ticket backlog.',
            tier2: 'No coordinated change freeze; vulnerability persists.',
            tier1: 'Complete blind spot for customer-facing branch operations.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'GLASS HERON initiates background port flooding to overwhelm SOC queue, exploiting the gap between automated detection and human executive authorization.',
      probingQuestions: [
        'What criteria in Meridian Trust’s Cyber Incident Response Plan triggers mandatory notification to the Chief Risk Officer and Legal Counsel?',
        'How does the team handle the risk of tipping off internal staff if a compromised insider is suspected?',
      ],
      deliberateTraps: [
        'Delaying executive notification while seeking "100% forensic proof" — which may take 48+ hours.',
      ],
      expectedDecisions: [
        'Activate external forensic retainers (Mandiant / CrowdStrike equivalent) immediately under attorney-client privilege.',
      ],
      regulatoryConsiderations: ['NYDFS Part 500.17(a) 72-Hour Notification Requirements.'],
    },
    presentationNarration:
      'At 08:20 EDT, SENTINEL correlates the multi-stage attack and escalates to Critical Threat. Fourteen compromised sessions are automatically severed, but human authorization is mandatory before altering core infrastructure.',
  },

  // INJECT 2.2
  {
    id: '2.2',
    moduleNumber: 2,
    moduleTitle: 'Module 2: Detection, Correlation & Escalation',
    partIndex: 4,
    injectTitle: 'Inject 2.2: Compass Executive Briefing & Stale Information Failure',
    primaryTierId: 4,
    affectedTiers: [4, 3],
    simulatedDateTime: 'Day 1, 10:30 EDT',
    incidentDate: 'October 24, 2026',
    exerciseTimeOffset: '+02:30:00',
    overview:
      'The Executive Crisis Team relies on COMPASS to synthesize incident status for the CEO and Board. However, because the SOC is overwhelmed and ticket entries are backlogged, COMPASS exhibits a critical failure: its synthesized briefing is based on 52-minute-old data, failing to reflect ongoing exfiltration.',
    operationalImpact:
      'Executive leadership receives an outdated "Situation Stable" status while SOC analysts are battling active data movement. Highlights the peril of unverified automated executive summaries during rapid crises.',
    technicalTelemetry: [
      { metricName: 'COMPASS Ticket Feed Latency', value: '52 minutes (CRITICAL LAG)', isEstimatedOrUnknown: false },
      { metricName: 'Executive Confidence Index', value: '84% (Artificially inflated)', isEstimatedOrUnknown: false },
      { metricName: 'Actual Incident Severity', value: 'Critical Data Exfiltration Active', isEstimatedOrUnknown: false },
      { metricName: 'Manual Briefing Fallback', value: 'Pending SOC Lead Verbal Report', isEstimatedOrUnknown: false },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '10:32 EDT',
        text:
          'Executive disconnect achieved. The boardroom believes the situation is contained based on stale AI dashboard summaries, creating a 45-minute operational vacuum for data egress.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '10:35 EDT',
        text:
          'SOC TICKETING BACKLOG WARNING: 68 high-urgency telemetry events queued for manual analyst enrichment. Downstream briefing feeds are receiving asynchronous updates.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'System Pipeline Degradation',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '10:38 EDT',
        text:
          'STALE INFORMATION WARNING: Feed latency > 45 minutes. Last SOC ticket sync was at 09:38 EDT. Briefing content: "Perimeter accounts revoked; database operational." CAUTION: Do not make strategic containment decisions without direct SOC commander verbal verification.',
        scriptedBadge: '[Scripted Simulation Content]',
        staleWarning: true,
      },
    ],
    evidencePackets: [
      {
        id: 'ev-2.2-compass-log',
        injectPartId: '2.2',
        title: 'Compass Knowledge Graph Sync Discrepancy Log',
        category: 'Communications',
        classification: 'RESTRICTED',
        timestamp: 'Day 1, 10:30:45 EDT',
        summary: 'Audit log proving COMPASS displayed stale security indicators to the Board of Directors.',
        technicalDetails: [
          'Engine: COMPASS v4.2 Executive Synth',
          'Source Feed: Jira IR Ticket API',
          'HTTP Timeout: 504 Gateway Timeout during SOC batch dump',
          'Fallback: Cached state from 09:38:12 EDT displayed',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Stale Information Governance: How should the Executive Crisis Team adjust governance when executive dashboards lag?',
      governanceContext: 'Addressing decision-making failure when automated decision support systems lose synchronization with fast-moving technical reality.',
      options: [
        {
          id: 'opt-2.2-a',
          label: 'Institute Direct SOC Liaison Verbal Briefings Every 30 Minutes (Recommended)',
          summary: 'Embed senior Incident Commander directly into Executive Crisis room with manual whiteboard logging.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'Boardroom receives verified, live forensic facts; eliminates AI hallucination risk.',
            tier3: 'SOC maintains transparent link with executive leadership.',
            tier2: 'Infrastructure decisions grounded in ground truth.',
            tier1: 'Executive messaging aligns with real operational impacts.',
          },
        },
        {
          id: 'opt-2.2-b',
          label: 'Continue Relying on Dashboard Refresh Buttons',
          summary: 'Trust that backend API sync will catch up shortly and defer executive queries.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Executives make misleading statements to regulators based on outdated facts.',
            tier3: 'SOC operates in isolation without executive air cover.',
            tier2: 'Critical isolation orders delayed by hours.',
            tier1: 'Public narrative slips completely out of control.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'Adversaries thrive when boardroom leaders and technical incident commanders operate from divergent understandings of reality.',
      probingQuestions: [
        'How does your organization verify the accuracy of high-level security dashboards during a live crisis?',
        'What manual fallback procedures exist if internal messaging, ticketing, or SIEM consoles become untrusted?',
      ],
      deliberateTraps: [
        'Accepting green dashboard status lights at face value during an unfolding breach.',
      ],
      expectedDecisions: [
        'Establish an out-of-band communication channel (e.g. dedicated Signal group or air-gapped conference line).',
      ],
      regulatoryConsiderations: ['SEC Cybersecurity Governance Disclosures (Item 106 of Reg S-K).'],
    },
    presentationNarration:
      'In Tier 4 Executive Governance, COMPASS synthesizes situation reports for leadership. But with the SOC overwhelmed, COMPASS flags a critical warning: its briefings are 52 minutes stale. Automated summaries must fall back to direct human liaison verification.',
  },

  // INJECT 2.3
  {
    id: '2.3',
    moduleNumber: 2,
    moduleTitle: 'Module 2: Detection, Correlation & Escalation',
    partIndex: 5,
    injectTitle: 'Inject 2.3: Active Data Exfiltration Probe & MegaUpload Relay',
    primaryTierId: 2,
    affectedTiers: [2, 1],
    simulatedDateTime: 'Day 1, 12:15 EDT',
    incidentDate: 'October 24, 2026',
    exerciseTimeOffset: '+03:15:00',
    overview:
      'GLASS HERON initiates outbound data transfer of the staged 450 GB customer financial database. Traffic is disguised as legitimate outbound HTTPS traffic routed through Azure Blob and MegaUpload cloud relay endpoints.',
    operationalImpact:
      'Massive breach of customer NPI underway. Potential exposure of 280,000 retail accounts, commercial loan agreements, and executive tax filings.',
    technicalTelemetry: [
      { metricName: 'Outbound Egress Bandwidth', value: '820 Mbps (Peak network saturation)', isEstimatedOrUnknown: false },
      { metricName: 'Destination IP Range', value: 'Cloud storage CDN nodes (Encrypted TLS 1.3)', isEstimatedOrUnknown: false },
      { metricName: 'Estimated Data Exfiltrated', value: '~310 GB of 450 GB transferred', isEstimatedOrUnknown: true },
      { metricName: 'Retail Accounts at Risk', value: 'Unknown (Forensic scope underway)', isEstimatedOrUnknown: true },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '12:18 EDT',
        text:
          'Egress proceeding at 820 Mbps. Primary customer financial archives are 70% transmitted. Raven has initiated decoy ICMP floods to distract network perimeter monitors.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '12:20 EDT',
        text:
          'CRITICAL EXTRUSION DETECTED: Perimeter egress anomaly on Gateway-02. Recommending immediate egress firewall choke. Requires Tier 2 authorized human credential to apply egress filter.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Tier 2 Containment Gated',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '12:23 EDT',
        text:
          'Executive Impact Assessment: Data theft confirmed. If confirmed to contain customer NPI, mandatory notification triggers under GLBA and NYDFS 500.17 will activate.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-2.3-pcap',
        injectPartId: '2.3',
        title: 'Perimeter Firewall Egress Flow Analysis',
        category: 'Network',
        classification: 'EVIDENCE TIER-1',
        timestamp: 'Day 1, 12:16:30 EDT',
        summary: 'Continuous 800+ Mbps outbound stream from DB-PROD-01 staging directory to external storage IPs.',
        technicalDetails: [
          'Protocol: HTTPS / TLS 1.3 on TCP 443',
          'SNI: stor-eastus-9912.blob.core.windows.net',
          'Transferred: 310,482,912,400 bytes',
          'Duration: 52 minutes active',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Emergency Egress Choke: Should the team pull the plug on external internet connectivity to halt data exfiltration?',
      governanceContext: 'Severing external internet will instantly halt exfiltration, but will disable online banking, mobile apps, and incoming wire settlements.',
      options: [
        {
          id: 'opt-2.3-a',
          label: 'Sever External Internet Gateway Entirely',
          summary: 'Execute emergency physical/logical disconnection of all primary internet uplinks.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Total business disruption; media and market speculation will spike instantly.',
            tier3: 'Exfiltration definitively halted, but remote forensic access also cut.',
            tier2: 'All external vendor and clearing connections drop.',
            tier1: 'Mobile app, online banking, and wire operations go dark.',
          },
        },
        {
          id: 'opt-2.3-b',
          label: 'Targeted DNS Sinkholing & Cloud Storage IP Block (Recommended)',
          summary: 'Apply targeted BGP null-routes and DNS sinkholes to the specific adversary storage endpoints.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'Demonstrates surgical containment to regulatory overseers.',
            tier3: 'Halts exfiltration stream while keeping threat hunting telemetry online.',
            tier2: 'Banking infrastructure remains connected to Federal Reserve payment rails.',
            tier1: 'Customers retain mobile banking access with minimal packet latency.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'If external internet is completely severed, GLASS HERON will trigger its dormant ransomware payload prematurely in retaliation.',
      probingQuestions: [
        'At what point does customer data loss outweigh the operational cost of taking the bank offline?',
        'Who in the Executive Committee has the legal authority to sign off on shutting down bank internet gateways?',
      ],
      deliberateTraps: [
        'Believing that because data was encrypted in transit, "we cannot prove what was stolen." Regulators assume worst-case exposure.',
      ],
      expectedDecisions: [
        'Surgically block adversary egress IPs while preserving interbank settlement VPNs.',
      ],
      regulatoryConsiderations: ['GLBA Safeguards Customer Data Notification Guidelines.'],
    },
    presentationNarration:
      'At 12:15 EDT, massive outbound egress saturates Tier 2 connections as GLASS HERON exfiltrates over 300 GB of customer financial data. The crisis team faces an excruciating choice: sever the bank’s internet gateways or execute surgical egress sinkholing.',
  },

  // INJECT 2.4
  {
    id: '2.4',
    moduleNumber: 2,
    moduleTitle: 'Module 2: Detection, Correlation & Escalation',
    partIndex: 6,
    injectTitle: 'Inject 2.4: Crisis Declaration & 72-Hour Regulatory Clocks',
    primaryTierId: 4,
    affectedTiers: [4, 1],
    simulatedDateTime: 'Day 1, 14:00 EDT',
    incidentDate: 'October 24, 2026',
    exerciseTimeOffset: '+04:00:00',
    overview:
      'With confirmed exfiltration of customer non-public financial records, Chief Legal Officer and Chief Risk Officer review statutory notification mandates. The 72-hour notification clock under NYDFS 23 NYCRR 500.17(a) and the 4-day SEC Form 8-K Item 1.05 materiality determination clock are now ticking.',
    operationalImpact:
      'Legal and compliance teams enter strict operational oversight. External legal counsel establishes attorney-client privilege over all ongoing technical incident workstreams.',
    technicalTelemetry: [
      { metricName: 'NYDFS 72h Clock Elapsed', value: '11 hours 46 minutes', isEstimatedOrUnknown: false },
      { metricName: 'SEC 8-K Materiality Clock', value: 'Under Formal Evaluation', isEstimatedOrUnknown: false },
      { metricName: 'Primary Regulator', value: 'New York State Dept of Financial Services (NYDFS)', isEstimatedOrUnknown: false },
      { metricName: 'Customer Notification Requirement', value: 'To Be Confirmed by Forensic Audit', isEstimatedOrUnknown: true },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '14:02 EDT',
        text:
          'Regulatory pressure is mounting on Meridian leadership. Glass Heron prepares extortion communiques timed to exploit the public regulatory filing deadlines.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '14:05 EDT',
        text:
          'INCIDENT EVIDENCE RETENTION ACTIVE: All SIEM logs, firewall traces, and memory dumps sealed under cryptographic hash chains for regulatory audit compliance.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Forensic Preservation Mode',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '14:08 EDT',
        text:
          'COMPASS Legal Briefing: NYDFS 500.17(a) requires notification to the Superintendent no later than 72 hours from determination of material impact. Recommendation: Prepare formal notification draft.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-2.4-legal',
        injectPartId: '2.4',
        title: 'Regulatory Notification Matrix & Draft Notice',
        category: 'Financial',
        classification: 'CONFIDENTIAL',
        timestamp: 'Day 1, 14:00:00 EDT',
        summary: 'Legal analysis of statutory notification thresholds across NYDFS, OCC, FDIC, and SEC.',
        technicalDetails: [
          'NYDFS 500.17: Mandatory notice within 72 hours of cyber incident determination',
          'Computer-Security Incident Notification Rule (OCC/Fed/FDIC): 36-hour notice for material banking disruption',
          'SEC Form 8-K Item 1.05: 4 business days upon materiality determination',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Regulatory Disclosure Strategy: When should Meridian Trust submit its formal notice to NYDFS and federal banking regulators?',
      governanceContext: 'Early notification complies with strict deadlines but requires disclosing facts before forensic scope is 100% complete.',
      options: [
        {
          id: 'opt-2.4-a',
          label: 'Submit Initial 72-Hour Notice Now with Forensic Caveats (Recommended)',
          summary: 'Submit formal notification stating active ongoing investigation with preliminary facts.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'Preserves regulatory goodwill and avoids statutory enforcement penalties.',
            tier3: 'Establishes clear timeline aligned with forensic logging.',
            tier2: 'No direct infrastructure impact.',
            tier1: 'Maintains professional posture with institutional clearing partners.',
          },
        },
        {
          id: 'opt-2.4-b',
          label: 'Delay Notification Until Full Forensic Scope is Completed',
          summary: 'Withhold regulatory notice until the exact number of compromised records is certified.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Severe risk of regulatory sanctions, fines, and personal board liability.',
            tier3: 'Forensic team placed under immense political pressure to rush findings.',
            tier2: 'Vulnerability unaddressed.',
            tier1: 'Catastrophic reputation damage if leaks occur before official notice.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'GLASS HERON frequently monitors regulatory portal announcements or news wires to gauge victim crisis posture.',
      probingQuestions: [
        'What is the threshold for "materiality" under SEC Item 1.05 for a regional commercial bank?',
        'If the FBI or US Secret Service asks Meridian Trust to delay public disclosure for national security reasons, how is that coordinated with NYDFS?',
      ],
      deliberateTraps: [
        'Believing that the 72-hour clock only starts when the final forensic report is finished. (The law states "determination of an incident").',
      ],
      expectedDecisions: [
        'File placeholder notice under NYDFS secure portal acknowledging an unauthorized access event under active containment.',
      ],
      regulatoryConsiderations: ['NYDFS Part 500.17(a), SEC Form 8-K Item 1.05.'],
    },
    presentationNarration:
      'At 14:00 EDT, Executive Governance confronts statutory deadlines. Under NYDFS regulations, Meridian Trust Financial has 72 hours to notify state regulators, while the Board evaluates materiality thresholds under SEC disclosure frameworks.',
  },

  // MODULE 3: DISRUPTION, IMPACT & EXTORTION
  {
    id: '3.1',
    moduleNumber: 3,
    moduleTitle: 'Module 3: Disruption, Impact & Extortion',
    partIndex: 7,
    injectTitle: 'Inject 3.1: Core Payment Gateway Freeze & Wire Transfer Latency',
    primaryTierId: 2,
    affectedTiers: [2, 1],
    simulatedDateTime: 'Day 2, 06:30 EDT',
    incidentDate: 'October 25, 2026',
    exerciseTimeOffset: '+05:00:00',
    overview:
      'As commercial banking operations open on Day 2, interbank Fedwire and ACH settlement gateways experience catastrophic queue locks. GLASS HERON has deployed corrupted routing tables and encryption locks into Tier 2 transaction message queues.',
    operationalImpact:
      'Commercial clients attempting high-value morning payroll wires and wholesale settlements receive 504 Gateway errors. $820M in queued pending wires stalled.',
    technicalTelemetry: [
      { metricName: 'Queued Wire Transactions', value: '1,420 pending ($820M total value)', isEstimatedOrUnknown: false },
      { metricName: 'Fedwire Gateway Latency', value: '4,800 ms (Normal: 45 ms)', isEstimatedOrUnknown: false },
      { metricName: 'Message Queue Corruption', value: 'MQ-FEDWIRE-PROD lock file active', isEstimatedOrUnknown: false },
      { metricName: 'Estimated Financial Penalty', value: 'Unknown (Late settlement penalty risk)', isEstimatedOrUnknown: true },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '06:32 EDT',
        text:
          'Payment fabric lock achieved. Glass Heron has placed a logic hold on the MQ queues to maximize commercial customer panic and force executive surrender.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '06:35 EDT',
        text:
          'CORE FABRIC CRITICAL: Message integrity signature mismatch in transaction queue. Automated Tier 1 safety interlock halted outbound clearing to prevent unauthorized fund dissipation.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Tier 1 Automated Safety Interlock Active',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '06:38 EDT',
        text:
          'CRITICAL LIQUIDITY ALERT: Commercial treasury clients reporting inability to release Friday corporate payroll. Risk of commercial defaults and client flight within 4 hours.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-3.1-fedwire',
        injectPartId: '3.1',
        title: 'Fedwire Message Queue Corruption Exception Trace',
        category: 'Financial',
        classification: 'EVIDENCE TIER-1',
        timestamp: 'Day 2, 06:30:19 EDT',
        summary: 'IBM MQ transaction log showing intentional header bit corruption in SWIFT/Fedwire message queue.',
        technicalDetails: [
          'Queue: Q.FEDWIRE.OUTBOUND.PRIORITY',
          'Error: MQRC_CIPHER_SPEC_ERROR (Corrupted key ring)',
          'Affected Volume: 1,420 commercial messages held',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Payment Processing Crisis: How should the bank handle the $820M in queued commercial wire transfers?',
      governanceContext: 'Releasing unverified wires risks sending fraudulent transactions; holding them threatens commercial customer payrolls.',
      options: [
        {
          id: 'opt-3.1-a',
          label: 'Activate Secondary Out-of-Band Manual Wire Verification Rail (Recommended)',
          summary: 'Route critical payroll wires through authenticated secondary clearing rail with dual-signature callback.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'Protects commercial relationships while maintaining strict anti-fraud controls.',
            tier3: 'SOC inspects every outgoing packet manually.',
            tier2: 'Primary corrupted queue isolated from clearing network.',
            tier1: 'High-priority commercial clients process payroll within 90 minutes.',
          },
        },
        {
          id: 'opt-3.1-b',
          label: 'Force-Bypass Verification and Flush Queued Transactions',
          summary: 'Disable integrity checks to clear the backlog before market opening.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Catastrophic liability if adversary has injected fraudulent wire routing.',
            tier3: 'Security oversight completely circumvented.',
            tier2: 'Injected wire fraud transactions successfully clear Federal Reserve.',
            tier1: 'Irreversible capital loss.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'GLASS HERON targets commercial treasury payments on Friday morning specifically to exert maximum pressure on corporate clients.',
      probingQuestions: [
        'Does Meridian Trust have an offline, manual contingency agreement with the Federal Reserve Bank for wire execution?',
        'How does Treasury prioritize which corporate clients receive wire processing first if throughput is throttled?',
      ],
      deliberateTraps: [
        'Attempting to restart the corrupted queue without isolating the compromised encryption keys.',
      ],
      expectedDecisions: [
        'Engage the Federal Reserve Bank of New York Wholesale Operations for settlement exception extensions.',
      ],
      regulatoryConsiderations: ['Federal Reserve Operating Circular 5 (Electronic Access).'],
    },
    presentationNarration:
      'At 06:30 EDT on Day 2, Tier 2 banking infrastructure suffers a severe blow: interbank Fedwire and ACH queues lock up. Over $820 million in commercial payroll transfers is paralyzed as corporate customers prepare to open for business.',
  },

  // INJECT 3.2
  {
    id: '3.2',
    moduleNumber: 3,
    moduleTitle: 'Module 3: Disruption, Impact & Extortion',
    partIndex: 8,
    injectTitle: 'Inject 3.2: Branch ATM Outage Waves & Public Anxiety',
    primaryTierId: 1,
    affectedTiers: [1, 4],
    simulatedDateTime: 'Day 2, 09:15 EDT',
    incidentDate: 'October 25, 2026',
    exerciseTimeOffset: '+06:00:00',
    overview:
      'Across Tier 1, 420 ATM terminals across 185 branches lose connection to the core ledger. Cash machines display "Out of Service" screens. Regional television news and Twitter/X report that Meridian Trust customers cannot withdraw cash.',
    operationalImpact:
      'Customer panic spikes in branches. Teller lines form out the door. Call centers experience 900% surge in inbound call volume.',
    technicalTelemetry: [
      { metricName: 'ATM Fleet Online', value: '42 of 420 active (90% offline)', isEstimatedOrUnknown: false },
      { metricName: 'Call Center Queue', value: '840 calls holding (Avg wait: 48m)', isEstimatedOrUnknown: false },
      { metricName: 'Branch Teller Cash Reserves', value: 'Unknown (Varies by branch tier)', isEstimatedOrUnknown: true },
      { metricName: 'Social Media Sentiment', value: '92% Negative / Viral Panic', isEstimatedOrUnknown: false },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '09:18 EDT',
        text:
          'Psychological amplification phase successful. Public sentiment has turned hostile, creating panic in the streets and pressuring executive leadership.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '09:20 EDT',
        text:
          'EDGE FLEET STATUS: ATM gateway timeout caused by upstream Tier 2 ledger disconnection. ATM machines themselves are not ransomware-encrypted; they are unable to reach host auth.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Root Cause Clarification',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '09:23 EDT',
        text:
          'CRISIS COMMUNICATIONS URGENT: Social media rumors claiming "Meridian Trust has run out of money." Immediate public holding statement required to prevent deposit run.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-3.2-social',
        injectPartId: '3.2',
        title: 'Social Media Panic Surge & News Clip Monitor',
        category: 'Communications',
        classification: 'CONFIDENTIAL',
        timestamp: 'Day 2, 09:15:30 EDT',
        summary: 'Media tracking report showing viral video of locked ATM vestibules in Manhattan and Long Island.',
        technicalDetails: [
          'Hashtag #MeridianBankHack trending #4 in the United States',
          'Local news reporters staging live broadcasts outside Branch 01 (Grand Central)',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Branch Operations & Public Holding Statement: How should Meridian Trust communicate to branch customers waiting in line?',
      governanceContext: 'Balancing full disclosure against the risk of creating panic and accelerating cash withdrawals.',
      options: [
        {
          id: 'opt-3.2-a',
          label: 'Issue Transparent Holding Statement & Extend Branch Teller Hours (Recommended)',
          summary: 'Acknowledge technical disruption, reassure FDIC insured deposit safety, and extend branch teller cash operations.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'CEO projects calm leadership; mitigates panic.',
            tier3: 'SOC continues technical remediation uninterrupted.',
            tier2: 'Prioritizes restoring branch terminal connectivity over bulk processing.',
            tier1: 'Customers reassured; long teller lines orderly.',
          },
        },
        {
          id: 'opt-3.2-b',
          label: 'Lock Branch Doors and Issue "Scheduled Maintenance" Statement',
          summary: 'Close branch lobbies to protect staff and claim routine system upgrades.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Severe credibility loss; immediate regulatory investigation for deceptive practices.',
            tier3: 'Perceived as a coverup.',
            tier2: 'No change.',
            tier1: 'Customers riot outside locked doors; runs on deposits intensify immediately.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'The adversary exploits customer psychology: when ATMs fail, people assume the bank is insolvent.',
      probingQuestions: [
        'What cash limits should branch tellers enforce when core verification is offline?',
        'Does the bank have pre-approved holding statements vetted by Legal and PR for technical outages?',
      ],
      deliberateTraps: [
        'Claiming "it is just scheduled maintenance" when news outlets already have screenshots of cybersecurity ransom notes.',
      ],
      expectedDecisions: [
        'Deploy executive presence to flagship branches and deploy floor managers to answer client questions directly.',
      ],
      regulatoryConsiderations: ['FDIC Consumer Protection and Branch Operating Regulations.'],
    },
    presentationNarration:
      'At 09:15 EDT, the crisis hits the streets in Tier 1. Four hundred cash machines go dark across 185 branches. Viral videos fuel deposit panic as queues stretch out of branch lobbies onto city sidewalks.',
  },

  // INJECT 3.3
  {
    id: '3.3',
    moduleNumber: 3,
    moduleTitle: 'Module 3: Disruption, Impact & Extortion',
    partIndex: 9,
    injectTitle: 'Inject 3.3: Extortion Demand & Glass Heron Proof-of-Breach',
    primaryTierId: 4,
    affectedTiers: [4, 3, 2],
    simulatedDateTime: 'Day 2, 11:30 EDT',
    incidentDate: 'October 25, 2026',
    exerciseTimeOffset: '+07:00:00',
    overview:
      'An encrypted email arrives in the inboxes of the CEO, Board Chair, and Chief Legal Officer from threat actor GLASS HERON. The adversary demands $15 million in Monero (XMR) or Bitcoin (BTC), providing proof-of-possession of 450 GB of customer NPI, executive emails, and core ledger snapshots.',
    operationalImpact:
      'Formal extortion crisis. The Board of Directors must deliberate extortion payment policy, legal prohibitions under OFAC sanctions, and data integrity guarantees.',
    technicalTelemetry: [
      { metricName: 'Ransom Demand', value: '$15,000,000 USD equivalent (Crypto)', isEstimatedOrUnknown: false },
      { metricName: 'Adversary Ultimatums', value: '48 hours before public data leak', isEstimatedOrUnknown: false },
      { metricName: 'Proof-of-Breach Validity', value: 'Verified authentic by SOC Forensics', isEstimatedOrUnknown: false },
      { metricName: 'OFAC Sanctions Status', value: 'Glass Heron nexus under Treasury review', isEstimatedOrUnknown: true },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '11:32 EDT',
        text:
          'Extortion proof delivered. Raven has generated automated proof-of-life snippets highlighting confidential executive tax forms to maximize boardroom distress.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '11:35 EDT',
        text:
          'THREAT ACTOR PROOF VERIFICATION: SHA-256 hashes of leaked samples match DB-PROD-01 client master records. Decryption tool offered by adversary cannot be validated.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Forensic Verification Complete',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '11:38 EDT',
        text:
          'EXECUTIVE POLICY BRIEF: Meridian Trust enterprise policy strictly opposes extortion payments. US Treasury OFAC advisory warns of strict liability penalties for transactions with designated cyber syndicates.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-3.3-ransom',
        injectPartId: '3.3',
        title: 'Glass Heron Extortion Notice & Proof Sample',
        category: 'Threat Intel',
        classification: 'EVIDENCE TIER-1',
        timestamp: 'Day 2, 11:30:14 EDT',
        summary: 'Original ransom email with PGP signature and sample of 100 high-net-worth customer records.',
        technicalDetails: [
          'Sender: glass_heron_support@onionmail.org',
          'Payment: 245 BTC or 78,000 XMR to provided address',
          'Attached File: proof_sample_mtf.csv (100 valid customer records)',
        ],
        rawSnippet: 'To Meridian Trust Board: We hold 450 GB of your corporate data. You have 48 hours to pay $15,000,000.',
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Extortion Policy & Ransom Negotiation: How should the Board of Directors respond to the $15M ransom demand?',
      governanceContext: 'Navigating ethical, legal, and operational dilemmas of ransom negotiation under US Department of the Treasury OFAC regulations.',
      options: [
        {
          id: 'opt-3.3-a',
          label: 'Refuse Payment, Engage Law Enforcement & Pursue Independent Recovery (Recommended)',
          summary: 'Formally reject ransom payment, brief FBI Cyber Division, and focus 100% on clean-room restoration.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'Board upholds legal and corporate governance integrity; avoids OFAC liability.',
            tier3: 'SOC partners directly with FBI cyber specialists.',
            tier2: 'IT team prioritizes air-gapped immutable backup restoration.',
            tier1: 'Customers supported through identity protection packages.',
          },
        },
        {
          id: 'opt-3.3-b',
          label: 'Authorize Extortion Negotiator to Engage for Time Extension',
          summary: 'Hire specialized ransom negotiation firm to open dialogue solely to stall for time.',
          impactScore: 'neutral',
          tierImpact: {
            tier4: 'Buys 24-48 hours of recovery time; risks public discovery of negotiation.',
            tier3: 'Buys time to verify backup integrity.',
            tier2: 'Recovery continues in parallel.',
            tier1: 'Temporary delay in public leak.',
          },
        },
        {
          id: 'opt-3.3-c',
          label: 'Authorize Immediate $15M Cryptocurrency Payment',
          summary: 'Pay the ransom immediately to prevent public exposure of client records.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Extreme OFAC sanctions violation risk; potential personal fines and criminal exposure.',
            tier3: 'No guarantee the adversary will destroy the stolen data.',
            tier2: 'High likelihood of repeated extortion attempts.',
            tier1: 'Bank labeled as a soft target in cyber threat forums.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'GLASS HERON uses double extortion. Even if victims pay for a "decryption tool", they routinely retain and re-monetize the stolen data 6 months later.',
      probingQuestions: [
        'Does Meridian Trust have cyber insurance that covers extortion, and what prerequisites does the underwriter require before any negotiation?',
        'What are the legal implications of paying an entity that may be a front for a sanctioned state actor under OFAC?',
      ],
      deliberateTraps: [
        'Believing that paying the ransom guarantees the adversary will delete their copy of the stolen data.',
      ],
      expectedDecisions: [
        'Report incident immediately to FBI Cyber Division and US Secret Service Cyber Fraud Task Force.',
      ],
      regulatoryConsiderations: ['US Dept of the Treasury OFAC Advisory on Ransomware (October 2020 / Sept 2021).'],
    },
    presentationNarration:
      'At 11:30 EDT, the crisis reaches Tier 4 boardroom governance. Threat actor GLASS HERON demands a $15 million cryptocurrency ransom, attaching verified proof of 450 GB of stolen financial records. The Board confronts OFAC sanctions laws and corporate policy.',
  },

  // INJECT 3.4
  {
    id: '3.4',
    moduleNumber: 3,
    moduleTitle: 'Module 3: Disruption, Impact & Extortion',
    partIndex: 10,
    injectTitle: 'Inject 3.4: Liquidity Strain & Deposit Run Stress Test',
    primaryTierId: 4,
    affectedTiers: [4, 1],
    simulatedDateTime: 'Day 2, 14:45 EDT',
    incidentDate: 'October 25, 2026',
    exerciseTimeOffset: '+08:00:00',
    overview:
      'With news of the ransom demand leaking on financial forums, several large municipal and corporate depositors initiate inquiries to transfer funds to rival banks. Meridian Trust’s available intraday cash buffer faces severe pressure.',
    operationalImpact:
      'Liquidity stress test: Total withdrawal inquiries reach $1.8 Billion against an intraday primary cash reserve of $2.4 Billion. Risk of interbank credit line freezing.',
    technicalTelemetry: [
      { metricName: 'Intraday Primary Liquidity Reserve', value: '$2,400,000,000', isEstimatedOrUnknown: false },
      { metricName: 'Pending Outflow Inquiries', value: '$1,820,000,000 (75% of primary reserve)', isEstimatedOrUnknown: false },
      { metricName: 'Discount Window Pre-pledged Collateral', value: '$4,100,000,000 available at FRB', isEstimatedOrUnknown: false },
      { metricName: 'Interbank Overnight Borrowing Rate', value: 'Spike of +85 bps for Meridian credit', isEstimatedOrUnknown: false },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '14:47 EDT',
        text:
          'Financial bleed phase. Raven telemetry tracks institutional treasury queries draining liquidity buffers.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '14:50 EDT',
        text:
          'FINANCIAL TELEMETRY CORRELATION: Automated alerts flagging concurrent wire requests above $25M threshold. Risk scoring: Extreme capital velocity.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Treasury Risk Alert',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '14:52 EDT',
        text:
          'TREASURY & LIQUIDITY EMERGENCY: CFO recommends opening Federal Reserve Discount Window credit facility immediately to backstop intraday liquidity and preserve clearing confidence.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-3.4-liquidity',
        injectPartId: '3.4',
        title: 'CFO Intraday Liquidity Stress Analysis',
        category: 'Financial',
        classification: 'CONFIDENTIAL',
        timestamp: 'Day 2, 14:45:10 EDT',
        summary: 'Treasury dashboard tracking remaining liquidity runway under simulated 3-day deposit run.',
        technicalDetails: [
          'Primary Cash: $2.4B | Secondary Liquid Assets: $3.8B (US Treasuries)',
          'Federal Reserve Discount Window Facility: Ready for activation',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Liquidity Backstop: Should Meridian Trust formally tap the Federal Reserve Discount Window to guarantee liquidity?',
      governanceContext: 'Borrowing from the Fed guarantees cash availability but may signal distress if leaked to financial markets.',
      options: [
        {
          id: 'opt-3.4-a',
          label: 'Tap Fed Discount Window & Communicate Strength to Clearing Banks (Recommended)',
          summary: 'Access pre-pledged Federal Reserve liquidity and reassure correspondent clearing banks.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'Board solidifies bank liquidity; eliminates insolvency risk.',
            tier3: 'No direct SOC impact.',
            tier2: 'Clearing settlement rails remain fully funded.',
            tier1: 'All legitimate customer cash requests honored in full.',
          },
        },
        {
          id: 'opt-3.4-b',
          label: 'Rely Solely on Existing Internal Cash and Delay Wire Confirmations',
          summary: 'Attempt to survive on existing cash reserves while artificially slowing wire approvals.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Severe reputation damage; clearing partners may suspend settlement privileges.',
            tier3: 'Backlog grows unmanageable.',
            tier2: 'Interbank credit limits frozen by counterparties.',
            tier1: 'Commercial customers file emergency injunctions.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'Modern cyber extortion against financial institutions seeks to induce a liquidity panic, converting a cyber incident into a prudential solvency crisis.',
      probingQuestions: [
        'How does Meridian Trust’s Asset-Liability Committee (ALCO) coordinate with the Cyber Incident Commander during an active attack?',
        'What pre-pledged assets exist with the Federal Reserve Bank for emergency liquidity?',
      ],
      deliberateTraps: [
        'Failing to separate technical cybersecurity remediation from banking balance sheet liquidity management.',
      ],
      expectedDecisions: [
        'Executive proactive outreach to top 20 institutional depositors by the CEO and Head of Commercial Banking.',
      ],
      regulatoryConsiderations: ['Federal Reserve Board Regulation A (Extensions of Credit by Federal Reserve Banks).'],
    },
    presentationNarration:
      'At 14:45 EDT, the attack threatens Tier 4 balance sheet solvency. Rumors of data theft trigger over $1.8 billion in withdrawal inquiries from corporate clients. The Executive Crisis Team evaluates Federal Reserve emergency liquidity backstops to defend the bank.',
  },

  // MODULE 4: CONTAINMENT, RECOVERY & GOVERNANCE
  // INJECT 4.1A: BACKUP INTEGRITY VERIFICATION
  {
    id: '4.1A',
    moduleNumber: 4,
    moduleTitle: 'Module 4: Containment, Recovery & Governance',
    partIndex: 11,
    injectTitle: 'Inject 4.1A: Backup Integrity Verification & Clean-Room Restoration',
    primaryTierId: 2,
    affectedTiers: [2, 3],
    simulatedDateTime: 'Day 3, 08:00 EDT',
    incidentDate: 'October 26, 2026',
    exerciseTimeOffset: '+09:00:00',
    overview:
      'IT Infrastructure teams initiate restoration of core banking ledger DB-PROD-01. However, forensic analysis reveals that online incremental backups from the past 48 hours were accessed by the compromised Apex credentials and may contain dormant web shells. The team must verify air-gapped immutable WORM backups in the clean room before authorizing restoration.',
    operationalImpact:
      'Determination of recovery time objective (RTO). Restoring from immutable air-gapped tape/vault ensures clean state but rolls transaction records back 48 hours, requiring manual ledger reconciliation.',
    technicalTelemetry: [
      { metricName: 'Online Incremental Backups', value: 'COMPROMISED (Tainted by svc-core-sync9)', isEstimatedOrUnknown: false },
      { metricName: 'Air-Gapped Immutable Vault (WORM)', value: 'VERIFIED CLEAN (Cryptographic Hash Match)', isEstimatedOrUnknown: false },
      { metricName: 'Ledger Rollback Delta', value: '48 Hours of Transaction Journals', isEstimatedOrUnknown: false },
      { metricName: 'Transactions Requiring Manual Reconciliation', value: '184,000 journal entries', isEstimatedOrUnknown: true },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '08:02 EDT',
        text:
          'Raven confirms Glass Heron planted a secondary logic delay into the online backup snapshots. If Meridian restores from the online repository, the backdoor will re-execute automatically.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '08:05 EDT',
        text:
          'CLEAN ROOM VALIDATION: Air-gapped immutable storage vault (VAULT-01) hash check passed. Online incremental backups rejected due to unauthorized timestamp modification. Authorize clean-room restore.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Cryptographic Hash Verification Passed',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '08:08 EDT',
        text:
          'EXECUTIVE RECOVERY BRIEF: Restoring from clean immutable vault guarantees system integrity but requires 48-hour transaction journal reconciliation. Board authorization required for reconciliation protocol.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-4.1a-vault',
        injectPartId: '4.1A',
        title: 'Immutable Vault Hash Verification Certificate',
        category: 'Forensics',
        classification: 'EVIDENCE TIER-1',
        timestamp: 'Day 3, 08:00:22 EDT',
        summary: 'Cryptographic attestation certifying air-gapped immutable backup snapshot integrity.',
        technicalDetails: [
          'Storage Appliance: Dell PowerStore WORM Compliance Vault',
          'Snapshot ID: SNAP-2026-10-22-T0000',
          'Status: Uncompromised / Read-Only Enforced',
          'Restoration Time Estimate: 6 hours to isolated clean-room environment',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Core Ledger Restoration Source: Which backup source should the Incident Commander authorize for production restoration?',
      governanceContext: 'Balancing rapid recovery with poisoned backups against slower, verifiable clean-room restoration.',
      options: [
        {
          id: 'opt-4.1a-1',
          label: 'Authorize Air-Gapped Clean-Room Restoration with Manual Journal Replay (Recommended)',
          summary: 'Restore from immutable vault snapshot and replay audited transaction logs.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'Board receives absolute guarantee against reinfection; defensible to regulators.',
            tier3: 'SOC certifies zero malware residue in new environment.',
            tier2: 'Core database rebuilt on clean hardware foundation.',
            tier1: 'Transactions from past 48h re-posted accurately with dual sign-off.',
          },
        },
        {
          id: 'opt-4.1a-2',
          label: 'Fast-Track Restore from Online Incremental Backups',
          summary: 'Restore from online incremental snapshot to save 12 hours of recovery time.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Severe negligence liability if dormant malware re-triggers.',
            tier3: 'Re-infection occurs within 2 hours of power-on.',
            tier2: 'Core banking systems compromised again.',
            tier1: 'Customers face secondary wave of outages.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'Sophisticated adversaries deliberately taint online backup snapshots so victims restore the malware back into production.',
      probingQuestions: [
        'How often does Meridian Trust perform full-scale recovery tests from air-gapped immutable vaults?',
        'How does the accounting team verify whether customer deposits made during the 48-hour gap are accurately restored?',
      ],
      deliberateTraps: [
        'Assuming backups are clean simply because the backup software reported "Job Succeeded."',
      ],
      expectedDecisions: [
        'Mandate isolated clean-room scanning before routing production traffic back to restored instances.',
      ],
      regulatoryConsiderations: ['FFIEC Business Continuity Management IT Examination Handbook.'],
    },
    presentationNarration:
      'At 08:00 EDT on Day 3, the recovery team enters Tier 2 Infrastructure clean rooms. While online incremental backups show signs of tampering, the air-gapped immutable backup vault passes cryptographic verification. Leadership authorizes restoration from the secure offline vault.',
  },

  // INJECT 4.1B: BRANCH LIQUIDITY MANAGEMENT
  {
    id: '4.1B',
    moduleNumber: 4,
    moduleTitle: 'Module 4: Containment, Recovery & Governance',
    partIndex: 12,
    injectTitle: 'Inject 4.1B: Branch Liquidity Logistics & Cash Dispatch',
    primaryTierId: 1,
    affectedTiers: [1, 4],
    simulatedDateTime: 'Day 3, 11:30 EDT',
    incidentDate: 'October 26, 2026',
    exerciseTimeOffset: '+10:00:00',
    overview:
      'With retail branch cash reserves dwindling after 24 hours of elevated withdrawals, Meridian Trust logistics must coordinate armored car cash replenishment across 185 branch locations while digital transaction settlement rails are undergoing restoration.',
    operationalImpact:
      'Physical logistics challenge: Armored carrier fleets (Brink’s / Loomis) face regional routing constraints. Tier-1 branches in major metro centers face potential cash exhaustion within 3 hours without replenishment.',
    technicalTelemetry: [
      { metricName: 'Total Physical Cash Dispatched', value: '$45,000,000 across 6 regional hubs', isEstimatedOrUnknown: false },
      { metricName: 'Armored Carrier Transit Status', value: '18 of 24 convoys en route', isEstimatedOrUnknown: false },
      { metricName: 'Branch Teller Cash Ceiling', value: 'Emergency limit: $3,000 per customer', isEstimatedOrUnknown: false },
      { metricName: 'Branch Cash Depletion Incidents', value: '4 rural branches temporarily dry', isEstimatedOrUnknown: true },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '11:32 EDT',
        text:
          'Physical logistics strain. Adversary bot networks continue amplifying rumors of cash shortages on local social media channels.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '11:35 EDT',
        text:
          'BRANCH TERMINAL SECURITY: Encrypted cellular failover activated for branch teller validation. Teller authentication running over isolated 5G private APNs.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Failover Channel Operational',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '11:38 EDT',
        text:
          'RETAIL BANKING MANDATE: Executive Committee recommends implementing emergency cash withdrawal limits of $3,000 per customer to ensure all waiting retail clients receive cash.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-4.1b-armored',
        injectPartId: '4.1B',
        title: 'Armored Carrier Cash Dispatch & Regional Route Manifest',
        category: 'Financial',
        classification: 'CONFIDENTIAL',
        timestamp: 'Day 3, 11:30:00 EDT',
        summary: 'Emergency logistics coordination document allocating $45M in physical vault currency across 6 regions.',
        technicalDetails: [
          'Carrier: Loomis / Brink’s Secure Transport',
          'Federal Reserve Cash Office: NY Fed East Rutherford Operations Center',
          'Priority: Metro branches with active teller lines exceeding 50 customers',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Branch Cash Rationing Policy: Should Meridian Trust enforce temporary emergency limits on in-person cash withdrawals?',
      governanceContext: 'Balancing customer satisfaction against physical currency exhaustion across regional branch networks.',
      options: [
        {
          id: 'opt-4.1b-1',
          label: 'Establish Temporary $3,000 Cash Limit with Fee Waivers for Digital Transfers (Recommended)',
          summary: 'Conserve physical cash while providing fee-free expedited digital wire alternatives.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'Ensures physical cash survives until evening replenishment arrives.',
            tier3: 'No cybersecurity impact.',
            tier2: 'Digital transfer queues prioritized on restored rails.',
            tier1: '100% of waiting retail customers receive cash for immediate needs.',
          },
        },
        {
          id: 'opt-4.1b-2',
          label: 'Permit Unlimited Cash Withdrawals Until Branch Vaults are Completely Empty',
          summary: 'Allow first-come, first-served withdrawals without limits.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Severe reputation fallout when afternoon customers find empty vaults.',
            tier3: 'No change.',
            tier2: 'No change.',
            tier1: 'First 10 customers drain the vault; remaining 80 customers stranded in panic.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'When cyber attacks hit banks, physical currency logistics become the battleground for consumer confidence.',
      probingQuestions: [
        'How does branch security manage physical crowd control if a branch runs completely out of cash?',
        'What emergency police liaisons exist to protect armored carrier deliveries during high-profile bank emergencies?',
      ],
      deliberateTraps: [
        'Failing to communicate cash rationing policy clearly to branch managers before enforcing it at the teller window.',
      ],
      expectedDecisions: [
        'Provide branch managers with clear script explanations reassuring clients that balances remain intact.',
      ],
      regulatoryConsiderations: ['OCC Branch Operations Guidelines and Consumer Banking Safety Rules.'],
    },
    presentationNarration:
      'Simultaneously in Tier 1, the battlefield shifts to physical cash logistics. Armored carrier fleets deliver $45 million in Federal Reserve currency to 185 retail branches, while the bank implements fair withdrawal limits to ensure every waiting customer receives cash.',
  },

  // INJECT 4.2: COMPREHENSIVE THREAT ERADICATION
  {
    id: '4.2',
    moduleNumber: 4,
    moduleTitle: 'Module 4: Containment, Recovery & Governance',
    partIndex: 13,
    injectTitle: 'Inject 4.2: Threat Eradication & Sentinel Credential Purge',
    primaryTierId: 3,
    affectedTiers: [3, 2],
    simulatedDateTime: 'Day 4, 04:00 EDT',
    incidentDate: 'October 27, 2026',
    exerciseTimeOffset: '+11:30:00',
    overview:
      'With core systems restored in clean rooms, the SOC executes comprehensive eradication. SENTINEL coordinates the global purge: revoking all vendor federation certificates, performing an enterprise-wide krbtgt double-reset, re-imaging compromised jump hosts, and pushing immutable firewall rules.',
    operationalImpact:
      'Final containment and eradication of GLASS HERON’s persistence. All internal accounts, service principals, and API tokens refreshed with fresh cryptographic seeds.',
    technicalTelemetry: [
      { metricName: 'Active Directory krbtgt Reset', value: 'Double-Reset Executed (Zero Persistence)', isEstimatedOrUnknown: false },
      { metricName: 'Vendor Federation Tokens Revoked', value: '184 tokens invalidated', isEstimatedOrUnknown: false },
      { metricName: 'Endpoints Re-imaged from Golden Image', value: '12 jump hosts & 4 core servers', isEstimatedOrUnknown: false },
      { metricName: 'Remaining Adversary Footprint', value: '0 Confirmed Artifacts (Clean Scan)', isEstimatedOrUnknown: false },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '04:02 EDT',
        text:
          'Adversary eviction confirmed. GLASS HERON has lost all interactive control, Kerberos tickets, and secondary WMI hooks across the Meridian Trust infrastructure.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Adversarial Intel',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '04:05 EDT',
        text:
          'ENTERPRISE ERADICATION COMPLETE: Domain krbtgt double-reset validated. All Apex Managed Services tunnels revoked. EDR telemetry across 3,400 endpoints reports clean baseline.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Eradication & Hardening Successful',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '04:08 EDT',
        text:
          'EXECUTIVE CERTIFICATION: Security leadership certifies technical eradication to the Board. Core banking systems cleared for scheduled 08:00 production resumption.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-4.2-eradication',
        injectPartId: '4.2',
        title: 'Forensic Eradication Attestation & Hash Verification',
        category: 'Forensics',
        classification: 'EVIDENCE TIER-1',
        timestamp: 'Day 4, 04:00:15 EDT',
        summary: 'Third-party incident response firm formal attestation confirming full eviction of Glass Heron.',
        technicalDetails: [
          'Lead IR Firm: Mandiant / CrowdStrike Retainer Lead',
          'Scope: 3,420 endpoints, 48 domain controllers, 16 cloud subscriptions',
          'Status: Clean bill of health for production restart',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Production Resumption Sign-Off: Does the Executive Committee authorize full return to production for all 185 branches and wire gateways?',
      governanceContext: 'Final operational authorization returning the financial institution to standard commerce.',
      options: [
        {
          id: 'opt-4.2-a',
          label: 'Authorize Phased Production Resumption with 24/7 Threat Hunting (Recommended)',
          summary: 'Authorize phased restart with continuous heightened SOC surveillance and rate limiting.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'Board and CEO restore commercial banking operations with full legal sign-off.',
            tier3: 'SOC maintains heightened continuous hunting posture.',
            tier2: 'Core banking ledger, Fedwire, and ACH gateways return online.',
            tier1: '185 branches and 420 ATMs reopen with normal operations.',
          },
        },
        {
          id: 'opt-4.2-b',
          label: 'Delay Production Another 48 Hours for Additional Redundancy Audits',
          summary: 'Keep banking systems restricted for two additional days of testing.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Unnecessary commercial losses and customer defection.',
            tier3: 'Diminishing forensic returns.',
            tier2: 'Excessive business interruption.',
            tier1: 'Severe customer dissatisfaction when systems are technically ready.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'GLASS HERON retreats to secondary cyber extortion targets once full krbtgt eviction and forensic locks are verified.',
      probingQuestions: [
        'What governance steps ensure that Apex Managed Services cannot reconnect until their own internal network is audited and certified?',
        'How does Meridian Trust handle third-party vendor contract liability for the breach damages?',
      ],
      deliberateTraps: [
        'Reconnecting the third-party vendor without demanding independent proof of their remediation.',
      ],
      expectedDecisions: [
        'Permanently terminate or suspend Apex Managed Services contract pending forensic audit.',
      ],
      regulatoryConsiderations: ['FFIEC Vendor Risk Management Guidelines.'],
    },
    presentationNarration:
      'At 04:00 EDT on Day 4, Tier 3 SOC engineers execute decisive eradication. A domain-wide Kerberos double reset purges all adversary credentials, while SENTINEL locks all third-party conduits. The CISO certifies the network clean.',
  },

  // INJECT 4.3: POST-INCIDENT REVIEW & BOARD ACCOUNTABILITY
  {
    id: '4.3',
    moduleNumber: 4,
    moduleTitle: 'Module 4: Containment, Recovery & Governance',
    partIndex: 14,
    injectTitle: 'Inject 4.3: Post-Incident Review, Board Accountability & SEC/NYDFS Reporting',
    primaryTierId: 4,
    affectedTiers: [4, 3, 2, 1],
    simulatedDateTime: 'Day 4, 16:30 EDT',
    incidentDate: 'October 27, 2026',
    exerciseTimeOffset: '+12:45:00',
    overview:
      'With systems restored and operations stabilized, the Board of Directors convenes for the formal Post-Incident Review. Executive leadership finalizes the SEC Form 8-K disclosure, coordinates NYDFS comprehensive post-incident filings, authorizes customer credit monitoring packages, and institutes vendor risk governance overhauls.',
    operationalImpact:
      'Transition from active tactical crisis response to strategic accountability, regulatory compliance, litigation defense, and long-term enterprise resilience.',
    technicalTelemetry: [
      { metricName: 'SEC Form 8-K Item 1.05 Filing', value: 'Submitted to EDGAR (On Time)', isEstimatedOrUnknown: false },
      { metricName: 'NYDFS Post-Incident Report', value: 'Filed with Superintendent', isEstimatedOrUnknown: false },
      { metricName: 'Affected Customers Notified', value: '280,000 notice packets queued with 24-month monitoring', isEstimatedOrUnknown: false },
      { metricName: 'Vendor Governance Overhaul', value: 'Zero-Trust Architecture Mandate Approved', isEstimatedOrUnknown: false },
    ],
    agentsOutput: [
      {
        agentId: 'raven',
        agentName: 'RAVEN (Threat Intelligence Aide)',
        roleTitle: 'Red Team Adversary Analyzer',
        badgeColor: '#e11d48',
        timestamp: '16:32 EDT',
        text:
          'Operation Silent Ledger concludes. Threat actor GLASS HERON failed to extort $15M from Meridian Trust, but successfully exposed systemic third-party vendor risks in the banking supply chain.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Facilitator Only — Scenario Debrief',
        isFacilitatorOnly: true,
      },
      {
        agentId: 'sentinel',
        agentName: 'SENTINEL (Security Correlation Engine)',
        roleTitle: 'Blue Team Automated Correlation',
        badgeColor: '#06b6d4',
        timestamp: '16:35 EDT',
        text:
          'AFTER-ACTION AUDIT: 14,800 telemetry artifacts sealed. Recommendation: Implement mandatory hardware token separation for all Tier 2/3 human authorization workflows.',
        scriptedBadge: '[Scripted Simulation Content]',
        metadataNotice: 'Continuous Improvement Plan',
      },
      {
        agentId: 'compass',
        agentName: 'COMPASS (Executive Advisory Support)',
        roleTitle: 'Executive Decision Advisor',
        badgeColor: '#f59e0b',
        timestamp: '16:38 EDT',
        text:
          'EXECUTIVE BOARD SUMMARY: Meridian Trust survived the crisis with balance sheet intact and no ransom paid. SEC and NYDFS regulatory filings completed within statutory deadlines. Lessons learned incorporated into enterprise risk matrix.',
        scriptedBadge: '[Scripted Simulation Content]',
      },
    ],
    evidencePackets: [
      {
        id: 'ev-4.3-8k',
        injectPartId: '4.3',
        title: 'SEC Form 8-K Item 1.05 & Press Release',
        category: 'Communications',
        classification: 'CONFIDENTIAL',
        timestamp: 'Day 4, 16:30:00 EDT',
        summary: 'Final public disclosure detailing the nature and scope of the cybersecurity incident and mitigation actions.',
        technicalDetails: [
          'Commission File Number: 001-38491 (Meridian Trust Financial Corp)',
          'Item 1.05 Material Cybersecurity Incidents: Disclosed',
          'Customer Remediation: Free 2-year credit monitoring and $1M identity insurance policy',
        ],
        isReleased: false,
      },
    ],
    decisionPrompt: {
      prompt: 'Post-Incident Governance & Capital Allocation: What primary long-term strategic initiative should the Board mandate?',
      governanceContext: 'Directing capital allocation and governance reform following a major cybersecurity crisis.',
      options: [
        {
          id: 'opt-4.3-a',
          label: 'Mandate Zero-Trust Vendor Architecture & Automated Air-Gap Vaults (Recommended)',
          summary: 'Approve $18M capital allocation for micro-segmented third-party access and immutable backup automation.',
          impactScore: 'positive',
          tierImpact: {
            tier4: 'Demonstrates gold-standard proactive governance to shareholders and regulators.',
            tier3: 'SOC gains automated zero-trust enforcement tools.',
            tier2: 'Third-party vendor conduits isolated to ephemeral micro-tunnels.',
            tier1: 'Customers and business partners experience world-class financial security.',
          },
        },
        {
          id: 'opt-4.3-b',
          label: 'Limit Actions to Terminating Apex Contract Without Architecture Changes',
          summary: 'Blame the vendor entirely and avoid capital investments in architectural hardening.',
          impactScore: 'hazardous',
          tierImpact: {
            tier4: 'Board remains vulnerable to shareholder derivative lawsuits for failure of oversight.',
            tier3: 'Underlying architectural vulnerabilities remain unpatched.',
            tier2: 'Next vendor compromise will reproduce identical breach.',
            tier1: 'Continued reputational vulnerability.',
          },
        },
      ],
    },
    facilitatorGuidance: {
      adversaryStrategy:
        'GLASS HERON pivots to other financial institutions that haven’t hardened vendor conduits or practiced multi-tier tabletop exercises.',
      probingQuestions: [
        'How does the Board evaluate whether the CEO, CISO, and CRO executed their fiduciary responsibilities during the crisis?',
        'What metrics will Meridian Trust present to the NYDFS Superintendent during the mandatory post-incident regulatory examination?',
      ],
      deliberateTraps: [
        'Declaring total victory simply because the bank didn’t collapse, ignoring the millions spent on forensic remediation and customer notification.',
      ],
      expectedDecisions: [
        'Establish an independent Board Cybersecurity Committee and mandate bi-annual tabletop simulations with executive leadership.',
      ],
      regulatoryConsiderations: [
        'SEC Cyber Risk Governance Rules, NYDFS 500.04 (CISO Reporting to Board), FFIEC BCM Handbook.',
      ],
    },
    presentationNarration:
      'In Tier 4 Boardroom Governance, Operation Silent Ledger concludes. The Board finalizes regulatory disclosures under SEC Form 8-K and NYDFS frameworks, rejects extortion payments, and approves a decisive zero-trust architecture overhaul to protect Meridian Trust Financial.',
  },
];

// Department nodes mapped specifically to Meridian Trust Financial across the 4 Tiers
export const MERIDIAN_ORG_LEVELS: OrgLevelInfo[] = [
  {
    id: 4,
    name: 'Level 4: Executive Crisis Team & Governance',
    subname: 'Boardroom, Legal Counsel, Chief Risk Officer & Regulatory Affairs',
    yPosition: 11.5,
    accentColor: '#f59e0b', // Amber / Gold
    description:
      'Strategic crisis command, emergency board communications, NYDFS/SEC regulatory disclosure obligations, and enterprise liquidity preservation.',
    imageUrl: executiveCenterImg,
    imageAlt: 'Meridian Trust Executive Command Center & Boardroom',
    systemArchitecture: 'High-Availability Governance Hub & Encrypted Crisis Comms Mesh',
    hardwareCluster: '16x Secure Tier-0 Command Blades & Air-Gapped Key Enclaves',
    rackCount: 6,
    totalPduPowerKw: 36.4,
    kpis: {
      primaryMetric: 'Executive Alignment',
      primaryValue: '98.2%',
      efficiency: 94,
      velocity: '45m / Briefing',
    },
    departments: [
      {
        id: 'dept-exec-board',
        levelId: 4,
        name: 'Executive Board & Office of CEO',
        category: 'Leadership & Fiduciary Duty',
        headcount: 12,
        health: 96,
        throughput: 110,
        load: 85,
        activeInitiative: 'Operation Silent Ledger Crisis Governance',
        position: [0, 11.8, 0],
        color: '#f59e0b',
        blockers: [],
        hardware: {
          serverChassis: 'HPE Superdome Flex 280 Enterprise Server',
          rackUnits: '42U Enclosure EX-01',
          processor: '8x Intel Xeon Platinum 8490H (480 Cores)',
          memoryRam: '4.0 TB DDR5-4800 Registered ECC',
          storageSan: '96 TB Encrypted NVMe Tier-0 SAN',
          powerDrawKw: 4.8,
          networkFabric: 'Quad 100GbE RoCEv2 Encrypted Spine',
          coolingMode: 'Closed-Loop Chilled Liquid Manifold',
          operatingTempC: 19.8,
        },
      },
      {
        id: 'dept-exec-legal',
        levelId: 4,
        name: 'Legal, Risk & Regulatory Affairs',
        category: 'Compliance & SEC/NYDFS Oversight',
        headcount: 18,
        health: 92,
        throughput: 180,
        load: 90,
        activeInitiative: 'NYDFS 72h Clock & SEC 8-K Item 1.05 Filing',
        position: [-3.2, 11.5, -2.2],
        color: '#fbbf24',
        blockers: [],
        hardware: {
          serverChassis: 'Dell PowerEdge R860 Mission Critical Blade',
          rackUnits: '42U Enclosure EX-02',
          processor: '4x Intel Xeon Gold 6448Y (128 Cores)',
          memoryRam: '2.0 TB DDR5-4800 ECC',
          storageSan: '128 TB Immutable WORM Compliance SAN',
          powerDrawKw: 3.9,
          networkFabric: 'Dual 100GbE Spine Uplink',
          coolingMode: 'N+1 Hot-Aisle Redundant Fan Wall',
          operatingTempC: 20.4,
        },
      },
      {
        id: 'dept-exec-compass',
        levelId: 4,
        name: 'Compass Decision Support Enclave',
        category: 'Executive Decision Advisor',
        headcount: 8,
        health: 78,
        throughput: 240,
        load: 95,
        activeInitiative: 'Threat Synthesis & Ticket Lag Monitoring',
        position: [3.2, 11.5, 2.2],
        color: '#d97706',
        blockers: ['Ticket Feed Latency Warning'],
        hardware: {
          serverChassis: 'Cisco UCS B480 M5 High-Compute Enclave',
          rackUnits: '42U Enclosure EX-03',
          processor: '4x Intel Xeon Gold 6254 (72 Cores)',
          memoryRam: '1.5 TB DDR4 ECC',
          storageSan: '250 TB Secure Analytics Storage',
          powerDrawKw: 3.4,
          networkFabric: 'Dual 40GbE Secure FCoE Fabric',
          coolingMode: 'Rear-Door Heat Exchanger (RDHx)',
          operatingTempC: 21.0,
        },
      },
    ],
  },
  {
    id: 3,
    name: 'Level 3: SOC, Identity & Incident Response',
    subname: 'Security Operations, Active Directory/IAM, Threat Intel & Sentinel AI Core',
    yPosition: 7.2,
    accentColor: '#06b6d4', // Cyan / Electric Blue
    description:
      'Continuous monitoring, SIEM correlation, automated Tier 1 containment, multi-factor credential governance, and forensic triage of threat actor persistence.',
    imageUrl: engineeringLabImg,
    imageAlt: 'Meridian Trust Security Operations Center & Sentinel AI Core',
    systemArchitecture: 'High-Throughput SIEM Event Mesh & Sentinel Correlation Pipeline',
    hardwareCluster: '64x Dual-Socket Threat Hunting Compute Nodes',
    rackCount: 12,
    totalPduPowerKw: 72.8,
    kpis: {
      primaryMetric: 'Threat Intercept Rate',
      primaryValue: '99.1%',
      efficiency: 89,
      velocity: '12s / Correlated Alert',
    },
    departments: [
      {
        id: 'dept-soc-sentinel',
        levelId: 3,
        name: 'Sentinel Security Correlation Engine',
        category: 'Automated Tier 1 & Gated Tier 2/3',
        headcount: 14,
        health: 94,
        throughput: 2800,
        load: 88,
        activeInitiative: 'Multi-Stage Alert Correlation & Session Revocation',
        position: [-3.4, 7.2, 1.8],
        color: '#06b6d4',
        blockers: [],
        hardware: {
          serverChassis: 'Dell PowerEdge R760xa Accelerated Computing Node',
          rackUnits: '42U Enclosure SOC-01',
          processor: 'Dual AMD EPYC 9654 (192 Cores)',
          memoryRam: '1.5 TB DDR5-4800 Registered ECC',
          storageSan: '120 TB High-IOPS NVMe Array',
          powerDrawKw: 5.6,
          networkFabric: 'Dual 200GbE RoCEv2 Fabric',
          coolingMode: 'Active Direct Liquid-to-Chip Loop',
          operatingTempC: 22.4,
        },
      },
      {
        id: 'dept-soc-iam',
        levelId: 3,
        name: 'Identity & Access Management (IAM)',
        category: 'Active Directory & Kerberos Governance',
        headcount: 24,
        health: 82,
        throughput: 940,
        load: 86,
        activeInitiative: 'krbtgt Double-Reset & Rogue Account Eviction',
        position: [3.4, 7.2, -1.8],
        color: '#38bdf8',
        blockers: ['Shadow Account svc-core-sync9 Quarantined'],
        hardware: {
          serverChassis: 'HPE ProLiant DL380 Gen11 IAM Domain Controller',
          rackUnits: '42U Enclosure SOC-02',
          processor: 'Dual Intel Xeon Gold 6430 (64 Cores)',
          memoryRam: '512 GB DDR5 Registered ECC',
          storageSan: '48 TB Encrypted SSD RAID-10',
          powerDrawKw: 3.1,
          networkFabric: 'Quad 25GbE Redundant Fabric',
          coolingMode: 'Variable-Speed Fan Array',
          operatingTempC: 21.8,
        },
      },
      {
        id: 'dept-soc-csirt',
        levelId: 3,
        name: 'CSIRT & Digital Forensics Lab',
        category: 'Incident Commander & Threat Hunting',
        headcount: 32,
        health: 88,
        throughput: 620,
        load: 92,
        activeInitiative: 'Memory Capture & Glass Heron Attribution',
        position: [0, 7.2, -3.2],
        color: '#0284c7',
        blockers: [],
        hardware: {
          serverChassis: 'Lenovo ThinkSystem SR650 V3 Forensic Server',
          rackUnits: '42U Enclosure SOC-03',
          processor: 'Dual Intel Xeon Platinum 8468 (96 Cores)',
          memoryRam: '1.0 TB DDR5-4800 ECC',
          storageSan: '320 TB Immutable Write-Once Evidence Repository',
          powerDrawKw: 4.2,
          networkFabric: 'Dual 100GbE Spine Uplink',
          coolingMode: 'Air-Cooled Hot/Cold Aisle Containment',
          operatingTempC: 20.9,
        },
      },
    ],
  },
  {
    id: 2,
    name: 'Level 2: Banking Infrastructure, Vendor Connections & Backups',
    subname: 'Core Ledger, Managed IT Provider VPN, Fedwire/ACH Gateways & Immutable Vaults',
    yPosition: 3.6,
    accentColor: '#10b981', // Emerald / Teal
    description:
      'Real-time core ledger processing, interbank settlement rails, third-party vendor conduits (Apex Managed Services), and air-gapped immutable backup repositories.',
    imageUrl: datacenterRacksImg,
    imageAlt: 'Meridian Trust Core Datacenter Server Racks & Fedwire Hub',
    systemArchitecture: 'Zero-Downtime Multi-Cluster Banking Fabric & WORM Vaults',
    hardwareCluster: '128x Fault-Tolerant Transaction Processing Blades',
    rackCount: 24,
    totalPduPowerKw: 118.6,
    kpis: {
      primaryMetric: 'Core Settlement Velocity',
      primaryValue: '18,400 Tx/s',
      efficiency: 91,
      velocity: '14ms Avg Latency',
    },
    departments: [
      {
        id: 'dept-infra-ledger',
        levelId: 2,
        name: 'Core Banking Ledger (DB-PROD-01)',
        category: 'Relational Transaction Engine',
        headcount: 22,
        health: 86,
        throughput: 14200,
        load: 84,
        activeInitiative: 'Clean-Room Restoration & Journal Replay',
        position: [-3.8, 3.6, -1.8],
        color: '#10b981',
        blockers: [],
        hardware: {
          serverChassis: 'Oracle Exadata X9M-2 Enterprise Database Machine',
          rackUnits: '42U Enclosure INFRA-01',
          processor: 'Dual AMD EPYC 7763 (128 Cores per Node)',
          memoryRam: '2.0 TB DDR4-3200 ECC per Node',
          storageSan: '500 TB High-Capacity NVMe Flash Grid',
          powerDrawKw: 6.8,
          networkFabric: 'Dual 100GbE RoCEv2 Fabric',
          coolingMode: 'Closed-Loop Liquid-Cooled Manifold',
          operatingTempC: 20.1,
        },
      },
      {
        id: 'dept-infra-vendor',
        levelId: 2,
        name: 'Apex Vendor Conduit & Gateway',
        category: 'Third-Party Managed Services Tunnel',
        headcount: 10,
        health: 64,
        throughput: 840,
        load: 92,
        activeInitiative: 'Severed Tunnel & Token Revocation',
        position: [3.8, 3.6, 1.8],
        color: '#059669',
        blockers: ['Compromised Credentials svc-apex-mgmt'],
        hardware: {
          serverChassis: 'Palo Alto Networks PA-5450 Next-Gen Firewall',
          rackUnits: '42U Enclosure INFRA-02',
          processor: 'Multi-Core Dedicated Cryptographic Acceleration ASICs',
          memoryRam: '256 GB ECC System RAM',
          storageSan: '32 TB Encrypted Log Appliance',
          powerDrawKw: 3.8,
          networkFabric: '100GbE QSFP28 Uplinks',
          coolingMode: 'Hot-Swappable High-CFM Fan Trays',
          operatingTempC: 23.2,
        },
      },
      {
        id: 'dept-infra-vault',
        levelId: 2,
        name: 'Air-Gapped Immutable Backup Vault',
        category: 'WORM Compliance Repository',
        headcount: 12,
        health: 98,
        throughput: 4800,
        load: 72,
        activeInitiative: 'Cryptographic Hash Verification & Clean Restore',
        position: [0, 3.6, 3.6],
        color: '#34d399',
        blockers: [],
        hardware: {
          serverChassis: 'Dell PowerStore 5000T Immutable WORM Appliance',
          rackUnits: '42U Enclosure INFRA-03',
          processor: 'Quad Intel Xeon Gold 6338 (128 Cores)',
          memoryRam: '1.5 TB DDR4 ECC',
          storageSan: '1.2 PB Immutable WORM Solid-State Repository',
          powerDrawKw: 5.1,
          networkFabric: 'Isolated Out-of-Band Optical Fiber',
          coolingMode: 'Air-Cooled RDHx Chilled Door',
          operatingTempC: 19.4,
        },
      },
    ],
  },
  {
    id: 1,
    name: 'Level 1: Customers, Branches, Payments & Business Impact',
    subname: 'Retail Branches, ATM Fleet, Mobile Banking Gateway & Commercial Treasury',
    yPosition: 0.5,
    accentColor: '#f43f5e', // Rose / Red
    badge: 'FIELD OPERATIONS & CLIENT FACING',
    description:
      '185 branch operations, 420 cash machines, commercial treasury wire services, customer call centers, and regional public deposit confidence.',
    imageUrl: edgeNocImg,
    imageAlt: 'Meridian Trust Retail Network NOC & ATM Operations Center',
    systemArchitecture: 'Distributed Edge Banking Network & Branch Micro-Hubs',
    hardwareCluster: '420x Hardened Edge ATM Gateways & 185 Branch Servers',
    rackCount: 32,
    totalPduPowerKw: 94.2,
    kpis: {
      primaryMetric: 'Branch Availability',
      primaryValue: '94.2%',
      efficiency: 88,
      velocity: '185 Branches Active',
    },
    departments: [
      {
        id: 'dept-retail-branches',
        levelId: 1,
        name: '185 Retail Branches & Cash Vaults',
        category: 'In-Person Teller Operations',
        headcount: 1420,
        health: 84,
        throughput: 42000,
        load: 90,
        activeInitiative: 'Armored Truck Cash Dispatch ($45M Allocated)',
        position: [-3.8, 0.5, -2.4],
        color: '#f43f5e',
        blockers: [],
        hardware: {
          serverChassis: '185x Cisco Catalyst 9300 Branch Edge Switches',
          rackUnits: '24U Branch Enclosures',
          processor: 'Quad-Core ARM Edge Telemetry Processors',
          memoryRam: '32 GB per Branch Node',
          storageSan: '2 TB Encrypted Local NVMe Vault',
          powerDrawKw: 1.2,
          networkFabric: 'Dual 5G Cellular + SD-WAN Hybrid Fabric',
          coolingMode: 'Convection-Cooled Acoustic Quiet-Rack',
          operatingTempC: 22.0,
        },
      },
      {
        id: 'dept-retail-atm',
        levelId: 1,
        name: '420 Regional ATM Terminal Fleet',
        category: 'Cash Machine Network & Mobile Gateway',
        headcount: 48,
        health: 72,
        throughput: 8900,
        load: 86,
        activeInitiative: 'ATM Restoration & Host Reconnection',
        position: [3.8, 0.5, -2.4],
        color: '#fb7185',
        blockers: ['Timeout Errors on 378 ATMs'],
        hardware: {
          serverChassis: 'NCR SelfServ 84 Hardened Banking Appliances',
          rackUnits: 'Vault Safe Encrypted Core',
          processor: 'Intel Core i7 Embedded vPro Architecture',
          memoryRam: '16 GB ECC RAM',
          storageSan: '512 GB Hardware-Encrypted SSD',
          powerDrawKw: 0.45,
          networkFabric: 'Encrypted Private Cellular APN',
          coolingMode: 'Thermal Regulated Outdoor Vault Blower',
          operatingTempC: 24.5,
        },
      },
      {
        id: 'dept-retail-treasury',
        levelId: 1,
        name: 'Commercial Treasury & Wholesale Wires',
        category: 'Corporate Payroll & Interbank Fedwire Rails',
        headcount: 64,
        health: 88,
        throughput: 18400,
        load: 92,
        activeInitiative: 'Secondary Out-of-Band Wire Verification',
        position: [0, 0.5, 3.4],
        color: '#e11d48',
        blockers: [],
        hardware: {
          serverChassis: 'IBM Power Systems S1024 High-Security Transaction Server',
          rackUnits: '42U Enclosure TREASURY-01',
          processor: '24x IBM POWER10 Cores (3.4 GHz)',
          memoryRam: '1.0 TB DDR4 Registered ECC',
          storageSan: '64 TB All-Flash Dual-Mirror Array',
          powerDrawKw: 4.8,
          networkFabric: 'Dual 10GbE FCoE Secure Rails',
          coolingMode: 'Chilled Air Plenum Containment',
          operatingTempC: 20.8,
        },
      },
    ],
  },
];
