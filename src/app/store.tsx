import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { OFFERS, firstDue, planMath, stmtDate } from "../lib/bnpl";
import { BASE_PARTNERS, brandPartner, type Partner, type PartnerKey } from "./partners";
import { useDemoConfig } from "../config/DemoConfigProvider";

export type View = "home" | "txn" | "split" | "review" | "bill" | "bnpl" | "plandetail";

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
};

type UiState = {
  view: View;
  txn: string | null;
  planSource: "txn" | "statement";
  offer: number | null;
  previewOpen: boolean;
  agreed: boolean;
  expanded: number | null;
  editingId: string | null;
  menu: boolean;
  success: Plan | null;
};

type DataState = {
  plans: Record<PartnerKey, Plan[]>;
  splitTxns: Record<PartnerKey, string[]>; // txns already converted → no longer eligible
};

function seedPlan(p: Partner): Plan {
  const s = p.seed;
  const t = new Date();
  const m = planMath(s.principal, { months: s.months, apr: 0, feeRate: 0 });
  return {
    id: s.id, m: s.m, loc: s.loc, g: s.g, principal: s.principal, months: s.months,
    monthly: m.monthly, apr: 0, feeRate: 0, src: s.m, srcSub: s.loc, paid: s.paid,
    start: new Date(t.getFullYear(), t.getMonth() - s.monthsAgo, 15),
  };
}

const initialUi = (): UiState => ({
  view: "home", txn: null, planSource: "txn", offer: null, previewOpen: false,
  agreed: false, expanded: null, editingId: null, menu: false, success: null,
});
const initialData = (): DataState => ({
  plans: { altair: [seedPlan(BASE_PARTNERS.altair)], casa: [seedPlan(BASE_PARTNERS.casa)] },
  splitTxns: { altair: [], casa: [] },
});

export type PlanSubject = { amount: number; title: string; sub: string; g: string; initial: string };

function useAppState() {
  const { config } = useDemoConfig();
  const [partnerKey, setPartnerKey] = useState<PartnerKey>("altair");
  const [ui, setUi] = useState<UiState>(initialUi);
  const [data, setData] = useState<DataState>(initialData);

  const partner = useMemo(() => {
    const p = brandPartner(BASE_PARTNERS[partnerKey], config);
    const done = data.splitTxns[partnerKey];
    return { ...p, txns: p.txns.map((t) => (done.includes(t.id) ? { ...t, elig: false } : t)) };
  }, [partnerKey, config, data.splitTxns]);
  const plans = data.plans[partnerKey];

  const patch = useCallback((u: Partial<UiState>) => setUi((s) => ({ ...s, ...u })), []);
  const nav = useCallback((view: View) => patch({ view }), [patch]);

  const subject = (): PlanSubject => {
    if (ui.planSource === "statement")
      return { amount: partner.statementEligible, title: "Statement purchase balance", sub: "Eligible amount", g: partner.accent, initial: "$" };
    const t = partner.txns.find((x) => x.id === ui.txn)!;
    return { amount: t.amt, title: t.m, sub: t.loc + " · Today", g: t.g, initial: t.m[0] };
  };

  const createPlan = (): Plan => {
    const subj = subject();
    const o = OFFERS[ui.offer!];
    const m = planMath(subj.amount, o);
    const isStmt = ui.planSource === "statement";
    const np: Plan = {
      id: "p" + Date.now(), m: isStmt ? "Statement balance plan" : subj.title, loc: subj.sub, g: subj.g,
      principal: subj.amount, months: o.months, monthly: m.monthly, apr: o.apr, feeRate: o.feeRate,
      src: isStmt ? "Statement Purchase Balance" : subj.title, srcSub: isStmt ? stmtDate() : "Purchased today",
      paid: 0, start: firstDue(),
    };
    setData((d) => ({
      plans: { ...d.plans, [partnerKey]: [np, ...d.plans[partnerKey]] },
      splitTxns: !isStmt && ui.txn
        ? { ...d.splitTxns, [partnerKey]: [...d.splitTxns[partnerKey], ui.txn] }
        : d.splitTxns,
    }));
    return np;
  };

  const switchPartner = (k: PartnerKey) => {
    setPartnerKey(k);
    patch({ view: "home", menu: false });
  };

  /** Full demo reset: fresh data, home screen, default partner. */
  const reset = useCallback(() => {
    setPartnerKey("altair");
    setUi(initialUi());
    setData(initialData());
  }, []);

  return { config, partnerKey, partner, plans, ui, patch, nav, subject, createPlan, switchPartner, reset };
}

export type AppCtx = ReturnType<typeof useAppState>;
const Ctx = createContext<AppCtx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const v = useAppState();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export const useApp = () => useContext(Ctx)!;
