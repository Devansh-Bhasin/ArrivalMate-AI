import { Card } from "@/components/ui/card";

type AgentLog = {
  _id: string;
  action: string;
  inputSummary: string;
  outputSummary: string;
  model: string;
  createdAt: string;
};

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
                <span>{log.action.replace("_", " ")}</span>
                <span>•</span>
                <span>{log.model}</span>
                <span>•</span>
                <span>{new Date(log.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">{log.inputSummary}</p>
              <p className="mt-2 text-sm font-medium text-[var(--ink)]">{log.outputSummary}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
