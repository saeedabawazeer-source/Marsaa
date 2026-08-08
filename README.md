# Marsa — Gulf business news portal

Live aggregation portal for Saudi and Gulf business news, published from Jeddah.
Next.js 14 (App Router, TypeScript, Tailwind), bilingual EN/AR.

This folder replaces `marsa-app`. It is the clean, keyed, deployable version.

---

## 1. Before you deploy: the keys

**Three live API keys have been shared in chat. None is in this folder, and
none should ever be committed.** `.gitignore` blocks `.env*`, and
`.env.example` documents the names with empty values.

A key committed to a public repository is a key published to the world —
scrapers find them within minutes. If you push this to GitHub:

- **Make the repository private**, or
- keep it public but be certain no `.env` file is ever added.

Because both keys have now travelled through a chat log, rotating them in each
provider's dashboard after setup is the cautious move.

### Set them in Railway (not in the code)

Railway → your service → **Variables** → New Variable:

| Variable | Where it comes from | What breaks without it |
|---|---|---|
| `NEWSDATA_API_KEY` | newsdata.io | Fewer stories — RSS still works |
| `SAHMK_API_KEY` | sahmk.sa/en/developers | Ticker shows `INDICATIVE` static levels |
| `TWELVEDATA_API_KEY` | twelvedata.com/account/api-keys | No S&P 500 / Nasdaq / gold / WTI / EUR-USD on the strip |
| `MARSA_SUBSCRIBE_WEBHOOK` | your list provider | Signup returns 503 and says so honestly |

Every one of these degrades gracefully. Nothing on the site pretends to have
data it does not have.

---

## 2. Where the content comes from

### News — RSS + NewsData.io (`lib/feeds.ts`)

Sixteen publisher feeds, Saudi titles first, plus NewsData.io when keyed. All
normalise to one shape and go through one pipeline:

1. **Relevance gate.** A story must be about business *and* about the region.
   Saudi qualifies on its own; wider-Gulf only from a dedicated business desk.
   This exists because the first live build led a Gulf business front page with
   Colombian politics and a drought in Indonesia — a general news feed simply
   publishes more often than any business desk.
2. **Desk classification.** The section is decided per story from its own words,
   not from which feed carried it. That is what stops Energy sitting empty while
   oil stories pile into Markets.
3. **Per-source cap** (14) so the most prolific publisher cannot flood the page.
4. **Dedupe** on a normalised headline key.

Only headline, standfirst, thumbnail, timestamp and link are stored. **Full
article text is never copied** — Marsa did not report these stories and has no
licence to host them. Every story links out to the publisher.

### Market data — SAHMK (`lib/market.ts`)

Tadawul-licensed. **The free plan allows 100 requests/day**, so the module makes
exactly one call (`/market/summary/`) per 15-minute revalidate window:

```
4 calls/hour × 24h = 96 requests/day
```

Raising the refresh rate breaks the quota and the ticker dies mid-morning. 15
minutes also matches the free tier's price delay, so the caching costs nothing.

⚠️ **Licensing:** SAHMK's developer terms say developer plans are "intended for
development, internal tools, and small-scale applications", and that
"large-scale public market data platforms, commercial display services, or data
redistribution may require an enterprise agreement". A public ticker sits near
that line — fine while Marsa is small, worth a conversation with them before it
is not. Reselling or re-exposing the data as a feed is not permitted, which is
why nothing here proxies raw JSON to the browser.

### Global ticker context — Twelve Data (`lib/globalTicks.ts`)

SAHMK only covers Tadawul, so the strip also carries S&P 500, Nasdaq, gold,
WTI, and EUR/USD from Twelve Data — five symbols, batched into one call, same
15-minute window as SAHMK. Twelve Data bills per symbol, not per request:

```
5 symbols x 4 calls/hour x 24h = 480 credits/day, inside the 800/day free limit
```

It runs independently of SAHMK — if Tadawul data fails, the global ticks still
show, and vice versa. No key means those five just don't appear; nothing is
invented to fill the gap.

---

## 3. Run it

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:3000
npm run build && npm start
```

**Build note:** if `next build` hangs forever with no error in a sandboxed or
synced folder, check whether the directory allows the `unlink` syscall. Some
mounted folders silently block it, which makes the `.next` cleanup step hang.
Build from a plain local directory.

---

## 4. Routes

| Route | What it is |
|---|---|
| `/` | Portal front page — lead, 4:3 card grid, desk counts, live rail |
| `/category/{markets,energy,real-estate,trade,policy}` | One desk, filtered from the classified wire |
| `/story/[id]` | In-app preview: publisher's image, headline, summary, dateline, then a labelled hand-off |
| `/ar`, `/ar/category/[slug]`, `/ar/story/[id]` | Full RTL Arabic edition on the same live wire |
| `/api/subscribe` | Posts to the list provider; 503 when unconfigured |

The five desks are the whole taxonomy. There is no sixth section and no
"general" bucket.

---

## 5. Still to do

- **Daily mini-game.** A Wordle-style Gulf business puzzle. This is the strongest
  remaining idea: it is a real reason to open Marsa at 7am, and unlike aggregated
  headlines it is original content Marsa owns outright.
- **Masthead / About page.** There is currently no answer to "who is telling me
  this", which is a trust gap for a news product.
- **Arabic headlines.** Publishers' English headlines currently show on `/ar`.
  Translating them would put words in their mouths; sourcing Arabic-language
  feeds is the honest fix.
- **`/article/[slug]`** still serves the seven original mock articles. Retire or
  repurpose them.
