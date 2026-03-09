# 🤖⚔️ AI Agents Duel: Digital Sketchbook Edition

![Next.js](https://img.shields.io/badge/next.js-16+-black) ![TypeScript](https://img.shields.io/badge/typescript-5.x-blue) ![React](https://img.shields.io/badge/react-19-cyan) ![UI](https://img.shields.io/badge/ui-digital--sketchbook-orange)

An interactive, narrative-driven AI Agent command center that completely abandons sterile corporate UI in favor of a **Digital Sketchbook** aesthetic. 

Live Demo: [ai-agents-duel.vercel.app](https://ai-agents-duel.vercel.app)

---

## ? Standout Features

Instead of standard data tables and flat colors, this project treats your AI agents like characters in a chaotic, creative workspace:

- **🎨 The Digital Sketchbook UI:** Features custom CSS-driven "wobbly" borders, pinned "tape" on polaroid containers, floating elements, and a handcrafted web-font stack (*Kalam* & *Patrick Hand*) that mimics physical paper and pen.
- **🎨 Neural Live Wire:** A cyberpunk-inspired ticker anchored to the screen that constantly broadcasts the live, internal thoughts/actions of your agents.
- **🎨 Agent Apex Arena (Scribble Battles):** An integrated mini-game where two agents duel in the backend. The winner gets a buffed Success Rate, while the loser suffers network degradation and queue-depth floods.
- **🎨 System Meltdown (Ink Spill):** A "Pulse" button that injects pure chaos into the in-memory store. It fires off CSS keyframe hardware-shakes, sepia CRT filters, and randomly disrupts agent queues.
- **🎨 Operator's Desk:** Create simulated tasks/prompts for your agents and watch them appear as freshly taped Polaroid shots in the project gallery.

## 🚀 How to Run It Locally

1. **Clone the repository:**
   \\\ash
   git clone https://github.com/aniruddhaadak80/ai-agents-duel.git
   cd ai-agents-duel
   \\\
2. **Install dependencies:**
   \\\ash
   npm install
   \\\
3. **Start the development server:**
   \\\ash
   npm run dev
   \\\
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💡 How Can I Use This?

This project is built around an **In-Memory Store Pattern** (\src/lib/agent-duel/store.ts\). Right now, it perfectly simulates a backend without needing a database. Here is how you can use or extend it:

### 1. The Presentation Mockup
Need to pitch a multi-agent system to investors or stakeholders? Use this exact dashboard out-of-the-box. The animations, interactive dueling, and dynamic UI elements make it an incredible showcase tool to explain how "Supervisor vs. Worker" agents operate.

### 2. Plug in Real LLMs
It is structured ready for real intelligence. To hook this up to OpenAI or Anthropic:
- Navigate to \src/app/api/control-room/run/route.ts\.
- Instead of relying on the mock \createRun\ function, inject your LLM call there.
- Pass the user's \objective\ to your LLM framework (like LangChain, AutoGen, or raw OpenAI API) and return the response back to the UI to be glued onto the Sketchpad.

### 3. Steal the UI Architecture
The \globals.css\ file contains an incredible amount of distinct styling: \order-radius\ tricks for a hand-drawn look, hard-shadow interactions, and complex CSS keyframe animations (like paper jitter and tape effects). You can comfortably extract this design system and drop it into your own Next.js or React projects.

## ⚙️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Pure CSS (CSS Variables, keyframes)
- **Fonts:** \
ext/font/google\ (Kalam, Patrick Hand)
- **Deployment:** Vercel

---
*Handcrafted conceptually and engineered to the absolute maximum intelligence tier.*
