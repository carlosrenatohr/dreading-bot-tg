# CLAUDE.md — dreading-bot

Telegram bot that posts the daily reading from `dreading-api` to a channel. Sibling repos: `dreading-api`, `dreading-scrape`, `dreading-web`.

## Engineering (harness flow)
- Conventional commits, one logical unit per commit. Test-first for non-trivial logic.
- **Gate before commit**: `python -m pytest -q` green + `python -m py_compile`.
- Minimal comments; no dead code / stray TODOs / unused imports.

## Structure
- `formatter.py` — pure `format_message(reading)` → Telegram HTML (unit-tested, no network).
- `bot.py` — fetch latest reading + send (dry-run unless `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHANNEL` set).
- `test_formatter.py` — formatter unit tests.

## Config (env)
- `API_BASE` (default local API), `APP_URL` (optional), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL`.
