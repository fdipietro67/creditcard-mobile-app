import { useState } from "react";
import { fmt } from "../../lib/bnpl";
import { dLong, relDay } from "../../lib/calendar";
import { cashBack, txnDate } from "../account";
import { Ico } from "../icons";
import { confNo, useApp } from "../store";
import { Choice, Done, Header, KV, Note, Row, ScreenTitle, Section, Seg } from "../ui";

const RATES = [
  { pct: "3%", title: "Travel, dining & rideshare", sub: "Airlines, restaurants, coffee shops, Uber" },
  { pct: "2%", title: "Hotels & home improvement", sub: "Marriott, Hilton, Lowe's, The Home Depot" },
  { pct: "1%", title: "Everything else", sub: "On every other purchase, no limits" },
];

const BENEFITS = [
  { icon: "star", title: "Visa Signature Concierge", sub: "24/7 help with reservations, tickets and gifts" },
  { icon: "plane", title: "Luxury Hotel Collection", sub: "Room upgrades, breakfast and late checkout" },
  { icon: "shield", title: "Travel & Emergency Assistance", sub: "Help when you're away from home" },
  { icon: "gauge", title: "Roadside Dispatch", sub: "Pay-per-use roadside assistance" },
];

export function RewardsView() {
  const { data, partner, nav, statements } = useApp();
  const pending = partner.txns.reduce((s, t) => s + cashBack(t.amt, t.pct), 0);
  const lastStmt = statements[0].lines.reduce((s, l) => s + (l.kind === "purchase" ? cashBack(l.amt, l.pct) : 0), 0);
  return (
    <>
      <ScreenTitle sub="Cash back on every purchase">Rewards</ScreenTitle>
      <div className="rw-hero">
        <div className="lbl">Cash back available</div>
        <div className="num big">{fmt(data.rewards)}</div>
        <div className="rw-row">
          <span>Pending this period <b className="num">{fmt(pending)}</b></span>
          <span>Last statement <b className="num">{fmt(lastStmt)}</b></span>
        </div>
        <button className="btn-solid" disabled={data.rewards < 1} onClick={() => nav("redeem")}>Redeem cash back</button>
      </div>

      <Section title="How you earn">
        {RATES.map((r) => (
          <Row key={r.pct} tile={{ bg: "var(--accent)", text: r.pct }} title={r.title} sub={r.sub} />
        ))}
      </Section>

      <Section title="Earned recently">
        {partner.txns.slice(0, 5).map((t) => (
          <Row
            key={t.id}
            tile={{ bg: t.g, text: t.glyph ?? t.m[0] }}
            title={t.m}
            sub={`${t.pct} on ${fmt(t.amt)} · ${relDay(txnDate(t))}`}
            value={`+${fmt(cashBack(t.amt, t.pct))}`}
            valueSub="Pending"
          />
        ))}
      </Section>

      <Section title="Visa Signature benefits">
        {BENEFITS.map((b) => (
          <Row key={b.title} icon={<Ico n={b.icon} />} title={b.title} sub={b.sub} onClick={() => nav("doc", "benefits")} />
        ))}
      </Section>

      <Section title="Redemptions">
        {data.redemptions.map((r) => (
          <Row key={r.id} icon={<Ico n="gift" />} title={r.option} sub={dLong(r.date)} value={`−${fmt(r.amount)}`} />
        ))}
      </Section>
    </>
  );
}

type Opt = "credit" | "deposit" | "gift";
const OPT_LABEL: Record<Opt, string> = {
  credit: "Statement credit",
  deposit: "Deposit to Checking ••6721",
  gift: "Gift card",
};

export function RedeemView() {
  const { data, update, patch, replace, toast, pushAlert } = useApp();
  const [opt, setOpt] = useState<Opt>("credit");
  const [gift, setGift] = useState("Amazon");
  const choices = [25, 50, 100].filter((n) => n <= data.rewards);
  const [amt, setAmt] = useState<number>(choices[choices.length - 1] ?? Math.floor(data.rewards));
  const all = Math.floor(data.rewards * 100) / 100;
  return (
    <>
      <Header eyebrow="Rewards" title="Redeem cash back" />
      <div className="rv-total">
        <div className="tl">AVAILABLE</div>
        <div className="tv num">{fmt(data.rewards)}</div>
      </div>
      <div className="choose-title">Redeem as</div>
      <Choice<Opt>
        value={opt}
        onChange={setOpt}
        options={[
          { id: "credit", title: "Statement credit", sub: "Lowers your balance in 1–2 days" },
          { id: "deposit", title: "Deposit to bank", sub: "Checking ••6721 · 1–3 business days" },
          { id: "gift", title: "Gift card", sub: "Delivered by email instantly" },
        ]}
      />
      {opt === "gift" && (
        <>
          <div className="choose-title">Choose a brand</div>
          <Seg value={gift} onChange={setGift} options={["Amazon", "Starbucks", "Target", "Delta"].map((g) => ({ id: g, label: g }))} />
        </>
      )}
      <div className="choose-title">Amount</div>
      <Seg<number> value={amt} onChange={setAmt} options={[...choices.map((n) => ({ id: n, label: fmt(n).replace(".00", "") })), { id: all, label: "All" }]} />
      <Note>Cash back never expires while your account is open.</Note>
      <button
        className="cta"
        disabled={amt < 1 || amt > data.rewards + 0.001}
        onClick={() => {
          const option = opt === "gift" ? `${gift} gift card` : OPT_LABEL[opt];
          const conf = confNo();
          update((d) => ({
            rewards: Math.round((d.rewards - amt) * 100) / 100,
            redemptions: [{ id: "r" + Date.now(), option, amount: amt, date: new Date() }, ...d.redemptions],
            payments: opt === "credit"
              ? [...d.payments, { id: "rc" + Date.now(), amount: amt, date: new Date(), from: "Cash back", kind: "rewards" as const, conf }]
              : d.payments,
          }));
          patch({ lastRedemption: { option, amount: amt, conf } });
          pushAlert({ icon: "star", title: "Cash back redeemed", body: `${fmt(amt)} as ${option.toLowerCase()}.` });
          toast("Cash back redeemed");
          replace("redeemdone");
        }}
      >
        Redeem {fmt(amt)}
      </button>
    </>
  );
}

export function RedeemDoneView() {
  const { ui, data, home } = useApp();
  const r = ui.lastRedemption;
  if (!r) return <Header title="Rewards" />;
  return (
    <Done title="Cash back redeemed" body={`${fmt(r.amount)} as ${r.option.toLowerCase()}.`}>
      <KV rows={[["Confirmation", r.conf], ["Remaining cash back", fmt(data.rewards)]]} />
      <button className="cta" style={{ marginTop: 22 }} onClick={home}>Back to home</button>
    </Done>
  );
}
