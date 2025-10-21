import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { getTasksStatus, TaskStatus } from "./tasks.server";

type LoaderData =
  | {
      tasksStatus: TaskStatus;
    }
  | {
      errors: string;
    };

// Loader runs on GET requests (initial page load, refresh)
export const tasksLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("🔄 Loader: Fetching tasks status on page load");
    const tasksStatus = await getTasksStatus();
    return json<LoaderData>({ tasksStatus });
  } catch (error: Error | any) {
    console.error("❌ Loader error:", error);
    return json<LoaderData>({
      errors: error.message || "Unknown error",
    });
  }
};

type ActionData =
  | {
      tasksStatus: TaskStatus;
    }
  | {
      errors: string;
    }
  | { success: true; message: string }
  | null;

// Action runs on POST requests (form submissions)
export const tasksAction = async ({ request }: ActionFunctionArgs) => {
  try {
    console.log("🔄 Action: Refreshing tasks status via form submission");
    const tasksStatus = await getTasksStatus();
    return json<ActionData>({ tasksStatus });
  } catch (error: Error | any) {
    console.error("❌ Action error:", error);
    return json<ActionData>({
      errors: error.message || "Unknown error",
    });
  }
};
