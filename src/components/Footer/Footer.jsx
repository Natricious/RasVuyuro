import { Link } from 'react-router-dom';
import './Footer.css';

const NAV_LINKS = [
  { to: '/', label: 'მთავარი' },
  { to: '/movies', label: 'ფილმები' },
  { to: '/collections', label: 'კოლექციები' },
  { to: '/watched', label: 'ნანახი' },
  { to: '/planned', label: 'გეგმა' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">

          {/* Left: logo + nav */}
          <div className="footer__left">
            <Link to="/" className="footer__logo">
              <span>🎬</span>
              CineGuide
            </Link>
            <nav className="footer__nav" aria-label="Footer navigation">
              {NAV_LINKS.map(({ to, label }, i) => (
                <span key={to} className="footer__nav-item">
                  {i > 0 && <span className="footer__dot">·</span>}
                  <Link to={to} className="footer__link">{label}</Link>
                </span>
              ))}
            </nav>
          </div>

          {/* Right: socials + copyright */}
          <div className="footer__right">
            <div className="footer__socials">
              <a href="#" className="footer__social-btn" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a href="#" className="footer__social-btn" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
            <p className="footer__copy">
              © 2025 CineGuide ·{' '}
              <a href="#" className="footer__policy-link">Privacy</a>
              {' · '}
              <a href="#" className="footer__policy-link">Terms</a>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
