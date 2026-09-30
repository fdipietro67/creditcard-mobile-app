import { describe, expect, it } from "vitest";
import { OFFERS, amortSchedule, aprLabel, fmt, planMath } from "./bnpl";

const P = 985.21;

describe("planMath — statement eligible balance $985.21", () => {
  it("3 months: $339.29/mo at 17.23% APR, total $1,017.87, interest $32.66", () => {
    const m = planMath(P, OFFERS[0]);
    expect(fmt(m.monthly)).toBe("$339.29");
    expect(aprLabel(OFFERS[0].apr)).toBe("17.23%");
    expect(fmt(m.total)).toBe("$1,017.87");
    expect(fmt(m.interest)).toBe("$32.66");
  });
  it("4 months: $246.30/mo at 0% APR, total $985.21", () => {
    const m = planMath(P, OFFERS[1]);
    expect(fmt(m.monthly)).toBe("$246.30");
    expect(aprLabel(OFFERS[1].apr)).toBe("0%");
    expect(fmt(m.total)).toBe("$985.21");
    expect(fmt(m.interest)).toBe("$0.00");
  });
  it("5 months: $197.04/mo at 0% APR, total $985.21", () => {
    const m = planMath(P, OFFERS[2]);
    expect(fmt(m.monthly)).toBe("$197.04");
    expect(fmt(m.total)).toBe("$985.21");
  });
});

describe("amortSchedule", () => {
  it("every installment totals the fixed monthly payment and principal sums to P", () => {
    const m = planMath(P, OFFERS[0]);
    const s = amortSchedule(P, m.monthly, 3);
    for (const it of s) expect(it.principal + it.interest).toBeCloseTo(m.monthly, 6);
    expect(s.reduce((a, b) => a + b.principal, 0)).toBeCloseTo(P, 6);
    expect(s[0].interest).toBeGreaterThan(s[2].interest);
  });
  it("0% plans split principal evenly with no interest", () => {
    const s = amortSchedule(P, P / 4, 4);
    expect(s.every((x) => x.interest === 0)).toBe(true);
  });
});
