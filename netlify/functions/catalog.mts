/**
 * GET /api/catalog/series
 *
 * Same-origin proxy for the public InnovateUS series catalog. The upstream
 * API does not send CORS headers (production consumes it same-origin), so
 * the prototype mirrors that arrangement instead of relaxing anything.
 */

const UPSTREAM = 'https://innovate-us.org/api/catalog/series';

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const upstream = await fetch(UPSTREAM, { headers: { Accept: 'application/json' } });
    if (!upstream.ok) {
      console.error('Catalog upstream returned', upstream.status);
      return new Response(JSON.stringify({ error: 'Catalog unavailable.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const body = await upstream.text();
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // The series list changes rarely; a short shared cache keeps the
        // page fast without going stale.
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Catalog upstream request failed', error);
    return new Response(JSON.stringify({ error: 'Catalog unavailable.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/api/catalog/series' };
