import { timingSafeEqual } from "crypto";
import type { MiddlewareHandler } from "hono";

interface CronAuthOptions {
  secret?: string;
}

export function createCronAuth(
  options: CronAuthOptions = {},
): MiddlewareHandler {
  const secret = options.secret ?? process.env["CRON_SECRET"];
  if (!secret) {
    throw new Error(
      "CRON_SECRET is not set. Copy services/api/.env.example to services/api/.env and set a non-empty value (any random string works locally).",
    );
  }

  const secretBuf = Buffer.from(secret);

  return async function cronAuth(c, next) {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.slice("Bearer ".length);
    const tokenBuf = Buffer.from(token);

    // timingSafeEqual throws if buffers differ in byte length, so guard first.
    if (tokenBuf.byteLength !== secretBuf.byteLength) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!timingSafeEqual(tokenBuf, secretBuf)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
  };
}
