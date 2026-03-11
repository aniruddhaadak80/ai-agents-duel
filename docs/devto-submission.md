tags: agents,buildmultiagents,gemini,nextjs,vercel

This post is my submission for the DEV Education Track on Building Multi Agent Systems.

## What I Built

I built Multi Agent Studio, a web app that turns one broad request into a visible multi agent workflow.

Instead of asking a single model to do everything in one pass, the app splits the job across four focused roles.
First, Atlas Story handles planning and framing.
Second, Signal Curator is responsible for evidence gathering and contradiction mapping.
Third, Vector Ops manages execution packaging.
Fourth, Relay Console is used for review, escalation, and operator readiness.

The app is designed for users who do not want to babysit a giant prompt.
They can choose a workflow template, edit the objective, and inspect the full chain of handoffs, artifacts, and recommendations.

## Demo and Links

You can view the code on GitHub at https://github.com/aniruddhaadak80/ai-agents-duel

You can also visit the live application on Vercel at https://ai-agents-duel.vercel.app

Here is a look at the live application interface.

<img src="../public/images/docs/hero-live.png" alt="Hero Interface" width="100%" />

You can browse the available templates in the Workflow Library.

<img src="../public/images/docs/workflow-library.png" alt="Workflow Library" width="100%" />

The Mission Board provides a clear view of your active tasks and agent assignments.

<img src="../public/images/docs/mission-board.png" alt="Mission Board" width="100%" />

You can inspect the exact output and thought process in the Run Detail view.

<img src="../public/images/docs/run-detail.png" alt="Run Detail" width="100%" />

## The Problem

A lot of AI demos look impressive but still hide the actual orchestration.
Users type one request, get one answer, and cannot tell which role should have handled what or where confidence dropped.
They also do not know when human review is needed or what can be acted on immediately.

I wanted to make those handoffs explicit.

## How It Works

The app uses a workflow first model.

Users pick from templates like Launch Campaign Studio, Ops War Room, Founder Decision Desk, and Ship Feature Relay.

Each run produces stage ownership across the agent team.
It also provides a review or completion state, agent contributions, operator artifacts, and next step recommendations.
Finally, an operator brief is generated for fast human action.

The orchestration engine is in memory for easy local setup and Vercel deployment.
If GEMINI_API_KEY is configured, the selected agent can enrich the run output with Gemini 3 Flash Preview.

## Architecture

The system follows a clear multi agent pattern.

1. Planner scopes the mission.
2. Researcher gathers context and contradictions.
3. Builder converts the work into an execution package.
4. Reviewer checks confidence and gates publication.

This keeps the user experience simple while still showing the benefits of specialization.

## Stack

1. Next.js 16
2. React 19
3. TypeScript
4. Pure CSS
5. Google GenAI SDK
6. Vercel

## What Makes It Different

I focused on usability instead of just aesthetics.

The app includes workflow presets for common jobs and a live mission board.
It features review queue resolve and retry actions alongside operator controls for autonomy and escalation.
There are also agent pause and resume controls.
The app provides an optional Gemini upgrade path without breaking local runs.

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
