"""Format a reading (as served by dreading-api) into a Telegram message.

Pure function — no network — so it unit-tests cleanly. Output is Telegram HTML
(parse_mode=HTML): only a few tags, and text is escaped.
"""

from html import escape


def _gospel(reading):
    for lectura in reading.get('lecturas', []):
        if 'evangelio' in lectura.get('title', '').lower():
            return lectura
    lecturas = reading.get('lecturas') or [{}]
    return lecturas[-1]


def format_message(reading, app_url=None):
    title = escape(reading.get('title', 'Lectura del día'))
    date_title = escape(reading.get('date_title', ''))
    gospel = _gospel(reading)
    incipit = escape(gospel.get('first_line', ''))
    message = escape(reading.get('message', ''))
    reflection = escape(reading.get('reflection', ''))

    lines = [f'📖 <b>{title}</b>']
    if date_title:
        lines.append(date_title)
    if incipit:
        lines.append(f'\n<i>{incipit}</i>')
    if message:
        lines.append(f'\n💬 {message}')
    if reflection:
        lines.append(f'\n{reflection}')
    if app_url:
        lines.append(f'\nLéela completa 👉 {escape(app_url)}')
    return '\n'.join(lines)


def caption(reading, app_url=None):
    # Short caption for a photo post (Telegram caps captions at 1024 chars).
    title = escape(reading.get('title', 'Lectura del día'))
    date_title = escape(reading.get('date_title', ''))
    message = escape(reading.get('message', ''))
    lines = [f'📖 <b>{title}</b>']
    if date_title:
        lines.append(date_title)
    if message:
        lines.append(f'\n💬 {message}')
    if app_url:
        lines.append(f'\nLéela completa 👉 {escape(app_url)}')
    return '\n'.join(lines)[:1024]
