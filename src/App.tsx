import PartnerBanner from './components/PartnerBanner';
import RegistrationPage from './components/RegistrationPage';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <PartnerBanner />
      <SiteHeader />
      <main id="main-content" className="register-main">
        {/* Production renders no visible page title; keep the document
            heading outline intact for screen readers. */}
        <h1 className="sr-only">Register for InnovateUS workshops and event series</h1>
        <RegistrationPage />
      </main>
      <SiteFooter />
    </>
  );
}
