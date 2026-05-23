"use client";

import { useRef, useState } from "react";
import type { PlanDocument, ProfileDocument } from "@/lib/types";
import { AgentLogList } from "@/components/agent-log-list";
import { ChecklistItem } from "@/components/checklist-item";
import { ResourceCard } from "@/components/resource-card";
import { WarningCard } from "@/components/warning-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/states";
import { ProgressBar } from "@/components/ui/progress-bar";

type AgentLog = {
  _id: string;
  action: string;
  inputSummary: string;
  outputSummary: string;
  model: string;
  createdAt: string;
};

type DashboardClientProps = {
  initialProfile: ProfileDocument & { _id: string };
  initialPlan: PlanDocument & { _id: string };
  initialLogs: AgentLog[];
  recentPlans: Array<PlanDocument & { _id: string }>;
};

const RESILIENT_DEMO_MODE_MESSAGE =
  "ArrivalMate AI is currently running in resilient demo mode using its built-in planning engine. Core planning, progress tracking, and MongoDB memory remain fully functional.";

export function DashboardClient({
  initialProfile,
  initialPlan,
  initialLogs,
  recentPlans,
}: DashboardClientProps) {
  const initialLatestRefineNote =
    initialLogs.find((log) => log.action === "refine_plan")?.inputSummary.trim() ?? "";
  const [plan, setPlan] = useState(initialPlan);
  const [logs, setLogs] = useState(initialLogs);
  const [savedPlans, setSavedPlans] = useState(recentPlans);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [agentNotice, setAgentNotice] = useState("");
  const [activeAgentAction, setActiveAgentAction] = useState<"regenerate" | "refine" | null>(null);
  const [isAgentWorking, setIsAgentWorking] = useState(false);
  const [lastAppliedRefineNote, setLastAppliedRefineNote] = useState(initialLatestRefineNote);
  const agentRequestInFlightRef = useRef(false);
  const trimmedNote = note.trim();
  const noteAlreadyApplied =
    trimmedNote.length >= 3 && trimmedNote === lastAppliedRefineNote;

  async function refreshLogs() {
    try {
      const response = await fetch("/api/logs");
      const data = await response.json();
      if (response.ok) {
        setLogs(data.logs ?? []);
      }
    } catch {
      setError("Could not refresh agent logs.");
    }
  }

  async function toggleTask(taskId: string, completed: boolean) {
    setError("");
    try {
      const response = await fetch("/api/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan._id, taskId, completed }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not update task.");
        return;
      }

      setPlan(data.plan);
      await refreshLogs();
    } catch {
      setError("Could not update task right now. Please try again.");
    }
  }

  async function refinePlan() {
    if (agentRequestInFlightRef.current) {
      return;
    }

    const nextNote = note.trim();
    if (nextNote.length < 3) {
      setError("Add a little more detail before refining the plan.");
      return;
    }

    if (nextNote === lastAppliedRefineNote) {
      setError("Your latest plan already reflects that note. Add a new detail to refine it again.");
      return;
    }

    setError("");
    setAgentNotice("");
    setActiveAgentAction("refine");
    setIsAgentWorking(true);
    agentRequestInFlightRef.current = true;
    try {
      const response = await fetch("/api/agent/refine-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: nextNote }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not refine the plan.");
        return;
      }

      setAgentNotice(data.fallbackReason || "");
      setPlan(data.plan);
      setSavedPlans((current) =>
        [data.plan, ...current.filter((item) => item._id !== data.plan._id)].slice(0, 5),
      );
      setLastAppliedRefineNote(nextNote);
      setNote("");
      await refreshLogs();
    } catch {
      setError("Could not refine the plan right now. Please try again.");
    } finally {
      agentRequestInFlightRef.current = false;
      setIsAgentWorking(false);
      setActiveAgentAction(null);
    }
  }

  async function regeneratePlan() {
    if (agentRequestInFlightRef.current) {
      return;
    }

    setError("");
    setAgentNotice("");
    setActiveAgentAction("regenerate");
    setIsAgentWorking(true);
    agentRequestInFlightRef.current = true;
    try {
      const response = await fetch("/api/agent/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initialProfile),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not regenerate the plan.");
        return;
      }

      setAgentNotice(data.fallbackReason || "");
      setPlan(data.plan);
      setSavedPlans((current) =>
        [data.plan, ...current.filter((item) => item._id !== data.plan._id)].slice(0, 5),
      );
      await refreshLogs();
    } catch {
      setError("Could not regenerate the plan right now. Please try again.");
    } finally {
      agentRequestInFlightRef.current = false;
      setIsAgentWorking(false);
      setActiveAgentAction(null);
    }
  }

  const grouped = {
    Today: plan.tasks.filter((task) => task.timeframe === "Today"),
    "This Week": plan.tasks.filter((task) => task.timeframe === "This Week"),
    "This Month": plan.tasks.filter((task) => task.timeframe === "This Month"),
  };
  const latestPlannerLog = logs.find(
    (log) => log.action === "generate_plan" || log.action === "refine_plan",
  );
  const latestPlannerFallback = latestPlannerLog?.model === "mock-generator";
  const latestPlannerLabel =
    latestPlannerLog?.model === "mock-generator"
      ? "Built-in planner"
      : latestPlannerLog?.model || "Gemini";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0f766e,#f4c95d)]" />
          <div className="relative">
            <div className="flex flex-wrap gap-2">
              <Badge>ArrivalMate Dashboard</Badge>
              <Badge className="bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                Planner {latestPlannerLabel}
              </Badge>
              <Badge>MongoDB memory active</Badge>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Welcome back, {initialProfile.fullName}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
              {plan.summary}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-white/80 p-4">
                <p className="text-sm text-[var(--muted)]">City</p>
                <p className="mt-2 text-xl font-semibold">{initialProfile.city}</p>
              </div>
              <div className="rounded-3xl bg-white/80 p-4">
                <p className="text-sm text-[var(--muted)]">Status</p>
                <p className="mt-2 text-xl font-semibold">{initialProfile.status}</p>
              </div>
              <div className="rounded-3xl bg-white/80 p-4">
                <p className="text-sm text-[var(--muted)]">Arrival date</p>
                <p className="mt-2 text-xl font-semibold">
                  {new Date(initialProfile.arrivalDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Progress tracking
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-5xl font-semibold text-[var(--brand-strong)]">{plan.progress}%</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {plan.tasks.filter((task) => task.completed).length} of {plan.tasks.length} tasks complete
              </p>
            </div>
            <Badge className="bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              General guidance only
            </Badge>
          </div>
          <div className="mt-6">
            <ProgressBar value={plan.progress} />
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            ArrivalMate AI provides general guidance only and is not legal, immigration, medical, or financial advice.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              onClick={() => {
                void regeneratePlan();
              }}
              disabled={isAgentWorking}
            >
              {isAgentWorking && activeAgentAction === "regenerate" ? "Updating..." : "Regenerate Plan"}
            </Button>
          </div>
        </Card>
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorState title="Something needs attention" description={error} />
        </div>
      ) : null}

      {isAgentWorking && activeAgentAction ? (
        <div className="mt-6 rounded-[28px] border border-[var(--line)] bg-[rgba(238,246,246,0.92)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand-strong)]">
            ArrivalMate AI is working
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink)]">
            {activeAgentAction === "regenerate"
              ? "Generating a fresh plan with your saved profile. This can take a bit when Gemini is busy."
              : "Refining your checklist with your latest note. This can take a bit when Gemini is busy."}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[var(--brand)]" />
          </div>
        </div>
      ) : null}

      {agentNotice || latestPlannerFallback ? (
        <div className="mt-6">
          <ErrorState
            title="Resilient demo mode active"
            description={
              agentNotice || RESILIENT_DEMO_MODE_MESSAGE
            }
          />
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Urgent Tasks
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Start with the highest-impact moves</h2>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {plan.urgentTasks.map((task) => (
                <ChecklistItem key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Full Checklist
            </p>
            <div className="mt-6 space-y-8">
              {Object.entries(grouped).map(([label, tasks]) => (
                <section key={label}>
                  <div className="mb-4 flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{label}</h3>
                    <Badge>{tasks.length} tasks</Badge>
                  </div>
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <ChecklistItem key={task.id} task={task} onToggle={toggleTask} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Refine with the agent
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Adjust your plan with one note</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Tell ArrivalMate AI what changed, what feels urgent, or where you want more help.
            </p>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={5}
              placeholder="Example: I found housing near Surrey Central and need to prioritize school orientation and getting a phone plan."
              className="mt-5 w-full rounded-3xl border border-[var(--line)] bg-white/90 px-4 py-4 outline-none ring-0 placeholder:text-slate-400 focus:border-[var(--brand)]"
            />
            {noteAlreadyApplied ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Your latest plan already reflects that note. Add one new detail before refining again.
              </p>
            ) : null}
            <Button
              className="mt-4 w-full"
              disabled={isAgentWorking || trimmedNote.length < 3 || noteAlreadyApplied}
              onClick={() => {
                void refinePlan();
              }}
            >
              {isAgentWorking && activeAgentAction === "refine" ? "Refining..." : "Refine My Plan"}
            </Button>
          </Card>

          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Agent explanation
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Why this plan was prioritized this way</h3>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {plan.agentReasoningSummary}
            </p>
          </Card>

          <div className="space-y-4">
            {plan.scamWarnings.map((warning) => (
              <WarningCard key={warning.title} warning={warning} />
            ))}
          </div>

          <div className="space-y-4">
            {plan.localResources.map((resource) => (
              <ResourceCard key={resource.name} resource={resource} />
            ))}
          </div>

          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Saved plans
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Recent plan snapshots</h3>
            <div className="mt-5 space-y-3">
              {savedPlans.map((savedPlan) => (
                <div
                  key={savedPlan._id}
                  className="rounded-3xl border border-[var(--line)] bg-white/75 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      {new Date(savedPlan.updatedAt).toLocaleString()}
                    </p>
                    <Badge>{savedPlan.progress}% complete</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {savedPlan.summary}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <AgentLogList logs={logs} />
      </div>
    </div>
  );
}
