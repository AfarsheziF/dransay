import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vercelPreset } from "@vercel/remix/vite";

installGlobals();

// Suppress CJS deprecation warning
const originalConsoleWarn = console.warn;
console.warn = function (...args: any[]) {
  if (args[0]?.includes?.("The CJS build of Vite's Node API is deprecated")) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

export default defineConfig({
  plugins: [
    remix({
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
  ],
});
