import { describe, it, expect } from 'vitest';

import { caption, message } from '../src/format';

const reading = () => ({
  title: 'Evangelio y Lecturas del XVI Domingo',
  date_title: '19 de julio de 2026',
  message: 'Escucha la Palabra.',
  reflection: 'Reflexión de hoy.',
  image_url: 'https://w.dev/images/2026-07-19.png',
  lecturas: [{ title: 'Evangelio', first_line: 'Lectura del santo evangelio según san Lucas' }],
});

describe('caption', () => {
  it('is short and carries title, message and link', () => {
    const c = caption(reading(), 'https://app.example');
    expect(c).toContain('XVI Domingo');
    expect(c).toContain('Escucha la Palabra.');
    expect(c).toContain('https://app.example');
    expect(c.length).toBeLessThanOrEqual(1024);
  });
});

describe('message', () => {
  it('includes the gospel incipit and the reflection', () => {
    const m = message(reading(), 'https://app.example');
    expect(m).toContain('san Lucas');
    expect(m).toContain('Reflexión de hoy.');
  });
  it('escapes HTML', () => {
    expect(message({ title: 'A & <b>' })).toContain('A &amp; &lt;b&gt;');
  });
});
