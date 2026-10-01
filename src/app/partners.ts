import { hexA, type DemoConfig } from "../config/demoConfig";

export type Txn = {
  id: string;
  m: string;
  glyph?: string; // tile letter, when the first letter isn't the right one ("The …")
  loc: string;
  g: string;
  amt: number;
  pct: string;
  elig: boolean;
  daysAgo: number; // posting date, within the current billing cycle
};

export type Partner = {
  name: string;
  product: string;
  /** Network card face (Visa Signature) — only on the default, unbranded demo. */
  network: "visa-signature" | null;
  card: string;
  accent: string;
  accentSoft: string;
  rewardsLabel: string;
  limit: number;
  pan: string;
  statementEligible: number;
  activity: number[];
  txns: Txn[];
  holder?: string;
  cardImage?: string | null;
  seed: { id: string; m: string; loc: string; g: string; principal: number; months: number; paid: number };
};

// Money20/20 default: a black Money20/20 Visa Signature card. A client config (Builder / link) replaces the
// branding; balances, transactions and plans are sample data.
export const DEFAULT_CARD: Partner = {
  name: "Money20/20",
  product: "Money20/20 Visa Signature",
  network: "visa-signature",
  card: "linear-gradient(135deg,#000000 0%,#0B0B0C 55%,#1A1A1C 100%)",
  accent: "#1434CB",
  accentSoft: "rgba(20,52,203,.10)",
  rewardsLabel: "",
  limit: 15000,
  pan: "•••• •••• •••• 4417",
  statementEligible: 985.21,
  activity: [0.34, 0.5, 0.4, 0.62, 0.46, 0.74],
  txns: [
    // Everyday merchants (names only, no logos). Purchases at or above the plan minimum are
    // eligible to split; small everyday spend isn't.
    { id: "a1", m: "JetBlue", loc: "Flight · JFK→SJU", g: "#0033A0", amt: 1186.4, pct: "3.00%", elig: true, daysAgo: 0 },
    { id: "a2", m: "Lowe's", loc: "Home improvement", g: "#004990", amt: 864.27, pct: "2.00%", elig: true, daysAgo: 1 },
    { id: "a3", m: "Marriott", loc: "Hotel · Orlando", g: "#8A1538", amt: 642.18, pct: "2.00%", elig: true, daysAgo: 2 },
    { id: "a4", m: "Best Buy", loc: "Electronics", g: "#0046BE", amt: 329.99, pct: "1.00%", elig: true, daysAgo: 4 },
    { id: "a5", m: "Whole Foods Market", loc: "Groceries", g: "#00674B", amt: 142.33, pct: "1.00%", elig: false, daysAgo: 5 },
    { id: "a6", m: "The Cheesecake Factory", glyph: "C", loc: "Dining", g: "#8C6D3F", amt: 87.46, pct: "3.00%", elig: false, daysAgo: 6 },
    { id: "a7", m: "Shell", loc: "Fuel", g: "#DD1D21", amt: 54.2, pct: "1.00%", elig: false, daysAgo: 8 },
    { id: "a8", m: "Starbucks", loc: "Coffee", g: "#00704A", amt: 6.85, pct: "3.00%", elig: false, daysAgo: 9 },
  ],
  seed: { id: "seedA", m: "Hilton Hawaiian Village", loc: "Hotel · Honolulu", g: "#104C97", principal: 2400, months: 6, paid: 2 },
};

/** Overlay a client DemoConfig onto the default card. Any client branding drops the network face. */
export function brandPartner(base: Partner, c: DemoConfig | null): Partner {
  if (!c) return base;
  const p = { ...base };
  if (c.clientName) {
    p.name = c.clientName;
    p.product = c.clientName + " Card";
    p.network = null;
  }
  if (c.rewardsLabel) p.rewardsLabel = c.rewardsLabel;
  if (c.accent) {
    p.accent = c.accent;
    p.accentSoft = hexA(c.accent, 0.1);
    p.card = `linear-gradient(135deg,${hexA(c.accent, 1)} 0%,${hexA(c.accent, 0.72)} 55%,${hexA(c.accent, 0.5)})`;
    p.network = null;
  }
  if (c.cardholderName) p.holder = c.cardholderName;
  if ("cardImage" in c) p.cardImage = c.cardImage || null;
  return p;
}
