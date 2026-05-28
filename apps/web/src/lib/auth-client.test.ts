import { describe, expect, it } from "vitest";

import { authClient, signIn, signOut } from "./auth-client";

describe("auth-client", () => {
  it("exports authClient with expected methods", () => {
    expect(authClient).toBeDefined();
    // signIn is callable and exposes .social for OAuth flows
    expect(typeof signIn).toBe("function");
    expect(typeof signIn.social).toBe("function");
    expect(typeof authClient.signOut).toBe("function");
  });

  it("exports signIn and signOut helpers that are callable", () => {
    expect(signOut).toBeDefined();
    expect(typeof signOut).toBe("function");
  });
});
