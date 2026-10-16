import type { Dataset, Mechanism, Offer, Program, Store, Wallet } from "./types.js";

/** Lowercase, drop quotes, geresh, punctuation and spaces so "מקדונלד'ס" matches "מקדונלדס". */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/["'`´׳״’‘.,\-_()\s]/g, "");
}

export function findStores(query: string, stores: Store[], limit = 5): Store[] {
  const q = normalize(query);
  if (!q) return [];
  const scored: { store: Store; score: number }[] = [];
  for (const store of stores) {
    const names = [store.names.he, store.names.en, store.id, ...store.aliases].map(normalize);
    let score = 0;
    if (names.some((n) => n === q)) score = 3;
    else if (names.some((n) => n.length >= 3 && (q.includes(n) || n.includes(q)))) score = 2;
    if (score > 0) scored.push({ store, score });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.store);
}

const HOW_TO_USE: Record<Mechanism, string> = {
  "discount-at-charge": "Pay with this card. The discount is applied to your card statement.",
  "discount-on-load":
    "Pay with the prepaid benefits card. The discount was given when it was loaded, so load it before you shop.",
  cashback:
    "Pay with this card or club card. The money comes back later as balance, it is not taken off at the register.",
  voucher: "Buy the discounted voucher before you shop, then pay with the voucher.",
  bogo: "Download the coupon in the issuer's app or site before you go, then show it at the box office.",
  "fee-reduction": "Pay with this card. The saving is on the fee, not on the price.",
  "program-benefit":
    "Pay with this card. Open the source page for the current benefit at this chain.",
};

export interface Candidate {
  offer_id: string;
  program: { id: string; name_he: string; name_en: string; kind: Program["kind"]; issuer: string };
  held: boolean | null;
  requires: string;
  mechanism: Mechanism;
  percent: number | null;
  estimated_saving: number | null;
  summary: string;
  how_to_use: string;
  conditions: string;
  status: Offer["status"];
  source_url: string;
  as_of: string;
  caveat: string | null;
}

export interface Resolution {
  store: Store | null;
  matches: Store[];
  candidates: Candidate[];
  note: string;
}

const STATUS_RANK: Record<Offer["status"], number> = {
  confirmed: 0,
  "user-supplied": 0,
  "needs-detail": 1,
  "stale-check": 2,
};

function ageDays(asOf: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(asOf + "T00:00:00Z").getTime()) / 86_400_000);
}

export function bestWayToPay(
  data: Dataset,
  query: string,
  opts: {
    amount?: number;
    wallet?: Wallet | null;
    channel?: "in-store" | "online";
    now?: Date;
  } = {},
): Resolution {
  const now = opts.now ?? new Date();
  const matches = findStores(query, data.stores);
  const store = matches[0] ?? null;
  if (!store) {
    return {
      store: null,
      matches: [],
      candidates: [],
      note: `No store matches "${query}". Try the Hebrew or English chain name, or add it with add_local_offer.`,
    };
  }
  const wallet = opts.wallet ?? null;
  const candidates: Candidate[] = [];
  for (const offer of data.offers) {
    const appliesToStore = offer.applies_to.stores?.includes(store.id) ?? false;
    const appliesToCategory = offer.applies_to.categories?.includes(store.category) ?? false;
    if (!appliesToStore && !appliesToCategory) continue;
    if (opts.channel && offer.channel !== "both" && offer.channel !== opts.channel) continue;
    const program = data.programs.find((p) => p.id === offer.program_id);
    if (!program) continue;
    const held = wallet ? wallet.programs.includes(program.id) : null;
    const saving =
      opts.amount !== undefined &&
      offer.percent !== undefined &&
      offer.mechanism !== "fee-reduction"
        ? Math.round(((opts.amount * offer.percent) / 100) * 100) / 100
        : null;
    const age = ageDays(offer.as_of, now);
    const caveat =
      offer.status === "stale-check"
        ? "Source is old or secondary. Confirm on the issuer's page."
        : age > 90
          ? `Checked ${age} days ago. Confirm before you rely on it.`
          : offer.status === "needs-detail"
            ? "The exact benefit at this chain is not in the dataset. Open the source."
            : null;
    candidates.push({
      offer_id: offer.id,
      program: {
        id: program.id,
        name_he: program.names.he,
        name_en: program.names.en,
        kind: program.kind,
        issuer: program.issuer,
      },
      held,
      requires: program.requires,
      mechanism: offer.mechanism,
      percent: offer.percent ?? null,
      estimated_saving: saving,
      summary: offer.summary,
      how_to_use: HOW_TO_USE[offer.mechanism],
      conditions: offer.conditions,
      status: offer.status,
      source_url: offer.source_url,
      as_of: offer.as_of,
      caveat,
    });
  }
  candidates.sort((a, b) => {
    const heldA = a.held === false ? 1 : 0;
    const heldB = b.held === false ? 1 : 0;
    if (heldA !== heldB) return heldA - heldB;
    const statusDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (statusDiff !== 0) return statusDiff;
    return (b.percent ?? -1) - (a.percent ?? -1);
  });
  const note = candidates.length
    ? wallet
      ? "Ranked for the cards and clubs in your wallet first. Entries marked held=false need a card or membership you did not list."
      : "No wallet set, so every program is listed. Use wallet_set to rank for the cards you hold."
    : `No known benefit for ${store.names.en} in the dataset. That does not mean there is none. Add what you know with add_local_offer.`;
  return { store, matches, candidates, note };
}
