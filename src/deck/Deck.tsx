import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SLIDES } from "./slides";
import "./deck.css";

const W = 1920;
const H = 1080;

/**
 * The Euronet Money20/20 deck.
 *   /deck              presenter mode: ← → / Space / click / swipe, F = fullscreen, K = toggle kiosk
 *   /deck?mode=kiosk   booth loop: auto-advances, skips unfinished slides, pauses while someone interacts
 *   /deck#5            open at slide 5
 */
export default function Deck() {
  const params = new URLSearchParams(window.location.search);
  const [kiosk, setKiosk] = useState(params.get("mode") === "kiosk");
  const holdDefault = Number(params.get("t")) || 12;

  const slides = useMemo(() => (kiosk ? SLIDES.filter((s) => !s.draft) : SLIDES), [kiosk]);
  const [i, setI] = useState(() => Math.max(0, Math.min(SLIDES.length - 1, (Number(window.location.hash.slice(1)) || 1) - 1)));
  const idx = Math.min(i, slides.length - 1);
  const slide = slides[idx];

  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => go(idx + 1), [go, idx]);
  const prev = useCallback(() => go(idx - 1), [go, idx]);

  useEffect(() => {
    document.title = "Euronet · Money20/20";
    if (!kiosk) history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${idx + 1}`);
  }, [idx, kiosk]);

  // Follow #n links while the deck is open.
  useEffect(() => {
    const onHash = () => {
      const n = Number(window.location.hash.slice(1));
      if (n >= 1) setI(n - 1);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Scale the 1920×1080 stage to the window.
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.("input,textarea")) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); next(); }
      else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(slides.length - 1);
      else if (e.key.toLowerCase() === "f") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.().catch(() => {});
      } else if (e.key.toLowerCase() === "k") setKiosk((k) => !k);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, slides.length]);

  // Kiosk: auto-advance; any touch pauses for 45s (someone is exploring the demo).
  const [pausedUntil, setPausedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!kiosk) return;
    const bump = () => setPausedUntil(Date.now() + 45000);
    window.addEventListener("pointerdown", bump, true);
    // touches inside the app iframe don't reach this window; blur means focus moved into it
    window.addEventListener("blur", bump);
    return () => {
      window.removeEventListener("pointerdown", bump, true);
      window.removeEventListener("blur", bump);
    };
  }, [kiosk]);
  useEffect(() => {
    if (!kiosk) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [kiosk]);
  const shownAt = useRef(Date.now());
  useEffect(() => {
    shownAt.current = Date.now();
  }, [idx]);
  useEffect(() => {
    if (!kiosk || now < pausedUntil) return;
    const hold = (slide.hold ?? holdDefault) * 1000;
    if (now - Math.max(shownAt.current, pausedUntil) >= hold) {
      if (document.activeElement instanceof HTMLIFrameElement) document.activeElement.blur();
      next();
    }
  }, [now, kiosk, pausedUntil, slide, holdDefault, next]);

  // Presenter controls appear on mouse movement, then fade (never on the projected slide for long).
  const [navShown, setNavShown] = useState(true);
  useEffect(() => {
    let t = window.setTimeout(() => setNavShown(false), 2500);
    const show = () => {
      setNavShown(true);
      clearTimeout(t);
      t = window.setTimeout(() => setNavShown(false), 2500);
    };
    window.addEventListener("mousemove", show);
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", show);
    };
  }, []);

  // Touch swipe (presenter mode).
  const touch = useRef<number | null>(null);

  return (
    <div
      className={`dk-root ${kiosk ? "kiosk" : ""}`}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null || kiosk) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 60) (dx < 0 ? next : prev)();
        touch.current = null;
      }}
    >
      <div className="dk-stage" style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div key={slide.id} className="dk-frame">
          {slide.render({ kiosk })}
        </div>
        <div className="dk-progress"><i style={{ width: `${((idx + 1) / slides.length) * 100}%` }} /></div>
      </div>

      {!kiosk && (
        <nav className={`dk-nav ${navShown ? "show" : ""}`} aria-label="Slides">
          <button onClick={prev} aria-label="Previous slide">‹</button>
          <span>{idx + 1} / {slides.length}{slide.draft ? " · draft" : ""}</span>
          <button onClick={next} aria-label="Next slide">›</button>
        </nav>
      )}
      {kiosk && now < pausedUntil && <div className="dk-paused">Auto-play paused · resumes when idle</div>}
    </div>
  );
}
