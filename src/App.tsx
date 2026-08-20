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
        <RegistrationPage />
      </main>
      <SiteFooter />
    </>
  );
}
