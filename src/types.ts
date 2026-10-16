export type BenefitKind = "cashback" | "gift-card";

/** One live result from a source. Nothing here is stored. */
export interface Benefit {
  kind: BenefitKind;
  source: string;
  provider: string;
  store: string;
  percent?: number;
  upto?: boolean;
  channel?: "online" | "in-store" | "both";
  how_to_use: string;
  link: string;
}

export interface SourceResult {
  source: string;
  attribution: string;
  store_page?: string;
  fetched_at: string;
  benefits: Benefit[];
}

export interface QueryOptions {
  country: string;
  signal?: AbortSignal;
}

/**
 * A live adapter to one existing benefits database.
 * Contract: one request per user question, no stored copy, no bulk crawl,
 * and the source's own terms must permit automated access for this use.
 */
export interface BenefitSource {
  id: string;
  name: string;
  terms_url: string;
  attribution: string;
  query(store: string, options: QueryOptions): Promise<SourceResult>;
}

export interface Wallet {
  providers: string[];
}
