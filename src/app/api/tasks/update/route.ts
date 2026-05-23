import { NextResponse } from "next/server";
import { getLatestProfile, updatePlanTask, addAgentLog } from "@/lib/db";
import { getErrorMessage, jsonError } from "@/lib/api";
import { checkRequestRateLimit } from "@/lib/server-helpers";
import { updateTaskSchema } from "@/lib/validation";
import { isoNow } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rateLimit = await checkRequestRateLimit("tasks-update");
  if (rateLimit) {
    return rateLimit;
  }

  try {
    const body = await request.json();
    const parsed = updateTaskSchema.parse(body);
    const plan = await updatePlanTask(parsed.planId, parsed.taskId, parsed.completed);
    const profile = await getLatestProfile();

    if (profile?._id) {
      await addAgentLog({
        profileId: profile._id,
        action: "task_update",
        inputSummary: `Task ${parsed.taskId} set to ${parsed.completed ? "complete" : "incomplete"}.`,
        outputSummary: `Plan progress is now ${plan?.progress ?? 0}%.`,
        model: "system",
        createdAt: isoNow(),
      });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to update task."), 400);
  }
}
