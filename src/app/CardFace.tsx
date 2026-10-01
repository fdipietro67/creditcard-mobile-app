import { fmt } from "../lib/bnpl";
import { ContactlessIco, Money2020Mark, VisaMark } from "./icons";
import type { Partner } from "./partners";

export function CardFace({ p }: { p: Partner }) {
  if (p.cardImage)
    return (
      <div className="cardface withimg">
        <img className="cardart" src={p.cardImage} alt={`${p.name} card`} />
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
            <div className="val num">{fmt(p.available)}</div>
            <div className="cardholder">{p.holder || "J. Ellis"}</div>
          </div>
          <div className="network">
            <VisaMark />
            <span className="tier">Signature</span>
          </div>
        </div>
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
          <div className="val num">{fmt(p.available)}</div>
        </div>
        <div className="cardholder">{p.holder || "J. Ellis"}</div>
      </div>
    </div>
  );
}
