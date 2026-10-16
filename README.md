<p align="center">
  <img src="assets/logo.png" alt="mcp-server-il-benefits" width="100" height="100" />
</p>

<h1 align="center">mcp-server-il-benefits</h1>

<p align="center">
  <strong>You are at the till in Israel. Which card, club or voucher do you pay with?</strong>
</p>

<p align="center">
  MCP server and agent skill that answers from <em>your</em> wallet.<br>
  Local-first. Open dataset. A source link and a date on every benefit.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/mcp-server-il-benefits"><img src="https://img.shields.io/npm/v/mcp-server-il-benefits.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/mcp-server-il-benefits"><img src="https://img.shields.io/npm/dm/mcp-server-il-benefits.svg" alt="npm downloads" /></a>
  <a href="https://github.com/ofershap/mcp-server-il-benefits/actions/workflows/ci.yml"><img src="https://github.com/ofershap/mcp-server-il-benefits/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-strict-blue.svg" alt="TypeScript" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="https://agent-plugins.org"><img src="https://img.shields.io/badge/Agent_Plugins-1.0.0-0ea5e9.svg" alt="Agent Plugins" /></a>
</p>

```bash
npx mcp-server-il-benefits
```

> Works with Claude Desktop, Cursor, VS Code Copilot, and any MCP client. No API key. No account. Your wallet never leaves your machine.

<p align="center">
  <a href="cursor://anysphere.cursor-deeplink/mcp/install?name=il-benefits&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIm1jcC1zZXJ2ZXItaWwtYmVuZWZpdHMiXX0="><img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor" height="32" /></a>
  &nbsp;
  <a href="vscode:mcp/install?%7B%22name%22%3A%22il-benefits%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22mcp-server-il-benefits%22%5D%7D"><img src="https://img.shields.io/badge/Add_to_VS_Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Add to VS Code" /></a>
</p>

## Why this exists

A normal Israeli wallet holds a bank card, a club card, maybe a prepaid gift card from the employer, and a few apps. Each one has a deal at the same chain. One takes the discount off your credit card statement. One only works if you loaded a prepaid card last week. One pays cashback next month. One is a voucher you had to buy before you walked in.

So at the till you pick the card on top and never find out.

The benefits are public, but they sit in a dozen issuer sites and apps, in different words, with different mechanics. "20% off" means something else depending on whether it is taken at the register, credited later, or given when you load a card. That last part is what decides which card you should hold up, and no catalogue answers it.

This server does. You tell your agent which cards and clubs you hold. You ask "I'm at Fox, what do I pay with?" It checks your wallet first, tells you which card to use and **how** (pay with this card, or load that one first, or buy the voucher), and links the page where each benefit comes from.

## What makes it different

|                                                                     | mcp-server-il-benefits                                 | [hopala MCP](https://hopala.io/en/blog/benefits-club-mcp.html) | [ClawSavings](https://github.com/yhyatt/ClawSavings) | [GotCashback MCP](https://www.gotcashback.co.il/mcp-server/) | Keepon / FID apps                      |
| ------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| Question it answers                                                 | Which of **my** cards at this store, and how to use it | Search a catalogue of club offers                              | Best card or voucher per store category              | Cashback rates across portals                                | Store coupons and club lists in an app |
| Knows your wallet                                                   | Yes, local file                                        | No                                                             | No                                                   | No                                                           | App only                               |
| Says how to use the benefit (at charge, on load, voucher, cashback) | Yes                                                    | In the terms text                                              | Partly                                               | Cashback only                                                | No                                     |
| Data                                                                | Open JSON in this repo, PRs welcome                    | Hosted catalogue                                               | Static JSON in the skill                             | Hosted                                                       | Closed                                 |
| Source URL and check date per benefit                               | Required by the schema                                 | Varies                                                         | Per source                                           | n/a                                                          | n/a                                    |
| Runs                                                                | On your machine                                        | Hosted server                                                  | In your agent                                        | Hosted server                                                | Phone app                              |

These projects are good at what they do. This one is the "what do I pay with right now" layer on top.

## Quick start

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "il-benefits": {
      "command": "npx",
      "args": ["-y", "mcp-server-il-benefits"]
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`: the same block as above.

### Claude Code

```bash
claude mcp add il-benefits -- npx -y mcp-server-il-benefits
```

### VS Code

Add to user settings or `.vscode/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "il-benefits": { "command": "npx", "args": ["-y", "mcp-server-il-benefits"] }
    }
  }
}
```

## First run

1. Ask: "List the programs in il-benefits."
2. Tell your agent which ones you hold: "I have IsracardTop and the HiTech Zone card. Save that as my wallet."
3. Ask at the store: "I'm at Rami Levy, buying about 600 shekels. What do I pay with?"

## Tools

| Tool                        | What it does                                                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `best_way_to_pay`           | Store (Hebrew or English), optional basket size and channel. Returns ranked options, your wallet first, with how to use each, conditions, source link and check date |
| `find_store`                | Match a chain by name or alias                                                                                                                                       |
| `list_programs`             | Cards, clubs and programs in the dataset, who is eligible, where the details live                                                                                    |
| `wallet_get` / `wallet_set` | Read or replace the list of programs you hold (ids only, saved locally)                                                                                              |
| `add_local_offer`           | Save a benefit you know about (employer club, bank app) so it is ranked next time. Local file only                                                                   |

## Examples

- "I'm at Fox. Which card should I pay with?"
- "אני בפלאנט, מה הכי משתלם לשלם?"
- "Does anything give me money back at Rami Levy?"
- "I know my employer club gives 10% at Aroma. Add that."

## Where the data comes from, and what it does not have yet

The bundled dataset is small on purpose. It holds benefits that were read from official issuer pages (and, where marked, one press report), each with a source URL and the date it was checked. Some entries are marked `needs-detail`: the issuer lists the partner chain but not the size of the benefit, so the dataset points you to the page instead of guessing a number.

It does not scrape club catalogues, log in to anything, or copy lists from apps whose terms forbid it. The reasoning and the rules for contributors are in [DATA_SOURCES.md](DATA_SOURCES.md).

The honest state: coverage is thin, and it grows with pull requests. If you hold a card the dataset lacks, adding it takes one JSON entry and a link. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Privacy

- The wallet is a list of program ids in `~/.config/mcp-server-il-benefits/wallet.json` (override with `IL_BENEFITS_HOME`).
- No card numbers, balances or ID numbers are asked for or stored. A test pins that.
- No network calls at runtime. Everything is read from local files.

## Agent skill

`skills/which-card-to-pay/SKILL.md` teaches an agent when to call these tools, how to read the `how_to_use` field, and to always tell you to confirm at checkout. This repo is an [Agent Plugins](https://agent-plugins.org) 1.0.0 package: `plugin.json`, `mcp.json` and `skills/` ship together.

## FAQ

### What is mcp-server-il-benefits?

An MCP server that tells you which Israeli credit card, club card, prepaid benefits card or voucher to use at a given store, based on the cards and clubs you hold.

### How is it different from a coupon app?

Coupon apps store codes you add. This ranks the benefits of the programs you already hold, per store, and says whether the discount happens at the register, on a statement, when you load a card, or later as cashback.

### Is the data complete or live?

No. It is a sourced, dated, community-extendable dataset. Each answer carries its source link and check date. Treat the result as a first answer and confirm at checkout.

### Does it work in Hebrew?

Yes. Store names and aliases match in Hebrew and English, and program names carry both.

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

## See also

More MCP servers and developer tools on my [portfolio](https://gitshow.dev/ofershap).

## Author

[![Made by ofershap](https://gitshow.dev/api/card/ofershap)](https://gitshow.dev/ofershap)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

## License

[MIT](LICENSE)
