import { NextResponse } from "next/server";
import { updateControls } from "@/lib/agent-duel/store";
import { UpdateControlInput } from "@/lib/agent-duel/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as UpdateControlInput;
    const snapshot = updateControls(payload);
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Control Update Error:", error);
    return NextResponse.json({ error: "Failed to update controls" }, { status: 400 });
  }
}