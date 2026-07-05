import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Served from the repository path on GitHub Pages; CI sets VITE_BASE.
  base: process.env.VITE_BASE || "/",
  resolve: {
    // The package is a file: link to the repo root. Keeping the node_modules
    // path lets Vite's CommonJS interop treat it like a normal dependency.
    preserveSymlinks: true,
  },
  optimizeDeps: {
    include: ["@derrick63/rwanda-admin-hierarchy"],
  },
});
