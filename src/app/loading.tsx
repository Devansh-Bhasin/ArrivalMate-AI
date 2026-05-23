import { LoadingState } from "@/components/ui/states";

export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
      <LoadingState label="Preparing ArrivalMate AI..." />
    </main>
  );
}
