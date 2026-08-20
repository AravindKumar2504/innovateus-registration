/**
 * Form option lists, shared by the client (rendering + validation)
 * and the Netlify function (authoritative server-side validation),
 * so the two can never drift apart.
 *
 * Option text mirrors the production form verbatim — the Directus
 * `gov_org` field expects the full answer text, not a code.
 */

export const COUNTRY_OPTIONS = ['United States', 'Outside the United States'] as const;
export type Country = (typeof COUNTRY_OPTIONS)[number];

/** USPS state/territory codes, as offered by the production form. */
export const US_STATE_CODES = [
  'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC',
  'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY',
  'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE',
  'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK',
  'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'VI', 'WA', 'WV', 'WI', 'WY',
] as const;
export type StateCode = (typeof US_STATE_CODES)[number];

export const GOV_ORG_QUESTION =
  'Do you work for or primarily support a government or government-affiliated organization?';

export const GOV_ORG_OPTIONS = [
  "Yes, I'm an employee of a government agency",
  "Yes, I'm a contractor or consultant working with a government agency",
  'Yes, I work for a government-affiliated organization (e.g., public university, nonprofit, or quasi-governmental organization)',
  'No, I do not work for or support a government or government-affiliated organization',
] as const;
export type GovOrg = (typeof GOV_ORG_OPTIONS)[number];

/** The follow-up level question only applies to the "Yes" answers. */
export const isGovYes = (answer: string): boolean => answer.startsWith('Yes');

export const GOV_LEVEL_QUESTION =
  'If a government employee or consultant: What level of government?';

export const GOV_LEVEL_OPTIONS = [
  'International or Intergovernmental Organization (e.g. UN, OECD, EU)',
  'National or Federal Level',
  'State or Provincial level',
  'Tribal Government',
  'County or equivalent level',
  'Municipal, City, or Local level',
  'Other level not listed here',
] as const;
export type GovLevel = (typeof GOV_LEVEL_OPTIONS)[number];

export const NEWSLETTER_LABEL = 'Sign me up for the weekly InnovateUS newsletter';
export const NEWSLETTER_HINT =
  'Get updates on new courses, workshops, and events. You can unsubscribe at any time.';

/** Directus column limit for the varchar fields. */
export const MAX_FIELD_LENGTH = 255;

/**
 * Pragmatic email shape check (something@something.tld). Full RFC 5322
 * validation is famously counterproductive; deliverability can only be
 * proven by sending mail.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
