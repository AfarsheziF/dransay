import { useLoaderData, useNavigation } from "@remix-run/react";

import { Task } from "src/db/schema";
import { tasksLoader } from "~/utils/tasks.loaders";
import { healthLoader } from "~/utils/health.loaders";
import { TaskStatus } from "~/utils/tasks.server";
import moment from "moment";
import Layout from "~/components/Layout";

export const loader = async (args: any) => {
  console.log("🏠 Dashboard loader called");

  const tasksResponse = await tasksLoader(args);
  const tasksData =
    tasksResponse instanceof Response
      ? await tasksResponse.json()
      : tasksResponse;
  console.log("🏠 Dashboard - tasksData from loader:", tasksData);

  const healthResponse = await healthLoader(args);
  const healthData =
    healthResponse instanceof Response
      ? await healthResponse.json()
      : healthResponse;
  console.log("🏠 Dashboard - healthData from loader:", healthData);

  return {
    tasks: tasksData,
    health: healthData,
  };
};

export default function Dashboard() {
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  // Extract the data directly from loaderData
  const tasksData: TaskStatus =
    loaderData.tasks && "tasksStatus" in loaderData.tasks
      ? (loaderData.tasks.tasksStatus as TaskStatus)
      : {
          total: 0,
          totalCompleted: 0,
          totalPending: 0,
          totalTasks: [],
          completed: [],
          pending: [],
        };

  const healthData =
    loaderData.health && "health" in loaderData.health
      ? (loaderData.health.health as any)
      : {
          status: "ok",
          timestamp: new Date().toISOString(),
          uptime: 0,
          database: "connected",
        };

  // Dashboard stats data
  const dashboardStats = [
    {
      id: 1,
      title: "Total Tasks",
      value: tasksData.total,
      color: "text-white",
      icon: "📋",
    },
    {
      id: 2,
      title: "Completed",
      value: tasksData.totalCompleted,
      color: "text-green-300",
      icon: "✅",
    },
    {
      id: 3,
      title: "Pending",
      value: tasksData.totalPending,
      color: "text-yellow-300",
      icon: "⏳",
    },
  ];

  // Quick actions data
  const quickActions = [
    {
      id: 1,
      label: "Add New Task",
      icon: "📄",
      type: "primary" as const,
      action: () => (window.location.href = "/tasks/new"),
    },
    {
      id: 2,
      label: "View Tasks",
      icon: "📂",
      type: "secondary" as const,
      action: () => (window.location.href = "/tasks/view"),
    },
    // {
    //   id: 3,
    //   label: "View Categories",
    //   icon: "📁",
    //   type: "secondary" as const,
    //   action: () => console.log("View categories"),
    // },
    // {
    //   id: 4,
    //   label: "View Reports",
    //   icon: "📊",
    //   type: "secondary" as const,
    //   action: () => console.log("View reports"),
    // },
  ];

  // Recent tasks data
  const recentTasks: Task[] = tasksData.totalTasks.slice(0, 5);

  // System status data
  const systemStatus = [
    {
      id: 1,
      service: "Application",
      status: healthData.status === "ok" ? "Healthy" : "Error",
      statusType:
        healthData.status === "ok" ? ("ok" as const) : ("error" as const),
      icon: "🚀",
    },
    {
      id: 2,
      service: "Database",
      status:
        healthData.database === "connected" ? "Connected" : "Disconnected",
      statusType:
        healthData.database === "connected"
          ? ("ok" as const)
          : ("error" as const),
      icon: "�️",
    },
  ];

  const getTasksView = () => {
    return dashboardStats.map((stat) => (
      <div
        key={stat.id}
        className="bg-white bg-opacity-20 rounded-lg p-4 flex-1"
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>{stat.icon}</span>
          {stat.title}
        </h3>
        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
      </div>
    ));
  };

  return (
    <Layout title="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Welcome Card */}
        <div className="card card-glass col-span-full">
          <div className="card-header">
            <h2 className="card-title text-white">Welcome Back! 👋</h2>
            <p className="card-subtitle text-white">
              Here's what's happening with your tasks today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {isLoading ? <div>Loading...</div> : getTasksView()}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card card-solid flex flex-col">
          <h3 className="card-title">Quick Actions</h3>
          <div className="flex flex-col gap-3 mt-4 flex-1">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className={`btn btn-${action.type} w-full flex-1 min-h-[3rem]`}
                onClick={action.action}
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card card-solid">
          <h3 className="card-title">Recent Tasks</h3>
          <div className="space-y-3 mt-4">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-500">
                    {moment(task.dueDate).format("MMMM Do YYYY HH:mm")}
                  </p>
                </div>
                <span>
                  {task.priority === "high" && "🟠"}
                  {task.priority === "medium" && "🟡"}
                  {task.priority === "low" && "🟢"}
                </span>
                <span
                  className={`status-${
                    task.completed ? "completed" : "pending"
                  }`}
                >
                  {task.completed ? "completed" : "pending"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="card card-solid">
          <h3 className="card-title">System Status</h3>
          <div className="space-y-3 mt-4">
            {systemStatus
              .filter((service) => service !== null)
              .map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-600 flex items-center gap-2">
                    <span>{service.icon}</span>
                    {service.service}
                  </span>
                  <span className={`status-${service.statusType}`}>
                    {service.status}
                  </span>
                </div>
              ))}
            <a href="/health" className="btn btn-secondary btn-sm mt-4 w-full">
              View Detailed Health
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
