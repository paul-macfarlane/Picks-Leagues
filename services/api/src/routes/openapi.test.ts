import { describe, expect, it } from "vitest";

import { createApp } from "../app";

type OpenAPIDoc = {
  openapi: string;
  info: { title: string; version: string };
  paths: Record<
    string,
    Record<
      string,
      {
        requestBody?: {
          content?: Record<
            string,
            {
              schema?: {
                required?: string[];
                properties?: Record<string, unknown>;
              };
            }
          >;
        };
        parameters?: { name: string; in: string }[];
        responses?: Record<
          string,
          { content?: Record<string, { schema?: { $ref?: string } }> }
        >;
      }
    >
  >;
  components?: {
    schemas?: Record<string, unknown>;
  };
};

describe("GET /api/openapi.json", () => {
  async function fetchDoc(): Promise<OpenAPIDoc> {
    const app = createApp({ cronSecret: "test-secret" });
    const res = await app.request("/api/openapi.json");
    return (await res.json()) as OpenAPIDoc;
  }

  it("paths include /api/health (GET) and /api/echo (POST)", async () => {
    const doc = await fetchDoc();
    expect(doc.paths).toHaveProperty("/api/health");
    expect(doc.paths["/api/health"]).toHaveProperty("get");
    expect(doc.paths).toHaveProperty("/api/echo");
    expect(doc.paths["/api/echo"]).toHaveProperty("post");
  });

  it("/api/health 200 response schema has status and time properties", async () => {
    const doc = await fetchDoc();
    const schemas = doc.components?.schemas ?? {};
    const healthSchema = schemas["HealthResponse"] as {
      properties?: { status?: unknown; time?: unknown };
    };
    expect(healthSchema).toBeDefined();
    expect(healthSchema.properties?.status).toBeDefined();
    expect(healthSchema.properties?.time).toBeDefined();
  });

  it("/api/echo POST documents request body (message required), query (repeat), and x-echo-token header parameter", async () => {
    const doc = await fetchDoc();
    const echoPost = doc.paths["/api/echo"]?.["post"];
    expect(echoPost).toBeDefined();

    const bodyContent = echoPost?.requestBody?.content?.["application/json"];
    expect(bodyContent).toBeDefined();

    const schemas = doc.components?.schemas ?? {};
    const requestSchema = schemas["EchoRequest"] as {
      required?: string[];
      properties?: Record<string, unknown>;
    };
    expect(requestSchema).toBeDefined();
    expect(requestSchema.required).toContain("message");
    expect(requestSchema.properties?.message).toBeDefined();

    const hasRepeatParam = echoPost?.parameters?.some(
      (p) => p.name === "repeat" && p.in === "query",
    );
    expect(hasRepeatParam).toBe(true);

    const hasTokenHeader = echoPost?.parameters?.some(
      (p) => p.name === "x-echo-token" && p.in === "header",
    );
    expect(hasTokenHeader).toBe(true);
  });

  it("/api/echo documents a 400 response referencing the ValidationError schema", async () => {
    const doc = await fetchDoc();
    const echoPost = doc.paths["/api/echo"]?.["post"];
    const response400 = echoPost?.responses?.["400"];
    expect(response400).toBeDefined();
    const schema400 = response400?.content?.["application/json"]?.schema;
    expect(schema400).toBeDefined();
    const ref = (schema400 as { $ref?: string } | undefined)?.$ref;
    expect(ref).toMatch(/ValidationError/);
  });

  it("components.schemas contains the named body/response schemas", async () => {
    const doc = await fetchDoc();
    const schemas = Object.keys(doc.components?.schemas ?? {});
    expect(schemas).toContain("HealthResponse");
    expect(schemas).toContain("ValidationError");
    expect(schemas).toContain("EchoRequest");
    expect(schemas).toContain("EchoResponse");
  });

  it("paths include /api/me (GET)", async () => {
    const doc = await fetchDoc();
    expect(doc.paths).toHaveProperty("/api/me");
    expect(doc.paths["/api/me"]).toHaveProperty("get");
  });

  it("components.schemas includes MeResponse and Unauthorized", async () => {
    const doc = await fetchDoc();
    const schemas = Object.keys(doc.components?.schemas ?? {});
    expect(schemas).toContain("MeResponse");
    expect(schemas).toContain("Unauthorized");
  });

  it("regression: GET /api/health still returns 200 with status and time", async () => {
    const app = createApp({ cronSecret: "test-secret" });
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; time: string };
    expect(body.status).toBe("ok");
    expect(typeof body.time).toBe("string");
    expect(Number.isNaN(Date.parse(body.time))).toBe(false);
  });

  it("regression: POST /api/echo still echoes message", async () => {
    const app = createApp({ cronSecret: "test-secret" });
    const res = await app.request("/api/echo", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-echo-token": "test" },
      body: JSON.stringify({ message: "hello" }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { message: string; repeated: string[] };
    expect(body.message).toBe("hello");
    expect(body.repeated).toHaveLength(1);
  });

  it("regression: POST /api/echo with invalid body returns 400 ValidationError", async () => {
    const app = createApp({ cronSecret: "test-secret" });
    const res = await app.request("/api/echo", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-echo-token": "test" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: string;
      issues: { path: string }[];
    };
    expect(body.error).toBe("ValidationError");
    expect(body.issues.length).toBeGreaterThan(0);
    expect(body.issues.some((i) => i.path.startsWith("body."))).toBe(true);
  });
});
