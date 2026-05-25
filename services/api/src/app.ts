import { cors } from "hono/cors";

import type { Clock } from "./lib/clock";
import { clock as defaultClock } from "./lib/clock";
import { createOpenApiApp } from "./lib/openapi";
import { createEchoRoute } from "./routes/echo";
import { createHealthRoute } from "./routes/health";

// Production origin(s) will be injected via env — FND-012's job.
const DEV_ORIGINS = ["http://localhost:5173"];

interface AppDeps {
  clock?: Clock;
}

export function createApp(deps: AppDeps = {}) {
  const resolvedClock = deps.clock ?? defaultClock;
  const app = createOpenApiApp();

  app.use(cors({ origin: DEV_ORIGINS }));

  app.route("/api/health", createHealthRoute({ clock: resolvedClock }));
  app.route("/api/echo", createEchoRoute());

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
