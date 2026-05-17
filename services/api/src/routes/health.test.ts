import { describe, expect, it } from "vitest";

import { createApp } from "../app";
import type { Clock } from "../lib/clock";

describe("GET /api/health", () => {
  it("returns 200", async () => {
    const app = createApp();
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
  });

  it("returns the documented JSON shape", async () => {
    const app = createApp();
    const res = await app.request("/api/health");
    const body = (await res.json()) as unknown;
    expect(body).toMatchObject({ status: "ok" });
    const time = (body as { time: string }).time;
    expect(typeof time).toBe("string");
    expect(Number.isNaN(Date.parse(time))).toBe(false);
  });

  it("time reflects the injected clock", async () => {
    const fixed = new Date("2025-01-15T12:00:00.000Z");
    const stubClock: Clock = { now: () => fixed };
    const app = createApp({ clock: stubClock });
    const res = await app.request("/api/health");
    const body = (await res.json()) as { status: string; time: string };
    expect(body.time).toBe(fixed.toISOString());
  });
});
