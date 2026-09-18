import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Addy SPA lives in app/ and builds into public/ next to the existing
// landing page. emptyOutDir MUST stay false: public/index.html is the
// hand-written marketing page and is not ours to delete.
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
