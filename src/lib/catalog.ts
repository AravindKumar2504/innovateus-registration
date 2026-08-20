import type { CatalogSeries } from './types';

/**
 * The prototype consumes the same public catalog API that powers the
 * production register page, so the series list stays current without
 * hardcoding content. The request goes through our own serverless proxy
 * (netlify/functions/catalog.mts) because the upstream API is same-origin
 * only — it sends no CORS headers.
 */
const CATALOG_URL = '/api/catalog/series';

/** Production hosts series icons on the Burnes Center Directus. */
const ASSET_BASE = 'https://directus.theburnescenter.org/assets';

export async function fetchSeriesCatalog(): Promise<CatalogSeries[]> {
  const response = await fetch(CATALOG_URL);
  if (!response.ok) {
    throw new Error(`Catalog request failed with status ${response.status}`);
  }
  const body: unknown = await response.json();
  // The catalog API wraps its results Directus-style: { data: [...] }.
  const data = (body as { data?: unknown })?.data;
  if (!Array.isArray(data)) {
    throw new Error('Unexpected catalog response shape');
  }
  return (data as CatalogSeries[])
    .filter((s) => s.series_status === 'Published' && s.title?.trim())
    .map((s) => ({ ...s, title: s.title.trim() }));
}

/**
 * Production swaps series art by season; mirror that with a simple
 * month-based pick, falling back to the base image.
 */
export function seriesIconUrl(series: CatalogSeries, displaySize = 48): string | null {
  const month = new Date().getMonth(); // 0-based
  const seasonal =
    month >= 5 && month <= 7
      ? series.series_image_summer
      : month >= 8 && month <= 10
        ? series.series_image_fall
        : month === 11 || month <= 1
          ? series.series_image_winter
          : null;
  const assetId = seasonal ?? series.series_image;
  if (!assetId) return null;
  // Request 2x the display size for crisp rendering on retina screens.
  return `${ASSET_BASE}/${assetId}?width=${displaySize * 2}`;
}

/**
 * Optional ?season=<name> filter observed on production links
 * (e.g. /register?season=fall). Falls back to the full list rather
 * than showing an empty page for unknown values.
 */
export function filterBySeason(series: CatalogSeries[], season: string | null): CatalogSeries[] {
  if (!season) return series;
  const wanted = season.trim().toLowerCase();
  if (!wanted) return series;
  const matched = series.filter((s) =>
    s.seasons?.some((name) => name.toLowerCase().includes(wanted)),
  );
  return matched.length > 0 ? matched : series;
}
