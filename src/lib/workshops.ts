import type { Workshop } from './types';

/**
 * Individual workshops reachable via /register?workshop=<id>.
 *
 * Production resolves these from its events backend (Zoom Events);
 * that API is not public, so the prototype ships a small demo catalog
 * to demonstrate the flow end to end. Unknown ids fall back to the
 * regular series-selection experience with a notice (matching how
 * production handles unregistered/unknown events).
 *
 * Try it: /register?workshop=prompting-lab-2026-09-11
 */
export const DEMO_WORKSHOPS: Workshop[] = [
  {
    id: 'prompting-lab-2026-09-11',
    title: 'Prompt Engineering Clinic: Rewriting Real Agency Prompts Live',
    series: 'The Prompting Lab: Real Prompts, Real Challenges, All Platforms',
    date: 'Friday, September 11, 2026',
    time: '2:00 PM – 3:00 PM ET',
    instructor: 'Beth Simone Noveck',
    format: 'Live online workshop (Zoom)',
    cost: 'Free',
    seriesImage: '8a87affa-4fef-403d-8ed4-0e06647572c5',
  },
  {
    id: 'ai-procurement-2026-09-24',
    title: 'Writing AI Requirements Into Public RFPs',
    series: 'AI for Public-Sector Procurement',
    date: 'Thursday, September 24, 2026',
    time: '1:00 PM – 2:00 PM ET',
    instructor: 'InnovateUS Faculty',
    format: 'Live online workshop (Zoom)',
    cost: 'Free',
    seriesImage: null,
  },
];

export function findWorkshop(id: string | null): Workshop | null {
  if (!id) return null;
  return DEMO_WORKSHOPS.find((w) => w.id === id) ?? null;
}
