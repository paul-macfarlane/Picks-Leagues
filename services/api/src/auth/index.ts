import { betterAuth } from "better-auth";
import type { BetterAuthOptions, Session, User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";

import { getDb } from "../db/client";
import type { Db } from "../db/client";

export interface AppVariables {
  user: User | null;
  session: Session | null;
}

export interface AuthDeps {
  db?: Db;
  database?: BetterAuthOptions["database"];
  secret?: string;
  baseURL?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  discordClientId?: string;
  discordClientSecret?: string;
}

export function createAuth(deps: AuthDeps = {}) {
  const secret = deps.secret ?? process.env["BETTER_AUTH_SECRET"];
  const baseURL = deps.baseURL ?? process.env["BETTER_AUTH_URL"];

  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is not set. Copy services/api/.env.example to services/api/.env and set a value (generate with: openssl rand -base64 32).",
    );
  }
  if (!baseURL) {
    throw new Error(
      "BETTER_AUTH_URL is not set. Copy services/api/.env.example to services/api/.env and set the canonical app origin (e.g. http://localhost:3000 for local dev).",
    );
  }

  const googleClientId = deps.googleClientId ?? process.env["GOOGLE_CLIENT_ID"];
  const googleClientSecret =
    deps.googleClientSecret ?? process.env["GOOGLE_CLIENT_SECRET"];
  const discordClientId =
    deps.discordClientId ?? process.env["DISCORD_CLIENT_ID"];
  const discordClientSecret =
    deps.discordClientSecret ?? process.env["DISCORD_CLIENT_SECRET"];

  const socialProviders: Parameters<typeof betterAuth>[0]["socialProviders"] =
    {};

  if (googleClientId && googleClientSecret) {
    socialProviders.google = {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    };
  }

  if (discordClientId && discordClientSecret) {
    socialProviders.discord = {
      clientId: discordClientId,
      clientSecret: discordClientSecret,
    };
  }

  let database: BetterAuthOptions["database"];
  if (deps.database) {
    database = deps.database;
  } else if (deps.db) {
    database = drizzleAdapter(deps.db, { provider: "pg" });
  } else {
    database = drizzleAdapter(getDb(), { provider: "pg" });
  }

  return betterAuth({
    secret,
    baseURL,
    database,
    socialProviders,
    plugins: [jwt()],
  });
}
