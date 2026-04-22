import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const api = env.VITE_API_URL || "http://localhost:4000";
  const allowedHosts = (env.VITE_ALLOWED_HOSTS || "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return {
    plugins: [react()],
    server: {
      port: 5173,
      allowedHosts: allowedHosts.length ? allowedHosts : true,
      proxy: {
        "/api": {
          target: api,
          changeOrigin: true,
        },
      },
    },
  };
});
