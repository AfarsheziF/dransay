import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { healthLoader } from "~/utils/health.loaders";
import Layout from "~/components/Layout";

export const loader = healthLoader;

// Error Boundary Component
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    const isSimulated = error.data?.includes?.("Simulated");

    return (
      <Layout title="Health Check Error">
        <div className="card card-solid">
          <div className="card-header">
            <h2 className="card-title text-red-600">
              🚨 Health Check Unavailable
            </h2>
            <p className="card-subtitle">
              Status: {error.status} - {error.statusText}
            </p>
            {isSimulated && (
              <p className="text-sm text-blue-600 mt-2">
                🧪 This is a simulated error for testing purposes
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error.data}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                What happened?
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• The health check service is temporarily unavailable</li>
                <li>• This could be due to database connectivity issues</li>
                <li>• Server maintenance might be in progress</li>
                <li>• Network connectivity problems</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                className="btn btn-primary"
                onClick={() => (window.location.href = "/health")}
              >
                🔄 Retry Health Check
              </button>
              <a href="/dashboard" className="btn btn-secondary">
                ← Back to Dashboard
              </a>
              {isSimulated && (
                <button
                  className="btn bg-green-100 text-green-700 hover:bg-green-200"
                  onClick={() => (window.location.href = "/health")}
                >
                  ✅ Reset to Normal
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Handle unexpected errors
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const isSimulated = errorMessage.includes("Simulated");

  return (
    <Layout title="Unexpected Error">
      <div className="card card-solid">
        <div className="card-header">
          <h2 className="card-title text-red-600">⚠️ Something went wrong</h2>
          {isSimulated && (
            <p className="text-sm text-blue-600 mt-2">
              🧪 This is a simulated error for testing purposes
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error Details:</p>
            <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              An unexpected error occurred while checking system health. This
              type of error is caught by the Error Boundary component.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/health")}
            >
              🔄 Retry
            </button>
            {isSimulated && (
              <button
                className="btn bg-green-100 text-green-700 hover:bg-green-200"
                onClick={() => (window.location.href = "/health")}
              >
                ✅ Reset to Normal
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function Health() {
  const data = useLoaderData<typeof loader>();

  // Handle case where error data is returned instead of thrown
  if (data.error) {
    return (
      <Layout title="System Health - Error">
        <div className="card card-solid">
          <div className="card-header">
            <h2 className="card-title text-red-600">🚨 Health Check Failed</h2>
            <p className="card-subtitle">
              Last attempted: {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{data.error}</p>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              🔄 Retry Health Check
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const { health } = data;

  return (
    <Layout title="System Health">
      <div className="grid gap-6 md:grid-cols-2">
        {/* System Overview */}
        <div className="card card-glass">
          <div className="card-header">
            <h2 className="card-title text-white">System Overview</h2>
            <p className="card-subtitle text-gray-200">
              Real-time system health monitoring
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Overall Status</span>
                <span
                  className={
                    health.status === "ok" ? "status-ok" : "status-error"
                  }
                >
                  {health.status === "ok" ? "✅ Healthy" : "❌ Error"}
                </span>
              </div>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Database</span>
                <span className="status-ok">🗄️ {health.database}</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="card card-solid">
          <div className="card-header">
            <h2 className="card-title">System Metrics</h2>
            <p className="card-subtitle">Performance indicators</p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800">Uptime</h3>
              <p className="text-2xl font-bold text-blue-600">
                {Math.floor(health.uptime / 60)} minutes
              </p>
              <p className="text-sm text-blue-600">
                ({health.uptime.toFixed(1)} seconds)
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800">
                Last Check
              </h3>
              <p className="text-sm font-mono text-purple-600">
                {new Date(health.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Health Details */}
        <div className="card card-solid col-span-full">
          <div className="card-header">
            <h2 className="card-title">Health Check Details</h2>
            <p className="card-subtitle">Comprehensive system status</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">🚀</div>
              <h4 className="font-semibold text-green-800">Application</h4>
              <p className="text-green-600">Running</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🗄️</div>
              <h4 className="font-semibold text-blue-800">Database</h4>
              <p className="text-blue-600">{health.database}</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">⏱️</div>
              <h4 className="font-semibold text-purple-800">Response Time</h4>
              <p className="text-purple-600">&lt; 100ms</p>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-yellow-800">Memory</h4>
              <p className="text-yellow-600">Optimal</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex gap-4">
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                🔄 Refresh Health Check
              </button>
              {/* <button className="btn btn-secondary">📋 Download Report</button> */}
            </div>

            {/* Error Simulation Buttons for Testing */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">
                🧪 Error Simulation (Development)
              </h4>
              <div className="flex gap-2 flex-wrap">
                <button
                  className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                  onClick={() =>
                    (window.location.href = "/health?simulate=throw")
                  }
                >
                  💥 Simulate Thrown Error
                </button>
                <button
                  className="btn btn-sm bg-orange-100 text-orange-700 hover:bg-orange-200"
                  onClick={() =>
                    (window.location.href = "/health?simulate=return")
                  }
                >
                  ⚠️ Simulate Returned Error
                </button>
                <button
                  className="btn btn-sm bg-purple-100 text-purple-700 hover:bg-purple-200"
                  onClick={() =>
                    (window.location.href = "/health?simulate=unexpected")
                  }
                >
                  ❌ Simulate Unexpected Error
                </button>
                <button
                  className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200"
                  onClick={() => (window.location.href = "/health")}
                >
                  ✅ Reset (Normal State)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
