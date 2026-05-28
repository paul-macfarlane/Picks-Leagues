import type { MiddlewareHandler } from "hono";

import type { AppVariables, createAuth } from "./index";

export function createSessionMiddleware(
  authInstance: ReturnType<typeof createAuth>,
): MiddlewareHandler<{ Variables: AppVariables }> {
  return async function sessionMiddleware(c, next) {
    const session = await authInstance.api.getSession({
      headers: c.req.raw.headers,
    });
    c.set("user", session?.user ?? null);
    c.set("session", session?.session ?? null);
    await next();
  };
}
