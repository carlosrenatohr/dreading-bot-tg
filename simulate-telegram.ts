// Simula el envío diario del bot de Telegram sin publicar nada.
// Ejecuta el MISMO código del bot (format.ts + lógica de post) contra la API real:
//   1. fetchToday()   — igual que el bot: GET /api/v1/readings/today
//   2. post(dryRun)   — elige sendPhoto/sendMessage y arma el payload exacto
//
// Uso: npx tsx simulate-telegram.ts [url-api]
import { caption, message } from './src/format';

const api = process.argv[2] || 'https://dreading-api-worker.nativerse.workers.dev';
const APP_URL = 'https://dreading-pwa.pages.dev';

type Reading = Record<string, any>;

async function fetchToday(): Promise<Reading> {
  const res = await fetch(`${api}/api/v1/readings/today`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const body = (await res.json()) as any;
  // El API devuelve el envelope paginado { data: [...] } — tomar la lectura.
  return Array.isArray(body?.data) ? body.data[0] : body;
}

function post(reading: Reading, dryRun: boolean) {
  const image = reading.image_url;
  const method = image ? 'sendPhoto' : 'sendMessage';
  const payload: Record<string, unknown> = image
    ? { photo: image, caption: caption(reading, APP_URL) }
    : { text: message(reading, APP_URL), disable_web_page_preview: false };
  if (dryRun || !process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL) {
    return { dryRun: true, method, payload };
  }
  throw new Error('Envío real deshabilitado en esta simulación');
}

const reading = await fetchToday();
const out = post(reading, true);
console.log('Lectura:', reading.date_title);
console.log(`Método de Telegram: ${out.method}`);
console.log('Payload que se enviaría al canal:');
console.log(JSON.stringify(out.payload, null, 2));
