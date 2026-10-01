/**
 * Euronet slide kit: every slide is built from these pieces so branding, spacing and type stay
 * identical across the deck. Brand: Euronet blue #243F90, teal #00B7B0 (see assets/brand/README).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import euronetWhite from "../assets/brand/euronet-logo-white.svg";
import euronetColor from "../assets/brand/euronet-logo.svg";
import renLogo from "../assets/brand/ren-logo.png";
import corecardLogo from "../assets/brand/corecard-logo.png";

export const LOGOS = { euronetWhite, euronetColor, ren: renLogo, corecard: corecardLogo };
export type Brand = "euronet" | "ren" | "corecard";

/** Standard content slide: header (logos), title with teal bar, body, footer. */
export function Slide({
  section,
  brand = "euronet",
  kicker,
  title,
  lede,
  children,
  tone = "light",
  aside,
}: {
  aside?: ReactNode;
  section: string;
  brand?: Brand;
  kicker?: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  tone?: "light" | "tint";
}) {
  return (
    <div className={`dk-slide dk-content ${tone === "tint" ? "dk-tint" : ""} ${aside ? "dk-has-aside" : ""}`}>
      <header className="dk-head">
        <img src={LOGOS.euronetColor} alt="Euronet" className="dk-logo" />
        {brand !== "euronet" && <img src={LOGOS[brand]} alt={brand === "ren" ? "Ren" : "CoreCard"} className="dk-sublogo" />}
      </header>
      <div className="dk-titles">
        {kicker && <div className="dk-kicker">{kicker}</div>}
        <h2 className="dk-h2">{title}</h2>
        {lede && <p className="dk-lede">{lede}</p>}
      </div>
      <div className="dk-body">{children}</div>
      {aside && <div className="dk-aside">{aside}</div>}
      <footer className="dk-foot">
        <span>Euronet&nbsp;&nbsp;|&nbsp;&nbsp;www.euronetworldwide.com</span>
        <span>{section}</span>
      </footer>
    </div>
  );
}

/** Full-bleed Euronet blue title slide. */
export function TitleSlide({ kicker, title, accent, sub }: { kicker: string; title: ReactNode; accent?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="dk-slide dk-title">
      <img src={LOGOS.euronetWhite} alt="Euronet" className="dk-title-logo" />
      <div className="dk-title-mid">
        <div className="dk-kicker light">{kicker}</div>
        <h1>
          {title}
          {accent && (
            <>
              <br />
              <span className="teal">{accent}</span>
            </>
          )}
        </h1>
        {sub && <p>{sub}</p>}
      </div>
      <div className="dk-title-bar" />
    </div>
  );
}

/** Section divider for a business (Ren, CoreCard). */
export function SectionSlide({ n, brand, title, sub }: { n: string; brand: "ren" | "corecard"; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="dk-slide dk-section">
      <div className="dk-section-left">
        <span className="dk-section-n">{n}</span>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      <div className="dk-section-card">
        <img src={LOGOS[brand]} alt={brand} />
      </div>
      <img src={LOGOS.euronetWhite} alt="Euronet" className="dk-section-eu" />
    </div>
  );
}

export const Stats = ({ items }: { items: { v: string; l: ReactNode }[] }) => (
  <div className="dk-stats" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
    {items.map((s, i) => (
      <div key={i}>
        <b>{s.v}</b>
        <span>{s.l}</span>
      </div>
    ))}
  </div>
);

export const Tiles = ({ items, cols }: { items: { t: ReactNode; d: ReactNode; icon?: ReactNode }[]; cols?: number }) => (
  <div className="dk-tiles" style={{ gridTemplateColumns: `repeat(${cols ?? items.length}, 1fr)` }}>
    {items.map((x, i) => (
      <div key={i} className="dk-tile">
        {x.icon && <div className="dk-tile-ic">{x.icon}</div>}
        <h3>{x.t}</h3>
        <p>{x.d}</p>
      </div>
    ))}
  </div>
);

export const Steps = ({ items }: { items: { t: string; d: ReactNode }[] }) => (
  <div className="dk-steps" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
    {items.map((x, i) => (
      <div key={i} className="dk-step">
        <span className="dk-step-n">{String(i + 1).padStart(2, "0")}</span>
        <h3>{x.t}</h3>
        <p>{x.d}</p>
      </div>
    ))}
  </div>
);

export const Banner = ({ hi, children }: { hi: ReactNode; children: ReactNode }) => (
  <div className="dk-banner">
    <span className="teal">{hi}</span> {children}
  </div>
);

export const Checks = ({ items }: { items: { b: ReactNode; t: ReactNode }[] }) => (
  <ul className="dk-checks">
    {items.map((x, i) => (
      <li key={i}>
        <span className="dk-check">✓</span>
        <span>
          <b>{x.b}</b> {x.t}
        </span>
      </li>
    ))}
  </ul>
);

export const Layers = ({ items }: { items: { t: ReactNode; d: ReactNode; tone: "blue" | "peach" | "teal" }[] }) => (
  <div className="dk-layers">
    {items.map((x, i) => (
      <div key={i} className={`dk-layer ${x.tone}`}>
        <h3>{x.t}</h3>
        <p>{x.d}</p>
      </div>
    ))}
  </div>
);

export const SubHead = ({ children, note }: { children: ReactNode; note?: ReactNode }) => (
  <div className="dk-subhead">
    <span className="dk-bar" />
    <h3>{children}</h3>
    {note && <span className="dk-subnote">{note}</span>}
  </div>
);

/** Clearly marked slot for content that still has to come from Euronet materials. */
export const Pending = ({ children, h }: { children: ReactNode; h?: number }) => (
  <div className="dk-pending" style={h ? { minHeight: h } : undefined}>
    <span>Content to come</span>
    <p>{children}</p>
  </div>
);

/** The live card app inside a phone. `Jump` drives whichever LiveApp is on the slide. */
const SCREENS: { id: string; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "statements", label: "Statements" },
  { id: "pay", label: "Payments" },
  { id: "rewards", label: "Rewards" },
  { id: "controls", label: "Card controls" },
  { id: "bnpl", label: "BNPL" },
];
let liveFrame: HTMLIFrameElement | null = null;
const listeners = new Set<(id: string) => void>();
function sendToApp(msg: { __demoNav?: string; __demoReset?: boolean }) {
  liveFrame?.contentWindow?.postMessage(msg, window.location.origin);
  const id = msg.__demoReset ? "home" : msg.__demoNav;
  if (id) listeners.forEach((l) => l(id));
}

export function LiveApp({ start = "home", tour }: { start?: string; tour?: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    liveFrame = ref.current;
    return () => {
      if (liveFrame === ref.current) liveFrame = null;
    };
  }, []);
  // Kiosk: walk through the main screens on its own.
  useEffect(() => {
    if (!tour) return;
    let i = Math.max(0, SCREENS.findIndex((x) => x.id === start));
    const t = setInterval(() => {
      i = (i + 1) % SCREENS.length;
      sendToApp({ __demoNav: SCREENS[i].id });
    }, 3500);
    return () => clearInterval(t);
  }, [tour, start]);
  return (
    <div className="dk-phone">
      <iframe ref={ref} title="Live cardholder app" src="/?preview=1" onLoad={() => start !== "home" && sendToApp({ __demoNav: start })} />
    </div>
  );
}

export function Jump({ start = "home" }: { start?: string }) {
  const [cur, setCur] = useState(start);
  useEffect(() => {
    listeners.add(setCur);
    return () => void listeners.delete(setCur);
  }, []);
  return (
    <div className="dk-jump">
      <span>Jump to</span>
      <div>
        {SCREENS.map((x) => (
          <button key={x.id} className={cur === x.id ? "on" : ""} onClick={() => sendToApp({ __demoNav: x.id })}>
            {x.label}
          </button>
        ))}
        <button className="reset" onClick={() => sendToApp({ __demoReset: true })}>
          Reset demo
        </button>
      </div>
    </div>
  );
}
