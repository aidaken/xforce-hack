import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Addy SPA lives in app/ and builds into public/ and serves at both /
// and /app. emptyOutDir MUST stay false: public/study-activities/ is
// Charlotte's checked-in static app, not build output, and a true here would
// delete it on every build.
export default defineConfig({
  root: "app",
  plugins: [react()],
  build: {
    outDir: resolve(import.meta.dirname, "public"),
    emptyOutDir: false,
    rollupOptions: {
      // Named app.html so the build lands on public/app.html, the route
      // server/index.js and vercel.json already rewrite /app to.
      input: resolve(import.meta.dirname, "app/app.html"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
      "/study-activities": "http://localhost:3000",
      "/addy-logo.png": "http://localhost:3000",
    },
  },
});
