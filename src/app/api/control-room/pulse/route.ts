import { NextResponse } from "next/server";
import { getDashboardSnapshot, pulseSystem } from "@/lib/agent-duel/store";

export function POST() {
  pulseSystem();
  return NextResponse.json({ snapshot: getDashboardSnapshot() });
}
