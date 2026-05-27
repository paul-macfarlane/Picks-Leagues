import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";

import { createCronAuth } from "./cron-auth";

const TEST_SECRET = "test-cron-secret-abc123";

function buildApp(secret: string = TEST_SECRET): Hono {
  const app = new Hono();
  app.use("/*", createCronAuth({ secret }));
  app.get("/ping", (c) => c.json({ ok: true }, 200));
  return app;
}

describe("createCronAuth middleware", () => {
  it("missing Authorization header → 401", async () => {
    const app = buildApp();
    const res = await app.request("/ping");
    expect(res.status).toBe(401);
    const body = (await res.json()) as unknown;
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("non-Bearer scheme (Basic) → 401", async () => {
    const app = buildApp();
    const res = await app.request("/ping", {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
    });
    expect(res.status).toBe(401);
    const body = (await res.json()) as unknown;
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("Bearer with wrong secret → 401", async () => {
    const app = buildApp();
    const res = await app.request("/ping", {
      headers: { Authorization: "Bearer wrong-secret-xyz" },
    });
    expect(res.status).toBe(401);
    const body = (await res.json()) as unknown;
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("Bearer token of different byte length → 401 (length guard before timingSafeEqual)", async () => {
    const app = buildApp();
    const shortToken = "short";
    const res = await app.request("/ping", {
      headers: { Authorization: `Bearer ${shortToken}` },
    });
    expect(res.status).toBe(401);
    const body = (await res.json()) as unknown;
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("Bearer with empty token → 401", async () => {
    const app = buildApp();
    const res = await app.request("/ping", {
      headers: { Authorization: "Bearer " },
    });
    expect(res.status).toBe(401);
    const body = (await res.json()) as unknown;
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("Bearer with correct secret → next() called, 200 reached", async () => {
    const app = buildApp();
    const res = await app.request("/ping", {
      headers: { Authorization: `Bearer ${TEST_SECRET}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown;
    expect(body).toEqual({ ok: true });
  });

  it("factory throws when CRON_SECRET env missing and no explicit secret", () => {
    vi.stubEnv("CRON_SECRET", "");
    expect(() => createCronAuth()).toThrow("CRON_SECRET");
    vi.unstubAllEnvs();
  });
});
