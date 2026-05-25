import { describe, expect, it } from "vitest";

import { createQueryClient } from "./query-client";

describe("createQueryClient", () => {
  it("default staleTime is 30000", () => {
    const client = createQueryClient();
    expect(client.getDefaultOptions().queries?.staleTime).toBe(30_000);
  });

  it("default query retry is 2", () => {
    const client = createQueryClient();
    expect(client.getDefaultOptions().queries?.retry).toBe(2);
  });

  it("default mutation retry is 0", () => {
    const client = createQueryClient();
    // TanStack default is 0; we leave mutations untouched — assert it is not set to a truthy value
    expect(client.getDefaultOptions().mutations?.retry ?? 0).toBe(0);
  });
});
