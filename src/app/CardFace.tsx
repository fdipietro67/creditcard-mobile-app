import { fmt } from "../lib/bnpl";
import { PartnerMark } from "./icons";
import type { Partner } from "./partners";

export function CardFace({ p }: { p: Partner }) {
  if (p.cardImage)
    return (
      <div className="cardface withimg">
        <img className="cardart" src={p.cardImage} alt={`${p.name} card`} />
      </div>
    );
  return (
    <div className="cardface" style={{ background: p.card }}>
      <div className="cardtop">
        <div className="copartner">
          {p.logo ? (
            <div className="cplogo">
              <PartnerMark kind={p.logo} />
              <span className="cpn">{p.name}</span>
            </div>
          ) : (
            <span className="cpn">{p.name}</span>
          )}
          <span className="cps">{p.rewardsLabel}</span>
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
