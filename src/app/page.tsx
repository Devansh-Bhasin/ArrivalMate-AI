import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  "Personalized checklist",
  "Local safety guidance",
  "Scam warning agent",
  "Progress tracking",
  "MongoDB-powered memory",
  "Gemini-powered planning",
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8 lg:pt-12">
        <div className="rounded-[36px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 shadow-[var(--shadow)] backdrop-blur md:p-8">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <Badge>BC newcomer planning agent</Badge>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-[var(--ink)] md:text-7xl">
                Your first 30 days in Canada, handled by an AI agent.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                ArrivalMate AI helps newcomers and international students build a personalized action plan for SIN, MSP, banking, transit, housing safety, school setup, and job readiness.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/onboarding">
                  <Button className="w-full sm:w-auto">Build My Arrival Plan</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    View Demo Dashboard
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm leading-6 text-[var(--muted)]">
                ArrivalMate AI provides general guidance only and is not legal, immigration, medical, or financial advice.
              </p>
            </div>

            <Card className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(15,118,110,0.9),rgba(18,49,58,0.95))] text-white">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[rgba(244,201,93,0.25)] blur-2xl" />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                  ArrivalMate AI
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Action-first planning for real arrival stress</h2>
                <div className="mt-8 space-y-4">
                  <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-sm text-white/70">Today</p>
                    <p className="mt-2 text-lg font-semibold">Protect documents, verify housing, map first commute</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-sm text-white/70">This Week</p>
                    <p className="mt-2 text-lg font-semibold">Start SIN, banking, transit, and health coverage steps</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-sm text-white/70">This Month</p>
                    <p className="mt-2 text-lg font-semibold">Build local support, school readiness, and job momentum</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature} className="bg-white/78">
              <div className="h-12 w-12 rounded-2xl bg-[linear-gradient(135deg,rgba(15,118,110,0.16),rgba(244,201,93,0.35))]" />
              <h3 className="mt-5 text-2xl font-semibold">{feature}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Built for demo-ready planning that goes beyond chat into saved memory, structured plans, and progress-aware actions.
              </p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
