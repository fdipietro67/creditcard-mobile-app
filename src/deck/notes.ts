/**
 * Speaker notes, keyed by slide id (see slides.tsx). Shown with N (notes drawer) or S (presenter
 * window). Only facts from approved sources go here: the Stablecoin-Backed Cards one-pager and the
 * demo app's own sample figures. "[To add]" lines mark talk track that waits on Euronet material.
 */
export type Note = { say: string[]; tip?: string };

export const NOTES: Record<string, Note> = {
  title: {
    say: [
      "Welcome, and introduce yourself and your role at Euronet.",
      "Today we'll cover two Euronet businesses: Ren for ATM and self-service, and CoreCard for card issuing and processing.",
      "The thread through everything: one partner, end to end — onboarding, issuance, processing, reporting and settlement.",
    ],
    tip: "Keep it under a minute. Ask what brought them to Money20/20 to tailor what follows.",
  },
  history: {
    say: ["Walk through Euronet's story and the milestones that matter for this audience.", "[To add] Milestones from the Euronet material: founding, key expansions and acquisitions, Ren, CoreCard."],
    tip: "Pick three or four milestones; this slide should take about a minute.",
  },
  strengths: {
    say: ["Lead with the headline numbers, then the strengths behind them.", "[To add] Sourced, dated figures for the stat strip, and one proof point per strength."],
    tip: "Only quote numbers that are on the slide and in the source material.",
  },
  businesses: {
    say: [
      "Show where Ren and CoreCard sit within Euronet.",
      "Ren covers ATM and self-service; CoreCard covers card issuing and processing.",
      "[To add] The other Euronet business lines and how they connect.",
      "Bridge: “Let's start with self-service — Ren.”",
    ],
  },
  ren: {
    say: ["Section one: Ren, a Euronet brand, for ATM and self-service.", "Set up what's coming: the platform, then its capabilities and proof points."],
  },
  "ren-platform": {
    say: ["[To add] Ren platform overview: what it is, who it serves, and the problem it solves."],
    tip: "Ask about their current ATM or self-service estate before going deep.",
  },
  "ren-capabilities": {
    say: ["[To add] Key capabilities and proof points: clients, deployments, results.", "Bridge to CoreCard: “From self-service to the cards themselves.”"],
  },
  corecard: {
    say: ["Section two: CoreCard, a Euronet company, for card issuing and processing.", "Set up the idea: one platform, many card programs."],
  },
  "cc-platform": {
    say: ["[To add] CoreCard platform overview: products supported, processing, scale and clients."],
  },
  "cc-usecases": {
    say: [
      "Four card programs on one issuing and processing platform: stablecoin-backed cards, Buy Now Pay Later, commercial, and loyalty.",
      "We'll go deeper on stablecoin-backed cards, then show BNPL and loyalty live in the cardholder app.",
    ],
    tip: "Ask: which of these is closest to your roadmap? Spend your time there.",
  },
  "sc-hero": {
    say: [
      "The core idea: make stablecoins spendable everywhere cards are accepted.",
      "Customers hold value in regulated USD stablecoins and spend it instantly, in local currency, at any card-accepting merchant or ATM worldwide.",
      "Why now: more than $300B in USD stablecoins in circulation in 2026, over 300% growth in stablecoin float over five years, 150M+ merchant locations on the global card networks, and the 2025 GENIUS Act setting a US federal framework for payment stablecoins.",
    ],
  },
  "sc-why": {
    say: [
      "Four reasons for banks and fintechs:",
      "Capture adoption — turn stablecoin holders into active cardholders before a competitor does.",
      "Settle faster — 24/7 blockchain rails move funds from the user's wallet to the issuer, in real time or on a schedule.",
      "Win top of wallet — rewards and digital wallets drive engagement.",
      "New revenue — on-ramp, treasury float and FX conversion fees.",
    ],
    tip: "Ask whether they already serve stablecoin holders today.",
  },
  "sc-how": {
    say: [
      "The key line: for cardholders and merchants, it works exactly like a normal prepaid debit card. Nothing changes.",
      "Fund a Euronet-hosted MPC wallet with digital dollars like USDC. Issue a Visa or Mastercard prepaid card loaded 1:1 in USD. Spend anywhere.",
      "On authorization, the USD balance is adjusted and a matching hold is placed on the stablecoins. Sweep to the issuer's treasury wallet in real time or end of day. Settle in USD exactly as today.",
      "Close with: not a crypto product — a payments product, built on stablecoin rails and run on proven card infrastructure.",
    ],
  },
  "sc-stack": {
    say: [
      "One stack, fully managed by Euronet: front-end experiences, payment processing and compliance, and the stablecoin wallet and settlement layer.",
      "Why Euronet: proven at global scale; integrated with Fireblocks, the digital-asset infrastructure behind 550M+ secured wallets; USDC today with EURC, XSGD and more on the roadmap; and one partner end to end.",
      "The ask: be among the first to market — let's design your program and go-to-market roadmap.",
    ],
  },
  "app-demo": {
    say: [
      "This is a live cardholder app, not a video. Everything is tappable.",
      "Home: the Money20/20 Visa Signature card, available credit, statement balance and cash back.",
      "BNPL from the statement: tap BNPL → Proceed. The last statement's purchases are $985.21. Pick 3 months at $339.29 a month and 17.23% APR, or 4 months at $246.30 at 0% APR → Continue → agree to the terms → Confirm → open the installment schedule.",
      "Or from a purchase: tap JetBlue on Home → Set up a plan.",
      "Statements: the latest is $1,385.21 with a $440.00 minimum, which includes the $400 Hilton plan installment. Then show Rewards and Card controls briefly.",
    ],
    tip: "Press Reset demo before the next guest. The jump buttons take you straight to any screen.",
  },
  loyalty: {
    say: [
      "Rewards drive top of wallet. In this demo program: 3% on travel, dining and rideshare, 2% on hotels and home improvement, 1% on everything else.",
      "Show Redeem: statement credit, bank deposit or gift card, in a couple of taps.",
      "[To add] Loyalty program capabilities and client results.",
    ],
    tip: "The rates are the demo app's sample program, not a product offer.",
  },
  commercial: {
    say: ["[To add] Commercial card programs: target clients, capabilities and proof points."],
  },
  close: {
    say: [
      "Recap: Ren for ATM and self-service, CoreCard for issuing and processing — one partner, end to end.",
      "The ask: let's design your program and go-to-market roadmap, tailored to your customers.",
      "Next step: book a follow-up with your Euronet representative; www.euronetworldwide.com.",
    ],
    tip: "Agree a concrete next step and owner before they leave.",
  },
};
