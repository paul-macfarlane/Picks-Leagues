import type { AppDeps } from "../app";
import { createApp } from "../app";

export async function getOpenApiDocument(deps?: AppDeps): Promise<unknown> {
  const app = createApp(deps);
  const res = await app.fetch(new Request("http://local/api/openapi.json"));
  return res.json() as Promise<unknown>;
}
