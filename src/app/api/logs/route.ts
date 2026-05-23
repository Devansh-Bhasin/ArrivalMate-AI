import { NextResponse } from "next/server";
import { getRecentAgentLogs } from "@/lib/db";
import { getErrorMessage, jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await getRecentAgentLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to load agent logs."), 500);
  }
}
