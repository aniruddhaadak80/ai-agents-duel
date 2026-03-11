<div align="center">

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&color=0070F3&width=435&lines=Multi+Agent+Studio;Visualizing+AI+Workflows;Powered+by+Next.js+and+Gemini;No+More+Babysitting+Prompts" alt="Typing SVG" /></a>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next JS Badge"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Badge"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Badge"/>
  <img src="https://img.shields.io/badge/Gemini_3_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini Badge"/>
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Badge"/>
</p>

</div>

## Explore the Application

A fully functional Next.js multi agent system that elegantly turns one broad user request into a visible planner, researcher, builder, and reviewer workflow.

Live app: https://ai-agents-duel.vercel.app

GitHub: https://github.com/aniruddhaadak80/ai-agents-duel

This project was carefully rebuilt around the core ideas from the DEV Education track on building multi agent systems. The primary focus is squarely on deep specialization, structured orchestration, explicit handoffs, and rigid review gates. Instead of one giant prompt, the app gives users an entire workflow library, precise agent controls, a visual review queue, and fully inspectable run details.

## Extensive Topics and Tags

Here is a look at the major themes covering this repository.
AI Agents, Build Multi Agents, Gemini 3 Flash, Nextjs, Vercel, Generative AI, Automation, LLM Orchestration, TypeScript Engineering, React 19, Human In The Loop, Agentic Workflows, Google AI Studio, Developer Tools.

## Visual Storyboard and Interface

Here is a look at the live dynamic application.

<img src="./public/images/docs/hero-live.png" alt="Hero Interface" width="100%" />

You can browse the expertly designed templates available right inside the Workflow Library.

<img src="./public/images/docs/workflow-library.png" alt="Workflow Library" width="100%" />

The interactive Mission Board provides a brilliantly clear overview of your active tasks and specific agent assignments.

<img src="./public/images/docs/mission-board.png" alt="Mission Board" width="100%" />

You can deeply inspect the exact output and internal thought process in the beautiful Run Detail view.

<img src="./public/images/docs/run-detail.png" alt="Run Detail" width="100%" />

## Core System Features

Workflow first orchestration cleanly replaces a single ambiguous prompt box.
Multiple specialized agents operate natively with visible roles and real time status updates.
The integrated review queue comes fully featured with resolve and retry node actions.
Operator controls allow for intricate tuning of autonomy modes, publish targets, and escalation policies.
Robust sandbox tools are provided for deep queue pulse checks and agent duel stress testing.
The highly responsive sketchbook style UI flows flawlessly across both desktop and mobile screens.
The zero database structure guarantees incredibly fast local runs and instant Vercel deployments.

## Intelligent System Flowchart

Here is an architectural flowchart showing exactly how the system intelligently processes every single request.

```mermaid
graph TD
    A[User Selects Workflow Template] --> B[Lead Agent Starts Mission]
    B --> C[Atlas Story Plans Mission]
    C --> D[Signal Curator Gathers Evidence]
    D --> E[Vector Ops Creates Execution Package]
    E --> F[Relay Console Reviews Confidence]
    F --> G{Operator Controls Applied}
    G --> H[Results Shown on Mission Board]
    H --> I[Gemini 3 Flash Preview Enriches Output]
```

## Running It Locally

First, securely install all the needed dependencies.

```bash
npm install
```

Next, easily create a local env file if you want powerful Gemini powered enrichment.

```bash
copy .env.example .env.local
```

Then, quietly start the dev server.

```bash
npm run dev
```

Finally, open your preferred browser directly to `http://localhost:3000` to see it perfectly running.

## Environment Architecture

The specific `GEMINI_API_KEY` is not required but it gracefully enables Gemini enrichment for generated run output.
If the key remains naturally missing, the application completely works smoothly using the integrated local multi agent orchestration engine fallback.

## Behind The Orchestration Engine

The application actively utilizes four fixed permanent roles.
Atlas Story plans the mission and frames the core deliverable.
Signal Curator actively gathers evidence along with tensions and contradictions.
Vector Ops heavily turns the plan into a tangible execution package.
Relay Console precisely reviews overall confidence, project risk, and true operator readiness.

A run logically follows a wonderfully clear path.
First, the user dynamically selects a workflow template.
Second, a lead agent properly starts the designated workflow.
Third, the internal store beautifully expands the objective into distinct stages, contributions, rich artifacts, and valuable recommendations.
Fourth, advanced operator controls manipulate absolute confidence, review gating, and publish behavior.
Fifth, the final result is immediately shown on the responsive mission board and active review queue.
Finally, if Gemini is properly configured, the chosen agent optimally enriches the completely final output using the network.
