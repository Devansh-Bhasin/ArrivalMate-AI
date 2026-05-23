import { NextResponse } from "next/server";
import { addAgentLog, getLatestPlan, getLatestProfile, savePlan } from "@/lib/db";
import { generateArrivalPlan } from "@/lib/agent";
import { getErrorMessage, jsonError } from "@/lib/api";
import { checkRequestRateLimit } from "@/lib/server-helpers";
import { isoNow, sanitizeText } from "@/lib/utils";
import { refinePlanSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rateLimit = await checkRequestRateLimit("refine-plan");
  if (rateLimit) {
    return rateLimit;
  }

  try {
    const body = await request.json();
    const parsed = refinePlanSchema.parse({
      note: sanitizeText(body.note),
    });

    const [profile, currentPlan] = await Promise.all([getLatestProfile(), getLatestPlan()]);

    if (!profile?._id) {
      return jsonError("Create a profile before refining a plan.", 404);
    }

    if (!currentPlan?._id) {
      return jsonError("Generate a plan before refining it.", 404);
    }

    const { plan, model, fallbackReason, internalFallbackReason } = await generateArrivalPlan(
      profile,
      currentPlan,
      parsed.note,
    );
    const savedPlan = await savePlan({
      profileId: profile._id,
      ...plan,
    });

    await addAgentLog({
      profileId: profile._id,
      action: "refine_plan",
      inputSummary: parsed.note,
      outputSummary: `Refined plan with ${plan.tasks.length} tasks using ${model}.${internalFallbackReason ? ` ${internalFallbackReason}` : ""}`,
      model,
      createdAt: isoNow(),
    });

    return NextResponse.json({ plan: savedPlan, model, fallbackReason });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to refine plan."), 400);
  }
}
