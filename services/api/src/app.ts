import { createAuth } from "./auth/index";
import { createSessionMiddleware } from "./auth/middleware";
import type { Clock } from "./lib/clock";
import { clock as defaultClock } from "./lib/clock";
import { createOpenApiApp } from "./lib/openapi";
import { createCronAuth } from "./middleware/cron-auth";
import { createCronPingRoute } from "./routes/cron-ping";
import { createEchoRoute } from "./routes/echo";
import { createHealthRoute } from "./routes/health";
import { createMeRoute } from "./routes/me";

export interface AppDeps {
  clock?: Clock;
  cronSecret?: string;
  auth?: ReturnType<typeof createAuth>;
}

export function createApp(deps: AppDeps = {}) {
  const resolvedClock = deps.clock ?? defaultClock;
  const authInstance = deps.auth ?? createAuth();
  const app = createOpenApiApp();

  app.on(["POST", "GET"], "/api/auth/*", (c) =>
    authInstance.handler(c.req.raw),
  );

  app.use("*", createSessionMiddleware(authInstance));

  app.route("/api/health", createHealthRoute({ clock: resolvedClock }));
  app.route("/api/echo", createEchoRoute());
  app.route("/api/me", createMeRoute());

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
