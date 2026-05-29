import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AlertCircle, CheckCircle } from "lucide-react";
import * as React from "react";

import { AuthGuard } from "@/components/auth-guard";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/user-menu";
import { healthQueryOptions } from "@/lib/health";
import { sessionQueryOptions } from "@/lib/session";

export function IndexComponent(): React.JSX.Element {
  const { data: session } = useQuery(sessionQueryOptions);
  const { data, isLoading, isError, refetch } = useQuery(healthQueryOptions);

  return (
    <AuthGuard>
      <main className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="flex w-full max-w-sm flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-foreground">
                    Picks Leagues
                  </CardTitle>
                  <CardDescription>
                    Sunday afternoon with friends, not a spreadsheet at the
                    office.
                  </CardDescription>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {session && <UserMenu user={session} />}
                  <ModeToggle />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button className="w-full">Make your picks</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground text-base">
                API status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div
                  className="flex flex-col gap-2"
                  aria-label="Loading API status"
                >
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
              )}
              {isError && (
                <div className="flex flex-col gap-3">
                  <div className="text-error flex items-center gap-2">
                    <AlertCircle
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium">
                      Could not reach the API
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => void refetch()}
                  >
                    Retry
                  </Button>
                </div>
              )}
              {!isLoading && !isError && data && (
                <div className="flex flex-col gap-1">
                  <div className="text-success flex items-center gap-2">
                    <CheckCircle
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium">OK</span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {data.time}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  );
}

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context, location }) => {
    const session =
      await context.queryClient.ensureQueryData(sessionQueryOptions);
    if (!session) {
      throw redirect({
        to: "/sign-in",
        search: { redirect: location.href },
      });
    }
  },
  component: IndexComponent,
});
