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
    console.error("Duel Error:", error);
    return NextResponse.json({ error: "Duel failed" }, { status: 500 });
  }
}
