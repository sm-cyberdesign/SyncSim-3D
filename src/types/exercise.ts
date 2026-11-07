/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppMode = 'presentation' | 'exercise';

export type TierLevelId = 1 | 2 | 3 | 4;

export interface TierDefinition {
  id: TierLevelId;
  name: string;
  subname: string;
  yPosition: number;
  accentColor: string;
  badge: string;
  description: string;
  operationalStakeholder: string;
  activeCompromiseLevel: 'nominal' | 'elevated' | 'critical' | 'contained';
}

export type AgentId = 'raven' | 'sentinel' | 'compass';

export interface AgentDialogue {
  agentId: AgentId;
  agentName: string;
  roleTitle: string;
  badgeColor: string;
  timestamp: string;
  text: string;
  scriptedBadge: string; // e.g. "[Scripted Simulation Content]"
  metadataNotice?: string; // e.g. "Facilitator Only - Adversarial Intel" or "Tier 1 Automated Action"
  isFacilitatorOnly?: boolean;
  staleWarning?: boolean;
}

export interface EvidencePacket {
  id: string;
  injectPartId: string;
  title: string;
  category: 'Forensics' | 'Network' | 'Identity' | 'Threat Intel' | 'Financial' | 'Communications';
  classification: 'CONFIDENTIAL' | 'RESTRICTED' | 'EVIDENCE TIER-1';
  timestamp: string;
  summary: string;
  technicalDetails: string[];
  rawSnippet?: string;
  isReleased: boolean;
}

export interface DecisionOption {
  id: string;
  label: string;
  summary: string;
  impactScore: 'positive' | 'neutral' | 'hazardous';
  tierImpact: {
    tier4: string;
    tier3: string;
    tier2: string;
    tier1: string;
  };
}

export interface DecisionRecord {
  injectPartId: string;
  decisionPrompt: string;
  options: DecisionOption[];
  selectedOptionId?: string;
  playerRationale?: string;
  authorizedBy?: string;
  recordedAtTimestamp?: string;
}

export interface FacilitatorGuidance {
  adversaryStrategy: string; // Behind-the-scenes Glass Heron & Raven maneuvers
  probingQuestions: string[]; // Facilitator questions for table discussion
  deliberateTraps: string[]; // Traps players may fall into
  expectedDecisions: string[]; // Sound playbook responses
  regulatoryConsiderations: string[]; // NYDFS 500, GLBA, SEC 8-K, GDPR
}

export interface ScenarioInjectPart {
  id: string; // e.g. "1.1", "4.1A", "4.1B"
  moduleNumber: 1 | 2 | 3 | 4;
  moduleTitle: string;
  partIndex: number; // 0 to 14
  injectTitle: string;
  primaryTierId: TierLevelId;
  affectedTiers: TierLevelId[];
  simulatedDateTime: string; // e.g. "Day 1, 04:15 EDT"
  incidentDate: string; // e.g. "October 24, 2026"
  exerciseTimeOffset: string; // e.g. "+00:15:00"
  overview: string;
  operationalImpact: string;
  technicalTelemetry: {
    metricName: string;
    value: string;
    isEstimatedOrUnknown: boolean;
  }[];
  agentsOutput: AgentDialogue[];
  evidencePackets: EvidencePacket[];
  decisionPrompt?: {
    prompt: string;
    governanceContext: string;
    options: DecisionOption[];
  };
  facilitatorGuidance: FacilitatorGuidance;
  presentationNarration: string;
}

export interface ModuleDefinition {
  moduleNumber: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  timeframe: string;
  primaryFocus: string;
  injectCount: number;
}
