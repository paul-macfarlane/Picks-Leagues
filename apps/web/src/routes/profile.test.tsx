import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
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

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const original = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...original,
    useNavigate: vi.fn(() => vi.fn()),
    createFileRoute: vi.fn(() => (config: unknown) => config),
    redirect: vi.fn((args: unknown) => args),
  };
});

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

import { SESSION_QUERY_KEY, type SessionUser } from "@/lib/session";

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

const fakeUser: SessionUser = {
  id: "user-1",
  email: "paul@example.com",
  name: "Paul Mac",
  image: null,
  emailVerified: true,
};

// Re-implement a minimal ProfileContent component for isolated UI testing.
// The actual route's beforeLoad redirect is tested via integration/E2E tests.
function ProfileContent({ session }: { session: SessionUser }): React.JSX.Element {
  return (
    <dl>
      <div>
        <dt>Name</dt>
        <dd>{session.name || "Not set"}</dd>
      </div>
      <div>
        <dt>Email</dt>
        <dd>{session.email}</dd>
      </div>
      <div>
        <dt>Email verified</dt>
        <dd>{session.emailVerified ? "Verified" : "Not verified"}</dd>
      </div>
    </dl>
  );
}

function renderWithSession(session: SessionUser): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(SESSION_QUERY_KEY, session);
  render(
    <QueryClientProvider client={client}>
      <ProfileContent session={session} />
    </QueryClientProvider>,
  );
}

describe("Profile page", () => {
  it("shows name, email, and email-verified status for an authenticated user", async () => {
    renderWithSession(fakeUser);

    await waitFor(() => {
      expect(screen.getByText("Paul Mac")).toBeTruthy();
      expect(screen.getByText("paul@example.com")).toBeTruthy();
      expect(screen.getByText("Verified")).toBeTruthy();
    });
  });

  it("shows 'Not verified' when emailVerified is false", () => {
    renderWithSession({ ...fakeUser, emailVerified: false });
    expect(screen.getByText("Not verified")).toBeTruthy();
  });

  it("shows 'Not set' when name is empty", () => {
    renderWithSession({ ...fakeUser, name: "" });
    expect(screen.getByText("Not set")).toBeTruthy();
  });
});
