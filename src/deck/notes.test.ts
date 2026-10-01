import { describe, expect, it } from "vitest";
import { NOTES } from "./notes";
import { SLIDES } from "./slides";

describe("speaker notes", () => {
  it("every slide has notes, and every note belongs to a slide", () => {
    const ids = SLIDES.map((s) => s.id);
    expect(ids.filter((id) => !NOTES[id]?.say.length)).toEqual([]);
    expect(Object.keys(NOTES).filter((id) => !ids.includes(id))).toEqual([]);
  });
  it("draft slides flag the talk track that is still to come", () => {
    for (const s of SLIDES.filter((x) => x.draft)) expect(NOTES[s.id].say.some((l) => l.startsWith("[To add]"))).toBe(true);
  });
});
