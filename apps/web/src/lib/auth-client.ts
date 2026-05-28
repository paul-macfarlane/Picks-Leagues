import { createAuthClient } from "better-auth/react";

// baseURL intentionally omitted: same-origin in both dev (Vite proxy at /api)
// and prod (single Vercel project). Better Auth defaults to /api/auth.
export const authClient = createAuthClient({});

export const { signIn, signOut } = authClient;
