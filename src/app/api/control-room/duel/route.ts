import { NextResponse } from "next/server";
import { triggerDuel } from "@/lib/agent-duel/store";

export async function POST(request: Request) {
  try {
    const { agent1Id, agent2Id } = await request.json();
    if (!agent1Id || !agent2Id) {
      return NextResponse.json({ error: "Missing combatants." }, { status: 400 });
    }
    const result = triggerDuel(agent1Id, agent2Id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Duel failed." }, { status: 500 });
  }
}
