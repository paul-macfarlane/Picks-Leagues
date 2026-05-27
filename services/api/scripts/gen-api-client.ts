import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

import { getOpenApiDocument } from "../src/lib/openapi-document";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoRoot = resolve(__dirname, "../../..");
const apiClientDir = resolve(repoRoot, "apps/web/src/lib/api-client");

// Spec generation never serves requests; the placeholder satisfies the cron-auth
// factory's fail-fast env check without coupling the script to real CRON_SECRET.
const spec = await getOpenApiDocument({ cronSecret: "spec-generation-placeholder" });

const specJson = JSON.stringify(spec, null, 2);
mkdirSync(apiClientDir, { recursive: true });
writeFileSync(resolve(apiClientDir, "openapi.json"), specJson + "\n", "utf8");

const ast = await openapiTS(spec as Parameters<typeof openapiTS>[0], {
  silent: true,
});
const typesContent = astToString(ast);
writeFileSync(resolve(apiClientDir, "types.gen.ts"), typesContent, "utf8");

console.log(
  "Generated apps/web/src/lib/api-client/openapi.json and types.gen.ts",
);
