import type { BenefitSource } from "../types.js";
import { createGotCashbackSource } from "./gotcashback.js";

/**
 * Sources shipped with the package. A source belongs here only if its own terms
 * allow automated, per-request access for this use. Add one by implementing
 * BenefitSource (see CONTRIBUTING.md).
 */
export function defaultSources(fetcher: typeof fetch = fetch): BenefitSource[] {
  return [createGotCashbackSource(fetcher)];
}
