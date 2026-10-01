import type { DemoConfig } from "../config/schema";

/**
 * Zero-network fallback: fetch the single-file build (all JS, CSS, fonts and logos inlined) and
 * bake the config in as window.__DEMO_CONFIG__. The result opens straight from disk.
 */
export async function downloadBrandedHtml(cfg: DemoConfig) {
  const res = await fetch("/standalone.html");
  if (!res.ok) throw new Error("The offline file isn't available in this build.");
  const html = await res.text();
  const payload = JSON.stringify(cfg).replace(/</g, "\\u003c");
  const title = cfg.clientName ? `${cfg.clientName} Card` : "Card App Demo";
  const out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace("</head>", `<script>window.__DEMO_CONFIG__=${payload};</script></head>`);
  const blob = new Blob([out], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${slug(cfg.clientName || "bnpl")}-card-demo.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "demo";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
