import { seriesIconUrl } from '../lib/catalog';
import type { CatalogSeries } from '../lib/types';

/*
 * The "Selected Event Series" checkbox list. This component doesn't own the
 * selection; the form does. It just renders the list and reports changes up,
 * which keeps all submit logic in one place.
 */
interface Props {
  seriesList: CatalogSeries[];
  selected: ReadonlySet<number>;
  onChange: (next: ReadonlySet<number>) => void;
  error?: string;
}

export default function SeriesSelector({ seriesList, selected, onChange, error }: Props) {
  const allSelected = seriesList.length > 0 && selected.size === seriesList.length;

  // State updates must be immutable for React to notice them, so we copy the
  // Set instead of mutating the one in state.
  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(next);
  };

  const toggleAll = () => {
    onChange(allSelected ? new Set() : new Set(seriesList.map((series) => series.id)));
  };

  return (
    // A fieldset+legend groups the checkboxes for screen readers. tabIndex={-1}
    // lets the form move focus here when "no series selected" is the first
    // validation error, since there's no single input to focus.
    <fieldset
      className="series-section"
      id="series-selector"
      tabIndex={-1}
      aria-describedby={error ? 'series-selector-error' : 'series-selector-hint'}
    >
      <legend className="sr-only">Event series to register for (select at least one)</legend>
      {/* The visible heading is decorative for assistive tech; the legend
          above carries the accessible name for the group. */}
      <h3 className="series-section__title" aria-hidden="true">
        Selected Event Series
      </h3>
      <p className="series-section__subtitle">
        You are registering for {selected.size > 0 ? `${selected.size} ` : ''}event series.
      </p>

      <div className="select-all-container">
        <button type="button" className="btn btn-secondary" onClick={toggleAll}>
          {allSelected ? 'Deselect all series' : 'Select all series'}
        </button>
      </div>

      {error ? (
        <p className="field-error" id="series-selector-error">
          {error}
        </p>
      ) : (
        <p className="selection-count" id="series-selector-hint">
          {selected.size === 0
            ? 'Select at least one series to continue.'
            : `${selected.size} of ${seriesList.length} series selected.`}
        </p>
      )}

      <ul className="series-list">
        {seriesList.map((series) => {
          const icon = seriesIconUrl(series);
          return (
            <li key={series.id} className="series-list-item">
              <label className="series-checkbox-label">
                {/* aria-label gives each checkbox its series title as an
                    accessible name (the production site announces these all
                    as "on", which we deliberately improve on). Empty alt on
                    the icon: it's decorative next to the visible title. */}
                <input
                  className="series-checkbox-input"
                  type="checkbox"
                  aria-label={series.title}
                  checked={selected.has(series.id)}
                  onChange={() => toggle(series.id)}
                />
                {icon && <img className="series-icon" src={icon} alt="" loading="lazy" />}
                <span className="series-list-title">{series.title}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
