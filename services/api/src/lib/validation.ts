import { zValidator } from "@hono/zod-validator";
import type { ZodTypeAny } from "zod";

interface FormattedIssue {
  path: string;
  code: string;
  message: string;
}

interface ValidationErrorBody {
  error: "ValidationError";
  issues: FormattedIssue[];
}

export function zBody<T extends ZodTypeAny>(schema: T) {
  return zValidator("json", schema, (result, c) => {
    if (result.success) return;
    const issues: FormattedIssue[] = result.error.issues.map((issue) => ({
      path: ["body", ...issue.path].join("."),
      code: issue.code,
      message: issue.message,
    }));
    const body: ValidationErrorBody = { error: "ValidationError", issues };
    return c.json(body, 400);
  });
}

export function zQuery<T extends ZodTypeAny>(schema: T) {
  return zValidator("query", schema, (result, c) => {
    if (result.success) return;
    const issues: FormattedIssue[] = result.error.issues.map((issue) => ({
      path: ["query", ...issue.path].join("."),
      code: issue.code,
      message: issue.message,
    }));
    const body: ValidationErrorBody = { error: "ValidationError", issues };
    return c.json(body, 400);
  });
}

export function zHeader<T extends ZodTypeAny>(schema: T) {
  return zValidator("header", schema, (result, c) => {
    if (result.success) return;
    const issues: FormattedIssue[] = result.error.issues.map((issue) => ({
      path: ["header", ...issue.path].join("."),
      code: issue.code,
      message: issue.message,
    }));
    const body: ValidationErrorBody = { error: "ValidationError", issues };
    return c.json(body, 400);
  });
}

export function zParam<T extends ZodTypeAny>(schema: T) {
  return zValidator("param", schema, (result, c) => {
    if (result.success) return;
    const issues: FormattedIssue[] = result.error.issues.map((issue) => ({
      path: ["param", ...issue.path].join("."),
      code: issue.code,
      message: issue.message,
    }));
    const body: ValidationErrorBody = { error: "ValidationError", issues };
    return c.json(body, 400);
  });
}
