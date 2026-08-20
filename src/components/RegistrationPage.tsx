import { useEffect, useMemo, useState } from 'react';
import { fetchSeriesCatalog, filterBySeason } from '../lib/catalog';
import type { CatalogSeries } from '../lib/types';
import { findWorkshop } from '../lib/workshops';
import RegistrationForm, { type SuccessSummary } from './RegistrationForm';
import SuccessPanel from './SuccessPanel';
import WorkshopCard from './WorkshopCard';
import './register.css';

/*
 * Owns everything around the form: reading the URL params, loading the
 * series catalog, and switching between the four page states
 * (loading / error / form / success).
 */

// A discriminated union instead of separate isLoading/isError booleans, so
// impossible combinations (loading AND error at once) can't be represented.
type CatalogState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; series: CatalogSeries[] };

export default function RegistrationPage() {
  // Query params are read once on mount (useMemo with no deps). Production
  // links use both: ?workshop=<id> registers for a single workshop, and
  // ?season=<name> narrows the series list.
  const { workshop, workshopNotFound, season } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const workshopId = params.get('workshop');
    const found = findWorkshop(workshopId);
    return {
      workshop: found,
      workshopNotFound: workshopId !== null && found === null,
      season: params.get('season'),
    };
  }, []);

  const [catalog, setCatalog] = useState<CatalogState>({ status: 'loading' });
  const [result, setResult] = useState<SuccessSummary | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [fetchAttempt, setFetchAttempt] = useState(0);

  // The series catalog is only needed when we are not registering for a
  // single known workshop.
  const needsCatalog = workshop === null;

  useEffect(() => {
    if (!needsCatalog) return;
    // The cancelled flag stops a stale response from overwriting state after
    // the component unmounts or the effect re-runs (React StrictMode runs
    // effects twice in dev, which surfaces exactly this kind of race).
    let cancelled = false;
    fetchSeriesCatalog()
      .then((series) => {
        if (!cancelled) setCatalog({ status: 'ready', series: filterBySeason(series, season) });
      })
      .catch(() => {
        if (!cancelled) setCatalog({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [needsCatalog, season, fetchAttempt]);

  const retryFetch = () => {
    setCatalog({ status: 'loading' });
    setFetchAttempt((attempt) => attempt + 1);
  };

  // "Register for more series" on the success screen. Bumping the key forces
  // React to unmount and remount the form, which resets every field to its
  // initial state in one move instead of clearing a dozen useStates by hand.
  const handleReset = () => {
    setResult(null);
    setFormKey((key) => key + 1);
    window.scrollTo({ top: 0 });
  };

  if (result) {
    return (
      <div className="register-page">
        <SuccessPanel summary={result} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="register-page">
      {workshop && (
        <>
          <p className="workshop-registration-message">
            You are registering for the workshop below. Complete your details to save your spot.
          </p>
          <WorkshopCard workshop={workshop} />
        </>
      )}

      {workshopNotFound && (
        <div className="workshop-missing" role="status">
          <h2 className="workshop-missing__title">Workshop not found</h2>
          <p className="workshop-missing__message">
            The workshop link you followed is no longer available. You can still register for one
            of our current event series below.
          </p>
        </div>
      )}

      {needsCatalog && catalog.status === 'loading' && (
        <div className="page-loading" role="status">
          <div className="page-loading__spinner" aria-hidden="true" />
          <p>Loading events...</p>
        </div>
      )}

      {needsCatalog && catalog.status === 'error' && (
        <div className="page-error" role="alert">
          <p className="page-error__message">We could not load the current event series.</p>
          <button type="button" className="btn btn-secondary" onClick={retryFetch}>
            Try again
          </button>
        </div>
      )}

      {needsCatalog && catalog.status === 'ready' && catalog.series.length === 0 && (
        <div className="page-error" role="status">
          <p className="page-error__message">
            No event series are currently open for registration. Please check back soon.
          </p>
          <button type="button" className="btn btn-secondary" onClick={retryFetch}>
            Try again
          </button>
        </div>
      )}

      {(workshop || (catalog.status === 'ready' && catalog.series.length > 0)) && (
        <RegistrationForm
          key={formKey}
          workshop={workshop}
          seriesList={catalog.status === 'ready' ? catalog.series : []}
          onSuccess={(summary) => {
            setResult(summary);
            window.scrollTo({ top: 0 });
          }}
        />
      )}
    </div>
  );
}
