import type { PartnerKey } from "./partners";

export const PartnerMark = ({ kind }: { kind: PartnerKey }) =>
  kind === "altair" ? (
    <svg className="astar" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0.5 13.6 10.4 22.5 12 13.6 13.6 12 23.5 10.4 13.6 1.5 12 10.4 10.4Z" />
    </svg>
  ) : (
    <svg className="casa-arch" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 21 L4 11 A8 8 0 0 1 20 11 L20 21 L15 21 L15 15 A3 3 0 0 0 9 15 L9 21 Z" />
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
