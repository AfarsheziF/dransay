import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  // Server-Sent Events endpoint for real-time updates
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const encoder = new TextEncoder();

      const sendEvent = (data: any, event?: string) => {
        const message = `${
          event ? `event: ${event}\n` : ""
        }data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial data
      sendEvent({
        type: "connected",
        timestamp: new Date().toISOString(),
        message: "Connected to real-time updates",
      });

      // Simulate real-time task updates
      const interval = setInterval(() => {
        const taskUpdate = {
          type: "task_update",
          timestamp: new Date().toISOString(),
          data: {
            totalTasks: Math.floor(Math.random() * 20) + 5,
            completedTasks: Math.floor(Math.random() * 15) + 2,
            recentActivity: `Task ${Math.floor(Math.random() * 100)} updated`,
          },
        };

        sendEvent(taskUpdate, "task-update");
      }, 8000); // Send updates every 8 seconds

      // Cleanup when client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
