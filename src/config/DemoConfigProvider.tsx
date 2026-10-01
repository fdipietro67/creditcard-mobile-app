import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  configFromParams,
  fetchShortConfig,
  sanitizeConfig,
  type DemoConfig,
} from "./demoConfig";

type Ctx = {
  config: DemoConfig | null;
  ready: boolean;
  /** Embedded in the Builder's live preview (?preview=1): no idle reset, config via postMessage. */
  preview: boolean;
};
const DemoConfigContext = createContext<Ctx>({ config: null, ready: true, preview: false });

const CACHE_KEY = "bnpl-demo:last-short-config";

/**
 * Boot priority:
 *   0. window.__DEMO_CONFIG__ baked into a downloaded single-file build
 *   1. ?c=<shortId> resolved via the Worker/KV
 *   2. URL params (?client=&accent=&holder=&rewards=)
 *   3. bundled default (null → the Money20/20 Visa Signature card)
 * A parent window (the Builder's live preview) can push a config at any time with
 * postMessage({ __demoCfg: true, cfg }).
 */
export function DemoConfigProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Ctx>(() => {
    const p = new URLSearchParams(window.location.search);
    const preview = p.get("preview") === "1" || !!window.__DEMO_PREVIEW__;
    if (window.__DEMO_CONFIG__) return { config: sanitizeConfig(window.__DEMO_CONFIG__), ready: true, preview };
    return { config: configFromParams(p), ready: !p.get("c"), preview };
  });

  useEffect(() => {
    if (window.__DEMO_CONFIG__) return;
    const p = new URLSearchParams(window.location.search);
    const id = p.get("c");
    if (!id) return;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 5000);
    fetchShortConfig(id, ctl.signal)
      .then((cfg) => {
        setState((s) => ({ ...s, config: cfg, ready: true }));
        // Convenience only: lets a reopened short link brand itself offline even if the
        // service-worker cache was cleared. Correctness never depends on it.
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ id, cfg }));
        } catch {
          /* storage unavailable */
        }
      })
      .catch(() => {
        let cached: DemoConfig | null = null;
        try {
          const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
          if (raw && raw.id === id) cached = sanitizeConfig(raw.cfg);
        } catch {
          /* ignore */
        }
        setState((s) => ({ ...s, config: cached ?? s.config, ready: true }));
      })
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
  }, []);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      const d = ev.data;
      if (d && d.__demoCfg) setState((s) => ({ ...s, config: sanitizeConfig(d.cfg), ready: true }));
    };
    window.addEventListener("message", onMsg);
    // Tell an embedding Builder we're listening so it can push the current config.
    try {
      if (window.parent !== window)
        window.parent.postMessage({ __demoReady: true }, window.location.origin === "null" ? "*" : window.location.origin);
    } catch {
      /* opaque origin (file://) — nothing to notify */
    }
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return <DemoConfigContext.Provider value={state}>{children}</DemoConfigContext.Provider>;
}

export const useDemoConfig = () => useContext(DemoConfigContext);
