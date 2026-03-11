---
published: false
tags: agents,buildmultiagents,gemini,nextjs,vercel
---

*This post is my submission for the [DEV Education Track: Build Multi-Agent Systems](https://dev.to/deved/build-multi-agent-systems).* 

## What I Built

I built **Multi-Agent Studio**, a web app that turns one broad request into a visible multi-agent workflow.

Instead of asking a single model to do everything in one pass, the app splits the job across four focused roles:

- **Atlas Story** for planning and framing
- **Signal Curator** for evidence gathering and contradiction mapping
- **Vector Ops** for execution packaging
- **Relay Console** for review, escalation, and operator readiness

The app is designed for users who do not want to babysit a giant prompt. They can choose a workflow template, edit the objective, and inspect the full chain of handoffs, artifacts, and recommendations.

## Demo

If deployed, this section can embed the live Vercel app.

```html
<iframe
  src="https://ai-agents-duel.vercel.app"
  width="100%"
  height="720"
  style="border: 1px solid #ddd; border-radius: 12px;"
></iframe>
```

## The Problem

A lot of AI demos look impressive but still hide the actual orchestration. Users type one request, get one answer, and cannot tell:

- which role should have handled what
- where confidence dropped
- when human review is needed
- what can be acted on immediately

I wanted to make those handoffs explicit.

## How It Works

The app uses a workflow-first model.

Users pick from templates like:

- Launch Campaign Studio
- Ops War Room
- Founder Decision Desk
- Ship Feature Relay

Each run produces:

- stage ownership across the agent team
- a review or completion state
- agent contributions
- operator artifacts
- next-step recommendations
- an operator brief for fast human action

The orchestration engine is in-memory for easy local setup and Vercel deployment. If `GEMINI_API_KEY` is configured, the selected agent can enrich the run output with Gemini.

## Architecture

The system follows a clear multi-agent pattern:

1. **Planner** scopes the mission.
2. **Researcher** gathers context and contradictions.
3. **Builder** converts the work into an execution package.
4. **Reviewer** checks confidence and gates publication.

This keeps the UX simple while still showing the benefits of specialization.

## Stack

- Next.js 16
- React 19
- TypeScript
- Pure CSS
- `@google/genai`
- Vercel

## What Makes It Different

I focused on usability instead of just aesthetics.

The app includes:

- workflow presets for common jobs
- a live mission board
- review queue resolve and retry actions
- operator controls for autonomy and escalation
- agent pause and resume controls
- an optional Gemini upgrade path without breaking local runs

## Challenges

The main challenge was avoiding a fake-looking multi-agent app.

A lot of demos stop at a stylish dashboard. I wanted the internal model to be strong enough that the UI felt justified. That meant rebuilding the run store around workflows, stage ownership, artifacts, recommendations, and review state instead of just random summaries.

Another challenge was keeping the project easy to deploy. I chose an in-memory backend so the full experience works immediately on Vercel, while still leaving a clean path to add persistence later.

## Key Learnings

- Multi-agent UX becomes much more believable when role boundaries are explicit.
- Review queues matter. They make autonomy feel operational rather than theatrical.
- Optional model enrichment is a better onboarding path than forcing API keys from day one.
- A small but inspectable orchestration engine is more useful than a larger opaque one.

## Repository

https://github.com/aniruddhaadak80/ai-agents-duel

## Deployment

https://ai-agents-duel.vercel.app
