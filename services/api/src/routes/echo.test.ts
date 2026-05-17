import { describe, expect, it } from "vitest";

import { createApp } from "../app";

const VALID_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "x-echo-token": "test-token",
};

function post(
  url: string,
  body: unknown,
  headers: Record<string, string> = VALID_HEADERS,
): ReturnType<ReturnType<typeof createApp>["request"]> {
  return createApp().request(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/echo", () => {
  it("valid request returns 200 and echoes message", async () => {
    const res = await post("/api/echo", { message: "hello" });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      message: string;
      repeated: string[];
      shout: boolean;
    };
    expect(body.message).toBe("hello");
    expect(body.repeated).toHaveLength(1);
    expect(body.repeated[0]).toBe("hello");
    expect(body.shout).toBe(false);
  });

  it("query repeat is honored", async () => {
    const res = await post("/api/echo?repeat=3", { message: "hi" });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { repeated: string[] };
    expect(body.repeated).toHaveLength(3);
  });

  it("invalid body returns 400 with structured error", async () => {
    const res = await post("/api/echo", {});
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: string;
      issues: { path: string }[];
    };
    expect(body.error).toBe("ValidationError");
    expect(body.issues.length).toBeGreaterThan(0);
    expect(body.issues.some((issue) => issue.path.startsWith("body."))).toBe(
      true,
    );
  });

  it("missing required header returns 400 with structured error", async () => {
    const res = await post(
      "/api/echo",
      { message: "hello" },
      { "Content-Type": "application/json" },
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: string;
      issues: { path: string }[];
    };
    expect(body.error).toBe("ValidationError");
    expect(body.issues.length).toBeGreaterThan(0);
    expect(body.issues.some((issue) => issue.path.startsWith("header."))).toBe(
      true,
    );
  });

  it("out-of-range query returns 400 with structured error", async () => {
    const res = await post("/api/echo?repeat=99", { message: "hello" });
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: string;
      issues: { path: string }[];
    };
    expect(body.error).toBe("ValidationError");
    expect(body.issues.length).toBeGreaterThan(0);
    expect(body.issues.some((issue) => issue.path.startsWith("query."))).toBe(
      true,
    );
  });

  it("error body shape matches the documented contract", async () => {
    const res = await post("/api/echo", {});
    expect(res.status).toBe(400);
    const body = (await res.json()) as unknown;
    const typedBody = body as { error: string; issues: unknown[] };
    expect(Object.keys(typedBody)).toEqual(
      expect.arrayContaining(["error", "issues"]),
    );
    expect(typedBody.error).toBe("ValidationError");
    expect(Array.isArray(typedBody.issues)).toBe(true);
    expect(typedBody.issues.length).toBeGreaterThan(0);
    for (const issue of typedBody.issues) {
      expect(issue).toMatchObject({
        path: expect.any(String),
        code: expect.any(String),
        message: expect.any(String),
      });
    }
  });
});
