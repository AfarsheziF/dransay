// Server-only utility for tasks
import { Task } from "src/db/schema";
import { appRouter, createContext } from "../../src/server/trpc";

export interface TaskStatus {
  total: number;
  totalCompleted: number;
  totalPending: number;
  totalTasks: Task[];
  completed: Task[];
  pending: Task[];
}

export async function getTasksStatus(userId?: number): Promise<TaskStatus> {
  const contextUserId = userId || 1;

  try {
    console.log("🔍 Fetching tasks status for userId:", contextUserId);

    // Create caller with proper context
    const caller = appRouter.createCaller({ userId: contextUserId });

    // First, let's check if we can call a public procedure
    const healthCheck = await caller.health();
    console.log("✅ Health check successful:", healthCheck);

    // Now try to get tasks

    const totalTasks = (await caller.tasks.getAll()).map((task) => ({
      ...task,
      status: task.completed ? "completed" : "pending",
    })) as Task[];
    const completed = totalTasks
      .filter((task) => task.completed)
      .map((t) => ({ ...t, status: "completed" as const }));
    const pending = totalTasks
      .filter((task) => !task.completed)
      .map((t) => ({ ...t, status: "pending" as const }));
    return {
      total: totalTasks.length,
      totalCompleted: completed.length,
      totalPending: pending.length,
      totalTasks,
      completed,
      pending,
    };
  } catch (error) {
    console.error("❌ Error in getTasksStatus:", error);
    throw error;
  }
}

export async function createNewTask(
  data: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: "low" | "medium" | "high";
  },
  userId?: number
): Promise<Task> {
  const contextUserId = userId || 1;

  const caller = appRouter.createCaller({ userId: contextUserId });

  try {
    const newTask = await caller.tasks.create({
      title: data.title,
      description: data.description,
      priority: data.priority || "medium",
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
    return newTask;
  } catch (error) {
    console.error("Error creating task via TRPC:", error);
    throw error;
  }
}

// Helper function to create authenticated caller from request
export async function createAuthenticatedCaller(request: Request) {
  const context = await createContext({ req: request });
  return appRouter.createCaller(context);
}
