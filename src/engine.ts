import type { Benefit, BenefitSource, SourceResult, Wallet } from "./types.js";

export interface Ranked extends Benefit {
  held: boolean;
  estimated_saving_ils?: number;
}

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

export function isHeld(provider: string, wallet: Wallet | null): boolean {
  if (!wallet) return false;
  const p = norm(provider);
  return wallet.providers.some((w) => {
    const n = norm(w);
    return n.length > 1 && (p.includes(n) || n.includes(p));
  });
}

export function rank(benefits: Benefit[], wallet: Wallet | null, amount?: number): Ranked[] {
  return benefits
    .map((b) => ({
      ...b,
      held: isHeld(b.provider, wallet),
      estimated_saving_ils:
        amount && b.percent !== undefined ? Math.round(amount * b.percent) / 100 : undefined,
    }))
    .sort((a, b) => Number(b.held) - Number(a.held) || (b.percent ?? 0) - (a.percent ?? 0));
}

export interface Answer {
  store: string;
  country: string;
  options: Ranked[];
  sources: { id: string; attribution: string; store_page?: string; fetched_at: string }[];
  errors: { source: string; error: string }[];
  note: string;
}

export async function bestWayToPay(
  sources: BenefitSource[],
  store: string,
  opts: {
    country?: string;
    channel?: "in-store" | "online";
    amount?: number;
    wallet: Wallet | null;
  },
): Promise<Answer> {
  const country = opts.country ?? "il";
  const settled = await Promise.allSettled(sources.map((s) => s.query(store, { country })));
  const results: SourceResult[] = [];
  const errors: Answer["errors"] = [];
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") results.push(r.value);
    else errors.push({ source: sources[i]!.id, error: String(r.reason?.message ?? r.reason) });
  });
  let all = results.flatMap((r) => r.benefits);
  if (opts.channel) all = all.filter((b) => b.channel === "both" || b.channel === opts.channel);
  const options = rank(all, opts.wallet, opts.amount);
  const note = options.length
    ? "Rates change often. Confirm at checkout. Show every link to the user as given."
    : "No benefit found in the connected sources for this store. Do not guess one. Tell the user their own club or card apps may still have a benefit that these sources do not cover.";
  return {
    store,
    country,
    options,
    sources: results.map((r) => ({
      id: r.source,
      attribution: r.attribution,
      store_page: r.store_page,
      fetched_at: r.fetched_at,
    })),
    errors,
    note,
  };
}
