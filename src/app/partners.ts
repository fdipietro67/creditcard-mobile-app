import { hexA, type DemoConfig } from "../config/demoConfig";

export type PartnerKey = "altair" | "casa";

export type Txn = {
  id: string;
  m: string;
  loc: string;
  g: string;
  amt: number;
  pct: string;
  elig: boolean;
};

export type Partner = {
  name: string;
  product: string;
  logo: PartnerKey | null;
  card: string;
  accent: string;
  accentSoft: string;
  briefWord: string;
  rewardsLabel: string;
  balance: number;
  available: number;
  limit: number;
  pan: string;
  dueDays: number;
  statementEligible: number;
  activity: number[];
  txns: Txn[];
  holder?: string;
  cardImage?: string | null;
  seed: { id: string; m: string; loc: string; g: string; principal: number; months: number; paid: number; monthsAgo: number };
};

// Default sample partners — fictional by design (IP guardrail). Figures are sample data.
export const BASE_PARTNERS: Record<PartnerKey, Partner> = {
  altair: {
    name: "Altair Airlines",
    product: "Altair Airlines Card",
    logo: "altair",
    card: "linear-gradient(135deg,#20204F,#3B2E7C 55%,#4C6FFF)",
    accent: "#4C6FFF",
    accentSoft: "rgba(76,111,255,.10)",
    briefWord: "after you've made it",
    rewardsLabel: "AltairMiles",
    balance: 3284.16,
    available: 11715.84,
    limit: 15000,
    pan: "•••• •••• •••• 4417",
    dueDays: 19,
    statementEligible: 985.21,
    activity: [0.34, 0.5, 0.4, 0.62, 0.46, 0.74],
    txns: [
      { id: "a1", m: "Altair Airlines", loc: "Flight · SFO→HNL", g: "#4C6FFF", amt: 1249.0, pct: "2.00%", elig: true },
      { id: "a2", m: "The Peninsula", loc: "Hotel · Chicago", g: "#7A5CF0", amt: 842.5, pct: "2.00%", elig: true },
      { id: "a3", m: "Bose", loc: "Electronics", g: "#2A9D8F", amt: 329.0, pct: "1.00%", elig: true },
      { id: "a4", m: "Sunoco", loc: "Fuel", g: "#E76F51", amt: 58.2, pct: "1.00%", elig: false },
      { id: "a5", m: "Blue Bottle Coffee", loc: "Dining", g: "#8D6E63", amt: 12.75, pct: "3.00%", elig: false },
    ],
    seed: { id: "seedA", m: "Cirrus Resorts · Maui", loc: "Travel", g: "#7A5CF0", principal: 2400, months: 6, paid: 2, monthsAgo: 2 },
  },
  casa: {
    name: "Casa Home",
    product: "Casa Home Card",
    logo: "casa",
    card: "linear-gradient(135deg,#3A2018,#7A4030 52%,#C06A44)",
    accent: "#C05A38",
    accentSoft: "rgba(192,90,56,.12)",
    briefWord: "after you've made it",
    rewardsLabel: "Casa Points",
    balance: 5127.4,
    available: 9872.6,
    limit: 15000,
    pan: "•••• •••• •••• 8823",
    dueDays: 23,
    statementEligible: 4210.0,
    activity: [0.42, 0.36, 0.55, 0.48, 0.66, 0.58],
    txns: [
      { id: "t1", m: "Casa Home", loc: "Sectional sofa", g: "#C05A38", amt: 1899.0, pct: "3.00%", elig: true },
      { id: "t2", m: "Casa Home", loc: "Dining table set", g: "#A8452A", amt: 1240.0, pct: "3.00%", elig: true },
      { id: "t3", m: "Casa Home", loc: "Area rug · 8×10", g: "#D98A5B", amt: 549.0, pct: "3.00%", elig: true },
      { id: "t4", m: "Casa Home", loc: "Table linens", g: "#B0745A", amt: 88.0, pct: "3.00%", elig: false },
      { id: "t5", m: "Casa Home", loc: "Candle set", g: "#8D6E63", amt: 42.0, pct: "3.00%", elig: false },
    ],
    seed: { id: "seedT", m: "Casa Home · Living room refresh", loc: "Furniture", g: "#A8452A", principal: 3200, months: 12, paid: 3, monthsAgo: 3 },
  },
};

/** Mirror of the prototype's applyCfg(): overlay a DemoConfig onto a base partner. */
export function brandPartner(base: Partner, c: DemoConfig | null): Partner {
  if (!c) return base;
  const p = { ...base };
  if (c.clientName) {
    p.name = c.clientName;
    p.product = c.clientName + " Card";
  }
  if (c.rewardsLabel) p.rewardsLabel = c.rewardsLabel;
  if (c.accent) {
    p.accent = c.accent;
    p.accentSoft = hexA(c.accent, 0.1);
    p.card = `linear-gradient(135deg,${hexA(c.accent, 1)} 0%,${hexA(c.accent, 0.72)} 55%,${hexA(c.accent, 0.5)})`;
  }
  if (c.cardholderName) p.holder = c.cardholderName;
  if ("cardImage" in c) p.cardImage = c.cardImage || null;
  return p;
}
