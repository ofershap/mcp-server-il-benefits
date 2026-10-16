# Data sources

This project has no dataset. It asks existing aggregators, live, one request per user question. A source is connected only if its own terms permit that. Checked 2026-10-16 from the public pages named below. Nobody was contacted.

## Connected

### GotCashback (https://www.gotcashback.com/)

- Terms: https://www.gotcashback.com/Terms/ section 5, "AI and Automated Access". It welcomes AI assistants fetching current information to answer an end-user question.
- Conditions we follow: attribute GotCashback and link the page (5.1); fetch at or near the request, no cached copies (5.2); no systematic copying, storing or redistribution, no training, no competing dataset (5.3); honor robots.txt and rate limits (5.4); identify accurately with a user agent (5.5).
- Endpoint: the public MCP server at https://mcp.gotcashback.com, documented at https://www.gotcashback.co.il/mcp-server/. No authentication. We call `get_cashback_rates_by_store_name` and `get_gift_cards_by_store_name`.
- Links returned are GotCashback's tracked links. They are passed to the user unchanged and never fetched by this server (robots.txt disallows `/Click/` and `/GiftCardClick/`).
- Coverage: cashback portal rates and discounted gift cards. Not credit card or club benefits.
- Revocable: section 5.6 lets GotCashback restrict access. If terms change, this adapter is removed.

## Not connected, and why

| Source                                           | Finding                                                                                                                                                                                                                                                                                               | Decision           |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Keepon (keeponapp.com)                           | Terms section 9 forbid scraping, automated collection and access through bots, scripts or automated tools, and commercial use. Section 13 forbids copying or distributing any part without explicit written permission. No API. The "open data" page offers only a summary; the raw file is by email. | Not connected      |
| hopala MCP                                       | Public MCP endpoint, but no reuse terms found, and its catalogue was harvested from third-party sources, some behind logins.                                                                                                                                                                          | Not connected      |
| Fid                                              | No public API. Only third-party scrapers.                                                                                                                                                                                                                                                             | Not connected      |
| BuyMe (community MCP)                            | BuyMe acceptance only, no licence.                                                                                                                                                                                                                                                                    | Not connected      |
| bee.deals                                        | No API or terms found.                                                                                                                                                                                                                                                                                | Not connected      |
| Card issuers (Max, Isracard, Cal, Poalim, Leumi) | No public APIs found.                                                                                                                                                                                                                                                                                 | Not connected      |
| data.gov.il                                      | CKAN API exists. No benefits dataset found. Not an exhaustive search.                                                                                                                                                                                                                                 | Nothing to connect |

## Adding a source

Open an issue with the source's terms page and the clause that permits automated, per-request access, or a written permission from its owner. Without one of those, it will not be merged.
