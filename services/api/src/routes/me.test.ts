import { describe, expect, it, vi } from "vitest";

import type { AppDeps } from "../app";
import { buildTestApp } from "../test-helpers";

describe("GET /api/me", () => {
  it("returns 401 when no session cookie is present", async () => {
    const app = buildTestApp();
    const res = await app.request("/api/me");
    expect(res.status).toBe(401);
    const body = (await res.json()) as unknown;
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 with projected user fields when session is valid", async () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      image: null,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockSession = {
      id: "session-1",
      userId: "user-1",
      token: "mock-token",
      expiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: null,
      userAgent: null,
    };

    const mockAuth = {
      handler: vi.fn(),
      api: {
        getSession: vi.fn().mockResolvedValue({
          user: mockUser,
          session: mockSession,
        }),
      },
      options: {},
      $Infer: {} as never,
      $ERROR_CODES: {} as never,
      $context: Promise.resolve({} as never),
    } as unknown as AppDeps["auth"];

    const app = buildTestApp({ auth: mockAuth });
    const res = await app.request("/api/me");

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      id: string;
      email: string;
      name: string;
      image: string | null;
      emailVerified: boolean;
    };
    expect(body.id).toBe("user-1");
    expect(body.email).toBe("test@example.com");
    expect(body.name).toBe("Test User");
    expect(body.image).toBeNull();
    expect(body.emailVerified).toBe(true);
    expect(Object.keys(body)).toEqual([
      "id",
      "email",
      "name",
      "image",
      "emailVerified",
    ]);
  });

  it("response shape does not include extra Better Auth fields", async () => {
    const mockUser = {
      id: "user-2",
      email: "user2@example.com",
      name: "User Two",
      image: "https://example.com/avatar.jpg",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      someInternalField: "should-not-leak",
    };

    const mockAuth = {
      handler: vi.fn(),
      api: {
        getSession: vi.fn().mockResolvedValue({
          user: mockUser,
          session: {
            id: "s-2",
            userId: "user-2",
            token: "t",
            expiresAt: new Date(),
          },
        }),
      },
      options: {},
      $Infer: {} as never,
      $ERROR_CODES: {} as never,
      $context: Promise.resolve({} as never),
    } as unknown as AppDeps["auth"];

    const app = buildTestApp({ auth: mockAuth });
    const res = await app.request("/api/me");

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).not.toHaveProperty("someInternalField");
    expect(body).not.toHaveProperty("createdAt");
    expect(body).not.toHaveProperty("updatedAt");
    expect(body.image).toBe("https://example.com/avatar.jpg");
  });
});
