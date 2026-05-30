import { describe, expect, it } from "vitest";

import { resolveAuthBaseURL } from "./resolve-auth-base-url";

describe("resolveAuthBaseURL", () => {
  it("explicit deps.baseURL wins over everything", () => {
    expect(
      resolveAuthBaseURL(
        { baseURL: "http://explicit.local" },
        {
          BETTER_AUTH_URL: "https://env-origin.example.com",
          VERCEL_URL: "raw-vercel-host.vercel.app",
        },
      ),
    ).toBe("http://explicit.local");
  });

  it("BETTER_AUTH_URL env used when no deps override", () => {
    expect(
      resolveAuthBaseURL(
        {},
        { BETTER_AUTH_URL: "https://preview.example.com" },
      ),
    ).toBe("https://preview.example.com");
  });

  it("falls back to https://${VERCEL_URL} when BETTER_AUTH_URL unset and VERCEL_URL set", () => {
    expect(
      resolveAuthBaseURL(
        {},
        { VERCEL_URL: "my-deploy-abc123.vercel.app" },
      ),
    ).toBe("https://my-deploy-abc123.vercel.app");
  });

  it("fixed preview BETTER_AUTH_URL wins over VERCEL_URL when both set", () => {
    expect(
      resolveAuthBaseURL(
        {},
        {
          BETTER_AUTH_URL: "https://stable-preview.example.com",
          VERCEL_URL: "per-deploy-random-host.vercel.app",
        },
      ),
    ).toBe("https://stable-preview.example.com");
  });

  it("VERCEL_URL already has https:// scheme — does not double-prepend", () => {
    expect(
      resolveAuthBaseURL(
        {},
        { VERCEL_URL: "https://already-schemed.vercel.app" },
      ),
    ).toBe("https://already-schemed.vercel.app");
  });

  it("VERCEL_URL with http:// scheme — preserves it as-is", () => {
    expect(
      resolveAuthBaseURL(
        {},
        { VERCEL_URL: "http://localhost.vercel.app" },
      ),
    ).toBe("http://localhost.vercel.app");
  });

  it("throws a clear error when none set", () => {
    expect(() => resolveAuthBaseURL({}, {})).toThrow(
      "BETTER_AUTH_URL is not set",
    );
  });
});
