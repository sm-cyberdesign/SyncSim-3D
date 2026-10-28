/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SimulationMode = 'live' | 'historical';

export type CameraPreset = 'overview' | 'executive' | 'engineering' | 'cloud' | 'market' | 'cinematic';

export interface DepartmentNode {
  id: string;
  levelId: number; // 1: Market, 2: Cloud, 3: Engineering, 4: Executive
  name: string;
  category: string;
  headcount: number;
  health: number; // 0 - 100
  throughput: number; // ops/sec or tasks/hr
  load: number; // 0 - 100%
  activeInitiative: string;
  position: [number, number, number]; // [x, y, z] relative or world
  color: string;
  blockers: string[];
}

export interface OrgLevelInfo {
  id: number;
  name: string;
  subname: string;
  yPosition: number;
  accentColor: string;
  description: string;
  kpis: {
    primaryMetric: string;
    primaryValue: string;
    efficiency: number;
    velocity: string;
  };
  departments: DepartmentNode[];
}

export interface SimulationParameters {
  workloadDemand: number; // 10% - 200%
  automationRate: number; // 0% - 100%
  crossDeptLatency: number; // 1x - 5x (delay multiplier)
  incidentRate: number; // 0% - 20%
  rdBudgetMultiplier: number; // 0.5x - 3.0x
  talentDensity: number; // 50% - 150%
}

export interface TelemetryPoint {
  timestamp: number; // seconds into simulation or unix
  systemThroughput: number;
  efficiencyIndex: number;
  cycleTimeHours: number;
  errorRatePercent: number;
  activePackets: number;
  revenuePerMin: number;
}

export interface HistoricalSnapshot {
  id: string;
  title: string;
  date: string;
  description: string;
  durationSeconds: number;
  parameters: SimulationParameters;
  avgEfficiency: number;
  peakThroughput: number;
  incidentCount: number;
  summaryHighlights: string[];
  telemetryHistory: TelemetryPoint[];
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  status: 'active' | 'editing' | 'idle';
  currentFocusLevel?: number;
  cursorPos?: [number, number, number];
}

export interface SpatialAnnotation {
  id: string;
  authorId: string;
  authorName: string;
  levelId: number;
  position: [number, number, number];
  content: string;
  createdAt: string;
  votes: number;
}

export interface ParameterProposal {
  id: string;
  proposerName: string;
  title: string;
  description: string;
  changes: Partial<SimulationParameters>;
  votesYes: number;
  votesNo: number;
  hasUserVoted?: boolean;
}

export interface LiveEvent {
  id: string;
  levelId: number;
  levelName: string;
  departmentId?: string;
  departmentName?: string;
  title: string;
  detail: string;
  badge: string;
  badgeColor: string;
  timestamp: string;
  voicePhrase?: string;
}

export interface CinematicStep {
  id: number;
  title: string;
  phase: string;
  focusLevel: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  narration: string;
  durationMs: number;
}
