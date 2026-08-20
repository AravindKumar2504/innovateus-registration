import { useState } from 'react';
import './header.css';

const PARTNERS = [
  { label: 'AI for Impact', href: 'https://burnes.northeastern.edu/ai-for-impact-coop/' },
  { label: 'The Burnes Center for Social Change', href: 'https://www.theburnescenter.org' },
  { label: 'Reboot Democracy', href: 'https://rebootdemocracy.ai' },
  { label: 'The GovLab', href: 'https://thegovlab.org' },
];

function ExternalIcon() {
  return (
    <svg
      className="partner-banner__icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/**
 * Blue partner strip above the header, as on production. Desktop shows the
 * links in a row; under 1150px it collapses into a tap-to-expand toggle
 * (which layout is visible is decided purely in CSS via media queries).
 */
export default function PartnerBanner() {
  const [open, setOpen] = useState(false);

  const links = PARTNERS.map((partner) => (
    <a
      key={partner.label}
      className="partner-banner__link"
      href={partner.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ExternalIcon />
      {partner.label}
    </a>
  ));

  return (
    <div className="partner-banner">
      <div className="partner-banner__desktop">
        <span className="partner-banner__label">This is a partner project of :</span>
        {links}
      </div>
      <div className="partner-banner__mobile">
        <button
          type="button"
          className="partner-banner__toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="partner-banner__label">This is a partner project of :</span>
          <svg
            className={`partner-banner__chevron${open ? ' partner-banner__chevron--open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {open && <div className="partner-banner__dropdown">{links}</div>}
      </div>
    </div>
  );
}
