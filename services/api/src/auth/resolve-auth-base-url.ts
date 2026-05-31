export interface ResolveAuthBaseURLDeps {
  baseURL?: string;
}

export interface ResolveAuthBaseURLEnv {
  BETTER_AUTH_URL?: string;
  VERCEL_URL?: string;
}

export function resolveAuthBaseURL(
  deps: ResolveAuthBaseURLDeps,
  env: ResolveAuthBaseURLEnv,
): string {
  if (deps.baseURL) return deps.baseURL;

  if (env.BETTER_AUTH_URL) return env.BETTER_AUTH_URL;

  if (env.VERCEL_URL) {
    const raw = env.VERCEL_URL;
    return raw.startsWith("https://") || raw.startsWith("http://")
      ? raw
      : `https://${raw}`;
  }

  throw new Error(
    "BETTER_AUTH_URL is not set. Copy services/api/.env.example to services/api/.env and set the canonical app origin (e.g. http://localhost:5173 for local dev).",
  );
}
