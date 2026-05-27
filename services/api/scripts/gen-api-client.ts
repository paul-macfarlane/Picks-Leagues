import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { memoryAdapter } from "better-auth/adapters/memory";
import openapiTS, { astToString } from "openapi-typescript";

import { createAuth } from "../src/auth/index";
import { getOpenApiDocument } from "../src/lib/openapi-document";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoRoot = resolve(__dirname, "../../..");
const apiClientDir = resolve(repoRoot, "apps/web/src/lib/api-client");

// Spec generation never serves requests; placeholders satisfy fail-fast env
// checks without coupling the script to real secrets or a real database.
const auth = createAuth({
  secret: "spec-generation-secret-must-be-at-least-32-chars",
  baseURL: "http://spec-gen.local",
  database: memoryAdapter({}),
});

const spec = await getOpenApiDocument({
  cronSecret: "spec-generation-placeholder",
  auth,
});

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
