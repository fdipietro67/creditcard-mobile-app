import { existsSync, readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { viteSingleFile } from "vite-plugin-singlefile";

const STANDALONE_OUT = "standalone-dist";
const DECK_OUT = "deck-dist";

/** Ship the single-file builds (built first, see `npm run build`): /standalone.html and /euronet-deck.html. */
function includeSingleFiles(): Plugin {
  const files = [
    { from: `${STANDALONE_OUT}/standalone.html`, to: "standalone.html" },
    { from: `${DECK_OUT}/deck.html`, to: "euronet-deck.html" },
  ];
  return {
    name: "include-single-files",
    apply: "build",
    generateBundle() {
      for (const f of files) {
        if (!existsSync(f.from)) {
          this.warn(`${f.to} missing: run \`npm run build\` (not \`vite build\`) to include it`);
          continue;
        }
        this.emitFile({ type: "asset", fileName: f.to, source: readFileSync(f.from, "utf8") });
      }
    },
  };
}

/** The offline deck packs the single-file app, base64-encoded (it contains </script>). */
function offlineApp(): Plugin {
  const id = "virtual:offline-app";
  return {
    name: "offline-app",
    resolveId: (s) => (s === id ? "\0" + id : null),
    load(s) {
      if (s !== "\0" + id) return null;
      const f = `${STANDALONE_OUT}/standalone.html`;
      if (!existsSync(f)) {
        this.warn("standalone.html missing: the offline deck's live demo slides will be empty");
        return 'export default "";';
      }
      return `export default ${JSON.stringify(readFileSync(f).toString("base64"))};`;
    },
  };
}

export default defineConfig(({ mode }) => {
  if (mode === "deck") {
    return {
      plugins: [react(), offlineApp(), viteSingleFile()],
      build: {
        outDir: DECK_OUT,
        emptyOutDir: true,
        rollupOptions: { input: "deck.html" },
      },
    };
  }

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
      includeSingleFiles(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: false,
        includeAssets: ["favicon.svg", "apple-touch-icon.png"],
        manifest: {
          name: "Card App Demo",
          short_name: "Card Demo",
          description: "Illustrative cardholder app demo: statements, payments, rewards, card controls and BNPL.",
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
          navigateFallbackDenylist: [/^\/api\//, /^\/standalone\.html$/, /^\/euronet-deck\.html$/],
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
