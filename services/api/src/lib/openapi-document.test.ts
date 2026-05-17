import { describe, expect, it } from "vitest";

import { getOpenApiDocument } from "./openapi-document";

type OpenAPIDoc = {
  openapi: string;
  info: { title: string; version: string };
  paths: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
  };
};

describe("getOpenApiDocument", () => {
  async function fetchDoc(): Promise<OpenAPIDoc> {
    return (await getOpenApiDocument()) as OpenAPIDoc;
  }

  it("returns an OpenAPI 3.0 document with info.title 'Picks Leagues API'", async () => {
    const doc = await fetchDoc();
    expect(doc.openapi).toBe("3.0.0");
    expect(doc.info.title).toBe("Picks Leagues API");
  });

  it("document contains GET /api/health path with HealthResponse 200 schema", async () => {
    const doc = await fetchDoc();
    const healthGet = (doc.paths["/api/health"] as Record<string, unknown>)?.[
      "get"
    ] as Record<string, unknown>;
    expect(healthGet).toBeDefined();
    const response200 = (healthGet?.["responses"] as Record<string, unknown>)?.[
      "200"
    ] as Record<string, unknown>;
    expect(response200).toBeDefined();
    const schema = (
      (response200?.["content"] as Record<string, unknown>)?.[
        "application/json"
      ] as Record<string, unknown>
    )?.["schema"] as Record<string, unknown>;
    expect(schema).toBeDefined();
    expect(
      typeof schema?.["$ref"] === "string" &&
        schema["$ref"].includes("HealthResponse"),
    ).toBe(true);
  });

  it("document contains POST /api/echo path with EchoRequest body and ValidationError 400", async () => {
    const doc = await fetchDoc();
    const echoPost = (doc.paths["/api/echo"] as Record<string, unknown>)?.[
      "post"
    ] as Record<string, unknown>;
    expect(echoPost).toBeDefined();

    const requestBody = echoPost?.["requestBody"] as Record<string, unknown>;
    expect(requestBody).toBeDefined();
    const bodySchema = (
      (requestBody?.["content"] as Record<string, unknown>)?.[
        "application/json"
      ] as Record<string, unknown>
    )?.["schema"] as Record<string, unknown>;
    expect(bodySchema).toBeDefined();
    expect(
      typeof bodySchema?.["$ref"] === "string" &&
        bodySchema["$ref"].includes("EchoRequest"),
    ).toBe(true);

    const response400 = (echoPost?.["responses"] as Record<string, unknown>)?.[
      "400"
    ] as Record<string, unknown>;
    expect(response400).toBeDefined();
    const schema400 = (
      (response400?.["content"] as Record<string, unknown>)?.[
        "application/json"
      ] as Record<string, unknown>
    )?.["schema"] as Record<string, unknown>;
    expect(
      typeof schema400?.["$ref"] === "string" &&
        schema400["$ref"].includes("ValidationError"),
    ).toBe(true);
  });

  it("document.components.schemas includes HealthResponse, EchoResponse, ValidationError", async () => {
    const doc = await fetchDoc();
    const schemaKeys = Object.keys(doc.components?.schemas ?? {});
    expect(schemaKeys).toContain("HealthResponse");
    expect(schemaKeys).toContain("EchoResponse");
    expect(schemaKeys).toContain("ValidationError");
  });
});
