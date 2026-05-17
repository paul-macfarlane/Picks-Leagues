import { zValidator } from "@hono/zod-validator";
import type { ZodTypeAny } from "zod";

import { formatZodIssues } from "./openapi";

interface ValidationErrorBody {
  error: "ValidationError";
  issues: ReturnType<typeof formatZodIssues>;
}

export function zBody<T extends ZodTypeAny>(schema: T) {
  return zValidator("json", schema, (result, c) => {
    if (result.success) return;
    const issues = formatZodIssues("body", result.error.issues);
    const body: ValidationErrorBody = { error: "ValidationError", issues };
    return c.json(body, 400);
  });
}

export function zQuery<T extends ZodTypeAny>(schema: T) {
  return zValidator("query", schema, (result, c) => {
    if (result.success) return;
    const issues = formatZodIssues("query", result.error.issues);
    const body: ValidationErrorBody = { error: "ValidationError", issues };
    return c.json(body, 400);
  });
}

export function zHeader<T extends ZodTypeAny>(schema: T) {
  return zValidator("header", schema, (result, c) => {
    if (result.success) return;
    const issues = formatZodIssues("header", result.error.issues);
    const body: ValidationErrorBody = { error: "ValidationError", issues };
    return c.json(body, 400);
  });
}

export function zParam<T extends ZodTypeAny>(schema: T) {
  return zValidator("param", schema, (result, c) => {
    if (result.success) return;
    const issues = formatZodIssues("param", result.error.issues);
    const body: ValidationErrorBody = { error: "ValidationError", issues };
    return c.json(body, 400);
  });
}
