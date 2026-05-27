import type { Clock } from "./lib/clock";
import { clock as defaultClock } from "./lib/clock";
import { createOpenApiApp } from "./lib/openapi";
import { createCronAuth } from "./middleware/cron-auth";
import { createCronPingRoute } from "./routes/cron-ping";
import { createEchoRoute } from "./routes/echo";
import { createHealthRoute } from "./routes/health";

export interface AppDeps {
  clock?: Clock;
  cronSecret?: string;
}

export function createApp(deps: AppDeps = {}) {
  const resolvedClock = deps.clock ?? defaultClock;
  const app = createOpenApiApp();

  app.route("/api/health", createHealthRoute({ clock: resolvedClock }));
  app.route("/api/echo", createEchoRoute());

  const cronAuth = createCronAuth({ secret: deps.cronSecret });
  app.use("/api/cron/*", cronAuth);
  app.route("/api/cron/ping", createCronPingRoute({ clock: resolvedClock }));

  app.doc("/api/openapi.json", {
    openapi: "3.0.0",
    info: { title: "Picks Leagues API", version: "0.0.0" },
  });

  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  });

  return app;
}
