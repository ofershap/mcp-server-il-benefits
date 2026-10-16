# Contributing

The code is small. The dataset is where help matters most.

## Add or fix a benefit

1. Fork the repo and edit the files in `data/`: `stores.json`, `programs.json`, `offers.json`.
2. Every offer needs a `source_url` on an official page and an `as_of` date (the day you checked it). Read [DATA_SOURCES.md](DATA_SOURCES.md) first: no bulk copying from apps, no member-only pages.
3. Run `npm run validate-data`. It checks ids, links between files, https sources and dates.
4. Open a PR. The template asks for the source and what you saw.

Short summaries in your own words. Say how the benefit works (at charge, on load, voucher, cashback) in `mechanism` and put the catches in `conditions`.

## Add a store alias

If a chain is searched under another name, add it to the store's `aliases` in Hebrew or English.

## Code

```bash
git clone https://github.com/ofershap/mcp-server-il-benefits.git
cd mcp-server-il-benefits
npm install
npm run typecheck && npm test && npm run build
```

Commit with conventional commits (`feat:`, `fix:`, `data:`). The engine is in `src/engine.ts`, the tools in `src/server.ts`.

## Out of scope

Scrapers, anything that logs in to an issuer, anything that stores card numbers or balances.
