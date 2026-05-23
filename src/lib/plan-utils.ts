import type { PlanTask } from "@/lib/types";

export function calculateProgress(tasks: PlanTask[]) {
  if (tasks.length === 0) {
    return 0;
  }

  const completed = tasks.filter((task) => task.completed).length;
  return Math.round((completed / tasks.length) * 100);
}

export function syncUrgentTasks(tasks: PlanTask[], urgentTasks: PlanTask[]) {
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  return urgentTasks.map((task) => taskMap.get(task.id) ?? task);
}

export function updateTaskCompletion(tasks: PlanTask[], taskId: string, completed: boolean) {
  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          completed,
        }
      : task,
  );
}
