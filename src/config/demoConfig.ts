export type DemoConfig = {
  clientName?: string; // "Acme Airways" -> app title "Acme Airways Card", card, plan labels
  cardholderName?: string; // name printed on the card
  accent?: string; // #RRGGBB — drives accent + card gradient (soft/tints derived)
  cardImage?: string | null; // data URL or hosted URL; when set, replaces the whole card face
  rewardsLabel?: string; // optional, e.g. "AcmeMiles"
};

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHex(v: string | null | undefined): string | undefined {
  if (!v) return undefined;
  const m = v.trim().match(HEX);
  if (!m) return undefined;
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return "#" + h.toUpperCase();
}

export function hexA(hex: string, a: number) {
  const h = normalizeHex(hex);
  if (!h) return `rgba(76,111,255,${a})`;
  const n = parseInt(h.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const str = (v: unknown, max = 80) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

/** Coerce anything (KV JSON, postMessage payload) into a safe DemoConfig. */
export function sanitizeConfig(raw: unknown): DemoConfig {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const cfg: DemoConfig = {};
  const clientName = str(r.clientName);
  if (clientName) cfg.clientName = clientName;
  const holder = str(r.cardholderName, 40);
  if (holder) cfg.cardholderName = holder;
  const accent = normalizeHex(typeof r.accent === "string" ? r.accent : undefined);
  if (accent) cfg.accent = accent;
  const rewards = str(r.rewardsLabel, 40);
  if (rewards) cfg.rewardsLabel = rewards;
  if ("cardImage" in r) {
    const img = r.cardImage;
    cfg.cardImage =
      typeof img === "string" && /^(data:image\/|https:\/\/)/.test(img) ? img : null;
  }
  return cfg;
}

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

export const CONFIG_API: string = (import.meta.env.VITE_CONFIG_API as string | undefined) ?? "";

/** Resolve a short id via the Worker/KV: GET {CONFIG_API}/c/:id */
export async function fetchShortConfig(id: string, signal?: AbortSignal): Promise<DemoConfig> {
  const res = await fetch(`${CONFIG_API}/c/${encodeURIComponent(id)}`, { signal });
  if (!res.ok) throw new Error(`config ${id}: ${res.status}`);
  return sanitizeConfig(await res.json());
}
