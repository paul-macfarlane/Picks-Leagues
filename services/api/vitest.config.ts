import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      BETTER_AUTH_SECRET: "test-secret-must-be-at-least-32-chars-long",
      BETTER_AUTH_URL: "http://localhost:3000",
      CRON_SECRET: "test-cron-secret",
    },
  },
});
