import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createGotCashbackSource } from "../src/sources/gotcashback.js";
import { fakeFetch } from "./helpers.js";

let client: Client;

beforeAll(async () => {
  process.env.IL_BENEFITS_HOME = mkdtempSync(join(tmpdir(), "il-benefits-"));
  const { createServer } = await import("../src/server.js");
  const [a, b] = InMemoryTransport.createLinkedPair();
  await createServer([createGotCashbackSource(fakeFetch())]).connect(b);
  client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(a);
});

const call = async (name: string, args: Record<string, unknown> = {}) => {
  const res = await client.callTool({ name, arguments: args });
  return (res.content as { type: string; text: string }[])[0]?.text ?? "";
};

describe("MCP server", () => {
  it("exposes exactly four tools and none can buy anything", async () => {
    const names = (await client.listTools()).tools.map((t) => t.name).sort();
    expect(names).toEqual(["best_way_to_pay", "list_sources", "wallet_get", "wallet_set"]);
  });

  it("lists sources with their terms", async () => {
    const out = JSON.parse(await call("list_sources"));
    expect(out[0]).toMatchObject({
      id: "gotcashback",
      terms_url: "https://www.gotcashback.com/Terms/",
    });
  });

  it("saves a wallet and ranks with it", async () => {
    await call("wallet_set", { providers: ["TOPCASH"] });
    expect(JSON.parse(await call("wallet_get")).providers).toEqual(["TOPCASH"]);
    const out = JSON.parse(await call("best_way_to_pay", { store: "Fox" }));
    expect(out.options[0]).toMatchObject({ provider: "TOPCASH", held: true });
    expect(out.sources[0].attribution).toMatch(/GotCashback\.com/);
  });
});
