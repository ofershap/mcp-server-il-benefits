import { describe, expect, it } from "vitest";
import { bestWayToPay, isHeld, rank } from "../src/engine.js";
import { createGotCashbackSource } from "../src/sources/gotcashback.js";
import type { BenefitSource } from "../src/types.js";
import { fakeFetch } from "./helpers.js";

const src = () => [createGotCashbackSource(fakeFetch())];

describe("engine", () => {
  it("ranks held providers first, then by percent", async () => {
    const a = await bestWayToPay(src(), "Fox", { wallet: { providers: ["cashdo"] } });
    expect(a.options[0]).toMatchObject({ provider: "Cashdo קאשדו", held: true });
    expect(a.options[1]!.provider).toBe("CardCash.com");
  });

  it("estimates the saving from a basket amount", async () => {
    const a = await bestWayToPay(src(), "Fox", { wallet: null, amount: 200 });
    const top = a.options.find((o) => o.provider === "TOPCASH")!;
    expect(top.estimated_saving_ils).toBe(9);
  });

  it("filters by channel", async () => {
    const a = await bestWayToPay(src(), "Fox", { wallet: null, channel: "in-store" });
    expect(a.options.every((o) => o.channel !== "online")).toBe(true);
  });

  it("says so honestly when nothing is found", async () => {
    const empty = [createGotCashbackSource(fakeFetch({ x: {} }))];
    const a = await bestWayToPay(empty, "Nowhere", { wallet: null });
    expect(a.options).toEqual([]);
    expect(a.note).toMatch(/Do not guess/);
  });

  it("reports a failing source without losing the others", async () => {
    const broken: BenefitSource = {
      id: "broken",
      name: "Broken",
      terms_url: "https://example.com/terms",
      attribution: "x",
      query: async () => {
        throw new Error("down");
      },
    };
    const a = await bestWayToPay([broken, ...src()], "Fox", { wallet: null });
    expect(a.errors).toEqual([{ source: "broken", error: "down" }]);
    expect(a.options.length).toBeGreaterThan(0);
  });

  it("matches wallet names loosely but not on one letter", () => {
    expect(isHeld("TOPCASH", { providers: ["Top Cash"] })).toBe(true);
    expect(isHeld("TOPCASH", { providers: ["a"] })).toBe(false);
    expect(rank([], null)).toEqual([]);
  });
});
