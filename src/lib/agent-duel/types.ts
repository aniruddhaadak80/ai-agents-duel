export type DuelSide = "left" | "right";

export type AgentStatus = "ready" | "running" | "paused" | "degraded";

export type RunStatus = "queued" | "running" | "completed" | "needs-review" | "failed";

export type AutonomyMode = "guardrailed" | "supervised" | "aggressive";

export type PublishTarget = "notion" | "slack" | "linear";

export type EscalationPolicy = "human-first" | "confidence-threshold" | "sla-first";

export type AgentProfile = {
  id: string;
  slug: string;
  name: string;
  side: DuelSide;
  philosophy: string;
  specialization: string;
  status: AgentStatus;
  description: string;
  tools: string[];
  safeguards: string[];
  latencyMs: number;
  successRate: number;
  queueDepth: number;
  lastRunSummary: string;
};

export type RunStep = {
  label: string;
  state: "done" | "active" | "waiting";
};

export type AgentRun = {
  id: string;
  agentId: string;
  title: string;
  objective: string;
  status: RunStatus;
  confidence: number;
  durationMs: number;
  startedAt: string;
  finishedAt?: string;
  summary: string;
  output: string;
  events: string[];
  steps: RunStep[];
};

export type OperatorControls = {
  autonomyMode: AutonomyMode;
  publishTarget: PublishTarget;
  escalationPolicy: EscalationPolicy;
  autoRetry: boolean;
  reviewRequired: boolean;
};

export type SystemMetrics = {
  activeAgents: number;
  runningNow: number;
  completedToday: number;
  averageConfidence: number;
  reviewQueue: number;
  pausedAgents: number;
};

export type Playbook = {
  id: string;
  side: DuelSide;
  title: string;
  trigger: string;
  response: string;
};

export type DashboardSnapshot = {
  generatedAt: string;
  metrics: SystemMetrics;
  controls: OperatorControls;
  agents: AgentProfile[];
  runs: AgentRun[];
  playbooks: Playbook[];
};

export type CreateRunInput = {
  agentId: string;
  objective: string;
};

export type UpdateControlInput =
  | { type: "set-autonomy-mode"; value: AutonomyMode }
  | { type: "set-publish-target"; value: PublishTarget }
  | { type: "set-escalation-policy"; value: EscalationPolicy }
  | { type: "set-auto-retry"; value: boolean }
  | { type: "set-review-required"; value: boolean }
  | { type: "toggle-agent"; agentId: string }
  | { type: "retry-run"; runId: string }
  | { type: "resolve-run"; runId: string }
  | { type: "pulse-system" };