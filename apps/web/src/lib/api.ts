import createClient from "openapi-fetch";

import type { components, paths } from "./api-client/types.gen";

// Relative same-origin by default; an explicit override is supported via
// VITE_API_BASE_URL for cases we don't use today (e.g., a future mobile/local-API target).
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

export const apiClient = createClient<paths>({ baseUrl });

export type { components, paths };
