import { addAgentLog, getLatestProfile, savePlan, upsertProfile } from "@/lib/db";
import { closeMongoClient } from "@/lib/mongodb";
import { buildMockPlan } from "@/lib/mock-plan";
import type { ProfileInput } from "@/lib/types";
import { isoNow } from "@/lib/utils";

async function seed() {
  const today = new Date();
  today.setDate(today.getDate() - 3);

  const demoProfile: ProfileInput = {
    fullName: "Demo Student",
    city: "Surrey",
    arrivalDate: today.toISOString().slice(0, 10),
    status: "International Student",
    institutionOrWorkplace: "Simon Fraser University Surrey",
    selectedNeeds: [
      "SIN",
      "MSP",
      "Banking",
      "Transit",
      "Housing",
      "Job Search",
      "School Resources",
      "Scams",
    ],
    housingStatus: "Temporary Stay",
    hasSIN: "No",
    hasBankAccount: "No",
    hasTransitPass: "No",
    hasMSP: "Not Sure",
    urgencyLevel: "High",
    notes:
      "Needs a fast first-week setup plan, safer housing checks, and school readiness support near Surrey Central.",
  };

  const profile = await upsertProfile({
    ...demoProfile,
    createdAt: isoNow(),
    updatedAt: isoNow(),
  });

  if (!profile?._id) {
    throw new Error("Failed to create demo profile.");
  }

  const plan = buildMockPlan(demoProfile);
  const savedPlan = await savePlan({
    profileId: profile._id,
    ...plan,
  });

  await addAgentLog({
    profileId: profile._id,
    action: "seed_demo_data",
    inputSummary: "Created seeded demo newcomer profile and plan.",
    outputSummary: `Saved demo plan with ${savedPlan?.tasks.length ?? 0} tasks.`,
    model: "mock-generator",
    createdAt: isoNow(),
  });

  const latestProfile = await getLatestProfile();
  console.log(
    JSON.stringify(
      {
        message: "Seed complete",
        profileId: latestProfile?._id,
        planId: savedPlan?._id,
      },
      null,
      2,
    ),
  );

  await closeMongoClient();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  void closeMongoClient().catch(() => {});
  process.exit(1);
});
