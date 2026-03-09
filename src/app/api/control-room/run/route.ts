import { NextRequest, NextResponse } from "next/server";
import { createRun, getDashboardSnapshot, updateRunRealAI } from "@/lib/agent-duel/store";
import { CreateRunInput } from "@/lib/agent-duel/types";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<CreateRunInput>;

    if (!payload.agentId || !payload.objective?.trim()) {
      return NextResponse.json({ error: "agentId and objective are required." }, { status: 400 });
    }

    // 1. Create the run in memory (starts it in simulated 'running' or 'completed' depending on mock logic)
    const run = createRun({
      agentId: payload.agentId,
      objective: payload.objective.trim(),
    });

    // 2. Map Agent ID to a Persona Prompt
    let persona = "You are a generic helpful AI assistant.";
    if (payload.agentId === "atlas-story") persona = "You are Atlas Story. You turn raw constraints into clean, high-stakes narratives and ad copy. Be concise, punchy, and compelling.";
    if (payload.agentId === "signal-curator") persona = "You are Signal Curator. You read trends, audit systems, and hunt for hidden anomalies or security flaws. Be blunt and analytical.";
    if (payload.agentId === "vector-ops") persona = "You are Vector Ops. You execute algorithmic tasks, harden systems, or simulate code refactoring. Be highly technical and precise.";
    if (payload.agentId === "relay-console") persona = "You are Relay Console. You supervise streams, monitor A/B tests, or summarize low-confidence logs. Use bullet points and operational tone.";

    const prompt = `${persona}\n\nObjective: ${payload.objective.trim()}\n\nTask: Execute the objective and respond with a short paragraph or bulleted list summarizing your findings or actions.`;

    try {
      // 3. Call actual Gemini API
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      const realText = response.text || "Execution complete. No output generated.";
      
      // 4. Update the in-memory store with the real AI output
      updateRunRealAI(run.id, realText);

    } catch (llmError) {
      console.error("Gemini Error:", llmError);
      updateRunRealAI(run.id, "Real AI Execution Failed. " + String(llmError));
    }

    // Return the mutated state
    return NextResponse.json({ run, snapshot: getDashboardSnapshot() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create run.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
