# AI Agents Duel

A Next.js interface for AI agents built around a split-screen design language called "The Typographic Duel".

## What it does now

- Live control-room dashboard backed by Next.js API routes
- In-memory backend state for agents, runs, playbooks, and operator controls
- Interactive run creation for selected agents
- Operator controls for autonomy mode, escalation policy, publish target, retry, and review gates
- Additional control-room page at `/control-room`
- Split-screen visual system preserved across the interactive experience

## Stack

- Next.js 16
- React 19
- TypeScript
- next/font with Cinzel, Inter, and Space Mono

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm start
```

## Backend routes

- `GET /api/control-room` returns the current dashboard snapshot
- `POST /api/control-room/run` creates a new run for a selected agent
- `POST /api/control-room/control` updates operator settings and run controls

The current backend uses an in-memory store for demo behavior, so state resets when the serverless instance is recycled.

## Design notes

- Permanent 50/50 split on desktop
- Fixed accent tension line at the center
- Warm serif narrative system on the left
- Dark monospace operational system on the right
- No gradients, no shadows, no rounded corners

## Deployment

If Vercel CLI is authenticated:

```bash
vercel
```

If GitHub CLI is authenticated and you want to publish the repo:

```bash
git init
git add .
git commit -m "Create AI agents duel interface"
gh repo create ai-agents-duel --public --source . --remote origin --push
```
