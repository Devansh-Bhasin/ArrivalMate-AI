import type { ScamWarning } from "@/lib/types";
import { Card } from "@/components/ui/card";

export function WarningCard({ warning }: { warning: ScamWarning }) {
  return (
    <Card className="border-[rgba(200,86,74,0.18)] bg-[rgba(255,250,248,0.9)]">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-lg font-semibold">{warning.title}</h4>
        <span className="rounded-full bg-[rgba(200,86,74,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--danger)]">
          {warning.riskLevel}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{warning.description}</p>
      <p className="mt-3 text-sm font-medium text-[var(--ink)]">Safe action: {warning.safeAction}</p>
    </Card>
  );
}
