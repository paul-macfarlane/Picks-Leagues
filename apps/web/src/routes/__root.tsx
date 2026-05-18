import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";

function RootComponent() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
