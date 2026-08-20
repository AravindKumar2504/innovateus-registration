import type { RegistrationRequest, RegistrationResponse } from './types';

/**
 * Submit through our Netlify function rather than straight to Directus:
 * the API token stays server-side, and the function re-validates and
 * whitelists every field before anything is written.
 */
export async function submitRegistration(
  payload: RegistrationRequest,
): Promise<RegistrationResponse> {
  let response: Response;
  try {
    response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      ok: false,
      error: 'We could not reach the registration service. Please check your connection and try again.',
    };
  }

  const body = (await response.json().catch(() => null)) as RegistrationResponse | null;
  if (response.ok && body?.ok) {
    return { ok: true };
  }
  return {
    ok: false,
    error:
      body?.error ??
      'Something went wrong while submitting your registration. Please try again in a moment.',
    fieldErrors: body?.fieldErrors,
  };
}
