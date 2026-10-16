import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

let client: Client;

beforeAll(async () => {
  process.env.IL_BENEFITS_HOME = mkdtempSync(join(tmpdir(), "il-benefits-"));
  const { createServer } = await import("../src/server.js");
  const [a, b] = InMemoryTransport.createLinkedPair();
  await createServer().connect(b);
  client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(a);
});

const call = async (name: string, args: Record<string, unknown> = {}) => {
  const res = await client.callTool({ name, arguments: args });
  const first = (res.content as { type: string; text: string }[])[0];
  return first?.text ?? "";
};

describe("MCP server", () => {
  it("exposes the tools", async () => {
    const names = (await client.listTools()).tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "add_local_offer",
      "best_way_to_pay",
      "find_store",
      "list_programs",
      "wallet_get",
      "wallet_set",
    ]);
  });

  it("rejects unknown programs in the wallet", async () => {
    expect(await call("wallet_set", { programs: ["nope"] })).toMatch(/Unknown program/);
  });

  it("saves a wallet and ranks with it", async () => {
    await call("wallet_set", { programs: ["isracard-tracks"] });
    const out = JSON.parse(await call("best_way_to_pay", { store: "פלאנט" }));
    expect(out.candidates[0].program.id).toBe("isracard-tracks");
    expect(out.candidates[0].held).toBe(true);
  });

  it("merges a local offer for a new store", async () => {
    await call("add_local_offer", {
      store: "Corner Bakery",
      program_id: "employer-club",
      program_name: "Employer club",
      mechanism: "voucher",
      summary: "10% off with the employer voucher",
    });
    const out = JSON.parse(await call("best_way_to_pay", { store: "Corner Bakery" }));
    expect(out.candidates[0].status).toBe("user-supplied");
  });
});
