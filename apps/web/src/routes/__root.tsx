import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

function RootComponent(): React.JSX.Element {
  return (
    <ThemeProvider defaultTheme="system">
      <Outlet />
      <Toaster />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </ThemeProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
