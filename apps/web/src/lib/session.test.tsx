import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, act, screen } from "@testing-library/react";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  apiClient: {
    GET: vi.fn(),
  },
}));

vi.mock("@/lib/auth-client", () => ({
  signOut: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api";
import { signOut as authSignOut } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { sessionQueryOptions, useSignOut } from "./session";

const mockGet = vi.mocked(apiClient.GET);
const mockSignOut = vi.mocked(authSignOut);
const mockUseNavigate = vi.mocked(useNavigate);

function makeClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe("sessionQueryOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("200 with user payload → returns SessionUser shape", async () => {
    const user = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      image: null,
      emailVerified: true,
    };
    mockGet.mockResolvedValue({
      data: user,
      error: undefined,
      response: { status: 200 } as Response,
    });

    const client = makeClient();
    const result = await client.fetchQuery(sessionQueryOptions);
    expect(result).toEqual(user);
  });

  it("401 → returns null (not thrown)", async () => {
    mockGet.mockResolvedValue({
      data: undefined,
      error: { error: "Unauthorized" as const },
      response: { status: 401 } as Response,
    });

    const client = makeClient();
    const result = await client.fetchQuery(sessionQueryOptions);
    expect(result).toBeNull();
  });

  it("network/500 error → throws 'Failed to load session'", async () => {
    mockGet.mockResolvedValue({
      data: undefined,
      error: { error: "Unauthorized" as const },
      response: { status: 500 } as Response,
    });

    const client = makeClient();
    await expect(client.fetchQuery(sessionQueryOptions)).rejects.toThrow(
      "Failed to load session",
    );
  });
});

describe("useSignOut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeWrapper(client: QueryClient) {
    return function Wrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
      return (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
    };
  }

  function TestComponent(): React.JSX.Element {
    const { signOut: handleSignOut, isPending } = useSignOut();
    return (
      <div>
        <button onClick={() => void handleSignOut()}>Sign out</button>
        {isPending && <span>Pending</span>}
      </div>
    );
  }

  it("success: clears cached session, navigates to /sign-in", async () => {
    const navigate = vi.fn().mockResolvedValue(undefined);
    mockUseNavigate.mockReturnValue(navigate);
    mockSignOut.mockResolvedValue({ data: undefined, error: null } as Awaited<ReturnType<typeof authSignOut>>);

    const client = makeClient();
    client.setQueryData(["session"], { id: "u1", email: "x@y.z", name: "x", image: null, emailVerified: true });
    const Wrapper = makeWrapper(client);

    const { getByText } = render(
      <Wrapper>
        <TestComponent />
      </Wrapper>,
    );

    await act(async () => {
      getByText("Sign out").click();
    });

    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(client.getQueryData(["session"])).toBeNull();
    expect(navigate).toHaveBeenCalledWith({ to: "/sign-in" });
  });

  it("failure (network throw): shows error toast and does not navigate", async () => {
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    mockSignOut.mockRejectedValue(new Error("Network error"));

    const Wrapper = makeWrapper(makeClient());
    const { getByText } = render(
      <Wrapper>
        <TestComponent />
      </Wrapper>,
    );

    await act(async () => {
      getByText("Sign out").click();
    });

    expect(toast.error).toHaveBeenCalledWith("Sign out failed. Please try again.");
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.queryByText("Pending")).toBeNull();
  });

  it("failure (error in response): shows error toast and does not navigate", async () => {
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    mockSignOut.mockResolvedValue({
      data: null,
      error: { status: 500, message: "Internal server error" },
    } as Awaited<ReturnType<typeof authSignOut>>);

    const Wrapper = makeWrapper(makeClient());
    const { getByText } = render(
      <Wrapper>
        <TestComponent />
      </Wrapper>,
    );

    await act(async () => {
      getByText("Sign out").click();
    });

    expect(toast.error).toHaveBeenCalledWith("Sign out failed. Please try again.");
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.queryByText("Pending")).toBeNull();
  });
});
