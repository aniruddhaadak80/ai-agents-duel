import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/agent-duel/store";

export async function GET() {
  return NextResponse.json(getDashboardSnapshot());
}