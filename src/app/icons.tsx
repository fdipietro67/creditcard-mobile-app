// Official Visa logo (src/assets/brand/). An SVG, if added, takes precedence over the PNG.
const brandFiles = import.meta.glob("../assets/brand/visa-logo.{svg,png}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const VISA_LOGO_URL: string | undefined =
  Object.entries(brandFiles).find(([k]) => k.endsWith(".svg"))?.[1] ?? Object.values(brandFiles)[0];

import money2020Logo from "../assets/brand/money2020-logo.svg";

/** Official Money20/20 wordmark (white), from money2020.com. */
export const Money2020Mark = () => <img src={money2020Logo} alt="Money20/20" className="m2020-logo" />;

export const VisaMark = () =>
  VISA_LOGO_URL ? (
    <img src={VISA_LOGO_URL} alt="Visa" className="visa-logo" />
  ) : (
    <span className="visa-word" aria-label="Visa">VISA</span>
  );

/** Generic contactless indicator (plain arcs). */
export const ContactlessIco = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M8 8.5a5 5 0 0 1 0 7" />
    <path d="M11.5 6a8.5 8.5 0 0 1 0 12" />
    <path d="M15 3.5a12 12 0 0 1 0 17" />
  </svg>
);

export const BnplArt = () => (
  <svg viewBox="0 0 128 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 48h30l-3 40a4 4 0 0 1-4 3.6H17a4 4 0 0 1-4-3.6L10 48Z" fill="var(--accent)" opacity=".22" />
    <path d="M18 48v-4a7 7 0 0 1 14 0v4" stroke="var(--accent)" strokeWidth="3" opacity=".55" />
    <path d="M32 42h32l-3 44a4 4 0 0 1-4 3.6H39a4 4 0 0 1-4-3.6L32 42Z" fill="var(--accent)" />
    <path d="M41 42v-5a7 7 0 0 1 14 0v5" stroke="#fff" strokeWidth="3" opacity=".85" />
    <rect x="74" y="14" width="44" height="74" rx="9" fill="#1B2540" />
    <rect x="80" y="22" width="32" height="44" rx="4" fill="#fff" opacity=".14" />
    <rect x="84" y="55" width="24" height="9" rx="4.5" fill="var(--accent)" />
    <circle cx="96" cy="80" r="3" fill="#fff" opacity=".55" />
    <circle cx="108" cy="26" r="13" fill="var(--accent)" stroke="#fff" strokeWidth="2.5" />
    <path d="M108 20v6l4 3" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevL = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const ChevR = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const ClockIco = ({ size = 18, stroke = "currentColor" }: { size?: number; stroke?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const PlusIco = ({ size = 12, w = 2.6 }: { size?: number; w?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w}>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);
export const MinusIco = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
    <path d="M5 12h14" strokeLinecap="round" />
  </svg>
);
export const CheckIco = ({ size = 12, stroke = "currentColor", w = 3 }: { size?: number; stroke?: string; w?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={w}>
    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const SearchIco = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

const s = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 } as const;
export const MenuIcons = {
  payments: (
    <svg {...s}><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.5c0-1.2 1.1-1.8 2.5-1.8s2.5.7 2.5 1.9-1.1 1.6-2.5 1.6-2.5.5-2.5 1.7 1.1 1.9 2.5 1.9 2.5-.6 2.5-1.8" strokeLinecap="round" /></svg>
  ),
  rewards: (
    <svg {...s}><rect x="3" y="8" width="18" height="5" rx="1" /><path d="M5 13v7h14v-7M12 8v12M12 8S9 3 6.5 5 8 8 12 8ZM12 8s3-5 5.5-3S16 8 12 8Z" strokeLinejoin="round" /></svg>
  ),
  bnpl: (
    <svg {...s}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  controls: (
    <svg {...s}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></svg>
  ),
  services: (
    <svg {...s}><path d="M4 5h13a2 2 0 0 1 2 2v13H6a2 2 0 0 1-2-2V5Z" /><path d="M8 4v13" /></svg>
  ),
  alerts: (
    <svg {...s}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6ZM10 20a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  documents: (
    <svg {...s}><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v4h4M9 13h6M9 17h6" strokeLinecap="round" /></svg>
  ),
};

// Line icons for the full card app (24px grid, stroke = currentColor).
const P: Record<string, string> = {
  home: "M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z",
  pay: "M3 7h18v12H3zM3 11h18M7 15h4",
  doc: "M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6",
  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  gift: "M3 8h18v5H3zM5 13v8h14v-8M12 8v13M12 8S9 3 6.5 5 8 8 12 8ZM12 8s3-5 5.5-3S16 8 12 8Z",
  lock: "M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3",
  unlock: "M6 11h12v10H6zM8 11V8a4 4 0 0 1 7.5-2",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
  cart: "M3 4h2l2.4 11h10.2L20 8H6.2M9 20a1 1 0 1 0 0-.01M17 20a1 1 0 1 0 0-.01",
  wave: "M8 8.5a5 5 0 0 1 0 7M11.5 6a8.5 8.5 0 0 1 0 12M15 3.5a12 12 0 0 1 0 17",
  atm: "M4 4h16v7H4zM7 11v9h10v-9M10 15h4",
  gauge: "M4 17a8 8 0 1 1 16 0M12 13l4-4",
  wallet: "M4 7h15a1 1 0 0 1 1 1v11H5a1 1 0 0 1-1-1V7Zm0 0 12-3v3M16 13h1",
  phone: "M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM11 18h2",
  alert: "M12 3 2 20h20L12 3ZM12 10v4M12 17v.5",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M18 14a6 6 0 0 1 4 7",
  trend: "M3 17 9 11l4 4 8-8M15 7h6v6",
  plane: "M10.5 21 12 17l5 2v-2l-5-3V8.5a1.5 1.5 0 0 0-3 0V14l-5 3v2l5-2 1.5 4Z",
  leaf: "M5 19c0-8 5-13 15-14-1 10-6 15-14 15M5 19l7-7",
  key: "M14 10a4 4 0 1 0-3.5 4L5 19.5V21h2.5v-2h2v-2h2l1-1",
  bell: "M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6ZM10 20a2 2 0 0 0 4 0",
  check: "m5 13 4 4L19 7",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3.5 2",
  card: "M3 6h18v12H3zM3 10h18",
  bank: "M3 10 12 4l9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18",
  shield: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  pin: "M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11ZM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v6M12 7.5v.5",
};
export type IcoName = keyof typeof P;
export const Ico = ({ n, size = 18, w = 2 }: { n: string; size?: number; w?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={P[n] ?? P.info} />
  </svg>
);
