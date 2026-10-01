import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import QRCode from "qrcode";
import {
  ConfigApiError,
  normalizeHex,
  saveShortConfig,
  shareUrl,
  type DemoConfig,
} from "../config/demoConfig";
import { dataUrlBytes, downscaleImage } from "./image";
import { downloadBrandedHtml, slug } from "./standalone";

const PRESETS = ["#1434CB", "#E4002B", "#0B7A5C", "#C05A38", "#7A3CE0", "#0E1726", "#00A3AD", "#F28C00"];

// Base for links/QR codes. In production this is the Worker's own origin; override with
// VITE_PUBLIC_ORIGIN when building somewhere other than where attendees will open links.
const PUBLIC_ORIGIN: string =
  (import.meta.env.VITE_PUBLIC_ORIGIN as string | undefined) || window.location.origin;

type Draft = { clientName: string; cardholderName: string; rewardsLabel: string; accent: string; cardImage: string | null };
type Recent = { id: string; clientName: string; created: string };

// accent "" = not chosen → the app keeps its default (Visa Signature) look until a color is picked.
const DEFAULT_ACCENT = "#1434CB";
const EMPTY: Draft = { clientName: "", cardholderName: "", rewardsLabel: "", accent: "", cardImage: null };

// localStorage is a rep convenience only (last draft, recent links, builder key) — always guarded.
const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem("bnpl-builder:" + k);
      return v ? (JSON.parse(v) as T) : d;
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem("bnpl-builder:" + k, JSON.stringify(v));
    } catch {
      /* quota / private mode — fine */
    }
  },
};

function toConfig(d: Draft): DemoConfig {
  const cfg: DemoConfig = {};
  if (d.clientName.trim()) cfg.clientName = d.clientName.trim();
  if (d.cardholderName.trim()) cfg.cardholderName = d.cardholderName.trim();
  if (d.rewardsLabel.trim()) cfg.rewardsLabel = d.rewardsLabel.trim();
  const hex = normalizeHex(d.accent);
  if (hex) cfg.accent = hex;
  if (d.cardImage) cfg.cardImage = d.cardImage;
  return cfg;
}

export default function Builder() {
  const [draft, setDraft] = useState<Draft>(() => ({ ...EMPTY, ...store.get<Partial<Draft>>("draft", {}) }));
  const [hexText, setHexText] = useState(draft.accent);
  const [imgErr, setImgErr] = useState<string | null>(null);
  const [link, setLink] = useState<{ id: string; url: string; cfgKey: string } | null>(null);
  const [busy, setBusy] = useState<"link" | "file" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needKey, setNeedKey] = useState(false);
  const [builderKey, setBuilderKey] = useState(() => store.get("key", ""));
  const [recent, setRecent] = useState<Recent[]>(() => store.get("recent", []));
  const [copied, setCopied] = useState<string | null>(null);

  const cfg = useMemo(() => toConfig(draft), [draft]);
  const cfgKey = useMemo(() => JSON.stringify(cfg), [cfg]);
  const stale = !!link && link.cfgKey !== cfgKey;
  const quickUrl = useMemo(() => shareUrl(PUBLIC_ORIGIN, cfg), [cfg]);

  useEffect(() => store.set("draft", draft), [draft]);
  useEffect(() => {
    document.title = "Demo Builder · BNPL Card";
  }, []);

  const update = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  // --- live preview -------------------------------------------------------------------------
  const frame = useRef<HTMLIFrameElement>(null);
  const push = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ __demoCfg: true, cfg }, window.location.origin);
  }, [cfg]);
  useEffect(push, [push]);
  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      if (ev.origin === window.location.origin && ev.data?.__demoReady) push();
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [push]);

  // --- actions ------------------------------------------------------------------------------
  async function onFile(f: File | undefined) {
    if (!f) return;
    setImgErr(null);
    try {
      update({ cardImage: await downscaleImage(f) });
    } catch (e) {
      setImgErr((e as Error).message);
    }
  }

  async function createLink() {
    if (!cfg.clientName) {
      setError("Add a client name first.");
      return;
    }
    setBusy("link");
    setError(null);
    try {
      const id = await saveShortConfig(cfg, builderKey || undefined);
      const url = shareUrl(PUBLIC_ORIGIN, cfg, id);
      setLink({ id, url, cfgKey });
      setNeedKey(false);
      const next = [{ id, clientName: cfg.clientName, created: new Date().toISOString() }, ...recent.filter((r) => r.id !== id)].slice(0, 12);
      setRecent(next);
      store.set("recent", next);
    } catch (e) {
      if (e instanceof ConfigApiError && e.status === 401) {
        setNeedKey(true);
        setError("This server needs a builder key to create links.");
      } else if (e instanceof ConfigApiError && e.status === 413) {
        setError("The card image is too large. Try a smaller file.");
      } else {
        setError(
          "Couldn't reach the link service. You can still share the quick link (no card image) or download the offline file.",
        );
      }
    } finally {
      setBusy(null);
    }
  }

  async function downloadFile() {
    setBusy("file");
    setError(null);
    try {
      await downloadBrandedHtml(cfg);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      window.prompt("Copy this link:", text);
    }
  }

  const shownUrl = link && !stale ? link.url : null;

  return (
    <div className="builder min-h-dvh bg-[#E9EDF4] font-sans text-ink">
      <header className="no-print flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="size-9 rounded-[10px]" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[.14em] text-highlight">BNPL card demo</div>
            <h1 className="font-display text-xl font-bold tracking-tight">Demo Builder</h1>
          </div>
        </div>
        <a href="/" className="rounded-full border border-[#E7ECF3] bg-white px-4 py-2.5 text-sm font-semibold text-ink-2">
          Open default demo
        </a>
      </header>

      <main className="no-print mx-auto grid max-w-[1320px] gap-6 px-5 pb-12 sm:px-8 lg:grid-cols-[minmax(300px,380px)_auto_minmax(300px,1fr)]">
        {/* ---------------- form ---------------- */}
        <section className="flex flex-col gap-5">
          <Panel title="Brand">
            <Field label="Client name" hint="Shown as “<name> Card” and on the card face.">
              <input
                className="inp"
                value={draft.clientName}
                placeholder="Acme Airways"
                maxLength={80}
                onChange={(e) => update({ clientName: e.target.value })}
              />
            </Field>
            <Field label="Cardholder name" hint="Optional, printed on the card.">
              <input
                className="inp"
                value={draft.cardholderName}
                placeholder="J. Ellis"
                maxLength={40}
                onChange={(e) => update({ cardholderName: e.target.value })}
              />
            </Field>
            <Field label="Rewards label" hint="Optional, e.g. AcmeMiles.">
              <input
                className="inp"
                value={draft.rewardsLabel}
                placeholder="AcmeMiles"
                maxLength={40}
                onChange={(e) => update({ rewardsLabel: e.target.value })}
              />
            </Field>
            <Field label="Accent color" hint="Leave empty to keep the default Visa Signature card.">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  aria-label="Pick accent color"
                  className="h-11 w-14 cursor-pointer rounded-xl border border-[#E7ECF3] bg-white p-1"
                  value={normalizeHex(draft.accent) ?? DEFAULT_ACCENT}
                  onChange={(e) => {
                    update({ accent: e.target.value.toUpperCase() });
                    setHexText(e.target.value.toUpperCase());
                  }}
                />
                <input
                  className="inp font-mono uppercase"
                  value={hexText}
                  placeholder="Default"
                  maxLength={7}
                  aria-label="Accent hex"
                  onChange={(e) => {
                    setHexText(e.target.value);
                    const h = normalizeHex(e.target.value);
                    if (h) update({ accent: h });
                    else if (!e.target.value.trim()) update({ accent: "" });
                  }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {PRESETS.map((c) => (
                  <button
                    key={c}
                    aria-label={`Use ${c}`}
                    onClick={() => {
                      update({ accent: c });
                      setHexText(c);
                    }}
                    className={`size-11 rounded-full border-2 ${normalizeHex(draft.accent) === c ? "border-ink" : "border-white"} shadow-sm`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </Field>
          </Panel>

          <Panel title="Card art" subtitle="Optional. Replaces the whole card face. Landscape works best (about 1.6 : 1).">
            <label
              className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#CBD5E3] bg-[#F4F6FB] p-4 text-center text-sm text-ink-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onFile(e.dataTransfer.files[0]);
              }}
            >
              {draft.cardImage ? (
                <img src={draft.cardImage} alt="Card art" className="max-h-36 rounded-xl object-cover shadow" />
              ) : (
                <>
                  <span className="font-semibold text-ink">Tap to upload or drop an image</span>
                  <span className="text-xs text-ink-3">PNG, JPG or WebP</span>
                </>
              )}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {draft.cardImage && (
              <div className="mt-3 flex items-center justify-between text-xs text-ink-3">
                <span>{Math.round(dataUrlBytes(draft.cardImage) / 1024)} KB after resizing</span>
                <button className="min-h-11 px-2 font-semibold text-accent" onClick={() => update({ cardImage: null })}>
                  Remove image
                </button>
              </div>
            )}
            {imgErr && <p className="mt-2 text-sm text-[#C0362C]">{imgErr}</p>}
          </Panel>

          <button
            className="min-h-11 self-start px-1 text-sm font-semibold text-ink-3 underline-offset-4 hover:underline"
            onClick={() => {
              setDraft(EMPTY);
              setHexText(EMPTY.accent);
              setLink(null);
            }}
          >
            Clear all fields
          </button>
        </section>

        {/* ---------------- preview ---------------- */}
        <section className="flex flex-col items-center gap-3 lg:sticky lg:top-6 lg:self-start">
          <div className="text-[10px] font-semibold uppercase tracking-[.08em] text-ink-3">Live preview</div>
          <div className="rounded-[44px] bg-[#05070C] p-[10px] shadow-[0_40px_90px_-30px_rgba(14,23,38,.55)]">
            <iframe
              ref={frame}
              title="App preview"
              src="/?preview=1"
              onLoad={push}
              className="block h-[720px] w-[340px] rounded-[34px] border-0 bg-[#F4F6FB]"
            />
          </div>
          <p className="max-w-[340px] text-center text-xs leading-relaxed text-ink-3">
            The preview is fully interactive, so you can run the BNPL flow here.
          </p>
        </section>

        {/* ---------------- share ---------------- */}
        <section className="flex flex-col gap-5">
          <Panel title="Share" subtitle="Creates a short link and QR code that open this branded app on any phone.">
            {needKey && (
              <Field label="Builder key" hint="Ask the demo owner. It's saved on this device.">
                <input
                  className="inp"
                  type="password"
                  value={builderKey}
                  onChange={(e) => {
                    setBuilderKey(e.target.value);
                    store.set("key", e.target.value);
                  }}
                />
              </Field>
            )}
            <button className="btn-primary" disabled={busy !== null} onClick={createLink}>
              {busy === "link" ? "Creating…" : link && !stale ? "Create a new link" : "Create share link + QR"}
            </button>
            {stale && <p className="mt-2 text-xs text-[#B26A00]">You changed the branding. Create a new link to include the changes.</p>}
            {error && <p className="mt-3 text-sm leading-snug text-[#C0362C]">{error}</p>}

            {shownUrl && link && (
              <div className="mt-5 flex flex-col items-center gap-4">
                <Qr url={shownUrl} />
                <div className="w-full break-all rounded-xl bg-[#F4F6FB] px-3 py-2.5 text-center font-mono text-[13px]">{shownUrl}</div>
                <div className="grid w-full grid-cols-2 gap-2">
                  <button className="btn-secondary" onClick={() => copy(shownUrl, "link")}>
                    {copied === "link" ? "Copied" : "Copy link"}
                  </button>
                  <a className="btn-secondary" href={shownUrl} target="_blank" rel="noreferrer">
                    Open
                  </a>
                  <button className="btn-secondary" onClick={() => downloadQrPng(shownUrl, cfg.clientName || "demo")}>
                    QR as PNG
                  </button>
                  <button className="btn-secondary" onClick={() => window.print()}>
                    Print sign
                  </button>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Without the link service">
            <div className="text-sm font-semibold">Quick link</div>
            <p className="mt-1 text-xs leading-relaxed text-ink-3">
              Puts the name, color and labels in the URL itself, so no server is needed.
              {cfg.cardImage ? " It can't carry the card image." : ""}
            </p>
            <div className="mt-2 flex gap-2">
              <input className="inp font-mono text-xs" readOnly value={quickUrl} onFocus={(e) => e.target.select()} />
              <button className="btn-secondary shrink-0 px-4" onClick={() => copy(quickUrl, "quick")}>
                {copied === "quick" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="mt-5 text-sm font-semibold">Offline file</div>
            <p className="mt-1 text-xs leading-relaxed text-ink-3">
              A single branded HTML file, including the card image, that opens from disk with no network at all.
            </p>
            <button className="btn-secondary mt-2 w-full" disabled={busy !== null} onClick={downloadFile}>
              {busy === "file" ? "Preparing…" : "Download branded file"}
            </button>
          </Panel>

          {recent.length > 0 && (
            <Panel title="Recent links" subtitle="Saved on this device.">
              <ul className="-my-1 divide-y divide-[#E7ECF3]">
                {recent.map((r) => {
                  const url = new URL(`/?c=${r.id}`, PUBLIC_ORIGIN).toString();
                  return (
                    <li key={r.id} className="flex items-center gap-3 py-2">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{r.clientName}</div>
                        <div className="text-xs text-ink-3">
                          {r.id} · {new Date(r.created).toLocaleDateString()}
                        </div>
                      </div>
                      <button className="btn-secondary px-3 text-xs" onClick={() => copy(url, r.id)}>
                        {copied === r.id ? "Copied" : "Copy"}
                      </button>
                      <a className="btn-secondary px-3 text-xs" href={url} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}

          <p className="text-[11px] leading-relaxed text-ink-3">
            <b className="text-ink-2">Illustrative only.</b> Branded demos are concept mock-ups with sample data, not a live product or a rate offer.
            Only upload artwork you have permission to use.
          </p>
        </section>
      </main>

      {/* Print-only sign: client name + QR for the booth table. */}
      {shownUrl && (
        <div className="print-only print-sign">
          <img src="/favicon.svg" alt="" style={{ height: 56, borderRadius: 14 }} />
          <h1>{cfg.clientName} Card</h1>
          <p className="lead">Scan to try the Buy Now, Pay Later experience</p>
          <Qr url={shownUrl} size={420} />
          <p className="url">{shownUrl}</p>
          <p className="fine">Illustrative concept with sample data. Not a live product or rate offer.</p>
        </div>
      )}
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[#E7ECF3] bg-white p-5 shadow-[0_1px_3px_rgba(14,23,38,.05)]">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1 text-xs leading-relaxed text-ink-3">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 text-[13px] font-semibold text-ink-2">{label}</div>
      {children}
      {hint && <div className="mt-1 text-xs text-ink-3">{hint}</div>}
    </div>
  );
}

function Qr({ url, size = 220 }: { url: string; size?: number }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let live = true;
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0E1726", light: "#FFFFFF" } }).then(
      (s) => live && setSvg(s),
    );
    return () => {
      live = false;
    };
  }, [url]);
  // The SVG is generated locally by the qrcode library from our own URL.
  return <div className="qr" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

async function downloadQrPng(url: string, name: string) {
  const data = await QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M" });
  const a = document.createElement("a");
  a.href = data;
  a.download = `${slug(name)}-qr.png`;
  a.click();
}
