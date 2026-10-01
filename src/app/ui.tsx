import type { ReactNode } from "react";
import { ChevL, ChevR } from "./icons";
import { useApp } from "./store";

/** Screen header with a Back button (pops the navigation stack). */
export function Header({ title, eyebrow, right }: { title: string; eyebrow?: string; right?: ReactNode }) {
  const { back } = useApp();
  return (
    <div className="vhead">
      <button className="back" onClick={back} aria-label="Back">
        <ChevL />
      </button>
      {eyebrow ? (
        <div>
          <div className="rv-ey">{eyebrow}</div>
          <h2>{title}</h2>
        </div>
      ) : (
        <h2>{title}</h2>
      )}
      {right && <div className="vhead-right">{right}</div>}
    </div>
  );
}

/** Title for a top-level (tab) screen. */
export const ScreenTitle = ({ children, sub }: { children: ReactNode; sub?: string }) => (
  <div className="stitle">
    <h2>{children}</h2>
    {sub && <p>{sub}</p>}
  </div>
);

export const Section = ({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) => (
  <div className="sec">
    {(title || action) && (
      <div className="sec-h">
        {title && <span>{title}</span>}
        {action}
      </div>
    )}
    <div className="group">{children}</div>
  </div>
);

export function Row({
  icon,
  tile,
  title,
  sub,
  value,
  valueSub,
  onClick,
  chevron,
  children,
  danger,
}: {
  icon?: ReactNode;
  tile?: { bg: string; text: string };
  title: ReactNode;
  sub?: ReactNode;
  value?: ReactNode;
  valueSub?: ReactNode;
  onClick?: () => void;
  chevron?: boolean;
  children?: ReactNode;
  danger?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={`li ${onClick ? "tap" : ""} ${danger ? "danger" : ""}`} onClick={onClick}>
      {tile ? (
        <span className="gl sm" style={{ background: tile.bg }}>{tile.text}</span>
      ) : icon ? (
        <span className="li-ic">{icon}</span>
      ) : null}
      <span className="li-mid">
        <span className="li-t">{title}</span>
        {sub && <span className="li-s">{sub}</span>}
      </span>
      {(value !== undefined || valueSub) && (
        <span className="li-v">
          {value !== undefined && <span className="num">{value}</span>}
          {valueSub && <span className="li-vs">{valueSub}</span>}
        </span>
      )}
      {children}
      {(chevron ?? !!onClick) && <ChevR className="chev" />}
    </Tag>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} className={`tgl ${on ? "on" : ""}`} onClick={() => onChange(!on)}>
      <i />
    </button>
  );
}

export function ToggleRow(props: { icon?: ReactNode; title: string; sub?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row icon={props.icon} title={props.title} sub={props.sub} chevron={false}>
      <Toggle on={props.on} onChange={props.onChange} label={props.title} />
    </Row>
  );
}

/** Radio-style choice cards (amounts, options). */
export function Choice<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | null;
  onChange: (v: T) => void;
  options: { id: T; title: ReactNode; sub?: ReactNode; right?: ReactNode; disabled?: boolean }[];
}) {
  return (
    <div className="choices" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          disabled={o.disabled}
          className={`choice ${value === o.id ? "on" : ""}`}
          onClick={() => onChange(o.id)}
        >
          <span className="oradio" />
          <span className="ch-mid">
            <span className="ch-t">{o.title}</span>
            {o.sub && <span className="ch-s">{o.sub}</span>}
          </span>
          {o.right && <span className="ch-r num">{o.right}</span>}
        </button>
      ))}
    </div>
  );
}

export function Seg<T extends string | number>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[] }) {
  return (
    <div className="segc" role="tablist">
      {options.map((o) => (
        <button key={String(o.id)} role="tab" aria-selected={value === o.id} className={value === o.id ? "on" : ""} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const Field = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
  <label className="fld">
    <span className="fld-l">{label}</span>
    {children}
    {hint && <span className="fld-h">{hint}</span>}
  </label>
);

export const Note = ({ children }: { children: ReactNode }) => <p className="rv-note">{children}</p>;

export function Done({ title, body, children }: { title: string; body: ReactNode; children?: ReactNode }) {
  return (
    <div className="cw">
      <div className="checkwrap">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2>{title}</h2>
      <p>{body}</p>
      {children}
    </div>
  );
}

export function KV({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <div className="recap">
      {rows.map(([k, v], i) => (
        <div className="r" key={i}>
          <span className="k">{k}</span>
          <span className="v num">{v}</span>
        </div>
      ))}
    </div>
  );
}
