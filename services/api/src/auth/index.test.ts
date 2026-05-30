import { memoryAdapter } from "better-auth/adapters/memory";
import { describe, expect, it, vi } from "vitest";

import { createAuth } from "./index";

const TEST_DB = {};
const testDatabase = memoryAdapter(TEST_DB);

describe("createAuth", () => {
  it("throws when BETTER_AUTH_SECRET is missing and no override", () => {
    expect(() =>
      createAuth({
        database: testDatabase,
        secret: "",
        baseURL: "http://test.local",
      }),
    ).toThrow("BETTER_AUTH_SECRET is not set");
  });

  it("throws when BETTER_AUTH_URL is missing and no env fallback", () => {
    vi.stubEnv("BETTER_AUTH_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    try {
      expect(() =>
        createAuth({
          database: testDatabase,
          secret: "test-secret-must-be-at-least-32-chars-long",
          baseURL: "",
        }),
      ).toThrow("BETTER_AUTH_URL is not set");
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("constructs successfully when required env overrides are provided", () => {
    expect(() =>
      createAuth({
        database: testDatabase,
        secret: "test-secret-must-be-at-least-32-chars-long",
        baseURL: "http://test.local",
      }),
    ).not.toThrow();
  });

  it("omits Google provider when GOOGLE_CLIENT_ID is absent", () => {
    const instance = createAuth({
      database: testDatabase,
      secret: "test-secret-must-be-at-least-32-chars-long",
      baseURL: "http://test.local",
      googleClientId: undefined,
      googleClientSecret: undefined,
    });
    const providers = instance.options.socialProviders ?? {};
    expect(providers).not.toHaveProperty("google");
  });

  it("omits Discord provider when DISCORD_CLIENT_ID is absent", () => {
    const instance = createAuth({
      database: testDatabase,
      secret: "test-secret-must-be-at-least-32-chars-long",
      baseURL: "http://test.local",
      discordClientId: undefined,
      discordClientSecret: undefined,
    });
    const providers = instance.options.socialProviders ?? {};
    expect(providers).not.toHaveProperty("discord");
  });

  it("includes Google provider when credentials are present", () => {
    const instance = createAuth({
      database: testDatabase,
      secret: "test-secret-must-be-at-least-32-chars-long",
      baseURL: "http://test.local",
      googleClientId: "google-client-id",
      googleClientSecret: "google-client-secret",
    });
    const providers = instance.options.socialProviders ?? {};
    expect(providers).toHaveProperty("google");
  });

  it("includes Discord provider when credentials are present", () => {
    const instance = createAuth({
      database: testDatabase,
      secret: "test-secret-must-be-at-least-32-chars-long",
      baseURL: "http://test.local",
      discordClientId: "discord-client-id",
      discordClientSecret: "discord-client-secret",
    });
    const providers = instance.options.socialProviders ?? {};
    expect(providers).toHaveProperty("discord");
  });
});
