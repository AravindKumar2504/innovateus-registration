/** A workshop series from the public InnovateUS catalog API. */
export interface CatalogSeries {
  id: number;
  title: string;
  zoom_event_id: string;
  series_status: string;
  seasons: string[];
  Date: string;
  series_image: string | null;
  series_image_summer: string | null;
  series_image_fall: string | null;
  series_image_winter: string | null;
}

/** A single workshop reachable via /register?workshop=<id>. */
export interface Workshop {
  id: string;
  title: string;
  /** Title of the series this workshop belongs to. */
  series: string;
  date: string;
  time: string;
  instructor: string;
  format: string;
  cost: string;
  /** Directus asset id for the parent series icon. */
  seriesImage: string | null;
}

/** What the browser sends to POST /api/register. */
export interface RegistrationRequest {
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  /** Two-letter code; only present when country is "United States". */
  state?: string;
  /** Verbatim answer to the government-organization question. */
  gov_org: string;
  /** Only present when gov_org is one of the "Yes" answers. */
  gov_level?: string;
  /** Titles of the selected series (series mode). */
  series?: string[];
  /** The single workshop being registered for (?workshop=<id> mode). */
  workshop?: { id: string; title: string; series: string };
  newsletter: boolean;
  /** Honeypot — humans never fill this. */
  website?: string;
}

export interface RegistrationResponse {
  ok: boolean;
  error?: string;
  /** Field-level validation errors keyed by field name. */
  fieldErrors?: Record<string, string>;
}
