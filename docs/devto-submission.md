---
title: "Stop Babysitting Prompts: Visualizing Multi Agent Workflows in Next.js"
published: false
tags: agents, buildmultiagents, gemini, nextjs, vercel
cover_image: "https://raw.githubusercontent.com/aniruddhaadak80/ai-agents-duel/main/public/images/docs/hero-live.png"
---

> "A lot of AI demos look impressive but still hide the actual orchestration. I wanted to make those handoffs deeply explicit."

This post is my official submission for the *DEV Education Track* on Building Multi Agent Systems.

## What I Built

I built **Multi Agent Studio**, a highly visual web application that turns one broad request into a fully explorable multi agent workflow.

Instead of asking a single hidden model to do everything in one pass, the app intelligently splits the job across four focused roles.
First, **Atlas Story** handles the heavy planning and framing.
Second, **Signal Curator** is strictly responsible for evidence gathering and contradiction mapping.
Third, **Vector Ops** manages the dense execution packaging.
Fourth, **Relay Console** is thoughtfully used for human review, escalation, and operator readiness.

The application is specifically designed for users who *do not* want to babysit a giant prompt.
They can dynamically choose a workflow template, edit their core objective, and deeply inspect the full chain of handoffs, artifacts, and recommendations.

## Live Demo and Source Code

You can view the full source code directly embedded below.

{% github aniruddhaadak80/ai-agents-duel %}

You can also visit the live application on Vercel to try it yourself right now.

{% embed https://ai-agents-duel.vercel.app %}

## Visual Walkthrough

You can browse the natively available pre built templates directly in the **Workflow Library**.

<img src="https://raw.githubusercontent.com/aniruddhaadak80/ai-agents-duel/main/public/images/docs/workflow-library.png" alt="Workflow Library" width="100%" />

The **Mission Board** provides a genuinely clear, categorized view of your active tasks and agent assignments in real time.

<img src="https://raw.githubusercontent.com/aniruddhaadak80/ai-agents-duel/main/public/images/docs/mission-board.png" alt="Mission Board" width="100%" />

You can deeply inspect the exact output and internal thought process in the **Run Detail** view.

<img src="https://raw.githubusercontent.com/aniruddhaadak80/ai-agents-duel/main/public/images/docs/run-detail.png" alt="Run Detail" width="100%" />

## The Core Problem

Users typically type one request, get one answer, and simply cannot tell which role should have handled what.
They do not see where the system confidence silently dropped.
They also do not know exactly when human review is deeply needed or what can be acted on immediately.

> By making handoffs explicit, we turn abstract AI operations into a tangible, observable assembly line.

## How It Works Under The Hood

The application relies on a *workflow first* operational model.

Users pick from rich templates like Launch Campaign Studio, Ops War Room, Founder Decision Desk, and Ship Feature Relay.
Each continuous run produces transparent stage ownership across the designated agent team.
It carefully provides a concrete review state, specific agent contributions, and predictive next step recommendations.
Finally, an operator brief is actively generated for incredibly fast human action.

The core orchestration engine currently runs entirely in memory for effortless local setup and seamless Vercel deployment.
If a GEMINI_API_KEY is configured, the selected agent intelligently enriches the final run output utilizing the brand new **Gemini 3 Flash Preview** model.

## Architecture Pattern

The entire system follows a rigorous multi agent pattern logically broken into sequential steps.

First, the **Planner** accurately scopes the core mission.
Next, the **Researcher** rigorously gathers context and maps out contradictions.
Then, the **Builder** systematically converts the raw work into an execution package.
Finally, the **Reviewer** thoughtfully checks confidence and firmly gates publication.

This architecture keeps the user experience wonderfully simple while still thoroughly proving the massive benefits of true specialization.

## Technology Stack

The resilient foundation heavily relies on **Next.js 16** and **React 19** for a fast modern interface.
Everything is securely and robustly typed with **TypeScript**.
The styling remains exceptionally lightweight by only using **Pure CSS**.
The robust **Google GenAI SDK** reliably manages the artificial intelligence communication layer.
The whole rapid ecosystem is smoothly hosted and delivered on **Vercel**.

## What Makes It Truly Different

> I focused heavily on deep usability and structure instead of just raw aesthetics.

The app inherently includes workflow presets for common professional jobs and a real time mission board.
It elegantly features review queue actions alongside granular operator controls for autonomy tuning.
There are also beautifully built in agent pause and resume commands.
It provides an optional Gemini upgrade path without ever breaking standard local runs.

One main architectural challenge was actively avoiding a fake looking multi agent wrapper.
Many early demos simply stop at a stylish dashboard without technical depth.
I strongly wanted the internal model to be robust enough that the visual UI felt deeply justified.
That logically meant entirely rebuilding the internal run store around rigid workflows, stage ownership, structured artifacts, and clear review states instead of just random summaries.

Another prominent engineering challenge was cleanly keeping the project universally easy to deploy.
I effectively chose an in memory backend so the complete experience works immediately on Vercel.
This decision beautifully preserves a wonderfully clean path to add database persistence later.

## Key System Learnings

Multi agent user experiences firmly become exponentially more believable when role boundaries remain incredibly explicit.
Review queues genuinely matter because they make autonomy feel safely operational rather than confusingly theatrical.
An optional model enrichment layer serves as a vastly superior onboarding path safely compared to forcing mandatory API keys from day one.
Above all, a highly small but fully inspectable orchestration engine proves decisively more useful than a large opaque one.
