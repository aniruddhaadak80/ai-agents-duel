"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AgentRun,
  AutonomyMode,
  DashboardSnapshot,
  EscalationPolicy,
  PublishTarget,
  RunStatus,
  UpdateControlInput,
  WorkflowTemplate,
} from "@/lib/agent-duel/types";

type CommandCenterProps = {
  mode?: "home" | "control-room";
};

type RunResponse = {
  run: AgentRun;
  snapshot: DashboardSnapshot;
  enrichedByModel?: boolean;
};

const numberFormatter = new Intl.NumberFormat("en-US");
const durationFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

async function getJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Request failed.");
  }

  return response.json() as Promise<T>;
}

function formatDuration(durationMs: number) {
  const minutes = Math.max(1, Math.round(durationMs / 60000));
  return `${durationFormatter.format(minutes)} min`;
}

function statusLabel(status: RunStatus) {
  if (status === "needs-review") return "Needs review";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function findWorkflow(snapshot: DashboardSnapshot | null, workflowId: string | null) {
  if (!snapshot || !workflowId) return null;
  return snapshot.workflows.find((workflow) => workflow.id === workflowId) ?? null;
}

function findRun(snapshot: DashboardSnapshot | null, runId: string | null) {
  if (!snapshot || !runId) return null;
  return snapshot.runs.find((run) => run.id === runId) ?? null;
}

function findAgent(snapshot: DashboardSnapshot | null, agentId: string | null) {
  if (!snapshot || !agentId) return null;
  return snapshot.agents.find((agent) => agent.id === agentId) ?? null;
}

export function AgentCommandCenter({ mode = "home" }: CommandCenterProps) {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [objective, setObjective] = useState("");
  const [context, setContext] = useState("");
  const [runFilter, setRunFilter] = useState<RunStatus | "all">("all");
  const [combatantA, setCombatantA] = useState<string | null>(null);
  const [combatantB, setCombatantB] = useState<string | null>(null);
  const [liveLogTicker, setLiveLogTicker] = useState<string[]>([
    "control-room: multi-agent board initializing",
    "status: waiting for operator objective",
  ]);
  const [glitchMode, setGlitchMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function refreshSnapshot() {
    const data = await getJson<DashboardSnapshot>("/api/control-room");
    setSnapshot(data);
    return data;
  }

  useEffect(() => {
    let active = true;

    getJson<DashboardSnapshot>("/api/control-room")
      .then((data) => {
        if (!active) return;
        setSnapshot(data);
        const defaultWorkflow = data.workflows[0] ?? null;
        const defaultAgentId = defaultWorkflow?.recommendedAgentIds[0] ?? data.agents[0]?.id ?? null;
        setSelectedWorkflowId(defaultWorkflow?.id ?? null);
        setSelectedAgentId(defaultAgentId);
        setObjective(defaultWorkflow?.defaultObjective ?? "");
        setContext("Add constraints, audience details, or links the agents should respect.");
        setSelectedRunId(data.runs[0]?.id ?? null);
        setCombatantA(data.agents[0]?.id ?? null);
        setCombatantB(data.agents[1]?.id ?? null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load the command center.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!snapshot) return;

    const interval = setInterval(() => {
      const recentRun = snapshot.runs[0];
      const activeAgent = snapshot.agents.find((agent) => agent.status === "running") ?? snapshot.agents[0];
      const nextEvent =
        recentRun && activeAgent
          ? `${activeAgent.name}: ${recentRun.status === "needs-review" ? "awaiting operator sign-off" : "pushing workflow toward delivery"}`
          : "board: no active workstreams";
      setLiveLogTicker((current) => [...current.slice(-4), nextEvent]);
    }, 3200);

    return () => clearInterval(interval);
  }, [snapshot]);

  useEffect(() => {
    if (!snapshot) return;

    if (selectedWorkflowId && !snapshot.workflows.some((workflow) => workflow.id === selectedWorkflowId)) {
      setSelectedWorkflowId(snapshot.workflows[0]?.id ?? null);
    }

    if (selectedAgentId && !snapshot.agents.some((agent) => agent.id === selectedAgentId)) {
      setSelectedAgentId(snapshot.agents[0]?.id ?? null);
    }

    if (selectedRunId && !snapshot.runs.some((run) => run.id === selectedRunId)) {
      setSelectedRunId(snapshot.runs[0]?.id ?? null);
    }
  }, [snapshot, selectedAgentId, selectedRunId, selectedWorkflowId]);

  const workflows = snapshot?.workflows ?? [];
  const agents = snapshot?.agents ?? [];
  const runs = snapshot?.runs ?? [];
  const reviewQueue = runs.filter((run) => run.status === "needs-review");
  const filteredRuns = runFilter === "all" ? runs : runs.filter((run) => run.status === runFilter);
  const currentWorkflow = findWorkflow(snapshot, selectedWorkflowId) ?? workflows[0] ?? null;
  const currentAgent = findAgent(snapshot, selectedAgentId) ?? agents[0] ?? null;
  const selectedRun = findRun(snapshot, selectedRunId) ?? filteredRuns[0] ?? runs[0] ?? null;

  function applyWorkflowTemplate(workflow: WorkflowTemplate) {
    setSelectedWorkflowId(workflow.id);
    setObjective(workflow.defaultObjective);
    setSelectedAgentId(workflow.recommendedAgentIds[0] ?? agents[0]?.id ?? null);
    setFeedback(`Loaded ${workflow.title}.`);
    setError(null);
  }

  async function handleControlUpdate(payload: UpdateControlInput, successMessage?: string) {
    setError(null);
    setFeedback(null);
    setIsSubmitting(true);
    try {
      const nextSnapshot = await getJson<DashboardSnapshot>("/api/control-room/control", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSnapshot(nextSnapshot);
      if (successMessage) {
        setFeedback(successMessage);
      }
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update controls.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateRun() {
    if (!selectedWorkflowId || !objective.trim()) {
      setError("Pick a workflow and write an objective.");
      return;
    }

    setError(null);
    setFeedback(null);
    setIsSubmitting(true);
    try {
      const response = await getJson<RunResponse>("/api/control-room/run", {
        method: "POST",
        body: JSON.stringify({
          workflowId: selectedWorkflowId,
          agentId: selectedAgentId,
          objective,
          context,
        }),
      });
      setSnapshot(response.snapshot);
      setSelectedRunId(response.run.id);
      setFeedback(response.enrichedByModel ? "Workflow executed with Gemini enrichment." : "Workflow executed with the local orchestration engine.");
      setLiveLogTicker((current) => [...current.slice(-4), `run:${response.run.title} created`]);
    } catch (runError: unknown) {
      setError(runError instanceof Error ? runError.message : "Unable to create run.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePulseSystem() {
    setError(null);
    setFeedback(null);
    setIsSubmitting(true);
    setGlitchMode(true);
    window.setTimeout(() => setGlitchMode(false), 2200);
    try {
      const response = await getJson<{ snapshot: DashboardSnapshot }>("/api/control-room/pulse", { method: "POST" });
      setSnapshot(response.snapshot);
      setFeedback("System pulse applied to the board.");
      setLiveLogTicker((current) => [...current.slice(-4), "system:pulse reprioritized queues"]);
    } catch (pulseError: unknown) {
      setError(pulseError instanceof Error ? pulseError.message : "Unable to pulse system.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAgentDuel() {
    if (!combatantA || !combatantB) {
      setError("Select two agents for the sandbox duel.");
      return;
    }

    setError(null);
    setFeedback(null);
    setIsSubmitting(true);
    try {
      const response = await getJson<{ snapshot: DashboardSnapshot; duelLog: string }>("/api/control-room/duel", {
        method: "POST",
        body: JSON.stringify({ agent1Id: combatantA, agent2Id: combatantB }),
      });
      setSnapshot(response.snapshot);
      setFeedback("Sandbox duel completed.");
      setLiveLogTicker((current) => [...current.slice(-4), response.duelLog]);
    } catch (duelError: unknown) {
      setError(duelError instanceof Error ? duelError.message : "Duel failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="command-center-shell">
        <section className="hero-section compact-hero">
          <div className="section-chip">Booting board</div>
          <h1>Loading the control room</h1>
          <p className="hero-lead">Hydrating workflows, review gates, and recent run history.</p>
        </section>
      </main>
    );
  }

  return (
    <main className={`command-center-shell${glitchMode ? " global-meltdown" : ""}`}>
      <div className="holo-overlay" />
      <div className="neural-wire">
        <div className="neural-wire-content">
          {liveLogTicker.map((log, index) => (
            <span key={`${log}-${index}`} className="wire-item">
              {log}
            </span>
          ))}
        </div>
      </div>

      <div className="top-nav-container">
        <nav className="top-nav">
          <div className="brand-logo">multi.agent.studio</div>
          <div className="nav-links">
            <Link href="/" className="wavy-link">Home</Link>
            <a href="#workflows" className="wavy-link">Workflows</a>
            <a href="#mission-board" className="wavy-link">Runs</a>
            <Link href="/control-room" className="wavy-link">Control Room</Link>
          </div>
          <a
            href="https://github.com/aniruddhaadak80/ai-agents-duel"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            title="Source"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </a>
        </nav>
      </div>

      <section className="hero-section hero-grid">
        <div className="hero-copy">
          <div className="section-chip">Build your own multi-agent system</div>
          <h1>{mode === "control-room" ? "Operator Control Room" : "Multi-Agent Studio"}</h1>
          <p className="hero-lead">
            A workflow-first command center that turns one broad request into a planner, researcher, builder, and reviewer pipeline.
            It is tuned for real users, not just demos: fast presets, visible review gates, agent controls, and optional Gemini enrichment.
          </p>
          <div className="hero-actions">
            <button className="sketch-btn primary" onClick={() => void handleCreateRun()} disabled={isSubmitting || !selectedWorkflowId}>
              Run current workflow
            </button>
            <button className="sketch-btn secondary" onClick={() => void handlePulseSystem()} disabled={isSubmitting}>
              Rebalance queues
            </button>
          </div>
          <div className="hero-note">
            The app works fully in-memory out of the box and upgrades itself automatically when `GEMINI_API_KEY` is present on Vercel.
          </div>
        </div>

        <div className="hero-panel sketch-card telemetry-panel">
          <div className="panel-header-row">
            <h2>Live system state</h2>
            <span className="status-badge status-running">{snapshot?.controls.autonomyMode ?? "supervised"}</span>
          </div>
          <div className="telemetry-grid">
            <div>
              <span className="metric-label">Active agents</span>
              <strong>{numberFormatter.format(snapshot?.metrics.activeAgents ?? 0)}</strong>
            </div>
            <div>
              <span className="metric-label">Runs in flight</span>
              <strong>{numberFormatter.format(snapshot?.metrics.runningNow ?? 0)}</strong>
            </div>
            <div>
              <span className="metric-label">Review queue</span>
              <strong>{numberFormatter.format(snapshot?.metrics.reviewQueue ?? 0)}</strong>
            </div>
            <div>
              <span className="metric-label">Average confidence</span>
              <strong>{numberFormatter.format(snapshot?.metrics.averageConfidence ?? 0)}%</strong>
            </div>
          </div>
          <div className="metric-strip">
            <span>Publish target: {snapshot?.controls.publishTarget}</span>
            <span>Escalation: {snapshot?.controls.escalationPolicy}</span>
          </div>
        </div>
      </section>

      <section id="workflows">
        <div className="section-heading-row">
          <div>
            <div className="section-chip">Templates</div>
            <h2>Workflow library</h2>
          </div>
          <p className="section-intro">Pick a workflow, adjust the objective, and let the agent team route the work end to end.</p>
        </div>
        <div className="workflow-grid">
          {workflows.map((workflow) => (
            <article
              key={workflow.id}
              className={`sketch-card workflow-card${selectedWorkflowId === workflow.id ? " workflow-card-active" : ""}`}
            >
              <div className="workflow-card-top">
                <span className="audience-pill">{workflow.audience}</span>
                <span className="status-badge status-completed">{workflow.stages.length} stages</span>
              </div>
              <h3>{workflow.title}</h3>
              <p>{workflow.description}</p>
              <div className="tag-row">
                {workflow.tags.map((tag) => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
              <p className="workflow-deliverable">Deliverable: {workflow.deliverable}</p>
              <button className="sketch-btn tertiary" onClick={() => applyWorkflowTemplate(workflow)}>
                Use this workflow
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="stack-column">
          <div className="sticky-note-form mission-form">
            <div className="panel-header-row">
              <h2>Mission composer</h2>
              <span className="status-badge status-review">{currentWorkflow?.title ?? "No workflow"}</span>
            </div>
            <label htmlFor="workflow-select"><strong>Workflow</strong></label>
            <select
              id="workflow-select"
              value={selectedWorkflowId ?? ""}
              onChange={(event) => {
                const workflow = workflows.find((item) => item.id === event.target.value);
                if (workflow) {
                  applyWorkflowTemplate(workflow);
                }
              }}
            >
              {workflows.map((workflow) => (
                <option key={workflow.id} value={workflow.id}>{workflow.title}</option>
              ))}
            </select>

            <label htmlFor="agent-select"><strong>Lead agent</strong></label>
            <select id="agent-select" value={selectedAgentId ?? ""} onChange={(event) => setSelectedAgentId(event.target.value)}>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>

            <label htmlFor="objective-input"><strong>Objective</strong></label>
            <textarea id="objective-input" rows={4} value={objective} onChange={(event) => setObjective(event.target.value)} />

            <label htmlFor="context-input"><strong>Context and constraints</strong></label>
            <textarea id="context-input" rows={4} value={context} onChange={(event) => setContext(event.target.value)} />

            <button className="sketch-btn primary full-width" onClick={() => void handleCreateRun()} disabled={isSubmitting || !selectedWorkflowId}>
              Dispatch workflow
            </button>
            {feedback ? <p className="feedback-line success-line">{feedback}</p> : null}
            {error ? <p className="feedback-line error-line">{error}</p> : null}
          </div>

          <div className="sketch-card control-card">
            <div className="panel-header-row">
              <h2>Operator controls</h2>
              <button className="text-action" onClick={() => void refreshSnapshot()}>Refresh</button>
            </div>
            <div className="control-grid">
              <label>
                <span>Autonomy</span>
                <select
                  value={snapshot?.controls.autonomyMode ?? "supervised"}
                  onChange={(event) => void handleControlUpdate({ type: "set-autonomy-mode", value: event.target.value as AutonomyMode }, "Autonomy mode updated.")}
                >
                  <option value="guardrailed">Guardrailed</option>
                  <option value="supervised">Supervised</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </label>
              <label>
                <span>Publish target</span>
                <select
                  value={snapshot?.controls.publishTarget ?? "notion"}
                  onChange={(event) => void handleControlUpdate({ type: "set-publish-target", value: event.target.value as PublishTarget }, "Publish target updated.")}
                >
                  <option value="notion">Notion</option>
                  <option value="slack">Slack</option>
                  <option value="linear">Linear</option>
                  <option value="email">Email</option>
                </select>
              </label>
              <label>
                <span>Escalation</span>
                <select
                  value={snapshot?.controls.escalationPolicy ?? "confidence-threshold"}
                  onChange={(event) => void handleControlUpdate({ type: "set-escalation-policy", value: event.target.value as EscalationPolicy }, "Escalation policy updated.")}
                >
                  <option value="human-first">Human first</option>
                  <option value="confidence-threshold">Confidence threshold</option>
                  <option value="sla-first">SLA first</option>
                </select>
              </label>
            </div>
            <div className="toggle-row">
              <button
                className={`toggle-pill${snapshot?.controls.autoRetry ? " toggle-pill-active" : ""}`}
                onClick={() => void handleControlUpdate({ type: "set-auto-retry", value: !snapshot?.controls.autoRetry }, "Auto-retry updated.")}
              >
                Auto retry {snapshot?.controls.autoRetry ? "on" : "off"}
              </button>
              <button
                className={`toggle-pill${snapshot?.controls.reviewRequired ? " toggle-pill-active" : ""}`}
                onClick={() => void handleControlUpdate({ type: "set-review-required", value: !snapshot?.controls.reviewRequired }, "Review gate updated.")}
              >
                Review gate {snapshot?.controls.reviewRequired ? "on" : "off"}
              </button>
            </div>
          </div>
        </div>

        <div className="stack-column" id="mission-board">
          <div className="sketch-card review-card">
            <div className="panel-header-row">
              <h2>Review queue</h2>
              <span className="status-badge status-review">{reviewQueue.length} waiting</span>
            </div>
            <div className="review-list">
              {reviewQueue.length === 0 ? <p className="muted-copy">No runs are waiting on human review.</p> : null}
              {reviewQueue.map((run) => (
                <article key={run.id} className="review-item">
                  <div>
                    <strong>{run.title}</strong>
                    <p>{run.operatorBrief}</p>
                  </div>
                  <div className="review-actions">
                    <button className="sketch-btn tertiary" onClick={() => setSelectedRunId(run.id)}>Inspect</button>
                    <button className="sketch-btn primary" onClick={() => void handleControlUpdate({ type: "resolve-run", runId: run.id }, "Review resolved.")}>Resolve</button>
                    <button className="sketch-btn secondary" onClick={() => void handleControlUpdate({ type: "retry-run", runId: run.id }, "Run retried.")}>Retry</button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="sketch-card run-list-card">
            <div className="panel-header-row">
              <h2>Mission board</h2>
              <select value={runFilter} onChange={(event) => setRunFilter(event.target.value as RunStatus | "all")} className="compact-select">
                <option value="all">All runs</option>
                <option value="completed">Completed</option>
                <option value="running">Running</option>
                <option value="needs-review">Needs review</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="run-list">
              {filteredRuns.map((run) => (
                <button key={run.id} className={`run-list-item${selectedRun?.id === run.id ? " run-list-item-active" : ""}`} onClick={() => setSelectedRunId(run.id)}>
                  <div className="run-list-main">
                    <strong>{run.title}</strong>
                    <span>{run.deliverable}</span>
                  </div>
                  <div className="run-list-meta">
                    <span className={`status-badge status-${run.status}`}>{statusLabel(run.status)}</span>
                    <span>{run.confidence}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <div className="sketch-card detail-card">
          <div className="panel-header-row">
            <h2>Selected run</h2>
            {selectedRun ? <span className={`status-badge status-${selectedRun.status}`}>{statusLabel(selectedRun.status)}</span> : null}
          </div>
          {selectedRun ? (
            <>
              <h3>{selectedRun.title}</h3>
              <p className="detail-objective">{selectedRun.objective}</p>
              <p className="detail-summary">{selectedRun.summary}</p>
              <div className="detail-metrics">
                <span>Confidence: {selectedRun.confidence}%</span>
                <span>Duration: {formatDuration(selectedRun.durationMs)}</span>
                <span>Deliverable: {selectedRun.deliverable}</span>
              </div>
              <div className="step-list">
                {selectedRun.steps.map((step) => {
                  const owner = agents.find((agent) => agent.id === step.ownerAgentId);
                  return (
                    <div key={`${selectedRun.id}-${step.label}`} className={`step-item step-${step.state}`}>
                      <strong>{step.label}</strong>
                      <span>{owner?.name ?? step.ownerAgentId}</span>
                    </div>
                  );
                })}
              </div>
              <div className="detail-columns">
                <div>
                  <h4>Agent contributions</h4>
                  <div className="contribution-list">
                    {selectedRun.contributions.map((item) => (
                      <article key={`${selectedRun.id}-${item.agentId}-${item.title}`} className="mini-card">
                        <strong>{item.title}</strong>
                        <p>{item.content}</p>
                      </article>
                    ))}
                  </div>
                </div>
                <div>
                  <h4>Artifacts</h4>
                  <div className="artifact-list">
                    {selectedRun.artifacts.map((artifact) => (
                      <article key={`${selectedRun.id}-${artifact.label}`} className="mini-card">
                        <strong>{artifact.label}</strong>
                        <p>{artifact.value}</p>
                      </article>
                    ))}
                  </div>
                  <h4>Recommendations</h4>
                  <ul className="plain-list">
                    {selectedRun.recommendations.map((item) => (
                      <li key={`${selectedRun.id}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <p className="muted-copy">Select a run to inspect its workflow path, artifacts, and recommendations.</p>
          )}
        </div>

        <div className="stack-column">
          <div className="sketch-card agent-roster-card">
            <div className="panel-header-row">
              <h2>Agent roster</h2>
              {currentAgent ? <span className={`status-badge status-${currentAgent.status}`}>{currentAgent.role}</span> : null}
            </div>
            <div className="agent-roster">
              {agents.map((agent) => (
                <article key={agent.id} className={`agent-row${selectedAgentId === agent.id ? " agent-row-active" : ""}`}>
                  <button className="agent-row-main" onClick={() => setSelectedAgentId(agent.id)}>
                    <strong>{agent.name}</strong>
                    <span>{agent.specialization}</span>
                  </button>
                  <div className="agent-row-meta">
                    <span className={`status-badge status-${agent.status}`}>{agent.status}</span>
                    <button className="text-action" onClick={() => void handleControlUpdate({ type: "toggle-agent", agentId: agent.id }, `${agent.name} status updated.`)}>
                      {agent.status === "paused" ? "Resume" : "Pause"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {currentAgent ? (
              <div className="agent-detail-panel">
                <h3>{currentAgent.name}</h3>
                <p>{currentAgent.description}</p>
                <div className="metric-strip multi-line-strip">
                  <span>Success rate: {currentAgent.successRate}%</span>
                  <span>Queue depth: {currentAgent.queueDepth}</span>
                  <span>Latency: {currentAgent.latencyMs}ms</span>
                </div>
                <p className="muted-copy">Ideal for: {currentAgent.idealFor.join(", ")}</p>
                <p className="muted-copy">Last summary: {currentAgent.lastRunSummary}</p>
              </div>
            ) : null}
          </div>

          <div className="sticky-note-form sandbox-card">
            <div className="panel-header-row">
              <h2>Sandbox duel</h2>
              <span className="status-badge status-failed">playground</span>
            </div>
            <p className="muted-copy">A playful stress test that deliberately perturbs agent confidence and queue pressure.</p>
            <div className="duel-selects">
              <select value={combatantA ?? ""} onChange={(event) => setCombatantA(event.target.value)}>
                {agents.map((agent) => (
                  <option key={`a-${agent.id}`} value={agent.id}>{agent.name}</option>
                ))}
              </select>
              <select value={combatantB ?? ""} onChange={(event) => setCombatantB(event.target.value)}>
                {agents.map((agent) => (
                  <option key={`b-${agent.id}`} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
            <div className="sandbox-actions">
              <button className="sketch-btn secondary" onClick={() => void handleAgentDuel()} disabled={isSubmitting}>Run duel</button>
              <button className="sketch-btn tertiary" onClick={() => void handlePulseSystem()} disabled={isSubmitting}>Pulse board</button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading-row">
          <div>
            <div className="section-chip">Architecture</div>
            <h2>How the system works</h2>
          </div>
          <p className="section-intro">This project follows the core multi-agent pattern from the DEV track: focused roles, orchestration, visible handoffs, and explicit review gates.</p>
        </div>
        <div className="architecture-grid">
          {snapshot?.playbooks.map((playbook) => (
            <article key={playbook.id} className="sketch-card architecture-card">
              <h3>{playbook.title}</h3>
              <p><strong>Trigger:</strong> {playbook.trigger}</p>
              <p><strong>Response:</strong> {playbook.response}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer-shell">
        <p>Built as a deployable multi-agent system demo and starter for Vercel.</p>
        <p>Use the README for setup, deployment, GitHub handoff, and DEV post guidance.</p>
      </footer>
    </main>
  );
}
