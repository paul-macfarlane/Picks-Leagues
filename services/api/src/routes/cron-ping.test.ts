import { describe, expect, it } from "vitest";

import { createApp } from "../app";
import type { Clock } from "../lib/clock";

const TEST_SECRET = "cron-ping-test-secret";

describe("GET /api/cron/ping", () => {
  it("no auth header → 401", async () => {
    const app = createApp({ cronSecret: TEST_SECRET });
    const res = await app.request("/api/cron/ping");
    expect(res.status).toBe(401);
    const body = (await res.json()) as unknown;
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("wrong bearer → 401", async () => {
    const app = createApp({ cronSecret: TEST_SECRET });
    const res = await app.request("/api/cron/ping", {
      headers: { Authorization: "Bearer wrong-secret" },
    });
    expect(res.status).toBe(401);
    const body = (await res.json()) as unknown;
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("correct bearer → 200 with status ok and ISO timestamp", async () => {
    const app = createApp({ cronSecret: TEST_SECRET });
    const res = await app.request("/api/cron/ping", {
      headers: { Authorization: `Bearer ${TEST_SECRET}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; time: string };
    expect(body.status).toBe("ok");
    expect(typeof body.time).toBe("string");
    expect(Number.isNaN(Date.parse(body.time))).toBe(false);
  });

  it("correct bearer reflects injected clock", async () => {
    const fixed = new Date("2025-06-01T00:00:00.000Z");
    const stubClock: Clock = { now: () => fixed };
    const app = createApp({ clock: stubClock, cronSecret: TEST_SECRET });
    const res = await app.request("/api/cron/ping", {
      headers: { Authorization: `Bearer ${TEST_SECRET}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; time: string };
    expect(body.time).toBe(fixed.toISOString());
  });
});
