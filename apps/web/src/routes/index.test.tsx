import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/theme-provider";
import { apiClient } from "@/lib/api";
import { SESSION_QUERY_KEY } from "@/lib/session";

import { IndexComponent } from "./index";

vi.mock("@/lib/api", () => ({
  apiClient: {
    GET: vi.fn(),
  },
}));

vi.mock("@/lib/auth-client", () => ({
  signOut: vi.fn(),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...original,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

const mockGet = vi.mocked(apiClient.GET);

const fakeSession = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  image: null,
  emailVerified: true,
};

beforeEach(() => {
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

function renderWithClient(
  ui: React.ReactElement,
  { withSession = true }: { withSession?: boolean } = {},
): void {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  // Pre-seed the session query so AuthGuard renders children immediately.
  if (withSession) {
    client.setQueryData(SESSION_QUERY_KEY, fakeSession);
  }
  render(
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </ThemeProvider>,
  );
}

describe("IndexComponent", () => {
  it("loading — shows skeleton, hides status text", () => {
    // Health query is pending; session is pre-seeded so AuthGuard renders children.
    mockGet.mockReturnValue(new Promise(() => {}));
    renderWithClient(<IndexComponent />);

    expect(screen.getByLabelText("Loading API status")).toBeTruthy();
    expect(screen.queryByText("OK")).toBeNull();
  });

  it("success — renders status OK and time string", async () => {
    const isoTime = "2026-05-18T12:00:00.000Z";
    mockGet.mockResolvedValue({
      data: { status: "ok", time: isoTime },
      error: undefined,
    });

    renderWithClient(<IndexComponent />);

    await waitFor(() => expect(screen.queryByText("OK")).toBeTruthy());
    expect(screen.getByText(isoTime)).toBeTruthy();
    expect(screen.queryByLabelText("Loading API status")).toBeNull();
  });

  it("error — renders error message and retry button", async () => {
    mockGet.mockResolvedValue({
      data: undefined,
      error: { message: "server error" },
    });

    renderWithClient(<IndexComponent />);

    await waitFor(() =>
      expect(screen.queryByText("Could not reach the API")).toBeTruthy(),
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByText("OK")).toBeNull();
  });

  it("retry — clicking Retry triggers a second GET call", async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      data: undefined,
      error: { message: "server error" },
    });

    renderWithClient(<IndexComponent />);

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Retry" })).toBeTruthy(),
    );

    const callsBefore = mockGet.mock.calls.length;
    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() =>
      expect(mockGet.mock.calls.length).toBeGreaterThan(callsBefore),
    );
  });
});
