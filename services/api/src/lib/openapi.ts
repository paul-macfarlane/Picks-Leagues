import { OpenAPIHono } from "@hono/zod-openapi";
import type { Hook } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import type { Env } from "hono";
import type { ZodIssue } from "zod";

export interface FormattedIssue {
  path: string;
  code: string;
  message: string;
}

export const ValidationErrorSchema = z
  .object({
    error: z.literal("ValidationError"),
    issues: z.array(
      z.object({
        path: z.string(),
        code: z.string(),
        message: z.string(),
      }),
    ),
  })
  .openapi("ValidationError");

type ValidationTarget = "body" | "query" | "header" | "param" | "cookie";

const targetMap: Record<string, ValidationTarget> = {
  json: "body",
  query: "query",
  header: "header",
  param: "param",
  cookie: "cookie",
  form: "body",
};

export function formatZodIssues(target: ValidationTarget, issues: ZodIssue[]): FormattedIssue[] {
  return issues.map((issue) => ({
    path: [target, ...issue.path].join("."),
    code: issue.code,
    message: issue.message,
  }));
}

export const openApiDefaultHook: Hook<unknown, Env, string, unknown> = (result, c) => {
  if (result.success) return;
  // `target` is present at runtime but not in the Hook generic's result type
  const rawTarget = (result as { target?: string }).target ?? "json";
  const target: ValidationTarget = targetMap[rawTarget] ?? "body";
  const issues = formatZodIssues(target, result.error.issues);
  return c.json({ error: "ValidationError" as const, issues }, 400);
};

export function createOpenApiApp(): OpenAPIHono {
  return new OpenAPIHono({
    defaultHook: openApiDefaultHook,
  });
}
