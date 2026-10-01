import type { ReactNode } from "react";
import {
  OFFERS, addMonths, amortSchedule, aprLabel, dLabel, firstDue, fmt, fmt0, mmdd, ordSuffix, planMath, stmtDate,
} from "../lib/bnpl";
import { CardFace } from "./CardFace";
import { BnplArt, CheckIco, ChevL, ChevR, ClockIco, MinusIco, PlusIco } from "./icons";
import { useApp, type View } from "./store";
import type { Txn } from "./partners";

function Back({ to, children }: { to: View; children: ReactNode }) {
  const { nav } = useApp();
  return (
    <div className="vhead">
      <button className="back" onClick={() => nav(to)} aria-label="Back">
        <ChevL />
      </button>
      {children}
    </div>
  );
}

function TxnRow({ t }: { t: Txn }) {
  const { patch } = useApp();
  return (
    <div className="txn" role="button" onClick={() => patch({ txn: t.id, view: "txn" })}>
      <div className="gl" style={{ background: t.g }}>{t.glyph ?? t.m[0]}</div>
      <div className="mid">
        <div className="m">{t.m}</div>
        <div className="s">{t.loc}</div>
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

export function HomeView() {
  const { partner: p, plans, nav } = useApp();
  const util = Math.min(100, Math.round((p.balance / p.limit) * 100));
  const rem = plans.reduce((s, pl) => s + pl.monthly * (pl.months - pl.paid), 0);
  return (
    <>
      <CardFace p={p} />
      <div className="credit">
        <div className="r1">
          <div>
            <div className="lbl">Available credit</div>
            <div className="av num">{fmt(p.available)}</div>
          </div>
          <a className="detail">Balance detail →</a>
        </div>
        <div className="util"><i style={{ width: `${util}%` }} /></div>
        <div className="r2">
          <span>Current balance <b className="num">{fmt(p.balance)}</b></span>
          <span>Limit <b className="num">{fmt0(p.limit)}</b></span>
        </div>
      </div>
      <div className="row2">
        <div className="tile">
          <div className="lbl">Monthly activity</div>
          <div className="bars">
            {p.activity.map((v, i) => (
              <i key={i} className={i === p.activity.length - 1 ? "hot" : ""} style={{ height: `${Math.round(v * 100)}%` }} />
            ))}
          </div>
        </div>
        <div className="tile due">
          <div className="lbl">Amount due</div>
          <div className="amt num">{fmt(p.balance)}</div>
          <div className="sub">Due in {p.dueDays} days</div>
          <button className="pay" onClick={() => nav("bill")}>Pay</button>
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
        <a onClick={() => nav("bnpl")}>Split a purchase</a>
      </div>
      {p.txns.map((t) => <TxnRow key={t.id} t={t} />)}
    </>
  );
}

export function TxnDetailView() {
  const { partner: p, ui, patch } = useApp();
  const t = p.txns.find((x) => x.id === ui.txn)!;
  return (
    <>
      <Back to="home"><h2>Transaction</h2></Back>
      <div className="tdcard">
        <div className="gl" style={{ background: t.g }}>{t.glyph ?? t.m[0]}</div>
        <div className="m">{t.m}</div>
        <div className="amt num">{fmt(t.amt)}</div>
        <div className="s">{t.loc} · Today</div>
      </div>
      <div className="tdmeta">
        <div className="r"><span className="k">Card</span><span className="v">{p.product} {p.pan.slice(-4)}</span></div>
        <div className="r"><span className="k">Rewards earned</span><span className="v">{t.pct} back</span></div>
        <div className="r"><span className="k">Status</span><span className="v">Posted</span></div>
      </div>
      {t.elig ? (
        <>
          <div className="splitcard">
            <div className="h"><span className="ic"><ClockIco /></span>Split into monthly payments</div>
            <p>Move this {fmt0(t.amt)} purchase off your revolving balance and pay it in equal monthly installments — some terms at 0% APR.</p>
          </div>
          <button className="cta" onClick={() => patch({ planSource: "txn", offer: null, previewOpen: false, view: "split" })}>
            Set up a plan
          </button>
        </>
      ) : (
        <div className="notelig">
          Purchases under the plan minimum aren't eligible to split. Larger purchases show a “Set up a plan” option here.
        </div>
      )}
    </>
  );
}

export function SplitView() {
  const { ui, patch, subject } = useApp();
  const subj = subject();
  const stmt = ui.planSource === "statement";
  const P = subj.amount;
  const sel = ui.offer;
  const m = sel != null ? planMath(P, OFFERS[sel]) : null;
  return (
    <>
      <Back to={stmt ? "bnpl" : "txn"}><h2>BNPL</h2></Back>
      {stmt ? (
        <>
          <div className="stmt-balance">
            <div className="lbl">Last Statement Purchase Balance</div>
            <div className="date">{stmtDate()}</div>
            <div className="amt num">{fmt(P)}</div>
          </div>
          <p className="stmt-explain">
            The Last Statement Purchase Balance reflects only purchases made in the last statement — it doesn't include
            previous-cycle purchases, fees, or interest charges.
          </p>
        </>
      ) : (
        <div className="psum">
          <div className="gl" style={{ background: subj.g }}>{subj.initial}</div>
          <div className="mid"><div className="m">{subj.title}</div><div className="s">{subj.sub}</div></div>
          <div className="amt num">{fmt(P)}</div>
        </div>
      )}
      <div className="choose-title">Choose a plan that's best for you</div>
      <div className="offers" role="radiogroup">
        {OFFERS.map((o, i) => (
          <div key={o.months} className={`offer ${i === sel ? "on" : ""}`} role="radio" aria-checked={i === sel}
            onClick={() => patch({ offer: i })}>
            <span className="oradio" />
            <div className="ocount num">{o.months}</div>
            <div className="olbl">Monthly Installments of</div>
            <div className="oamt num">{fmt(planMath(P, o).monthly)}</div>
            <div className="oapr">APR {aprLabel(o.apr)}</div>
          </div>
        ))}
      </div>
      <div className="preview-head">
        Plan Preview
        <button className={`addbtn ${ui.previewOpen ? "open" : ""}`} aria-label="Toggle payment schedule"
          onClick={() => patch({ previewOpen: !ui.previewOpen })}>
          <PlusIco size={15} w={2.4} />
        </button>
      </div>
      <div className="summary">
        <div className="sr"><span>Principal Amount</span><span className="num">{m ? fmt(P) : "$0.00"}</span></div>
        <div className="sr"><span>Total Interest</span><span className="num">{m ? fmt(m.interest) : "$0.00"}</span></div>
        <div className="sr big">
          <span>Total Payment {sel != null ? `(In ${OFFERS[sel].months} months)` : "(In months)"}</span>
          <span className="num">{m ? fmt(m.total) : "$0.00"}</span>
        </div>
      </div>
      {ui.previewOpen && sel != null && m && (
        <div className="schedmini">
          {Array.from({ length: OFFERS[sel].months }, (_, i) => {
            const d = addMonths(firstDue(), i);
            return (
              <div className="sm-row" key={i}>
                <span>Payment {i + 1} · {dLabel(d)}, {d.getFullYear()}</span>
                <span className="num">{fmt(m.monthly)}</span>
              </div>
            );
          })}
        </div>
      )}
      <button className="cta" disabled={sel == null} onClick={() => sel != null && patch({ agreed: false, view: "review" })}>
        Continue
      </button>
    </>
  );
}

export function ReviewView() {
  const { ui, patch, subject, createPlan } = useApp();
  const subj = subject();
  const o = OFFERS[ui.offer!];
  const m = planMath(subj.amount, o);
  return (
    <>
      <Back to="split"><div><div className="rv-ey">BNPL</div><h2>Review &amp; Confirm</h2></div></Back>
      <div className="rv-total">
        <div className="tl">TOTAL AMOUNT</div>
        <div className="tv num">{fmt(m.total)}</div>
        <div className="ti num">{o.months} Installments of {fmt(m.monthly)}</div>
        <div className="ta">( APR {aprLabel(o.apr)} )</div>
      </div>
      <p className="rv-note">The last installment may vary slightly from the regular monthly installments.</p>
      <div className="rv-summary-title">Plan Summary</div>
      <div className="summary">
        <div className="sr"><span>Principal Amount</span><span className="num">{fmt(subj.amount)}</span></div>
        <div className="sr"><span>Total Interest</span><span className="num">{fmt(m.interest)}</span></div>
        <div className="sr big"><span>Total Amount</span><span className="num">{fmt(m.total)}</span></div>
      </div>
      <p className="rv-note">
        Your first payment of {fmt(m.monthly)} will be included in the minimum amount due on the statement, with a
        payment due date of {mmdd(firstDue())}.
      </p>
      <div className="agree" role="checkbox" aria-checked={ui.agreed} onClick={() => patch({ agreed: !ui.agreed })}>
        <span className={`cbx ${ui.agreed ? "on" : ""}`}>{ui.agreed && <CheckIco stroke="#fff" />}</span>
        <span>I agree to the <a>Terms &amp; Conditions</a> of BNPL.</span>
      </div>
      <button className="cta" disabled={!ui.agreed}
        onClick={() => { if (ui.offer != null && ui.agreed) patch({ success: createPlan() }); }}>
        Confirm
      </button>
    </>
  );
}

export function BillView() {
  const { partner: p, nav } = useApp();
  return (
    <div className="cw">
      <div className="checkwrap"><CheckIco size={34} stroke="var(--accent)" w={2.5} /></div>
      <h2>Payment scheduled</h2>
      <p>{fmt(p.balance)} will be paid from your linked account. Prefer to spread it out? Split an eligible purchase instead.</p>
      <button className="cta" style={{ marginTop: 22 }} onClick={() => nav("home")}>Back to home</button>
    </div>
  );
}

export function BnplView() {
  const { partner: p, plans, patch } = useApp();
  return (
    <>
      <Back to="home"><h2>Buy Now, Pay Later</h2></Back>
      <div className="bnpl-hero">
        <div className="art"><BnplArt /></div>
        <div className="copy">
          <div className="ht">BNPL</div>
          <div className="hp">Split your bills into manageable monthly installments.</div>
        </div>
      </div>
      <div className="create-title">Create a BNPL plan</div>
      <div className="stmt">
        <div className="l">Statement Purchase Balance</div>
        <div className="r"><div className="a num">{fmt(p.statementEligible)}</div><div className="e">Eligible amount</div></div>
      </div>
      <div className="stmt-note">Pay off your statement purchase balance in equal monthly installments.</div>
      <button className="proceed" onClick={() => patch({ planSource: "statement", offer: null, previewOpen: false, view: "split" })}>
        Proceed
      </button>
      <div className="subhead">Active plans</div>
      {plans.length ? (
        plans.map((pl) => {
          const remaining = pl.monthly * (pl.months - pl.paid);
          const nextDate = addMonths(pl.start, pl.paid);
          const pct = Math.round((pl.paid / pl.months) * 100);
          const done = pl.paid >= pl.months;
          return (
            <div key={pl.id} className="planrow" role="button"
              onClick={() => patch({ editingId: pl.id, expanded: null, view: "plandetail" })}>
              <div className="ph">
                <div>
                  <div className="m">{pl.m}</div>
                  <div className="rem num">{fmt(remaining)} remaining · {fmt0(pl.principal)} plan</div>
                </div>
                <div className="nxt">
                  <div className="k">{done ? "Completed" : "Next payment"}</div>
                  <div className="v num">{done ? "—" : fmt(pl.monthly)}</div>
                </div>
              </div>
              <div className="prog"><i style={{ width: `${pct}%` }} /></div>
              <div className="progmeta">
                <span>{pl.paid} of {pl.months} paid</span>
                <span>{done ? "Paid off" : "Next: " + dLabel(nextDate)}</span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="empty">No active plans yet.</div>
      )}
    </>
  );
}

export function PlanDetailView() {
  const { plans, ui, patch } = useApp();
  const pl = plans.find((x) => x.id === ui.editingId);
  if (!pl) return <Back to="bnpl"><h2>Installment Schedule</h2></Back>;
  const m = planMath(pl.principal, { months: pl.months, apr: pl.apr, feeRate: pl.feeRate || 0 });
  const interestLine = pl.feeRate > 0 ? `( Includes monthly interest of ${(pl.feeRate * 100).toFixed(2)}% )` : "( 0% APR · no interest )";
  const sched = amortSchedule(pl.principal, pl.monthly, pl.months);
  return (
    <>
      <Back to="bnpl"><div><div className="rv-ey">BNPL</div><h2>Installment Schedule</h2></div></Back>
      <div className="rv-total sched-box">
        <div className="isl">Principal Amount</div>
        <div className="isv num">{fmt(pl.principal)}</div>
        <div className="isi num">{pl.months} Installments of {fmt(m.monthly)}</div>
        <div className="ta">{interestLine}</div>
        <div className="isl mt">Total Payable Amount</div>
        <div className="isv num">{fmt(m.total)}</div>
      </div>
      <div className="srccard">
        <div className="l"><div className="st">{pl.src || pl.m}</div><div className="sd">{pl.srcSub || ""}</div></div>
        <div className="a num">{fmt(pl.principal)}</div>
      </div>
      <div className="rv-summary-title">Installments</div>
      {Array.from({ length: pl.months }, (_, i) => {
        const d = addMonths(pl.start, i);
        const paid = i < pl.paid;
        const open = ui.expanded === i;
        const it = sched[i];
        return (
          <div key={i} className={`inst ${open ? "open" : ""}`}>
            <div className="inst-head" role="button" aria-expanded={open}
              onClick={() => patch({ expanded: open ? null : i })}>
              <div className="il">
                <div className="io">{i + 1}<sup>{ordSuffix(i + 1)}</sup> Installment</div>
                <div className="id">Due on {mmdd(d)}</div>
              </div>
              <div className={`ir ${paid ? "paid" : ""}`}>
                {paid ? "Paid" : "Unpaid"}
                <span className="iplus">{open ? <MinusIco /> : paid ? <CheckIco /> : <PlusIco />}</span>
              </div>
            </div>
            {open && (
              <div className="inst-body">
                <div className="ib-r"><span>Principal Amount</span><span className="num">{fmt(it.principal)}</span></div>
                <div className="ib-r"><span>Interest</span><span className="num">{fmt(it.interest)}</span></div>
                <div className="ib-r big"><span>Total Payable Amount</span><span className="num">{fmt(it.principal + it.interest)}</span></div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
