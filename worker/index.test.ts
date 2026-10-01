import { describe, expect, it } from "vitest";
import worker, { type Env } from "./index";
import { MAX_BODY } from "./limits";

function mockEnv(extra: Partial<Env> = {}): Env {
  const store = new Map<string, string>();
  const kv = {
    get: async (k: string) => store.get(k) ?? null,
    put: async (k: string, v: string) => void store.set(k, v),
  };
  const assets = { fetch: async () => new Response("asset") };
  return { CONFIGS: kv, ASSETS: assets, ...extra } as unknown as Env;
}

const post = (body: string, headers: Record<string, string> = {}) =>
  new Request("https://demo.example/api/c", { method: "POST", body, headers: { "content-type": "application/json", ...headers } });

describe("config API", () => {
  it("stores a sanitized config and returns it by short id", async () => {
    const env = mockEnv();
    const res = await worker.fetch(post(JSON.stringify({ clientName: " Acme Airways ", accent: "e4002b", junk: 1 })), env);
    expect(res.status).toBe(201);
    const { id } = (await res.json()) as { id: string };
    expect(id).toMatch(/^[A-Za-z0-9]{7}$/);
    const got = await worker.fetch(new Request(`https://demo.example/api/c/${id}`), env);
    expect(got.status).toBe(200);
    expect(await got.json()).toEqual({ clientName: "Acme Airways", accent: "#E4002B" });
  });

  it("drops non-image card data", async () => {
    const env = mockEnv();
    const res = await worker.fetch(post(JSON.stringify({ clientName: "X", cardImage: "javascript:alert(1)" })), env);
    const { id } = (await res.json()) as { id: string };
    const got = await (await worker.fetch(new Request(`https://demo.example/api/c/${id}`), env)).json();
    expect(got).toEqual({ clientName: "X", cardImage: null });
  });

  it("rejects empty, invalid, and oversized bodies", async () => {
    const env = mockEnv();
    expect((await worker.fetch(post("{}"), env)).status).toBe(400);
    expect((await worker.fetch(post("nope"), env)).status).toBe(400);
    const big = JSON.stringify({ clientName: "X", cardImage: "data:image/png;base64," + "A".repeat(MAX_BODY) });
    expect((await worker.fetch(post(big), env)).status).toBe(413);
  });

  it("enforces BUILDER_KEY when set", async () => {
    const env = mockEnv({ BUILDER_KEY: "s3cret" });
    const body = JSON.stringify({ clientName: "X" });
    expect((await worker.fetch(post(body), env)).status).toBe(401);
    expect((await worker.fetch(post(body, { "x-builder-key": "s3cret" }), env)).status).toBe(201);
  });

  it("404s unknown and malformed ids; non-API paths go to static assets", async () => {
    const env = mockEnv();
    expect((await worker.fetch(new Request("https://demo.example/api/c/ZZZZZZZ"), env)).status).toBe(404);
    expect((await worker.fetch(new Request("https://demo.example/api/c/../x"), env)).status).toBe(404);
    expect(await (await worker.fetch(new Request("https://demo.example/builder"), env)).text()).toBe("asset");
  });
});
