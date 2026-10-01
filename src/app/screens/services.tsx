import { useState } from "react";
import { fmt0 } from "../../lib/bnpl";
import { dLabel } from "../../lib/calendar";
import { Ico } from "../icons";
import { useApp } from "../store";
import { Choice, Done, Field, Header, Note, Row, Section, ToggleRow } from "../ui";

export function ServicesView() {
  const { data, nav, update, toast, partner } = useApp();
  return (
    <>
      <Header title="Account Services" />
      <div className="profile-card">
        <span className="avatar">{(partner.holder || "J. Ellis").replace(/[^A-Za-z ]/g, "").split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>
        <span>
          <b>{partner.holder || "J. Ellis"}</b>
          <span>Member since 2019 · Card ending 4417</span>
        </span>
      </div>
      <Section title="Account">
        <Row icon={<Ico n="user" />} title="Personal information" sub={data.profile.email} onClick={() => nav("profile")} />
        <Row
          icon={<Ico n="trend" />}
          title="Request a credit limit increase"
          sub={data.cliRequested ? `Approved · new limit ${fmt0(data.limit)}` : `Current limit ${fmt0(data.limit)}`}
          onClick={() => nav("cli")}
        />
        <Row icon={<Ico n="users" />} title="Authorized users" sub={data.authUsers.length ? data.authUsers.map((u) => u.name).join(", ") : "Add someone to your account"} onClick={() => nav("authuser")} />
        <Row icon={<Ico n="plane" />} title="Travel notice" sub={data.travel ? `${data.travel.dest} · ${data.travel.from} – ${data.travel.to}` : "Let us know before you travel"} onClick={() => nav("travel")} />
      </Section>
      <Section title="Preferences">
        <ToggleRow
          icon={<Ico n="leaf" />}
          title="Paperless statements"
          sub="Email when a statement is ready"
          on={data.paperless}
          onChange={(v) => {
            update(() => ({ paperless: v }));
            toast(v ? "Paperless is on" : "Paper statements by mail");
          }}
        />
        <Row icon={<Ico n="bell" />} title="Alerts & notifications" onClick={() => nav("alertprefs")} />
        <Row icon={<Ico n="doc" />} title="Documents" onClick={() => nav("documents")} />
      </Section>
      <Section title="Help">
        <Row icon={<Ico n="mail" />} title="Message us" sub="Typically replies in minutes" onClick={() => toast("A specialist will reply shortly")} />
        <Row icon={<Ico n="phone" />} title="Call 1-800-555-0142" sub="24/7 cardmember service" chevron={false} />
      </Section>
    </>
  );
}

export function ProfileView() {
  const { data, update, toast, back } = useApp();
  const [p, setP] = useState(data.profile);
  return (
    <>
      <Header eyebrow="Account Services" title="Personal information" />
      <Field label="Email"><input className="inp" type="email" value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} /></Field>
      <Field label="Mobile phone"><input className="inp" inputMode="tel" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></Field>
      <Field label="Mailing address"><input className="inp" value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} /></Field>
      <button
        className="cta"
        onClick={() => {
          update(() => ({ profile: p }));
          toast("Profile updated");
          back();
        }}
      >
        Save changes
      </button>
    </>
  );
}

export function CliView() {
  const { data, update, replace, pushAlert } = useApp();
  const opts = [data.limit + 2500, data.limit + 5000, data.limit + 10000];
  const [v, setV] = useState<string | null>(String(opts[1]));
  const [income, setIncome] = useState("");
  const ok = !!v && Number(income.replace(/[^0-9]/g, "")) >= 10000;
  return (
    <>
      <Header eyebrow="Account Services" title="Credit limit increase" />
      <Note>Your current limit is {fmt0(data.limit)}. Requesting an increase won't affect your credit score.</Note>
      <Choice<string> value={v} onChange={setV} options={opts.map((o) => ({ id: String(o), title: fmt0(o), sub: `+${fmt0(o - data.limit)}` }))} />
      <Field label="Annual income" hint="Before taxes, including all sources you rely on">
        <div className="money-in">
          <span>$</span>
          <input inputMode="numeric" value={income} placeholder="95,000" onChange={(e) => setIncome(e.target.value)} aria-label="Annual income" />
        </div>
      </Field>
      <button
        className="cta"
        disabled={!ok}
        onClick={() => {
          const n = Number(v);
          update(() => ({ limit: n, cliRequested: n }));
          pushAlert({ icon: "trend", title: "Credit limit increased", body: `Your new credit limit is ${fmt0(n)}.` });
          replace("cli", "done");
        }}
      >
        Submit request
      </button>
    </>
  );
}

export function CliDoneView() {
  const { data, home } = useApp();
  return (
    <Done title="You're approved" body={`Your new credit limit is ${fmt0(data.limit)}, effective immediately.`}>
      <button className="cta" style={{ marginTop: 22 }} onClick={home}>Back to home</button>
    </Done>
  );
}

export function AuthUserView() {
  const { data, update, toast } = useApp();
  const [name, setName] = useState("");
  const [rel, setRel] = useState<string | null>("Spouse / partner");
  return (
    <>
      <Header eyebrow="Account Services" title="Authorized users" />
      {data.authUsers.length > 0 && (
        <Section title="On this account">
          {data.authUsers.map((u) => (
            <Row key={u.name} icon={<Ico n="user" />} title={u.name} sub={`${u.relation} · card arrives in 7–10 days`} chevron={false} />
          ))}
        </Section>
      )}
      <Note>Authorized users get their own card. Their purchases appear on your statement and earn you cash back.</Note>
      <Field label="Full name"><input className="inp" value={name} placeholder="Alex Ellis" onChange={(e) => setName(e.target.value)} /></Field>
      <div className="choose-title">Relationship</div>
      <Choice<string> value={rel} onChange={setRel} options={["Spouse / partner", "Child", "Other family", "Other"].map((x) => ({ id: x, title: x }))} />
      <button
        className="cta"
        disabled={name.trim().length < 3 || !rel}
        onClick={() => {
          update((d) => ({ authUsers: [...d.authUsers, { name: name.trim(), relation: rel! }] }));
          toast(`${name.trim()} added`);
          setName("");
        }}
      >
        Add authorized user
      </button>
    </>
  );
}

export function TravelView() {
  const { data, update, toast, back } = useApp();
  const [dest, setDest] = useState(data.travel?.dest ?? "");
  const t = new Date();
  const [from, setFrom] = useState(data.travel?.from ?? dLabel(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 14)));
  const [to, setTo] = useState(data.travel?.to ?? dLabel(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 24)));
  return (
    <>
      <Header eyebrow="Account Services" title="Travel notice" />
      <Note>Your card works worldwide with no foreign transaction fees. A travel notice helps us recognize your purchases abroad.</Note>
      <Field label="Destination"><input className="inp" value={dest} placeholder="Lisbon, Portugal" onChange={(e) => setDest(e.target.value)} /></Field>
      <div className="fld-row">
        <Field label="Leaving"><input className="inp" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="Returning"><input className="inp" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
      </div>
      <button
        className="cta"
        disabled={dest.trim().length < 2}
        onClick={() => {
          update(() => ({ travel: { dest: dest.trim(), from, to } }));
          toast("Travel notice saved");
          back();
        }}
      >
        Save travel notice
      </button>
    </>
  );
}
