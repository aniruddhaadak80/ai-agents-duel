"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export function AgentCommandCenter({ mode = "home" }: CommandCenterProps) {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [objective, setObjective] = useState("Draft an unconventional narrative...");
  
  const [customSwarmAgents, setCustomSwarmAgents] = useState<string[]>([]);
  const [customSwarmObjective, setCustomSwarmObjective] = useState("Scan global networks and execute an algorithmic market hedge...");

  const [combatantA, setCombatantA] = useState<string | null>(null);
  const [combatantB, setCombatantB] = useState<string | null>(null);
  const [liveLogTicker, setLiveLogTicker] = useState<string[]>([
    "SYS_INIT: Sketchbook opened. Pencils sharpened.",
    "NETWORK: Awaiting creative sparks.",
  ]);
  const [glitchMode, setGlitchMode] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!snapshot) return;
    const interval = setInterval(() => {
      const activeAgents = snapshot.agents.filter(a => a.status !== "paused");
      if (activeAgents.length > 0) {
        const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const events = [
          `[${randomAgent.name}] doodled a new idea.`,
          `[${randomAgent.name}] erased a mistake.`,
          `[${randomAgent.name}] highlighted a key insight.`,
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
        if (!active) return;
        setSnapshot(data);
        setSelectedAgentId(data.agents[0]?.id ?? null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load the sketchbook.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function handlePulseSystem() {
    setError(null);
    setFeedback(null);
    setIsSubmitting(true);
    setGlitchMode(true);
    setTimeout(() => setGlitchMode(false), 3000);
    try {
      const response = await getJson<{ snapshot: DashboardSnapshot }>("/api/control-room/pulse", { method: "POST" });
      setSnapshot(response.snapshot);
      setLiveLogTicker(prev => [...prev.slice(-4), "⚠️ CRITICAL INK SPILL ⚠️"]);
      setFeedback("Ink spilled! Chaos anomalies deployed.");
    } catch (runError: unknown) {
      setError(runError instanceof Error ? runError.message : "Unable to pulse system.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAgentDuel() {
    if (!combatantA || !combatantB) return setError("Select two agents to duel.");
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

  async function handleSimulateSwarm(workflowName: string, tasks: {agentId: string, objective: string}[]) {
    setError(null);
    setFeedback(`Dispatching ${workflowName} Swarm Tasks...`);
    setIsSubmitting(true);
    try {
      for (const task of tasks) {
        await fetch("/api/control-room/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        });
      }
      const data = await getJson<DashboardSnapshot>("/api/control-room");
      setSnapshot(data);
      setLiveLogTicker(prev => [...prev.slice(-3), `🌐 OVERRIDE [${workflowName.toUpperCase()}] SWARM INITIATED 🌐`]);
      setFeedback(`Swarm populated successfully. Check the gallery!`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Swarm failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const toggleCustomAgent = (id: string) => {
    setCustomSwarmAgents(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  async function handleCustomSwarm() {
    if (customSwarmAgents.length === 0 || !customSwarmObjective.trim()) {
      return setError("Select at least one agent and define an objective.");
    }
    const tasks = customSwarmAgents.map(agentId => ({
      agentId,
      objective: customSwarmObjective
    }));
    await handleSimulateSwarm("CUSTOM PROTOCOL", tasks);
    setCustomSwarmAgents([]);
  }

  async function handleCreateRun() {
    if (!selectedAgentId || !objective.trim()) return;
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
      setError(runError instanceof Error ? runError.message : "Unable to run.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={glitchMode ? "global-meltdown" : ""}>
      <div className="holo-overlay"></div>
      <div className="neural-wire">
        <div className="neural-wire-content">
          {liveLogTicker.map((log, i) => (
            <span key={i} className="wire-item">{log}</span>
          ))}
        </div>
      </div>

      <div className="top-nav-container">
        <nav className="top-nav">
          <div className="brand-logo">{'{agent.sketch}'}</div>
          <div className="nav-links">
            <Link href="/" className="wavy-link">Agents</Link>
            <a href="#profiles" className="wavy-link">Gallery</a>
            <Link href="/control-room" className="wavy-link">Desk</Link>
          </div>
          <a href="https://github.com/aniruddhaadak80/ai-agents-duel" target="_blank" rel="noopener noreferrer" className="github-link" title="Source">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="floating-icon" style={{ top: "20%", left: "10%" }}>🎨</div>
        <div className="floating-icon float-anim" style={{ top: "60%", right: "15%", animationDelay: "1s" }}>✨</div>
        <div className="floating-icon float-anim" style={{ top: "30%", right: "25%", animationDelay: "2s" }}>✏️</div>
        
        <h1>
          Agent Sketchpad
          <svg className="hero-svg-underline" viewBox="0 0 300 20" preserveAspectRatio="none">
            <path d="M5,15 Q100,5 150,15 T300,10" fill="none" stroke="var(--accent-orange)" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </h1>
        <p className="hero-lead">Watch AI operators doodle their thoughts, compete in organic arenas, and build messy, beautiful narratives.</p>
        <div className="hero-actions">
          <button className="sketch-btn primary" onClick={() => void handlePulseSystem()} disabled={isSubmitting}>
             Spill Ink (Pulse)
          </button>
          <a href="#controls" className="sketch-btn secondary">Draw Prompt</a>
        </div>
        
        {/* Global Telemetry Radar */}
        <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '1.1rem', background: '#000', color: '#0f0', padding: '1rem 2rem', borderRadius: '8px', border: '2px solid #0f0', boxShadow: '5px 5px 0px 0px rgba(0,255,0,0.3)', transform: "rotate(-1deg)", maxWidth: "800px", margin: "3rem auto" }}>
          <div><strong>UPTIME:</strong> <span className={glitchMode ? "glitch-text" : ""}>{new Date().toISOString().split('T')[1].split('.')[0]}</span></div>
          <div><strong>ACTIVE AGENTS:</strong> {snapshot?.metrics.activeAgents ?? 0}/4</div>
          <div><strong>TASKS RUNNING:</strong> {numberFormatter.format(snapshot?.metrics.runningNow ?? 0)}</div>
          <div><strong>GLOBAL CONFIDENCE:</strong> {snapshot?.metrics.averageConfidence ?? 0}%</div>
          <div><strong>PROTOCOL:</strong> <span style={{ color: "var(--accent-orange)" }}>{snapshot?.controls.autonomyMode.toUpperCase() ?? 'AWAITING'}</span></div>
        </div>
      </section>

      {/* Feature Grid: Profiles */}
      <section id="profiles">
        <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '3rem' }}>The Creatives</h2>
        <div className="feature-grid">
          {snapshot?.agents.map((agent, i) => {
            const rot = i % 2 === 0 ? "2deg" : "-1deg";
            return (
              <div key={agent.id} className="feature-card sketch-card float-anim" style={{ transform: `rotate(${rot})` }}>
                <div className="thumbtack"></div>
                  <div className="icon-circle">🤖</div>
                <h3 style={{cursor:"pointer"}} onClick={() => setSelectedAgentId(agent.id)}>{agent.name}</h3>
                <p><strong>{agent.specialization}</strong></p>
                <p>{agent.description}</p>
                <div className="agent-stats">
                  <span style={{color: "var(--accent-red)"}}>📈 {agent.successRate}% SR</span>
                  <span>{agent.queueDepth} Queued</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Project Gallery: Live Runs */}
      <section id="gallery">
        <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '3rem' }}>Recent Masterpieces</h2>
        <div className="gallery-layout">
          {snapshot?.runs.slice(0, 4).map((run) => (
            <div key={run.id} className="gallery-item" style={{ transform: `rotate(${Math.random() * 2 - 1}deg)` }}>
              <div className="polaroid sketch-card">
                <div className="polaroid-tape tape-top-left"></div>
                <div className="polaroid-tape tape-top-right"></div>
                <h3>{run.title}</h3>
                <p><em>"{run.objective}"</em></p>
                <div style={{ borderTop: "2px dashed #ccc", paddingTop: "1rem", marginTop: "1rem" }}>
                  <p><strong>Status:</strong> <span style={{ color: run.status === 'failed' ? 'red' : 'green' }}>{run.status}</span></p>
                  <p><strong>Confidence:</strong> {run.confidence}%</p>
                </div>
              </div>
              <div className="polaroid-desc" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}><div><h4 style={{ fontSize: "2rem", color: "var(--accent-purple)" }}>Agent Output</h4><p style={{ whiteSpace: "pre-wrap", background: "#f0f0f0", padding: "1rem", borderRadius: "8px", border: "1px solid #ccc", fontFamily: "monospace", fontSize: "0.9rem", color: "#000" }}>{run.summary}</p></div><div><h4 style={{ fontSize: "2rem" }}>Event Log</h4><ul style={{ listStyleType: "none", padding: 0 }}>{run.events.map((ev, i) => <li key={i} style={{ marginBottom: "0.5rem" }}>⚡ {ev}</li>)}</ul></div></div></div>
          ))}
        </div>
      </section>

      {/* Enterprise / Futuristic Swarm Use Cases */}
      <section id="swarm" style={{ marginTop: "4rem", marginBottom: "4rem", position: "relative" }}>
        <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem', fontFamily: 'var(--font-kalam)' }}>
          🚀 Swarm Architectures
        </h2>
        <p style={{ textAlign: "center", marginBottom: "3rem", fontSize: "1.2rem", maxWidth: "700px", margin: "0 auto 3rem auto" }}>
          One-click simulation of <strong>industry-grade multi-agent collaboration</strong>. 
          See how distinct AI entities coordinate to tackle complex real-world pipelines.
        </p>
        
        <div className="feature-grid swarm-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          
          {/* Use Case 1: Cybersecurity */}
          <div className="sketch-card float-anim" style={{ transform: "rotate(-1deg)", background: "var(--accent-teal)" }}>
            <h3 style={{color: "#fff"}}>🛡️ Cyber Sec Audit</h3>
            <p style={{color: "#ffe", marginBottom: "1rem"}}>Continuous threat modeling + code verification swarm.</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
               <span style={{ fontSize: "0.8rem", background: "#fff", padding: "2px 6px", borderRadius: "10px" }}>Red Team AI</span>
               <span style={{ fontSize: "0.8rem", background: "#fff", padding: "2px 6px", borderRadius: "10px" }}>Log Parser AI</span>
            </div>
            <button className="sketch-btn primary" onClick={() => handleSimulateSwarm("Cyber Sec", [
              { agentId: "signal-curator", objective: "Analyze live server logs for zero-day behavioral anomalies." },
              { agentId: "vector-ops", objective: "Harden firewall policies and route suspicious IPs to dead zones." }
            ])}>Deploy Audit</button>
          </div>

          {/* Use Case 2: Marketing & Growth */}
          <div className="sketch-card float-anim" style={{ transform: "rotate(1deg)", background: "var(--accent-yellow)" }}>
            <h3>📈 Growth Engine</h3>
            <p style={{ marginBottom: "1rem" }}>A/B test generation + realtime sentiment curation.</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
               <span style={{ fontSize: "0.8rem", background: "#fff", padding: "2px 6px", borderRadius: "10px" }}>Copywriter AI</span>
               <span style={{ fontSize: "0.8rem", background: "#fff", padding: "2px 6px", borderRadius: "10px" }}>Analytics AI</span>
            </div>
            <button className="sketch-btn primary" onClick={() => handleSimulateSwarm("Growth Matrix", [
              { agentId: "atlas-story", objective: "Draft 3 aggressive ad hooks for a Gen-Z health drink." },
              { agentId: "relay-console", objective: "Monitor A/B metric streams and escalate underperforming assets." }
            ])}>Test Campaigns</button>
          </div>

          {/* Use Case 3: Autonomous Software Dev */}
          <div className="sketch-card float-anim" style={{ transform: "rotate(-2deg)", background: "var(--accent-blue)", color: "#fff" }}>
            <h3 style={{color: "#fff"}}>💻 Auto-DevOps</h3>
            <p style={{color: "#ffe", marginBottom: "1rem" }}>Feature coding + automated deployment validation.</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
               <span style={{ fontSize: "0.8rem", background: "#000", color: "#fff", padding: "2px 6px", borderRadius: "10px" }}>Code Weaver</span>
               <span style={{ fontSize: "0.8rem", background: "#000", color: "#fff", padding: "2px 6px", borderRadius: "10px" }}>QA Reviewer</span>
            </div>
            <button className="sketch-btn primary" onClick={() => handleSimulateSwarm("AutoDevOps", [
              { agentId: "vector-ops", objective: "Refactor legacy authentication routes into serverless Edge functions." },
              { agentId: "atlas-story", objective: "Write comprehensive technical documentation for the new auth system." },
              { agentId: "signal-curator", objective: "Audit developer pull request for backward-compatibility breaks." }
            ])}>Ship Feature</button>
          </div>
          
          {/* Use Case 4: FinTech / Quant Trading */}
          <div className="sketch-card float-anim" style={{ transform: "rotate(1deg)", background: "#1a1a1a", color: "#00ffcc" }}>
            <h3 style={{color: "#00ffcc"}}>💰 Quant AI</h3>
            <p style={{color: "#aaa", marginBottom: "1rem" }}>High-frequency sentiment + execution bots.</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
               <span style={{ fontSize: "0.8rem", background: "#00ffcc", color: "#000", padding: "2px 6px", borderRadius: "10px" }}>News Scraper</span>
               <span style={{ fontSize: "0.8rem", background: "#00ffcc", color: "#000", padding: "2px 6px", borderRadius: "10px" }}>Algorithmic Trader</span>
            </div>
            <button className="sketch-btn" style={{ background: "#00ffcc", color: "#000", border: "2px solid #00ffcc" }} onClick={() => handleSimulateSwarm("Quant Hedge", [
              { agentId: "signal-curator", objective: "Analyze Twitter and Bloomberg feeds for semiconductor supply chain disruption." },
              { agentId: "vector-ops", objective: "Execute correlated micro-trades against NVDA and ASML instantly." }
            ])}>Execute Hedge</button>
          </div>
          
          {/* Use Case 5: Medical / BioTech */}
          <div className="sketch-card float-anim" style={{ transform: "rotate(-1deg)", background: "#ffe0f0" }}>
            <h3 style={{color: "#d61c6b"}}>🧬 BioTech AI</h3>
            <p style={{color: "#801241", marginBottom: "1rem" }}>Protein folding prediction & clinical auditing.</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
               <span style={{ fontSize: "0.8rem", background: "#d61c6b", color: "#fff", padding: "2px 6px", borderRadius: "10px" }}>Molecular Sim</span>
               <span style={{ fontSize: "0.8rem", background: "#d61c6b", color: "#fff", padding: "2px 6px", borderRadius: "10px" }}>Trial Auditor</span>
            </div>
            <button className="sketch-btn primary" onClick={() => handleSimulateSwarm("BioTech Gen", [
              { agentId: "relay-console", objective: "Simulate folding permutations for experimental enzyme #44B." },
              { agentId: "atlas-story", objective: "Compile simulation data into FDA-compliant clinical readouts." }
            ])}>Run Trials</button>
          </div>

        </div>
        
        {/* Custom Swarm Matrix Sandbox */}
        <div className="sticky-note-form custom-swarm-builder float-anim" style={{ maxWidth: "100%", marginTop: "3rem", background: "url('data:image/svg+xml;utf8,<svg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"2\" cy=\"2\" r=\"1\" fill=\"rgba(0,0,0,0.1)\"/></svg>')", backgroundColor: "#fafafa" }}>
           <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: "var(--accent-purple)", textAlign: "center" }}>🧪 Custom Swarm Sandbox</h3>
           <p style={{textAlign: "center", marginBottom: "2rem"}}>Hand-pick your own network of agents and orchestrate an autonomous mass-deployment.</p>
           
           <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginBottom: "2rem" }}>
             {snapshot?.agents.map(a => (
               <label key={a.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", border: "2px solid #ccc", borderRadius: "15px", cursor: "pointer", background: customSwarmAgents.includes(a.id) ? "var(--accent-purple)" : "#fff", color: customSwarmAgents.includes(a.id) ? "#fff" : "#000", fontWeight: "bold", transition: "all 0.2s ease" }}>
                 <input type="checkbox" style={{ accentColor: "black", width: "20px", height: "20px" }} checked={customSwarmAgents.includes(a.id)} onChange={() => toggleCustomAgent(a.id)} />
                 {a.name}
               </label>
             ))}
           </div>

           <label><strong>Unified Prime Directive:</strong></label>
           <textarea rows={3} value={customSwarmObjective} onChange={(e) => setCustomSwarmObjective(e.target.value)} style={{ borderColor: "var(--accent-purple)", borderBottomWidth: "4px" }}></textarea>
           
           <button className="sketch-btn danger" style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box', background: "var(--accent-purple)", color: "white", textTransform: "uppercase", letterSpacing: "1px", fontSize: "1.3rem" }} onClick={() => void handleCustomSwarm()} disabled={isSubmitting || customSwarmAgents.length === 0}>
             ⚠️ Initialize Custom Protocol
           </button>
        </div>

      </section>

      {/* Contact Form / Sticky Note Controls */}
      <section id="controls" style={{ position: 'relative' }}>
         <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '3rem' }}>Operator's Desk</h2>
         
         <div className="sticky-note-form">
           <div className="thumbtack" style={{ top: "10px" }}></div>
           <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Create New Prompt</h3>
           <label><strong>Select Agent:</strong></label>
           <select value={selectedAgentId ?? ""} onChange={(e) => setSelectedAgentId(e.target.value)}>
              {snapshot?.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
           </select>
           
           <label><strong>Objective:</strong></label>
           <textarea rows={4} value={objective} onChange={(e) => setObjective(e.target.value)}></textarea>
           
           <button className="sketch-btn primary" style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box' }} onClick={() => void handleCreateRun()} disabled={isSubmitting}>
             Submit Prompt 🚀
           </button>
           <p style={{ marginTop: '1rem', color: 'green', textAlign: 'center' }}>
             {feedback}
           </p>
         </div>

         {/* Duel Arena inside Desk area */}
         <div className="sticky-note-form" style={{ transform: "rotate(-1deg)", marginTop: "4rem", backgroundColor: "var(--accent-blue)", color: "#fff" }}>
           <div className="thumbtack" style={{ background: "var(--accent-yellow)" }}></div>
           <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: "#fff" }}>Scribble Battle ⚔️</h3>
           <p>Pit two agents against each other to steal creative juice.</p>
           <div className="duel-selects">
             <select value={combatantA ?? ""} onChange={(e) => setCombatantA(e.target.value)} style={{flex: 1, backgroundColor: "#fff"}}>
               <option value="" disabled>Alpha...</option>
               {snapshot?.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
             </select>
             <span className="duel-vs">VS</span>
             <select value={combatantB ?? ""} onChange={(e) => setCombatantB(e.target.value)} style={{flex: 1, backgroundColor: "#fff"}}>
               <option value="" disabled>Beta...</option>
               {snapshot?.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
             </select>
           </div>
           <button className="sketch-btn danger" style={{ width: '100%', textAlign: 'center', marginTop: "1.5rem", boxSizing: "border-box" }} onClick={() => void handleAgentDuel()} disabled={isSubmitting}>
             Start Brawl! 🔥
           </button>
         </div>
      </section>

      <section style={{ maxWidth: "800px", margin: "4rem auto" }} className="sticky-note-form">
        <h3 style={{ textDecoration: "underline", textDecorationStyle: "wavy", textDecorationColor: "var(--accent-teal)", fontSize: "2rem" }}>
          Behind the Canvas 🎨
        </h3>
        <p style={{ marginTop: "1rem", fontSize: "1.2rem", lineHeight: "1.5" }}>
          <strong>For Everyone (Even Non-Technical!):</strong> This is a magical "Digital Sketchbook" illusion! The robotic agents fighting and working above? They're simulated with complex math to look real. It's meant to spark your imagination—think about what a real team of intelligent AI agents could do together.
        </p>
        <p style={{ marginTop: "1rem", fontSize: "1.2rem", lineHeight: "1.5" }}>
          <strong>For Builders & Developers:</strong> Want to build an actual AI command center?
          <br/>
          💡 <strong>Plug in Real AI:</strong> You can fork this repo and swap our simulated math inside <code>src/app/api/control-room</code> with actual OpenAI or Anthropic API keys.
          <br/>
          💡 <strong>Steal the UI:</strong> Love this wobbly, hand-drawn look? Go to the <a href="https://github.com/aniruddhaadak80/ai-agents-duel" target="_blank" rel="noreferrer" className="wavy-link" style={{color: "var(--accent-orange)"}}>GitHub repo</a>, grab <code>globals.css</code>, and steal the code for your own projects!
        </p>
      </section>

      <footer style={{ textAlign: "center", padding: "4rem", borderTop: "3px solid #1a1a1a", marginTop: "4rem", fontFamily: "var(--font-kalam)" }}>
        <p>Handcrafted by <a href="https://github.com/aniruddhaadak80/ai-agents-duel" className="wavy-link" style={{color: "var(--accent-orange)"}}>Aniruddha Adak</a></p>
        <p>&copy; {new Date().getFullYear()} Sketchbook System</p>
      </footer>
    </main>
  );
}

