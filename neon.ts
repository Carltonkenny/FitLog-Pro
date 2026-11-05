import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  preview: {
    realtime: true,
  },
  auth: true,
  functions: {
    api: {
      name: "FitLog API",
      source: "./web/functions/api.ts",
      env: {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
        GEMINI_MODEL: process.env.GEMINI_MODEL ?? "",
        GEMINI_FALLBACK_MODEL: process.env.GEMINI_FALLBACK_MODEL ?? "",
        NEON_REALTIME_SECRET: process.env.NEON_REALTIME_SECRET ?? "",
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ?? "https://web-tau-smoky-63.vercel.app,http://localhost:5173",
      },
    },
  },
  branch: (branch) => {
    if (branch.isDefault) {
      return {};
    }
    if (!branch.exists) {
      return { ttl: "7d" };
    }
    return {};
  },
});
