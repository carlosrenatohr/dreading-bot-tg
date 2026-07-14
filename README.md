# dreading-bot

Telegram bot that posts the **daily reading** to a channel — a zero-UI client of the [`dreading-api`](../dreading-api) platform. Reach + engagement: the daily Word (and, later, the daily image) shows up where people already are.

> **Status — scaffold.** Fetches the latest reading from the API and posts a formatted message (title · date · gospel incipit · message of the day · link to the app). Runs in **dry-run** by default (prints the message, no token needed).

## Run

```bash
pip install -r requirements.txt
API_BASE=http://localhost:89/api/v1 python bot.py     # dry-run: prints the message
```

Post for real by providing the bot credentials:

```bash
export TELEGRAM_BOT_TOKEN=...        # from @BotFather
export TELEGRAM_CHANNEL=@your_channel
export APP_URL=https://your-pwa.example   # optional link in the message
python bot.py
```

## Schedule

Run daily via GitHub Actions cron (mirrors `dreading-scrape`), with the token/channel as repository secrets. (Workflow to be added.)

## Test

```bash
pip install -r requirements-dev.txt
python -m pytest -q      # pure message formatting (no network)
```
