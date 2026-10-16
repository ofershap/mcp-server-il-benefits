import { describe, expect, it } from "vitest";
import { loadBundled } from "../src/data.js";
import { bestWayToPay, findStores, normalize } from "../src/engine.js";

const data = loadBundled();
const now = new Date("2026-10-20T00:00:00Z");

describe("store matching", () => {
  it("ignores quotes and spaces", () => {
    expect(normalize("מק דונלד'ס")).toBe(normalize("מקדונלדס"));
  });
  it("matches Hebrew, English and aliases", () => {
    expect(findStores("רמי לוי", data.stores)[0]?.id).toBe("rami-levy");
    expect(findStores("FOX", data.stores)[0]?.id).toBe("fox");
    expect(findStores("יס פלאנט", data.stores)[0]?.id).toBe("planet-cinema");
  });
  it("returns nothing for unknown stores", () => {
    expect(findStores("zzzz", data.stores)).toEqual([]);
  });
});

describe("bestWayToPay", () => {
  it("lists held programs before programs the user does not hold", () => {
    const res = bestWayToPay(data, "גולף", { wallet: { programs: ["isracard-top"] }, now });
    expect(res.candidates[0]?.program.id).toBe("isracard-top");
    expect(res.candidates[0]?.held).toBe(true);
    expect(res.candidates.at(-1)?.held).toBe(false);
  });

  it("estimates the saving from the basket amount", () => {
    const res = bestWayToPay(data, "Fox", {
      amount: 400,
      wallet: { programs: ["max-executive-prepaid"] },
      now,
    });
    expect(res.candidates[0]?.estimated_saving).toBe(66);
    expect(res.candidates[0]?.how_to_use).toMatch(/load/i);
  });

  it("does not turn a fee reduction into a basket saving", () => {
    const res = bestWayToPay(data, "wolt", { amount: 100, now });
    expect(res.candidates.every((c) => c.mechanism !== "fee-reduction")).toBe(true);
  });

  it("flags stale entries", () => {
    const res = bestWayToPay(data, "רמי לוי", { now });
    const hever = res.candidates.find((c) => c.program.id === "hever-club");
    expect(hever?.caveat).toMatch(/confirm/i);
  });

  it("says so when nothing is known", () => {
    const res = bestWayToPay(data, "mango", { wallet: { programs: [] }, channel: "online", now });
    expect(res.store?.id).toBe("mango");
    const none = bestWayToPay(data, "unknown shop", { now });
    expect(none.store).toBeNull();
    expect(none.note).toMatch(/No store matches/);
  });

  it("respects the channel filter", () => {
    const res = bestWayToPay(data, "פלאנט", { channel: "online", now });
    expect(res.candidates).toEqual([]);
  });
});
