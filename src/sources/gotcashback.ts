import type { Benefit, BenefitSource, QueryOptions, SourceResult } from "../types.js";

const ENDPOINT = "https://mcp.gotcashback.com";
const USER_AGENT =
  "mcp-server-il-benefits/0.1 (+https://github.com/ofershap/mcp-server-il-benefits)";

type Json = Record<string, unknown>;

async function callTool(
  fetcher: typeof fetch,
  name: string,
  args: Json,
  signal?: AbortSignal,
): Promise<Json> {
  const res = await fetcher(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "user-agent": USER_AGENT,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name, arguments: args },
    }),
    signal: signal ?? AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`GotCashback answered HTTP ${res.status}`);
  const raw = await res.text();
  const dataLine = raw.split("\n").find((l) => l.startsWith("data: "));
  const body = JSON.parse(dataLine ? dataLine.slice(6) : raw) as {
    result?: { structuredContent?: Json; isError?: boolean };
    error?: { message?: string };
  };
  if (body.error) throw new Error(`GotCashback error: ${body.error.message ?? "unknown"}`);
  return body.result?.structuredContent ?? {};
}

const num = (v: unknown): number | undefined => (typeof v === "number" ? v : undefined);
const str = (v: unknown): string => (typeof v === "string" ? v : "");

export function parseCashback(payload: Json): { benefits: Benefit[]; store_page?: string } {
  const benefits: Benefit[] = [];
  let store_page: string | undefined;
  for (const s of (payload.stores as Json[] | undefined) ?? []) {
    store_page ??= str(s.url) || undefined;
    for (const r of (s.cashback_rates as Json[] | undefined) ?? []) {
      if (r.type !== "percent" || num(r.rate) === undefined) continue;
      const location = str(r.location);
      benefits.push({
        kind: "cashback",
        source: "gotcashback",
        provider: str(r.portal).trim(),
        store: str(s.name),
        percent: num(r.rate),
        upto: r.upto === true,
        channel: location === "online" ? "online" : location === "in-store" ? "in-store" : "both",
        how_to_use:
          location === "online"
            ? "Open the store through the link first, then shop online. Cashback is credited later by the portal."
            : "Activate through the portal link or its app before paying. Cashback is credited later by the portal.",
        link: str(r.url),
      });
    }
  }
  return { benefits, store_page };
}

export function parseGiftCards(payload: Json): { benefits: Benefit[]; store_page?: string } {
  const benefits: Benefit[] = [];
  let store_page: string | undefined;
  for (const s of (payload.stores as Json[] | undefined) ?? []) {
    store_page ??= str(s.gift_cards_url) || str(s.url) || undefined;
    for (const g of (s.gift_cards as Json[] | undefined) ?? []) {
      const percent = num(g.discount_percent);
      if (percent === undefined) continue;
      benefits.push({
        kind: "gift-card",
        source: "gotcashback",
        provider: str(g.seller).trim(),
        store: str(s.name),
        percent,
        channel: "both",
        how_to_use:
          "Buy the discounted gift card BEFORE you pay, then pay with it at the store. The user buys it on the seller's page, nothing is bought for them.",
        link: str(g.url),
      });
    }
  }
  return { benefits, store_page };
}

export function createGotCashbackSource(fetcher: typeof fetch = fetch): BenefitSource {
  return {
    id: "gotcashback",
    name: "GotCashback",
    terms_url: "https://www.gotcashback.com/Terms/",
    attribution: "Data from GotCashback.com (https://www.gotcashback.com/), fetched live.",
    async query(store: string, options: QueryOptions): Promise<SourceResult> {
      const args = { store_name: store, country_code: options.country.toLowerCase() };
      const [cashback, cards] = await Promise.all([
        callTool(fetcher, "get_cashback_rates_by_store_name", args, options.signal),
        callTool(fetcher, "get_gift_cards_by_store_name", args, options.signal),
      ]);
      const a = parseCashback(cashback);
      const b = parseGiftCards(cards);
      return {
        source: "gotcashback",
        attribution: this.attribution,
        store_page: a.store_page ?? b.store_page,
        fetched_at: new Date().toISOString(),
        benefits: [...a.benefits, ...b.benefits],
      };
    },
  };
}
