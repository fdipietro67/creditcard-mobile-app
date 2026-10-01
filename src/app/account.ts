/**
 * The demo account: one consistent ledger behind every screen (home, statements, payments,
 * rewards, BNPL). Sample data only. Dates are relative to today (see lib/calendar).
 */
import { addDays, closingDate, cycleStart, dueDate, today } from "../lib/calendar";
import type { Txn } from "./partners";

export type Line = {
  id: string;
  m: string;
  glyph?: string;
  loc: string;
  g: string;
  amt: number; // + charge, − credit
  date: Date;
  kind: "purchase" | "payment" | "installment" | "credit";
  pct?: string;
};

export type Statement = {
  k: number; // 0 = latest
  start: Date;
  closing: Date;
  due: Date;
  previous: number;
  payments: number; // negative
  purchases: number;
  installments: number;
  fees: number;
  interest: number;
  newBalance: number;
  minDue: number;
  lines: Line[];
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Minimum due: plan installments + greater of $40 or 1% of the revolving balance (0 if none). */
export const minimumDue = (revolving: number, installments: number) =>
  r2(installments + (revolving > 0.005 ? Math.min(revolving, Math.max(40, revolving * 0.01)) : 0));

// --- the latest statement's purchases: exactly the $985.21 "Last Statement Purchase Balance" ---
const LATEST_PURCHASES: (Omit<Line, "date" | "kind"> & { d: number })[] = [
  { id: "s1", m: "Amazon", loc: "Online retail", g: "#232F3E", amt: 214.37, pct: "1.00%", d: 27 },
  { id: "s2", m: "Costco", loc: "Warehouse club", g: "#005DAA", amt: 298.45, pct: "1.00%", d: 24 },
  { id: "s3", m: "The Home Depot", glyph: "H", loc: "Home improvement", g: "#F96302", amt: 187.3, pct: "2.00%", d: 21 },
  { id: "s4", m: "Target", loc: "Retail", g: "#CC0000", amt: 156.82, pct: "1.00%", d: 17 },
  { id: "s5", m: "Uber", loc: "Rideshare", g: "#111111", amt: 38.6, pct: "3.00%", d: 14 },
  { id: "s6", m: "Walgreens", loc: "Pharmacy", g: "#E31837", amt: 38.01, pct: "1.00%", d: 11 },
  { id: "s7", m: "Chipotle", loc: "Dining", g: "#A81612", amt: 24.18, pct: "3.00%", d: 8 },
  { id: "s8", m: "Netflix", loc: "Streaming", g: "#B20710", amt: 15.49, pct: "1.00%", d: 5 },
  { id: "s9", m: "Spotify", loc: "Streaming", g: "#1DB954", amt: 11.99, pct: "1.00%", d: 2 },
];

// Older statements are generated from this pool (deterministic, so the demo looks the same every time).
const POOL: [string, string, string, string?][] = [
  ["Amazon", "Online retail", "#232F3E"], ["Costco", "Warehouse club", "#005DAA"], ["Target", "Retail", "#CC0000"],
  ["Trader Joe's", "Groceries", "#BA0C2F"], ["Delta Air Lines", "Flight", "#003366"], ["Shell", "Fuel", "#DD1D21"],
  ["Starbucks", "Coffee", "#00704A"], ["Uber", "Rideshare", "#111111"], ["Apple", "Electronics", "#1D1D1F"],
  ["The Home Depot", "Home improvement", "#F96302", "H"], ["CVS Pharmacy", "Pharmacy", "#CC0000"],
  ["Whole Foods Market", "Groceries", "#00674B"], ["Chipotle", "Dining", "#A81612"], ["Netflix", "Streaming", "#B20710"],
  ["Hertz", "Car rental", "#1A1A1A"], ["Nordstrom", "Apparel", "#111111"], ["DoorDash", "Food delivery", "#EB1700"],
];

function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

// New balance per statement, newest first; every statement was paid in full by its due date.
const HISTORY = [1385.21, 1622.4, 2108.77, 1450.13, 1903.66, 1277.85];
const OLDEST_PREVIOUS = 1096.32;

export function buildStatements(seedPlan: { m: string; g: string; monthly: number; months: number; paid: number }): Statement[] {
  // The seeded plan's first installment was billed `paid` statements before the latest.
  const billedThrough = seedPlan.paid + 1; // installments billed so far (latest included)
  return HISTORY.map((newBalance, k) => {
    const previous = k + 1 < HISTORY.length ? HISTORY[k + 1] : OLDEST_PREVIOUS;
    const instNo = billedThrough - k; // installment number on this statement
    const installments = instNo >= 1 ? seedPlan.monthly : 0;
    const purchases = r2(newBalance - installments);
    const start = cycleStart(k);
    const closing = closingDate(k);
    const lines: Line[] = [];
    lines.push({
      id: `pay${k}`, m: "Payment — thank you", glyph: "✓", loc: "Checking ••6721", g: "#1F9D6B",
      amt: -previous, date: dueDate(k + 1), kind: "payment",
    });
    if (k === 0) {
      for (const p of LATEST_PURCHASES) lines.push({ ...p, date: addDays(closing, -p.d), kind: "purchase" });
    } else {
      const rand = rng(k + 3);
      const n = 7 + Math.floor(rand() * 4);
      const weights = Array.from({ length: n }, () => 0.25 + rand());
      const sum = weights.reduce((a, b) => a + b, 0);
      let left = purchases;
      const span = Math.max(1, Math.round((closing.getTime() - start.getTime()) / 86400000));
      weights.forEach((w, i) => {
        const [m, loc, g, glyph] = POOL[Math.floor(rand() * POOL.length)];
        const amt = i === n - 1 ? r2(left) : r2((purchases * w) / sum);
        left = r2(left - amt);
        lines.push({ id: `h${k}-${i}`, m, glyph, loc, g, amt, date: addDays(start, Math.floor((span * (i + 0.5)) / n)), kind: "purchase", pct: "1.00%" });
      });
    }
    if (installments)
      lines.push({
        id: `inst${k}`, m: `${seedPlan.m} · Plan`, loc: `Installment ${instNo} of ${seedPlan.months}`, g: seedPlan.g,
        amt: installments, date: closing, kind: "installment",
      });
    lines.sort((a, b) => b.date.getTime() - a.date.getTime());
    return {
      k, start, closing, due: dueDate(k), previous, payments: -previous, purchases, installments,
      fees: 0, interest: 0, newBalance, minDue: minimumDue(purchases, installments), lines,
    };
  });
}

export const statementPurchaseTotal = () => r2(LATEST_PURCHASES.reduce((s, p) => s + p.amt, 0));

/** Current-cycle purchases (the home screen's recent transactions) with their posting dates. */
export const txnDate = (t: Txn) => addDays(today(), -t.daysAgo);

/** Cash back earned on a purchase line, from its "x.xx%" rate. */
export const cashBack = (amt: number, pct?: string) => r2((amt * parseFloat(pct || "0")) / 100);

export type Payment = { id: string; amount: number; date: Date; from: string; kind: "payment" | "rewards"; conf: string };

export type AccountSummary = {
  latest: Statement;
  statementDue: number; // remaining statement balance after payments/credits and any statement plan
  minDue: number; // remaining minimum
  currentBalance: number;
  available: number;
  limit: number;
  cycleTotal: number;
  unbilledPlans: number;
  paidSinceStatement: number;
};

export function summarize(opts: {
  statements: Statement[];
  cycleTxns: Txn[];
  limit: number;
  payments: Payment[]; // made in-session (after the latest statement)
  statementPlanPrincipal: number; // statement purchases moved into a plan
  unbilledPlans: number; // plan principal not yet billed on any statement (pre-existing plans)
}): AccountSummary {
  const latest = opts.statements[0];
  const paid = r2(opts.payments.reduce((s, p) => s + p.amount, 0));
  const revolving = Math.max(0, r2(latest.purchases - opts.statementPlanPrincipal));
  const min = minimumDue(revolving, latest.installments);
  const statementDue = Math.max(0, r2(latest.newBalance - opts.statementPlanPrincipal - paid));
  const cycleTotal = r2(opts.cycleTxns.reduce((s, t) => s + t.amt, 0));
  const currentBalance = Math.max(0, r2(latest.newBalance - paid + cycleTotal + opts.unbilledPlans));
  return {
    latest,
    statementDue,
    minDue: Math.min(statementDue, Math.max(0, r2(min - paid))),
    currentBalance,
    available: Math.max(0, r2(opts.limit - currentBalance)),
    limit: opts.limit,
    cycleTotal,
    unbilledPlans: opts.unbilledPlans,
    paidSinceStatement: paid,
  };
}
