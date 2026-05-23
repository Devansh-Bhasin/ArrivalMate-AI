import { NextResponse } from "next/server";
import { getLatestProfile, upsertProfile } from "@/lib/db";
import { getErrorMessage, jsonError } from "@/lib/api";
import { sanitizeText } from "@/lib/utils";
import { checkRequestRateLimit } from "@/lib/server-helpers";
import { profileSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await getLatestProfile();
    return NextResponse.json({ profile });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to load profile."), 500);
  }
}

export async function POST(request: Request) {
  const rateLimit = await checkRequestRateLimit("profile");
  if (rateLimit) {
    return rateLimit;
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.parse({
      ...body,
      fullName: sanitizeText(body.fullName),
      institutionOrWorkplace: sanitizeText(body.institutionOrWorkplace),
      notes: sanitizeText(body.notes),
    });

    const profile = await upsertProfile({
      ...parsed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to save profile."), 400);
  }
}
