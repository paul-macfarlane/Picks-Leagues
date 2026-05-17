import { Hono } from "hono";
import { z } from "zod";

import { zBody, zHeader, zQuery } from "../lib/validation";

const headerSchema = z.object({
  "x-echo-token": z.string().min(1),
});

const querySchema = z.object({
  repeat: z.coerce.number().int().min(1).max(5).default(1),
});

const bodySchema = z.object({
  message: z.string().min(1).max(280),
  shout: z.boolean().optional(),
});

export function createEchoRoute(): Hono {
  const route = new Hono();

  route.post("/", zHeader(headerSchema), zQuery(querySchema), zBody(bodySchema), (c): Response => {
    const { repeat } = c.req.valid("query");
    const { message, shout } = c.req.valid("json");

    const repeated = Array.from({ length: repeat }, () => (shout ? message.toUpperCase() : message));

    return c.json({ message, repeated, shout: shout ?? false });
  });

  return route;
}
