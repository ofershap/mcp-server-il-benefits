# Contributing

The code is small. Help matters most in two places: new sources and tests.

## Adding a source

1. Read the source's terms. It must allow automated, per-request access for this use, or its owner must have given written permission. Link the clause in your pull request.
2. Add `src/sources/<name>.ts` implementing `BenefitSource` from `src/types.ts`: one live request per question, no cache, no stored copy, no bulk crawl, an accurate user agent, and attribution text.
3. Register it in `src/sources/index.ts`.
4. Add a fixture under `tests/fixtures/` and tests with a fake `fetch`. Tests must not call live services.
5. Add a row to `DATA_SOURCES.md` with the clause and the date checked.

Do not add scrapers, logged-in sessions, or bundled datasets.

## Development

```bash
npm install
npm run typecheck && npm test && npm run lint && npm run build
```

Commit with conventional commits (`feat:`, `fix:`, `docs:`). The engine is in `src/engine.ts`, the tools in `src/server.ts`.
