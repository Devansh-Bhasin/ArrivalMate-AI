import { NextResponse } from "next/server";
import { addAgentLog, savePlan, upsertProfile } from "@/lib/db";
import { generateArrivalPlan } from "@/lib/agent";
import { getErrorMessage, jsonError } from "@/lib/api";
import { checkRequestRateLimit } from "@/lib/server-helpers";
import { profileSchema } from "@/lib/validation";
import { isoNow, sanitizeText, toSentenceList } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rateLimit = await checkRequestRateLimit("generate-plan");
  if (rateLimit) {
    return rateLimit;
  }

  try {
    const rawBody = await request.json();
    const profile = profileSchema.parse({
      ...rawBody,
      fullName: sanitizeText(rawBody.fullName),
      institutionOrWorkplace: sanitizeText(rawBody.institutionOrWorkplace),
      notes: sanitizeText(rawBody.notes),
    });

    const savedProfile = await upsertProfile({
      ...profile,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    });
    const { plan, model, fallbackReason, internalFallbackReason } =
      await generateArrivalPlan(profile);
    const savedPlan = await savePlan({
      profileId: savedProfile?._id ?? "demo-profile",
      ...plan,
    });

    if (savedProfile?._id) {
      await addAgentLog({
        profileId: savedProfile._id,
        action: "generate_plan",
        inputSummary: `Generated first plan for ${profile.fullName} with needs: ${toSentenceList(profile.selectedNeeds)}.`,
        outputSummary: `Created ${plan.tasks.length} tasks and ${plan.scamWarnings.length} scam warnings.${internalFallbackReason ? ` ${internalFallbackReason}` : ""}`,
        model,
        createdAt: isoNow(),
      });
    }

    return NextResponse.json({ plan: savedPlan, model, fallbackReason });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to generate plan."), 400);
  }
}
