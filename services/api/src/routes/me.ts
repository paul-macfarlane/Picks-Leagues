import { createRoute, z } from "@hono/zod-openapi";

import type { AppVariables } from "../auth/index";
import { UnauthorizedSchema } from "../lib/auth-responses";
import { createOpenApiApp } from "../lib/openapi";

const MeResponseSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    image: z.string().nullable(),
    emailVerified: z.boolean(),
  })
  .openapi("MeResponse");

const meRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      description: "The authenticated user's profile.",
      content: { "application/json": { schema: MeResponseSchema } },
    },
    401: {
      description: "No authenticated session.",
      content: { "application/json": { schema: UnauthorizedSchema } },
    },
  },
});

export function createMeRoute() {
  const route = createOpenApiApp<{ Variables: AppVariables }>();

  route.openapi(meRoute, (c) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" as const }, 401);
    }

    return c.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image ?? null,
        emailVerified: user.emailVerified,
      },
      200,
    );
  });

  return route;
}
