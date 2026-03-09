import {
  AgentProfile,
  AgentRun,
  AutonomyMode,
  CreateRunInput,
  DashboardSnapshot,
  EscalationPolicy,
  OperatorControls,
  Playbook,
  PublishTarget,
  UpdateControlInput,
} from "@/lib/agent-duel/types";

type InMemoryState = {
  agents: AgentProfile[];
  runs: AgentRun[];
  controls: OperatorControls;
  playbooks: Playbook[];
  runCounter: number;
};

const state: InMemoryState = {
  agents: [
    {
      id: "atlas-story",
      slug: "atlas-story",
      name: "Atlas Story",
      side: "left",
      philosophy: "Narrative synthesis",
      specialization: "Research framing and editorial briefs",
      status: "ready",
      description: "Turns scattered research, references, and raw goals into a clean narrative arc for a human team.",
      tools: ["Web briefs", "Reference parser", "Outline generator"],
      safeguards: ["Voice lock", "Source citation", "Human approval"],
      latencyMs: 1800,
      successRate: 94,
      queueDepth: 2,
      lastRunSummary: "Drafted a launch narrative from fragmented product notes.",
    },
    {
      id: "signal-curator",
      slug: "signal-curator",
      name: "Signal Curator",
      side: "left",
      philosophy: "Context before velocity",
      specialization: "Trend reading and contradiction mapping",
      status: "running",
      description: "Spots weak signals across feeds and gives operators the emotional and strategic frame behind them.",
      tools: ["Signal classifier", "Contradiction map", "Summary composer"],
      safeguards: ["Ambiguity warnings", "Confidence floor", "Manual publish"],
      latencyMs: 2400,
      successRate: 91,
      queueDepth: 1,
      lastRunSummary: "Merged customer feedback into three strategic tensions.",
    },
    {
      id: "vector-ops",
      slug: "vector-ops",
      name: "Vector Ops",
      side: "right",
      philosophy: "Deterministic orchestration",
      specialization: "Task routing and tool execution",
      status: "ready",
      description: "Routes work across agents, tracks tool usage, and normalizes every result into operator-safe output.",
      tools: ["Router", "Queue manager", "Retry engine"],
      safeguards: ["Policy gate", "Timeout budget", "Typed outputs"],
      latencyMs: 900,
      successRate: 97,
      queueDepth: 4,
      lastRunSummary: "Completed triage and rerouted two failed publishing jobs.",
    },
    {
      id: "relay-console",
      slug: "relay-console",
      name: "Relay Console",
      side: "right",
      philosophy: "Operator visibility",
      specialization: "Escalation control and run supervision",
      status: "degraded",
      description: "Exposes every autonomous handoff, confidence score, and retry branch to the control room.",
      tools: ["Telemetry pane", "Escalation router", "Review checkpoints"],
      safeguards: ["SLA triggers", "Audit log", "Rollback hooks"],
      latencyMs: 1100,
      successRate: 88,
      queueDepth: 3,
      lastRunSummary: "Flagged a low-confidence supplier summary for human review.",
    },
  ],
  runs: [
    {
      id: "run-1001",
      agentId: "atlas-story",
      title: "Launch Narrative",
      objective: "Turn product notes into a homepage story with tension and a clear operator point of view.",
      status: "completed",
      confidence: 93,
      durationMs: 214000,
      startedAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
      finishedAt: new Date(Date.now() - 1000 * 60 * 54).toISOString(),
      summary: "Created a three-act launch narrative with clear stakes, comparison framing, and CTA language.",
      output: "Three narrative directions prepared. Direction B selected for publication handoff.",
      events: ["references ingested", "contradictions merged", "brief delivered"],
      steps: [
        { label: "ingest references", state: "done" },
        { label: "build narrative spine", state: "done" },
        { label: "prepare operator brief", state: "done" },
      ],
    },
    {
      id: "run-1002",
      agentId: "vector-ops",
      title: "Bug Triage Relay",
      objective: "Classify incoming production failures and route them to the right responders with retry policy.",
      status: "running",
      confidence: 89,
      durationMs: 98000,
      startedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      summary: "Routing active incidents across docs, backend, and support owners.",
      output: "Two failures closed. One run escalated after a confidence drop.",
      events: ["queue locked", "priority normalized", "one escalation fired"],
      steps: [
        { label: "collect failures", state: "done" },
        { label: "score urgency", state: "active" },
        { label: "assign owners", state: "waiting" },
      ],
    },
    {
      id: "run-1003",
      agentId: "relay-console",
      title: "Vendor Review",
      objective: "Prepare an operator summary of vendor risk, blockers, and next actions for review.",
      status: "needs-review",
      confidence: 74,
      durationMs: 126000,
      startedAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
      finishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      summary: "Escalated because supplier evidence conflicted with procurement notes.",
      output: "Human review required before publishing external recommendation.",
      events: ["evidence conflict", "confidence dip", "review lock applied"],
      steps: [
        { label: "pull supplier docs", state: "done" },
        { label: "compare against policy", state: "done" },
        { label: "publish advisory", state: "waiting" },
      ],
    },
  ],
  controls: {
    autonomyMode: "supervised",
    publishTarget: "notion",
    escalationPolicy: "confidence-threshold",
    autoRetry: true,
    reviewRequired: true,
  },
  playbooks: [
    {
      id: "playbook-left-1",
      side: "left",
      title: "Narrative Briefing",
      trigger: "Ambiguous product launch or campaign planning",
      response: "Gather references, extract tension, propose three editorial directions.",
    },
    {
      id: "playbook-left-2",
      side: "left",
      title: "Signal Reading",
      trigger: "Conflicting qualitative feedback across channels",
      response: "Cluster patterns, describe contradictions, prepare human-readable recommendation.",
    },
    {
      id: "playbook-right-1",
      side: "right",
      title: "Run Supervision",
      trigger: "Low-confidence output or long-running job",
      response: "Apply escalation threshold, hold publish step, and expose telemetry to operator review.",
    },
    {
      id: "playbook-right-2",
      side: "right",
      title: "Queue Routing",
      trigger: "Concurrent operational requests across multiple agents",
      response: "Assign work by specialization, enforce retries, and preserve audit trace.",
    },
  ],
  runCounter: 1004,
};

function computeAverageConfidence() {
  if (state.runs.length === 0) {
    return 0;
  }

  const total = state.runs.reduce((sum, run) => sum + run.confidence, 0);
  return Math.round(total / state.runs.length);
}

function buildMetrics() {
  return {
    activeAgents: state.agents.length,
    runningNow: state.runs.filter((run) => run.status === "running" || run.status === "queued").length,
    completedToday: state.runs.filter((run) => run.status === "completed").length,
    averageConfidence: computeAverageConfidence(),
  };
}

function getAgentById(agentId: string) {
  return state.agents.find((agent) => agent.id === agentId);
}

function composeSummary(agentName: string, objective: string, autonomyMode: AutonomyMode, publishTarget: PublishTarget) {
  return `${agentName} processed: ${objective}. Mode ${autonomyMode} kept the run within ${publishTarget} publishing constraints.`;
}

function composeOutput(agent: AgentProfile, escalationPolicy: EscalationPolicy) {
  if (agent.side === "left") {
    return `Narrative draft assembled with ${escalationPolicy} review gates and a human-readable final brief.`;
  }

  return `Operational report normalized into typed actions with ${escalationPolicy} escalation applied.`;
}

function buildSteps(side: AgentProfile["side"]) {
  if (side === "left") {
    return [
      { label: "ingest references", state: "done" as const },
      { label: "shape narrative", state: "done" as const },
      { label: "prepare human brief", state: "done" as const },
    ];
  }

  return [
    { label: "normalize inputs", state: "done" as const },
    { label: "route task", state: "done" as const },
    { label: "write audit log", state: "done" as const },
  ];
}

export function getDashboardSnapshot(): DashboardSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    metrics: buildMetrics(),
    controls: { ...state.controls },
    agents: state.agents.map((agent) => ({ ...agent })),
    runs: state.runs.map((run) => ({
      ...run,
      events: [...run.events],
      steps: run.steps.map((step) => ({ ...step })),
    })),
    playbooks: state.playbooks.map((playbook) => ({ ...playbook })),
  };
}

export function createRun(input: CreateRunInput) {
  const agent = getAgentById(input.agentId);

  if (!agent) {
    throw new Error("Selected agent was not found.");
  }

  state.runCounter += 1;
  const runId = `run-${state.runCounter}`;
  const confidence = Math.max(72, Math.min(98, agent.successRate - agent.queueDepth));
  const status = confidence < 80 && state.controls.reviewRequired ? "needs-review" : "completed";
  const now = new Date();
  const finishedAt = new Date(now.getTime() + 90_000).toISOString();

  const run: AgentRun = {
    id: runId,
    agentId: agent.id,
    title: `${agent.name} / ${input.objective.slice(0, 32) || "Operator run"}`,
    objective: input.objective,
    status,
    confidence,
    durationMs: agent.latencyMs * 34,
    startedAt: now.toISOString(),
    finishedAt,
    summary: composeSummary(agent.name, input.objective, state.controls.autonomyMode, state.controls.publishTarget),
    output: composeOutput(agent, state.controls.escalationPolicy),
    events: [
      `mode:${state.controls.autonomyMode}`,
      `target:${state.controls.publishTarget}`,
      `policy:${state.controls.escalationPolicy}`,
    ],
    steps: buildSteps(agent.side),
  };

  state.runs.unshift(run);
  agent.status = status === "completed" ? "ready" : "running";
  agent.queueDepth += 1;
  agent.lastRunSummary = run.summary;

  return run;
}

export function updateControls(input: UpdateControlInput) {
  switch (input.type) {
    case "set-autonomy-mode":
      state.controls.autonomyMode = input.value;
      break;
    case "set-publish-target":
      state.controls.publishTarget = input.value;
      break;
    case "set-escalation-policy":
      state.controls.escalationPolicy = input.value;
      break;
    case "set-auto-retry":
      state.controls.autoRetry = input.value;
      break;
    case "set-review-required":
      state.controls.reviewRequired = input.value;
      break;
    case "toggle-agent": {
      const agent = getAgentById(input.agentId);

      if (!agent) {
        throw new Error("Agent not found.");
      }

      agent.status = agent.status === "paused" ? "ready" : "paused";
      break;
    }
    case "retry-run": {
      const existingRun = state.runs.find((run) => run.id === input.runId);

      if (!existingRun) {
        throw new Error("Run not found.");
      }

      createRun({ agentId: existingRun.agentId, objective: existingRun.objective });
      break;
    }
    default:
      throw new Error("Unsupported control update.");
  }

  return getDashboardSnapshot();
}