import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "production" ? "/simbrief-printer/" : "/",
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
}));
