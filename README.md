# Multi-Agent Studio

A fully functional Next.js multi-agent system that turns one broad user request into a visible planner, researcher, builder, and reviewer workflow.

This project was rebuilt around the core ideas from the DEV Education track on building multi-agent systems: specialization, orchestration, explicit handoffs, and review gates. Instead of one giant prompt, the app gives users a workflow library, agent controls, a review queue, and inspectable run details.

## What the app does

Multi-Agent Studio is aimed at users who need practical help turning fuzzy work into structured output.

It ships with four workflow templates:

- Launch Campaign Studio
- Ops War Room
- Founder Decision Desk
- Ship Feature Relay

Each run produces:

- A workflow title and objective
- Stage-by-stage ownership
- Agent contributions
- Deliverable artifacts
- Recommendations and operator brief
- Review or completion state

The app runs locally with an in-memory orchestration engine and optionally upgrades itself with Gemini output when `GEMINI_API_KEY` is configured.

## Core features

- Workflow-first orchestration instead of a single prompt box
- Multiple specialized agents with visible roles and status
- Review queue with resolve and retry actions
- Operator controls for autonomy mode, publish target, and escalation policy
- Sandbox tools for queue pulse and agent duel stress testing
- Responsive sketchbook-style UI that works on desktop and mobile
- Zero-database setup for fast local runs and Vercel deployment

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Pure CSS
- Optional Gemini enrichment via `@google/genai`
- Vercel deployment target

## Local development

1. Install dependencies.

```bash
npm install
```

2. Create a local env file if you want Gemini-powered enrichment.

```bash
copy .env.example .env.local
```

3. Start the dev server.

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | No | Enables Gemini enrichment for generated run output |

If the key is missing, the app still works using the local multi-agent orchestration engine.

## How the orchestration works

The app uses four fixed roles:

- `Atlas Story` plans the mission and frames the deliverable.
- `Signal Curator` gathers evidence, tensions, and contradictions.
- `Vector Ops` turns the plan into an execution package.
- `Relay Console` reviews confidence, risk, and operator readiness.

A run follows this shape:

1. The user selects a workflow template.
2. A lead agent starts the workflow.
3. The store expands the objective into stages, contributions, artifacts, and recommendations.
4. Operator controls influence confidence, review gating, and publish behavior.
5. The result is shown in the mission board and review queue.
6. If Gemini is configured, the selected agent can enrich the final output.

## Project structure

- `src/components/agent-command-center.tsx`: the main interactive UI
- `src/lib/agent-duel/store.ts`: in-memory orchestration engine
- `src/lib/agent-duel/types.ts`: workflow, run, and control types
- `src/app/api/control-room`: route handlers for snapshot, run creation, controls, pulse, and duel

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. Import the repository into Vercel.
3. Add `GEMINI_API_KEY` in the Vercel project settings if you want model enrichment.
4. Deploy.

Vercel does not need a database or extra build services for this version of the app.

## Push to GitHub

If this repository is already connected to Git, the standard sequence is:

```bash
git add .
git commit -m "Build workflow-driven multi-agent studio"
git push origin main
```

If you want to publish under a new repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## DEV post draft

A submission-ready draft is included at `docs/devto-submission.md`.

## Why this version is more useful

The previous build leaned heavily on presentation. This version is oriented around real operator behavior:

- faster onboarding through template workflows
- clear roles instead of vague agent theatrics
- visible review and retry mechanics
- inspectable deliverables for non-technical users
- optional model integration without making local setup fragile

## Next improvements

- Persist runs to a real database
- Stream live agent events over SSE or websockets
- Add user authentication and saved workspaces
- Connect real tool adapters for Slack, Notion, and Linear
