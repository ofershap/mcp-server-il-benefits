import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { Wallet } from "./types.js";

const WalletSchema = z.object({ providers: z.array(z.string().min(1).max(80)).max(100) });

export function configDir(): string {
  return (
    process.env.IL_BENEFITS_HOME ??
    join(process.env.HOME ?? ".", ".config", "mcp-server-il-benefits")
  );
}

export function loadWallet(dir = configDir()): Wallet | null {
  const path = join(dir, "wallet.json");
  if (!existsSync(path)) return null;
  return WalletSchema.parse(JSON.parse(readFileSync(path, "utf8")));
}

export function saveWallet(wallet: Wallet, dir = configDir()): void {
  const clean = WalletSchema.parse(wallet);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "wallet.json"), JSON.stringify(clean, null, 2) + "\n");
}
