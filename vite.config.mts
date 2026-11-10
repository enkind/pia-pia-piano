import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * Builds the widget into a single self-contained HTML file at
 * `widget/dist/index.html`, which `app/mcp/route.ts` serves as the `ui://`
 * resource. Host sandboxes restrict which origins a widget may load from, so a
 * bundle that fetches nothing works everywhere.
 */
export default defineConfig({
  root: "widget",
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
