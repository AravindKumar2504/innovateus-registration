import type { Workshop } from '../lib/types';

// Series icons are hosted on the Burnes Center's Directus, same as production.
const ASSET_BASE = 'https://directus.theburnescenter.org/assets';

/**
 * Details card shown above the form in ?workshop=<id> mode. Layout follows
 * the production workshop card: navy series header, serif title, and a
 * two-column definition list for the logistics.
 */
export default function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const details: [string, string][] = [
    ['Date:', workshop.date],
    ['Time:', workshop.time],
    ['Instructor:', workshop.instructor],
    ['Format:', workshop.format],
    ['Cost:', workshop.cost],
  ];

  return (
    <div className="workshop-card">
      <div className="workshop-card__series-header">
        {workshop.seriesImage && (
          <img
            className="workshop-card__series-icon"
            src={`${ASSET_BASE}/${workshop.seriesImage}?width=80`}
            alt=""
          />
        )}
        <div className="workshop-card__series-text">
          <p className="workshop-card__series-label">Part of the series</p>
          <p className="workshop-card__series-title eyebrow">{workshop.series}</p>
        </div>
      </div>
      <div className="workshop-card__content">
        <p className="workshop-card__label eyebrow">Workshop</p>
        <h2 className="workshop-card__title">{workshop.title}</h2>
        <dl className="workshop-card__details">
          {details.map(([label, value]) => (
            <div key={label} className="workshop-card__detail">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
