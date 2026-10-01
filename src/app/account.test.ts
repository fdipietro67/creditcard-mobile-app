import { describe, expect, it } from "vitest";
import { buildStatements, minimumDue, statementPurchaseTotal, summarize, type Payment } from "./account";
import { DEFAULT_CARD } from "./partners";

const seed = { m: "Hilton Hawaiian Village", g: "#104C97", monthly: 400, months: 6, paid: 2 };
const statements = buildStatements(seed);
const r2 = (n: number) => Math.round(n * 100) / 100;

describe("statement ledger", () => {
  it("latest statement purchases equal the $985.21 BNPL-eligible balance", () => {
    expect(statementPurchaseTotal()).toBe(985.21);
    expect(statements[0].purchases).toBe(985.21);
    expect(statements[0].installments).toBe(400);
    expect(statements[0].newBalance).toBe(1385.21);
    expect(statements[0].minDue).toBe(440);
  });

  it("every statement adds up and its lines match its summary", () => {
    for (const s of statements) {
      expect(r2(s.previous + s.payments + s.purchases + s.installments + s.fees + s.interest)).toBe(s.newBalance);
      const sum = (k: string) => r2(s.lines.filter((l) => l.kind === k).reduce((a, l) => a + l.amt, 0));
      expect(sum("purchase")).toBe(s.purchases);
      expect(sum("payment")).toBe(s.payments);
      expect(sum("installment")).toBe(s.installments);
      expect(s.lines.every((l) => l.date >= s.start && l.date <= s.closing)).toBe(true);
    }
  });

  it("each statement's previous balance is the prior statement's new balance", () => {
    for (let k = 0; k < statements.length - 1; k++) expect(statements[k].previous).toBe(statements[k + 1].newBalance);
  });

  it("plan installments appear on exactly the billed statements", () => {
    expect(statements.filter((s) => s.installments > 0)).toHaveLength(3);
  });

  it("minimum due = installments + greater of $40 or 1% (or the balance if smaller)", () => {
    expect(minimumDue(985.21, 400)).toBe(440);
    expect(minimumDue(9000, 0)).toBe(90);
    expect(minimumDue(25, 0)).toBe(25);
    expect(minimumDue(0, 400)).toBe(400);
  });
});

describe("account summary", () => {
  const base = { statements, cycleTxns: DEFAULT_CARD.txns, limit: 15000, payments: [] as Payment[], statementPlanPrincipal: 0, unbilledPlans: 1200 };
  it("current balance = statement + current-cycle purchases + unbilled plan principal", () => {
    const a = summarize(base);
    expect(a.cycleTotal).toBe(3313.68);
    expect(a.currentBalance).toBe(5898.89);
    expect(a.available).toBe(9101.11);
    expect(a.statementDue).toBe(1385.21);
    expect(a.minDue).toBe(440);
  });
  it("payments reduce what's due and free up credit", () => {
    const pay = { id: "x", amount: 440, date: new Date(), from: "Checking", kind: "payment" as const, conf: "C1" };
    const a = summarize({ ...base, payments: [pay] });
    expect(a.statementDue).toBe(945.21);
    expect(a.minDue).toBe(0);
    expect(a.available).toBe(9541.11);
  });
  it("moving statement purchases into a plan leaves only the installment due", () => {
    const a = summarize({ ...base, statementPlanPrincipal: 985.21 });
    expect(a.statementDue).toBe(400);
    expect(a.minDue).toBe(400);
    expect(a.currentBalance).toBe(5898.89);
  });
});
