import type { PlanSchema } from "@/lib/validation";
import type { PlanTask, ProfileInput } from "@/lib/types";
import { slugify } from "@/lib/utils";

function taskId(label: string) {
  return slugify(label);
}

function includesNeed(profile: ProfileInput, need: string) {
  return profile.selectedNeeds.includes(need as ProfileInput["selectedNeeds"][number]);
}

export function buildMockPlan(profile: ProfileInput): PlanSchema {
  const isVisitor = profile.status === "Visitor";
  const isStudent = profile.status === "International Student";
  const isWorker = profile.status === "Worker";
  const wantsJobSearch = includesNeed(profile, "Job Search");
  const wantsPhonePlan = includesNeed(profile, "Phone Plan");
  const wantsTransit = includesNeed(profile, "Transit");
  const wantsBanking = includesNeed(profile, "Banking");
  const wantsSin = includesNeed(profile, "SIN");
  const wantsMsp = includesNeed(profile, "MSP");
  const wantsHousing = includesNeed(profile, "Housing");
  const wantsSchoolResources = includesNeed(profile, "School Resources");

  const contextLead =
    isStudent
      ? "school setup and safe housing"
      : isWorker
        ? "documents, transit, and workplace readiness"
        : isVisitor
          ? "visitor-safe essentials, local navigation, and scam prevention"
          : "government documents and daily essentials";

  const supportAnchorLabel = profile.institutionOrWorkplace
    ? profile.institutionOrWorkplace
    : isStudent
      ? "your school"
      : isWorker
        ? "your workplace"
        : "a trusted local support contact";
  const cityLabel =
    profile.city === "Other"
      ? "the area around your school or workplace in BC"
      : profile.city;

  const tasks: PlanTask[] = [
    {
      id: taskId("check-documents-and-arrival-kit"),
      title: "Organize your arrival documents and contact list",
      category: "Documents" as const,
      priority: "High" as const,
      timeframe: "Today" as const,
      deadline: "Within 24 hours of arrival",
      explanation:
        isVisitor
          ? "Keep your passport, visitor documents, insurance details, address information, and emergency contacts easy to reach while you settle in."
          : "Keep your passport, permit, school or work letter, address details, and emergency contacts easy to reach while you settle in.",
      steps: isVisitor
        ? [
            "Store digital copies of your passport, visitor documents, and insurance details in a secure cloud folder.",
            "Write down your temporary address, phone number, and one emergency contact.",
            "Keep your passport and any visitor record or entry documents together in a safe place.",
          ]
        : [
            "Store digital copies of key documents in a secure cloud folder.",
            "Write down your temporary address, phone number, and one emergency contact.",
            "Keep your permit and passport together in a safe place.",
          ],
      completed: false,
    },
    {
      id: taskId("safe-housing-check"),
      title: isVisitor ? "Check temporary accommodation safety and rental scams" : "Run a housing safety and scam check",
      category: "Housing" as const,
      priority: "High" as const,
      timeframe: "Today" as const,
      deadline: "Before paying deposits or signing",
      explanation:
        isVisitor
          ? "Visitors can be pressured into unsafe temporary stays or fake rentals. Verify addresses, hosts, and payment requests before committing."
          : "Newcomers are often targeted by fake listings, rushed deposit requests, and pressure to pay before viewing a place or verifying the landlord.",
      steps: [
        "Avoid sending deposits before verifying the listing and landlord identity.",
        "Ask for a viewing, written agreement, and a receipt for any payment.",
        "Compare the address and rent level with similar local listings for warning signs.",
      ],
      completed: false,
    },
  ];

  if (!isVisitor && wantsSin) {
    tasks.push({
      id: taskId("check-sin-eligibility"),
      title:
        profile.hasSIN === "Yes"
          ? "Verify your SIN details are stored safely"
          : isStudent || isWorker
            ? "Check your SIN eligibility and setup steps"
            : "Check whether you are eligible for a Social Insurance Number (SIN)",
      category: "SIN" as const,
      priority: profile.hasSIN === "Yes" ? "Medium" : "High",
      timeframe: "This Week" as const,
      deadline: "During your first week",
      explanation:
        isWorker || isStudent
          ? "A SIN may be needed for work, payroll, and some service setups. Use official eligibility guidance before sharing your information."
          : "Eligibility can vary by status. Confirm whether a SIN is needed and available for your situation before taking action.",
      steps: [
        "Review the official Service Canada eligibility requirements for your current status.",
        "Gather your passport and any permit or status documents before visiting.",
        "Do not share your SIN with landlords, random callers, or unverified contacts.",
      ],
      completed: profile.hasSIN === "Yes",
    });
  }

  if (isVisitor && wantsSin) {
    tasks.push({
      id: taskId("check-visitor-sin-eligibility"),
      title: "Check whether you are eligible for a SIN as a visitor",
      category: "SIN" as const,
      priority: "Medium" as const,
      timeframe: "This Week" as const,
      deadline: "Before assuming you can work",
      explanation:
        "Visitors are not usually eligible for a SIN unless they also hold valid work authorization. Confirm eligibility before making plans around work or payroll.",
      steps: [
        "Review your visitor documents and any separate work authorization carefully.",
        "Check the official Service Canada eligibility guidance for your exact status.",
        "Do not rely on social media or informal advice for work eligibility questions.",
      ],
      completed: false,
    });
  }

  if (wantsBanking) {
    tasks.push({
      id: taskId("set-up-banking"),
      title:
        profile.hasBankAccount === "Yes"
          ? "Confirm your banking setup"
          : isVisitor
            ? "Check practical banking options for your stay"
            : "Open a newcomer-friendly bank account",
      category: "Banking" as const,
      priority: isVisitor ? "Medium" : "High",
      timeframe: "This Week" as const,
      deadline: "Within 7 days",
      explanation:
        isVisitor
          ? "A Canadian account can be helpful for a longer stay, but requirements vary. Confirm whether local banking is practical for your visit before committing."
          : "A local account helps with rent, payroll, mobile plans, and everyday purchases with less friction.",
      steps: isVisitor
        ? [
            "Compare visitor-friendly account options or low-friction payment alternatives before committing.",
            "Bring ID, status documents, and proof of address if the bank requires it.",
            "Ask about fraud alerts, transfer limits, and account fees before signing up.",
          ]
        : [
            "Compare newcomer-friendly account options from major Canadian banks.",
            "Bring ID, status documents, and proof of address if the bank requires it.",
            "Ask about fraud alerts, transfer limits, and account fees before signing up.",
          ],
      completed: profile.hasBankAccount === "Yes",
    });
  }

  if (wantsTransit) {
    tasks.push({
      id: taskId("set-up-transit"),
      title: profile.hasTransitPass === "Yes" ? "Load and review your transit setup" : "Set up Compass transit access",
      category: "Transit" as const,
      priority: "High" as const,
      timeframe: "This Week" as const,
      deadline: "Before your first commute",
      explanation:
        "Metro Vancouver transit is usually the easiest first-week option while you learn routes and daily costs.",
      steps: [
        "Check the best route from your housing to main destinations in TransLink.",
        "Get a Compass Card or mobile-ready payment option.",
        "Estimate your weekly transit budget before committing to regular travel.",
      ],
      completed: profile.hasTransitPass === "Yes",
    });
  }

  if (wantsPhonePlan) {
    tasks.push({
      id: taskId("set-up-phone-plan"),
      title: "Set up a Canadian phone plan",
      category: "Phone Plan" as const,
      priority: "High" as const,
      timeframe: "This Week" as const,
      deadline: "Within your first 3 days",
      explanation:
        isVisitor
          ? "A local phone number helps with navigation, accommodation updates, banking verification, and staying reachable during your visit."
          : "A local phone number helps with navigation, school or workplace updates, banking verification, and housing communication.",
      steps: isVisitor
        ? [
            "Compare prepaid, short-term, and eSIM-friendly providers before choosing a plan.",
            "Bring your passport and payment method when activating a SIM or eSIM.",
            "Update your accommodation contacts and emergency contacts with your new Canadian number.",
          ]
        : [
            "Compare newcomer-friendly and student-friendly providers before choosing a plan.",
            "Bring your passport and payment method when activating a SIM or eSIM.",
            "Update your school, housing, and key contacts with your new Canadian number.",
          ],
      completed: false,
    });
  }

  if (wantsMsp || isStudent || isWorker || isVisitor) {
    tasks.push({
      id: taskId("review-health-coverage"),
      title:
        isVisitor
          ? "Review private travel insurance and temporary healthcare options"
          : profile.hasMSP === "Yes"
            ? "Confirm your BC health coverage details"
            : "Review MSP eligibility and interim coverage needs",
      category: "MSP" as const,
      priority: isVisitor ? "High" : "Medium",
      timeframe: "This Week" as const,
      deadline: "During your first 10 days",
      explanation:
        isVisitor
          ? "Visitors should not assume MSP coverage. Make sure your private insurance is active and understand what emergency or temporary care options are available."
          : "British Columbia health coverage rules can vary by status, so it is important to confirm eligibility and any temporary coverage needs without assuming exact timelines.",
      steps: isVisitor
        ? [
            "Confirm that your travel or visitor insurance is active for your full stay.",
            "Check what emergency, walk-in, or temporary care options are covered by your policy.",
            "Use official BC guidance to confirm whether MSP applies to your exact status.",
          ]
        : [
            "Review official BC health coverage guidance for your immigration or work/study status.",
            "Check whether your school or employer offers interim coverage.",
            "Keep records of your application steps and any confirmation numbers.",
          ],
      completed: profile.hasMSP === "Yes",
    });
  }

  if (isStudent && wantsSchoolResources) {
    tasks.push({
      id: taskId("connect-school-support"),
      title: `Connect with support at ${supportAnchorLabel}`,
      category: "School" as const,
      priority: "High" as const,
      timeframe: "This Week" as const,
      deadline: "Within your first week",
      explanation:
        "A direct school support contact helps you solve orientation, academic, housing, wellbeing, and work-eligibility questions much faster.",
      steps: [
        "Find the international or student support office contact details.",
        "Check orientation sessions, student ID setup, and emergency support information.",
        "Save the main advising, wellbeing, and campus safety contacts.",
      ],
      completed: false,
    });
  } else {
    tasks.push({
      id: taskId("connect-local-support"),
      title: isWorker
        ? `Connect with onboarding support at ${supportAnchorLabel}`
        : "Connect with local community support channels",
      category: isWorker ? ("Other" as const) : ("Other" as const),
      priority: "Medium" as const,
      timeframe: "This Month" as const,
      deadline: "Within 30 days",
      explanation:
        isWorker
          ? "A direct workplace or settlement support contact helps you solve onboarding, payroll, and day-to-day questions faster."
          : "A local support contact helps you solve practical issues faster and feel more settled during your first month.",
      steps: [
        isWorker
          ? "Find your main HR, supervisor, or onboarding contact."
          : "Find one local community, settlement, or host-family support contact.",
        "Save key contact details for emergency and practical support.",
        "Ask about orientation, safety, and local services you may need soon.",
      ],
      completed: false,
    });
  }

  if (isWorker) {
    tasks.push({
      id: taskId("workplace-onboarding"),
      title: "Confirm workplace onboarding and payroll readiness",
      category: "Job" as const,
      priority: "High" as const,
      timeframe: "This Week" as const,
      deadline: "Before your first pay cycle",
      explanation:
        "Early clarity on schedule, payroll, contacts, and safety expectations reduces confusion and missed setup steps.",
      steps: [
        "Confirm your first shift schedule, supervisor, and onboarding paperwork.",
        "Check what payroll or direct-deposit setup is still missing.",
        "Save emergency, HR, and workplace safety contacts.",
      ],
      completed: false,
    });
  }

  if ((isStudent || isWorker || profile.status === "Newcomer") && wantsJobSearch) {
    tasks.push({
      id: taskId("job-readiness"),
      title:
        isStudent
          ? "Prepare for part-time work and job readiness"
          : isWorker
            ? "Prepare for local job systems and backup opportunities"
            : "Check work eligibility and job readiness steps",
      category: "Job" as const,
      priority: "Medium" as const,
      timeframe: "This Month" as const,
      deadline: "Within 30 days",
      explanation:
        isStudent
          ? "If you plan to work, confirm your study permit conditions and prepare for local hiring expectations."
          : isWorker
            ? "Even after starting work, understanding local hiring systems and backup opportunities can reduce risk."
            : "Work access can depend on status. Confirm eligibility before investing time into applications.",
      steps: [
        "Confirm your work authorization and any limits tied to your current status.",
        "Update your resume to a Canadian-friendly format if you plan to apply.",
        "Use official school, employer, or settlement support before acting on informal advice.",
      ],
      completed: false,
    });
  }

  if (isVisitor) {
    tasks.push({
      id: taskId("local-navigation"),
      title: "Set up local navigation and emergency basics",
      category: "Other" as const,
      priority: "Medium" as const,
      timeframe: "This Week" as const,
      deadline: "Within your first week",
      explanation:
        "Visitors benefit from knowing key routes, emergency contacts, and nearby essentials early so daily decisions feel safer and easier.",
      steps: [
        "Save the addresses of where you are staying, the nearest pharmacy, and urgent care options.",
        "Map your most common trips using transit and walking directions.",
        "Keep one emergency contact and one local support contact easy to reach.",
      ],
      completed: false,
    });
  }

  const filteredTasks = tasks.filter((task) => {
    if (task.category === "Phone Plan" && !wantsPhonePlan) return false;
    if (task.category === "Transit" && !wantsTransit) return false;
    if (task.category === "Banking" && !wantsBanking) return false;
    if (task.category === "Housing" && !wantsHousing && task.id !== taskId("safe-housing-check"))
      return false;
    return true;
  });
  const urgentTasks = filteredTasks.filter((task) => task.priority === "High").slice(0, 4);

  return {
    summary: `${profile.fullName} is arriving in ${cityLabel} and needs a practical 30-day plan focused on ${contextLead}. This checklist prioritizes urgent documents, safe housing decisions, core services, and local setup without assuming exact government processing times.`,
    progress: 0,
    urgentTasks,
    tasks: filteredTasks,
    scamWarnings: [
      {
        title: "Fake landlord deposit requests",
        riskLevel: "High",
        description:
          "Be cautious if someone asks for a deposit before a viewing, avoids showing ID, or pushes you to move the conversation off trusted rental platforms.",
        safeAction:
          "Verify the address, ask for a written agreement, and never rush a transfer because of pressure or scarcity tactics.",
      },
      {
        title: "Phone calls pretending to be government or police",
        riskLevel: "High",
        description:
          "Scammers may claim you owe money or that your status is at risk, then demand payment, gift cards, or crypto immediately.",
        safeAction:
          "Hang up, avoid sharing personal details, and call the official public number listed on the government website yourself.",
      },
      {
        title: "Banking and e-transfer impersonation",
        riskLevel: "Medium",
        description:
          "Fraudsters may send fake security messages or ask you to confirm one-time codes to reverse a supposed problem.",
        safeAction:
          "Only use the bank app or published support number, and never share verification codes or passwords.",
      },
    ],
    localResources: [
      {
        name: "Service Canada",
        type: "Government",
        description: "Primary official source for SIN-related service details and eligibility requirements.",
        suggestedAction: isVisitor
          ? "Use official eligibility guidance before assuming you can apply for a SIN as a visitor."
          : "Review requirements before visiting and keep copies of the documents you plan to bring.",
      },
      {
        name: "BC MSP information",
        type: "Government",
        description: "Official BC health coverage guidance to help confirm next steps for your status.",
        suggestedAction: isVisitor
          ? "Confirm whether MSP applies to your stay and keep private travel or visitor insurance active."
          : "Check eligibility and whether you need interim coverage while your status or enrollment is being processed.",
      },
      {
        name: "TransLink",
        type: "Transit",
        description: "Metro Vancouver transit network covering buses, SkyTrain, SeaBus, and route planning.",
        suggestedAction: "Map your most common trips early and decide whether a Compass Card is the right fit.",
      },
      {
        name: supportAnchorLabel,
        type: isStudent ? "School" : isWorker ? "Career" : "Other",
        description: isStudent
          ? "A local anchor point for orientation, support services, and academic setup."
          : isWorker
            ? "A practical onboarding contact for workplace readiness and day-to-day support."
            : "A useful local anchor point for practical support during your stay.",
        suggestedAction: isStudent
          ? "Book one first support conversation so you know where to go when questions come up."
          : isWorker
            ? "Confirm your onboarding contact and keep payroll or workplace questions in one place."
            : "Save one reliable local support contact you can use if plans change quickly.",
      },
      {
        name: `${cityLabel} newcomer and community supports`,
        type: "Safety",
        description: "Local settlement, community safety, and practical orientation resources can reduce first-month friction.",
        suggestedAction: "Save the main contact channels and use official pages instead of social media rumors for important decisions.",
      },
    ],
    agentReasoningSummary: `The plan prioritizes immediate risks first, then core setup steps for daily life in British Columbia. It emphasizes safe document handling, housing verification, practical transport and banking setup, and clear local support channels while staying within general guidance only.`,
  };
}
