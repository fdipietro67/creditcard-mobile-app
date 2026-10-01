/**
 * BNPL demo Worker: serves the static SPA (via the assets binding) and a tiny config API backed
 * by one KV namespace.
 *
 *   POST /api/c        body: DemoConfig JSON  → 201 { id }
 *   PUT  /api/c        same as POST (alias)
 *   GET  /api/c/:id    → DemoConfig JSON
 *
 * Writes can be locked with the BUILDER_KEY secret (sent as `x-builder-key`). Reads are open, as
 * short links are opened by attendees on their own phones.
 */
import { sanitizeConfig } from "../src/config/schema";
import { MAX_BODY } from "./limits";

export interface Env {
  CONFIGS: KVNamespace;
  ASSETS: Fetcher;
  BUILDER_KEY?: string;
  /** Comma-separated extra origins allowed to call the API cross-origin (e.g. a local dev host). */
  ALLOWED_ORIGINS?: string;
}

const TTL_SECONDS = 60 * 60 * 24 * 365;
const ID_LEN = 7;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; // no 0/O/1/l/I
const ID_RE = /^[A-Za-z0-9]{6,12}$/;

function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LEN));
  let s = "";
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return s;
}

function corsHeaders(req: Request, env: Env): Record<string, string> {
  const origin = req.headers.get("origin");
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, PUT, OPTIONS",
    "access-control-allow-headers": "content-type, x-builder-key",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

function json(body: unknown, status: number, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });
}

async function handleApi(req: Request, env: Env, url: URL): Promise<Response> {
  const cors = corsHeaders(req, env);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  if (url.pathname === "/api/c" && (req.method === "POST" || req.method === "PUT")) {
    if (env.BUILDER_KEY && req.headers.get("x-builder-key") !== env.BUILDER_KEY)
      return json({ error: "builder key required" }, 401, cors);
    const len = Number(req.headers.get("content-length") || 0);
    if (len > MAX_BODY) return json({ error: "config too large" }, 413, cors);
    const text = await req.text();
    if (text.length > MAX_BODY) return json({ error: "config too large" }, 413, cors);
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return json({ error: "invalid JSON" }, 400, cors);
    }
    const cfg = sanitizeConfig(raw);
    if (!Object.keys(cfg).length) return json({ error: "empty config" }, 400, cors);

    let id = newId();
    for (let i = 0; i < 5 && (await env.CONFIGS.get(id)) !== null; i++) id = newId();
    await env.CONFIGS.put(id, JSON.stringify(cfg), {
      expirationTtl: TTL_SECONDS,
      metadata: { clientName: cfg.clientName ?? null, created: new Date().toISOString() },
    });
    return json({ id }, 201, cors);
  }

  const m = url.pathname.match(/^\/api\/c\/([^/]+)$/);
  if (m && req.method === "GET") {
    if (!ID_RE.test(m[1])) return json({ error: "not found" }, 404, cors);
    const v = await env.CONFIGS.get(m[1]);
    if (v === null) return json({ error: "not found" }, 404, cors);
    return new Response(v, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=300",
        ...cors,
      },
    });
  }

  return json({ error: "not found" }, 404, cors);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) return handleApi(req, env, url);
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
