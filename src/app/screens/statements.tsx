import { fmt } from "../../lib/bnpl";
import { dLabel, dLong } from "../../lib/calendar";
import { cashBack } from "../account";
import { Ico } from "../icons";
import { useApp } from "../store";
import { Header, Row, ScreenTitle, Section } from "../ui";

export function StatementsView() {
  const { statements, acct, nav, tab } = useApp();
  const s0 = statements[0];
  return (
    <>
      <ScreenTitle sub="Monthly statements for your card ending 4417">Statements</ScreenTitle>
      <div className="stmt-hero">
        <div className="sh-top">
          <div>
            <div className="lbl">Latest statement · {dLong(s0.closing)}</div>
            <div className="num big">{fmt(s0.newBalance)}</div>
          </div>
          <span className={`badge ${acct.statementDue > 0 ? "warn" : "ok"}`}>{acct.statementDue > 0 ? `Due ${dLabel(s0.due)}` : "Paid"}</span>
        </div>
        <div className="sh-row">
          <span>Minimum due <b className="num">{fmt(acct.minDue)}</b></span>
          <span>Remaining <b className="num">{fmt(acct.statementDue)}</b></span>
        </div>
        <div className="sh-actions">
          <button className="btn-ghost" onClick={() => nav("statement", "0")}>View statement</button>
          {acct.statementDue > 0 && <button className="btn-solid" onClick={() => tab("pay")}>Pay</button>}
        </div>
      </div>
      <Section title="All statements">
        {statements.map((s) => (
          <Row
            key={s.k}
            icon={<Ico n="doc" />}
            title={`${dLabel(s.closing)}, ${s.closing.getFullYear()}`}
            sub={`${dLabel(s.start)} – ${dLabel(s.closing)}`}
            value={fmt(s.newBalance)}
            valueSub={s.k === 0 ? (acct.statementDue > 0 ? "Open" : "Paid") : "Paid"}
            onClick={() => nav("statement", String(s.k))}
          />
        ))}
      </Section>
      <Section>
        <Row icon={<Ico n="leaf" />} title="Paperless statements" sub="On — we email you when a statement is ready" onClick={() => nav("services")} />
        <Row icon={<Ico n="doc" />} title="Documents" sub="Agreements, plan terms, tax documents" onClick={() => nav("documents")} />
      </Section>
    </>
  );
}

export function StatementView() {
  const { statements, param, acct, nav, tab, plans, patch } = useApp();
  const s = statements[Number(param) || 0];
  const earned = s.lines.reduce((sum, l) => sum + (l.kind === "purchase" ? cashBack(l.amt, l.pct) : 0), 0);
  const isLatest = s.k === 0;
  const stmtPlan = plans.find((p) => p.fromStatement);
  return (
    <>
      <Header eyebrow="Statement" title={dLong(s.closing)} />
      <div className="rv-total">
        <div className="tl">NEW BALANCE</div>
        <div className="tv num">{fmt(s.newBalance)}</div>
        <div className="ti num">Minimum payment {fmt(s.minDue)}</div>
        <div className="ta">Payment due {dLong(s.due)}</div>
      </div>
      <div className="summary">
        <div className="sr"><span>Previous balance</span><span className="num">{fmt(s.previous)}</span></div>
        <div className="sr"><span>Payments &amp; credits</span><span className="num">−{fmt(-s.payments)}</span></div>
        <div className="sr"><span>Purchases</span><span className="num">+{fmt(s.purchases)}</span></div>
        <div className="sr"><span>BNPL plan installments</span><span className="num">+{fmt(s.installments)}</span></div>
        <div className="sr"><span>Fees charged</span><span className="num">{fmt(s.fees)}</span></div>
        <div className="sr"><span>Interest charged</span><span className="num">{fmt(s.interest)}</span></div>
        <div className="sr big"><span>New balance</span><span className="num">{fmt(s.newBalance)}</span></div>
      </div>
      <div className="stmt-meta">
        <span>Billing period {dLabel(s.start)} – {dLong(s.closing)}</span>
        <span>Cash back earned {fmt(earned)}</span>
      </div>
      <div className="btn-pair">
        <button className="cta ghost" onClick={() => nav("doc", `stmt:${s.k}`)}>
          <Ico n="download" /> View PDF
        </button>
        {isLatest && acct.statementDue > 0 && (
          <button className="cta" onClick={() => tab("pay")}>Pay {fmt(acct.statementDue)}</button>
        )}
      </div>
      {isLatest && !stmtPlan && (
        <div className="splitcard" role="button" onClick={() => {
          patch({ planSource: "statement", offer: null, previewOpen: false });
          nav("split");
        }}>
          <div className="h"><span className="ic"><Ico n="clock" /></span>Split this statement's purchases</div>
          <p>Pay {fmt(s.purchases)} in purchases over 3–5 months, with 0% APR options.</p>
        </div>
      )}
      <Section title="Transactions">
        {s.lines.map((l) => (
          <Row
            key={l.id}
            tile={{ bg: l.g, text: l.glyph ?? l.m[0] }}
            title={l.m}
            sub={`${l.loc} · ${dLabel(l.date)}`}
            value={l.amt < 0 ? `−${fmt(-l.amt)}` : fmt(l.amt)}
          />
        ))}
      </Section>
    </>
  );
}
