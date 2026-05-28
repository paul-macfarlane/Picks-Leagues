import { describe, expect, it } from "vitest";

import { sanitizeRedirect } from "./redirect";

describe("sanitizeRedirect", () => {
  it("/foo → /foo", () => {
    expect(sanitizeRedirect("/foo")).toBe("/foo");
  });

  it("/foo?bar=baz → kept", () => {
    expect(sanitizeRedirect("/foo?bar=baz")).toBe("/foo?bar=baz");
  });

  it("//evil.com/x → undefined", () => {
    expect(sanitizeRedirect("//evil.com/x")).toBeUndefined();
  });

  it("https://evil.com → undefined", () => {
    expect(sanitizeRedirect("https://evil.com")).toBeUndefined();
  });

  it("javascript:alert(1) → undefined", () => {
    expect(sanitizeRedirect("javascript:alert(1)")).toBeUndefined();
  });

  it("empty string → undefined", () => {
    expect(sanitizeRedirect("")).toBeUndefined();
  });

  it("undefined → undefined", () => {
    expect(sanitizeRedirect(undefined)).toBeUndefined();
  });
});
