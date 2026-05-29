import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SessionUser } from "@/lib/session";

import { AuthGuard } from "./auth-guard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement("a", { href: to }, children),
}));

// vi.hoisted ensures this runs before vi.mock hoisting, so the factory can
// reference the mock fn.
const { mockQueryFn } = vi.hoisted(() => ({
  mockQueryFn: vi.fn<() => Promise<SessionUser | null>>(),
}));

// Mock sessionQueryOptions so we can control the query fn directly in each test.
vi.mock("@/lib/session", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/session")>();
  return {
    ...original,
    sessionQueryOptions: {
      ...original.sessionQueryOptions,
      // Override retry to false so tests don't wait for retry delays.
      retry: false,
      queryFn: mockQueryFn,
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

function renderWithClient(ui: React.ReactElement): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("AuthGuard", () => {
  it("loading — shows 'Checking your session…' and skeleton, hides children", () => {
    // Never resolves → stays in loading state.
    mockQueryFn.mockReturnValue(new Promise<SessionUser | null>(() => {}));

    renderWithClient(
      <AuthGuard>
        <span>Protected content</span>
      </AuthGuard>,
    );

    expect(screen.getByText("Checking your session…")).toBeTruthy();
    expect(screen.queryByText("Protected content")).toBeNull();
    const main = screen.getByRole("main");
    expect(main.getAttribute("aria-busy")).toBe("true");
  });

  it("error — shows 'Couldn't check your session', Retry button, hides children", async () => {
    mockQueryFn.mockRejectedValue(new Error("Failed to load session"));

    renderWithClient(
      <AuthGuard>
        <span>Protected content</span>
      </AuthGuard>,
    );

    await waitFor(() =>
      expect(screen.queryByText("Couldn't check your session")).toBeTruthy(),
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByText("Protected content")).toBeNull();
  });

  it("retry — clicking Retry triggers a refetch", async () => {
    const user = userEvent.setup();
    mockQueryFn.mockRejectedValue(new Error("Failed to load session"));

    renderWithClient(
      <AuthGuard>
        <span>Protected content</span>
      </AuthGuard>,
    );

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Retry" })).toBeTruthy(),
    );

    const callsBefore = mockQueryFn.mock.calls.length;
    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() =>
      expect(mockQueryFn.mock.calls.length).toBeGreaterThan(callsBefore),
    );
  });

  it("authenticated (data !== null) — renders children", async () => {
    const fakeUser: SessionUser = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      image: null,
      emailVerified: true,
    };
    mockQueryFn.mockResolvedValue(fakeUser);

    renderWithClient(
      <AuthGuard>
        <span>Protected content</span>
      </AuthGuard>,
    );

    await waitFor(() =>
      expect(screen.queryByText("Protected content")).toBeTruthy(),
    );
    expect(screen.queryByText("Checking your session…")).toBeNull();
  });
});
