import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { OFFERS, firstDue, planMath, stmtDate } from "../lib/bnpl";
import { dueDate, today } from "../lib/calendar";
import { DEFAULT_CARD, brandPartner, type Partner } from "./partners";
import { useDemoConfig } from "../config/DemoConfigProvider";
import { buildStatements, summarize, type Payment } from "./account";

export type View =
  | "home" | "activity" | "txn"
  // BNPL
  | "bnpl" | "split" | "review" | "plandetail"
  // Payments
  | "pay" | "payreview" | "paydone" | "autopay"
  // Statements & documents
  | "statements" | "statement" | "documents" | "doc"
  // Rewards
  | "rewards" | "redeem" | "redeemdone"
  // Card controls
  | "controls" | "replace" | "replacedone"
  // Account services
  | "services" | "profile" | "cli" | "authuser" | "travel"
  // Alerts
  | "alerts" | "alertprefs";

export type Tab = "home" | "pay" | "statements" | "rewards";
const TAB_ROOTS: Record<Tab, View> = { home: "home", pay: "pay", statements: "statements", rewards: "rewards" };

export type Plan = {
  id: string;
  m: string;
  loc: string;
  g: string;
  principal: number;
  months: number;
  monthly: number;
  apr: number;
  feeRate: number;
  src: string;
  srcSub: string;
  paid: number;
  start: Date;
  /** Installments already billed on a statement (≥ paid). */
  billed: number;
  fromStatement?: boolean;
  created?: Date;
};

type Route = { v: View; p?: string };

type UiState = {
  stack: Route[];
  txn: string | null;
  planSource: "txn" | "statement";
  offer: number | null;
  previewOpen: boolean;
  agreed: boolean;
  expanded: number | null;
  editingId: string | null;
  menu: boolean;
  success: Plan | null;
  toast: string | null;
  // in-progress forms
  payDraft: { amount: number; option: string; from: string; when: "today" | "due" } | null;
  lastPayment: Payment | null;
  redeemDraft: { option: string; amount: number } | null;
  lastRedemption: { option: string; amount: number; conf: string } | null;
};

export type Alert = { id: string; title: string; body: string; date: Date; unread: boolean; icon: string };

type DataState = {
  plans: Plan[];
  splitTxns: string[];
  payments: Payment[];
  rewards: number;
  redemptions: { id: string; option: string; amount: number; date: Date }[];
  autopay: "off" | "minimum" | "statement";
  controls: { locked: boolean; online: boolean; international: boolean; contactless: boolean; atm: boolean; limit: number | null };
  replaced: boolean;
  alerts: Alert[];
  alertPrefs: { purchases: boolean; threshold: number; due: boolean; statement: boolean; international: boolean; cnp: boolean; plans: boolean };
  limit: number;
  cliRequested: number | null;
  authUsers: { name: string; relation: string }[];
  travel: { dest: string; from: string; to: string } | null;
  paperless: boolean;
  profile: { email: string; phone: string; address: string };
};

function seedPlan(p: Partner): Plan {
  const s = p.seed;
  const m = planMath(s.principal, { months: s.months, apr: 0, feeRate: 0 });
  return {
    id: s.id, m: s.m, loc: s.loc, g: s.g, principal: s.principal, months: s.months,
    monthly: m.monthly, apr: 0, feeRate: 0, src: s.m, srcSub: s.loc, paid: s.paid,
    // first installment was due `paid` statements before the latest
    start: dueDate(s.paid), billed: s.paid + 1,
  };
}

const initialUi = (): UiState => ({
  stack: [{ v: "home" }], txn: null, planSource: "txn", offer: null, previewOpen: false,
  agreed: false, expanded: null, editingId: null, menu: false, success: null, toast: null,
  payDraft: null, lastPayment: null, redeemDraft: null, lastRedemption: null,
});

const initialData = (): DataState => {
  const t = today();
  const d = (n: number) => new Date(t.getFullYear(), t.getMonth(), t.getDate() - n);
  return {
    plans: [seedPlan(DEFAULT_CARD)],
    splitTxns: [],
    payments: [],
    rewards: 184.62,
    redemptions: [{ id: "r0", option: "Statement credit", amount: 100, date: d(68) }],
    autopay: "off",
    controls: { locked: false, online: true, international: true, contactless: true, atm: false, limit: null },
    replaced: false,
    alerts: [
      { id: "al1", icon: "card", title: "Purchase approved", body: "$1,186.40 at JetBlue on your card ending 4417.", date: d(0), unread: true },
      { id: "al2", icon: "doc", title: "Your statement is ready", body: "New balance $1,385.21. Minimum payment $440.00.", date: d(12), unread: true },
      { id: "al3", icon: "check", title: "Payment received", body: "We received your $1,622.40 payment. Thank you.", date: d(19), unread: false },
      { id: "al4", icon: "star", title: "You earned cash back", body: "$48.17 in cash back posted from last month's purchases.", date: d(12), unread: false },
    ],
    alertPrefs: { purchases: true, threshold: 500, due: true, statement: true, international: true, cnp: false, plans: true },
    limit: 15000,
    cliRequested: null,
    authUsers: [],
    travel: null,
    paperless: true,
    profile: { email: "j.ellis@example.com", phone: "(555) 010-0142", address: "1250 Market St, San Francisco, CA" },
  };
};

export type PlanSubject = { amount: number; title: string; sub: string; g: string; initial: string };

let seq = 0;
const uid = (p: string) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;
export const confNo = () => "C" + Math.floor(100000000 + Math.random() * 899999999);

function useAppState() {
  const { config } = useDemoConfig();
  const [ui, setUi] = useState<UiState>(initialUi);
  const [data, setData] = useState<DataState>(initialData);
  const [resetNonce, setResetNonce] = useState(0);

  const partner = useMemo(() => {
    const p = brandPartner(DEFAULT_CARD, config);
    const done = data.splitTxns;
    return { ...p, txns: p.txns.map((t) => (done.includes(t.id) ? { ...t, elig: false } : t)) };
  }, [config, data.splitTxns]);

  const statements = useMemo(() => buildStatements(seedPlan(DEFAULT_CARD)), [resetNonce]); // eslint-disable-line react-hooks/exhaustive-deps
  const statementPlan = data.plans.find((p) => p.fromStatement);
  const acct = useMemo(
    () =>
      summarize({
        statements,
        cycleTxns: partner.txns,
        limit: data.limit,
        payments: data.payments,
        statementPlanPrincipal: statementPlan?.principal ?? 0,
        unbilledPlans: data.plans
          .filter((p) => !p.fromStatement && !p.created)
          .reduce((s, p) => s + p.monthly * (p.months - p.billed), 0),
      }),
    [statements, partner.txns, data.limit, data.payments, statementPlan, data.plans],
  );

  const route = ui.stack[ui.stack.length - 1];
  const view = route.v;
  const param = route.p;

  const patch = useCallback((u: Partial<UiState>) => setUi((s) => ({ ...s, ...u })), []);
  const nav = useCallback((v: View, p?: string) => setUi((s) => ({ ...s, menu: false, stack: [...s.stack, { v, p }] })), []);
  /** Replace the current screen (e.g. flow → done screen, so Back skips the finished form). */
  const replace = useCallback((v: View, p?: string) => setUi((s) => ({ ...s, stack: [...s.stack.slice(0, -1), { v, p }] })), []);
  const back = useCallback(() => setUi((s) => ({ ...s, stack: s.stack.length > 1 ? s.stack.slice(0, -1) : [{ v: "home" }] })), []);
  const home = useCallback(() => setUi((s) => ({ ...s, menu: false, stack: [{ v: "home" }] })), []);
  const tab = useCallback((t: Tab) => setUi((s) => ({ ...s, menu: false, stack: [{ v: TAB_ROOTS[t] }] })), []);
  const toast = useCallback((msg: string) => {
    setUi((s) => ({ ...s, toast: msg }));
    window.setTimeout(() => setUi((s) => (s.toast === msg ? { ...s, toast: null } : s)), 2600);
  }, []);
  const update = useCallback((fn: (d: DataState) => Partial<DataState>) => setData((d) => ({ ...d, ...fn(d) })), []);
  const pushAlert = useCallback(
    (a: Omit<Alert, "id" | "date" | "unread">) =>
      setData((d) => ({ ...d, alerts: [{ ...a, id: uid("al"), date: new Date(), unread: true }, ...d.alerts] })),
    [],
  );

  const subject = (): PlanSubject => {
    if (ui.planSource === "statement")
      return { amount: partner.statementEligible, title: "Statement purchase balance", sub: "Eligible amount", g: partner.accent, initial: "$" };
    const t = partner.txns.find((x) => x.id === ui.txn)!;
    return { amount: t.amt, title: t.m, sub: t.loc + (t.daysAgo === 0 ? " · Today" : ""), g: t.g, initial: t.glyph ?? t.m[0] };
  };

  const createPlan = (): Plan => {
    const subj = subject();
    const o = OFFERS[ui.offer!];
    const m = planMath(subj.amount, o);
    const isStmt = ui.planSource === "statement";
    const np: Plan = {
      id: uid("p"), m: isStmt ? "Statement balance plan" : subj.title, loc: subj.sub, g: subj.g,
      principal: subj.amount, months: o.months, monthly: m.monthly, apr: o.apr, feeRate: o.feeRate,
      src: isStmt ? "Statement Purchase Balance" : subj.title, srcSub: isStmt ? stmtDate() : "Purchased recently",
      paid: 0, billed: 0, start: firstDue(), fromStatement: isStmt, created: new Date(),
    };
    setData((d) => ({
      ...d,
      plans: [np, ...d.plans],
      splitTxns: !isStmt && ui.txn ? [...d.splitTxns, ui.txn] : d.splitTxns,
    }));
    if (data.alertPrefs.plans)
      pushAlert({ icon: "clock", title: "BNPL plan created", body: `${np.months} payments of $${m.monthly.toFixed(2)} for ${np.m}.` });
    return np;
  };

  /** Full demo reset: fresh data, home screen. */
  const reset = useCallback(() => {
    setUi(initialUi());
    setData(initialData());
    setResetNonce((n) => n + 1);
  }, []);

  return {
    resetNonce, config, partner, plans: data.plans, data, acct, statements, ui, view, param,
    patch, nav, replace, back, home, tab, toast, update, pushAlert, subject, createPlan, reset, uid,
  };
}

export type AppCtx = ReturnType<typeof useAppState>;
const Ctx = createContext<AppCtx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const v = useAppState();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export const useApp = () => useContext(Ctx)!;
