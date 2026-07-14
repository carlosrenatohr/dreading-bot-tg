import { caption, message } from './format';

interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHANNEL?: string;
  API_BASE: string;
  APP_URL: string;
}

async function fetchLatest(apiBase: string) {
  const res = await fetch(`${apiBase}/readings/last`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<Record<string, any>>;
}

// Post the reading's illustration + caption (sendPhoto) when present, else text.
// Returns what it would post when dryRun or when the secrets are missing.
async function post(env: Env, reading: Record<string, any>, dryRun: boolean) {
  const image = reading.image_url;
  const method = image ? 'sendPhoto' : 'sendMessage';
  const payload: Record<string, unknown> = image
    ? { photo: image, caption: caption(reading, env.APP_URL) }
    : { text: message(reading, env.APP_URL), disable_web_page_preview: false };

  if (dryRun || !env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHANNEL) {
    return { dryRun: true, method, payload };
  }
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHANNEL, parse_mode: 'HTML', ...payload }),
  });
  return res.json();
}

export default {
  // Daily cron: post the latest reading to the channel.
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(fetchLatest(env.API_BASE).then((r) => post(env, r, false)));
  },

  // Manual test: /run posts for real, /run?dry=1 previews without posting.
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    if (url.pathname === '/run') {
      const reading = await fetchLatest(env.API_BASE);
      return Response.json(await post(env, reading, url.searchParams.get('dry') === '1'));
    }
    return new Response('dreading-bot-tg — GET /run to post, /run?dry=1 to preview.\n', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  },
};
