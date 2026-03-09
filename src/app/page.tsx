import { Reveal } from "@/components/reveal";

const leftWorkflow = [
  {
    index: "01",
    eyebrow: "Instinct",
    title: "Frame the mission as a story.",
    body:
      "Creative operators shape the brief like a thesis statement. The agent responds to tone, motive, and ambiguity instead of a sterile command sheet.",
  },
  {
    index: "02",
    eyebrow: "Editorial",
    title: "Direct with references, not rigid scripts.",
    body:
      "Moodboards, fragments, and edge cases become the prompt material. Each iteration preserves surprise while narrowing toward the desired outcome.",
  },
  {
    index: "03",
    eyebrow: "Judgment",
    title: "Curate outputs like an exhibition wall.",
    body:
      "The final system is a sequence of chosen moments. The human stays in the loop as critic, pacing editor, and narrative owner.",
  },
];

const rightWorkflow = [
  {
    index: "01",
    eyebrow: "Protocol",
    title: "Define the agent contract.",
    body:
      "Capabilities, limits, data sources, and retry behavior are stated up front so the system is observable under load.",
  },
  {
    index: "02",
    eyebrow: "Execution",
    title: "Chain tools through deterministic stages.",
    body:
      "Every handoff is measurable. Inputs are normalized, outputs are validated, and failures collapse into explicit recovery paths.",
  },
  {
    index: "03",
    eyebrow: "Operations",
    title: "Ship with telemetry and controls.",
    body:
      "The interface exposes status, latency, and confidence so teams can tune the model behavior without breaking trust.",
  },
];

const leftProfiles = [
  {
    title: "For strategy leads",
    body:
      "You want agents that can hold tension, interpret context, and keep a voice intact across campaigns, research, and publishing.",
  },
  {
    title: "For editorial teams",
    body:
      "You need a system that feels like collaboration instead of automation, where the machine becomes a sharp second set of instincts.",
  },
];

const rightProfiles = [
  {
    title: "for platform teams",
    body:
      "you need repeatable flows, clean tool orchestration, and interfaces that expose state instead of hiding complexity behind marketing language.",
  },
  {
    title: "for product operators",
    body:
      "you need agents that can route work, summarize decisions, and surface exceptions fast enough to fit into real operating tempo.",
  },
];

const rightOutcomes = [
  "multi-agent routing with explicit task ownership",
  "tool-aware execution logs for every handoff",
  "operator controls for retries, escalation, and publishing",
  "deployable interface patterns for real production teams",
];

export default function Home() {
  return (
    <main className="duel-shell">
      <div className="tension-line" aria-hidden="true">
        <div className="tension-line__pulse" />
      </div>

      <header className="top-nav">
        <span>AI Agents</span>
        <span>Typographic Duel</span>
        <span>March 2026</span>
      </header>

      <section className="hero split-section">
        <Reveal side="left" className="side side-a hero-panel">
          <p className="kicker">Side A / Narrative Operators</p>
          <h1>
            Agent
            <br />
            Theatre
          </h1>
          <Reveal side="left" delayMs={100}>
            <p className="hero-copy">
              Build an interface where orchestration feels authored, tactile, and human-led.
            </p>
          </Reveal>
        </Reveal>
        <Reveal side="right" className="side side-b hero-panel hero-panel-right">
          <p className="kicker">SIDE B / SYSTEM OPERATORS</p>
          <h2>
            AGENT
            <br />
            MACHINE
          </h2>
          <Reveal side="right" delayMs={100}>
            <p className="hero-copy">
              Compose reliable workflows, telemetry surfaces, and tool contracts around each autonomous step.
            </p>
          </Reveal>
        </Reveal>
      </section>

      <section className="workflow split-section">
        <div className="side side-a workflow-column">
          {leftWorkflow.map((item, index) => (
            <Reveal key={item.index} side="left" className={`workflow-block workflow-a-${index + 1}`}>
              <article>
                <span className="workflow-index">{item.index}</span>
                <p className="workflow-eyebrow">{item.eyebrow}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="side side-b workflow-column workflow-column-offset">
          {rightWorkflow.map((item, index) => (
            <Reveal key={item.index} side="right" className={`workflow-block workflow-b-${index + 1}`}>
              <article>
                <span className="workflow-index">{item.index}</span>
                <p className="workflow-eyebrow">{item.eyebrow}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="profiles split-section">
        <div className="side side-a profile-column">
          {leftProfiles.map((profile) => (
            <Reveal key={profile.title} side="left" className="profile-card">
              <article>
                <h3>{profile.title}</h3>
                <p>{profile.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="side side-b profile-column profile-column-offset">
          {rightProfiles.map((profile) => (
            <Reveal key={profile.title} side="right" className="profile-card">
              <article>
                <h3>{profile.title}</h3>
                <p>{profile.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="outcomes split-section">
        <Reveal side="left" className="side side-a outcome-panel">
          <p className="section-label">Outcome Statements</p>
          <p className="outcome-lead">
            The best agent interface does not flatten difference. It stages intuition and infrastructure in productive conflict.
          </p>
          <p className="outcome-lead secondary">
            One side persuades humans. The other side persuades systems.
          </p>
        </Reveal>
        <Reveal side="right" className="side side-b outcome-panel">
          <p className="section-label">OUTPUT LOG</p>
          <ul className="outcome-list">
            {rightOutcomes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="choice-moment">
        <div className="choice-noise" aria-hidden="true" />
        <blockquote>
          The agent is not the point. The operating posture around it is.
        </blockquote>
      </section>

      <section className="cta split-section final-cta">
        <Reveal side="left" className="side side-a cta-left">
          <p className="section-label">Choose a voice</p>
          <a href="#" className="cta-text-link">
            Enter the narrative workflow
          </a>
        </Reveal>
        <Reveal side="right" className="side side-b cta-right">
          <p className="section-label">CHOOSE A SYSTEM</p>
          <button type="button" className="cta-button">
            LAUNCH OPERATOR CONSOLE
          </button>
        </Reveal>
      </section>
    </main>
  );
}
