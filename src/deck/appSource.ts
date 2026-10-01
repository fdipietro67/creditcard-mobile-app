/**
 * Where the deck's live phone gets the card app from:
 *  - hosted deck: the app itself at /?preview=1
 *  - offline single-file deck: a copy of the single-file app packed into the deck (see deck-standalone.tsx)
 */
let offlineHtml: string | null = null;

export function setOfflineApp(html: string) {
  // Mark the embedded copy as a preview (no idle reset, accepts nav messages from the deck).
  offlineHtml = html.replace("</head>", "<script>window.__DEMO_PREVIEW__=true;</script></head>");
}

export const appFrameProps = (): { src?: string; srcDoc?: string } =>
  offlineHtml ? { srcDoc: offlineHtml } : { src: "/?preview=1" };

/**
 * postMessage target: our own origin when hosted. Opened from disk, the deck reports "file://" while
 * the embedded app is opaque ("null"), so no origin string matches — use "*" (messages carry only
 * screen names).
 */
export const postTarget = () =>
  window.location.protocol === "file:" || window.location.origin === "null" ? "*" : window.location.origin;
