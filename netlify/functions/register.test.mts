import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from './register.mts';

/**
 * Unit tests for the registration function — the piece that owns all
 * assignment-critical validation and the Directus payload mapping.
 * Directus itself is mocked; what these tests pin down is exactly what
 * would be written.
 */

const VALID_BODY = {
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane.doe@example.org',
  country: 'United States',
  state: 'MA',
  gov_org: "Yes, I'm an employee of a government agency",
  gov_level: 'State or Provincial level',
  series: ['AI in Public Health'],
  newsletter: true,
};

const post = (body: unknown): Request =>
  new Request('http://localhost/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

/** Parse a handler response body with the API's error shape. */
const errorBody = async (res: Response) =>
  (await res.json()) as { ok: boolean; error?: string; fieldErrors?: Record<string, string> };

/** The payload the mocked Directus received on the last call. */
const sentPayload = (fetchMock: ReturnType<typeof vi.fn>) => {
  const [, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return JSON.parse(init.body as string);
};

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  process.env.DIRECTUS_TOKEN = 'test-token';
  fetchMock = vi.fn().mockResolvedValue(new Response('{"data":{}}', { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('method and body guards', () => {
  it('rejects non-POST requests', async () => {
    const res = await handler(new Request('http://localhost/api/register', { method: 'GET' }));
    expect(res.status).toBe(405);
  });

  it('rejects invalid JSON', async () => {
    const res = await handler(post('not-json'));
    expect(res.status).toBe(400);
  });

  it('rejects oversized bodies', async () => {
    const res = await handler(post({ ...VALID_BODY, first_name: 'x'.repeat(30_000) }));
    expect(res.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('honeypot', () => {
  it('returns a real-looking 201 without writing anything', async () => {
    const res = await handler(post({ ...VALID_BODY, website: 'http://spam.example' }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('field validation', () => {
  it('requires the verbatim gov_org option text', async () => {
    const res = await handler(post({ ...VALID_BODY, gov_org: 'yes' }));
    expect(res.status).toBe(422);
    expect((await errorBody(res)).fieldErrors).toHaveProperty('gov_org');
  });

  it('requires a state for US registrants', async () => {
    const res = await handler(post({ ...VALID_BODY, state: undefined }));
    expect(res.status).toBe(422);
    expect((await errorBody(res)).fieldErrors).toHaveProperty('state');
  });

  it('requires gov_level for "Yes" gov answers (as production does)', async () => {
    const res = await handler(post({ ...VALID_BODY, gov_level: undefined }));
    expect(res.status).toBe(422);
    expect((await errorBody(res)).fieldErrors).toHaveProperty('gov_level');
  });

  it('requires newsletter to be a boolean', async () => {
    const res = await handler(post({ ...VALID_BODY, newsletter: 'yes' }));
    expect(res.status).toBe(422);
    expect((await errorBody(res)).fieldErrors).toHaveProperty('newsletter');
  });

  it('requires at least one series in series mode', async () => {
    const res = await handler(post({ ...VALID_BODY, series: [] }));
    expect(res.status).toBe(422);
    expect((await errorBody(res)).fieldErrors).toHaveProperty('series');
  });
});

describe('payload mapping (the cw_intake field notes)', () => {
  it('writes the mapped row and stamps consent_at when newsletter is true', async () => {
    const res = await handler(post({ ...VALID_BODY, series: ['A', 'B'] }));
    expect(res.status).toBe(201);
    const payload = sentPayload(fetchMock);
    expect(payload.workshop_series).toBe('A, B');
    expect(payload.workshops).toBeNull();
    expect(payload.newsletter).toBe(true);
    expect(new Date(payload.consent_at).getTime()).not.toBeNaN();
  });

  it('leaves consent_at null when newsletter is false', async () => {
    await handler(post({ ...VALID_BODY, newsletter: false }));
    expect(sentPayload(fetchMock).consent_at).toBeNull();
  });

  it('drops state for non-US registrants and gov_level for "No" answers', async () => {
    await handler(
      post({
        ...VALID_BODY,
        country: 'Outside the United States',
        gov_org: 'No, I do not work for or support a government or government-affiliated organization',
        gov_level: 'Tribal Government',
      }),
    );
    const payload = sentPayload(fetchMock);
    expect(payload.state).toBeNull();
    expect(payload.gov_level).toBeNull();
  });

  it('strips control characters and CSV formula prefixes from free text', async () => {
    await handler(
      post({
        ...VALID_BODY,
        first_name: 'Ja\u0000ne',
        series: ['=HYPERLINK("http://evil.example","x")'],
      }),
    );
    const payload = sentPayload(fetchMock);
    expect(payload.first_name).toBe('Ja ne');
    expect(payload.workshop_series.startsWith('=')).toBe(false);
  });
});

describe('workshop mode', () => {
  it('resolves title and series server-side from the id alone', async () => {
    const res = await handler(
      post({ ...VALID_BODY, series: undefined, workshop_id: 'prompting-lab-2026-09-11' }),
    );
    expect(res.status).toBe(201);
    const payload = sentPayload(fetchMock);
    expect(payload.workshops).toContain('(prompting-lab-2026-09-11)');
    expect(payload.workshop_series).toBe(
      'The Prompting Lab: Real Prompts, Real Challenges, All Platforms',
    );
  });

  it('rejects unknown workshop ids', async () => {
    const res = await handler(
      post({ ...VALID_BODY, series: undefined, workshop_id: 'not-a-real-workshop' }),
    );
    expect(res.status).toBe(422);
    expect((await errorBody(res)).fieldErrors).toHaveProperty('workshop_id');
  });
});

describe('upstream failure', () => {
  it('returns a generic 502 when Directus rejects the write', async () => {
    fetchMock.mockResolvedValue(new Response('forbidden', { status: 403 }));
    const res = await handler(post(VALID_BODY));
    expect(res.status).toBe(502);
    expect((await errorBody(res)).error).not.toContain('403');
  });
});
