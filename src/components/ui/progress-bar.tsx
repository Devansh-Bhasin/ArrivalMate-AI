export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--brand-soft)]">
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e,#3ca38e)] transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}
