# AI Agents Duel

A Next.js interface for AI agents built around a split-screen design language called "The Typographic Duel".

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
