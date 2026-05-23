import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { calculateProgress, syncUrgentTasks, updateTaskCompletion } from "@/lib/plan-utils";
import type { AgentLogDocument, PlanDocument, ProfileDocument } from "@/lib/types";
import { isoNow } from "@/lib/utils";

type StoredProfileDocument = Omit<ProfileDocument, "_id"> & { _id?: ObjectId };
type StoredPlanDocument = Omit<PlanDocument, "_id"> & { _id?: ObjectId };
type StoredAgentLogDocument = Omit<AgentLogDocument, "_id"> & { _id?: ObjectId };

function mapId<T extends { _id?: unknown }>(doc: T | null): (Omit<T, "_id"> & { _id: string }) | null {
  if (!doc) {
    return null;
  }

  return {
    ...doc,
    _id: String(doc._id),
  };
}

function mapMany<T extends { _id?: unknown }>(docs: T[]) {
  return docs.map((doc) => ({
    ...doc,
    _id: String(doc._id),
  }));
}

export async function upsertProfile(profile: ProfileDocument) {
  const db = await getDatabase();
  const profiles = db.collection<StoredProfileDocument>("profiles");
  const latest = await profiles.findOne({}, { sort: { updatedAt: -1 } });
  const now = isoNow();
  const { _id, ...profileData } = profile;
  void _id;

  if (latest?._id) {
    await profiles.updateOne(
      { _id: latest._id },
      {
        $set: {
          ...profileData,
          updatedAt: now,
        },
      },
    );

    return getLatestProfile();
  }

  await profiles.insertOne({
    ...profileData,
    createdAt: now,
    updatedAt: now,
  });

  return getLatestProfile();
}

export async function getLatestProfile() {
  const db = await getDatabase();
  const doc = await db
    .collection<StoredProfileDocument>("profiles")
    .findOne({}, { sort: { updatedAt: -1 } });

  return mapId(doc);
}

export async function savePlan(plan: Omit<PlanDocument, "_id" | "createdAt" | "updatedAt">) {
  const db = await getDatabase();
  const plans = db.collection<StoredPlanDocument>("plans");
  const now = isoNow();
  const document: StoredPlanDocument = {
    ...plan,
    progress: calculateProgress(plan.tasks),
    urgentTasks: syncUrgentTasks(plan.tasks, plan.urgentTasks),
    createdAt: now,
    updatedAt: now,
  };

  await plans.insertOne(document);
  return getLatestPlan();
}

export async function getLatestPlan() {
  const db = await getDatabase();
  const doc = await db
    .collection<StoredPlanDocument>("plans")
    .findOne({}, { sort: { updatedAt: -1 } });

  return mapId(doc);
}

export async function getRecentPlans(limit = 5) {
  const db = await getDatabase();
  const docs = await db
    .collection<StoredPlanDocument>("plans")
    .find({})
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray();

  return mapMany(docs);
}

export async function updatePlanTask(planId: string, taskId: string, completed: boolean) {
  const db = await getDatabase();
  const plans = db.collection<StoredPlanDocument>("plans");
  const targetPlan = await plans.findOne({ _id: new ObjectId(planId) });

  if (!targetPlan?._id) {
    throw new Error("No saved plan found.");
  }

  const tasks = updateTaskCompletion(targetPlan.tasks, taskId, completed);
  const urgentTasks = syncUrgentTasks(tasks, targetPlan.urgentTasks);
  const progress = calculateProgress(tasks);

  await plans.updateOne(
    { _id: targetPlan._id },
    {
      $set: {
        tasks,
        urgentTasks,
        progress,
        updatedAt: isoNow(),
      },
    },
  );

  const updated = await plans.findOne({ _id: targetPlan._id });
  return mapId(updated);
}

export async function addAgentLog(log: AgentLogDocument) {
  const db = await getDatabase();
  const { _id, ...logData } = log;
  void _id;
  await db.collection<StoredAgentLogDocument>("agent_logs").insertOne(logData);
}

export async function getRecentAgentLogs(limit = 8) {
  const db = await getDatabase();
  const docs = await db
    .collection<StoredAgentLogDocument>("agent_logs")
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return mapMany(docs);
}
