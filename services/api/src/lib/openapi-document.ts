import { createApp } from "../app";

export async function getOpenApiDocument(): Promise<unknown> {
  const app = createApp();
  const res = await app.fetch(new Request("http://local/api/openapi.json"));
  return res.json() as Promise<unknown>;
}
