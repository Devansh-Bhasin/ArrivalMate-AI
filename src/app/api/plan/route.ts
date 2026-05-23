import { NextResponse } from "next/server";
import { getLatestPlan } from "@/lib/db";
import { getErrorMessage, jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plan = await getLatestPlan();
    return NextResponse.json({ plan });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to load plan."), 500);
  }
}
