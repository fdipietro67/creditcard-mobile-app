import { useEffect } from "react";
import { fmt0 } from "../../lib/bnpl";
import { relDay } from "../../lib/calendar";
import { Ico } from "../icons";
import { useApp } from "../store";
import { Header, Row, Section, Seg, ToggleRow } from "../ui";

export function AlertsView() {
  const { data, update, nav } = useApp();
  // Opening the inbox marks everything read (after a beat, so the unread dots are visible first).
  useEffect(() => {
    const t = setTimeout(() => update((d) => ({ alerts: d.alerts.map((a) => ({ ...a, unread: false })) })), 1500);
    return () => clearTimeout(t);
  }, [update]);
  return (
    <>
      <Header
        title="Alerts"
        right={
          <button className="linkbtn" onClick={() => nav("alertprefs")}>
            Settings
          </button>
        }
      />
      <Section>
        {data.alerts.map((a) => (
          <Row key={a.id} icon={<Ico n={a.icon} />} title={<>{a.unread && <i className="dot" />}{a.title}</>} sub={a.body} valueSub={relDay(a.date)} chevron={false} />
        ))}
      </Section>
    </>
  );
}

export function AlertPrefsView() {
  const { data, update } = useApp();
  const p = data.alertPrefs;
  const set = (k: keyof typeof p, v: boolean | number) => update((d) => ({ alertPrefs: { ...d.alertPrefs, [k]: v } }));
  return (
    <>
      <Header eyebrow="Alerts" title="Notification settings" />
      <Section title="Spending">
        <ToggleRow icon={<Ico n="card" />} title="Purchases" sub={`When a purchase is over ${fmt0(p.threshold)}`} on={p.purchases} onChange={(v) => set("purchases", v)} />
        {p.purchases && (
          <div className="li">
            <Seg<number> value={p.threshold} onChange={(v) => set("threshold", v)} options={[0, 100, 500, 1000].map((n) => ({ id: n, label: n ? fmt0(n) : "Any" }))} />
          </div>
        )}
        <ToggleRow icon={<Ico n="globe" />} title="International purchases" on={p.international} onChange={(v) => set("international", v)} />
        <ToggleRow icon={<Ico n="cart" />} title="Online & card-not-present" on={p.cnp} onChange={(v) => set("cnp", v)} />
      </Section>
      <Section title="Account">
        <ToggleRow icon={<Ico n="clock" />} title="Payment due reminders" sub="5 days before and on the due date" on={p.due} onChange={(v) => set("due", v)} />
        <ToggleRow icon={<Ico n="doc" />} title="Statement ready" on={p.statement} onChange={(v) => set("statement", v)} />
        <ToggleRow icon={<Ico n="clock" />} title="BNPL plan updates" sub="New plans and installment reminders" on={p.plans} onChange={(v) => set("plans", v)} />
      </Section>
    </>
  );
}
