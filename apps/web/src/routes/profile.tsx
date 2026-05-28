import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { CheckCircle, XCircle } from "lucide-react";
import * as React from "react";

import { AuthGuard } from "@/components/auth-guard";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/user-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sessionQueryOptions } from "@/lib/session";

export const Route = createFileRoute("/profile")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions);
    if (!session) {
      throw redirect({
        to: "/sign-in",
        search: { redirect: location.href },
      });
    }
  },
  component: ProfileComponent,
});

function ProfileComponent(): React.JSX.Element {
  const { data: session } = useQuery(sessionQueryOptions);

  return (
    <AuthGuard>
      <main className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="flex w-full max-w-sm flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-foreground">Profile</CardTitle>
                <div className="flex shrink-0 items-center gap-1">
                  {session && <UserMenu user={session} />}
                  <ModeToggle />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {session && (
                <dl className="flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                      Name
                    </dt>
                    <dd className="text-foreground text-sm">
                      {session.name || <span className="text-muted-foreground italic">Not set</span>}
                    </dd>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                      Email
                    </dt>
                    <dd className="text-foreground text-sm">{session.email}</dd>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                      Email verified
                    </dt>
                    <dd className="flex items-center gap-1.5 text-sm">
                      {session.emailVerified ? (
                        <>
                          <CheckCircle
                            className="text-success size-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-success">Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle
                            className="text-error size-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-error">Not verified</span>
                        </>
                      )}
                    </dd>
                  </div>

                  {session.image && (
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        Avatar
                      </dt>
                      <dd>
                        <img
                          src={session.image}
                          alt={`${session.name || session.email}'s avatar`}
                          className="size-10 rounded-full object-cover"
                        />
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  );
}
