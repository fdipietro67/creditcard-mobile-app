import { describe, expect, it } from "vitest";
import { configFromParams, hexA, normalizeHex, sanitizeConfig, shareUrl } from "./demoConfig";

describe("DemoConfig", () => {
  it("normalizes hex colors and rejects junk", () => {
    expect(normalizeHex("e4002b")).toBe("#E4002B");
    expect(normalizeHex("#abc")).toBe("#AABBCC");
    expect(normalizeHex("red")).toBeUndefined();
    expect(hexA("#E4002B", 0.1)).toBe("rgba(228,0,43,0.1)");
  });

  it("sanitizes untrusted input", () => {
    expect(sanitizeConfig({ clientName: "  Acme  ", accent: "nope", extra: 1 })).toEqual({ clientName: "Acme" });
    expect(sanitizeConfig({ cardImage: "data:image/svg+xml;base64,AAA" })).toEqual({ cardImage: null });
    expect(sanitizeConfig({ cardImage: "data:image/webp;base64,AAA" })).toEqual({ cardImage: "data:image/webp;base64,AAA" });
    expect(sanitizeConfig(null)).toEqual({});
    expect(sanitizeConfig({ clientName: "x".repeat(200) }).clientName).toHaveLength(80);
  });

  it("reads lightweight URL params", () => {
    const p = new URLSearchParams("client=Acme%20Airways&accent=%23E4002B&holder=Dana&rewards=AcmeMiles");
    expect(configFromParams(p)).toEqual({ clientName: "Acme Airways", accent: "#E4002B", cardholderName: "Dana", rewardsLabel: "AcmeMiles" });
    expect(configFromParams(new URLSearchParams(""))).toBeNull();
  });

  it("builds share URLs (short id wins over params)", () => {
    const cfg = { clientName: "Acme Airways", accent: "#E4002B" };
    expect(shareUrl("https://demo.example", cfg, "Ab3xYz9")).toBe("https://demo.example/?c=Ab3xYz9");
    expect(shareUrl("https://demo.example", cfg)).toBe("https://demo.example/?client=Acme+Airways&accent=%23E4002B");
  });
});
