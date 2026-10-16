---
name: which-card-to-pay
description: Use when the user is at or heading to a store in Israel and asks which credit card, club card, prepaid card or voucher to pay with, or whether any benefit applies at a chain (מה הכי משתלם לשלם, איזה כרטיס, יש הטבה ב...).
---

# Which card to pay with (Israel)

Uses the `il-benefits` MCP server (`npx -y mcp-server-il-benefits`).

## Steps

1. Call `wallet_get`. If the wallet is empty, call `list_programs`, ask the user which cards and clubs they hold, then `wallet_set` with program ids. Never ask for card numbers or balances.
2. Call `best_way_to_pay` with the store name as the user said it (Hebrew or English). Add `amount` if they gave a basket size and `channel` if it is online.
3. Answer with the first option the user holds. Say how to use it from `how_to_use`: some benefits happen at the register, some only if a prepaid card was loaded before, some are vouchers bought in advance, some pay back later.
4. If the top option has a `caveat` or status `needs-detail` or `stale-check`, say so and give the `source_url`.
5. If the user has nothing that applies, say that, name what they would need only if it is useful, and do not invent a benefit.
6. End with one line: confirm at checkout, benefits change.

## Rules

- Do not state a percent that is not in the result.
- Options with `held: false` are for information. Do not tell the user to pay with a card they did not list.
- If the store is unknown, say the dataset does not cover it. Offer `add_local_offer` if the user knows a benefit.
- Keep the answer short. In-store users are standing at a till.
