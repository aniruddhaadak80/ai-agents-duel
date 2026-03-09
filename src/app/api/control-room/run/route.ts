import { NextRequest, NextResponse } from "next/server";
import { createRun, getDashboardSnapshot } from "@/lib/agent-duel/store";
import { CreateRunInput } from "@/lib/agent-duel/types";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<CreateRunInput>;

    if (!payload.agentId || !payload.objective?.trim()) {
      return NextResponse.json({ error: "agentId and objective are required." }, { status: 400 });
    }

    const run = createRun({
      agentId: payload.agentId,
      objective: payload.objective.trim(),
    });

    return NextResponse.json({ run, snapshot: getDashboardSnapshot() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create run.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}