import { Hono } from "hono";

import type { Clock } from "./lib/clock";
import { clock as defaultClock } from "./lib/clock";
import { createEchoRoute } from "./routes/echo";
import { createHealthRoute } from "./routes/health";

interface AppDeps {
  clock?: Clock;
}

export function createApp(deps: AppDeps = {}): Hono {
  const resolvedClock = deps.clock ?? defaultClock;
  const app = new Hono();

  app.route("/api/health", createHealthRoute({ clock: resolvedClock }));
  app.route("/api/echo", createEchoRoute());

  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  });

  return app;
}
