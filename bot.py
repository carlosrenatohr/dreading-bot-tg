"""Post the daily reading to a Telegram channel.

Runs in dry-run by default (prints the message) so it works with no token; set
TELEGRAM_BOT_TOKEN + TELEGRAM_CHANNEL to actually post. Reads today's reading
from dreading-api.
"""

import logging
import os

import requests

from formatter import format_message

logger = logging.getLogger(__name__)

API_BASE = os.getenv('API_BASE', 'http://localhost:89/api/v1')
APP_URL = os.getenv('APP_URL')  # optional link to the PWA


def fetch_latest(api_base=API_BASE):
    res = requests.get(f'{api_base}/readings/last', timeout=30)
    res.raise_for_status()
    return res.json()


def send(text, token=None, channel=None):
    # Dry-run when no token/channel: log the message instead of posting.
    token = token or os.getenv('TELEGRAM_BOT_TOKEN')
    channel = channel or os.getenv('TELEGRAM_CHANNEL')
    if not token or not channel:
        logger.info('[dry-run] would post to Telegram:\n%s', text)
        return None
    res = requests.post(
        f'https://api.telegram.org/bot{token}/sendMessage',
        json={'chat_id': channel, 'text': text, 'parse_mode': 'HTML', 'disable_web_page_preview': False},
        timeout=30,
    )
    res.raise_for_status()
    return res.json()


def main():
    logging.basicConfig(level=logging.INFO)
    reading = fetch_latest()
    send(format_message(reading, APP_URL))


if __name__ == '__main__':
    main()
