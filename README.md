# dreading-bot-tg

Cloudflare **Worker (cron)** that posts the **daily reading** to a Telegram channel — all on Cloudflare, no GitHub Actions. Reads from the [dreading-api Worker](https://dreading-api-worker.honchkrow1995.workers.dev) and posts the generated **illustration + caption** (or formatted text), linking to the [PWA](https://dreading-pwa.pages.dev).

> **Status — MVP.** Runs daily via a Cron Trigger. Manual endpoints for testing: `GET /run?dry=1` previews, `GET /run` posts.

## What you need

1. **Bot token** — [@BotFather](https://t.me/BotFather) → `/newbot` → copy `12345:AA...`.
2. **Channel** — create a channel and add the bot as an **admin**. Use `@your_channel` or the numeric id (`-100...`).

## Deploy

```bash
npm install
npm run deploy                       # deploys the Worker + registers the daily cron
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHANNEL
```

`API_BASE` / `APP_URL` are set as vars in `wrangler.jsonc` (point at prod by default).

## Test

```bash
npm test                             # vitest — caption/message formatting (no network)

# after deploy, against the live Worker:
curl "https://dreading-bot-tg.<subdomain>.workers.dev/run?dry=1"   # preview (no post)
curl "https://dreading-bot-tg.<subdomain>.workers.dev/run"        # posts for real (needs secrets)
```

Cron: `0 6 * * *` (daily, after the scraper). Change it in `wrangler.jsonc`.
