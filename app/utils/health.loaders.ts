// Server-only utility for health checks
import { json, LoaderFunction } from "@remix-run/node";
import { getHealthStatus } from "./health.server";

export const healthLoader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const simulateError = url.searchParams.get("simulate");

  // Simulate different error types for testing
  if (simulateError === "throw") {
    throw new Response("Simulated health check service unavailable", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }

  if (simulateError === "return") {
    return json(
      {
        health: null,
        error: "Simulated health check failure",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  if (simulateError === "unexpected") {
    throw new Error("Simulated unexpected error for testing");
  }

  try {
    const health = await getHealthStatus();
    return json({ health });
  } catch (error) {
    console.error("Health check failed:", error);

    throw new Response("Health check service unavailable", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
};
