import { DashboardClient } from "@/components/dashboard-client";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { getRecentAgentLogs, getLatestPlan, getLatestProfile, getRecentPlans } from "@/lib/db";
import type { PlanDocument, ProfileDocument } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DashboardLog = {
  _id: string;
  action: string;
  inputSummary: string;
  outputSummary: string;
  model: string;
  createdAt: string;
};

export default async function DashboardPage() {
  let profile: (ProfileDocument & { _id: string }) | null = null;
  let plan: (PlanDocument & { _id: string }) | null = null;
  let logs: DashboardLog[] = [];
  let recentPlans: Array<PlanDocument & { _id: string }> = [];
  let loadError: string | null = null;

  try {
    [profile, plan, logs, recentPlans] = await Promise.all([
      getLatestProfile(),
      getLatestPlan(),
      getRecentAgentLogs(),
      getRecentPlans(),
    ]);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "We couldn't load the dashboard right now.";
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <ErrorState title="Dashboard unavailable" description={loadError} />
      </main>
    );
  }

  if (!profile || !plan) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <EmptyState
          title="No arrival plan yet"
          description="Start with onboarding to create a newcomer profile, generate a plan, and unlock the dashboard experience."
        />
      </main>
    );
  }

  return (
    <main>
      <DashboardClient
        initialProfile={profile}
        initialPlan={plan}
        initialLogs={logs}
        recentPlans={recentPlans}
      />
    </main>
  );
}
