import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The API owns the root namespace; these prefixes are proxied to it in dev so
// the SPA can call relative paths (same-origin) and the httpOnly refresh cookie
// flows without CORS. Keep in sync with the API's route tags.
const API_PREFIXES = [
  "/register",
  "/login",
  "/auth",
  "/users",
  "/events",
  "/registrations",
  "/notification-jobs",
  "/stats",
  "/health",
  "/ready",
];

const API_TARGET =
  process.env.API_PROXY_TARGET ||
  process.env.VITE_API_URL ||
  "http://localhost:8000";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Served behind Traefik under /hefest-frontend/ (the API owns the root
  // namespace), so every asset URL must carry that prefix.
  base: "/hefest-frontend/",
  server: {
    proxy: Object.fromEntries(
      API_PREFIXES.map((prefix) => [
        prefix,
        { target: API_TARGET, changeOrigin: true },
      ]),
    ),
  },
});
