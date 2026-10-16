import cashback from "./fixtures/cashback-fox.json" with { type: "json" };
import cards from "./fixtures/giftcards-target.json" with { type: "json" };

/** A fake fetch that speaks the GotCashback MCP endpoint over SSE. */
export function fakeFetch(
  map: Record<string, unknown> = {
    get_cashback_rates_by_store_name: cashback,
    get_gift_cards_by_store_name: cards,
  },
  calls: { tool: string; args: Record<string, unknown> }[] = [],
): typeof fetch {
  return (async (_url: unknown, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body));
    calls.push({ tool: body.params.name, args: body.params.arguments });
    const structuredContent = map[body.params.name] ?? { stores: [] };
    return new Response(
      `event: message\ndata: ${JSON.stringify({ result: { structuredContent }, id: 1, jsonrpc: "2.0" })}\n\n`,
      { status: 200, headers: { "content-type": "text/event-stream" } },
    );
  }) as typeof fetch;
}
