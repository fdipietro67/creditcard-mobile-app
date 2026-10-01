import { fmt } from "../lib/bnpl";
import { ContactlessIco, Ico, Money2020Mark, VisaMark } from "./icons";
import type { Partner } from "./partners";

export function CardFace({ p, available, locked }: { p: Partner; available: number; locked?: boolean }) {
  const lock = locked ? <div className="card-locked"><span><Ico n="lock" size={16} /> Card locked</span></div> : null;
  if (p.cardImage)
    return (
      <div className="cardface withimg">
        <img className="cardart" src={p.cardImage} alt={`${p.name} card`} />
        {lock}
      </div>
    );

  if (p.network === "visa-signature")
    return (
      <div className="cardface visa-sig" style={{ background: p.card }}>
        <div className="cardtop">
          <Money2020Mark />
          <span className="contactless"><ContactlessIco /></span>
        </div>
        <div className="cardmid">
          <div className="chip" />
          <div className="pan">{p.pan}</div>
        </div>
        <div className="cardbot">
          <div>
            <div className="lbl">Available credit</div>
            <div className="val num">{fmt(available)}</div>
            <div className="cardholder">{p.holder || "J. Ellis"}</div>
          </div>
          <div className="network">
            <VisaMark />
            <span className="tier">Signature</span>
          </div>
        </div>
        {lock}
      </div>
    );

  return (
    <div className="cardface" style={{ background: p.card }}>
      <div className="cardtop">
        <div className="copartner">
          <span className="cpn">{p.name}</span>
          {p.rewardsLabel && <span className="cps">{p.rewardsLabel}</span>}
        </div>
      </div>
      <div className="cardmid">
        <div className="chip" />
        <div className="pan">{p.pan}</div>
      </div>
      <div className="cardbot">
        <div>
          <div className="lbl">Available credit</div>
          <div className="val num">{fmt(available)}</div>
        </div>
        <div className="cardholder">{p.holder || "J. Ellis"}</div>
      </div>
      {lock}
    </div>
  );
}
