import { useState } from "react";
import { fmt0 } from "../../lib/bnpl";
import { Ico } from "../icons";
import { useApp } from "../store";
import { Choice, Done, Header, KV, Note, Row, Section, Seg, ToggleRow } from "../ui";

export function ControlsView() {
  const { data, update, toast, pushAlert, nav } = useApp();
  const c = data.controls;
  const set = (k: keyof typeof c, v: boolean | number | null, msg?: string) => {
    update((d) => ({ controls: { ...d.controls, [k]: v } }));
    if (msg) toast(msg);
  };
  return (
    <>
      <Header title="Card Controls" />
      <div className={`lockcard ${c.locked ? "on" : ""}`}>
        <span className="lk-ic"><Ico n={c.locked ? "lock" : "unlock"} size={22} /></span>
        <span className="lk-mid">
          <b>{c.locked ? "Card is locked" : "Card is active"}</b>
          <span>{c.locked ? "New purchases will be declined. Recurring bills still go through." : "Lock it instantly if it's misplaced."}</span>
        </span>
        <button
          role="switch"
          aria-checked={c.locked}
          aria-label="Lock card"
          className={`tgl lg ${c.locked ? "on" : ""}`}
          onClick={() => {
            set("locked", !c.locked, c.locked ? "Card unlocked" : "Card locked");
            pushAlert({ icon: "lock", title: c.locked ? "Card unlocked" : "Card locked", body: `Card ending 4417 was ${c.locked ? "unlocked" : "locked"} in the app.` });
          }}
        >
          <i />
        </button>
      </div>

      <Section title="Where your card works">
        <ToggleRow icon={<Ico n="cart" />} title="Online & in-app purchases" on={c.online} onChange={(v) => set("online", v)} />
        <ToggleRow icon={<Ico n="globe" />} title="International transactions" sub="Purchases outside the U.S." on={c.international} onChange={(v) => set("international", v)} />
        <ToggleRow icon={<Ico n="wave" />} title="Contactless payments" on={c.contactless} onChange={(v) => set("contactless", v)} />
        <ToggleRow icon={<Ico n="atm" />} title="ATM cash advances" on={c.atm} onChange={(v) => set("atm", v)} />
      </Section>

      <div className="sec">
        <div className="sec-h"><span>Monthly spending limit</span></div>
        <Seg<number>
          value={c.limit ?? 0}
          onChange={(v) => set("limit", v || null, v ? `Limit set to ${fmt0(v)}` : "Spending limit removed")}
          options={[{ id: 0, label: "None" }, { id: 1000, label: "$1k" }, { id: 2500, label: "$2.5k" }, { id: 5000, label: "$5k" }]}
        />
      </div>

      <Section title="Digital wallets">
        <Row icon={<Ico n="phone" />} title="Apple Pay" sub="Active on iPhone" value="Active" chevron={false} />
        <Row icon={<Ico n="wallet" />} title="Google Pay" sub="Add your card to Google Wallet" onClick={() => toast("Card added to Google Wallet")} />
      </Section>

      <Section title="Card">
        <Row icon={<Ico n="key" />} title="Set or change PIN" onClick={() => toast("We sent a secure code to (555) 010-0142")} />
        <Row icon={<Ico n="alert" />} title={data.replaced ? "Replacement on its way" : "Report lost or stolen"} sub={data.replaced ? "Arrives in 3–5 business days" : "Lock this card and order a new one"} onClick={() => nav("replace")} />
      </Section>
    </>
  );
}

type Reason = "lost" | "stolen" | "damaged";

export function ReplaceView() {
  const { data, update, replace, pushAlert } = useApp();
  const [r, setR] = useState<Reason | null>(null);
  return (
    <>
      <Header eyebrow="Card Controls" title="Replace card" />
      <Note>Tell us what happened. Lost or stolen cards are locked right away and get a new number.</Note>
      <Choice<Reason>
        value={r}
        onChange={setR}
        options={[
          { id: "lost", title: "Lost", sub: "New card number" },
          { id: "stolen", title: "Stolen", sub: "New card number · we'll review recent charges" },
          { id: "damaged", title: "Damaged", sub: "Same card number" },
        ]}
      />
      <KV rows={[["Ships to", data.profile.address], ["Delivery", "3–5 business days, free"]]} />
      <button
        className="cta"
        disabled={!r}
        onClick={() => {
          update((d) => ({ replaced: true, controls: { ...d.controls, locked: r !== "damaged" ? true : d.controls.locked } }));
          pushAlert({ icon: "card", title: "Replacement card ordered", body: "Your new card arrives in 3–5 business days." });
          replace("replacedone", r!);
        }}
      >
        Order replacement
      </button>
    </>
  );
}

export function ReplaceDoneView() {
  const { param, home } = useApp();
  return (
    <Done
      title="Replacement ordered"
      body={param === "damaged" ? "Your new card has the same number. Keep using your current card until it arrives." : "Your card ending 4417 is locked. Your new card, with a new number, arrives in 3–5 business days."}
    >
      <button className="cta" style={{ marginTop: 22 }} onClick={home}>Back to home</button>
    </Done>
  );
}
