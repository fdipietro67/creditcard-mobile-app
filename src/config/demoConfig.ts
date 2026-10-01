import { sanitizeConfig, type DemoConfig } from "./schema";

export * from "./schema";

/** Lightweight URL params: ?client=&accent=&holder=&rewards= */
export function configFromParams(p: URLSearchParams): DemoConfig | null {
  const cfg = sanitizeConfig({
    clientName: p.get("client"),
    accent: p.get("accent"),
    cardholderName: p.get("holder"),
    rewardsLabel: p.get("rewards"),
  });
  return Object.keys(cfg).length ? cfg : null;
}

/** Origin of the config API. Empty = same origin (the Worker serves both app and API). */
export const CONFIG_API: string = (import.meta.env.VITE_CONFIG_API as string | undefined) ?? "";

export const SHORT_ID = /^[A-Za-z0-9]{6,12}$/;

/** Resolve a short id via the Worker/KV: GET {CONFIG_API}/api/c/:id */
export async function fetchShortConfig(id: string, signal?: AbortSignal): Promise<DemoConfig> {
  if (!SHORT_ID.test(id)) throw new Error("bad id");
  const res = await fetch(`${CONFIG_API}/api/c/${id}`, { signal });
  if (!res.ok) throw new Error(`config ${id}: ${res.status}`);
  return sanitizeConfig(await res.json());
}

/** Store a config and get its short id: POST {CONFIG_API}/api/c */
export class ConfigApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function saveShortConfig(cfg: DemoConfig, builderKey?: string): Promise<string> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (builderKey) headers["x-builder-key"] = builderKey;
  const res = await fetch(`${CONFIG_API}/api/c`, {
    method: "POST",
    headers,
    body: JSON.stringify(sanitizeConfig(cfg)),
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      msg = ((await res.json()) as { error?: string }).error || msg;
    } catch {
      /* non-JSON (e.g. the API isn't deployed here) */
    }
    throw new ConfigApiError(res.status, msg);
  }
  const { id } = (await res.json()) as { id: string };
  return id;
}

/** Shareable URL for a config. With a short id → ?c=; otherwise lightweight params (no image). */
export function shareUrl(base: string, cfg: DemoConfig, id?: string): string {
  const u = new URL("/", base);
  if (id) {
    u.searchParams.set("c", id);
    return u.toString();
  }
  if (cfg.clientName) u.searchParams.set("client", cfg.clientName);
  if (cfg.accent) u.searchParams.set("accent", cfg.accent);
  if (cfg.cardholderName) u.searchParams.set("holder", cfg.cardholderName);
  if (cfg.rewardsLabel) u.searchParams.set("rewards", cfg.rewardsLabel);
  return u.toString();
}

declare global {
  interface Window {
    __DEMO_CONFIG__?: unknown;
    /** Set when the app is embedded in the offline deck. */
    __DEMO_PREVIEW__?: boolean;
  }
}
