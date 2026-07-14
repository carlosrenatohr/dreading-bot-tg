# dreading-bot

Telegram bot that posts the **daily reading** to a channel — a client of the [dreading-api Worker](https://dreading-api-worker.honchkrow1995.workers.dev). When the reading has a generated illustration it posts the **image + caption**; otherwise it posts formatted text. Links back to the [PWA](https://dreading-pwa.pages.dev).

> **Status — working (dry-run by default).** With no token it prints exactly what it would post (fetching the real reading from prod). Set the two secrets to post for real.

## What you need to test it

1. **A bot token** — talk to [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token.
2. **A channel** — create a Telegram channel, then add your bot as an **admin** (so it can post). Use `@your_channel` (or the numeric chat id).

## Run

```bash
pip install -r requirements.txt

# dry-run: fetches today's reading from prod and PRINTS what it would post
python bot.py

# real post:
export TELEGRAM_BOT_TOKEN=123456:ABC...
export TELEGRAM_CHANNEL=@your_channel
python bot.py
```

It reads from the prod API by default; override with `API_BASE` / `APP_URL` env vars.

## Test

```bash
pip install -r requirements-dev.txt
python -m pytest -q      # message + caption formatting (no network)
```

## Schedule (daily)

`.github/workflows/post.yaml` runs daily at 06:00 UTC (after the scraper) and on manual dispatch. Add the repository secrets:

```bash
gh secret set TELEGRAM_BOT_TOKEN --repo carlosrenatohr/dreading-bot --body "<from BotFather>"
gh secret set TELEGRAM_CHANNEL   --repo carlosrenatohr/dreading-bot --body "@your_channel"
```

Then trigger it from the Actions tab (Run workflow) to test end-to-end.
