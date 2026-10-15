import { useState } from "react";
import { fmt } from "../../lib/bnpl";
import { closingDate, dLabel, dLong, relDay } from "../../lib/calendar";
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

/** Cash back per period (oldest → newest): six statements, then the current period (pending). */
function useEarnings() {
  const { statements, partner } = useApp();
  const stmt = [...statements].reverse().map((s) => ({
    key: String(s.k),
    label: dLabel(s.closing).split(" ")[0],
    month: `${dLabel(s.closing).split(" ")[0]} ${s.closing.getFullYear()}`,
    lines: s.lines.filter((l) => l.kind === "purchase"),
  }));
  const cur = {
    key: "cur",
    label: "Now",
    month: "This period",
    lines: partner.txns.map((t) => ({ id: t.id, m: t.m, glyph: t.glyph, loc: t.loc, g: t.g, amt: t.amt, pct: t.pct, date: txnDate(t) })),
  };
  return [...stmt, cur].map((p) => ({ ...p, earned: p.lines.reduce((s, l) => s + cashBack(l.amt, l.pct), 0) }));
}

export function RewardsView() {
  const { data, partner, nav, statements } = useApp();
  const pending = partner.txns.reduce((s, t) => s + cashBack(t.amt, t.pct), 0);
  const lastStmt = statements[0].lines.reduce((s, l) => s + (l.kind === "purchase" ? cashBack(l.amt, l.pct) : 0), 0);
  const periods = useEarnings();
  const max = Math.max(...periods.map((p) => p.earned));
  // Top merchants by cash back earned (this period + last statement).
  const merchants = new Map<string, { m: string; g: string; glyph?: string; earned: number }>();
  for (const l of [...periods[periods.length - 1].lines, ...periods[periods.length - 2].lines]) {
    const cur = merchants.get(l.m) ?? { m: l.m, g: l.g, glyph: l.glyph, earned: 0 };
    cur.earned += cashBack(l.amt, l.pct);
    merchants.set(l.m, cur);
  }
  const top = [...merchants.values()].sort((a, b) => b.earned - a.earned).slice(0, 8);
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

      <div className="mchart rw-chart">
        <div className="mchart-h"><span>Cash back by month</span></div>
        <div className="mbars">
          {periods.map((p, i) => (
            <button key={p.key} className={i === periods.length - 1 ? "on" : ""} onClick={() => nav("rewardmonth", p.key)} aria-label={`${p.month}: ${fmt(p.earned)}`}>
              <i style={{ height: `${Math.max(6, (p.earned / max) * 100)}%` }} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Section>
        <Row icon={<Ico n="chart" />} title="Rewards summary" sub="Available, redeemed, expired and forfeited" onClick={() => nav("rewardsummary")} />
        <Row icon={<Ico n="gift" />} title="Redeem rewards" sub="Statement credit, deposit or gift card" onClick={() => nav("redeem")} />
      </Section>

      <div className="sec">
        <div className="sec-h"><span>Top merchants</span></div>
        <div className="merch">
          {top.map((t) => (
            <div key={t.m} className="merch-i">
              <span className="gl" style={{ background: t.g }}>{t.glyph ?? t.m[0]}</span>
              <b>{t.m}</b>
              <span className="num">+{fmt(t.earned)}</span>
            </div>
          ))}
        </div>
      </div>

      <Section title="How you earn">
        {RATES.map((r) => (
          <Row key={r.pct} tile={{ bg: "var(--accent)", text: r.pct }} title={r.title} sub={r.sub} />
        ))}
      </Section>

      <Section title="Recent reward transactions">
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

      <Section title="History">
        {[...periods].reverse().map((p) => (
          <Row
            key={p.key}
            icon={<Ico n="doc" />}
            title={p.month}
            sub={`${p.lines.length} transaction${p.lines.length === 1 ? "" : "s"}${p.key === "cur" ? " · pending" : ""}`}
            value={`+${fmt(p.earned)}`}
            onClick={() => nav("rewardmonth", p.key)}
          />
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
  const [other, setOther] = useState("");
  const OTHER = -1;
  const value = amt === OTHER ? Math.round((Number(other.replace(/[^0-9.]/g, "")) || 0) * 100) / 100 : amt;
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
      <Seg<number>
        value={amt}
        onChange={setAmt}
        options={[...choices.map((n) => ({ id: n, label: fmt(n).replace(".00", "") })), { id: all, label: "All" }, { id: OTHER, label: "Other" }]}
      />
      {amt === OTHER && (
        <label className="fld">
          <span className="fld-l">Amount</span>
          <span className="money-in">
            <span>$</span>
            <input inputMode="decimal" value={other} onChange={(e) => setOther(e.target.value)} placeholder="0.00" aria-label="Redemption amount" autoFocus />
          </span>
          <span className="fld-h">Redeem any amount up to {fmt(data.rewards)}.</span>
        </label>
      )}
      <Note>Cash back never expires while your account is open.</Note>
      <button
        className="cta"
        disabled={value < 1 || value > data.rewards + 0.001}
        onClick={() => {
          const option = opt === "gift" ? `${gift} gift card` : OPT_LABEL[opt];
          const conf = confNo();
          update((d) => ({
            rewards: Math.round((d.rewards - value) * 100) / 100,
            redemptions: [{ id: "r" + Date.now(), option, amount: value, date: new Date() }, ...d.redemptions],
            payments: opt === "credit"
              ? [...d.payments, { id: "rc" + Date.now(), amount: value, date: new Date(), from: "Cash back", kind: "rewards" as const, conf }]
              : d.payments,
          }));
          patch({ lastRedemption: { option, amount: value, conf } });
          pushAlert({ icon: "star", title: "Cash back redeemed", body: `${fmt(value)} as ${option.toLowerCase()}.` });
          toast("Cash back redeemed");
          replace("redeemdone");
        }}
      >
        Redeem {fmt(value)}
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

const SEGMENTS = [
  { k: "available", label: "Available", color: "var(--accent)" },
  { k: "redeemed", label: "Redeemed", color: "#1F9D6B" },
  { k: "expired", label: "Expired", color: "#E5484D" },
  { k: "forfeited", label: "Forfeited", color: "#F2A93B" },
] as const;

export function RewardSummaryView() {
  const { data, partner } = useApp();
  const since = closingDate(0).getTime();
  const redeemedThis = data.redemptions.filter((r) => r.date.getTime() > since).reduce((s, r) => s + r.amount, 0);
  const redeemedAll = data.redemptions.reduce((s, r) => s + r.amount, 0);
  const vals = { available: data.rewards, redeemed: redeemedAll, expired: 0, forfeited: 0 };
  const total = vals.available + vals.redeemed + vals.expired + vals.forfeited;
  const pending = partner.txns.reduce((s, t) => s + cashBack(t.amt, t.pct), 0);
  // Donut: stroke-dasharray segments on a circle of circumference 100.
  let offset = 0;
  return (
    <>
      <Header eyebrow="Rewards" title="Rewards summary" />
      <div className="donut-card">
        <svg viewBox="0 0 42 42" className="donut" role="img" aria-label="Cash rewards breakdown">
          <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--line)" strokeWidth="6" />
          {SEGMENTS.map((sg) => {
            const pct = total ? (vals[sg.k] / total) * 100 : 0;
            const el = pct > 0 && (
              <circle key={sg.k} cx="21" cy="21" r="15.915" fill="none" stroke={sg.color} strokeWidth="6"
                strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={25 - offset} />
            );
            offset += pct;
            return el;
          })}
        </svg>
        <div className="donut-mid">
          <span className="num">{fmt(data.rewards)}</span>
          <small>Available</small>
        </div>
        <div className="legend">
          {SEGMENTS.map((sg) => (
            <span key={sg.k}><i style={{ background: sg.color }} />{sg.label} <b className="num">{fmt(vals[sg.k])}</b></span>
          ))}
        </div>
      </div>
      <KV
        rows={[
          [`Beginning cash rewards (as of ${dLong(closingDate(0))} statement)`, fmt(data.rewards + redeemedThis)],
          ["Cash rewards earned", fmt(0)],
          ["Cash rewards redeemed", redeemedThis > 0 ? `−${fmt(redeemedThis)}` : fmt(0)],
          ["Cash rewards expired", fmt(0)],
          ["Cash rewards forfeited", fmt(0)],
          ["Available cash rewards", fmt(data.rewards)],
        ]}
      />
      <Note>{fmt(pending)} in cash back from this period's purchases posts with your next statement. Cash back never expires while your account is open.</Note>
    </>
  );
}

export function RewardMonthView() {
  const { param } = useApp();
  const periods = useEarnings();
  const p = periods.find((x) => x.key === param) ?? periods[periods.length - 1];
  return (
    <>
      <Header eyebrow="Rewards" title={p.month} />
      <div className="rv-total">
        <div className="tl">{p.key === "cur" ? "PENDING CASH BACK" : "CASH BACK EARNED"}</div>
        <div className="tv num">{fmt(p.earned)}</div>
        <div className="ta">{p.lines.length} transaction{p.lines.length === 1 ? "" : "s"}</div>
      </div>
      <Section title="Transactions">
        {[...p.lines].sort((a, b) => b.date.getTime() - a.date.getTime()).map((l) => (
          <Row key={l.id} tile={{ bg: l.g, text: l.glyph ?? l.m[0] }} title={l.m} sub={`${l.pct} on ${fmt(l.amt)} · ${dLabel(l.date)}`} value={`+${fmt(cashBack(l.amt, l.pct))}`} chevron={false} />
        ))}
      </Section>
    </>
  );
}
