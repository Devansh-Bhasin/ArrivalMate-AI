"use client";

import { useTransition } from "react";
import type { PlanTask } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ChecklistItem({
  task,
  onToggle,
}: {
  task: PlanTask;
  onToggle: (taskId: string, completed: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        "rounded-3xl border border-[var(--line)] bg-white/80 p-5 transition",
        task.completed && "border-[rgba(15,118,110,0.25)] bg-[rgba(217,243,237,0.45)]",
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-semibold">{task.title}</h4>
            <Badge>{task.category}</Badge>
            <Badge className="bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              {task.timeframe}
            </Badge>
          </div>
          <p className="text-sm leading-6 text-[var(--muted)]">{task.explanation}</p>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            Priority {task.priority} · Deadline {task.deadline}
          </p>
          <ul className="space-y-1 text-sm text-[var(--ink)]">
            {task.steps.map((step) => (
              <li key={step}>• {step}</li>
            ))}
          </ul>
        </div>
        <Button
          variant={task.completed ? "secondary" : "primary"}
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              void onToggle(task.id, !task.completed);
            })
          }
        >
          {isPending
            ? "Updating..."
            : task.completed
              ? "Mark Incomplete"
              : "Mark Complete"}
        </Button>
      </div>
    </div>
  );
}
