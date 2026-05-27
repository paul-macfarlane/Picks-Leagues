import { describe, expect, it } from "vitest";

import { getAllowedOrigins } from "./cors";

describe("getAllowedOrigins", () => {
  it("allows http://localhost:5173 (Vite dev server)", () => {
    const matcher = getAllowedOrigins();
    expect(matcher("http://localhost:5173")).toBe("http://localhost:5173");
  });

  it("allows http://localhost:3000 (direct API)", () => {
    const matcher = getAllowedOrigins();
    expect(matcher("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("allows the BETTER_AUTH_URL value when provided explicitly", () => {
    const matcher = getAllowedOrigins("https://picksleagues.app");
    expect(matcher("https://picksleagues.app")).toBe(
      "https://picksleagues.app",
    );
  });

  it("allows the BETTER_AUTH_URL value from the environment", () => {
    const original = process.env["BETTER_AUTH_URL"];
    process.env["BETTER_AUTH_URL"] = "https://example-deploy.vercel.app";
    try {
      const matcher = getAllowedOrigins();
      expect(matcher("https://example-deploy.vercel.app")).toBe(
        "https://example-deploy.vercel.app",
      );
    } finally {
      process.env["BETTER_AUTH_URL"] = original;
    }
  });

  it("allows a Vercel preview URL matching the picksleagues pattern", () => {
    const matcher = getAllowedOrigins();
    expect(matcher("https://picksleagues-abc123.vercel.app")).toBe(
      "https://picksleagues-abc123.vercel.app",
    );
  });

  it("allows a Vercel preview URL with hyphens in the slug", () => {
    const matcher = getAllowedOrigins();
    expect(matcher("https://picksleagues-my-branch-xyz.vercel.app")).toBe(
      "https://picksleagues-my-branch-xyz.vercel.app",
    );
  });

  it("rejects an unrelated origin", () => {
    const matcher = getAllowedOrigins();
    expect(matcher("https://evil.example.com")).toBeNull();
  });

  it("rejects a Vercel URL with a non-matching project slug", () => {
    const matcher = getAllowedOrigins();
    expect(matcher("https://other-app-xyz.vercel.app")).toBeNull();
  });

  it("returns null for an empty origin string without throwing", () => {
    const matcher = getAllowedOrigins();
    expect(matcher("")).toBeNull();
  });
});
