---
name: which-card-to-pay
description: Use when the user is at or heading to a store in Israel and asks what to pay with, which card, club, voucher or gift card to use, or whether any discount or cashback applies (איך הכי משתלם לשלם, יש הטבה ב..., אני בחנות X).
---

# What to do before paying at a store (Israel)

Uses the `il-benefits` MCP server (`npx -y mcp-server-il-benefits`). It asks an existing benefits aggregator live, once per question. It does not own a database.

## Steps

1. Call `wallet_get`. If it is empty, ask once which cashback portals or gift card sellers the user uses, then `wallet_set` with names only. Skip this if the user is in a hurry. Never ask for card numbers or balances.
2. Call `best_way_to_pay` with the store as the user said it (Hebrew or English). Add `amount` if they gave a basket size and `channel` if it is online.
3. Lead with the action and its timing, because the saving is usually before the till: "Buy a discounted gift card first (7%), then pay with it" or "Open the store through this link first (4.5% cashback later)". Use `how_to_use`. Prefer options with `held: true`.
4. Show every `link` exactly as returned, and the source attribution from `sources`. These are required by the source's terms.
5. If `options` is empty, say no connected source has this store and do not guess. Suggest the user check their own card or club app, and that those are not covered here.
6. If a source failed (`errors`), say so briefly.
7. End with one line: rates change, confirm at checkout.

## Rules

- Never buy anything, generate a coupon or top-up code, or click a tracked link for the user. Give the link and the steps.
- Do not state a percent that is not in the result. "up to" results (`upto: true`) are a ceiling.
- Do not claim this knows the user's credit card or club benefits. It does not.
- Do not cache or paste results into notes. Ask again next time.
- Keep the answer short. The user is standing at a till.
