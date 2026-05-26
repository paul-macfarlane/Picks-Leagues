import { getRequestListener } from "@hono/node-server";

import { createApp } from "./app";

const app = createApp();

export default getRequestListener(app.fetch);
