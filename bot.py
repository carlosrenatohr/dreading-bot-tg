"""Post the daily reading to a Telegram channel.

Runs in dry-run by default (prints what it would post) so it works with no
token; set TELEGRAM_BOT_TOKEN + TELEGRAM_CHANNEL to actually post. Reads the
latest reading from dreading-api (the Cloudflare Worker). When the reading has a
generated illustration it posts the image with a caption; otherwise it posts text.
"""

import logging
import os

import requests

from formatter import format_message, caption

logger = logging.getLogger(__name__)

API_BASE = os.getenv('API_BASE', 'https://dreading-api-worker.honchkrow1995.workers.dev/api/v1')
APP_URL = os.getenv('APP_URL', 'https://dreading-pwa.pages.dev')


def fetch_latest(api_base=API_BASE):
    res = requests.get(f'{api_base}/readings/last', timeout=30)
    res.raise_for_status()
    return res.json()


def _post(method, payload, token=None, channel=None):
    token = token or os.getenv('TELEGRAM_BOT_TOKEN')
    channel = channel or os.getenv('TELEGRAM_CHANNEL')
    if not token or not channel:
        logger.info('[dry-run] %s -> %s', method, payload)
        return None
    res = requests.post(
        f'https://api.telegram.org/bot{token}/{method}',
        json={'chat_id': channel, 'parse_mode': 'HTML', **payload},
        timeout=30,
    )
    res.raise_for_status()
    return res.json()


def post_reading(reading, token=None, channel=None):
    image_url = reading.get('image_url')
    if image_url:
        return _post('sendPhoto', {'photo': image_url, 'caption': caption(reading, APP_URL)}, token, channel)
    return _post('sendMessage', {'text': format_message(reading, APP_URL), 'disable_web_page_preview': False}, token, channel)


def main():
    logging.basicConfig(level=logging.INFO)
    post_reading(fetch_latest())


if __name__ == '__main__':
    main()
