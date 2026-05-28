import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import * as React from "react";

import { apiClient } from "./api";
import type { components } from "./api-client/types.gen";
import { signOut } from "./auth-client";

export type SessionUser = components["schemas"]["MeResponse"];

export const SESSION_QUERY_KEY = ["session"] as const;

export const sessionQueryOptions = queryOptions({
  queryKey: SESSION_QUERY_KEY,
  queryFn: async (): Promise<SessionUser | null> => {
    const { data, error, response } = await apiClient.GET("/api/me");
    if (response.status === 401) return null;
    if (error) throw new Error("Failed to load session");
    return data ?? null;
  },
  // Session changes are rare and user-initiated; 5-minute stale time avoids
  // hammering /api/me on every navigation.
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true,
  retry: (failureCount, error) => {
    if (
      error instanceof Error &&
      error.message === "Failed to load session"
    ) {
      return failureCount < 2;
    }
    return false;
  },
});

export function useSignOut(): {
  signOut: () => Promise<void>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isPending, setIsPending] = React.useState(false);

  async function handleSignOut(): Promise<void> {
    setIsPending(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast.error("Sign out failed. Please try again.");
        return;
      }
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      void queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      await navigate({ to: "/sign-in" });
    } catch {
      toast.error("Sign out failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return { signOut: handleSignOut, isPending };
}
