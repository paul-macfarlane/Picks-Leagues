import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { DiscordIcon } from "@/components/brand-icons/discord";
import { GoogleIcon } from "@/components/brand-icons/google";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "@/lib/auth-client";
import { sanitizeRedirect } from "@/lib/redirect";
import { sessionQueryOptions } from "@/lib/session";

interface SignInSearch {
  redirect?: string;
  error?: string;
}

function validateSearch(search: Record<string, unknown>): SignInSearch {
  return {
    redirect: sanitizeRedirect(search["redirect"]),
    error: typeof search["error"] === "string" ? search["error"] : undefined,
  };
}

export const Route = createFileRoute("/sign-in")({
  validateSearch,
  beforeLoad: async ({ context, search }) => {
    const session =
      await context.queryClient.ensureQueryData(sessionQueryOptions);
    if (session) {
      throw redirect({ to: search.redirect ?? "/" });
    }
  },
  component: SignInComponent,
});

function getErrorMessage(
  error: string | undefined,
  pending: "google" | "discord" | null,
): string | null {
  if (pending) return null;
  if (error === "oauth") return "Sign-in failed. Please try again.";
  if (error === "unconfigured")
    return "This sign-in provider isn't set up yet. Try another option or come back later.";
  if (error) return "Something went wrong. Please try again.";
  return null;
}

export function SignInComponent(): React.JSX.Element {
  const { redirect: redirectTo, error: errorParam } = Route.useSearch();
  const navigate = useNavigate();
  const [pending, setPending] = React.useState<"google" | "discord" | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    getErrorMessage(errorParam, null),
  );

  const { data: session } = useQuery({
    ...sessionQueryOptions,
    enabled: false,
  });

  // If session loaded and user is authenticated, redirect immediately.
  React.useEffect(() => {
    if (session) {
      void navigate({ to: redirectTo ?? "/" });
    }
  }, [session, redirectTo, navigate]);

  async function handleSignIn(provider: "google" | "discord"): Promise<void> {
    setPending(provider);
    setErrorMessage(null);
    try {
      await signIn.social({
        provider,
        callbackURL: redirectTo ?? "/",
        errorCallbackURL: "/sign-in?error=oauth",
      });
      // On success Better Auth navigates the browser away; this branch
      // typically never runs.
    } catch (e) {
      setPending(null);
      if (
        e instanceof Error &&
        e.message.toLowerCase().includes("unconfigured")
      ) {
        setErrorMessage(
          provider === "google"
            ? "Google sign-in isn't set up yet. Try Discord, or come back later."
            : "Discord sign-in isn't set up yet. Try Google, or come back later.",
        );
      } else {
        setErrorMessage("Sign-in failed. Please try again.");
      }
    }
  }

  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-foreground text-2xl font-semibold">
            Picks Leagues
          </CardTitle>
          <CardDescription>Sign in to make your picks.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3"
            onClick={() => void handleSignIn("google")}
            disabled={pending !== null}
            aria-label="Continue with Google"
          >
            {pending === "google" ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <GoogleIcon />
            )}
            <span>Continue with Google</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3"
            onClick={() => void handleSignIn("discord")}
            disabled={pending !== null}
            aria-label="Continue with Discord"
          >
            {pending === "discord" ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <DiscordIcon />
            )}
            <span>Continue with Discord</span>
          </Button>

          {errorMessage && (
            <div
              className="text-error rounded-md border border-current/20 bg-current/5 px-4 py-3 text-sm"
              role="alert"
            >
              {errorMessage}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
