import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { configDir } from "./data.js";
import {
  OfferSchema,
  ProgramSchema,
  StoreSchema,
  WalletSchema,
  type Dataset,
  type Wallet,
} from "./types.js";

const LocalSchema = z.object({
  stores: z.array(StoreSchema).default([]),
  programs: z.array(ProgramSchema).default([]),
  offers: z.array(OfferSchema).default([]),
});

export function loadWallet(dir = configDir()): Wallet | null {
  const path = join(dir, "wallet.json");
  if (!existsSync(path)) return null;
  return WalletSchema.parse(JSON.parse(readFileSync(path, "utf8")));
}

export function saveWallet(wallet: Wallet, dir = configDir()): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "wallet.json"), JSON.stringify(wallet, null, 2) + "\n");
}

export function unknownPrograms(ids: string[], data: Dataset): string[] {
  return ids.filter((id) => !data.programs.some((p) => p.id === id));
}

/** Append a user-supplied offer (and optionally its program and store) to the local data file. */
export function addLocal(
  entry: { stores?: unknown[]; programs?: unknown[]; offers?: unknown[] },
  dir = configDir(),
): void {
  const path = join(dir, "local-data.json");
  const current = existsSync(path)
    ? LocalSchema.parse(JSON.parse(readFileSync(path, "utf8")))
    : LocalSchema.parse({});
  const next = LocalSchema.parse({
    stores: [...current.stores, ...(entry.stores ?? [])],
    programs: [...current.programs, ...(entry.programs ?? [])],
    offers: [...current.offers, ...(entry.offers ?? [])],
  });
  mkdirSync(dir, { recursive: true });
  writeFileSync(path, JSON.stringify(next, null, 2) + "\n");
}
