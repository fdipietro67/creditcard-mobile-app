import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SLIDES, type SlideDef } from "./slides";
import { NOTES } from "./notes";
import { postTarget } from "./appSource";
import "./deck.css";

const W = 1920;
const H = 1080;

/**
 * The Euronet Money20/20 deck.
 *   /deck              presenter mode: ← → / Space / click / swipe, F = fullscreen, K = toggle kiosk
 *   /deck?mode=kiosk   booth loop: auto-advances, skips unfinished slides, pauses while someone interacts
 *   /deck#5            open at slide 5
 *   N = speaker notes drawer, S = open the presenter window (notes, next slide, timer; stays in sync)
 */
export default function Deck() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("presenter") === "1") return <PresenterView />;
  return <Audience params={params} />;
}

type DeckMsg = { __deck: "go"; id: string } | { __deck: "hello" } | { __deck: "state"; id: string };

function Audience({ params }: { params: URLSearchParams }) {
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
      else if (e.key.toLowerCase() === "n") setNotesOpen((v) => !v);
      else if (e.key.toLowerCase() === "s") openPresenter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, slides.length]);

  // Speaker notes: drawer (N) and a synced presenter window (S).
  const [notesOpen, setNotesOpen] = useState(false);
  const presenter = useRef<Window | null>(null);
  const openPresenter = useCallback(() => {
    const url = `${window.location.pathname}?presenter=1#${idx + 1}`;
    presenter.current = window.open(url, "euronet-presenter", "width=1280,height=800");
  }, [idx]);
  useEffect(() => {
    presenter.current?.postMessage({ __deck: "state", id: slide.id } satisfies DeckMsg, postTarget());
  }, [slide.id]);
  useEffect(() => {
    const onMsg = (ev: MessageEvent<DeckMsg>) => {
      if (!ev.data?.__deck || ev.source !== presenter.current) return;
      if (ev.data.__deck === "go") {
        const n = slides.findIndex((s) => s.id === (ev.data as { id: string }).id);
        if (n >= 0) setI(n);
      }
      presenter.current?.postMessage({ __deck: "state", id: slide.id } satisfies DeckMsg, postTarget());
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [slides, slide.id]);

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
          <button className="txt" onClick={() => setNotesOpen((v) => !v)} aria-pressed={notesOpen} title="Speaker notes (N)">Notes</button>
          <button className="txt" onClick={openPresenter} title="Presenter window (S)">Presenter</button>
        </nav>
      )}
      {!kiosk && notesOpen && (
        <aside className="dk-notes" aria-label="Speaker notes">
          <NotesBody slide={slide} n={idx + 1} total={slides.length} />
        </aside>
      )}
      {kiosk && now < pausedUntil && <div className="dk-paused">Auto-play paused · resumes when idle</div>}
    </div>
  );
}

function NotesBody({ slide, n, total }: { slide: SlideDef; n: number; total: number }) {
  const note = NOTES[slide.id];
  return (
    <>
      <div className="dk-notes-h">
        <span>Slide {n} / {total}</span>
        <span>{slide.section}{slide.draft ? " · draft" : ""}</span>
      </div>
      {note ? (
        <>
          <ul>
            {note.say.map((l, i) => (
              <li key={i} className={l.startsWith("[To add]") ? "todo" : ""}>{l}</li>
            ))}
          </ul>
          {note.tip && <p className="dk-notes-tip"><b>Tip</b> {note.tip}</p>}
        </>
      ) : (
        <p className="dk-notes-empty">No notes for this slide.</p>
      )}
    </>
  );
}

/** A slide rendered at 1920×1080 and scaled into a box of the given width. */
function SlideThumb({ slide, width }: { slide: SlideDef; width: number }) {
  const s = width / W;
  return (
    <div className="dk-thumb" style={{ width, height: H * s }}>
      <div style={{ width: W, height: H, transform: `scale(${s})`, transformOrigin: "0 0", position: "relative" }}>
        {slide.render({ kiosk: false })}
      </div>
    </div>
  );
}

/** Presenter window: current + next slide, notes, timer. Drives the audience window. */
function PresenterView() {
  const [i, setI] = useState(() => Math.max(0, Math.min(SLIDES.length - 1, (Number(window.location.hash.slice(1)) || 1) - 1)));
  const slide = SLIDES[i];
  const nextSlide = SLIDES[i + 1];
  const [start, setStart] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [size, setSize] = useState(24);
  const [vw, setVw] = useState(window.innerWidth);

  const tell = useCallback((msg: DeckMsg) => window.opener?.postMessage(msg, postTarget()), []);
  const go = useCallback(
    (n: number) => {
      const k = Math.max(0, Math.min(SLIDES.length - 1, n));
      setI(k);
      tell({ __deck: "go", id: SLIDES[k].id });
    },
    [tell],
  );

  useEffect(() => {
    document.title = "Presenter · Euronet deck";
    tell({ __deck: "hello" });
    const onMsg = (ev: MessageEvent<DeckMsg>) => {
      if (ev.source !== window.opener || ev.data?.__deck !== "state") return;
      const n = SLIDES.findIndex((s) => s.id === (ev.data as { id: string }).id);
      if (n >= 0) setI(n);
    };
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("message", onMsg);
    window.addEventListener("resize", onResize);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.removeEventListener("message", onMsg);
      window.removeEventListener("resize", onResize);
      clearInterval(t);
    };
  }, [tell]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(i + 1); }
      else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(i - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, i]);

  const secs = Math.floor((now - start) / 1000);
  const elapsed = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  const curW = Math.max(320, Math.min(760, vw * 0.5));

  return (
    <div className="dk-root dk-presenter" style={{ ["--note-size" as string]: `${size}px` }}>
      <header className="dk-p-bar">
        <span className="dk-p-count">Slide {i + 1} / {SLIDES.length}</span>
        <span className="dk-p-section">{slide.section}{slide.draft ? " · draft" : ""}</span>
        <span className="dk-p-timer" title="Elapsed">{elapsed}</span>
        <button onClick={() => setStart(Date.now())}>Reset timer</button>
        <span className="dk-p-clock">{new Date(now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
        {!window.opener && <span className="dk-p-warn">Not linked to the slides — open this with S from the deck</span>}
      </header>
      <div className="dk-p-main">
        <div className="dk-p-left">
          <SlideThumb key={slide.id} slide={slide} width={curW} />
          <div className="dk-p-next">
            <span>Next</span>
            {nextSlide ? <SlideThumb key={nextSlide.id} slide={nextSlide} width={curW * 0.45} /> : <em>End of deck</em>}
          </div>
        </div>
        <div className="dk-p-notes">
          <div className="dk-p-tools">
            <span>Notes</span>
            <button onClick={() => setSize((x) => Math.max(16, x - 2))} aria-label="Smaller text">A−</button>
            <button onClick={() => setSize((x) => Math.min(40, x + 2))} aria-label="Larger text">A+</button>
          </div>
          <NotesBody slide={slide} n={i + 1} total={SLIDES.length} />
        </div>
      </div>
      <footer className="dk-p-foot">
        <button onClick={() => go(i - 1)} disabled={i === 0}>‹ Previous</button>
        <button className="primary" onClick={() => go(i + 1)} disabled={i === SLIDES.length - 1}>Next ›</button>
      </footer>
    </div>
  );
}
