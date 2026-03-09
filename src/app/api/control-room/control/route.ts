import { NextRequest, NextResponse } from "next/server";
import { updateControls } from "@/lib/agent-duel/store";
import { UpdateControlInput } from "@/lib/agent-duel/types";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as UpdateControlInput;
    const snapshot = updateControls(payload);
    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update controls.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}