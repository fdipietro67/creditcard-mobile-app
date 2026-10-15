import { useState } from "react";
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

// Demo-only card details for the back of the card (never a real PAN).
export const DEMO_CARD = { number: "4000 2026 0920 4417", expiry: "08/29", cvv: "382" };

/** Tap to flip: the back shows masked details, with switches to reveal the number and CVV. */
export function FlipCard({ p, available, locked }: { p: Partner; available: number; locked?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const [showNum, setShowNum] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const turn = () => {
    setFlipped((f) => !f);
    if (flipped) {
      setShowNum(false);
      setShowCvv(false);
    }
  };
  return (
    <div className={`flip ${flipped ? "on" : ""}`}>
      <div className="flip-in">
        <div className="flip-face" role="button" aria-label="Show card details" onClick={turn} aria-hidden={flipped}>
          <CardFace p={p} available={available} locked={locked} />
        </div>
        <div className="flip-face flip-back" aria-hidden={!flipped}>
          <div className="cardface card-back" style={{ background: p.cardImage ? "#111" : p.card }} onClick={turn} role="button" aria-label="Show card front">
            <div className="cb-stripe" />
            <div className="cb-rows">
              <div className="cb-r"><span>Card number</span><b className="num">{showNum ? DEMO_CARD.number : `•••• •••• •••• ${p.pan.slice(-4)}`}</b></div>
              <div className="cb-2">
                <div className="cb-r"><span>Valid thru</span><b className="num">{DEMO_CARD.expiry}</b></div>
                <div className="cb-r"><span>CVV</span><b className="num">{showCvv ? DEMO_CARD.cvv : "•••"}</b></div>
              </div>
              <div className="cb-r"><span>Cardholder</span><b>{(p.holder || "J. Ellis").toUpperCase()}</b></div>
            </div>
            <div className="cb-toggles" onClick={(e) => e.stopPropagation()}>
              <label><input type="checkbox" checked={showNum} onChange={(e) => setShowNum(e.target.checked)} /><i /> Card number</label>
              <label><input type="checkbox" checked={showCvv} onChange={(e) => setShowCvv(e.target.checked)} /><i /> CVV</label>
            </div>
          </div>
        </div>
      </div>
      <div className="flip-hint"><Ico n="flip" size={13} /> {flipped ? "Tap the card to flip back" : "Tap the card for details"}</div>
    </div>
  );
}
