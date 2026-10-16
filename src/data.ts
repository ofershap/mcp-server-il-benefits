import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { OfferSchema, ProgramSchema, StoreSchema, type Dataset } from "./types.js";

const here = dirname(fileURLToPath(import.meta.url));

export function dataDir(): string {
  for (const candidate of [join(here, "..", "data"), join(here, "..", "..", "data")]) {
    if (existsSync(join(candidate, "offers.json"))) return candidate;
  }
  throw new Error("Dataset folder not found next to the package");
}

export function configDir(): string {
  const base =
    process.env.IL_BENEFITS_HOME ??
    join(process.env.HOME ?? ".", ".config", "mcp-server-il-benefits");
  return base;
}

function readJson<T>(path: string, schema: z.ZodType<T>): T {
  return schema.parse(JSON.parse(readFileSync(path, "utf8")));
}

export function loadBundled(dir = dataDir()): Dataset {
  return {
    stores: readJson(join(dir, "stores.json"), z.array(StoreSchema)),
    programs: readJson(join(dir, "programs.json"), z.array(ProgramSchema)),
    offers: readJson(join(dir, "offers.json"), z.array(OfferSchema)),
  };
}

/** Bundled dataset plus the user's own file of extra stores, programs and offers (never sent anywhere). */
export function loadDataset(dir = dataDir(), localDir = configDir()): Dataset {
  const base = loadBundled(dir);
  const localPath = join(localDir, "local-data.json");
  if (!existsSync(localPath)) return base;
  const local = z
    .object({
      stores: z.array(StoreSchema).default([]),
      programs: z.array(ProgramSchema).default([]),
      offers: z.array(OfferSchema).default([]),
    })
    .parse(JSON.parse(readFileSync(localPath, "utf8")));
  const byId = <T extends { id: string }>(a: T[], b: T[]) => [
    ...a.filter((x) => !b.some((y) => y.id === x.id)),
    ...b,
  ];
  return {
    stores: byId(base.stores, local.stores),
    programs: byId(base.programs, local.programs),
    offers: byId(base.offers, local.offers),
  };
}
