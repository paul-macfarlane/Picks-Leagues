import "dotenv/config";

import { serve } from "@hono/node-server";

import { createApp } from "./app";

const app = createApp();
const port = Number(process.env["PORT"] ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API server listening on http://localhost:${info.port}`);
});
