import { createRoute, z } from "@hono/zod-openapi";

import { ValidationErrorSchema, createOpenApiApp } from "../lib/openapi";

const headerSchema = z
  .object({
    "x-echo-token": z.string().min(1),
  })
  .openapi("EchoHeaders");

const querySchema = z
  .object({
    repeat: z.coerce.number().int().min(1).max(5).default(1),
  })
  .openapi("EchoQuery");

const bodySchema = z
  .object({
    message: z.string().min(1).max(280),
    shout: z.boolean().optional(),
  })
  .openapi("EchoRequest");

const EchoResponseSchema = z
  .object({
    message: z.string(),
    repeated: z.array(z.string()),
    shout: z.boolean(),
  })
  .openapi("EchoResponse");

const echoRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    headers: headerSchema,
    query: querySchema,
    body: {
      content: {
        "application/json": {
          schema: bodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Echoes the message",
      content: {
        "application/json": {
          schema: EchoResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ValidationErrorSchema,
        },
      },
    },
  },
});

export function createEchoRoute() {
  const route = createOpenApiApp();

  route.openapi(echoRoute, (c) => {
    const { repeat } = c.req.valid("query");
    const { message, shout } = c.req.valid("json");

    const repeated = Array.from({ length: repeat }, () => (shout ? message.toUpperCase() : message));

    return c.json({ message, repeated, shout: shout ?? false }, 200);
  });

  return route;
}
