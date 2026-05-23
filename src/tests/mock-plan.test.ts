import { describe, expect, it } from "vitest";
import { generateArrivalPlan } from "@/lib/agent";
import { buildMockPlan } from "@/lib/mock-plan";
import { calculateProgress, updateTaskCompletion } from "@/lib/plan-utils";
import { planSchema } from "@/lib/validation";
import type { ProfileInput } from "@/lib/types";

const demoProfile: ProfileInput = {
  fullName: "Demo Student",
  city: "Surrey",
  arrivalDate: "2026-05-20",
  status: "International Student",
  institutionOrWorkplace: "SFU Surrey",
  selectedNeeds: ["SIN", "MSP", "Banking", "Transit", "Housing", "Job Search", "School Resources"],
  housingStatus: "Temporary Stay",
  hasSIN: "No",
  hasBankAccount: "No",
  hasTransitPass: "No",
  hasMSP: "Not Sure",
  urgencyLevel: "High",
  notes: "Wants a clear week-one setup plan.",
};

const visitorProfile: ProfileInput = {
  fullName: "Adam",
  city: "Surrey",
  arrivalDate: "2026-05-22",
  status: "Visitor",
  institutionOrWorkplace: "",
  selectedNeeds: ["Transit", "Phone Plan", "Housing", "Scams", "Documents"],
  housingStatus: "Temporary Stay",
  hasSIN: "No",
  hasBankAccount: "No",
  hasTransitPass: "No",
  hasMSP: "Not Sure",
  urgencyLevel: "Medium",
  notes: "Needs a safe first-week plan.",
};

describe("mock plan generation", () => {
  it("builds a deterministic newcomer plan", () => {
    const plan = buildMockPlan(demoProfile);
    expect(plan.tasks.length).toBeGreaterThanOrEqual(7);
    expect(plan.urgentTasks.every((task) => task.priority === "High")).toBe(true);
    expect(plan.summary).toContain("Surrey");
  });

  it("validates generated JSON against the app schema", () => {
    const plan = buildMockPlan(demoProfile);
    expect(() => planSchema.parse(plan)).not.toThrow();
  });

  it("falls back to the mock plan when Gemini is not configured", async () => {
    delete process.env.GEMINI_API_KEY;
    const result = await generateArrivalPlan(demoProfile);
    expect(result.model).toBe("mock-generator");
    expect(result.plan.tasks.length).toBeGreaterThan(0);
    expect(result.fallbackReason).toContain("resilient demo mode");
  });

  it("calculates progress from completed tasks", () => {
    const plan = buildMockPlan(demoProfile);
    const updated = updateTaskCompletion(plan.tasks, plan.tasks[0].id, true);
    const progress = calculateProgress(updated);
    expect(progress).toBeGreaterThan(0);
  });

  it("updates task completion without changing other task ids", () => {
    const plan = buildMockPlan(demoProfile);
    const target = plan.tasks[0];
    const updated = updateTaskCompletion(plan.tasks, target.id, true);
    expect(updated.find((task) => task.id === target.id)?.completed).toBe(true);
    expect(updated.map((task) => task.id)).toEqual(plan.tasks.map((task) => task.id));
  });

  it("keeps visitor plans free of default SIN and job tasks", () => {
    const plan = buildMockPlan(visitorProfile);
    const categories = plan.tasks.map((task) => task.category);

    expect(categories).not.toContain("SIN");
    expect(categories).not.toContain("Job");
    expect(plan.summary).toContain("visitor-safe essentials");
  });

  it("keeps visitor health guidance framed as eligibility and insurance checks", () => {
    const plan = buildMockPlan(visitorProfile);
    const healthTask = plan.tasks.find((task) => task.category === "MSP");

    expect(healthTask?.title).toContain("insurance");
    expect(healthTask?.explanation).toContain("should not assume MSP coverage");
  });
});
