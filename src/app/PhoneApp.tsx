import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fmt, mmdd } from "../lib/bnpl";
import { Ico, MenuIcons, SearchIco } from "./icons";
import { AppStateProvider, useApp, type Tab, type View } from "./store";
import { idleSecondsFromUrl, useIdleReset } from "./useIdleReset";
import { useDemoConfig } from "../config/DemoConfigProvider";
import { ActivityView, HomeView, TxnDetailView } from "./screens/home";
import { BnplView, PlanDetailView, ReviewView, SplitView } from "./screens/bnpl";
import { AutoPayView, PayDoneView, PayReviewView, PayView } from "./screens/payments";
import { StatementView, StatementsView } from "./screens/statements";
import { RedeemDoneView, RedeemView, RewardsView } from "./screens/rewards";
import { ControlsView, ReplaceDoneView, ReplaceView } from "./screens/controls";
import { AuthUserView, CliDoneView, CliView, ProfileView, ServicesView, TravelView } from "./screens/services";
import { AlertPrefsView, AlertsView } from "./screens/alerts";
import { DocView, DocumentsView } from "./screens/documents";

const VIEWS: Record<View, () => React.JSX.Element | null> = {
  home: HomeView, activity: ActivityView, txn: TxnDetailView,
  bnpl: BnplView, split: SplitView, review: ReviewView, plandetail: PlanDetailView,
  pay: PayView, payreview: PayReviewView, paydone: PayDoneView, autopay: AutoPayView,
  statements: StatementsView, statement: StatementView, documents: DocumentsView, doc: DocView,
  rewards: RewardsView, redeem: RedeemView, redeemdone: RedeemDoneView,
  controls: ControlsView, replace: ReplaceView, replacedone: ReplaceDoneView,
  services: ServicesView, profile: ProfileView, cli: CliRoute, authuser: AuthUserView, travel: TravelView,
  alerts: AlertsView, alertprefs: AlertPrefsView,
};

function CliRoute() {
  const { param } = useApp();
  return param === "done" ? <CliDoneView /> : <CliView />;
}

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
  const { ui, view, param } = useApp();
  const routeKey = `${ui.stack.length}:${view}:${param ?? ""}`;
  const bodyRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useLayoutEffect(() => {
    setActive(false);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    const id = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(id);
  }, [routeKey]);
  const V = VIEWS[view];
  return (
    <div className="body" ref={bodyRef}>
      <div key={routeKey} className={`view ${active ? "active" : ""}`}>
        <V />
      </div>
    </div>
  );
}

const MENU: { label: string; icon: keyof typeof MenuIcons | "doc"; to: View; bnpl?: boolean }[] = [
  { label: "Payments", icon: "payments", to: "pay" },
  { label: "Statements", icon: "doc", to: "statements" },
  { label: "Rewards", icon: "rewards", to: "rewards" },
  { label: "Buy Now, Pay Later", icon: "bnpl", to: "bnpl", bnpl: true },
  { label: "Card Controls", icon: "controls", to: "controls" },
  { label: "Account Services", icon: "services", to: "services" },
  { label: "Alerts", icon: "alerts", to: "alerts" },
  { label: "Documents", icon: "documents", to: "documents" },
];

function Menu() {
  const { ui, patch, nav, tab, data } = useApp();
  const unread = data.alerts.filter((a) => a.unread).length;
  return (
    <div className={`menu-scrim ${ui.menu ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && patch({ menu: false })}>
      <div className="menu-panel" role="menu">
        {MENU.map((m) => (
          <div key={m.label} role="menuitem" className={`mi ${m.bnpl ? "bnpl" : ""}`}
            onClick={() => (m.to === "pay" || m.to === "statements" || m.to === "rewards" ? tab(m.to) : nav(m.to))}>
            {m.label}
            {m.to === "alerts" && unread > 0 && <span className="badge-n">{unread}</span>}
            <span className="mic">{m.icon === "doc" ? <Ico n="doc" size={17} /> : MenuIcons[m.icon]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "pay", label: "Pay", icon: "pay" },
  { id: "statements", label: "Statements", icon: "doc" },
  { id: "rewards", label: "Rewards", icon: "star" },
];

function TabBar() {
  const { ui, tab } = useApp();
  const root = ui.stack[0].v;
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <button key={t.id} className={root === t.id ? "on" : ""} aria-current={root === t.id ? "page" : undefined} onClick={() => tab(t.id)}>
          <Ico n={t.icon} size={21} w={root === t.id ? 2.2 : 1.8} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

function Toast() {
  const { ui } = useApp();
  return <div className={`toast ${ui.toast ? "show" : ""}`} role="status" aria-live="polite">{ui.toast}</div>;
}

function SuccessModal() {
  const { ui, patch, replace, home } = useApp();
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
              onClick={() => {
                patch({ success: null, editingId: pl.id, expanded: null });
                replace("plandetail");
              }}>
              click here.
            </span>
          </p>
          <button className="ok" onClick={() => { patch({ success: null }); home(); }}>OK</button>
        </div>
      )}
    </div>
  );
}

function Stage() {
  const { partner, ui, patch, reset, resetNonce, nav, data } = useApp();
  const unread = data.alerts.filter((a) => a.unread).length;
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

  return (
    <div className="stage">
      <div className="brief">
        <div className="kicker">CoreCard · Cardholder experience</div>
        <h1>The whole card, in hand, <em>with Buy Now, Pay Later built in</em></h1>
        <p className="lede">
          A full cardholder app modeled on the live CoreCard experience: balances, statements, payments, rewards, card
          controls and alerts, plus post-purchase BNPL from any eligible transaction or the statement.
        </p>
        <ul className="demo-list">
          <li><strong>Statements &amp; payments.</strong> Six months of statements, a statement PDF, and pay minimum, statement or any amount, with AutoPay.</li>
          <li><strong>Rewards.</strong> Cash back by category, earnings on every purchase, Visa Signature benefits, and instant redemption.</li>
          <li><strong>Card controls.</strong> Lock the card, switch channels on or off, set a spending limit, or replace a lost card.</li>
          <li><strong>Buy Now, Pay Later.</strong> Split a purchase or the statement balance into fixed monthly installments.</li>
        </ul>
        <div className="foot">
          <b>Illustrative only.</b> Balances, merchants and figures are sample data. Not a live product or a rate offer.
        </div>
      </div>

      <div className="phone-wrap">
        {!preview && (
          <div className="controls">
            <button className="resetbtn" onClick={reset} aria-label="Reset demo" title="Reset demo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Reset
            </button>
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
                <button className="ai" aria-label="Search activity" onClick={() => nav("activity")}><SearchIco /></button>
                <button className="ai dots" aria-label={`Menu${unread ? `, ${unread} unread alerts` : ""}`} onClick={() => patch({ menu: !ui.menu })}>
                  ⋯{unread > 0 && <span className="ai-dot" />}
                </button>
              </div>
            </div>
            <ViewHost key={resetNonce} />
            <TabBar />
            <div className="homebar"><i /></div>
            <Menu />
            <Toast />
            <SuccessModal />
          </div>
        </div>
        <p className="caption" style={{ fontSize: 12, color: "var(--ink-3)", maxWidth: 392, textAlign: "center", lineHeight: 1.5 }}>
          Use the tabs and the ⋯ menu to explore. Tap an eligible purchase to split it into payments.
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
