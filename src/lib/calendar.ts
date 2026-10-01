// Statement calendar, always relative to today so the demo never looks stale:
// the last statement closed 12 days ago and is due 25 days after closing.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const today = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const addMonths = (d: Date, m: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + m);
  return x;
};
export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);

/** Closing date of the statement `k` cycles back (0 = latest). */
export const closingDate = (k = 0) => addMonths(addDays(today(), -12), -k);
/** Payment due date for statement `k`. */
export const dueDate = (k = 0) => addMonths(addDays(closingDate(0), 25), -k);
/** First day of statement `k`'s billing period. */
export const cycleStart = (k = 0) => addDays(closingDate(k + 1), 1);
/** Due date of the next (not yet issued) statement — where a new plan's first installment lands. */
export const nextDueDate = () => addMonths(dueDate(0), 1);

export const dLabel = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
export const dLong = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
export const mmdd = (d: Date) =>
  `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
export const relDay = (d: Date) => {
  const n = daysBetween(d, today());
  if (n === 0) return "Today";
  if (n === 1) return "Yesterday";
  return dLabel(d);
};
