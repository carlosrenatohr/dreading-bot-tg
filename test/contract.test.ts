import { describe, it, expect, vi } from 'vitest';
import worker from '../src/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PAGINATED_ENVELOPE = {
  data: [
    {
      date_raw: '2026-08-26T00:00:00Z',
      title: 'Martes XX Ordinary Time',
      date_title: '26 de agosto',
      message: 'Blessed are the peacemakers.',
      reflection: 'Today we reflect on peace.',
      image_url: 'https://r2.example.com/2026-08-26.png',
      lecturas: [
        { title: 'Evangelio', first_line: 'Lectura del santo evangelio según san Mateo' },
      ],
    },
  ],
  total: 1,
  per_page: 10,
  page: 1,
};

function fakeEnv(overrides: Record<string, any> = {}) {
  return {
    TELEGRAM_BOT_TOKEN: 'fake-token',
    TELEGRAM_CHANNEL: '@test_channel',
    APP_URL: 'https://dreading-pwa.pages.dev',
    API: {
      fetch: vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(PAGINATED_ENVELOPE),
      }),
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// GET / — description
// ---------------------------------------------------------------------------

describe('GET /', () => {
  it('returns a plain text description', async () => {
    const env = fakeEnv();
    const res = await worker.fetch(new Request('https://bot.dev/'), env as any, {} as any);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('dreading-bot-tg');
    expect(text).toContain('/run');
  });
});

// ---------------------------------------------------------------------------
// GET /run?dry=1 — dry run with paginated envelope
// ---------------------------------------------------------------------------

describe('GET /run?dry=1', () => {
  it('returns a dry-run sendPhoto payload', async () => {
    const env = fakeEnv();
    const res = await worker.fetch(new Request('https://bot.dev/run?dry=1'), env as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dryRun).toBe(true);
    expect(body.method).toBe('sendPhoto');
    expect(body.payload.photo).toBeTruthy();
    expect(body.payload.caption).toContain('Martes XX');
    expect(body.payload.caption).toContain('Blessed are the peacemakers');
  });

  it('unwraps the paginated envelope to the first reading', async () => {
    const env = fakeEnv();
    const res = await worker.fetch(new Request('https://bot.dev/run?dry=1'), env as any, {} as any);
    const body = await res.json();
    // If it didn't unwrap, caption would be empty or contain '[object Object]'
    expect(body.payload.caption).not.toContain('[object Object]');
    expect(body.payload.caption.length).toBeGreaterThan(10);
  });
});

// ---------------------------------------------------------------------------
// GET /run — would post for real (but no token = dry run fallback)
// ---------------------------------------------------------------------------

describe('GET /run (no token)', () => {
  it('falls back to dry run when secrets are missing', async () => {
    const env = fakeEnv({ TELEGRAM_BOT_TOKEN: undefined });
    const res = await worker.fetch(new Request('https://bot.dev/run'), env as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dryRun).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST reading without image — falls back to sendMessage
// ---------------------------------------------------------------------------

describe('reading without image_url', () => {
  it('uses sendMessage instead of sendPhoto', async () => {
    const env = fakeEnv();
    // Override API to return reading without image
    env.API.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: [{ ...PAGINATED_ENVELOPE.data[0], image_url: null }],
        total: 1,
      }),
    });
    const res = await worker.fetch(new Request('https://bot.dev/run?dry=1'), env as any, {} as any);
    const body = await res.json();
    expect(body.method).toBe('sendMessage');
    expect(body.payload.text).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// API failure
// ---------------------------------------------------------------------------

describe('API failure', () => {
  it('returns 500 when the API is down', async () => {
    const env = fakeEnv();
    env.API.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    const res = await worker.fetch(new Request('https://bot.dev/run?dry=1'), env as any, {} as any);
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).toContain('error');
  });
});
