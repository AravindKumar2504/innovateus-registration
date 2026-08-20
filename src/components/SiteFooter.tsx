import { useState } from 'react';
import './footer.css';

/*
 * Replica of the production footer: the mailing-list banner on the navy
 * gradient, then logo / links / socials / subscribe columns, then the
 * Creative Commons line.
 */
const SITE = 'https://innovate-us.org';

const FOOTER_LINKS = [
  { label: 'Contact Us', href: `${SITE}/contact-us` },
  { label: 'Privacy Policy', href: `${SITE}/privacy-policy` },
  { label: 'Accessibility Policy', href: `${SITE}/accessibility-policy` },
];

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function BlueskyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
    </svg>
  );
}

export default function SiteFooter() {
  const [subscribeNote, setSubscribeNote] = useState(false);

  // In this prototype, newsletter opt-in is captured by the registration
  // form above; the footer form points visitors there instead of silently
  // dropping their email.
  const onSubscribe = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setSubscribeNote(true);
  };

  return (
    <footer className="site-footer">
      <div className="site-footer__mailing">
        <h2 className="site-footer__mailing-heading">
          <span className="site-footer__mailing-white">
            Want to be a part of our community of innovators?
          </span>{' '}
          <span className="site-footer__mailing-italic">We&rsquo;d love to keep in touch.</span>
        </h2>
        <a className="site-footer__pill" href={`${SITE}/mailinglist`}>
          Join Our Mailing List
        </a>
      </div>

      <div className="site-footer__inner">
        <div className="site-footer__column">
          <a className="site-footer__logo-link" href={SITE} aria-label="InnovateUS home">
            <img
              className="site-footer__logo"
              src="/images/wordmark_dark.svg"
              alt="The InnovateUS logo, the word 'innovate' in white lowercase letters next to '(us)'"
            />
          </a>
        </div>

        <nav className="site-footer__column" aria-label="Footer links">
          <ul className="site-footer__links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <a className="site-footer__link" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__column">
          <span className="site-footer__follow-label">Follow us on</span>
          <div className="site-footer__social">
            <a
              className="site-footer__social-link"
              href="https://www.linkedin.com/company/innovateus-burnes-center"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on LinkedIn (opens in new window)"
            >
              <LinkedInIcon />
            </a>
            <a
              className="site-footer__social-link"
              href="https://bsky.app/profile/innovateus.bsky.social"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Bluesky (opens in new window)"
            >
              <BlueskyIcon />
            </a>
          </div>
        </div>

        <div className="site-footer__column site-footer__column--subscribe">
          <h2 className="site-footer__subscribe-heading">
            <span className="site-footer__subscribe-italic">Subscribe</span>
            <span className="site-footer__subscribe-white">for Updates</span>
          </h2>
          <form className="site-footer__form" onSubmit={onSubscribe}>
            <label className="sr-only" htmlFor="footer-email">
              Email address for newsletter subscription
            </label>
            <input
              id="footer-email"
              className="site-footer__input"
              type="email"
              placeholder="Your Email"
              autoComplete="email"
            />
            <button className="site-footer__pill" type="submit">
              Subscribe
            </button>
          </form>
          {subscribeNote && (
            <p className="site-footer__form-note" role="status">
              Use the newsletter checkbox in the registration form above, or subscribe on{' '}
              <a className="site-footer__link" href={`${SITE}/mailinglist`}>
                innovate-us.org
              </a>
              .
            </p>
          )}
        </div>
      </div>

      <p className="site-footer__license">
        This work is licensed under a{' '}
        <a
          className="site-footer__link"
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Creative Commons Attribution-ShareAlike 4.0 International License
        </a>
        .
      </p>
    </footer>
  );
}
