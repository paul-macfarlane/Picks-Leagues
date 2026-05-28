import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { sessionQueryOptions } from "@/lib/session";

// Presentational loading/error component for protected routes.
// Redirect logic for unauthenticated users lives in beforeLoad on each
// protected route — not here. This component handles only the loading and
// error UI states that route pendingComponent/errorComponent don't cover
// (since the session query runs inside the component, not the loader).
export function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { data, isLoading, isFetching, isError, refetch } =
    useQuery(sessionQueryOptions);

  if (isLoading || (isFetching && data === undefined)) {
    return (
      <main
        className="bg-background flex min-h-screen items-center justify-center p-4"
        aria-busy="true"
      >
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <span className="text-muted-foreground text-sm">
                Checking your session…
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="text-error flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium">
                Couldn&apos;t check your session
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                size="default"
                className="flex-1"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
              <Button
                variant="default"
                size="default"
                className="flex-1"
                asChild
              >
                <Link to="/sign-in">Sign in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
