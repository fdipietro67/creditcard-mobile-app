// BNPL model — fixed monthly-fee ("Plan It" style), not amortization.
// feeRate is the monthly fee as a share of principal; apr is the representative APR shown.
export type Offer = { months: number; apr: number; feeRate: number };

export const OFFERS: Offer[] = [
  { months: 3, apr: 0.1723, feeRate: 0.01105 },
  { months: 4, apr: 0, feeRate: 0 },
  { months: 5, apr: 0, feeRate: 0 },
];

export function planMath(P: number, o: Offer) {
  const monthly = P / o.months + P * o.feeRate;
  const total = monthly * o.months;
  return { monthly, total, interest: total - P };
}

// Per-installment split for a constant payment M over n months.
// Interest declines (amortization) while every installment total stays = M.
export function amortSchedule(P: number, M: number, n: number) {
  if (M * n - P <= 0.005) {
    const per = P / n;
    return Array.from({ length: n }, () => ({ principal: per, interest: 0 }));
  }
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 80; k++) {
    const r = (lo + hi) / 2;
    const pay = (P * r) / (1 - Math.pow(1 + r, -n));
    if (pay > M) hi = r;
    else lo = r;
  }
  const r = (lo + hi) / 2;
  let bal = P;
  const s: { principal: number; interest: number }[] = [];
  for (let i = 0; i < n; i++) {
    let interest = bal * r;
    let principal: number;
    if (i === n - 1) {
      principal = bal;
      interest = M - principal;
    } else {
      principal = M - interest;
    }
    s.push({ principal, interest });
    bal -= principal;
  }
  return s;
}

export const aprLabel = (a: number) => (a === 0 ? "0%" : (a * 100).toFixed(2) + "%");

export const fmt = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmt0 = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const firstDue = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth() + 1, 15);
};
export const addMonths = (d: Date, m: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + m);
  return x;
};
export const dLabel = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
export const mmdd = (d: Date) =>
  `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
export const stmtDate = () => {
  const t = new Date();
  const d = new Date(t.getFullYear(), t.getMonth(), 0);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
export const ordSuffix = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};
