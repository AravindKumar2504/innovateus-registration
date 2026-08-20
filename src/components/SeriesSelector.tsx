import { seriesIconUrl } from '../lib/catalog';
import type { CatalogSeries } from '../lib/types';

interface Props {
  seriesList: CatalogSeries[];
  selected: ReadonlySet<number>;
  onChange: (next: ReadonlySet<number>) => void;
  error?: string;
}

export default function SeriesSelector({ seriesList, selected, onChange, error }: Props) {
  const allSelected = seriesList.length > 0 && selected.size === seriesList.length;

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
    <fieldset
      className="series-section"
      id="series-selector"
      tabIndex={-1}
      aria-describedby={error ? 'series-selector-error' : 'series-selector-hint'}
    >
      <legend className="sr-only">Event series to register for (select at least one)</legend>
      <h3 className="series-section__title" aria-hidden="true">
        Selected Event Series
      </h3>
      <p className="series-section__subtitle">You are registering for event series.</p>

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
