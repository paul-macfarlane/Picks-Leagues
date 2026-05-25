import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, CheckCircle } from "lucide-react";
import * as React from "react";

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
import { healthQueryOptions } from "@/lib/health";

export function IndexComponent(): React.JSX.Element {
  const { data, isLoading, isError, refetch } = useQuery(healthQueryOptions);

  return (
    <main className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Picks Leagues</CardTitle>
            <CardDescription>
              Sunday afternoon with friends, not a spreadsheet at the office.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button className="w-full">Make your picks</Button>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Theme</span>
              <ModeToggle />
            </div>
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
              <div className="flex flex-col gap-2" aria-label="Loading API status">
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
                <span className="text-muted-foreground text-xs">{data.time}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/")({
  component: IndexComponent,
});
