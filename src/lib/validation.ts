import { z } from "zod";
import {
  CITY_OPTIONS,
  HOUSING_OPTIONS,
  MSP_OPTIONS,
  NEED_OPTIONS,
  RESOURCE_TYPES,
  RISK_LEVELS,
  STATUS_OPTIONS,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_TIMEFRAMES,
  URGENCY_OPTIONS,
  YES_NO_OPTIONS,
} from "@/lib/types";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  city: z.enum(CITY_OPTIONS),
  arrivalDate: z.string().min(1),
  status: z.enum(STATUS_OPTIONS),
  institutionOrWorkplace: z.string().trim().max(120).optional().default(""),
  selectedNeeds: z.array(z.enum(NEED_OPTIONS)).min(1).max(10),
  housingStatus: z.enum(HOUSING_OPTIONS),
  hasSIN: z.enum(YES_NO_OPTIONS),
  hasBankAccount: z.enum(YES_NO_OPTIONS),
  hasTransitPass: z.enum(YES_NO_OPTIONS),
  hasMSP: z.enum(MSP_OPTIONS),
  urgencyLevel: z.enum(URGENCY_OPTIONS),
  notes: z.string().trim().max(600).optional().default(""),
});

export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(120),
  category: z.enum(TASK_CATEGORIES),
  priority: z.enum(TASK_PRIORITIES),
  timeframe: z.enum(TASK_TIMEFRAMES),
  deadline: z.string().min(1).max(80),
  explanation: z.string().min(10).max(700),
  steps: z.array(z.string().min(2).max(220)).min(1).max(6),
  completed: z.boolean(),
});

export const planSchema = z.object({
  summary: z.string().min(20).max(900),
  progress: z.number().min(0).max(100),
  urgentTasks: z.array(taskSchema).min(1).max(8),
  tasks: z.array(taskSchema).min(3).max(20),
  scamWarnings: z
    .array(
      z.object({
        title: z.string().min(3).max(120),
        riskLevel: z.enum(RISK_LEVELS),
        description: z.string().min(10).max(500),
        safeAction: z.string().min(10).max(400),
      }),
    )
    .min(2)
    .max(8),
  localResources: z
    .array(
      z.object({
        name: z.string().min(3).max(120),
        type: z.enum(RESOURCE_TYPES),
        description: z.string().min(10).max(300),
        suggestedAction: z.string().min(10).max(240),
      }),
    )
    .min(3)
    .max(10),
  agentReasoningSummary: z.string().min(20).max(900),
});

export const refinePlanSchema = z.object({
  note: z.string().trim().min(3).max(500),
});

export const updateTaskSchema = z.object({
  planId: z.string().regex(/^[a-f\d]{24}$/i, "planId must be a valid MongoDB id"),
  taskId: z.string().min(1),
  completed: z.boolean(),
});

export type ProfileInputSchema = z.infer<typeof profileSchema>;
export type PlanSchema = z.infer<typeof planSchema>;
