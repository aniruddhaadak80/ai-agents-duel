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
      setLiveLogTicker(prev => [...prev.slice(-4), "?????? CRITICAL INK SPILL ??????"]);
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
        <div className="floating-icon" style={{ top: "20%", left: "10%" }}>??</div>
        <div className="floating-icon float-anim" style={{ top: "60%", right: "15%", animationDelay: "1s" }}>?</div>
        <div className="floating-icon float-anim" style={{ top: "30%", right: "25%", animationDelay: "2s" }}>??</div>
        
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
        <div style={{ marginTop: '2rem' }}>
          <strong>Active Drafts: </strong>{numberFormatter.format(snapshot?.metrics.runningNow ?? 0)}
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
                <div className="icon-circle">??</div>
                <h3 style={{cursor:"pointer"}} onClick={() => setSelectedAgentId(agent.id)}>{agent.name}</h3>
                <p><strong>{agent.specialization}</strong></p>
                <p>{agent.description}</p>
                <div className="agent-stats">
                  <span style={{color: "var(--accent-red)"}}>? {agent.successRate}% SR</span>
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
              <div className="polaroid-desc">
                 <h4 style={{ fontSize: '2rem' }}>Event Log</h4>
                 <ul style={{ listStyleType: "none", padding: 0 }}>
                   {run.events.map((ev, i) => <li key={i} style={{ marginBottom: "0.5rem" }}>?? {ev}</li>)}
                 </ul>
              </div>
            </div>
          ))}
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
             Submit Prompt ???
           </button>
           <p style={{ marginTop: '1rem', color: 'green', textAlign: 'center' }}>
             {feedback}
           </p>
         </div>

         {/* Duel Arena inside Desk area */}
         <div className="sticky-note-form" style={{ transform: "rotate(-1deg)", marginTop: "4rem", backgroundColor: "var(--accent-blue)", color: "#fff" }}>
           <div className="thumbtack" style={{ background: "var(--accent-yellow)" }}></div>
           <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: "#fff" }}>Scribble Battle ??</h3>
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
             Start Brawl! ??
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
