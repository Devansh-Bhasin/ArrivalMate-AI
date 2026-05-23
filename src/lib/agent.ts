import { GoogleGenAI } from "@google/genai";
import { buildMockPlan } from "@/lib/mock-plan";
import type { PlanDocument, PlanTask, ProfileInput } from "@/lib/types";
import { planSchema } from "@/lib/validation";

const SYSTEM_INSTRUCTION =
  "You are ArrivalMate AI, a practical newcomer support agent for people arriving in British Columbia, Canada. You help international students and newcomers organize their first 30 days after arrival. You do not provide legal, immigration, medical, or financial advice. You create clear, step-by-step action plans, prioritize urgent tasks, identify safety risks, and help the user track progress. You are action-oriented and return structured JSON only.";

const MODEL_NAME = "gemini-2.5-flash";

type AgentRunResult = {
  plan: ReturnType<typeof planSchema.parse>;
  model: string;
  fallbackReason?: string;
  internalFallbackReason?: string;
};

type GeminiSuccessResult = {
  plan: ReturnType<typeof planSchema.parse>;
  model: string;
};

type GeminiFailureResult = {
  userReason: string;
  internalReason: string;
};

const USER_FACING_FALLBACK_MESSAGE =
  "ArrivalMate AI is currently running in resilient demo mode using its built-in planning engine. Core planning, progress tracking, and MongoDB memory remain fully functional.";

function buildPrompt(profile: ProfileInput, note?: string, currentPlan?: PlanDocument | null) {
  return `
Create a practical first-30-days newcomer checklist for this user in British Columbia, Canada.

Profile:
${JSON.stringify(profile, null, 2)}

${currentPlan ? `Current plan:\n${JSON.stringify(currentPlan, null, 2)}\n` : ""}
${note ? `User refinement note:\n${note}\n` : ""}

Requirements:
- Return valid JSON only.
- Be practical, concise, and newcomer-friendly.
- Include disclaimers that the app is general guidance only and not legal, immigration, medical, or financial advice.
- Include scam warnings relevant to students/newcomers.
- Avoid unsupported claims about exact processing times.
- Use the exact schema requested by the app.
- Ensure urgentTasks are a subset of tasks.
- Set progress to 0 unless current task completion state is provided and should be preserved.
- Follow these status rules carefully:
  - Visitor:
    - Do not recommend default SIN setup unless the user explicitly selected SIN or clearly mentions work authorization.
    - Do not include employment or job-readiness tasks unless the user explicitly selected Job Search or clearly mentions work authorization.
    - Do not imply that the visitor can work.
    - Do not assume MSP eligibility. Use language like "check whether you are eligible" where needed.
    - Prioritize visitor-safe tasks like documents, emergency contacts, temporary accommodation safety, housing scams, transit, phone setup, navigation, and travel or visitor insurance guidance.
  - International Student:
    - School orientation and support tasks should be included when relevant.
    - SIN and job-search tasks are acceptable when the profile suggests work interest or selected needs include them.
    - MSP guidance should use eligibility-check language.
  - Worker:
    - SIN, payroll, banking, transit, phone, workplace onboarding, and interim health coverage guidance are appropriate.
  - Newcomer:
    - Use general settlement guidance and eligibility-check language for SIN, MSP, and work where appropriate.

JSON schema:
{
  "summary": "string",
  "progress": 0,
  "urgentTasks": [
    {
      "id": "string",
      "title": "string",
      "category": "SIN | MSP | Banking | Transit | Phone Plan | Housing | School | Job | Safety | Documents | Other",
      "priority": "High | Medium | Low",
      "timeframe": "Today | This Week | This Month",
      "deadline": "string",
      "explanation": "string",
      "steps": ["string"],
      "completed": false
    }
  ],
  "tasks": [],
  "scamWarnings": [
    {
      "title": "string",
      "riskLevel": "High | Medium | Low",
      "description": "string",
      "safeAction": "string"
    }
  ],
  "localResources": [
    {
      "name": "string",
      "type": "Government | School | Transit | Banking | Housing | Career | Safety | Other",
      "description": "string",
      "suggestedAction": "string"
    }
  ],
  "agentReasoningSummary": "string"
}`;
}

function extractJson(text: string) {
  const cleaned = text.trim().replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

function normalizeTaskId(value: string) {
  return value.trim().toLowerCase();
}

function normalizeTaskTitle(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function normalizeCategoryValue(value: unknown) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "school resources" || raw === "school") {
    return "School";
  }
  if (raw === "scams" || raw === "safety") {
    return "Safety";
  }
  if (raw === "phone" || raw === "phone plan" || raw === "mobile") {
    return "Phone Plan";
  }
  if (raw === "documents") {
    return "Documents";
  }
  if (raw === "sin") {
    return "SIN";
  }
  if (raw === "msp") {
    return "MSP";
  }
  if (raw === "banking") {
    return "Banking";
  }
  if (raw === "transit") {
    return "Transit";
  }
  if (raw === "housing") {
    return "Housing";
  }
  if (raw === "job" || raw === "job search" || raw === "career") {
    return "Job";
  }
  return "Other";
}

function normalizeResourceTypeValue(value: unknown) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "school resources" || raw === "school") {
    return "School";
  }
  if (raw === "government") {
    return "Government";
  }
  if (raw === "transit") {
    return "Transit";
  }
  if (raw === "banking") {
    return "Banking";
  }
  if (raw === "housing") {
    return "Housing";
  }
  if (raw === "job" || raw === "job search" || raw === "career") {
    return "Career";
  }
  if (raw === "scams" || raw === "safety") {
    return "Safety";
  }
  return "Other";
}

function normalizeRiskLevelValue(value: unknown) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "high") {
    return "High";
  }
  if (raw === "low") {
    return "Low";
  }
  return "Medium";
}

function normalizePriorityValue(value: unknown) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "high") {
    return "High";
  }
  if (raw === "low") {
    return "Low";
  }
  return "Medium";
}

function normalizeTimeframeValue(value: unknown) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "today") {
    return "Today";
  }
  if (raw === "this month" || raw === "month" || raw === "within 30 days") {
    return "This Month";
  }
  return "This Week";
}

function normalizeRawPlan(rawPlan: unknown) {
  if (!rawPlan || typeof rawPlan !== "object") {
    return rawPlan;
  }

  const plan = rawPlan as Record<string, unknown>;
  const normalizeTask = (task: unknown) => {
    if (!task || typeof task !== "object") {
      return task;
    }

    const typedTask = task as Record<string, unknown>;
    return {
      ...typedTask,
      category: normalizeCategoryValue(typedTask.category),
      priority: normalizePriorityValue(typedTask.priority),
      timeframe: normalizeTimeframeValue(typedTask.timeframe),
      completed: Boolean(typedTask.completed),
    };
  };

  return {
    ...plan,
    urgentTasks: Array.isArray(plan.urgentTasks)
      ? plan.urgentTasks.map(normalizeTask)
      : plan.urgentTasks,
    tasks: Array.isArray(plan.tasks) ? plan.tasks.map(normalizeTask) : plan.tasks,
    scamWarnings: Array.isArray(plan.scamWarnings)
      ? plan.scamWarnings.map((warning) => {
          if (!warning || typeof warning !== "object") {
            return warning;
          }
          const typedWarning = warning as Record<string, unknown>;
          return {
            ...typedWarning,
            riskLevel: normalizeRiskLevelValue(typedWarning.riskLevel),
          };
        })
      : plan.scamWarnings,
    localResources: Array.isArray(plan.localResources)
      ? plan.localResources.map((resource) => {
          if (!resource || typeof resource !== "object") {
            return resource;
          }
          const typedResource = resource as Record<string, unknown>;
          return {
            ...typedResource,
            type: normalizeResourceTypeValue(typedResource.type),
          };
        })
      : plan.localResources,
  };
}

function normalizeGeminiPlan(rawPlan: unknown) {
  const parsed = planSchema.parse(normalizeRawPlan(rawPlan));
  const tasks = [...parsed.tasks];

  const taskById = new Map(tasks.map((task) => [normalizeTaskId(task.id), task]));
  const taskByTitle = new Map(tasks.map((task) => [normalizeTaskTitle(task.title), task]));

  const urgentTasks: PlanTask[] = parsed.urgentTasks
    .map((urgentTask) => {
      const matchedById = taskById.get(normalizeTaskId(urgentTask.id));
      if (matchedById) {
        return matchedById;
      }

      const matchedByTitle = taskByTitle.get(normalizeTaskTitle(urgentTask.title));
      if (matchedByTitle) {
        return matchedByTitle;
      }

      tasks.unshift(urgentTask);
      taskById.set(normalizeTaskId(urgentTask.id), urgentTask);
      taskByTitle.set(normalizeTaskTitle(urgentTask.title), urgentTask);
      return urgentTask;
    })
    .slice(0, 8);

  return {
    ...parsed,
    urgentTasks,
    tasks: tasks.slice(0, 20),
  };
}

function applyStatusGuardrails(plan: ReturnType<typeof planSchema.parse>, profile: ProfileInput) {
  const isVisitor = profile.status === "Visitor";
  const isStudent = profile.status === "International Student";
  const isWorker = profile.status === "Worker";
  const wantsJobSearch = profile.selectedNeeds.includes("Job Search");
  const wantsSin = profile.selectedNeeds.includes("SIN");

  let filteredTasks = plan.tasks.filter((task) => {
    if (!isVisitor) {
      return true;
    }

    if (task.category === "Job" && !wantsJobSearch) {
      return false;
    }

    if (task.category === "SIN" && !wantsSin) {
      return false;
    }

    return true;
  });

  filteredTasks = filteredTasks.map((task) => {
    if (!isVisitor) {
      return task;
    }

    if (task.category === "MSP") {
      return {
        ...task,
        title: "Review visitor insurance and healthcare eligibility",
        explanation:
          "Visitors should not assume MSP coverage. Confirm whether you are eligible and make sure private travel or visitor insurance stays active.",
      };
    }

    if (task.category === "Banking") {
      return {
        ...task,
        explanation:
          "A local bank account may be practical for a longer stay, but visitor requirements can vary. Confirm whether local banking makes sense for your situation first.",
      };
    }

    if (task.category === "SIN") {
      return {
        ...task,
        title: "Check whether you are eligible for a SIN as a visitor",
        explanation:
          "Visitors are not usually eligible for a SIN unless they also hold valid work authorization. Confirm eligibility before making work plans.",
      };
    }

    return task;
  });

  if (isStudent && !filteredTasks.some((task) => task.category === "School")) {
    filteredTasks.unshift({
      id: "student-support-check",
      title: `Connect with support at ${profile.institutionOrWorkplace || "your school"}`,
      category: "School",
      priority: "High",
      timeframe: "This Week",
      deadline: "Within your first week",
      explanation:
        "Early orientation and support contacts can help you solve academic, housing, and wellbeing questions faster.",
      steps: [
        "Find the main international or student support office.",
        "Check orientation sessions and key campus services.",
        "Save one advising and one emergency contact.",
      ],
      completed: false,
    });
  }

  if (isWorker && !filteredTasks.some((task) => task.title.toLowerCase().includes("payroll"))) {
    filteredTasks.unshift({
      id: "worker-payroll-check",
      title: "Confirm workplace onboarding and payroll readiness",
      category: "Job",
      priority: "High",
      timeframe: "This Week",
      deadline: "Before your first pay cycle",
      explanation:
        "Confirming payroll, onboarding contacts, and workplace expectations early helps reduce costly setup mistakes.",
      steps: [
        "Confirm your first shift schedule and supervisor.",
        "Check what payroll or direct-deposit details are still needed.",
        "Save HR or workplace support contacts.",
      ],
      completed: false,
    });
  }

  const taskById = new Map(filteredTasks.map((task) => [normalizeTaskId(task.id), task]));
  const urgentTasks = plan.urgentTasks
    .map((task) => taskById.get(normalizeTaskId(task.id)))
    .filter((task): task is PlanTask => Boolean(task))
    .slice(0, 8);

  return {
    ...plan,
    tasks: filteredTasks,
    urgentTasks,
  };
}

async function runGemini(
  profile: ProfileInput,
  note?: string,
  currentPlan?: PlanDocument | null,
): Promise<GeminiSuccessResult | GeminiFailureResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. ArrivalMate AI is using deterministic mock planning.");
    return {
      userReason: USER_FACING_FALLBACK_MESSAGE,
      internalReason: "Gemini API key is missing.",
    };
  }

  const client = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(profile, note, currentPlan);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await client.models.generateContent({
        model: MODEL_NAME,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.5,
          responseMimeType: "application/json",
        },
        contents: prompt,
      });

      const text = response.text ?? "";
      const parsed = applyStatusGuardrails(normalizeGeminiPlan(extractJson(text)), profile);
      return {
        plan: parsed,
        model: MODEL_NAME,
      };
    } catch (error) {
      const maybeError = error as { status?: number; message?: string };
      if (maybeError.status === 429) {
        console.error("Gemini quota exceeded. Falling back to mock plan.", error);
        return {
          userReason: USER_FACING_FALLBACK_MESSAGE,
          internalReason: "Gemini quota is currently exhausted for this API key.",
        };
      }

      if (attempt === 1) {
        console.error("Gemini returned invalid plan JSON. Falling back to mock plan.", error);
        return {
          userReason: USER_FACING_FALLBACK_MESSAGE,
          internalReason: "Gemini returned a plan that did not match the required schema.",
        };
      }
    }
  }

  return {
    userReason: USER_FACING_FALLBACK_MESSAGE,
    internalReason: "Gemini planning was unavailable.",
  };
}

export async function generateArrivalPlan(
  profile: ProfileInput,
  currentPlan?: PlanDocument | null,
  note?: string,
): Promise<AgentRunResult> {
  const geminiResult = await runGemini(profile, note, currentPlan);

  if ("plan" in geminiResult) {
    return geminiResult;
  }

  const mockPlan = buildMockPlan(profile);

  if (currentPlan) {
    const completionById = new Map(currentPlan.tasks.map((task) => [task.id, task.completed]));
    mockPlan.tasks = mockPlan.tasks.map((task) => ({
      ...task,
      completed: completionById.get(task.id) ?? task.completed,
    }));
    mockPlan.urgentTasks = mockPlan.urgentTasks.map((task) => ({
      ...task,
      completed: completionById.get(task.id) ?? task.completed,
    }));
  }

  return {
    plan: planSchema.parse(mockPlan),
    model: "mock-generator",
    fallbackReason: geminiResult.userReason,
    internalFallbackReason: geminiResult.internalReason,
  };
}
