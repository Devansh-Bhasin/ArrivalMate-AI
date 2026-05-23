export const NEED_OPTIONS = [
  "SIN",
  "MSP",
  "Banking",
  "Transit",
  "Phone Plan",
  "Housing",
  "Job Search",
  "School Resources",
  "Scams",
  "Documents",
] as const;

export const CITY_OPTIONS = [
  "Surrey",
  "Vancouver",
  "Richmond",
  "Burnaby",
  "Other",
] as const;

export const STATUS_OPTIONS = [
  "International Student",
  "Newcomer",
  "Worker",
  "Visitor",
] as const;

export const HOUSING_OPTIONS = [
  "Temporary Stay",
  "Permanent Housing",
  "Searching",
  "Living with Family/Friends",
] as const;

export const YES_NO_OPTIONS = ["Yes", "No"] as const;
export const MSP_OPTIONS = ["Yes", "No", "Not Sure"] as const;
export const URGENCY_OPTIONS = ["Low", "Medium", "High"] as const;
export const TASK_CATEGORIES = [
  "SIN",
  "MSP",
  "Banking",
  "Transit",
  "Phone Plan",
  "Housing",
  "School",
  "Job",
  "Safety",
  "Documents",
  "Other",
] as const;
export const TASK_PRIORITIES = ["High", "Medium", "Low"] as const;
export const TASK_TIMEFRAMES = ["Today", "This Week", "This Month"] as const;
export const RESOURCE_TYPES = [
  "Government",
  "School",
  "Transit",
  "Banking",
  "Housing",
  "Career",
  "Safety",
  "Other",
] as const;
export const RISK_LEVELS = ["High", "Medium", "Low"] as const;

export type CityOption = (typeof CITY_OPTIONS)[number];
export type StatusOption = (typeof STATUS_OPTIONS)[number];
export type HousingOption = (typeof HOUSING_OPTIONS)[number];
export type YesNoOption = (typeof YES_NO_OPTIONS)[number];
export type MspOption = (typeof MSP_OPTIONS)[number];
export type UrgencyOption = (typeof URGENCY_OPTIONS)[number];
export type NeedOption = (typeof NEED_OPTIONS)[number];
export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskTimeframe = (typeof TASK_TIMEFRAMES)[number];
export type ResourceType = (typeof RESOURCE_TYPES)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];

export interface ProfileInput {
  fullName: string;
  city: CityOption;
  arrivalDate: string;
  status: StatusOption;
  institutionOrWorkplace?: string;
  selectedNeeds: NeedOption[];
  housingStatus: HousingOption;
  hasSIN: YesNoOption;
  hasBankAccount: YesNoOption;
  hasTransitPass: YesNoOption;
  hasMSP: MspOption;
  urgencyLevel: UrgencyOption;
  notes?: string;
}

export interface ProfileDocument extends ProfileInput {
  _id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanTask {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  timeframe: TaskTimeframe;
  deadline: string;
  explanation: string;
  steps: string[];
  completed: boolean;
}

export interface ScamWarning {
  title: string;
  riskLevel: RiskLevel;
  description: string;
  safeAction: string;
}

export interface LocalResource {
  name: string;
  type: ResourceType;
  description: string;
  suggestedAction: string;
}

export interface PlanDocument {
  _id?: string;
  profileId: string;
  summary: string;
  progress: number;
  urgentTasks: PlanTask[];
  tasks: PlanTask[];
  scamWarnings: ScamWarning[];
  localResources: LocalResource[];
  agentReasoningSummary: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentLogDocument {
  _id?: string;
  profileId: string;
  action: string;
  inputSummary: string;
  outputSummary: string;
  model: string;
  createdAt: string;
}
