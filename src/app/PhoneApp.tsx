import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fmt, mmdd } from "../lib/bnpl";
import { MenuIcons, SearchIco } from "./icons";
import { AppStateProvider, useApp, type View } from "./store";
import { idleSecondsFromUrl, useIdleReset } from "./useIdleReset";
import { useDemoConfig } from "../config/DemoConfigProvider";
import {
  BillView, BnplView, HomeView, PlanDetailView, ReviewView, SplitView, TxnDetailView,
} from "./views";

const VIEWS: Record<View, () => React.JSX.Element> = {
  home: HomeView, txn: TxnDetailView, split: SplitView, review: ReviewView,
  bill: BillView, bnpl: BnplView, plandetail: PlanDetailView,
};

function Clock() {
  const now = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false });
  const [t, setT] = useState(now);
  useEffect(() => {
    const id = setInterval(() => setT(now()), 30000);
    return () => clearInterval(id);
  }, []);
  return <span className="num">{t}</span>;
}

/** Re-creates the prototype's slide-in: a fresh .view per screen, activated on the next frame. */
function ViewHost() {
  const { ui } = useApp();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useLayoutEffect(() => {
    setActive(false);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    const id = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(id);
  }, [ui.view]);
  const V = VIEWS[ui.view];
  return (
    <div className="body" ref={bodyRef}>
      <div key={ui.view} className={`view ${active ? "active" : ""}`}>
        <V />
      </div>
    </div>
  );
}

const MENU: { label: string; icon: keyof typeof MenuIcons; bnpl?: boolean }[] = [
  { label: "Payments", icon: "payments" },
  { label: "Rewards", icon: "rewards" },
  { label: "Buy Now, Pay Later", icon: "bnpl", bnpl: true },
  { label: "Card Controls", icon: "controls" },
  { label: "Account Services", icon: "services" },
  { label: "Alerts", icon: "alerts" },
  { label: "Documents", icon: "documents" },
];

function Menu() {
  const { ui, patch } = useApp();
  return (
    <div className={`menu-scrim ${ui.menu ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && patch({ menu: false })}>
      <div className="menu-panel" role="menu">
        {MENU.map((m) => (
          <div key={m.label} role="menuitem" className={`mi ${m.bnpl ? "bnpl" : ""}`}
            onClick={() => patch(m.bnpl ? { menu: false, view: "bnpl" } : { menu: false })}>
            {m.label}
            <span className="mic">{MenuIcons[m.icon]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessModal() {
  const { ui, patch } = useApp();
  const pl = ui.success;
  return (
    <div className={`modal-scrim ${pl ? "open" : ""}`}>
      {pl && (
        <div className="modal-card" role="dialog" aria-modal="true">
          <div className="chk">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="10.2" />
              <path d="m7 12.4 3.3 3.4L17.2 8.3" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>BNPL plan created successfully for {fmt(pl.principal)}</h3>
          <p>The first installment of {fmt(pl.monthly)} is due on {mmdd(pl.start)}.</p>
          <p>
            To view your plan details{" "}
            <span className="link" role="button"
              onClick={() => patch({ success: null, editingId: pl.id, expanded: null, view: "plandetail" })}>
              click here.
            </span>
          </p>
          <button className="ok" onClick={() => patch({ success: null, view: "home" })}>OK</button>
        </div>
      )}
    </div>
  );
}

function Stage() {
  const { partner, partnerKey, config, ui, patch, switchPartner, reset, resetNonce } = useApp();
  const { preview } = useDemoConfig();
  const [idleSeconds] = useState(() => (preview ? 0 : idleSecondsFromUrl()));
  useIdleReset(idleSeconds, reset);

  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", partner.accent);
    r.setProperty("--accent-soft", partner.accentSoft);
    r.setProperty("--card-bg", partner.card);
    document.title = partner.product;
  }, [partner.accent, partner.accentSoft, partner.card, partner.product]);

  const singleClient = !!config?.clientName;

  return (
    <div className="stage">
      <div className="brief">
        <div className="kicker">Experience 2 · Post-purchase</div>
        <h1>Defer a purchase <em>{partner.briefWord}</em></h1>
        <p className="lede">
          The cardholder app, modeled on the live CoreCard card experience: a purchase that's already posted can be
          split into fixed monthly payments — from the transaction, or from the BNPL menu.
        </p>
        <ul className="demo-list">
          <li><strong>BNPL in the menu.</strong> A dedicated entry sits alongside Payments, Rewards, and Card Controls — tap ⋯ to open it.</li>
          <li><strong>Split from a transaction.</strong> Tap any eligible purchase to convert it into a plan, the way the real app works.</li>
          <li><strong>The account, in full.</strong> Balance and credit line, monthly activity, amount due, and rewards — all in one view.</li>
          <li><strong>Plans you can track.</strong> Active plans, schedules, and progress live in the BNPL hub.</li>
        </ul>
        <div className="foot">
          <b>Illustrative only.</b> Cobrand partners are fictional; merchants and figures are sample data. Not a live product or a rate offer.
        </div>
      </div>

      <div className="phone-wrap">
        {!preview && (
          <div className="controls">
            {!singleClient && <span className="cap">Cobrand partner</span>}
            <div className="controls-row">
              {!singleClient && (
                <div className="switch">
                  {(["altair", "casa"] as const).map((k) => (
                    <button key={k} className={partnerKey === k ? "on" : ""} onClick={() => switchPartner(k)}>
                      {k === "altair" ? "Altair" : "Casa"}
                    </button>
                  ))}
                </div>
              )}
              <button className="resetbtn" onClick={reset} aria-label="Reset demo" title="Reset demo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Reset
              </button>
            </div>
          </div>
        )}
        <div className="phone">
          <div className="notch" />
          <div className="screen">
            <div className="statusbar">
              <Clock />
              <span className="dots">
                <span className="bars">
                  <i style={{ height: 4 }} /><i style={{ height: 7 }} /><i style={{ height: 9 }} /><i style={{ height: 11 }} />
                </span>
                <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                  <rect x=".5" y=".5" width="21" height="11" rx="3" stroke="currentColor" opacity=".4" />
                  <rect x="2" y="2" width="17" height="8" rx="1.6" fill="currentColor" />
                  <rect x="23" y="4" width="2" height="4" rx="1" fill="currentColor" opacity=".5" />
                </svg>
              </span>
            </div>
            <div className="appbar">
              <div className="apptitle">{partner.product}</div>
              <div className="appicons">
                <button className="ai" aria-label="Search"><SearchIco /></button>
                <button className="ai dots" aria-label="Menu" onClick={() => patch({ menu: !ui.menu })}>⋯</button>
              </div>
            </div>
            <ViewHost key={resetNonce} />
            <div className="homebar"><i /></div>
            <Menu />
            <SuccessModal />
          </div>
        </div>
        <p className="caption" style={{ fontSize: 12, color: "var(--ink-3)", maxWidth: 392, textAlign: "center", lineHeight: 1.5 }}>
          Tap ⋯ for the <strong>BNPL</strong> menu, or tap a transaction to split it into payments.
        </p>
      </div>
    </div>
  );
}

export default function PhoneApp() {
  return (
    <AppStateProvider>
      <Stage />
    </AppStateProvider>
  );
}
