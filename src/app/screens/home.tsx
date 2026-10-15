import { useMemo, useState } from "react";
import { fmt, fmt0 } from "../../lib/bnpl";
import { dLabel, dLong, relDay, daysBetween, today } from "../../lib/calendar";
import { cashBack, txnDate, type Line } from "../account";
import { FlipCard } from "../CardFace";
import { useLastPayment } from "./overview";
import { ChevR, ClockIco, Ico } from "../icons";
import type { Txn } from "../partners";
import { useApp } from "../store";
import { Header, Row, Seg } from "../ui";

function TxnRow({ t }: { t: Txn }) {
  const { patch, nav } = useApp();
  return (
    <div
      className="txn"
      role="button"
      onClick={() => {
        patch({ txn: t.id });
        nav("txn");
      }}
    >
      <div className="gl" style={{ background: t.g }}>{t.glyph ?? t.m[0]}</div>
      <div className="mid">
        <div className="m">{t.m}</div>
        <div className="s">{t.loc} · {relDay(txnDate(t))}</div>
        {t.elig && <span className="tag">◇ Eligible to split</span>}
      </div>
      <div className="rt">
        <div>
          <div className="amt num">{fmt(t.amt)}</div>
          <div className="pct">{t.pct} back</div>
        </div>
        <ChevR className="chev" />
      </div>
    </div>
  );
}

const QUICK: { label: string; icon: string; to: "pay" | "statements" | "rewards" | "controls" }[] = [
  { label: "Pay", icon: "pay", to: "pay" },
  { label: "Statements", icon: "doc", to: "statements" },
  { label: "Rewards", icon: "star", to: "rewards" },
  { label: "Controls", icon: "lock", to: "controls" },
];

export function HomeView() {
  const { partner: p, plans, nav, tab, acct, data, statements } = useApp();
  const util = Math.min(100, Math.round((acct.currentBalance / acct.limit) * 100));
  const last = useLastPayment();
  const [page, setPage] = useState(0);
  // Monthly activity tile: last six statement periods + this one, scaled to the largest.
  const months = [...[...statements].reverse().map((s) => s.purchases), acct.cycleTotal];
  const mMax = Math.max(...months);
  const stmtCashBack = statements[0].lines.reduce((t, l) => t + (l.kind === "purchase" ? cashBack(l.amt, l.pct) : 0), 0);
  const rem = plans.reduce((s, pl) => s + pl.monthly * (pl.months - pl.paid), 0);
  const due = acct.latest.due;
  const daysToDue = daysBetween(today(), due);
  return (
    <>
      <FlipCard p={p} available={acct.available} locked={data.controls.locked} />
      <div className="quick">
        {QUICK.map((q) => (
          <button key={q.label} className="qa" onClick={() => (q.to === "controls" ? nav("controls") : tab(q.to))}>
            <span className="qa-ic"><Ico n={q.to === "controls" && data.controls.locked ? "lock" : q.icon} /></span>
            {q.label}
          </button>
        ))}
      </div>
      <div
        className="pager"
        onScroll={(e) => {
          const el = e.currentTarget;
          setPage(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        <div className="credit pg">
          <div className="r1">
            <div>
              <div className="lbl">Available credit</div>
              <div className="av num">{fmt(acct.available)}</div>
            </div>
            <a className="detail" onClick={() => nav("balance")}>Balance detail →</a>
          </div>
          <div className="util"><i style={{ width: `${util}%` }} /></div>
          <div className="r2">
            <span>Current balance <b className="num">{fmt(acct.currentBalance)}</b></span>
            <span>Limit <b className="num">{fmt0(acct.limit)}</b></span>
          </div>
        </div>
        <div className="credit pg">
          <div className="r1">
            <div>
              <div className="lbl">Last statement · {dLabel(acct.latest.closing)}</div>
              <div className="av num">{fmt(acct.latest.newBalance)}</div>
            </div>
            <a className="detail" onClick={() => nav("statement", "0")}>View statement →</a>
          </div>
          <div className="r2 pg-stmt">
            <span>Minimum due <b className="num">{fmt(acct.latest.minDue)}</b></span>
            <span>Due <b>{dLabel(acct.latest.due)}</b></span>
          </div>
          <div className="r2">
            <span>Remaining to pay <b className="num">{fmt(acct.statementDue)}</b></span>
            <span>Cash back earned <b className="num">{fmt(stmtCashBack)}</b></span>
          </div>
        </div>
      </div>
      <div className="dots" aria-hidden="true"><i className={page === 0 ? "on" : ""} /><i className={page === 1 ? "on" : ""} /></div>
      <div className="row2">
        <div className="tile" role="button" onClick={() => nav("monthly")}>
          <div className="lbl">Monthly activity</div>
          <div className="amt num" style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>{fmt(acct.cycleTotal)}</div>
          <div className="sub" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>Spent this period</div>
          <div className="bars">
            {months.map((v, i) => (
              <i key={i} className={i === months.length - 1 ? "hot" : ""} style={{ height: `${Math.max(8, Math.round((v / mMax) * 100))}%` }} />
            ))}
          </div>
        </div>
        <div className="tile due">
          <div className="lbl">{acct.statementDue > 0 ? "Statement balance" : "Statement"}</div>
          <div className="amt num">{acct.statementDue > 0 ? fmt(acct.statementDue) : "Paid"}</div>
          <div className="sub">
            {acct.statementDue > 0
              ? `${acct.minDue > 0 ? `Min ${fmt(acct.minDue)}` : "Minimum paid"} · due ${daysToDue <= 1 ? (daysToDue === 1 ? "tomorrow" : "today") : dLabel(due)}`
              : "Thank you for your payment"}
          </div>
          <div className="sub lastpay">Last paid {fmt(last.amount)} on {dLabel(last.date)}</div>
          <button className="pay" onClick={() => tab("pay")}>{acct.statementDue > 0 ? "Pay" : "Make a payment"}</button>
        </div>
      </div>
      <div className="bnplsum" role="button" onClick={() => nav("bnpl")}>
        <div className="ic"><ClockIco size={20} stroke="#fff" /></div>
        <div className="t">
          <div className="a">Buy Now, Pay Later</div>
          <div className="b">
            {plans.length
              ? `${plans.length} active plan${plans.length > 1 ? "s" : ""} · ${fmt(rem)} remaining`
              : "Split a purchase into fixed monthly payments"}
          </div>
        </div>
        <div className="pill">Open</div>
      </div>
      <div className="sechead">
        <h3>Recent transactions</h3>
        <span className="sechead-r">
          <button className="iconbtn" aria-label="Filter transactions" onClick={() => nav("activity")}><Ico n="filter" size={16} /></button>
          <a onClick={() => nav("activity")}>See all</a>
        </span>
      </div>
      {p.txns.map((t) => <TxnRow key={t.id} t={t} />)}
    </>
  );
}

export function TxnDetailView() {
  const { partner: p, ui, patch, nav } = useApp();
  const t = p.txns.find((x) => x.id === ui.txn)!;
  const cb = cashBack(t.amt, t.pct);
  return (
    <>
      <Header title="Transaction" />
      <div className="tdcard">
        <div className="gl" style={{ background: t.g }}>{t.glyph ?? t.m[0]}</div>
        <div className="m">{t.m}</div>
        <div className="amt num">{fmt(t.amt)}</div>
        <div className="s">{t.loc} · {dLong(txnDate(t))}</div>
      </div>
      <div className="tdmeta">
        <div className="r"><span className="k">Card</span><span className="v">{p.product} ••{p.pan.slice(-4)}</span></div>
        <div className="r"><span className="k">Cash back</span><span className="v num">{fmt(cb)} ({t.pct})</span></div>
        <div className="r"><span className="k">Status</span><span className="v">Posted</span></div>
        <div className="r"><span className="k">Category</span><span className="v">{t.loc.split(" · ")[0]}</span></div>
      </div>
      {t.elig ? (
        <>
          <div className="splitcard">
            <div className="h"><span className="ic"><ClockIco /></span>Split into monthly payments</div>
            <p>Move this {fmt0(t.amt)} purchase off your revolving balance and pay it in equal monthly installments — some terms at 0% APR.</p>
          </div>
          <button
            className="cta"
            onClick={() => {
              patch({ planSource: "txn", offer: null, previewOpen: false });
              nav("split");
            }}
          >
            Set up a plan
          </button>
        </>
      ) : (
        <div className="notelig">
          Purchases under the plan minimum aren't eligible to split. Larger purchases show a “Set up a plan” option here.
        </div>
      )}
      <div className="sec" style={{ marginTop: 14 }}>
        <div className="group">
          <Row icon={<Ico n="alert" />} title="Report a problem" sub="Dispute this charge or report fraud" onClick={() => nav("doc", "dispute")} />
        </div>
      </div>
    </>
  );
}

type Filter = "all" | "purchase" | "payment" | "installment";

/** All activity: current period + statement periods, with search and filters. */
export function ActivityView() {
  const { partner: p, statements, data, nav, patch } = useApp();
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filter>("all");

  const sections = useMemo(() => {
    const current: Line[] = [
      ...data.payments.map((pm) => ({
        id: pm.id, m: pm.kind === "rewards" ? "Rewards credit" : "Payment — thank you", glyph: "✓", loc: pm.from,
        g: "#1F9D6B", amt: -pm.amount, date: pm.date, kind: "payment" as const,
      })),
      ...p.txns.map((t) => ({ id: t.id, m: t.m, glyph: t.glyph, loc: t.loc, g: t.g, amt: t.amt, date: txnDate(t), kind: "purchase" as const, pct: t.pct })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
    const all = [{ title: "Current period", lines: current, k: -1 }, ...statements.map((s) => ({ title: `Statement · ${dLong(s.closing)}`, lines: s.lines, k: s.k }))];
    const needle = q.trim().toLowerCase();
    return all
      .map((s) => ({
        ...s,
        lines: s.lines.filter((l) => (f === "all" || l.kind === f) && (!needle || l.m.toLowerCase().includes(needle) || l.loc.toLowerCase().includes(needle))),
      }))
      .filter((s) => s.lines.length);
  }, [p.txns, statements, data.payments, q, f]);

  return (
    <>
      <Header title="Activity" />
      <div className="search">
        <Ico n="search" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search merchants" aria-label="Search transactions" autoFocus={false} />
        {q && <button onClick={() => setQ("")} aria-label="Clear search">×</button>}
      </div>
      <Seg<Filter>
        value={f}
        onChange={setF}
        options={[
          { id: "all", label: "All" },
          { id: "purchase", label: "Purchases" },
          { id: "payment", label: "Payments" },
          { id: "installment", label: "Plans" },
        ]}
      />
      {sections.length === 0 && <div className="empty">No transactions match “{q}”.</div>}
      {sections.map((s) => (
        <div className="sec" key={s.title}>
          <div className="sec-h">
            <span>{s.title}</span>
            {s.k >= 0 && <a onClick={() => nav("statement", String(s.k))}>View</a>}
          </div>
          <div className="group">
            {s.lines.map((l) => {
              const cur = s.k === -1 && l.kind === "purchase";
              return (
                <Row
                  key={l.id}
                  tile={{ bg: l.g, text: l.glyph ?? l.m[0] }}
                  title={l.m}
                  sub={`${l.loc} · ${relDay(l.date)}`}
                  value={l.amt < 0 ? `−${fmt(-l.amt)}` : fmt(l.amt)}
                  valueSub={l.pct ? `${fmt(cashBack(l.amt, l.pct))} back` : undefined}
                  onClick={
                    cur
                      ? () => {
                          patch({ txn: l.id });
                          nav("txn");
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
