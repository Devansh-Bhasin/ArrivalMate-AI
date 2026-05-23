"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfileInput } from "@/lib/types";
import {
  CITY_OPTIONS,
  HOUSING_OPTIONS,
  MSP_OPTIONS,
  NEED_OPTIONS,
  STATUS_OPTIONS,
  URGENCY_OPTIONS,
  YES_NO_OPTIONS,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

const initialState: ProfileInput = {
  fullName: "",
  city: "Surrey",
  arrivalDate: "",
  status: "International Student",
  institutionOrWorkplace: "",
  selectedNeeds: ["SIN", "MSP", "Banking", "Transit"],
  housingStatus: "Temporary Stay",
  hasSIN: "No",
  hasBankAccount: "No",
  hasTransitPass: "No",
  hasMSP: "Not Sure",
  urgencyLevel: "High",
  notes: "",
};

export function OnboardingForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleNeed = (need: ProfileInput["selectedNeeds"][number]) => {
    setForm((current) => {
      const selected = current.selectedNeeds.includes(need)
        ? current.selectedNeeds.filter((value) => value !== need)
        : [...current.selectedNeeds, need];

      return {
        ...current,
        selectedNeeds: selected,
      };
    });
  };

  async function handleSubmit() {
    setError("");
    setIsSubmitting(true);
    setStatusMessage("Saving your arrival profile...");
    try {
      const profileResponse = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        setError(profileData.error || "Could not save profile.");
        setStatusMessage("");
        return;
      }

      setStatusMessage(
        "ArrivalMate AI is generating your personalized plan. This can take a little longer when Gemini or network services are busy.",
      );
      const planResponse = await fetch("/api/agent/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const planData = await planResponse.json();

      if (!planResponse.ok) {
        setError(planData.error || "Could not generate plan.");
        setStatusMessage("");
        return;
      }

      setStatusMessage("Plan ready. Opening your dashboard...");
      router.push("/dashboard");
    } catch {
      setError("ArrivalMate AI could not reach the server. Please try again.");
      setStatusMessage("");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <Card className="mx-auto max-w-5xl">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(15,118,110,0.12),rgba(244,201,93,0.16))] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            ArrivalMate Intake
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Build your first-30-days arrival plan
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Share a few basics about your arrival and ArrivalMate AI will organize your first month into practical steps for documents, transit, safety, and local setup in British Columbia.
          </p>
          <div className="mt-8 space-y-3 text-sm text-[var(--ink)]">
            <p>• Personalized tasks grouped by Today, This Week, and This Month</p>
            <p>• Scam warnings and safe actions for common newcomer risks</p>
            <p>• MongoDB-backed plan memory and progress tracking</p>
            <p>• Gemini planning with resilient fallback if Gemini is unavailable</p>
          </div>
        </div>

        <div>
          {error ? (
            <div className="mb-6">
              <ErrorState title="We couldn't complete that step" description={error} />
            </div>
          ) : null}

          {isSubmitting && statusMessage ? (
            <div className="mb-6 rounded-[24px] border border-[var(--line)] bg-[rgba(238,246,246,0.92)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand-strong)]">
                ArrivalMate AI is working
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink)]">{statusMessage}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-[var(--brand)]" />
              </div>
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full name">
              <input
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                className={inputClass}
                placeholder="Ava Chen"
              />
            </Field>
            <Field label="City">
              <select
                value={form.city}
                onChange={(event) =>
                  setForm({ ...form, city: event.target.value as ProfileInput["city"] })
                }
                className={inputClass}
              >
                {CITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Arrival date">
              <input
                type="date"
                value={form.arrivalDate}
                onChange={(event) => setForm({ ...form, arrivalDate: event.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as ProfileInput["status"] })
                }
                className={inputClass}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="School or workplace">
              <input
                value={form.institutionOrWorkplace}
                onChange={(event) =>
                  setForm({ ...form, institutionOrWorkplace: event.target.value })
                }
                className={inputClass}
                placeholder="SFU Surrey or optional workplace"
              />
            </Field>
            <Field label="Housing status">
              <select
                value={form.housingStatus}
                onChange={(event) =>
                  setForm({
                    ...form,
                    housingStatus: event.target.value as ProfileInput["housingStatus"],
                  })
                }
                className={inputClass}
              >
                {HOUSING_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Already have SIN?">
              <select
                value={form.hasSIN}
                onChange={(event) =>
                  setForm({ ...form, hasSIN: event.target.value as ProfileInput["hasSIN"] })
                }
                className={inputClass}
              >
                {YES_NO_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bank account ready?">
              <select
                value={form.hasBankAccount}
                onChange={(event) =>
                  setForm({
                    ...form,
                    hasBankAccount: event.target.value as ProfileInput["hasBankAccount"],
                  })
                }
                className={inputClass}
              >
                {YES_NO_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Transit pass ready?">
              <select
                value={form.hasTransitPass}
                onChange={(event) =>
                  setForm({
                    ...form,
                    hasTransitPass: event.target.value as ProfileInput["hasTransitPass"],
                  })
                }
                className={inputClass}
              >
                {YES_NO_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="MSP status">
              <select
                value={form.hasMSP}
                onChange={(event) =>
                  setForm({ ...form, hasMSP: event.target.value as ProfileInput["hasMSP"] })
                }
                className={inputClass}
              >
                {MSP_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Urgency level">
              <select
                value={form.urgencyLevel}
                onChange={(event) =>
                  setForm({
                    ...form,
                    urgencyLevel: event.target.value as ProfileInput["urgencyLevel"],
                  })
                }
                className={inputClass}
              >
                {URGENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field className="mt-5" label="Main needs">
            <div className="flex flex-wrap gap-3">
              {NEED_OPTIONS.map((need) => {
                const active = form.selectedNeeds.includes(need);
                return (
                  <button
                    key={need}
                    type="button"
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      active
                        ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                        : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--brand)]",
                    )}
                    onClick={() => toggleNeed(need)}
                  >
                    {need}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field className="mt-5" label="Notes">
            <textarea
              rows={5}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className={inputClass}
              placeholder="Optional: flight timing, budget concerns, job goals, school start date, housing worries, family context."
            />
          </Field>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              className="sm:min-w-56"
              disabled={isSubmitting}
              onClick={() => {
                void handleSubmit();
              }}
            >
              {isSubmitting ? "Generating..." : "Generate My Plan"}
            </Button>
            <p className="text-sm text-[var(--muted)]">
              ArrivalMate AI provides general guidance only and is not legal, immigration, medical, or financial advice.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-sm font-medium text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-[var(--line)] bg-white/92 px-4 py-3 text-[var(--ink)] outline-none placeholder:text-slate-400 focus:border-[var(--brand)]";
