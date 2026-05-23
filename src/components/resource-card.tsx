import type { LocalResource } from "@/lib/types";
import { Card } from "@/components/ui/card";

export function ResourceCard({ resource }: { resource: LocalResource }) {
  return (
    <Card className="bg-[rgba(238,246,246,0.9)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {resource.type}
      </p>
      <h4 className="mt-2 text-lg font-semibold">{resource.name}</h4>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{resource.description}</p>
      <p className="mt-3 text-sm font-medium text-[var(--ink)]">
        Suggested action: {resource.suggestedAction}
      </p>
    </Card>
  );
}
