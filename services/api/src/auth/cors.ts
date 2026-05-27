const LOCALHOST_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
] as const;

// Vercel preview deploys follow the pattern picksleagues-<hash>-<scope>.vercel.app
// or picksleagues-<hash>.vercel.app. The slug is "picksleagues" per the project name.
// This regex is assumed from the known naming convention — verify against an actual
// preview URL once one is available and update if the slug differs.
const VERCEL_PREVIEW_PATTERN = /^https:\/\/picksleagues-[a-z0-9-]+\.vercel\.app$/;

export function getAllowedOrigins(
  betterAuthUrl?: string,
): (origin: string) => string | null {
  const explicit = new Set<string>(LOCALHOST_ORIGINS);

  const resolved = betterAuthUrl ?? process.env["BETTER_AUTH_URL"];
  if (resolved) {
    explicit.add(resolved);
  }

  return function matchOrigin(origin: string): string | null {
    if (!origin) return null;
    if (explicit.has(origin)) return origin;
    if (VERCEL_PREVIEW_PATTERN.test(origin)) return origin;
    return null;
  };
}
