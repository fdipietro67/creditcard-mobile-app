import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  configFromParams,
  fetchShortConfig,
  sanitizeConfig,
  type DemoConfig,
} from "./demoConfig";

type Ctx = { config: DemoConfig | null; ready: boolean };
const DemoConfigContext = createContext<Ctx>({ config: null, ready: true });

/**
 * Boot priority: (1) ?c=<shortId> via Worker/KV, (2) URL params, (3) bundled default (null →
 * fictional Altair/Casa partners with the switch). A parent window (the Builder's live preview)
 * can push a config at any time with postMessage({ __demoCfg: true, cfg }).
 */
export function DemoConfigProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Ctx>(() => {
    const p = new URLSearchParams(window.location.search);
    return { config: configFromParams(p), ready: !p.get("c") };
  });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get("c");
    if (!id) return;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 5000);
    fetchShortConfig(id, ctl.signal)
      .then((cfg) => setState({ config: cfg, ready: true }))
      .catch(() => setState((s) => ({ ...s, ready: true })))
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
  }, []);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const d = ev.data;
      if (d && d.__demoCfg) setState({ config: sanitizeConfig(d.cfg), ready: true });
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return <DemoConfigContext.Provider value={state}>{children}</DemoConfigContext.Provider>;
}

export const useDemoConfig = () => useContext(DemoConfigContext);
