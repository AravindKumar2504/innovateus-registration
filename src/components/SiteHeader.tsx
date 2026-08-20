import { useEffect, useRef, useState } from 'react';
import './header.css';

const SITE = 'https://innovate-us.org';

interface NavItem {
  label: string;
  href?: string;
  items?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Ways to Learn',
    items: [
      { label: 'At-Your-Own-Pace Courses', href: `${SITE}/course` },
      { label: 'Workshops', href: `${SITE}/workshops` },
      { label: 'Coaching Programs', href: `${SITE}/google-certificates` },
    ],
  },
  { label: 'Featured Topics', href: `${SITE}/spring-series` },
  {
    label: 'News & Perspectives',
    items: [
      { label: 'Updates from InnovateUS', href: `${SITE}/comms` },
      { label: 'Reboot Democracy Blog', href: 'https://rebootdemocracy.ai' },
      { label: 'Observatory of Public Sector AI', href: `${SITE}/research` },
    ],
  },
  {
    label: 'About Us',
    items: [
      { label: 'Mission & Vision', href: `${SITE}/about` },
      { label: 'Our Team', href: `${SITE}/about?scrollTo=team` },
      { label: 'Faculty & Instructors', href: `${SITE}/about?scrollTo=faculty` },
      { label: 'Alumni', href: `${SITE}/about?scrollTo=alumni` },
      { label: 'Media Kit', href: `${SITE}/brandkit` },
    ],
  },
];

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      className={`site-nav__chevron${open ? ' site-nav__chevron--open' : ''}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close dropdowns on outside click or Escape.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const renderDropdown = (item: NavItem) => {
    const open = openMenu === item.label;
    return (
      <div key={item.label} className="site-nav__item" onMouseLeave={() => setOpenMenu(null)}>
        <button
          type="button"
          className="site-nav__trigger"
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setOpenMenu(open ? null : item.label)}
          onMouseEnter={() => setOpenMenu(item.label)}
        >
          {item.label}
          <Chevron open={open} />
        </button>
        {open && (
          <div className="site-nav__dropdown">
            {item.items!.map((child) => (
              <a key={child.label} className="site-nav__dropdown-link" href={child.href}>
                {child.label}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="site-header">
      <a className="site-header__logo-link" href={SITE} aria-label="InnovateUS home">
        <img
          className="site-header__logo"
          src="/images/wordmark_light.svg"
          alt="The InnovateUS logo, the word 'innovate' in dark blue lowercase letters next to '(us)'"
        />
      </a>

      <nav ref={navRef} className="site-nav" aria-label="Main navigation">
        <div className="site-nav__desktop">
          {NAV_ITEMS.map((item) =>
            item.items ? (
              renderDropdown(item)
            ) : (
              <a key={item.label} className="site-nav__link" href={item.href}>
                {item.label}
              </a>
            ),
          )}
          <a className="site-nav__cta" href={`${SITE}/mailinglist`}>
            Sign Up for Updates
          </a>
        </div>

        <button
          type="button"
          className="site-nav__hamburger"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <span className="sr-only">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>

        {mobileOpen && (
          <div id="mobile-menu" className="site-nav__mobile">
            {NAV_ITEMS.map((item) =>
              item.items ? (
                <div key={item.label} className="site-nav__mobile-group">
                  <span className="site-nav__mobile-heading">{item.label}</span>
                  {item.items.map((child) => (
                    <a key={child.label} className="site-nav__mobile-link" href={child.href}>
                      {child.label}
                    </a>
                  ))}
                </div>
              ) : (
                <a key={item.label} className="site-nav__mobile-link" href={item.href}>
                  {item.label}
                </a>
              ),
            )}
            <a className="site-nav__cta" href={`${SITE}/mailinglist`}>
              Sign Up for Updates
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
