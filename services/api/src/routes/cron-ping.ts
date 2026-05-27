import { createRoute, z } from "@hono/zod-openapi";

import type { Clock } from "../lib/clock";
import { clock as defaultClock } from "../lib/clock";
import { createOpenApiApp } from "../lib/openapi";

type Deps = { clock: Clock };

const CronPingResponseSchema = z
  .object({
    status: z.literal("ok"),
    time: z.string().datetime(),
  })
  .openapi("CronPingResponse");

const cronPingRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      description: "Cron guard is active and the secret is valid",
      content: {
        "application/json": {
          schema: CronPingResponseSchema,
        },
      },
    },
  },
});

export function createCronPingRoute(deps: Deps = { clock: defaultClock }) {
  const route = createOpenApiApp();

  route.openapi(cronPingRoute, (c) => {
    return c.json(
      { status: "ok" as const, time: deps.clock.now().toISOString() },
      200,
    );
  });

  return route;
}
