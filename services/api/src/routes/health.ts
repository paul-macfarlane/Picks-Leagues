import { createRoute, z } from "@hono/zod-openapi";

import type { Clock } from "../lib/clock";
import { clock as defaultClock } from "../lib/clock";
import { createOpenApiApp } from "../lib/openapi";

type Deps = { clock: Clock };

const HealthResponseSchema = z
  .object({
    status: z.literal("ok"),
    time: z.string().datetime(),
  })
  .openapi("HealthResponse");

const healthRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      description: "Server is healthy",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
  },
});

export function createHealthRoute(deps: Deps = { clock: defaultClock }) {
  const route = createOpenApiApp();

  route.openapi(healthRoute, (c) => {
    return c.json(
      { status: "ok" as const, time: deps.clock.now().toISOString() },
      200,
    );
  });

  return route;
}
