export function sanitizeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string" || value === "") return undefined;
  // Reject protocol-relative URLs (//evil.com) and anything with a scheme (https://)
  if (value.startsWith("//") || value.includes("://")) return undefined;
  // Must be an absolute same-origin path starting with /
  if (!value.startsWith("/")) return undefined;
  return value;
}
