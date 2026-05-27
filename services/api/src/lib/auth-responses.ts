import { z } from "@hono/zod-openapi";

export const UnauthorizedSchema = z
  .object({ error: z.literal("Unauthorized") })
  .openapi("Unauthorized");
