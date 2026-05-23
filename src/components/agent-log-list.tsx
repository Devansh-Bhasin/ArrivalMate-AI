import { Card } from "@/components/ui/card";

type AgentLog = {
  _id: string;
  action: string;
  inputSummary: string;
  outputSummary: string;
  model: string;
  createdAt: string;
};

function formatLogAction(action: string) {
  return action.replaceAll("_", " ");
}

function formatLogModel(model: string) {
  if (model === "mock-generator") {
    return "built-in planner";
  }

  if (model.startsWith("gemini")) {
    return "Gemini";
  }

  return model;
}

function formatLogOutput(log: AgentLog) {
  if (log.model !== "mock-generator") {
    return log.outputSummary;
  }

  if (log.action === "generate_plan") {
    const base = log.outputSummary.split(".")[0];
    return `${base}. Resilient demo mode was used for this run.`;
  }

  if (log.action === "refine_plan") {
    const matched = log.outputSummary.match(/^Refined plan with \d+ tasks/);
    if (matched) {
      return `${matched[0]} using the built-in planning engine.`;
    }

    return "Refined plan using the built-in planning engine.";
  }

  return log.outputSummary;
}

export function AgentLogList({ logs }: { logs: AgentLog[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Agent Logs
          </p>
          <h3 className="mt-2 text-2xl font-semibold">Recent planning activity</h3>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {logs.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No agent activity yet.</p>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="rounded-3xl border border-[var(--line)] bg-white/75 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                <span>{formatLogAction(log.action)}</span>
                <span>•</span>
                <span>{formatLogModel(log.model)}</span>
                <span>•</span>
                <span>{new Date(log.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">{log.inputSummary}</p>
              <p className="mt-2 text-sm font-medium text-[var(--ink)]">{formatLogOutput(log)}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
