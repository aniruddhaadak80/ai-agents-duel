export type DuelSide = "left" | "right";

export type AgentStatus = "ready" | "running" | "paused" | "degraded";

export type RunStatus = "queued" | "running" | "completed" | "needs-review" | "failed";

export type AutonomyMode = "guardrailed" | "supervised" | "aggressive";

export type PublishTarget = "notion" | "slack" | "linear" | "email";

export type EscalationPolicy = "human-first" | "confidence-threshold" | "sla-first";

export type AgentRole = "planner" | "researcher" | "builder" | "reviewer";

export type WorkflowAudience = "founders" | "marketers" | "operators" | "developers" | "general";

export type AgentProfile = {
  id: string;
  slug: string;
  name: string;
  side: DuelSide;
  role: AgentRole;
  philosophy: string;
  specialization: string;
  status: AgentStatus;
  description: string;
  tools: string[];
  safeguards: string[];
  idealFor: string[];
  latencyMs: number;
  successRate: number;
  queueDepth: number;
  lastRunSummary: string;
};

export type RunStep = {
  label: string;
  state: "done" | "active" | "waiting";
  ownerAgentId: string;
};

export type AgentContribution = {
  agentId: string;
  title: string;
  content: string;
};

export type RunArtifact = {
  label: string;
  value: string;
};

export type WorkflowTemplate = {
  id: string;
  title: string;
  audience: WorkflowAudience;
  description: string;
  defaultObjective: string;
  deliverable: string;
  tags: string[];
  stages: string[];
  recommendedAgentIds: string[];
};

export type AgentRun = {
  id: string;
  workflowId: string;
  agentId: string;
  title: string;
  objective: string;
  context: string;
  status: RunStatus;
  confidence: number;
  durationMs: number;
  startedAt: string;
  finishedAt?: string;
  summary: string;
  output: string;
  deliverable: string;
  events: string[];
  steps: RunStep[];
  agentPath: string[];
  contributions: AgentContribution[];
  artifacts: RunArtifact[];
  recommendations: string[];
  operatorBrief: string;
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
  workflows: WorkflowTemplate[];
};

export type CreateRunInput = {
  agentId?: string;
  workflowId: string;
  objective: string;
  context?: string;
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