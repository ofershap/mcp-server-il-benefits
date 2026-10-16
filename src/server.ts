import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { bestWayToPay } from "./engine.js";
import { defaultSources } from "./sources/index.js";
import type { BenefitSource } from "./types.js";
import { configDir, loadWallet, saveWallet } from "./wallet.js";

const text = (value: unknown) => ({
  content: [
    {
      type: "text" as const,
      text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
    },
  ],
});

export function createServer(sources: BenefitSource[] = defaultSources()): McpServer {
  const server = new McpServer({ name: "il-benefits", version: "0.1.0" });

  server.registerTool(
    "best_way_to_pay",
    {
      title: "Best way to pay at a store",
      description:
        "Use when the user is in or heading to a store and asks which card, club, cashback portal or discounted gift card to use. Takes a store or chain name in Hebrew or English. Makes one live request to the connected benefit sources and returns ranked options (the user's own providers first), how to use each, and a link. Always show the links and the source attribution, and tell the user to confirm at checkout. Never buys anything.",
      inputSchema: {
        store: z.string().min(1).describe("Store or chain, e.g. 'שופרסל', 'Fox', 'Castro'"),
        country: z.string().length(2).optional().describe("ISO country code, default 'il'"),
        amount: z.number().positive().optional().describe("Basket size, to estimate the saving"),
        channel: z.enum(["in-store", "online"]).optional().describe("Defaults to both"),
      },
    },
    async ({ store, country, amount, channel }) =>
      text(await bestWayToPay(sources, store, { country, amount, channel, wallet: loadWallet() })),
  );

  server.registerTool(
    "list_sources",
    {
      title: "List connected benefit sources",
      description:
        "Show which existing benefit databases this server asks, their terms page and what they cover. Use to explain where an answer came from or why a store has no result.",
      inputSchema: {},
    },
    async () =>
      text(
        sources.map((s) => ({
          id: s.id,
          name: s.name,
          terms_url: s.terms_url,
          attribution: s.attribution,
        })),
      ),
  );

  server.registerTool(
    "wallet_get",
    {
      title: "Show the saved wallet",
      description:
        "Show the cashback portals, clubs and sellers the user said they use. The wallet is a local file of names. It never leaves the machine.",
      inputSchema: {},
    },
    async () =>
      text(
        loadWallet() ?? { providers: [], note: `No wallet yet. It is saved in ${configDir()}.` },
      ),
  );

  server.registerTool(
    "wallet_set",
    {
      title: "Save the providers the user uses",
      description:
        "Replace the saved wallet with provider names as they appear in results (for example a cashback portal name or a gift card seller). Used to rank the user's own providers first. Store names only. Never ask for or store card numbers, balances or personal details.",
      inputSchema: { providers: z.array(z.string().min(1).max(80)).max(100) },
    },
    async ({ providers }) => {
      saveWallet({ providers });
      return text({ saved: providers });
    },
  );

  return server;
}
