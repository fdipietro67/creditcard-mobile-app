import type { ReactNode } from "react";
import {
  Banner, Checks, Jump, Layers, LiveApp, LOGOS, Pending, SectionSlide, Slide, Stats, Steps, SubHead, TitleSlide, Tiles,
} from "./kit";

export type SlideDef = {
  id: string;
  section: string;
  /** Still waiting on Euronet source material: shown in presenter mode, skipped in kiosk. */
  draft?: boolean;
  /** Seconds to hold in kiosk mode (default 12). */
  hold?: number;
  render: (ctx: { kiosk: boolean }) => ReactNode;
};

const EURONET = "Euronet";
const REN = "Ren · ATM & Self-Service";
const CC = "CoreCard · Issuing & Processing";

export const SLIDES: SlideDef[] = [
  // ───────────────────────────── Euronet ─────────────────────────────
  {
    id: "title",
    section: EURONET,
    render: () => (
      <TitleSlide
        kicker="Money20/20"
        title="Euronet"
        accent="Ren self-service and CoreCard issuing"
        sub="One partner, end to end: onboarding, issuance, processing, reporting and settlement."
      />
    ),
  },
  {
    id: "history",
    section: EURONET,
    draft: true,
    render: () => (
      <Slide section={EURONET} kicker="Who we are" title="Our story">
        <Pending h={560}>Euronet history and milestones, as a timeline (founding, key acquisitions, Ren, CoreCard).</Pending>
      </Slide>
    ),
  },
  {
    id: "strengths",
    section: EURONET,
    draft: true,
    render: () => (
      <Slide section={EURONET} kicker="Who we are" title="Strengths at global scale">
        <Pending h={200}>Headline numbers for the stat strip: countries, ATMs/terminals, transactions, cards, employees.</Pending>
        <div style={{ height: 28 }} />
        <Pending h={300}>Three or four strengths with a one-line proof point each.</Pending>
      </Slide>
    ),
  },
  {
    id: "businesses",
    section: EURONET,
    draft: true,
    render: () => (
      <Slide section={EURONET} kicker="Who we are" title="Our businesses">
        <div className="dk-biz">
          <div className="dk-biz-card">
            <img src={LOGOS.ren} alt="Ren" />
            <p>ATM &amp; self-service</p>
          </div>
          <div className="dk-biz-card">
            <img src={LOGOS.corecard} alt="CoreCard" />
            <p>Card issuing &amp; processing</p>
          </div>
          <Pending>Other Euronet business lines and how they connect.</Pending>
        </div>
      </Slide>
    ),
  },

  // ─────────────────────────────── Ren ───────────────────────────────
  {
    id: "ren",
    section: REN,
    render: () => <SectionSlide n="01" brand="ren" title="ATM & Self-Service" sub="Ren, a Euronet brand" />,
  },
  {
    id: "ren-platform",
    section: REN,
    draft: true,
    render: () => (
      <Slide section={REN} brand="ren" kicker="Ren" title="The platform">
        <Pending h={560}>Ren platform overview: what it is, who it's for, and the problem it solves.</Pending>
      </Slide>
    ),
  },
  {
    id: "ren-capabilities",
    section: REN,
    draft: true,
    render: () => (
      <Slide section={REN} brand="ren" kicker="Ren" title="ATM & self-service capabilities">
        <Pending h={560}>Key capabilities and proof points (clients, deployments, results).</Pending>
      </Slide>
    ),
  },

  // ───────────────────────────── CoreCard ─────────────────────────────
  {
    id: "corecard",
    section: CC,
    render: () => <SectionSlide n="02" brand="corecard" title="Issuing & Processing" sub="CoreCard, a Euronet company" />,
  },
  {
    id: "cc-platform",
    section: CC,
    draft: true,
    render: () => (
      <Slide section={CC} brand="corecard" kicker="CoreCard" title="The platform">
        <Pending h={560}>CoreCard platform overview: products supported, processing, scale and clients.</Pending>
      </Slide>
    ),
  },
  {
    id: "cc-usecases",
    section: CC,
    render: () => (
      <Slide section={CC} brand="corecard" kicker="CoreCard" title="One platform, many card programs" lede="Four card programs, one issuing and processing platform.">
        <Tiles
          cols={4}
          items={[
            { t: "Stablecoin-Backed Cards", d: "Hold value in regulated USD stablecoins and spend it at any card-accepting merchant or ATM." },
            { t: "Buy Now, Pay Later", d: "Split a posted purchase or the statement balance into fixed monthly installments, in the card app." },
            { t: "Commercial", d: "Corporate and commercial card programs." },
            { t: "Loyalty", d: "Rewards that drive top-of-wallet: earn by category, redeem instantly." },
          ]}
        />
      </Slide>
    ),
  },

  // Stablecoin-backed cards (source: Stablecoin-Backed Cards one-pager)
  {
    id: "sc-hero",
    section: CC,
    render: () => (
      <Slide
        section={CC}
        kicker="Stablecoin-Backed Cards"
        title={<>Make stablecoins spendable <span className="teal">everywhere cards are accepted.</span></>}
        lede="A card program that lets customers hold value in regulated USD stablecoins and spend it instantly in local currency at any card-accepting merchant or ATM worldwide — powered by Euronet's global payments infrastructure."
      >
        <Stats
          items={[
            { v: "$300B+", l: "USD stablecoins in circulation in 2026" },
            { v: ">300%", l: "growth in stablecoin float over 5 years" },
            { v: "150M+", l: "merchant locations reachable on global card networks" },
            { v: "2025", l: "GENIUS Act sets a US federal framework for payment stablecoins" },
          ]}
        />
      </Slide>
    ),
  },
  {
    id: "sc-why",
    section: CC,
    render: () => (
      <Slide section={CC} kicker="Stablecoin-Backed Cards" title="The Why" lede="Stablecoins are going mainstream. Time is ripe for banks and fintechs to tap into this rapidly growing market.">
        <Tiles
          items={[
            { t: "Capitalize on growing stablecoin adoption", d: "Turn stablecoin holders into active cardholders before a competitor does." },
            { t: "Settle smarter and faster", d: "Using 24/7 blockchain rails, funds move immediately from user wallet to the issuer's account (can be in real-time or on a schedule)." },
            { t: "Win top of wallet", d: "Use rewards and digital wallet capabilities to drive greater engagement and stickiness with customers." },
            { t: "Unlock new revenue", d: "On-ramp, treasury float, and FX conversion fees offer new ways to generate revenue." },
          ]}
        />
      </Slide>
    ),
  },
  {
    id: "sc-how",
    section: CC,
    hold: 16,
    render: () => (
      <Slide section={CC} kicker="Stablecoin-Backed Cards" title="The How" lede="For cardholders and the merchant, it works exactly like a normal prepaid debit card. Nothing changes.">
        <Steps
          items={[
            { t: "Fund", d: "Users buy, receive or transfer digital dollars like USDC to a secure institutional grade crypto wallet (MPC) hosted by Euronet for you." },
            { t: "Issue", d: "A Visa/Mastercard prepaid card is issued and loaded 1:1 in USD with the stablecoin balance equivalent." },
            { t: "Spend", d: "Customers can pay with this card at any Visa / Mastercard merchant, online or in-store, just as they do today." },
            { t: "Authorize", d: "On authorization, the user prepaid balance is adjusted in USD and a matching hold is placed on the stablecoins in the wallet." },
            { t: "Sweep", d: "Move authorized spend dollars from the user stablecoin wallet to your treasury stablecoin wallet in real-time or end of day (based on your preference)." },
            { t: "Settle", d: "Stablecoins convert to USD and network settlement runs exactly as it does today." },
          ]}
        />
        <Banner hi="Not a crypto product. A payments product">— built on stablecoin rails, run on proven card infrastructure.</Banner>
      </Slide>
    ),
  },
  {
    id: "sc-stack",
    section: CC,
    hold: 16,
    render: () => (
      <Slide section={CC} kicker="Stablecoin-Backed Cards" title="One stack. Fully managed by Euronet.">
        <div className="dk-split">
          <Layers
            items={[
              { tone: "blue", t: "Front-end experiences", d: "Branded mobile app, workflows, rewards and everyday spend management" },
              { tone: "peach", t: "Payment processing & compliance", d: "Card management (CMS), authorization, card controls, user management, clearing, KYC/KYB/AML" },
              { tone: "teal", t: "Stablecoin wallet & settlement", d: "MPC wallets, on / off-ramp, VASP integrations and on-chain to card-rails reconciliation" },
            ]}
          />
          <div>
            <SubHead>Why Euronet</SubHead>
            <Checks
              items={[
                { b: "Proven at global scale:", t: "issuing, processing and compliance trusted by marquee banks and fintechs worldwide." },
                { b: "Enterprise-grade stablecoin rails:", t: "integrated with Fireblocks, the digital-asset infrastructure behind 550M+ secured wallets." },
                { b: "Multi-currency by design:", t: "USDC today; EURC, XSGD and more on the roadmap." },
                { b: "One partner, end to end:", t: "onboarding, issuance, processing, reporting and settlement — one relationship to manage." },
              ]}
            />
          </div>
        </div>
      </Slide>
    ),
  },

  // BNPL + loyalty: the live card app
  {
    id: "app-demo",
    section: CC,
    hold: 30,
    render: ({ kiosk }) => (
      <Slide
        section={CC}
        brand="corecard"
        kicker="Live demo"
        title={<>The cardholder app, <span className="teal">with BNPL built in</span></>}
        aside={<LiveApp tour={kiosk} />}
      >
        <Checks
          items={[
            { b: "Buy Now, Pay Later.", t: "Split any eligible purchase or the statement purchase balance into 3, 4 or 5 fixed monthly installments, with 0% APR options." },
            { b: "Statements & payments.", t: "Six months of statements, pay minimum, statement or any amount, and AutoPay." },
            { b: "Loyalty.", t: "Cash back by category on every purchase, card benefits and instant redemption." },
            { b: "Card controls.", t: "Lock the card, switch channels on or off, set limits, replace a lost card." },
          ]}
        />
        {kiosk ? <p className="dk-demo-note">Tap the phone to try it yourself.</p> : <Jump />}
      </Slide>
    ),
  },
  {
    id: "loyalty",
    section: CC,
    hold: 20,
    render: ({ kiosk }) => (
      <Slide section={CC} brand="corecard" kicker="Loyalty" title="Rewards that win top of wallet" aside={<LiveApp start="rewards" />}>
        <Checks
          items={[
            { b: "Earn by category.", t: "Tiered cash back on travel, dining, hotels and everyday spend, shown on every transaction." },
            { b: "Redeem instantly.", t: "Statement credit, bank deposit or gift cards, in a couple of taps." },
            { b: "Network benefits.", t: "Card-tier benefits surfaced in the app." },
          ]}
        />
        <Pending>Loyalty program capabilities and client results.</Pending>
        {!kiosk && <Jump start="rewards" />}
      </Slide>
    ),
  },
  {
    id: "commercial",
    section: CC,
    draft: true,
    render: () => (
      <Slide section={CC} brand="corecard" kicker="Commercial" title="Commercial card programs">
        <Pending h={560}>Commercial use case: target clients, capabilities (corporate, purchasing, virtual cards, controls, expense data), proof points.</Pending>
      </Slide>
    ),
  },

  // ─────────────────────────────── Close ───────────────────────────────
  {
    id: "close",
    section: EURONET,
    render: () => (
      <div className="dk-slide dk-close">
        <img src={LOGOS.euronetWhite} alt="Euronet" className="dk-title-logo" />
        <div className="dk-close-mid">
          <h1>Let's design your program <span className="teal">and go-to-market roadmap</span></h1>
          <p>Tailored to your customers. One partner, end to end.</p>
          <div className="dk-close-logos">
            <img src={LOGOS.ren} alt="Ren" />
            <img src={LOGOS.corecard} alt="CoreCard" />
          </div>
        </div>
        <div className="dk-close-cta">
          <span>Talk to your Euronet representative</span>
          <b>www.euronetworldwide.com</b>
        </div>
      </div>
    ),
  },
];
