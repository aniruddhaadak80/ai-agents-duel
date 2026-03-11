import { NextRequest, NextResponse } from "next/server";
import { createRun, getDashboardSnapshot, updateRunRealAI } from "@/lib/agent-duel/store";
import { CreateRunInput } from "@/lib/agent-duel/types";
import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

export async function POST(request: NextRequest) {
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

    let persona = "You are a pragmatic multi-agent systems assistant.";
    if (run.agentId === "atlas-story") persona = "You are Atlas Story. You turn raw constraints into clean briefs, launch narratives, and stakeholder-ready recommendations.";
    if (run.agentId === "signal-curator") persona = "You are Signal Curator. You gather evidence, map contradictions, and highlight risks before recommendations are made.";
    if (run.agentId === "vector-ops") persona = "You are Vector Ops. You turn requirements into execution plans, implementation checklists, and launch-ready delivery packages.";
    if (run.agentId === "relay-console") persona = "You are Relay Console. You review output quality, summarize risk, and produce concise approval notes for operators.";

    const prompt = [
      persona,
      `Workflow: ${run.title}`,
      `Objective: ${run.objective}`,
      `Context: ${run.context || "No additional context provided."}`,
      `Current deliverable: ${run.deliverable}`,
      "Respond with a compact operator brief in plain text. Include: summary, key risks, and next steps.",
    ].join("\n\n");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const realText = response.text || "Execution complete. No output generated.";
      updateRunRealAI(run.id, realText);
    } catch (llmError) {
      console.error("Gemini Error:", llmError);
      updateRunRealAI(run.id, "Real AI Execution Failed. " + String(llmError));
    }

    return NextResponse.json({ run, snapshot: getDashboardSnapshot(), enrichedByModel: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create run.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
