# CLAUDE.md — dreading-bot-tg

Cloudflare Worker (cron) that posts the daily reading from `dreading-api-worker` to a Telegram channel. All-Cloudflare (no GitHub Actions). Sibling repos: `dreading-api-worker`, `dreading-scrape`, `dreading-pwa`.

## Engineering (harness flow)
- Conventional commits, one logical unit per commit. Test-first for non-trivial logic.
- **Gate before commit**: `npm test` (vitest) green + `wrangler dev`/deploy boots.
- Minimal, useful comments; no dead code / stray TODOs / unused code.

## Structure
- `src/index.ts` — `scheduled` (daily cron post) + `fetch` (`/run`, `/run?dry=1` for manual test).
- `src/format.ts` — pure `caption`/`message` builders (Telegram HTML), unit-tested in `test/`.
- `wrangler.jsonc` — cron trigger + `API_BASE`/`APP_URL` vars.

## Config
- Vars: `API_BASE`, `APP_URL` (in `wrangler.jsonc`).
- Secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL` (`wrangler secret put`).
