import { fmt } from "../../lib/bnpl";
import { dLabel, dLong } from "../../lib/calendar";
import { Ico } from "../icons";
import { useApp } from "../store";
import { Header, Row, Section } from "../ui";

const DOCS: Record<string, { title: string; body: string[] }> = {
  agreement: {
    title: "Cardmember Agreement",
    body: [
      "This agreement covers your credit card account, including purchases, Buy Now, Pay Later plans, payments, fees and interest.",
      "Plans. You may move eligible purchases or your statement purchase balance into a fixed-payment plan. Plan installments are added to your minimum payment due each month.",
      "Payments. Pay at least the minimum payment by the due date. Paying your statement balance in full avoids interest on purchases.",
    ],
  },
  "rewards-terms": {
    title: "Rewards Program Terms",
    body: [
      "Earn 3% cash back on travel, dining and rideshare; 2% on hotels and home improvement; and 1% on all other purchases.",
      "Cash back posts each statement period and never expires while your account is open. Redeem as a statement credit, bank deposit or gift card.",
    ],
  },
  benefits: {
    title: "Visa Signature Guide to Benefits",
    body: [
      "Visa Signature Concierge: complimentary 24/7 assistance with travel, dining and entertainment.",
      "Visa Luxury Hotel Collection: room upgrades, complimentary breakfast and late checkout at participating hotels.",
      "Travel & Emergency Assistance and Roadside Dispatch services. Terms, conditions and exclusions apply.",
    ],
  },
  privacy: {
    title: "Privacy Notice",
    body: ["We collect and use your information to service your account, prevent fraud and meet legal requirements. You can limit some sharing at any time from Account Services."],
  },
  ytd: {
    title: "Year-End Summary",
    body: ["A summary of your spending by category for the last calendar year, available every January."],
  },
  dispute: {
    title: "Report a problem",
    body: [
      "Don't recognize a charge? Lock your card from Card Controls first, then contact us.",
      "For a billing dispute, tell us within 60 days of the statement date. We'll investigate and may issue a temporary credit while we review.",
    ],
  },
};

export function DocumentsView() {
  const { nav, plans } = useApp();
  return (
    <>
      <Header title="Documents" />
      <Section title="Statements">
        <Row icon={<Ico n="doc" />} title="Monthly statements" sub="Last 6 statements" onClick={() => nav("statements")} />
        <Row icon={<Ico n="doc" />} title="Year-End Summary" sub={`${new Date().getFullYear() - 1}`} onClick={() => nav("doc", "ytd")} />
      </Section>
      <Section title="Plan agreements">
        {plans.map((p) => (
          <Row key={p.id} icon={<Ico n="clock" />} title={p.m} sub={`${p.months} payments of ${fmt(p.monthly)}`} onClick={() => nav("doc", `plan:${p.id}`)} />
        ))}
      </Section>
      <Section title="Agreements & notices">
        <Row icon={<Ico n="shield" />} title="Cardmember Agreement" onClick={() => nav("doc", "agreement")} />
        <Row icon={<Ico n="star" />} title="Rewards Program Terms" onClick={() => nav("doc", "rewards-terms")} />
        <Row icon={<Ico n="star" />} title="Visa Signature Guide to Benefits" onClick={() => nav("doc", "benefits")} />
        <Row icon={<Ico n="info" />} title="Privacy Notice" onClick={() => nav("doc", "privacy")} />
      </Section>
    </>
  );
}

/** A document "page": statements render as a printed statement; others as a simple notice. */
export function DocView() {
  const { param = "", statements, plans, partner, toast } = useApp();
  let title = "Document";
  let content: React.ReactNode = null;

  if (param.startsWith("stmt:")) {
    const s = statements[Number(param.slice(5)) || 0];
    title = `Statement · ${dLong(s.closing)}`;
    content = (
      <>
        <div className="paper-h">
          <b>{partner.product}</b>
          <span>Account ending 4417 · {dLabel(s.start)} – {dLong(s.closing)}</span>
        </div>
        <table className="paper-t">
          <tbody>
            <tr><td>Previous balance</td><td>{fmt(s.previous)}</td></tr>
            <tr><td>Payments &amp; credits</td><td>−{fmt(-s.payments)}</td></tr>
            <tr><td>Purchases</td><td>+{fmt(s.purchases)}</td></tr>
            <tr><td>Plan installments</td><td>+{fmt(s.installments)}</td></tr>
            <tr><td>Fees · Interest</td><td>{fmt(0)} · {fmt(0)}</td></tr>
            <tr className="tot"><td>New balance</td><td>{fmt(s.newBalance)}</td></tr>
            <tr><td>Minimum payment due</td><td>{fmt(s.minDue)}</td></tr>
            <tr><td>Payment due date</td><td>{dLong(s.due)}</td></tr>
          </tbody>
        </table>
        <div className="paper-sub">Transactions</div>
        <table className="paper-t sm">
          <tbody>
            {s.lines.map((l) => (
              <tr key={l.id}><td>{dLabel(l.date)}</td><td>{l.m}</td><td>{l.amt < 0 ? `−${fmt(-l.amt)}` : fmt(l.amt)}</td></tr>
            ))}
          </tbody>
        </table>
      </>
    );
  } else if (param.startsWith("plan:")) {
    const p = plans.find((x) => x.id === param.slice(5));
    title = "Plan Agreement";
    content = p && (
      <>
        <div className="paper-h"><b>BNPL Plan Agreement</b><span>{p.m}</span></div>
        <table className="paper-t">
          <tbody>
            <tr><td>Plan amount</td><td>{fmt(p.principal)}</td></tr>
            <tr><td>Monthly installment</td><td>{fmt(p.monthly)}</td></tr>
            <tr><td>Number of installments</td><td>{p.months}</td></tr>
            <tr><td>APR</td><td>{p.apr ? (p.apr * 100).toFixed(2) + "%" : "0%"}</td></tr>
            <tr><td>First installment due</td><td>{dLong(p.start)}</td></tr>
          </tbody>
        </table>
        <p>Each installment is added to your minimum payment due. You can pay off a plan early at any time with no penalty.</p>
      </>
    );
  } else {
    const d = DOCS[param];
    if (d) {
      title = d.title;
      content = (
        <>
          <div className="paper-h"><b>{d.title}</b><span>{partner.product}</span></div>
          {d.body.map((b, i) => <p key={i}>{b}</p>)}
        </>
      );
    }
  }

  return (
    <>
      <Header title={title} right={<button className="linkbtn" onClick={() => toast("Saved to Files")} aria-label="Download"><Ico n="download" /></button>} />
      <div className="paper">
        {content}
        <div className="paper-f">Sample document for demonstration purposes.</div>
      </div>
    </>
  );
}
