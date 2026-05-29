import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import * as React from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signOut as authSignOut } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/session";

import { UserMenu } from "./user-menu";

vi.mock("@/lib/auth-client", () => ({
  signOut: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: vi.fn(() => vi.fn()),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement("a", { href: to }, children),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

const mockSignOut = vi.mocked(authSignOut);
const mockUseNavigate = vi.mocked(useNavigate);

const fakeUser: SessionUser = {
  id: "user-1",
  email: "paul@example.com",
  name: "Paul Mac",
  image: null,
  emailVerified: true,
};

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

describe("UserMenu", () => {
  it("renders user's name as the trigger label", () => {
    renderWithClient(<UserMenu user={fakeUser} />);
    expect(screen.getByText("Paul")).toBeTruthy();
  });

  it("falls back to email when name is empty", () => {
    const noNameUser: SessionUser = { ...fakeUser, name: "" };
    renderWithClient(<UserMenu user={noNameUser} />);
    expect(screen.getByText("paul@example.com")).toBeTruthy();
  });

  it("clicking Sign out invokes signOut, invalidates session query, navigates to /sign-in", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn().mockResolvedValue(undefined);
    mockUseNavigate.mockReturnValue(navigate);
    mockSignOut.mockResolvedValue({ data: undefined, error: null } as Awaited<
      ReturnType<typeof authSignOut>
    >);

    renderWithClient(<UserMenu user={fakeUser} />);

    await user.click(screen.getByRole("button", { name: /user menu/i }));
    await user.click(screen.getByText("Sign out"));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledOnce();
      expect(navigate).toHaveBeenCalledWith({ to: "/sign-in" });
    });
  });

  it("sign-out failure shows error toast and stays put", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    mockSignOut.mockRejectedValue(new Error("Network error"));

    renderWithClient(<UserMenu user={fakeUser} />);

    await user.click(screen.getByRole("button", { name: /user menu/i }));
    await user.click(screen.getByText("Sign out"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Sign out failed. Please try again.",
      );
    });
    expect(navigate).not.toHaveBeenCalled();
  });
});
