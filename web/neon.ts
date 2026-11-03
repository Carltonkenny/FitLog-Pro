import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  preview: {
    realtime: true,
  },
  auth: true,
  // aiGateway needs a paid Neon plan. The coach calls Gemini from the api function instead.
  functions: {
    api: {
      name: "FitLog API",
      source: "./functions/api.ts",
      // Secrets are read from your shell or from `neon deploy --env .env.production`. They are never committed.
      env: {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
        GEMINI_MODEL: process.env.GEMINI_MODEL ?? "",
        GEMINI_FALLBACK_MODEL: process.env.GEMINI_FALLBACK_MODEL ?? "",
        // Comma-separated production origins allowed to call the API, e.g. https://fitlog.netlify.app
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ?? "",
      },
    },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      return {};
    }
    if (!branch.exists) {
      // New non-default branches auto-expire
      return { ttl: "7d" };
    }
    return {};
  },
});
