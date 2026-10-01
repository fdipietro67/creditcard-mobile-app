import { registerSW } from "virtual:pwa-register";

/**
 * Offline after first load: the service worker precaches the app shell, fonts and logos, and
 * caches short-link configs as they're opened. Updates apply silently on the next launch so a
 * demo in progress is never interrupted.
 */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;
  registerSW({ immediate: true });
}
