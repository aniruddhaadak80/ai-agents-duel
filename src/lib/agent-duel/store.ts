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
  RunArtifact,
  RunStep,
  UpdateControlInput,
  WorkflowTemplate,
} from "@/lib/agent-duel/types";

type InMemoryState = {
  agents: AgentProfile[];
  runs: AgentRun[];
  controls: OperatorControls;
  playbooks: Playbook[];
  workflows: WorkflowTemplate[];
  runCounter: number;
};

const initialAgents: AgentProfile[] = [
  {
    id: "atlas-story",
    slug: "atlas-story",
    name: "Atlas Story",
    side: "left",
    role: "planner",
    philosophy: "Clarity turns complexity into momentum.",
    specialization: "Brief design, narrative planning, and audience framing",
    status: "ready",
    description: "Breaks fuzzy requests into clear plans, tradeoffs, and a human-readable execution narrative.",
    tools: ["Brief parser", "Audience mapper", "Outline generator"],
    safeguards: ["Scope boundaries", "Audience check", "Human approval"],
    idealFor: ["Launch briefs", "Stakeholder updates", "Marketing plans"],
    latencyMs: 1800,
    successRate: 95,
    queueDepth: 1,
    lastRunSummary: "Prepared a launch brief with clear stakeholder messaging.",
  },
  {
    id: "signal-curator",
    slug: "signal-curator",
    name: "Signal Curator",
    side: "left",
    role: "researcher",
    philosophy: "Context before certainty.",
    specialization: "Trend analysis, contradiction mapping, and evidence gathering",
    status: "running",
    description: "Pulls together supporting evidence, surface-level risks, and the hidden tensions behind a decision.",
    tools: ["Signal classifier", "Evidence board", "Contradiction detector"],
    safeguards: ["Confidence floor", "Bias warning", "Manual escalation"],
    idealFor: ["Competitive research", "Risk analysis", "Customer synthesis"],
    latencyMs: 2200,
    successRate: 92,
    queueDepth: 2,
    lastRunSummary: "Merged weak signals from customer feedback into an operator memo.",
  },
  {
    id: "vector-ops",
    slug: "vector-ops",
    name: "Vector Ops",
    side: "right",
    role: "builder",
    philosophy: "Systems should be decisive, typed, and inspectable.",
    specialization: "Execution planning, routing, and implementation handoff",
    status: "ready",
    description: "Transforms plans into action tracks, validates operational assumptions, and packages execution output.",
    tools: ["Task router", "Dependency planner", "Execution matrix"],
    safeguards: ["Policy gate", "Timeout budget", "Rollback hooks"],
    idealFor: ["Engineering tasks", "Launch checklists", "Ops workflows"],
    latencyMs: 1100,
    successRate: 97,
    queueDepth: 3,
    lastRunSummary: "Converted a planning brief into a shippable execution checklist.",
  },
  {
    id: "relay-console",
    slug: "relay-console",
    name: "Relay Console",
    side: "right",
    role: "reviewer",
    philosophy: "Visibility keeps autonomy safe.",
    specialization: "Review gates, escalation design, and operator summaries",
    status: "degraded",
    description: "Reviews outputs for confidence gaps, prepares operator action items, and decides when humans should step in.",
    tools: ["Telemetry board", "QA rubric", "Escalation router"],
    safeguards: ["Audit trail", "SLA triggers", "Review locks"],
    idealFor: ["Executive summaries", "Quality control", "Approval flows"],
    latencyMs: 1400,
    successRate: 89,
    queueDepth: 2,
    lastRunSummary: "Flagged a weak vendor recommendation before external sharing.",
  },
];

const initialWorkflows: WorkflowTemplate[] = [
  {
    id: "launch-campaign",
    title: "Launch Campaign Studio",
    audience: "marketers",
    description: "Turn one messy product idea into positioning, research themes, launch copy, and an approval-ready brief.",
    defaultObjective: "Launch a new AI feature for small teams that need faster daily planning.",
    deliverable: "Campaign brief, launch story, and approval checklist",
    tags: ["marketing", "positioning", "launch"],
    stages: ["Plan message", "Map signals", "Draft launch assets", "Review for approval"],
    recommendedAgentIds: ["atlas-story", "signal-curator", "vector-ops", "relay-console"],
  },
  {
    id: "ops-war-room",
    title: "Ops War Room",
    audience: "operators",
    description: "Break down incidents or recurring operational pain into triage, root causes, runbooks, and escalation rules.",
    defaultObjective: "Stabilize support operations after a spike in failed onboarding sessions.",
    deliverable: "Incident brief, route map, and mitigation runbook",
    tags: ["operations", "support", "incident"],
    stages: ["Frame the failure", "Gather evidence", "Assign action paths", "Approve the mitigation"],
    recommendedAgentIds: ["signal-curator", "vector-ops", "relay-console"],
  },
  {
    id: "founder-decision",
    title: "Founder Decision Desk",
    audience: "founders",
    description: "Compare options, surface tradeoffs, and produce a compact decision memo for founders under time pressure.",
    defaultObjective: "Decide whether to prioritize self-serve onboarding or enterprise sales enablement next quarter.",
    deliverable: "Decision memo with risks, recommendation, and next steps",
    tags: ["strategy", "founders", "decision"],
    stages: ["Define decision", "Collect evidence", "Model options", "Prepare final recommendation"],
    recommendedAgentIds: ["atlas-story", "signal-curator", "relay-console"],
  },
  {
    id: "ship-feature",
    title: "Ship Feature Relay",
    audience: "developers",
    description: "Convert a vague feature request into implementation scope, dependencies, launch risks, and a release brief.",
    defaultObjective: "Ship a collaborative notes feature with comments, mentions, and mobile-safe layout behavior.",
    deliverable: "Implementation brief, QA focus list, and release notes outline",
    tags: ["engineering", "product", "release"],
    stages: ["Scope solution", "Inspect constraints", "Build execution plan", "Review release risk"],
    recommendedAgentIds: ["atlas-story", "vector-ops", "relay-console"],
  },
];

const initialPlaybooks: Playbook[] = [
  {
    id: "playbook-1",
    side: "left",
    title: "Brief to Workflow",
    trigger: "Objective is broad, ambiguous, or spans multiple disciplines.",
    response: "Planner defines scope, researcher gathers signal, builder packages execution, reviewer checks risk.",
  },
  {
    id: "playbook-2",
    side: "left",
    title: "Evidence Before Output",
    trigger: "Operator needs justification, not just an answer.",
    response: "Research notes, contradictions, and confidence cues are surfaced before the final recommendation.",
  },
  {
    id: "playbook-3",
    side: "right",
    title: "Guarded Autonomy",
    trigger: "Confidence is weak or publish risk is high.",
    response: "Runs stop at review with publish target constraints attached to the operator brief.",
  },
  {
    id: "playbook-4",
    side: "right",
    title: "Execution Packaging",
    trigger: "User needs something they can act on immediately.",
    response: "Output is converted into deliverables, artifacts, and next-step recommendations.",
  },
];

const state: InMemoryState = {
  agents: initialAgents.map((agent) => ({ ...agent })),
  runs: [],
  controls: {
    autonomyMode: "supervised",
    publishTarget: "notion",
    escalationPolicy: "confidence-threshold",
    autoRetry: true,
    reviewRequired: true,
  },
  playbooks: initialPlaybooks.map((playbook) => ({ ...playbook })),
  workflows: initialWorkflows.map((workflow) => ({
    ...workflow,
    tags: [...workflow.tags],
    stages: [...workflow.stages],
    recommendedAgentIds: [...workflow.recommendedAgentIds],
  })),
  runCounter: 1000,
};

function getWorkflowById(workflowId: string) {
  return state.workflows.find((workflow) => workflow.id === workflowId);
}

function getAgentById(agentId: string) {
  return state.agents.find((agent) => agent.id === agentId);
}

function safeSliceObjective(objective: string) {
  return objective.trim().slice(0, 42) || "Operator run";
}

function createStep(label: string, ownerAgentId: string, stateValue: RunStep["state"]): RunStep {
  return { label, ownerAgentId, state: stateValue };
}

function computeConfidence(agent: AgentProfile, workflow: WorkflowTemplate, autonomyMode: AutonomyMode) {
  const queuePenalty = agent.queueDepth * 2;
  const workflowBonus = workflow.recommendedAgentIds.includes(agent.id) ? 3 : 0;
  const autonomyBonus = autonomyMode === "aggressive" ? 2 : autonomyMode === "guardrailed" ? -2 : 0;
  return Math.max(72, Math.min(99, agent.successRate - queuePenalty + workflowBonus + autonomyBonus));
}

function determineRunStatus(confidence: number, controls: OperatorControls) {
  if (controls.reviewRequired && confidence < 86) {
    return "needs-review" as const;
  }

  if (controls.autonomyMode === "guardrailed" && confidence < 90) {
    return "running" as const;
  }

  return "completed" as const;
}

function buildAgentPath(workflow: WorkflowTemplate, selectedAgentId: string) {
  const ordered = workflow.recommendedAgentIds.filter((agentId, index, all) => all.indexOf(agentId) === index);

  if (ordered.includes(selectedAgentId)) {
    return ordered;
  }

  return [selectedAgentId, ...ordered.filter((agentId) => agentId !== selectedAgentId)];
}

function buildSteps(workflow: WorkflowTemplate, agentPath: string[], finalStatus: AgentRun["status"]) {
  const fallbackAgentId = agentPath[0] ?? "atlas-story";
  return workflow.stages.map((stage, index) => {
    const ownerAgentId = agentPath[index] ?? fallbackAgentId;
    const stepState: RunStep["state"] =
      finalStatus === "completed"
        ? "done"
        : finalStatus === "needs-review"
          ? index < workflow.stages.length - 1
            ? "done"
            : "waiting"
          : index < workflow.stages.length - 1
            ? "done"
            : "active";

    return createStep(stage, ownerAgentId, stepState);
  });
}

function buildContributions(objective: string, context: string, workflow: WorkflowTemplate, agentPath: string[]) {
  return agentPath.map((agentId, index) => {
    const agent = getAgentById(agentId);
    const stage = workflow.stages[index] ?? workflow.stages[workflow.stages.length - 1] ?? "Coordinate outcome";

    return {
      agentId,
      title: `${agent?.name ?? "Agent"} on ${stage}`,
      content:
        agent?.role === "planner"
          ? `Defined the shape of the mission around "${objective}" and clarified the audience, expected deliverable, and the decisions the operator will need to make.`
          : agent?.role === "researcher"
            ? `Collected supporting signal${context ? ` from the provided context: ${context}.` : "."} Surfaced the highest-value tensions and the evidence that could change the recommendation.`
            : agent?.role === "builder"
              ? "Converted the workflow into an execution package with ordered steps, handoff boundaries, and the fastest path to a usable outcome."
              : "Reviewed the assembled output for confidence, publication safety, and operator readiness before final delivery.",
    };
  });
}

function buildArtifacts(workflow: WorkflowTemplate, objective: string, publishTarget: PublishTarget): RunArtifact[] {
  return [
    { label: "Deliverable", value: workflow.deliverable },
    { label: "Primary objective", value: objective },
    { label: "Publish target", value: publishTarget },
  ];
}

function buildRecommendations(workflow: WorkflowTemplate, confidence: number, escalationPolicy: EscalationPolicy) {
  const recommendations = [
    `Package the output into ${workflow.deliverable.toLowerCase()} for fast stakeholder review.`,
    `Keep ${escalationPolicy} active while the team validates the highest-risk assumption.`,
  ];

  if (confidence < 86) {
    recommendations.unshift("Resolve the evidence gap before publishing or automating downstream actions.");
  } else {
    recommendations.unshift("Move directly into execution and track the first operator checkpoint within one cycle.");
  }

  return recommendations;
}

function buildSummary(agent: AgentProfile, workflow: WorkflowTemplate, objective: string, confidence: number) {
  return `${agent.name} coordinated the ${workflow.title.toLowerCase()} workflow around "${objective}" with ${confidence}% confidence and a deliverable aimed at immediate operator use.`;
}

function buildOutput(workflow: WorkflowTemplate, controls: OperatorControls) {
  return `Generated ${workflow.deliverable.toLowerCase()} under ${controls.autonomyMode} autonomy with ${controls.publishTarget} as the destination and ${controls.escalationPolicy} as the active safety rule.`;
}

function buildOperatorBrief(workflow: WorkflowTemplate, selectedAgent: AgentProfile, confidence: number, finalStatus: AgentRun["status"]) {
  const decisionLine =
    finalStatus === "needs-review"
      ? "Human review is required before this leaves the control room."
      : finalStatus === "running"
        ? "The workflow is still active and waiting on the final review gate."
        : "This workflow is ready to hand off or publish.";

  return `${workflow.title}: ${selectedAgent.name} is the lead agent. Confidence is ${confidence}%. ${decisionLine}`;
}

function cloneRun(run: AgentRun): AgentRun {
  return {
    ...run,
    events: [...run.events],
    steps: run.steps.map((step) => ({ ...step })),
    agentPath: [...run.agentPath],
    contributions: run.contributions.map((item) => ({ ...item })),
    artifacts: run.artifacts.map((item) => ({ ...item })),
    recommendations: [...run.recommendations],
  };
}

function computeAverageConfidence() {
  if (state.runs.length === 0) {
    return 0;
  }

  const total = state.runs.reduce((sum, run) => sum + run.confidence, 0);
  return Math.round(total / state.runs.length);
}

function buildMetrics() {
  return {
    activeAgents: state.agents.filter((agent) => agent.status !== "paused").length,
    runningNow: state.runs.filter((run) => run.status === "running" || run.status === "queued").length,
    completedToday: state.runs.filter((run) => run.status === "completed").length,
    averageConfidence: computeAverageConfidence(),
    reviewQueue: state.runs.filter((run) => run.status === "needs-review").length,
    pausedAgents: state.agents.filter((agent) => agent.status === "paused").length,
  };
}

function hydrateSeedRuns() {
  if (state.runs.length > 0) {
    return;
  }

  createRun({
    workflowId: "launch-campaign",
    objective: "Launch a weekly planning copilot for overstretched startup teams.",
    context: "Focus on clarity, speed, and confidence for non-technical buyers.",
    agentId: "atlas-story",
  });
  createRun({
    workflowId: "ops-war-room",
    objective: "Diagnose why onboarding completion dropped after the last release.",
    context: "Support tickets mention mobile layout regressions and unclear copy.",
    agentId: "signal-curator",
  });
  createRun({
    workflowId: "ship-feature",
    objective: "Scope and ship an internal review queue with retry and resolve actions.",
    context: "Team wants something simple enough to demo without a database.",
    agentId: "vector-ops",
  });

  const reviewRun = state.runs.find((run) => run.workflowId === "ops-war-room");
  if (reviewRun) {
    reviewRun.status = "needs-review";
    reviewRun.finishedAt = new Date().toISOString();
    reviewRun.steps = reviewRun.steps.map((step, index, all) => ({
      ...step,
      state: index === all.length - 1 ? "waiting" : "done",
    }));
    reviewRun.operatorBrief = `${reviewRun.operatorBrief} Ticket evidence conflicts with the product analytics summary.`;
    reviewRun.events.unshift("evidence conflict detected");
  }

  const activeRun = state.runs.find((run) => run.workflowId === "ship-feature");
  if (activeRun) {
    activeRun.status = "running";
    activeRun.finishedAt = undefined;
    activeRun.steps = activeRun.steps.map((step, index, all) => ({
      ...step,
      state: index === all.length - 1 ? "active" : "done",
    }));
    activeRun.events.unshift("execution package still being validated");
  }
}

export function getDashboardSnapshot(): DashboardSnapshot {
  hydrateSeedRuns();

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildMetrics(),
    controls: { ...state.controls },
    agents: state.agents.map((agent) => ({
      ...agent,
      tools: [...agent.tools],
      safeguards: [...agent.safeguards],
      idealFor: [...agent.idealFor],
    })),
    runs: state.runs.map(cloneRun),
    playbooks: state.playbooks.map((playbook) => ({ ...playbook })),
    workflows: state.workflows.map((workflow) => ({
      ...workflow,
      tags: [...workflow.tags],
      stages: [...workflow.stages],
      recommendedAgentIds: [...workflow.recommendedAgentIds],
    })),
  };
}

export function createRun(input: CreateRunInput) {
  const workflow = getWorkflowById(input.workflowId);
  if (!workflow) {
    throw new Error("Selected workflow was not found.");
  }

  const selectedAgentId = input.agentId ?? workflow.recommendedAgentIds[0];
  const agent = selectedAgentId ? getAgentById(selectedAgentId) : undefined;

  if (!agent) {
    throw new Error("Selected agent was not found.");
  }

  if (agent.status === "paused") {
    throw new Error("Paused agents cannot accept new runs.");
  }

  state.runCounter += 1;
  const runId = `run-${state.runCounter}`;
  const objective = input.objective.trim();
  const context = input.context?.trim() ?? "";
  const confidence = computeConfidence(agent, workflow, state.controls.autonomyMode);
  const status = determineRunStatus(confidence, state.controls);
  const now = new Date();
  const agentPath = buildAgentPath(workflow, agent.id);
  const steps = buildSteps(workflow, agentPath, status);

  const run: AgentRun = {
    id: runId,
    workflowId: workflow.id,
    agentId: agent.id,
    title: `${workflow.title} / ${safeSliceObjective(objective)}`,
    objective,
    context,
    status,
    confidence,
    durationMs: Math.max(60_000, workflow.stages.length * agent.latencyMs * 18),
    startedAt: now.toISOString(),
    finishedAt: status === "running" ? undefined : new Date(now.getTime() + 90_000).toISOString(),
    summary: buildSummary(agent, workflow, objective, confidence),
    output: buildOutput(workflow, state.controls),
    deliverable: workflow.deliverable,
    events: [
      `workflow:${workflow.title}`,
      `mode:${state.controls.autonomyMode}`,
      `target:${state.controls.publishTarget}`,
      `policy:${state.controls.escalationPolicy}`,
    ],
    steps,
    agentPath,
    contributions: buildContributions(objective, context, workflow, agentPath),
    artifacts: buildArtifacts(workflow, objective, state.controls.publishTarget),
    recommendations: buildRecommendations(workflow, confidence, state.controls.escalationPolicy),
    operatorBrief: buildOperatorBrief(workflow, agent, confidence, status),
  };

  state.runs.unshift(run);
  agent.status = status === "completed" ? "ready" : "running";
  agent.queueDepth += 1;
  agent.lastRunSummary = run.summary;

  return run;
}

function resolveRun(runId: string) {
  const run = state.runs.find((item) => item.id === runId);
  if (!run) {
    throw new Error("Run not found.");
  }

  run.status = "completed";
  run.confidence = Math.min(99, run.confidence + 8);
  run.finishedAt = new Date().toISOString();
  run.output = `${run.output} Operator approved final delivery.`;
  run.operatorBrief = `${run.operatorBrief} Review has been resolved.`;
  run.events.unshift("operator review resolved");
  run.steps = run.steps.map((step) => ({ ...step, state: "done" }));

  const agent = getAgentById(run.agentId);
  if (agent) {
    agent.status = "ready";
    agent.queueDepth = Math.max(0, agent.queueDepth - 1);
    agent.lastRunSummary = `Review resolved for ${run.title}.`;
  }
}

export function pulseSystem() {
  hydrateSeedRuns();

  state.agents = state.agents.map((agent, index) => {
    const queueDepth = Math.max(0, agent.queueDepth + (index % 2 === 0 ? 1 : -1));
    const status = queueDepth > 4 ? "degraded" : queueDepth > 2 ? "running" : agent.status === "paused" ? "paused" : "ready";

    return {
      ...agent,
      queueDepth,
      status,
      lastRunSummary: `${agent.lastRunSummary} System pulse adjusted queue pressure to ${queueDepth}.`,
    };
  });

  state.runs = state.runs.map((run, index) => {
    if (index > 4) {
      return run;
    }

    if (run.status === "running") {
      return {
        ...run,
        durationMs: run.durationMs + 25_000,
        events: ["system pulse reprioritized active work", ...run.events].slice(0, 6),
        operatorBrief: `${run.operatorBrief} Pulse requested tighter monitoring.`,
      };
    }

    if (run.status === "needs-review") {
      return {
        ...run,
        events: ["operator reminder triggered", ...run.events].slice(0, 6),
      };
    }

    return run;
  });
}

export function updateControls(input: UpdateControlInput) {
  hydrateSeedRuns();

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

      createRun({
        workflowId: existingRun.workflowId,
        objective: existingRun.objective,
        context: existingRun.context,
        agentId: existingRun.agentId,
      });
      break;
    }
    case "resolve-run":
      resolveRun(input.runId);
      break;
    case "pulse-system":
      pulseSystem();
      break;
    default:
      throw new Error("Unsupported control update.");
  }

  return getDashboardSnapshot();
}

export function triggerDuel(agent1Id: string, agent2Id: string) {
  hydrateSeedRuns();

  const a1 = getAgentById(agent1Id);
  const a2 = getAgentById(agent2Id);

  if (!a1 || !a2 || a1.id === a2.id) {
    throw new Error("Invalid combatants for duel.");
  }

  const a1Score = a1.successRate - a1.queueDepth * 2 + Math.random() * 8;
  const a2Score = a2.successRate - a2.queueDepth * 2 + Math.random() * 8;
  const winner = a1Score >= a2Score ? a1 : a2;
  const loser = a1Score >= a2Score ? a2 : a1;

  winner.status = "running";
  winner.successRate = Math.min(99, winner.successRate + 2);
  winner.queueDepth = Math.max(0, winner.queueDepth - 1);

  loser.status = "degraded";
  loser.successRate = Math.max(70, loser.successRate - 6);
  loser.queueDepth += 2;
  loser.lastRunSummary = `Duel pressure applied after losing to ${winner.name}.`;

  return {
    snapshot: getDashboardSnapshot(),
    duelLog: `${winner.name} outscored ${loser.name} in the sandbox. ${loser.name} has been marked degraded and pushed into manual monitoring.`,
  };
}

export function updateRunRealAI(runId: string, aiText: string) {
  hydrateSeedRuns();

  const run = state.runs.find((item) => item.id === runId);
  if (!run) {
    return;
  }

  run.summary = aiText;
  run.output = aiText;
  run.operatorBrief = `${run.operatorBrief} External model response attached to the run.`;
  run.status = "completed";
  run.finishedAt = new Date().toISOString();
  run.events.unshift("external model output generated");
  run.steps = run.steps.map((step) => ({ ...step, state: "done" }));

  const agent = getAgentById(run.agentId);
  if (agent) {
    agent.status = "ready";
    agent.queueDepth = Math.max(0, agent.queueDepth - 1);
    agent.lastRunSummary = `External model response captured for ${run.title}.`;
  }
}

hydrateSeedRuns();
