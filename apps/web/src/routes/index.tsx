import { createFileRoute } from "@tanstack/react-router";
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

function IndexComponent(): React.JSX.Element {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
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
    </main>
  );
}

export const Route = createFileRoute("/")({
  component: IndexComponent,
});
