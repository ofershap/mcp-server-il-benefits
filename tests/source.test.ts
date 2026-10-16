import { describe, expect, it } from "vitest";
import {
  createGotCashbackSource,
  parseCashback,
  parseGiftCards,
} from "../src/sources/gotcashback.js";
import cashback from "./fixtures/cashback-fox.json" with { type: "json" };
import cards from "./fixtures/giftcards-target.json" with { type: "json" };
import { fakeFetch } from "./helpers.js";

describe("GotCashback adapter", () => {
  it("parses cashback rates with links", () => {
    const { benefits, store_page } = parseCashback(cashback);
    expect(benefits).toHaveLength(3);
    expect(benefits[2]).toMatchObject({
      provider: "TOPCASH",
      percent: 4.5,
      upto: true,
      channel: "online",
    });
    expect(benefits[0]!.link).toMatch(/^https:\/\/www\.gotcashback\.co\.il\/Click\//);
    expect(store_page).toMatch(/gotcashback\.co\.il\/Stores/);
  });

  it("skips gift cards without a discount percent", () => {
    const { benefits } = parseGiftCards(cards);
    expect(benefits).toHaveLength(1);
    expect(benefits[0]).toMatchObject({
      kind: "gift-card",
      provider: "CardCash.com",
      percent: 7.01,
    });
    expect(benefits[0]!.how_to_use).toMatch(/BEFORE you pay/);
  });

  it("makes exactly two live calls per question, lowercase country, no storage", async () => {
    const calls: { tool: string; args: Record<string, unknown> }[] = [];
    const src = createGotCashbackSource(fakeFetch(undefined, calls));
    const res = await src.query("Fox", { country: "IL" });
    expect(calls.map((c) => c.tool).sort()).toEqual([
      "get_cashback_rates_by_store_name",
      "get_gift_cards_by_store_name",
    ]);
    expect(calls[0]!.args).toEqual({ store_name: "Fox", country_code: "il" });
    expect(res.attribution).toMatch(/GotCashback\.com/);
  });

  it("fails loudly on HTTP errors", async () => {
    const bad = (async () => new Response("no", { status: 503 })) as unknown as typeof fetch;
    await expect(createGotCashbackSource(bad).query("x", { country: "il" })).rejects.toThrow(/503/);
  });
});
