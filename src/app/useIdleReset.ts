import { useEffect, useRef } from "react";

const EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;

/**
 * Calls onIdle after `seconds` without user input, so the booth demo is always clean for the
 * next person. seconds <= 0 disables it.
 */
export function useIdleReset(seconds: number, onIdle: () => void) {
  const cb = useRef(onIdle);
  cb.current = onIdle;
  useEffect(() => {
    if (!(seconds > 0)) return;
    let timer = window.setTimeout(() => cb.current(), seconds * 1000);
    const bump = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => cb.current(), seconds * 1000);
    };
    EVENTS.forEach((e) => window.addEventListener(e, bump, { capture: true, passive: true }));
    return () => {
      clearTimeout(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, bump, { capture: true }));
    };
  }, [seconds]);
}

/** ?idle=<seconds> overrides the 90s default; ?idle=0 turns it off (e.g. while a rep rehearses). */
export function idleSecondsFromUrl(def = 90): number {
  const v = new URLSearchParams(window.location.search).get("idle");
  if (v == null) return def;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : def;
}
