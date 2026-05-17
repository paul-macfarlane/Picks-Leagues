import { Hono } from "hono";

import type { Clock } from "../lib/clock";
import { clock as defaultClock } from "../lib/clock";

type Deps = { clock: Clock };

export function createHealthRoute(deps: Deps = { clock: defaultClock }): Hono {
  const route = new Hono();

  route.get("/", (c): Response => {
    return c.json({ status: "ok", time: deps.clock.now().toISOString() });
  });

  return route;
}
