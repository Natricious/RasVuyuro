import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useWatched } from '../../hooks/useWatched';
import { useNavSearch } from '../../hooks/useMovies';
import { T } from '../../data/translations';
import './Navbar.css';

const NAV_LINK_KEYS = [
  { to: '/', key: 'home' },
  { to: '/movies', key: 'movies' },
  { to: '/collections', key: 'collections' },
  { to: '/watched', key: 'watched' },
  { to: '/planned', key: 'planned' },
  { to: '/wizard-test', key: 'wizardTest' },
];

// ── NavSearch ─────────────────────────────────────────────────────────────────
function NavSearch({ lang }) {
  const [query, setQuery]   = useState('');
  const [open,  setOpen]    = useState(false);
  const containerRef        = useRef(null);
  const inputRef            = useRef(null);
  const navigate            = useNavigate();
  const { results, loading } = useNavSearch(query, 6);

  // Close on click outside
  useEffect(() => {
    function onMouseDown(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // Open dropdown whenever there's a qualifying query
  useEffect(() => {
    setOpen(query.trim().length >= 3);
  }, [query]);

  function handleSelect(movie) {
    navigate(`/movie/${movie.id}`);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  }

  const showDropdown = open && query.trim().length >= 3;

  return (
    <div className="nav-search" ref={containerRef}>
      <div className="nav-search__input-wrap">
        {/* Search icon */}
        <svg className="nav-search__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="nav-search__input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 3 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={lang === 'ka' ? 'ფილმის ძებნა...' : 'Search movies...'}
          autoComplete="off"
        />
        {query && (
          <button
            className="nav-search__clear"
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}
            tabIndex={-1}
            aria-label="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="nav-search__dropdown">
          {loading ? (
            <p className="nav-search__status">
              {lang === 'ka' ? 'ძიება...' : 'Searching...'}
            </p>
          ) : results.length === 0 ? (
            <p className="nav-search__status">
              {lang === 'ka' ? 'შედეგი ვერ მოიძებნა' : 'No results found'}
            </p>
          ) : (
            results.map(movie => (
              <button
                key={movie.id}
                className="nav-search__result"
                onClick={() => handleSelect(movie)}
              >
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt=""
                    className="nav-search__poster"
                    loading="lazy"
                  />
                ) : (
                  <div className="nav-search__poster nav-search__poster--placeholder">🎬</div>
                )}
                <div className="nav-search__info">
                  <span className="nav-search__title">{movie.title}</span>
                  {(movie.title_ge) && (
                    <span className="nav-search__title-ge">{movie.title_ge}</span>
                  )}
                  <span className="nav-search__meta">
                    {movie.year ?? '—'}
                    {movie.imdb_rating ? ` · ⭐ ${movie.imdb_rating}` : ''}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
// ── UserMenu ──────────────────────────────────────────────────────────────────
function UserMenu({ user, signOut, lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onMouseDown(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const label = user.email?.split('@')[0] ?? 'User';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border)',
          borderRadius: 999, padding: '5px 12px 5px 8px',
          color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}
      >
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--gold)', color: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
          {label[0].toUpperCase()}
        </span>
        {label}
        <svg width="10" height="10" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, minWidth: 160, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 200,
        }}>
          <div style={{ padding: '8px 14px 6px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 1 }}>
              {lang === 'ka' ? 'შესული ხარ' : 'Signed in as'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
              {user.email}
            </div>
          </div>
          <button
            onClick={() => { signOut(); setOpen(false); }}
            style={{
              width: '100%', padding: '9px 14px', textAlign: 'left',
              background: 'transparent', border: 'none', color: '#ef4444',
              fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {lang === 'ka' ? 'გასვლა' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLang();
  const { user, signOut } = useAuth();
  const { watchedIds, plannedIds } = useWatched();
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
                  style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  {t[key]}
                  {key === 'watched' && watchedIds.size > 0 && (
                    <span style={{
                      background: 'var(--gold)',
                      color: 'var(--bg)',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 5px',
                      lineHeight: 1.4,
                    }}>
                      {watchedIds.size}
                    </span>
                  )}
                  {key === 'planned' && plannedIds.size > 0 && (
                    <span style={{
                      background: 'rgba(99,102,241,0.9)',
                      color: '#fff',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 5px',
                      lineHeight: 1.4,
                    }}>
                      {plannedIds.size}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: search */}
          <div className="navbar__search">
            <NavSearch lang={lang} />
          </div>

          {/* Right: controls */}
          <div className="navbar__right">
            <button className="navbar__lang-btn" aria-label="Language toggle" onClick={toggleLang}>
              {lang === 'ka' ? 'EN' : 'KA'}
            </button>
            <button className="navbar__theme-btn" aria-label="Toggle theme" onClick={toggleTheme}>
              {theme === 'dark' ? (
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            {user ? (
              <UserMenu user={user} signOut={signOut} lang={lang} />
            ) : (
              <Link
                to="/login"
                style={{
                  background: 'var(--gold)', color: '#000',
                  borderRadius: 999, padding: '5px 14px',
                  fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {lang === 'ka' ? 'შესვლა' : 'Sign In'}
              </Link>
            )}
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
