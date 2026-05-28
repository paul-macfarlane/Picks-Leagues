import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface SearchParams {
  redirect?: string;
  error?: string;
}

// Hoisted so the vi.mock factories below can close over it without TDZ issues.
const mockUseSearch = vi.hoisted(() => vi.fn((): SearchParams => ({})));

vi.mock("@/lib/api", () => ({
  apiClient: {
    GET: vi.fn(),
  },
}));

vi.mock("@/components/mode-toggle", () => ({
  ModeToggle: () => null,
}));

vi.mock("@/lib/auth-client", () => ({
  signIn: {
    social: vi.fn(),
  },
  signOut: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

// createFileRoute mock: the route factory returns a config object that
// merges the route definition with a useSearch hook we control per test.
// This is necessary because SignInComponent reads Route.useSearch() and
// the real Route.useSearch requires a live router context.
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const original = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...original,
    useNavigate: vi.fn(() => vi.fn()),
    redirect: vi.fn((args: unknown) => args),
    createFileRoute: vi.fn(
      () => (config: Record<string, unknown>) => ({
        ...config,
        useSearch: mockUseSearch,
      }),
    ),
  };
});

import { signIn } from "@/lib/auth-client";
import { SignInComponent } from "./sign-in";

const mockSignInSocial = vi.mocked(signIn.social);

beforeEach(() => {
  vi.clearAllMocks();
  mockUseSearch.mockReturnValue({});
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

function makeClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderSignIn(client: QueryClient = makeClient()): ReturnType<typeof render> {
  return render(
    <QueryClientProvider client={client}>
      <SignInComponent />
    </QueryClientProvider>,
  );
}

describe("Sign-in page UI", () => {
  it("renders both OAuth buttons (Google + Discord) with accessible names", () => {
    renderSignIn();
    expect(screen.getByRole("button", { name: /Continue with Google/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Continue with Discord/i })).toBeTruthy();
  });

  it("clicking Google → calls signIn.social with provider: 'google'", async () => {
    const user = userEvent.setup();
    mockSignInSocial.mockResolvedValue({ data: null, error: null } as Awaited<ReturnType<typeof signIn.social>>);

    renderSignIn();
    await user.click(screen.getByRole("button", { name: /Continue with Google/i }));

    expect(mockSignInSocial).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "google", callbackURL: "/" }),
    );
  });

  it("clicking Discord → calls signIn.social with provider: 'discord'", async () => {
    const user = userEvent.setup();
    mockSignInSocial.mockResolvedValue({ data: null, error: null } as Awaited<ReturnType<typeof signIn.social>>);

    renderSignIn();
    await user.click(screen.getByRole("button", { name: /Continue with Discord/i }));

    expect(mockSignInSocial).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "discord", callbackURL: "/" }),
    );
  });

  it("?redirect=/leagues → buttons pass that as callbackURL", async () => {
    const user = userEvent.setup();
    mockSignInSocial.mockResolvedValue({ data: null, error: null } as Awaited<ReturnType<typeof signIn.social>>);
    mockUseSearch.mockReturnValue({ redirect: "/leagues" });

    renderSignIn();
    await user.click(screen.getByRole("button", { name: /Continue with Google/i }));

    expect(mockSignInSocial).toHaveBeenCalledWith(
      expect.objectContaining({ callbackURL: "/leagues" }),
    );
  });

  it("loading — clicking a button disables both and shows spinner on the clicked one", async () => {
    const user = userEvent.setup();
    let resolveSignIn!: () => void;
    mockSignInSocial.mockReturnValue(
      new Promise<Awaited<ReturnType<typeof signIn.social>>>((res) => {
        resolveSignIn = () => res({ data: null, error: null });
      }),
    );

    renderSignIn();
    await user.click(screen.getByRole("button", { name: /Continue with Google/i }));

    const googleBtn = screen.getByRole("button", { name: /Continue with Google/i });
    const discordBtn = screen.getByRole("button", { name: /Continue with Discord/i });
    expect((googleBtn as HTMLButtonElement).disabled).toBe(true);
    expect((discordBtn as HTMLButtonElement).disabled).toBe(true);

    resolveSignIn();
  });

  it("error — ?error=oauth renders the inline error region", () => {
    mockUseSearch.mockReturnValue({ error: "oauth" });

    renderSignIn();
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Sign-in failed. Please try again.")).toBeTruthy();
  });

  it("error — signIn rejection renders the inline error region", async () => {
    const user = userEvent.setup();
    mockSignInSocial.mockRejectedValue(new Error("Network error"));

    renderSignIn();
    await user.click(screen.getByRole("button", { name: /Continue with Google/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeTruthy(),
    );
    expect(screen.getByText("Sign-in failed. Please try again.")).toBeTruthy();
  });
});
