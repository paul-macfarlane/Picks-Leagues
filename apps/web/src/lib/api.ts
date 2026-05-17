import createClient from "openapi-fetch";

import type { components, paths } from "./api-client/types.gen";

// WHY: env-driven base URL is wired in FND-012 (deploy config); Vite's
// import.meta.env typing lands in FND-009. Use a constant for now so
// apps/web typecheck stays clean without Vite client types.
const baseUrl = "http://localhost:3000";

export const apiClient = createClient<paths>({ baseUrl });

export type { components, paths };
