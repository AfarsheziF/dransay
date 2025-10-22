import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";

export const meta: MetaFunction = () => [
  { charset: "utf-8" },
  { title: "Task Manager - Interview Prep" },
  { name: "viewport", content: "width=device-width,initial-scale=1" },
];

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "/main.css",
  },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css",
  },
];

export default function App() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {isHydrated ? (
          // Client-side hydrated content
          <>
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </>
        ) : (
          // Server-side rendered content (fallback)
          <>
            <div id="root-loading">
              <div className="min-h-screen bg-gradient flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white font-medium">
                    Loading Task Manager...
                  </p>
                </div>
              </div>
            </div>
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </>
        )}
      </body>
    </html>
  );
}
