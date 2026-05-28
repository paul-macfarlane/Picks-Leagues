import { memoryAdapter } from "better-auth/adapters/memory";

import type { AppDeps } from "./app";
import { createApp } from "./app";
import { createAuth } from "./auth/index";

const TEST_AUTH_SECRET = "test-secret-must-be-at-least-32-chars-long";
const TEST_AUTH_URL = "http://localhost:3000";

function buildTestAuth(): AppDeps["auth"] {
  return createAuth({
    database: memoryAdapter({}),
    secret: TEST_AUTH_SECRET,
    baseURL: TEST_AUTH_URL,
  });
}

export function buildTestApp(overrides: AppDeps = {}): ReturnType<typeof createApp> {
  const auth = overrides.auth ?? buildTestAuth();
  const cronSecret = overrides.cronSecret ?? "test-cron-secret";
  return createApp({ ...overrides, auth, cronSecret });
}
