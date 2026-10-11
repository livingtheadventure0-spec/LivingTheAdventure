import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  base: "/",
  // This proxy is only for the local development server.
  // It will not be used in the production build on Vercel.
  // Vercel uses the `vercel.json` file for production routing.
  server: {
    proxy: {
      "/api": {
        // Your backend server running locally
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
