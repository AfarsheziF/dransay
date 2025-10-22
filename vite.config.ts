import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vercelPreset } from "@vercel/remix/vite";

installGlobals();
// installGlobals({ nativeFetch: true });

export default defineConfig({
  plugins: [
    remix({
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
  ],
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
