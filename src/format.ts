// Build the Telegram post from a reading (as served by dreading-api). Pure —
// unit-tested. Output is Telegram HTML (parse_mode=HTML); text is escaped.

type Reading = Record<string, any>;

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function gospel(reading: Reading): Reading {
  const lecturas: Reading[] = reading.lecturas || [];
  return lecturas.find((l) => /evangelio/i.test(l?.title || '')) || lecturas[lecturas.length - 1] || {};
}

// Short caption for a photo post (Telegram caps captions at 1024 chars).
export function caption(reading: Reading, appUrl?: string): string {
  const lines = [`📖 <b>${esc(reading.title || 'Lectura del día')}</b>`];
  if (reading.date_title) lines.push(esc(reading.date_title));
  if (reading.message) lines.push(`\n💬 ${esc(reading.message)}`);
  if (appUrl) lines.push(`\nLéela completa 👉 ${esc(appUrl)}`);
  return lines.join('\n').slice(0, 1024);
}

// Full text post (when there is no image).
export function message(reading: Reading, appUrl?: string): string {
  const g = gospel(reading);
  const lines = [`📖 <b>${esc(reading.title || 'Lectura del día')}</b>`];
  if (reading.date_title) lines.push(esc(reading.date_title));
  if (g.first_line) lines.push(`\n<i>${esc(g.first_line)}</i>`);
  if (reading.message) lines.push(`\n💬 ${esc(reading.message)}`);
  if (reading.reflection) lines.push(`\n${esc(reading.reflection)}`);
  if (appUrl) lines.push(`\nLéela completa 👉 ${esc(appUrl)}`);
  return lines.join('\n');
}
