import { describe, expect, it } from "vitest";
import { loadBundled } from "../src/data.js";

const data = loadBundled();

describe("bundled dataset", () => {
  it("has unique ids", () => {
    for (const list of [data.stores, data.programs, data.offers]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("links every offer to a known program and known stores", () => {
    const storeIds = new Set(data.stores.map((s) => s.id));
    const programIds = new Set(data.programs.map((p) => p.id));
    for (const offer of data.offers) {
      expect(programIds.has(offer.program_id), offer.id).toBe(true);
      for (const id of offer.applies_to.stores ?? [])
        expect(storeIds.has(id), `${offer.id}:${id}`).toBe(true);
    }
  });

  it("gives every offer a https source and a real date", () => {
    for (const offer of data.offers) {
      expect(offer.source_url.startsWith("https://"), offer.id).toBe(true);
      expect(Number.isNaN(Date.parse(offer.as_of)), offer.id).toBe(false);
    }
  });

  it("has no personal data fields", () => {
    const keys = new Set<string>();
    const walk = (v: unknown) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object")
        for (const [k, x] of Object.entries(v)) {
          keys.add(k);
          walk(x);
        }
    };
    walk(data);
    for (const key of ["card_number", "last4", "balance", "id_number", "phone"])
      expect(keys.has(key)).toBe(false);
  });
});
