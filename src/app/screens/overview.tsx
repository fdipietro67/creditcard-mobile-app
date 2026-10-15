import { useState } from "react";
import { fmt, fmt0 } from "../../lib/bnpl";
import { dLabel, dLong, today } from "../../lib/calendar";
import { byCategory } from "../account";
import { Ico } from "../icons";
import { useApp } from "../store";
import { Header, KV, Note, Row, Section } from "../ui";

/** Most recent payment: one made in this session, else the one on the latest statement. */
export function useLastPayment() {
  const { data, statements } = useApp();
  const mine = data.payments.filter((p) => p.kind === "payment").at(-1);
  if (mine) return { amount: mine.amount, date: mine.date };
  const line = statements[0].lines.find((l) => l.kind === "payment")!;
  return { amount: -line.amt, date: line.date };
}

export function BalanceDetailView() {
  const { acct, plans, nav, tab } = useApp();
  const last = useLastPayment();
  const planBal = plans.reduce((s, p) => s + p.monthly * (p.months - p.paid), 0);
  const cashLimit = Math.round(acct.limit * 0.2);
  return (
    <>
      <Header title="Balance Detail" />
      <div className="rv-total">
        <div className="tl">CURRENT BALANCE</div>
        <div className="tv num">{fmt(acct.currentBalance)}</div>
        <div className="ta">As of {dLong(today())}</div>
      </div>
      <KV
        rows={[
          ["Credit limit", fmt0(acct.limit)],
          ["Available credit", fmt(acct.available)],
          ["Cash advance limit", fmt0(cashLimit)],
          ["Available for cash", fmt(Math.min(cashLimit, acct.available))],
        ]}
      />
      <Section title="Statement">
        <Row icon={<Ico n="doc" />} title="Statement balance" sub={`Closed ${dLong(acct.latest.closing)}`} value={fmt(acct.latest.newBalance)} onClick={() => nav("statement", "0")} />
        <Row icon={<Ico n="clock" />} title="Remaining to pay" sub={`Minimum ${fmt(acct.minDue)} · due ${dLabel(acct.latest.due)}`} value={fmt(acct.statementDue)} onClick={() => tab("pay")} />
        <Row icon={<Ico n="check" />} title="Last payment" sub={`Paid on ${dLong(last.date)}`} value={fmt(last.amount)} chevron={false} />
      </Section>
      <Section title="Since your statement">
        <Row icon={<Ico n="cart" />} title="New purchases" value={fmt(acct.cycleTotal)} onClick={() => nav("activity")} />
        <Row icon={<Ico n="clock" />} title="BNPL plan balances" sub={`${plans.length} active plan${plans.length === 1 ? "" : "s"}`} value={fmt(planBal)} onClick={() => nav("bnpl")} />
        <Row icon={<Ico n="info" />} title="Pending transactions" value={fmt(0)} chevron={false} />
      </Section>
      <Note>Your current balance includes purchases since your last statement and BNPL installments not yet billed.</Note>
    </>
  );
}

export function MonthlyActivityView() {
  const { statements, partner, acct } = useApp();
  // Oldest → newest: six statement periods plus the current one.
  const periods = [
    ...[...statements].reverse().map((s) => ({ key: `s${s.k}`, label: dLabel(s.closing).split(" ")[0], total: s.purchases, lines: s.lines.filter((l) => l.kind === "purchase") })),
    { key: "cur", label: "Now", total: acct.cycleTotal, lines: partner.txns.map((t) => ({ loc: t.loc, amt: t.amt })) },
  ];
  const [sel, setSel] = useState(periods.length - 1);
  const p = periods[sel];
  const max = Math.max(...periods.map((x) => x.total));
  const cats = byCategory(p.lines);
  const avg = periods.slice(0, -1).reduce((s, x) => s + x.total, 0) / (periods.length - 1);
  return (
    <>
      <Header title="Monthly Activity" />
      <div className="mchart">
        <div className="mchart-h">
          <span>{sel === periods.length - 1 ? "This period so far" : `${p.label} statement`}</span>
          <b className="num">{fmt(p.total)}</b>
          <small>6-month average {fmt(avg)}</small>
        </div>
        <div className="mbars" role="tablist" aria-label="Spending by month">
          {periods.map((x, i) => (
            <button key={x.key} role="tab" aria-selected={i === sel} className={i === sel ? "on" : ""} onClick={() => setSel(i)}>
              <i style={{ height: `${Math.max(6, (x.total / max) * 100)}%` }} />
              <span>{x.label}</span>
            </button>
          ))}
        </div>
      </div>
      <Section title="By category">
        {cats.map((c) => (
          <Row key={c.cat} icon={<Ico n="chart" />} title={c.cat} sub={`${Math.round((c.amt / p.total) * 100)}% of spending`} value={fmt(c.amt)} chevron={false}>
            <span className="catbar"><i style={{ width: `${(c.amt / cats[0].amt) * 100}%` }} /></span>
          </Row>
        ))}
      </Section>
    </>
  );
}
