import { Card } from "@/components/ui/card";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <Card className="animate-pulse">
      <div className="h-5 w-40 rounded-full bg-slate-200/80" />
      <div className="mt-4 h-4 w-full rounded-full bg-slate-200/70" />
      <div className="mt-2 h-4 w-3/4 rounded-full bg-slate-200/60" />
      <p className="mt-4 text-sm text-[var(--muted)]">{label}</p>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
    </Card>
  );
}

export function ErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-[rgba(200,86,74,0.25)] bg-[rgba(255,245,243,0.92)]">
      <h3 className="text-xl font-semibold text-[var(--danger)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
    </Card>
  );
}
