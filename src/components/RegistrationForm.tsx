import { useState } from 'react';
import { seriesIconUrl } from '../lib/catalog';
import {
  COUNTRY_OPTIONS,
  EMAIL_PATTERN,
  GOV_LEVEL_OPTIONS,
  GOV_LEVEL_QUESTION,
  GOV_ORG_OPTIONS,
  GOV_ORG_QUESTION,
  NEWSLETTER_HINT,
  NEWSLETTER_LABEL,
  US_STATE_CODES,
  isGovYes,
} from '../lib/options';
import { submitRegistration } from '../lib/submit';
import type { CatalogSeries, RegistrationRequest, Workshop } from '../lib/types';
import SeriesSelector from './SeriesSelector';

/** What the success screen needs to know about a completed registration. */
export interface SuccessSummary {
  firstName: string;
  newsletter: boolean;
  items: { key: string; title: string; icon: string | null }[];
}

interface Props {
  /** Present when registering for a single workshop (?workshop=<id>). */
  workshop: Workshop | null;
  /** Available series (series mode only). */
  seriesList: CatalogSeries[];
  onSuccess: (summary: SuccessSummary) => void;
}

type FieldErrors = Partial<Record<string, string>>;

const FIELD_IDS: Record<string, string> = {
  email: 'reg-email',
  first_name: 'reg-first-name',
  last_name: 'reg-last-name',
  country: 'reg-country',
  state: 'reg-state',
  gov_org: 'reg-gov-org',
  gov_level: 'reg-gov-level',
  newsletter: 'reg-newsletter',
};

function RequiredMark() {
  return (
    <>
      <span className="required" aria-hidden="true">
        {' '}
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

export default function RegistrationForm({ workshop, seriesList, onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [govOrg, setGovOrg] = useState('');
  const [govLevel, setGovLevel] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<ReadonlySet<number>>(new Set());
  const [website, setWebsite] = useState(''); // honeypot

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showState = country === 'United States';
  const showGovLevel = govOrg !== '' && isGovYes(govOrg);

  const validate = (): FieldErrors => {
    const found: FieldErrors = {};
    if (!EMAIL_PATTERN.test(email.trim())) {
      found.email = 'Please enter a valid email address.';
    }
    if (firstName.trim() === '') {
      found.first_name = 'Please enter your first name.';
    }
    if (lastName.trim() === '') {
      found.last_name = 'Please enter your last name.';
    }
    if (country === '') {
      found.country = 'Please select a country.';
    }
    if (showState && stateCode === '') {
      found.state = 'Please select a state.';
    }
    if (govOrg === '') {
      found.gov_org = 'Please select an answer.';
    }
    if (showGovLevel && govLevel === '') {
      found.gov_level = 'Please select a level of government.';
    }
    if (!workshop && selectedSeries.size === 0) {
      found.series = 'Please select at least one series to continue.';
    }
    return found;
  };

  const focusFirstError = (found: FieldErrors) => {
    const firstKey = Object.keys(FIELD_IDS).find((key) => found[key]);
    const id = firstKey ? FIELD_IDS[firstKey] : found.series ? 'series-selector' : null;
    if (id) {
      const element = document.getElementById(id);
      element?.focus();
      element?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setFormError(null);

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setFormError('Please correct the highlighted fields and try again.');
      focusFirstError(found);
      return;
    }
    setErrors({});

    const chosenSeries = seriesList.filter((series) => selectedSeries.has(series.id));
    const payload: RegistrationRequest = {
      email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      country,
      ...(showState ? { state: stateCode } : {}),
      gov_org: govOrg,
      ...(showGovLevel && govLevel !== '' ? { gov_level: govLevel } : {}),
      ...(workshop
        ? { workshop_id: workshop.id }
        : { series: chosenSeries.map((series) => series.title) }),
      newsletter,
      website,
    };

    setSubmitting(true);
    const response = await submitRegistration(payload);
    setSubmitting(false);

    if (response.ok) {
      onSuccess({
        firstName: firstName.trim(),
        newsletter,
        items: workshop
          ? [{ key: workshop.id, title: workshop.title, icon: null }]
          : chosenSeries.map((series) => ({
              key: String(series.id),
              title: series.title,
              icon: seriesIconUrl(series, 40),
            })),
      });
      return;
    }

    if (response.fieldErrors) {
      setErrors(response.fieldErrors);
      focusFirstError(response.fieldErrors);
    }
    setFormError(response.error ?? 'Something went wrong. Please try again.');
  };

  const errorProps = (key: string) => ({
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${FIELD_IDS[key]}-error` : undefined,
  });

  const fieldError = (key: string) =>
    errors[key] ? (
      <p className="field-error" id={`${FIELD_IDS[key]}-error`}>
        {errors[key]}
      </p>
    ) : null;

  return (
    <div className="registration-card">
      <div className="registration-card__header">
        <h2 className="registration-card__title eyebrow">Registration Details</h2>
        <p className="form-description">
          Fields marked with an asterisk (<span aria-hidden="true">*</span>
          <span className="sr-only">star</span>) are required.
        </p>
      </div>

      <div aria-live="polite" className="sr-only">
        {submitting ? 'Submitting your registration…' : ''}
      </div>
      {formError && (
        <div className="alert alert-error" role="alert">
          <p>{formError}</p>
        </div>
      )}

      <form className="registration-form" noValidate onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor={FIELD_IDS.email}>
            Email
            <RequiredMark />
          </label>
          <input
            id={FIELD_IDS.email}
            type="email"
            placeholder="your.email@example.com"
            autoComplete="email"
            aria-required="true"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            {...errorProps('email')}
          />
          {fieldError('email')}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor={FIELD_IDS.first_name}>
              First Name
              <RequiredMark />
            </label>
            <input
              id={FIELD_IDS.first_name}
              type="text"
              placeholder="John"
              autoComplete="given-name"
              aria-required="true"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              {...errorProps('first_name')}
            />
            {fieldError('first_name')}
          </div>
          <div className="form-group">
            <label htmlFor={FIELD_IDS.last_name}>
              Last Name
              <RequiredMark />
            </label>
            <input
              id={FIELD_IDS.last_name}
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
              aria-required="true"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              {...errorProps('last_name')}
            />
            {fieldError('last_name')}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor={FIELD_IDS.country}>
              Country
              <RequiredMark />
            </label>
            <select
              id={FIELD_IDS.country}
              className="form-select"
              aria-required="true"
              value={country}
              onChange={(event) => {
                setCountry(event.target.value);
                if (event.target.value !== 'United States') setStateCode('');
              }}
              {...errorProps('country')}
            >
              <option value="">Select country (required)</option>
              {COUNTRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldError('country')}
          </div>

          {showState && (
            <div className="form-group">
              <label htmlFor={FIELD_IDS.state}>
                State/Province
                <RequiredMark />
              </label>
              <select
                id={FIELD_IDS.state}
                className="form-select"
                autoComplete="address-level1"
                aria-required="true"
                value={stateCode}
                onChange={(event) => setStateCode(event.target.value)}
                {...errorProps('state')}
              >
                <option value="">Select state (required)</option>
                {US_STATE_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              {fieldError('state')}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor={FIELD_IDS.gov_org}>
            {GOV_ORG_QUESTION}
            <RequiredMark />
          </label>
          <select
            id={FIELD_IDS.gov_org}
            className="form-select"
            aria-required="true"
            value={govOrg}
            onChange={(event) => {
              setGovOrg(event.target.value);
              if (!isGovYes(event.target.value)) setGovLevel('');
            }}
            {...errorProps('gov_org')}
          >
            <option value="">Select</option>
            {GOV_ORG_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldError('gov_org')}
        </div>

        {showGovLevel && (
          <div className="form-group">
            <label htmlFor={FIELD_IDS.gov_level}>
              {GOV_LEVEL_QUESTION}
              <RequiredMark />
            </label>
            <select
              id={FIELD_IDS.gov_level}
              className="form-select"
              aria-required="true"
              value={govLevel}
              onChange={(event) => setGovLevel(event.target.value)}
              {...errorProps('gov_level')}
            >
              <option value="">Select</option>
              {GOV_LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldError('gov_level')}
          </div>
        )}

        <div className="form-group newsletter-group">
          <div className="checkbox-group">
            <input
              id={FIELD_IDS.newsletter}
              type="checkbox"
              checked={newsletter}
              aria-describedby="reg-newsletter-hint"
              onChange={(event) => setNewsletter(event.target.checked)}
            />
            <label htmlFor={FIELD_IDS.newsletter}>{NEWSLETTER_LABEL}</label>
          </div>
          <p className="newsletter-hint" id="reg-newsletter-hint">
            {NEWSLETTER_HINT}
          </p>
        </div>

        {!workshop && (
          <SeriesSelector
            seriesList={seriesList}
            selected={selectedSeries}
            onChange={(next) => {
              setSelectedSeries(next);
              // A non-empty selection resolves the "select at least one
              // series" error immediately, not on the next submit.
              if (next.size > 0 && errors.series) {
                setErrors(({ series: _series, ...rest }) => rest);
              }
            }}
            error={errors.series}
          />
        )}

        {/* Honeypot: hidden from real visitors; bots that fill it are
            silently discarded server-side. */}
        <div className="honeypot-field">
          <label htmlFor="reg-website">Website (leave blank)</label>
          <input
            id="reg-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Registering…' : 'Register'}
          </button>
          <p className="registration-help-text">
            Having trouble registering? Contact us at{' '}
            <a href="mailto:hello@innovate-us.org">hello [at] innovate-us.org</a>
          </p>
        </div>
      </form>
    </div>
  );
}
