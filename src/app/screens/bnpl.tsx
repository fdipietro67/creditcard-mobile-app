import {
  OFFERS, addMonths, amortSchedule, aprLabel, dLabel, firstDue, fmt, fmt0, mmdd, ordSuffix, planMath, stmtDate,
} from "../../lib/bnpl";
import { BnplArt, CheckIco, MinusIco, PlusIco } from "../icons";
import { useApp } from "../store";
import { Header } from "../ui";

export function SplitView() {
  const { ui, patch, subject, nav } = useApp();
  const subj = subject();
  const stmt = ui.planSource === "statement";
  const P = subj.amount;
  const sel = ui.offer;
  const m = sel != null ? planMath(P, OFFERS[sel]) : null;
  return (
    <>
      <Header title="BNPL" />
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
      <button className="cta" disabled={sel == null} onClick={() => {
          if (sel == null) return;
          patch({ agreed: false });
          nav("review");
        }}>
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
      <Header eyebrow="BNPL" title="Review & Confirm" />
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

export function BnplView() {
  const { partner: p, plans, patch, nav } = useApp();
  const stmtPlan = plans.find((x) => x.fromStatement);
  const eligible = stmtPlan ? 0 : p.statementEligible;
  return (
    <>
      <Header title="Buy Now, Pay Later" />
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
        <div className="r"><div className="a num">{fmt(eligible)}</div><div className="e">Eligible amount</div></div>
      </div>
      <div className="stmt-note">
        {stmtPlan
          ? "Your last statement's purchases are already in a plan. New purchases become eligible on your next statement."
          : "Pay off your statement purchase balance in equal monthly installments."}
      </div>
      <button
        className="proceed"
        disabled={!!stmtPlan}
        onClick={() => {
          patch({ planSource: "statement", offer: null, previewOpen: false });
          nav("split");
        }}
      >
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
              onClick={() => {
                patch({ editingId: pl.id, expanded: null });
                nav("plandetail");
              }}>
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
  if (!pl) return <Header title="Installment Schedule" />;
  const m = planMath(pl.principal, { months: pl.months, apr: pl.apr, feeRate: pl.feeRate || 0 });
  const interestLine = pl.feeRate > 0 ? `( Includes monthly interest of ${(pl.feeRate * 100).toFixed(2)}% )` : "( 0% APR · no interest )";
  const sched = amortSchedule(pl.principal, pl.monthly, pl.months);
  return (
    <>
      <Header eyebrow="BNPL" title="Installment Schedule" />
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
