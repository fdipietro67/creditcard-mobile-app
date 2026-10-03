/**
 * App color theme for the default (unbranded) Money20/20 demo.
 *   "money2020" — Money20/20 black & pink (money2020.com uses #000000 and #FF005A)
 *   "classic"   — the previous Visa-blue look
 * To revert, set APP_THEME = "classic". Client-branded demos (name/color/card art) always use
 * their own accent on the classic neutrals, whatever this says.
 */
export type AppTheme = "money2020" | "classic";
export const APP_THEME: AppTheme = "money2020";

export const THEME_ACCENT: Record<AppTheme, { accent: string; soft: string }> = {
  // #E6005A: Money20/20 pink deepened just enough for AA contrast with white text and as text on
  // white (#FF005A itself is ~3.9:1). The pure #FF005A is used for decorative fills in CSS.
  money2020: { accent: "#E6005A", soft: "rgba(255,0,90,.10)" },
  classic: { accent: "#1434CB", soft: "rgba(20,52,203,.10)" },
};
