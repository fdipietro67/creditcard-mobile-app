# BNPL Cardholder App — Money20/20 demo

A themeable BNPL cardholder app demo, rebuilt from `bnpl-cobrand-prototype.html` as a
Vite + React + TypeScript + Tailwind SPA. **Illustrative concept only.** The partners are fictional
and all figures are sample data.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # BNPL math checks (the $985.21 figures)
npm run build      # static output in dist/
```

## DemoConfig contract

Each branded demo is the same app plus this config:

```ts
type DemoConfig = {
  clientName?: string;      // "Acme Airways" -> "Acme Airways Card"; hides the partner switch
  cardholderName?: string;  // printed on the card
  accent?: string;          // #RRGGBB, drives the accent, soft tints and card gradient
  cardImage?: string|null;  // data URL or https URL; replaces the whole card face
  rewardsLabel?: string;    // e.g. "AcmeMiles"
};
```

The app resolves the config at boot, in this order:

1. `?c=<shortId>`: fetched from `GET {VITE_CONFIG_API}/c/:id` (Worker + KV, coming in a later step).
   If the lookup fails or takes longer than 5s, the app falls back to the next source.
2. URL params: `?client=Acme%20Airways&accent=%23E4002B&holder=Dana%20Reyes&rewards=AcmeMiles`
3. Default: the fictional Altair / Casa partners, with the partner switch.

A parent window (the Builder's live preview) can also push a config at runtime:
`iframe.contentWindow.postMessage({ __demoCfg: true, cfg }, "*")`.

## Layout

- On a tablet or desktop, the app appears in a phone frame next to the narration, as in the prototype.
- On a phone (≤520px wide), it runs full-bleed without the phone frame, using safe-area insets.

## BNPL model

`src/lib/bnpl.ts` uses a fixed monthly fee, not amortization:
`monthly = P/months + P*feeRate`. For $985.21 this gives:

- 3 mo: $339.29 at 17.23% APR
- 4 mo: $246.30 at 0% APR
- 5 mo: $197.04 at 0% APR

`src/lib/bnpl.test.ts` checks these figures.

## Structure

```
src/config/   DemoConfig type, sanitizing, URL / short-id / postMessage resolution
src/lib/      BNPL math and formatting
src/app/      partners (sample data), state store, views, card face, icons, Barclays assets
src/styles/   app.css (the prototype's CSS, same class names) + Tailwind entry
```

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist`
- Env: `VITE_CONFIG_API` = the Worker's origin (once the Worker exists)
