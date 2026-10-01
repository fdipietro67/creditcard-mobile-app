# BNPL Cardholder App — Money20/20 demo

A themeable Buy Now, Pay Later cardholder app for the booth. It includes a Builder page where a rep
brands the app for a client and gets a short link, a QR code and a printable sign. The app is ported
from `bnpl-cobrand-prototype.html`.

By default (no client branding) the app shows a **Visa Signature** card for Money20/20. A client
config from the Builder or a link replaces it with the client's own card. It is an **illustrative
concept only**: balances, merchants and figures are sample data.

| Route | What it is |
| --- | --- |
| `/` | The demo app: phone frame + narration on a tablet/desktop, full-screen on a phone |
| `/?c=<id>` | A branded demo from a short link |
| `/builder` | The branding editor: live preview, short link + QR, print sign, offline file |
| `/api/c` | `POST` a config, get `{ id }` back (also accepts `PUT`) |
| `/api/c/:id` | `GET` a stored config |

Everything runs on **one Cloudflare Worker**. It serves the static app and the API, and stores
configs in one KV namespace. The KV namespace is the only backend.

## Run locally

```bash
npm install
npm run dev          # app + Builder with hot reload, http://localhost:5173 (no API)
npm run worker:dev   # full stack incl. the API with a local KV, http://localhost:8787
npm test             # BNPL math, config parsing, Worker API
npm run typecheck
```

## Deploy

The KV namespace `BNPL_DEMO_CONFIGS` already exists in the Cloudflare account, and its id is set in
`wrangler.jsonc`.

```bash
npx wrangler login        # once
npm run deploy            # builds, then deploys app + API to https://bnpl-card-demo.<subdomain>.workers.dev
```

Optional settings:

- **Lock link creation:** run `npx wrangler secret put BUILDER_KEY`. The Builder then asks for the key once per device. Reading links stays open.
- **Custom domain:** add it under the Worker's *Settings → Domains & Routes*. Short links use whichever origin the Builder is opened from.
- **Build the Builder elsewhere:** if the Builder runs on a different host from where attendees open links, set `VITE_PUBLIC_ORIGIN` at build time. Also set `VITE_CONFIG_API` to the API's origin and add that host to the `ALLOWED_ORIGINS` var.

## DemoConfig contract

```ts
type DemoConfig = {
  clientName?: string;      // "Acme Airways" -> "Acme Airways Card"; replaces the Visa Signature card
  cardholderName?: string;  // printed on the card
  accent?: string;          // #RRGGBB, drives the accent, soft tints and card gradient
  cardImage?: string|null;  // data:image/(png|jpeg|webp|gif) or https URL; replaces the card face
  rewardsLabel?: string;    // e.g. "AcmeMiles"
};
```

The app picks its config from the first source that has one:

0. `window.__DEMO_CONFIG__`, baked into a downloaded offline file.
1. `?c=<id>`: fetched from `/api/c/:id`. It is cached for offline use. If the lookup fails, the app falls back to the next source.
2. URL params: `?client=…&accent=…&holder=…&rewards=…`
3. Default: the Money20/20 Visa Signature card.

All input is sanitized by `src/config/schema.ts`, which the app and the Worker share. The Builder's
preview also pushes configs live with `postMessage({ __demoCfg: true, cfg })` (same origin only).

## Visa Signature card face

The default card is drawn in code: dark navy, chip, contactless arcs, and "VISA / Signature" at
bottom right. Any client branding (name, color or card image) replaces it. The Visa wordmark is a
trademark. Drop Visa's approved artwork in as `src/assets/brand/visa-logo.svg` (or `.png`) and
rebuild, and the card uses it automatically. Until then it shows a plain typeset placeholder.

## Booth behavior

- **Offline:** after the first load, the service worker serves the app shell, fonts and logos. Short-link configs are cached once opened. Fonts are self-hosted, so there is no Google Fonts dependency.
- **Idle reset:** after 90 seconds without input, the demo returns to a clean home screen. Use `?idle=<seconds>` to change this, or `?idle=0` to turn it off. The Builder preview never resets.
- **One-tap reset:** the **Reset** button sits above the phone on a tablet or desktop.
- **Phones:** the phone frame and narration are hidden. Touch targets are at least 44px, and hover effects only apply on devices with a pointer.

## Sharing options in the Builder

1. **Short link + QR:** includes the card image. You can copy it, open it, download the QR as a PNG, or print a sign with the client name and QR (Letter size).
2. **Quick link:** the name, color and labels go in the URL itself, with no server. It can't carry the card image.
3. **Offline file:** a single self-contained HTML file (about 0.5 MB) with the config baked in. It opens from disk with no network. It is built from `standalone.html` through `vite-plugin-singlefile`.

Uploaded card art is resized in the browser, typically to tens of KB. The Worker caps a config at 1.5 MB.

## BNPL model

`src/lib/bnpl.ts` uses a fixed monthly fee (Amex "Plan It" style), not amortization:
`monthly = P/months + P*feeRate`. For the $985.21 statement balance:

- 3 mo: **$339.29/mo**, 17.23% APR, total $1,017.87, interest $32.66
- 4 mo: **$246.30/mo**, 0% APR
- 5 mo: **$197.04/mo**, 0% APR

## Structure

```
src/config/   DemoConfig schema + sanitizing (shared with Worker), URL/short-link/postMessage resolution
src/lib/      BNPL math and formatting
src/app/      partners (sample data), state store, views, card face, icons, idle reset
src/builder/  Builder page, image resizing, offline-file download
src/styles/   app.css (prototype CSS, same class names, in a cascade layer), builder.css, fonts, Tailwind
worker/       Cloudflare Worker (API + static assets) and its tests
scripts/      make-icons.cjs (renders the PWA icons from public/favicon.svg)
```
