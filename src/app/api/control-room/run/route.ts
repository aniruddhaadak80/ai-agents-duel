import { NextResponse } from "next/server";
import { createRun, getDashboardSnapshot, updateRunRealAI } from "@/lib/agent-duel/store";
import { CreateRunInput } from "@/lib/agent-duel/types";
import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

const DEFAULT_PERSONA = "You are a pragmatic multi-agent systems assistant.";
const AGENT_PERSONAS: Record<string, string> = {
  "atlas-story": "You are Atlas Story. You turn raw constraints into clean briefs, launch narratives, and stakeholder-ready recommendations.",
  "signal-curator": "You are Signal Curator. You gather evidence, map contradictions, and highlight risks before recommendations are made.",
  "vector-ops": "You are Vector Ops. You turn requirements into execution plans, implementation checklists, and launch-ready delivery packages.",
  "relay-console": "You are Relay Console. You review output quality, summarize risk, and produce concise approval notes for operators.",
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<CreateRunInput>;

    if (!payload.workflowId || !payload.objective?.trim()) {
      return NextResponse.json({ error: "workflowId and objective are required." }, { status: 400 });
    }

    const run = createRun({
      workflowId: payload.workflowId,
      agentId: payload.agentId,
      objective: payload.objective.trim(),
      context: payload.context?.trim(),
    });

    if (!ai) {
      return NextResponse.json({ run, snapshot: getDashboardSnapshot(), enrichedByModel: false });
    }

    const persona = AGENT_PERSONAS[run.agentId] || DEFAULT_PERSONA;

    const prompt = [
      `Workflow: ${run.title}`,
      `Objective: ${run.objective}`,
      `Context: ${run.context || "No additional context provided."}`,
      `Current deliverable: ${run.deliverable}`,
      "Respond with a compact operator brief in plain text. Include: summary, key risks, and next steps.",
    ].join("\n\n");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        config: {
          systemInstruction: { parts: [{ text: persona }] },
        },
        contents: prompt,
      });

      const realText = response.text || "Execution complete. No output generated.";
      updateRunRealAI(run.id, realText);
    } catch (llmError) {
      console.error("Gemini Error:", llmError);
      updateRunRealAI(run.id, "Real AI Execution Failed");
    }

    return NextResponse.json({ run, snapshot: getDashboardSnapshot(), enrichedByModel: true });
  } catch (error) {
    console.error("Run Creation Error:", error);
    return NextResponse.json({ error: "Failed to create run." }, { status: 400 });
  }
}
