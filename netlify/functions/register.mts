import {
  COUNTRY_OPTIONS,
  EMAIL_PATTERN,
  GOV_LEVEL_OPTIONS,
  GOV_ORG_OPTIONS,
  MAX_FIELD_LENGTH,
  US_STATE_CODES,
  isGovYes,
} from '../../src/lib/options';
import { findWorkshop } from '../../src/lib/workshops';

/**
 * POST /api/register
 *
 * Serverless proxy between the registration form and Directus. It exists for
 * three reasons:
 *  1. The Directus token lives only in server-side env vars. A static site
 *     posting to Directus directly would ship the token in the JS bundle,
 *     where anyone could read it.
 *  2. Every field is re-validated and whitelisted here, so a hand-crafted
 *     request can't write anything the real form couldn't.
 *  3. Values that need to be trustworthy (the consent_at timestamp) are
 *     stamped here, not in the browser.
 */

const MAX_BODY_BYTES = 20_000;
const MAX_SERIES_SELECTIONS = 50;
/** Directus `workshop_series`/`workshops` are text columns; still cap them. */
const MAX_TEXT_LENGTH = 2_000;

interface DirectusPayload {
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  state: string | null;
  gov_org: string;
  gov_level: string | null;
  workshop_series: string;
  workshops: string | null;
  newsletter: boolean;
  consent_at: string | null;
}

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const fail = (status: number, error: string, fieldErrors?: Record<string, string>): Response =>
  json(status, { ok: false, error, ...(fieldErrors ? { fieldErrors } : {}) });

/**
 * Trim and strip ASCII control characters — nothing on this form has a
 * legitimate use for them, and stripping here covers every field at once.
 */
const asTrimmedString = (value: unknown): string =>
  // eslint-disable-next-line no-control-regex -- stripping controls is the point
  typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim() : '';

/**
 * Free text destined for spreadsheet exports: additionally defang leading
 * formula characters (CSV-injection). No real series title starts with these.
 */
const asSafeText = (value: unknown): string => asTrimmedString(value).replace(/^[=+@-]+/, '');

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return fail(405, 'Method not allowed.');
  }

  const declaredLength = Number(req.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return fail(413, 'Request too large.');
  }
  const rawBody = await req.text();
  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return fail(413, 'Request too large.');
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('not an object');
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return fail(400, 'Invalid request body.');
  }

  // Honeypot: humans never see this field. Pretend success — with the same
  // status code as a real write — so bots cannot tell they were filtered.
  if (asTrimmedString(body.website) !== '') {
    return json(201, { ok: true });
  }

  const fieldErrors: Record<string, string> = {};

  const firstName = asTrimmedString(body.first_name);
  if (firstName.length === 0 || firstName.length > MAX_FIELD_LENGTH) {
    fieldErrors.first_name = 'Please enter a first name (up to 255 characters).';
  }

  const lastName = asTrimmedString(body.last_name);
  if (lastName.length === 0 || lastName.length > MAX_FIELD_LENGTH) {
    fieldErrors.last_name = 'Please enter a last name (up to 255 characters).';
  }

  const email = asTrimmedString(body.email);
  if (!EMAIL_PATTERN.test(email) || email.length > MAX_FIELD_LENGTH) {
    fieldErrors.email = 'Please enter a valid email address.';
  }

  const country = asTrimmedString(body.country);
  if (!(COUNTRY_OPTIONS as readonly string[]).includes(country)) {
    fieldErrors.country = 'Please select a country.';
  }

  // State applies only to US registrants (per the production form and the
  // collection's field notes). Drop it silently otherwise.
  let state: string | null = null;
  if (country === 'United States') {
    const submitted = asTrimmedString(body.state).toUpperCase();
    if (!(US_STATE_CODES as readonly string[]).includes(submitted)) {
      fieldErrors.state = 'Please select a state.';
    } else {
      state = submitted;
    }
  }

  const govOrg = asTrimmedString(body.gov_org);
  if (!(GOV_ORG_OPTIONS as readonly string[]).includes(govOrg)) {
    fieldErrors.gov_org = 'Please answer the government-organization question.';
  }

  // The level question only applies to "Yes" answers — and is then required,
  // matching the production form.
  let govLevel: string | null = null;
  if (isGovYes(govOrg)) {
    const submitted = asTrimmedString(body.gov_level);
    if (!(GOV_LEVEL_OPTIONS as readonly string[]).includes(submitted)) {
      fieldErrors.gov_level = 'Please choose a level of government from the list.';
    } else {
      govLevel = submitted;
    }
  }

  // Exactly one of: a list of series titles, or a single workshop.
  // In workshop mode the client sends only the id — title and parent series
  // are resolved server-side so they can't be forged.
  let workshopSeries = '';
  let workshops: string | null = null;
  const workshopId = asTrimmedString(body.workshop_id);
  if (workshopId !== '') {
    const workshop = findWorkshop(workshopId);
    if (!workshop) {
      fieldErrors.workshop_id = 'This workshop is no longer available.';
    } else {
      workshops = `${workshop.title} (${workshop.id})`.slice(0, MAX_TEXT_LENGTH);
      workshopSeries = workshop.series.slice(0, MAX_TEXT_LENGTH);
    }
  } else {
    const series = Array.isArray(body.series)
      ? body.series.map(asSafeText).filter((title) => title.length > 0)
      : [];
    if (series.length === 0) {
      fieldErrors.series = 'Please select at least one series.';
    } else if (series.length > MAX_SERIES_SELECTIONS) {
      fieldErrors.series = 'Too many series selected.';
    } else {
      workshopSeries = series.join(', ').slice(0, MAX_TEXT_LENGTH);
    }
  }

  if (typeof body.newsletter !== 'boolean') {
    fieldErrors.newsletter = 'Newsletter preference is required.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fail(422, 'Please correct the highlighted fields.', fieldErrors);
  }

  const newsletter = body.newsletter as boolean;
  const payload: DirectusPayload = {
    first_name: firstName,
    last_name: lastName,
    email,
    country,
    state,
    gov_org: govOrg,
    gov_level: govLevel,
    workshop_series: workshopSeries,
    workshops,
    newsletter,
    // Consent timestamp is stamped here, not in the browser, so it can be
    // trusted (client clocks are wrong and clients can lie).
    consent_at: newsletter ? new Date().toISOString() : null,
  };

  const directusUrl = process.env.DIRECTUS_URL ?? 'https://burnes-center.directus.app';
  const directusToken = process.env.DIRECTUS_TOKEN;
  if (!directusToken) {
    console.error('DIRECTUS_TOKEN is not configured');
    return fail(500, 'The registration service is not configured. Please try again later.');
  }

  let directusResponse: Response;
  try {
    directusResponse = await fetch(`${directusUrl}/items/cw_intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${directusToken}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Directus request failed', error);
    return fail(502, 'We could not save your registration. Please try again in a moment.');
  }

  if (!directusResponse.ok) {
    console.error(
      'Directus rejected the registration',
      directusResponse.status,
      await directusResponse.text().catch(() => ''),
    );
    return fail(502, 'We could not save your registration. Please try again in a moment.');
  }

  return json(201, { ok: true });
};

export const config = { path: '/api/register' };
