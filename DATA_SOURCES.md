# Data sources and rules

The code is MIT. The dataset is facts about public offers, each with a link to where it was read.

## What goes in

- A benefit read from the issuer's or the merchant's own public page, or from the program's published terms.
- One entry per benefit: store or category, mechanism, percent if the source states one, conditions, `source_url` (https), `as_of` (the day you checked), `status`.
- Press reports are allowed only as `stale-check` until an official page confirms them.

## What stays out

- Anything copied in bulk from a catalogue or app whose terms forbid automated collection or reuse. Example: Keepon's terms (section 9, September 2026) prohibit scraping and automated collection, so its store lists are not used here, even though its pages are public.
- Anything behind a login, an SMS code or a member-only page. If a member can see it, the member can add it with the `add_local_offer` tool, and it stays on their machine.
- Scraped or rehosted images, logos or marketing copy. Entries are short factual summaries in our own words.
- Personal data of any kind: card numbers, balances, ID numbers.

## Status values

| Status            | Meaning                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| `confirmed`     | Read on an official page on `as_of`                                                                                |
| `needs-detail`  | The program is confirmed for this store, the size of the benefit is not on the page. The answer points to the source |
| `stale-check`   | Secondary or old source. Re-confirm before relying on it                                                             |
| `user-supplied` | Added locally by the user. Never shipped in the package                                                              |

## Mechanisms

`discount-at-charge`, `discount-on-load`, `cashback`, `voucher`, `bogo`, `fee-reduction`, `program-benefit`. The mechanism decides what the user should do at the till, so pick it carefully.

## Freshness

Answers older than 90 days carry a "confirm before you rely on it" caveat. If you see an outdated entry, open an issue or a PR with the new source.

## Takedown

If an issuer or merchant wants an entry changed or removed, open an issue or email the maintainer and it will be done.
