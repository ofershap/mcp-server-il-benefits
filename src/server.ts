import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { configDir, loadDataset } from "./data.js";
import { bestWayToPay, findStores } from "./engine.js";
import { addLocal, loadWallet, saveWallet, unknownPrograms } from "./wallet.js";
import { MECHANISMS } from "./types.js";

const text = (value: unknown) => ({
  content: [
    {
      type: "text" as const,
      text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
    },
  ],
});

export function createServer(): McpServer {
  const server = new McpServer({ name: "il-benefits", version: "0.1.0" });

  server.registerTool(
    "best_way_to_pay",
    {
      title: "Best way to pay at an Israeli store",
      description:
        "Use when the user is in or heading to a store and asks which card, club, voucher or prepaid card to pay with. Takes a store or chain name in Hebrew or English. Returns ranked options from the user's wallet first, how to use each one, conditions, a source link and the date it was checked. Always tell the user to confirm at checkout.",
      inputSchema: {
        store: z.string().describe("Store or chain, e.g. 'רמי לוי', 'Fox', 'פלאנט'"),
        amount: z
          .number()
          .positive()
          .optional()
          .describe("Basket size in ILS, to estimate the saving"),
        channel: z.enum(["in-store", "online"]).optional().describe("Defaults to both"),
      },
    },
    async ({ store, amount, channel }) => {
      const data = loadDataset();
      const result = bestWayToPay(data, store, { amount, channel, wallet: loadWallet() });
      return text(result);
    },
  );

  server.registerTool(
    "find_store",
    {
      title: "Find a store in the dataset",
      description:
        "Look up a chain by Hebrew or English name or alias. Use to check spelling or coverage before best_way_to_pay.",
      inputSchema: { query: z.string() },
    },
    async ({ query }) => text(findStores(query, loadDataset().stores)),
  );

  server.registerTool(
    "list_programs",
    {
      title: "List cards, clubs and programs",
      description:
        "List every program in the dataset with its id, who is eligible and where the details live. Use to help the user fill in wallet_set.",
      inputSchema: {},
    },
    async () =>
      text(
        loadDataset().programs.map((p) => ({
          id: p.id,
          name_he: p.names.he,
          name_en: p.names.en,
          kind: p.kind,
          issuer: p.issuer,
          requires: p.requires,
          url: p.url,
        })),
      ),
  );

  server.registerTool(
    "wallet_get",
    {
      title: "Show the saved wallet",
      description:
        "Show which programs the user said they hold. The wallet is a local file. It never leaves the machine.",
      inputSchema: {},
    },
    async () =>
      text(loadWallet() ?? { programs: [], note: `No wallet yet. It is saved in ${configDir()}.` }),
  );

  server.registerTool(
    "wallet_set",
    {
      title: "Save the cards and clubs the user holds",
      description:
        "Replace the saved wallet with a list of program ids from list_programs. Store only program ids. Never ask for or store card numbers, balances or personal details.",
      inputSchema: { programs: z.array(z.string()) },
    },
    async ({ programs }) => {
      const unknown = unknownPrograms(programs, loadDataset());
      if (unknown.length)
        return text(
          `Unknown program ids: ${unknown.join(", ")}. Call list_programs for valid ids.`,
        );
      saveWallet({ programs });
      return text({ saved: programs });
    },
  );

  server.registerTool(
    "add_local_offer",
    {
      title: "Add a benefit the user knows about",
      description:
        "Save a store benefit the user knows (for example from their employer or bank app) into their local data file, so best_way_to_pay can rank it. Needs a program the user holds, a store, and a source link or note. Local only.",
      inputSchema: {
        store: z.string().describe("Store or chain name"),
        program_id: z
          .string()
          .describe("Existing program id from list_programs, or a new id to create"),
        program_name: z.string().optional().describe("Needed when program_id is new"),
        mechanism: z.enum(MECHANISMS),
        percent: z.number().positive().max(100).optional(),
        summary: z.string().describe("One sentence, what the benefit is"),
        conditions: z.string().default("Supplied by the user. Not verified."),
        source_url: z.string().url().default("https://example.invalid/user-supplied"),
      },
    },
    async (input) => {
      const data = loadDataset();
      const stores = findStores(input.store, data.stores, 1);
      const storeId =
        stores[0]?.id ??
        input.store
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") ??
        "store";
      const newStores = stores[0]
        ? []
        : [
            {
              id: storeId || "store",
              names: { he: input.store, en: input.store },
              aliases: [],
              category: "other",
            },
          ];
      const hasProgram = data.programs.some((p) => p.id === input.program_id);
      const newPrograms = hasProgram
        ? []
        : [
            {
              id: input.program_id,
              kind: "club-card" as const,
              issuer: input.program_name ?? input.program_id,
              names: {
                he: input.program_name ?? input.program_id,
                en: input.program_name ?? input.program_id,
              },
              requires: "Supplied by the user.",
              url: "https://example.invalid/user-supplied",
            },
          ];
      const offerId = `local-${input.program_id}-${storeId}`.slice(0, 80);
      addLocal({
        stores: newStores,
        programs: newPrograms,
        offers: [
          {
            id: offerId,
            program_id: input.program_id,
            applies_to: { stores: [storeId] },
            channel: "both",
            mechanism: input.mechanism,
            percent: input.percent,
            summary: input.summary,
            conditions: input.conditions,
            source_url: input.source_url.startsWith("https://")
              ? input.source_url
              : "https://example.invalid/user-supplied",
            as_of: new Date().toISOString().slice(0, 10),
            status: "user-supplied",
          },
        ],
      });
      return text({ saved: offerId, store: storeId, file: `${configDir()}/local-data.json` });
    },
  );

  return server;
}
