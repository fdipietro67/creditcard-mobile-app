import { existsSync, readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { viteSingleFile } from "vite-plugin-singlefile";

const STANDALONE_OUT = ".standalone";

/** Ship the single-file build (built first, see `npm run build`) as /standalone.html. */
function includeStandalone(): Plugin {
  return {
    name: "include-standalone",
    apply: "build",
    generateBundle() {
      const f = `${STANDALONE_OUT}/standalone.html`;
      if (!existsSync(f)) {
        this.warn("standalone.html missing: run `npm run build` (not `vite build`) to include the offline file");
        return;
      }
      this.emitFile({ type: "asset", fileName: "standalone.html", source: readFileSync(f, "utf8") });
    },
  };
}

export default defineConfig(({ mode }) => {
  if (mode === "standalone") {
    return {
      plugins: [react(), tailwindcss(), viteSingleFile()],
      build: {
        outDir: STANDALONE_OUT,
        emptyOutDir: true,
        rollupOptions: { input: "standalone.html" },
      },
    };
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      includeStandalone(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: false,
        includeAssets: ["favicon.svg", "apple-touch-icon.png"],
        manifest: {
          name: "BNPL Card Demo",
          short_name: "BNPL Demo",
          description: "Illustrative Buy Now, Pay Later cardholder app demo.",
          theme_color: "#F4F6FB",
          background_color: "#F4F6FB",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          icons: [
            { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
            { src: "pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,woff2,webmanifest}"],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//, /^\/standalone\.html$/],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // Branded short-link configs: fresh when online, cached copy when the wifi drops.
              urlPattern: ({ url }) => url.pathname.startsWith("/api/c/"),
              handler: "NetworkFirst",
              method: "GET",
              options: {
                cacheName: "demo-configs",
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 },
                cacheableResponse: { statuses: [200] },
              },
            },
          ],
        },
      }),
    ],
    server: { host: true },
  };
});
