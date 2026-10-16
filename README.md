<p align="center">
  <img src="assets/logo.png" alt="mcp-server-il-benefits" width="100" height="100" />
</p>

<h1 align="center">mcp-server-il-benefits</h1>

<p align="center">
  <strong>You are at the checkout in Israel. Which card, club or voucher do you pay with?</strong>
</p>

<p align="center">
  A thin MCP server and agent skill between your agent and an existing benefits database.<br>
  Live per-question lookup. No scraping. No stored copy. Source and link on every answer.
</p>

<p align="center">
  <a href="https://github.com/ofershap/mcp-server-il-benefits/stargazers"><img src="https://img.shields.io/github/stars/ofershap/mcp-server-il-benefits?style=flat" alt="GitHub stars" /></a>
  <a href="https://github.com/ofershap/mcp-server-il-benefits/actions/workflows/ci.yml"><img src="https://github.com/ofershap/mcp-server-il-benefits/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-strict-blue.svg" alt="TypeScript" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="https://agent-plugins.org"><img src="https://img.shields.io/badge/Agent_Plugins-1.0.0-0ea5e9.svg" alt="Agent Plugins" /></a>
</p>

```bash
npx -y github:ofershap/mcp-server-il-benefits
```

> Works with Claude Desktop, Cursor, VS Code Copilot, and any MCP client. No API key. No account. Your wallet (a list of names) never leaves your machine.

<p align="center">
  <a href="cursor://anysphere.cursor-deeplink/mcp/install?name=il-benefits&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImdpdGh1YjpvZmVyc2hhcC9tY3Atc2VydmVyLWlsLWJlbmVmaXRzIl19"><img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor" height="32" /></a>
  &nbsp;
  <a href="vscode:mcp/install?%7B%22name%22%3A%22il-benefits%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22github%3Aofershap%2Fmcp-server-il-benefits%22%5D%7D"><img src="https://img.shields.io/badge/Add_to_VS_Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Add to VS Code" /></a>
</p>

## Why this exists

You stand at the checkout at Castro with a bag of clothes. The person in front of you is fiddling with a coupon. You have a credit card, a club card and a few apps, and no idea which one saves you money. Some savings only work if you act **before** you pay: a friend of the author loaded a prepaid card with 250 shekels for 187.5 at a mall, bought a 100 shekel voucher for 59, and noticed another couple at every checkout doing the same dance.

Today it finds cashback and discounted gift cards for stores such as Fox, Golf, Terminal X, Home Center, Zer4u, adidas, ASOS, Shein, AliExpress, iHerb, Booking.com and Expedia (each one checked live through this server on 2026-10-16). Coverage is mostly online stores, and many chains, Castro included, return nothing yet.

The idea: you tell your agent "I'm at store X", and it checks what is available and tells you what to do before you pay. Sometimes that is "buy this discounted gift card first". Sometimes it is "open the store through this cashback link first".

The data for that already exists, aggregated by other people. Building a second database would be pointless and would copy someone else's work. So this project is only the connection: a small MCP server and a skill that let your agent ask an existing aggregator one question at a time, and answer you with the source and the link.

## What it does and does not do

- Asks the connected source live, once per question. Nothing is cached, crawled or stored.
- Ranks results with the providers you said you use first (cashback portals, gift card sellers). The wallet is a local list of names.
- Always returns the source attribution and the original link, as the source's terms require.
- Never buys anything, never generates a code, never logs in for you. You click the link.
- Says so when a store has no result, instead of guessing.

## Coverage today (read this first)

The only source shipped is [GotCashback](https://www.gotcashback.com/), because its terms explicitly welcome AI agents that fetch current information to answer a user's question (section 5). It covers cashback portals and discounted gift cards. In Israel it lists a few hundred stores, so many chains return nothing. Hebrew store names match better than English ones (for example `סופר פארם` found a result where `Super-Pharm` did not).

It does **not** know the benefits of your credit card, bank club or employer club at a given store. The databases that hold those are third-party sites whose terms do not allow automated access, so they are not connected. See [DATA_SOURCES.md](DATA_SOURCES.md) for each source, the terms clause that decided it, and the date it was checked. The server is built so another source can be added the day its owner permits it.

## What makes it different

|                                         | mcp-server-il-benefits                                          | [hopala MCP](https://hopala.io/en/blog/benefits-club-mcp.html) | [GotCashback MCP](https://www.gotcashback.co.il/mcp-server/) | [ClawSavings](https://github.com/yhyatt/ClawSavings) |
| --------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| What it is                              | Mediator with a wallet and a "what do I do before I pay" answer | Hosted catalogue of club offers                                | Hosted cashback and gift card database                       | Static skill with category tips                      |
| Knows what you use                      | Yes, local file                                                 | No                                                             | No                                                           | No                                                   |
| Says when to act (before paying, after) | Yes                                                             | In terms text                                                  | Cashback only                                                | Partly                                               |
| Own dataset                             | None                                                            | Yes                                                            | Yes                                                          | Yes                                                  |
| Source and link on every answer         | Yes                                                             | Varies                                                         | Yes                                                          | Per source                                           |

GotCashback's own MCP server is the better choice if you only want cashback rates in a chat. This project adds the wallet, the "before you pay" framing and a place to plug in more sources.

## Quick start

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "il-benefits": {
      "command": "npx",
      "args": ["-y", "github:ofershap/mcp-server-il-benefits"]
    }
  }
}
```

### Claude Desktop

Add the same block to `claude_desktop_config.json`.

### Claude Code

```bash
claude mcp add il-benefits -- npx -y github:ofershap/mcp-server-il-benefits
```

### VS Code

Add to user settings or `.vscode/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "il-benefits": { "command": "npx", "args": ["-y", "github:ofershap/mcp-server-il-benefits"] }
    }
  }
}
```

## First run

1. Tell your agent what you use: "I use the Cashdo and TopCash portals. Save that as my wallet."
2. Ask at the store: "I'm at Fox, buying about 400 shekels. What should I do before I pay?"

## Tools

| Tool                        | What it does                                                                                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `best_way_to_pay`           | Store (Hebrew or English), optional country, basket size and channel. One live request per connected source. Returns ranked options, your providers first, with how to use each, a link and the source attribution |
| `list_sources`              | The connected sources, their terms page and attribution text                                                                                                                                                       |
| `wallet_get` / `wallet_set` | Read or replace the list of provider names you use. Names only, saved locally                                                                                                                                      |

## Examples

- "I'm at Fox. What should I do before I pay?"
- "אני בפוקס, איך הכי משתלם לשלם?"
- "Is there a discounted gift card for this store?"
- "Which of my cashback portals pays the most here?"

## Privacy

- The wallet is a list of names in `~/.config/mcp-server-il-benefits/wallet.json` (override with `IL_BENEFITS_HOME`).
- No card numbers, balances or ID numbers are asked for or stored.
- The only network call is the store name and a country code, sent to the connected source when you ask. Nothing else leaves your machine.

## Agent skill

`skills/which-card-to-pay/SKILL.md` teaches an agent the in-store flow: read the wallet, ask for the store, answer with the best action and when to take it, show the links, and say when nothing was found. This repo is an [Agent Plugins](https://agent-plugins.org) 1.0.0 package: `plugin.json`, `mcp.json` and `skills/`.

## Adding a source

A source is one file implementing `BenefitSource` in `src/sources/`. It must make one live request per question and keep no copy. It may be added only if the source's own terms allow automated, per-request access, or the owner gave written permission. See [CONTRIBUTING.md](CONTRIBUTING.md).

## FAQ

### What is mcp-server-il-benefits?

An MCP server and agent skill that lets an AI agent ask an existing benefits aggregator, live, what discount, cashback or gift card deal applies at a store in Israel, and tells you what to do before you pay.

### Which credit card should I use at a store in Israel?

This tool cannot tell you yet. It does not have credit card or club data, because those databases do not permit automated access. It finds cashback and discounted gift cards. Your card issuer's app is still the place for card benefits.

### Does it scrape websites?

No. It calls the public MCP endpoint that GotCashback publishes for AI assistants, one request per question, and follows its attribution and no-caching rules.

### Can it buy the gift card or generate a coupon code for me?

No, by design. It returns the link and the steps. You decide and you pay.

### Is it commercial?

No. MIT licensed, no ads, no affiliate links of its own. The links returned are the source's own tracked links, shown unchanged, as its terms require.

### Does it work in Hebrew?

Yes. Store names are passed through as you type them.

### Do I need API keys or an account?

No.

## Development

```bash
git clone https://github.com/ofershap/mcp-server-il-benefits.git
cd mcp-server-il-benefits
npm install
npm test
npm run build
```

Tests use recorded fixtures and a fake network. No test calls a live service.

## See also

More MCP servers and developer tools on my [portfolio](https://gitshow.dev/ofershap).

## Author

[![Made by ofershap](https://gitshow.dev/api/card/ofershap)](https://gitshow.dev/ofershap)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

## License

[MIT](LICENSE)
