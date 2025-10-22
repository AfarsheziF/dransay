import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vercelPreset } from "@vercel/remix/vite";
import { routes } from "remix/config";

// installGlobals();
// installGlobals({ nativeFetch: true });

// export default defineConfig({
//   plugins: [
//     remix({
//       presets: [vercelPreset()],
//     }),
//     tsconfigPaths(),
//   ],
// });

export default defineConfig({
  plugins: [
    // remixDevTools(),
    remix({ routes, presets: [vercelPreset()] }),
    tsconfigPaths(),
    // devServer({
    //   exclude: [/^\/(resources)\/.+/],
    // }),
    // iconsSpritesheet({
    //   inputDir: "./resources/icons",
    //   outputDir: "./app/library/icon/icons",
    //   withTypes: true,
    //   fileName: "icon.svg",
    // }),
  ],
  build: {
    target: "esnext",
  },
  // define: {
  //   POSTHOG_API_KEY: JSON.stringify(process.env.POSTHOG_API_KEY),
  //   POSTHOG_API_ENDPOINT: JSON.stringify(process.env.POSTHOG_API_ENDPOINT),
  // },

  server: {
    open: true,
    port: 3000,
  },
});

// export default defineConfig({
//   plugins: [
//     remix({
//       presets: [vercelPreset()],
//       ignoredRouteFiles: ["**/.*"],
//       future: {
//         v3_fetcherPersist: true,
//         v3_relativeSplatPath: true,
//         v3_throwAbortReason: true,
//         v3_lazyRouteDiscovery: true,
//         v3_singleFetch: true,
//         v3_routeConfig: true,
//       },
//     }),
//     tsconfigPaths(),
//   ],
//   build: {
//     assetsInlineLimit: 0,
//   },
// });
