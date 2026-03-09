"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/reveal";
import {
  AgentProfile,
  AgentRun,
  AutonomyMode,
  DashboardSnapshot,
  EscalationPolicy,
  PublishTarget,
  UpdateControlInput,
} from "@/lib/agent-duel/types";

type CommandCenterProps = {
  mode?: "home" | "control-room";
};

const numberFormatter = new Intl.NumberFormat("en-US");

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
  const seconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function getAgentTone(status: AgentProfile["status"]) {
  if (status === "degraded") {
    return "is-warn";
  }

  if (status === "paused") {
    return "is-muted";
  }

  if (status === "running") {
    return "is-live";
  }

  return "is-ready";
}

function getRunTone(status: AgentRun["status"]) {
  if (status === "failed") {
    return "is-warn";
  }

  if (status === "needs-review") {
    return "is-review";
  }

  if (status === "running" || status === "queued") {
    return "is-live";
  }

  return "is-ready";
}

export function AgentCommandCenter({ mode = "home" }: CommandCenterProps) {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [objective, setObjective] = useState(
    "Prepare a high-confidence launch brief and route the publish-ready output to the operator queue.",
  );
  
  // High-Energy Feature State
  const [combatantA, setCombatantA] = useState<string | null>(null);
  const [combatantB, setCombatantB] = useState<string | null>(null);
  const [liveLogTicker, setLiveLogTicker] = useState<string[]>([
    "SYS_INIT: Boot sequence authenticated.",
    "NETWORK: Operators standing by.",
  ]);
  const [glitchMode, setGlitchMode] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Background Neural Stream
  useEffect(() => {
    if (!snapshot) return;
    const interval = setInterval(() => {
      const activeAgents = snapshot.agents.filter(a => a.status !== "paused");
      if (activeAgents.length > 0) {
        const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const events = [
          `[${randomAgent.name}] realigning neural weights.`,
          `[${randomAgent.name}] memory fragment recovered.`,
          `[${randomAgent.name}] intercepting external packet.`,
          `[${randomAgent.name}] analyzing risk vector.`,
        ];
        const evt = events[Math.floor(Math.random() * events.length)];
        setLiveLogTicker(prev => [...prev.slice(-4), evt]);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [snapshot]);

  useEffect(() => {
    let active = true;

    getJson<DashboardSnapshot>("/api/control-room")
      .then((data) => {
        if (!active) {
          return;
        }

        setSnapshot(data);
        setSelectedAgentId(data.agents[0]?.id ?? null);
        setSelectedRunId(data.runs[0]?.id ?? null);
      })
      .catch((loadError: unknown) => {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load the control room.");
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function refreshSnapshot() {
    const data = await getJson<DashboardSnapshot>("/api/control-room");
    setSnapshot(data);
    setSelectedAgentId((current) => current ?? data.agents[0]?.id ?? null);
    setSelectedRunId((current) => current ?? data.runs[0]?.id ?? null);
    return data;
  }

  async function handleControlUpdate(payload: UpdateControlInput, successMessage: string) {
    setError(null);
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const data = await getJson<DashboardSnapshot>("/api/control-room/control", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSnapshot(data);
      setFeedback(successMessage);
    } catch (updateError: unknown) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update control room state.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateRun() {
    if (!selectedAgentId || !objective.trim()) {
      return;
    }

    setError(null);
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await getJson<{ snapshot: DashboardSnapshot; run: AgentRun }>("/api/control-room/run", {
        method: "POST",
        body: JSON.stringify({ agentId: selectedAgentId, objective }),
      });

      setSnapshot(response.snapshot);
      setSelectedRunId(response.run.id);
      setFeedback(`Created ${response.run.title}.`);
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
    
    // Auto turn off UI glitch mode after 3s to let the eye rest
    setTimeout(() => setGlitchMode(false), 3000);

    try {
      const response = await getJson<{ snapshot: DashboardSnapshot }>("/api/control-room/pulse", {
        method: "POST",
      });

      setSnapshot(response.snapshot);
      setLiveLogTicker(prev => [...prev.slice(-4), "🔥🔥🔥 CRITICAL SYSTEM PULSE INITIATED 🔥🔥🔥"]);
      setFeedback("System pulsed! Chaos anomalies deployed.");
    } catch (runError: unknown) {
      setError(runError instanceof Error ? runError.message : "Unable to pulse system.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAgentDuel() {
    if (!combatantA || !combatantB) {
      setError("Select two agents to duel.");
      return;
    }
    setError(null);
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await getJson<{ snapshot: DashboardSnapshot; duelLog: string }>("/api/control-room/duel", {
        method: "POST",
        body: JSON.stringify({ agent1Id: combatantA, agent2Id: combatantB })
      });
      setSnapshot(response.snapshot);
      setLiveLogTicker(prev => [...prev.slice(-4), response.duelLog]);
      setFeedback("Duel resolved.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Duel failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedAgent = snapshot?.agents.find((agent) => agent.id === selectedAgentId) ?? snapshot?.agents[0] ?? null;
  const selectedRun = snapshot?.runs.find((run) => run.id === selectedRunId) ?? snapshot?.runs[0] ?? null;
  const leftAgents = snapshot?.agents.filter((agent) => agent.side === "left") ?? [];
  const rightAgents = snapshot?.agents.filter((agent) => agent.side === "right") ?? [];
  const leftPlaybooks = snapshot?.playbooks.filter((playbook) => playbook.side === "left") ?? [];
  const rightPlaybooks = snapshot?.playbooks.filter((playbook) => playbook.side === "right") ?? [];

  return (
    <main className={`duel-shell ${glitchMode ? "global-meltdown" : ""}`}>
      {/* Live Cyber Ticker */}
      <div className="neural-wire">
        <div className="neural-wire-content">
          {liveLogTicker.map((log, i) => (
            <span key={i} className="wire-item">{log}</span>
          ))}
        </div>
      </div>

      <div className="tension-line" aria-hidden="true">
        <div className="tension-line__pulse" />
      </div>

      <header className="top-nav">
        <Link href="/">AI Agents</Link>
        <a href="#runs">Live Runs</a>
        <Link href="/control-room">Control Room</Link>
        <a href="https://github.com/AniruddhaAdak" target="_blank" rel="noopener noreferrer" className="github-link" title="Source">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        </a>
      </header>

      <section className="hero split-section">
        <Reveal side="left" className="side side-a hero-panel">
          <p className="kicker">Side A / Narrative Operators</p>
          <h1>{mode === "home" ? "Agent Theatre" : "Control Voice"}</h1>
          <Reveal side="left" delayMs={100}>
            <p className="hero-copy">
              Real agent profiles, live run creation, and editorial-grade playbooks now sit behind the duel instead of static display copy.
            </p>
          </Reveal>
          <dl className="hero-metrics hero-metrics-left">
            <div>
              <dt>active agents</dt>
              <dd>{numberFormatter.format(snapshot?.metrics.activeAgents ?? 0)}</dd>
            </div>
            <div>
              <dt>completed today</dt>
              <dd>{numberFormatter.format(snapshot?.metrics.completedToday ?? 0)}</dd>
            </div>
          </dl>
        </Reveal>
        <Reveal side="right" className="side side-b hero-panel hero-panel-right">
          <p className="kicker">SIDE B / SYSTEM OPERATORS</p>
          <h2>{mode === "home" ? "AGENT MACHINE" : "RUN CONSOLE"}</h2>
          <Reveal side="right" delayMs={100}>
            <p className="hero-copy">
              The backend exposes a control-room snapshot, mutation routes for new runs, and live controls for autonomy, review, and escalation.
            </p>
          </Reveal>
          <dl className="hero-metrics hero-metrics-right">
            <div>
              <dt>running now</dt>
              <dd>{numberFormatter.format(snapshot?.metrics.runningNow ?? 0)}</dd>
            </div>
            <div>
              <dt>avg confidence</dt>
              <dd>{numberFormatter.format(snapshot?.metrics.averageConfidence ?? 0)}%</dd>
            </div>
          </dl>
        </Reveal>
      </section>

      <section className="split-section status-strip">
        <Reveal side="left" className="side side-a strip-panel">
          <p className="section-label">System Feed</p>
          <p className="strip-copy">
            {isLoading ? "Loading live snapshot..." : `Generated ${new Date(snapshot?.generatedAt ?? Date.now()).toLocaleTimeString()}`}
          </p>
        </Reveal>
        <Reveal side="right" className="side side-b strip-panel strip-panel-right">
          <div className="status-actions">
            <button type="button" className="utility-button" onClick={() => void refreshSnapshot()} disabled={isSubmitting || isLoading}>
              Refresh Snapshot
            </button>
            <span className="inline-status">{isSubmitting ? "updating" : feedback ?? error ?? "stable"}</span>
          </div>
        </Reveal>
      </section>

      <section className="profiles split-section" id="agents">
        <div className="side side-a profile-column">
          <Reveal side="left" className="section-intro">
            <p className="section-label">Agent Profiles</p>
            <p className="section-copy">Select any agent to seed the run composer and inspect its operating posture.</p>
          </Reveal>
          {leftAgents.map((agent) => (
            <Reveal key={agent.id} side="left" className={`profile-card agent-card ${selectedAgent?.id === agent.id ? "is-selected" : ""}`}>
              <article>
                <div className="agent-card-head">
                  <span className={`status-pill ${getAgentTone(agent.status)}`}>{agent.status}</span>
                  <button
                    type="button"
                    className="micro-button"
                    onClick={() => {
                      setSelectedAgentId(agent.id);
                      void handleControlUpdate({ type: "toggle-agent", agentId: agent.id }, `${agent.name} status updated.`);
                    }}
                    disabled={isSubmitting}
                  >
                    {agent.status === "paused" ? "Resume" : "Pause"}
                  </button>
                </div>
                <button type="button" className="agent-select" onClick={() => setSelectedAgentId(agent.id)}>
                  <h3>{agent.name}</h3>
                  <p className="agent-meta">{agent.philosophy}</p>
                  <p>{agent.description}</p>
                </button>
                <div className="agent-stats">
                  <span>{agent.specialization}</span>
                  <span>{agent.successRate}% success</span>
                  <span>{agent.queueDepth} queued</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="side side-b profile-column profile-column-offset">
          <Reveal side="right" className="section-intro">
            <p className="section-label">Operator Agents</p>
            <p className="section-copy section-copy-mono">These agents route work, expose telemetry, and guard the control surface.</p>
          </Reveal>
          {rightAgents.map((agent) => (
            <Reveal key={agent.id} side="right" className={`profile-card agent-card ${selectedAgent?.id === agent.id ? "is-selected" : ""}`}>
              <article>
                <div className="agent-card-head">
                  <span className={`status-pill ${getAgentTone(agent.status)}`}>{agent.status}</span>
                  <button
                    type="button"
                    className="micro-button"
                    onClick={() => {
                      setSelectedAgentId(agent.id);
                      void handleControlUpdate({ type: "toggle-agent", agentId: agent.id }, `${agent.name} status updated.`);
                    }}
                    disabled={isSubmitting}
                  >
                    {agent.status === "paused" ? "RESUME" : "PAUSE"}
                  </button>
                </div>
                <button type="button" className="agent-select" onClick={() => setSelectedAgentId(agent.id)}>
                  <h3>{agent.name}</h3>
                  <p className="agent-meta">{agent.philosophy}</p>
                  <p>{agent.description}</p>
                </button>
                <div className="agent-stats agent-stats-mono">
                  <span>{agent.specialization}</span>
                  <span>{agent.latencyMs}ms</span>
                  <span>{agent.queueDepth} queued</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="operator split-section" id="controls">
        <Reveal side="left" className="side side-a operator-panel">
          <p className="section-label">Launch a Run</p>
          <div className="selected-agent-panel">
            <p className="selected-agent-kicker">Selected agent</p>
            <h3>{selectedAgent?.name ?? "No agent selected"}</h3>
            <p>{selectedAgent?.lastRunSummary ?? "Choose an agent to see its latest run behavior."}</p>
          </div>
          <label className="field-label" htmlFor="objective-input">
            Objective
          </label>
          <textarea
            id="objective-input"
            className="duel-textarea"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            placeholder="Describe the task you want the selected agent to perform."
          />
          <div className="composer-actions">
            <button type="button" className="cta-text-button" onClick={() => void handleCreateRun()} disabled={isSubmitting || !selectedAgentId}>
              Launch operator run
            </button>
            <span className="helper-copy">{selectedAgent ? selectedAgent.tools.join(" / ") : "No tools selected yet."}</span>
          </div>
        </Reveal>
        <Reveal side="right" className="side side-b operator-panel">
          <p className="section-label">Operator Controls</p>
          <div className="control-grid">
            <label className="control-field">
              <span>autonomy mode</span>
              <select
                value={snapshot?.controls.autonomyMode ?? "supervised"}
                onChange={(event) =>
                  void handleControlUpdate(
                    { type: "set-autonomy-mode", value: event.target.value as AutonomyMode },
                    "Autonomy mode updated.",
                  )
                }
                disabled={isSubmitting || !snapshot}
              >
                <option value="guardrailed">guardrailed</option>
                <option value="supervised">supervised</option>
                <option value="aggressive">aggressive</option>
              </select>
            </label>
            <label className="control-field">
              <span>publish target</span>
              <select
                value={snapshot?.controls.publishTarget ?? "notion"}
                onChange={(event) =>
                  void handleControlUpdate(
                    { type: "set-publish-target", value: event.target.value as PublishTarget },
                    "Publish target updated.",
                  )
                }
                disabled={isSubmitting || !snapshot}
              >
                <option value="notion">notion</option>
                <option value="slack">slack</option>
                <option value="linear">linear</option>
              </select>
            </label>
            <label className="control-field">
              <span>escalation policy</span>
              <select
                value={snapshot?.controls.escalationPolicy ?? "confidence-threshold"}
                onChange={(event) =>
                  void handleControlUpdate(
                    { type: "set-escalation-policy", value: event.target.value as EscalationPolicy },
                    "Escalation policy updated.",
                  )
                }
                disabled={isSubmitting || !snapshot}
              >
                <option value="human-first">human-first</option>
                <option value="confidence-threshold">confidence-threshold</option>
                <option value="sla-first">sla-first</option>
              </select>
            </label>
          </div>
          <div className="toggle-grid">
            <button
              type="button"
              className={`toggle-chip ${snapshot?.controls.autoRetry ? "is-active" : ""}`}
              onClick={() =>
                void handleControlUpdate(
                  { type: "set-auto-retry", value: !(snapshot?.controls.autoRetry ?? false) },
                  "Auto retry updated.",
                )
              }
              disabled={isSubmitting || !snapshot}
            >
              auto retry: {snapshot?.controls.autoRetry ? "on" : "off"}
            </button>
            <button
              type="button"
              className={`toggle-chip ${snapshot?.controls.reviewRequired ? "is-active" : ""}`}
              onClick={() =>
                void handleControlUpdate(
                  { type: "set-review-required", value: !(snapshot?.controls.reviewRequired ?? false) },
                  "Review gate updated.",
                )
              }
              disabled={isSubmitting || !snapshot}
            >
              review gate: {snapshot?.controls.reviewRequired ? "on" : "off"}
            </button>
          </div>
          <p className="helper-copy helper-copy-mono">
            {selectedAgent ? `${selectedAgent.name} safeguards: ${selectedAgent.safeguards.join(" / ")}` : "Select an agent to inspect safeguards."}
          </p>
        </Reveal>
      </section>

      <section className="runs split-section" id="runs">
        <div className="side side-a run-column">
          <Reveal side="left" className="section-intro">
            <p className="section-label">Live Runs</p>
            <p className="section-copy">Runs are created through the backend and kept in an in-memory control-room state.</p>
          </Reveal>
          <div className="run-list">
            {snapshot?.runs.map((run) => {
              const agent = snapshot.agents.find((item) => item.id === run.agentId);

              return (
                <Reveal key={run.id} side="left" className={`run-card ${selectedRun?.id === run.id ? "is-selected" : ""}`}>
                  <button type="button" className="run-select" onClick={() => setSelectedRunId(run.id)}>
                    <div className="run-card-head">
                      <span className={`status-pill ${getRunTone(run.status)}`}>{run.status}</span>
                      <span className="run-confidence">{run.confidence}%</span>
                    </div>
                    <h3>{run.title}</h3>
                    <p>{agent?.name ?? "Unknown agent"}</p>
                    <p>{run.summary}</p>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
        <Reveal side="right" className="side side-b run-detail-panel">
          <p className="section-label">Run Detail</p>
          {selectedRun ? (
            <>
              <div className="run-detail-head">
                <h3>{selectedRun.title}</h3>
                <button
                  type="button"
                  className="micro-button"
                  onClick={() => void handleControlUpdate({ type: "retry-run", runId: selectedRun.id }, "Retry queued.")}
                  disabled={isSubmitting}
                >
                  RETRY RUN
                </button>
              </div>
              <p className="run-objective">{selectedRun.objective}</p>
              <div className="detail-metrics">
                <span>{formatDuration(selectedRun.durationMs)}</span>
                <span>{selectedRun.confidence}% confidence</span>
                <span>{selectedRun.events.length} events</span>
              </div>
              <p className="detail-output">{selectedRun.output}</p>
              <div className="step-list">
                {selectedRun.steps.map((step) => (
                  <div key={step.label} className={`step-row step-${step.state}`}>
                    <span>{step.label}</span>
                    <span>{step.state}</span>
                  </div>
                ))}
              </div>
              <ul className="event-list">
                {selectedRun.events.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="helper-copy helper-copy-mono">No run selected.</p>
          )}
        </Reveal>
      </section>

      <section className="playbooks split-section">
        <div className="side side-a workflow-column">
          <Reveal side="left" className="section-intro">
            <p className="section-label">Playbooks</p>
            <p className="section-copy">Human-facing playbooks frame when narrative agents should lead.</p>
          </Reveal>
          {leftPlaybooks.map((playbook, index) => (
            <Reveal key={playbook.id} side="left" className={`workflow-block workflow-a-${index + 1}`}>
              <article>
                <span className="workflow-index">0{index + 1}</span>
                <p className="workflow-eyebrow">{playbook.trigger}</p>
                <h3>{playbook.title}</h3>
                <p>{playbook.response}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="side side-b workflow-column workflow-column-offset">
          <Reveal side="right" className="section-intro">
            <p className="section-label">Operator Playbooks</p>
            <p className="section-copy section-copy-mono">System-facing playbooks keep runs observable and safe under pressure.</p>
          </Reveal>
          {rightPlaybooks.map((playbook, index) => (
            <Reveal key={playbook.id} side="right" className={`workflow-block workflow-b-${index + 1}`}>
              <article>
                <span className="workflow-index">0{index + 1}</span>
                <p className="workflow-eyebrow">{playbook.trigger}</p>
                <h3>{playbook.title}</h3>
                <p>{playbook.response}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="choice-moment chaos-ribbon">
        <div className="choice-noise" aria-hidden="true" />
        <blockquote>The interface now carries live state, not just a visual argument. Welcome to the chaos arena.</blockquote>
        <button type="button" className="chaos-pulse-btn anomaly-deck" onClick={() => void handlePulseSystem()} disabled={isSubmitting}>
             INITIATE SYSTEM PULSE 🔥
        </button>
      </section>

      {/* NEW: Agent Sabotage / Duel Arena */}
      <section className="operator split-section duel-arena">
        <Reveal side="left" className="side side-a operator-panel">
          <p className="section-label" style={{ color: "var(--warn)" }}>AGENT APEX ARENA</p>
          <p className="hero-copy">Pit two agents against each other in the neural network. The winner receives a combat buff. The loser gets degraded and their queue floods.</p>
          <div className="duel-controls">
            <select className="duel-select" value={combatantA ?? ""} onChange={(e) => setCombatantA(e.target.value)}>
              <option value="" disabled>Select Combatant Alpha...</option>
              {snapshot?.agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.successRate}% SR)</option>)}
            </select>
            <span className="duel-vs">VS</span>
            <select className="duel-select" value={combatantB ?? ""} onChange={(e) => setCombatantB(e.target.value)}>
              <option value="" disabled>Select Combatant Beta...</option>
              {snapshot?.agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.successRate}% SR)</option>)}
            </select>
          </div>
          <button 
            type="button" 
            className="chaos-pulse-btn combat-btn" 
            onClick={() => void handleAgentDuel()} 
            disabled={isSubmitting || !combatantA || !combatantB || combatantA === combatantB}
          >
            EXECUTE NEURAL DUEL ⚔️
          </button>
        </Reveal>
        <Reveal side="right" className="side side-b operator-panel duel-log-panel">
          <p className="section-label">DUEL TELEMETRY</p>
          <div className="duel-log-output">
             {liveLogTicker.slice(-5).map((log, i) => (
                <div key={i} className="duel-log-row">
                  <span className="log-timestamp">{new Date().toISOString().split('T')[1].slice(0, -1)}</span>
                  <span className="log-msg" style={{ color: log.includes("CRITICAL") ? "var(--accent)" : "inherit" }}>{log}</span>
                </div>
             ))}
          </div>
        </Reveal>
      </section>

      <section className="cta split-section final-cta">
        <Reveal side="left" className="side side-a cta-left">
          <p className="section-label">Next action</p>
          <a href="#controls" className="cta-text-link">
            Launch another workflow
          </a>
        </Reveal>
        <Reveal side="right" className="side side-b cta-right">
          <p className="section-label">SYSTEM PAGE</p>
          <Link href="/control-room" className="cta-button-link">
            OPEN CONTROL ROOM
          </Link>
        </Reveal>
      </section>

      <footer className="footer-built">
        <p>Built by Aniruddha Adak</p>
        <p>&copy; {new Date().getFullYear()} Agent-Duel System</p>
      </footer>
    </main>
  );
}