import { useState } from "react";
import { fmt } from "../../lib/bnpl";
import { dLabel, dLong, daysBetween, today } from "../../lib/calendar";
import { Ico } from "../icons";
import { confNo, useApp } from "../store";
import { Choice, Done, Field, Header, KV, Note, Row, ScreenTitle, Section, Seg } from "../ui";

export const ACCOUNTS = [
  { id: "Checking ••6721", label: "Checking ••6721" },
  { id: "Savings ••0394", label: "Savings ••0394" },
];

type Opt = "min" | "statement" | "current" | "other";

export function PayView() {
  const { acct, data, statements, patch, nav, ui } = useApp();
  const due = acct.latest.due;
  const days = daysBetween(today(), due);
  const d = ui.payDraft;
  const [opt, setOpt] = useState<Opt | null>(
    (d?.option as Opt) ?? (acct.statementDue > 0 ? "statement" : "current"),
  );
  const [other, setOther] = useState(d?.option === "other" ? String(d.amount) : "");
  const [from, setFrom] = useState(d?.from ?? ACCOUNTS[0].id);
  const [when, setWhen] = useState<"today" | "due">(d?.when ?? "today");

  const amountFor = (o: Opt | null) =>
    o === "min" ? acct.minDue : o === "statement" ? acct.statementDue : o === "current" ? acct.currentBalance : Number(other.replace(/[^0-9.]/g, "")) || 0;
  const amount = Math.round(amountFor(opt) * 100) / 100;
  const valid = amount >= 1 && amount <= acct.currentBalance + 0.001;

  const history = [
    ...data.payments.map((p) => ({ id: p.id, amt: p.amount, date: p.date, from: p.from, kind: p.kind })),
    ...statements.map((s) => ({ id: `h${s.k}`, amt: s.previous, date: s.lines.find((l) => l.kind === "payment")!.date, from: "Checking ••6721", kind: "payment" as const })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <>
      <ScreenTitle sub={acct.statementDue > 0 ? `Due ${dLong(due)} · ${days} day${days === 1 ? "" : "s"} left` : "Your statement balance is paid"}>
        Payments
      </ScreenTitle>
      <div className="paysum">
        <div>
          <span className="lbl">Statement balance</span>
          <span className="num big">{fmt(acct.statementDue)}</span>
        </div>
        <div>
          <span className="lbl">Minimum due</span>
          <span className="num">{fmt(acct.minDue)}</span>
        </div>
        <div>
          <span className="lbl">Current balance</span>
          <span className="num">{fmt(acct.currentBalance)}</span>
        </div>
      </div>

      <div className="choose-title">How much?</div>
      <Choice<Opt>
        value={opt}
        onChange={setOpt}
        options={[
          { id: "min", title: "Minimum payment", sub: "Includes your BNPL plan installment", right: fmt(acct.minDue), disabled: acct.minDue <= 0 },
          { id: "statement", title: "Statement balance", sub: "Avoids interest on purchases", right: fmt(acct.statementDue), disabled: acct.statementDue <= 0 },
          { id: "current", title: "Current balance", sub: "Everything posted to date", right: fmt(acct.currentBalance) },
          { id: "other", title: "Other amount", sub: opt === "other" ? undefined : "Choose any amount" },
        ]}
      />
      {opt === "other" && (
        <Field label="Amount">
          <div className="money-in">
            <span>$</span>
            <input inputMode="decimal" value={other} onChange={(e) => setOther(e.target.value)} placeholder="0.00" aria-label="Payment amount" autoFocus />
          </div>
        </Field>
      )}

      <div className="choose-title">Pay from</div>
      <Seg value={from} onChange={setFrom} options={ACCOUNTS} />
      <div className="choose-title">When</div>
      <Seg<"today" | "due"> value={when} onChange={setWhen} options={[{ id: "today", label: "Today" }, { id: "due", label: `On ${dLabel(due)}` }]} />

      <button
        className="cta"
        disabled={!valid}
        onClick={() => {
          patch({ payDraft: { amount, option: opt!, from, when } });
          nav("payreview");
        }}
      >
        Continue{valid ? ` · ${fmt(amount)}` : ""}
      </button>

      <Section>
        <Row
          icon={<Ico n="clock" />}
          title="AutoPay"
          sub={data.autopay === "off" ? "Off" : data.autopay === "minimum" ? "Minimum payment, on the due date" : "Statement balance, on the due date"}
          onClick={() => nav("autopay")}
        />
      </Section>

      <Section title="Payment activity">
        {history.slice(0, 6).map((h) => (
          <Row
            key={h.id}
            tile={{ bg: "#1F9D6B", text: "✓" }}
            title={h.kind === "rewards" ? "Rewards credit" : "Payment — thank you"}
            sub={`${h.from} · ${dLong(h.date)}`}
            value={`−${fmt(h.amt)}`}
          />
        ))}
      </Section>
    </>
  );
}

export function PayReviewView() {
  const { ui, update, replace, patch, pushAlert, toast, acct, data } = useApp();
  const d = ui.payDraft;
  if (!d) return <Header title="Review payment" />;
  const date = d.when === "today" ? today() : acct.latest.due;
  return (
    <>
      <Header eyebrow="Payments" title="Review payment" />
      <div className="rv-total">
        <div className="tl">PAYMENT AMOUNT</div>
        <div className="tv num">{fmt(d.amount)}</div>
        <div className="ta">{d.when === "today" ? "Posts today" : `Scheduled for ${dLong(date)}`}</div>
      </div>
      <KV
        rows={[
          ["From", d.from],
          ["To", "Card ending 4417"],
          ["Date", dLong(date)],
          ["Remaining statement balance", fmt(Math.max(0, acct.statementDue - d.amount))],
        ]}
      />
      <Note>Payments made before 8 p.m. ET post the same day. Your available credit updates when the payment posts.</Note>
      <button
        className="cta"
        onClick={() => {
          const p = { id: "pm" + Date.now(), amount: d.amount, date, from: d.from, kind: "payment" as const, conf: confNo() };
          update((s) => ({ payments: [...s.payments, p] }));
          patch({ lastPayment: p, payDraft: null });
          if (data.alertPrefs.due)
            pushAlert({ icon: "check", title: d.when === "today" ? "Payment received" : "Payment scheduled", body: `${fmt(d.amount)} from ${d.from}. Confirmation ${p.conf}.` });
          toast(d.when === "today" ? "Payment submitted" : "Payment scheduled");
          replace("paydone");
        }}
      >
        Submit payment
      </button>
    </>
  );
}

export function PayDoneView() {
  const { ui, home, acct } = useApp();
  const p = ui.lastPayment;
  if (!p) return <Header title="Payment" />;
  const scheduled = p.date.getTime() > today().getTime();
  return (
    <Done
      title={scheduled ? "Payment scheduled" : "Payment received"}
      body={`${fmt(p.amount)} from ${p.from}${scheduled ? ` on ${dLong(p.date)}` : ""}. Thank you!`}
    >
      <KV
        rows={[
          ["Confirmation", p.conf],
          ["Statement balance", fmt(acct.statementDue)],
          ["Available credit", fmt(acct.available)],
        ]}
      />
      <button className="cta" style={{ marginTop: 22 }} onClick={home}>Back to home</button>
    </Done>
  );
}

export function AutoPayView() {
  const { data, update, toast } = useApp();
  const [v, setV] = useState(data.autopay);
  return (
    <>
      <Header eyebrow="Payments" title="AutoPay" />
      <Note>Never miss a payment. AutoPay pays automatically on your due date from Checking ••6721.</Note>
      <Choice<typeof v>
        value={v}
        onChange={setV}
        options={[
          { id: "statement", title: "Statement balance", sub: "Pay in full each month — no interest on purchases" },
          { id: "minimum", title: "Minimum payment", sub: "Includes BNPL plan installments" },
          { id: "off", title: "Off", sub: "I'll pay manually" },
        ]}
      />
      <button
        className="cta"
        onClick={() => {
          update(() => ({ autopay: v }));
          toast(v === "off" ? "AutoPay turned off" : "AutoPay is on");
        }}
      >
        Save
      </button>
    </>
  );
}
