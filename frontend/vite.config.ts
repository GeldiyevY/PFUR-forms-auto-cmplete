import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "../templates",
    emptyOutDir: false,
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
});
