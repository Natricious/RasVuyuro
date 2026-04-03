import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LanguageContext';
import { T } from '../../data/translations';
import './Navbar.css';

const NAV_LINK_KEYS = [
  { to: '/', key: 'home' },
  { to: '/movies', key: 'movies' },
  { to: '/collections', key: 'collections' },
  { to: '/timeline', key: 'timeline' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLang();
  const t = T[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">

          {/* Left: logo + desktop nav */}
          <div className="navbar__left">
            <Link to="/" className="navbar__logo">
              <span className="navbar__logo-icon">🎬</span>
              CineGuide
            </Link>
            <nav className="navbar__nav" aria-label="Main navigation">
              {NAV_LINK_KEYS.map(({ to, key }) => (
                <Link
                  key={to}
                  to={to}
                  className={`navbar__link ${location.pathname === to ? 'navbar__link--active' : ''}`}
                >
                  {t[key]}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: controls */}
          <div className="navbar__right">
            <button className="navbar__lang-btn" aria-label="Language toggle" onClick={toggleLang}>
              {lang === 'ka' ? 'EN' : 'KA'}
            </button>
            <button className="navbar__theme-btn" aria-label="Toggle theme" onClick={toggleTheme}>
              {theme === 'dark' ? (
                /* Sun — shown in dark mode to switch to light */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                /* Moon — shown in light mode to switch to dark */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <Link to="/movies" className="navbar__cta">{t.viewAll}</Link>
            <button
              className="navbar__hamburger"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={menuOpen ? 'open' : ''} />
              <span className={menuOpen ? 'open' : ''} />
              <span className={menuOpen ? 'open' : ''} />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile menu overlay */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="mobile-menu__nav">
          {NAV_LINK_KEYS.map(({ to, key }, i) => (
            <Link
              key={to}
              to={to}
              className="mobile-menu__link"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {t[key]}
            </Link>
          ))}
          <Link to="/movies" className="mobile-menu__cta" style={{ animationDelay: '0.24s' }}>
            {t.viewAll}
          </Link>
        </nav>
      </div>
    </>
  );
}
