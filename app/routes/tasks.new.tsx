import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { z } from "zod";
import { createNewTask } from "~/utils/tasks.server";

const CreateTaskSchema = z.object({
  title: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return new Date(date) > new Date();
    }, "Due date must be in the future"),
});

// Define the return types for better type safety
type ActionData =
  | {
      errors: z.typeToFlattenedError<{
        title: string;
        description?: string;
        priority: "low" | "medium" | "high";
        dueDate?: string;
      }>;
    }
  | {
      errors: {
        formErrors: string[];
        fieldErrors?: string[];
      };
    }
  | { success: true; message: string }
  | null;

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const formObject = Object.fromEntries(formData);
  const result = CreateTaskSchema.safeParse(formObject);

  if (!result.success) {
    return json<ActionData>(
      { errors: result.error.flatten() },
      { status: 400 }
    );
  }

  // Process the validated data
  console.log("Validated data:", result.data);

  try {
    await createNewTask(result.data);
    return json<ActionData>({
      success: true,
      message: "Task created successfully.",
    });
    // return redirect("/dashboard");
  } catch (error) {
    console.error("Error creating task:", error);
    return json(
      { errors: { formErrors: ["Failed to create task. Please try again."] } },
      { status: 500 }
    );
  }
};

export default function NewTask() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Type-safe error handling
  const hasErrors = actionData && "errors" in actionData;
  const errors = hasErrors ? actionData.errors : null;
  const successMessage =
    actionData && actionData && "success" in actionData
      ? actionData.message
      : null;

  // Helper function to get field errors safely
  const getFieldError = (field: string) => {
    if (!errors || !("fieldErrors" in errors)) return null;
    const fieldErrors = errors.fieldErrors as Record<
      string,
      string[] | undefined
    >;
    return fieldErrors[field];
  };

  const getFormView = () => {
    return (
      <Form method="post" className="space-y-4">
        <div
          className="animate-slide-in-left"
          style={{ animationDelay: "0.2s" }}
        >
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 transition-colors duration-200"
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            minLength={3}
            maxLength={50}
            className={`mt-1 block w-full border rounded-md shadow-sm p-2 transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:border-gray-400 transform hover:scale-[1.01] ${
              getFieldError("title") ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {getFieldError("title") && (
            <p className="mt-1 text-sm text-red-600 animate-shake">
              {getFieldError("title")?.[0]}
            </p>
          )}
        </div>

        <div
          className="animate-slide-in-left"
          style={{ animationDelay: "0.4s" }}
        >
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 transition-colors duration-200"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            maxLength={500}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:border-gray-400 transform hover:scale-[1.01] resize-none"
          />
        </div>

        <div
          className="animate-slide-in-left"
          style={{ animationDelay: "0.6s" }}
        >
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 transition-colors duration-200"
          >
            Priority
          </label>
          <select
            name="priority"
            id="priority"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:border-gray-400 transform hover:scale-[1.01]"
            required
          >
            <option value="">Select priority</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>

        <div
          className="animate-slide-in-left"
          style={{ animationDelay: "0.8s" }}
        >
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 transition-colors duration-200"
          >
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            id="dueDate"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:border-gray-400 transform hover:scale-[1.01]"
          />
          {getFieldError("dueDate") && (
            <p className="mt-1 text-sm text-red-600 animate-shake">
              {getFieldError("dueDate")?.[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-4 btn btn-primary w-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-slide-in-up ${
            isSubmitting ? "animate-pulse scale-95" : "hover:-translate-y-1"
          }`}
          style={{ animationDelay: "1s" }}
        >
          <span className="flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>✨ Create Task</>
            )}
          </span>
        </button>
      </Form>
    );
  };

  const getSuccessView = () => {
    return <></>;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 animate-gradient-x">
      <div className="w-full max-w-2xl bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6 transform transition-all duration-500 ease-out animate-fade-in-up hover:shadow-2xl hover:scale-[1.02]">
        {/* Back Navigation */}
        <div className="flex items-center mb-4 animate-slide-in-left">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 group"
          >
            <span className="transform transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center animate-fade-in-down">
          {successMessage || "Create New Task"}
        </h2>

        {errors?.formErrors && (
          <div className="mb-4">
            <ul className="list-disc list-inside text-red-600">
              {errors.formErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {successMessage ? getSuccessView() : getFormView()}
      </div>
    </div>
  );
}
