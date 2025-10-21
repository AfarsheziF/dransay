import {
  useActionData,
  useLoaderData,
  useNavigation,
  Link,
} from "@remix-run/react";
import { tasksAction, tasksLoader } from "~/utils/tasks.loaders";

export const loader = tasksLoader;
export const action = tasksAction;

export default function TasksViewer() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  // Use action data if available (from refresh button), otherwise use loader data (from page load)
  const currentData = actionData || loaderData;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading tasks...</span>
        </div>
      );
    }

    if (!currentData) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            No Data Yet
          </h2>
          <p className="text-yellow-700">
            Something went wrong loading the data.
          </p>
          <form method="post" className="mt-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              📋 Retry Loading Tasks
            </button>
          </form>
        </div>
      );
    }

    if ("errors" in currentData) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h2>
          <p className="text-red-700">{currentData.errors}</p>
          <form method="post" className="mt-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Retry
            </button>
          </form>
        </div>
      );
    }

    if ("tasksStatus" in currentData) {
      const { tasksStatus } = currentData;
      return (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800">
                📋 Total Tasks
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {tasksStatus.total}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800">
                ✅ Completed
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {tasksStatus.completed.length}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-800">
                ⏳ Pending
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {tasksStatus.pending.length}
              </p>
            </div>
          </div>

          {/* Tasks Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Tasks */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ⏳ Pending Tasks
              </h3>
              {tasksStatus.pending.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No pending tasks
                </p>
              ) : (
                <div className="space-y-3">
                  {tasksStatus.pending.map((task) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded p-3"
                    >
                      <h4 className="font-medium text-gray-900">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            task.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tasks */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ✅ Completed Tasks
              </h3>
              {tasksStatus.completed.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No completed tasks
                </p>
              ) : (
                <div className="space-y-3">
                  {tasksStatus.completed.map((task) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded p-3 opacity-75"
                    >
                      <h4 className="font-medium text-gray-900 line-through">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <div className="text-center">
            <form method="post">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                🔄 Refresh Tasks
              </button>
            </form>
          </div>

          {/* Debug Info */}
          <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-gray-700">
              🐛 Debug Information
            </summary>
            <div className="mt-2 space-y-2">
              <div>
                <strong>Current Data Source:</strong>{" "}
                {actionData ? "Action (Refresh Button)" : "Loader (Page Load)"}
              </div>
              <div>
                <strong>Loader Data:</strong>
                <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded mt-1">
                  {JSON.stringify(loaderData, null, 2)}
                </pre>
              </div>
              {actionData && (
                <div>
                  <strong>Action Data:</strong>
                  <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded mt-1">
                    {JSON.stringify(actionData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        </div>
      );
    }

    return <div>Unknown state</div>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Navigation */}
      <div className="flex items-center mb-6">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
        >
          <span className="transform transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">📋 Tasks Viewer</h1>
      {renderContent()}
    </div>
  );
}
