import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatched } from '../../hooks/useWatched';
import { useLang } from '../../context/LanguageContext';

export default function MovieCard({ movie, width = '160px', showWatchedButton = true }) {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { isWatched, toggleWatched, isPlanned, togglePlanned } = useWatched();
  const [hovered, setHovered]               = useState(false);
  const [watchBtnHovered, setWatchBtnHovered]     = useState(false);
  const [planBtnHovered, setPlanBtnHovered]       = useState(false);
  const [watchedBtnHovered, setWatchedBtnHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const poster = movie.poster || movie.posterUrl;
  const rating = movie.imdb_rating ?? movie.rating;
  const year   = movie.year ?? movie.meta;
  const watched = isWatched(movie.id);
  const planned = isPlanned(movie.id);
  const posterHeight = `calc(${width} * 1.5)`;

  const handleWatch   = (e) => { e.stopPropagation(); navigate(`/movie/${movie.id}`); };
  const handleWatched = (e) => { e.stopPropagation(); toggleWatched(movie.id); };
  const handlePlanned = (e) => { e.stopPropagation(); togglePlanned(movie.id); };

  // ── Card outline ─────────────────────────────────────────────────────────────
  const outline = watched
    ? '2px solid rgba(16,185,129,0.7)'
    : planned
      ? '2px solid rgba(99,102,241,0.65)'
      : 'none';

  // ── Strip button style (shared base for top + bottom) ──────────────────────
  // Dark frosted glass when idle; accent fill when active; lighter dark on hover
  const stripBase = {
    position: 'absolute',
    left: 0, right: 0,
    width: '100%',
    zIndex: 2,
    padding: '6px 6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '10.5px',
    fontWeight: 600,
    letterSpacing: '0.02em',
    textAlign: 'center',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  // Plan strip colors
  const planBg = planned
    ? (planBtnHovered ? 'rgba(79,70,229,0.97)' : 'rgba(67,56,202,0.9)')
    : (planBtnHovered ? 'rgba(30,24,40,0.95)'  : 'rgba(10,8,14,0.82)');
  const planColor  = planned ? '#e0deff' : (planBtnHovered ? 'rgba(255,255,255,0.95)' : 'rgba(180,174,168,0.85)');
  const planBorder = `border-bottom: 1px solid ${planned ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`;

  // Watched strip colors
  const watchedBg = watched
    ? (watchedBtnHovered ? 'rgba(5,150,105,0.97)' : 'rgba(6,140,100,0.9)')
    : (watchedBtnHovered ? 'rgba(30,24,40,0.95)'  : 'rgba(10,8,14,0.82)');
  const watchedColor  = watched ? '#ccfce8' : (watchedBtnHovered ? 'rgba(255,255,255,0.95)' : 'rgba(180,174,168,0.85)');
  const watchedBorder = `border-top: 1px solid ${watched ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`;

  // ── Center Watch button ───────────────────────────────────────────────────
  const watchBg     = watchBtnHovered ? '#f0d050' : 'rgba(232,197,71,0.93)';
  const watchShadow = watchBtnHovered
    ? '0 6px 28px rgba(232,197,71,0.55), 0 2px 8px rgba(0,0,0,0.4)'
    : '0 4px 18px rgba(232,197,71,0.38), 0 2px 6px rgba(0,0,0,0.35)';
  const watchScale  = watchBtnHovered ? 'scale(1.07)' : 'scale(1)';

  const planVisible    = planned || hovered;
  const watchedVisible = watched || hovered;

  return (
    <div
      style={{
        width,
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        cursor: 'pointer',
        outline,
        transition: 'outline 0.2s',
        flexShrink: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      {/* ── Poster ── */}
      <div style={{ width: '100%', height: posterHeight, position: 'relative', background: 'var(--bg-card)', overflow: 'hidden' }}>

        {poster && !imgError ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', padding: '8px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg-muted)', textAlign: 'center', lineHeight: 1.3 }}>
              {movie.title}
            </p>
          </div>
        )}

        {/* Cinematic gradient — fades in on hover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.25) 45%, transparent 70%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.22s ease',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* TOP — Plan strip */}
        {showWatchedButton && (
          <button
            onClick={handlePlanned}
            onMouseEnter={() => setPlanBtnHovered(true)}
            onMouseLeave={() => setPlanBtnHovered(false)}
            style={{
              ...stripBase,
              top: 0,
              background: planBg,
              color: planColor,
              borderBottom: planned ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)',
              transform: planVisible ? 'translateY(0)' : 'translateY(-100%)',
              transition: 'transform 0.22s ease, background 0.15s, color 0.15s',
            }}
          >
            {planned
              ? (lang === 'ka' ? '🕐 გეგმაშია' : '🕐 Planned')
              : (lang === 'ka' ? '+ გეგმაში დამატება' : '+ Plan to watch')}
          </button>
        )}

        {/* CENTER — Primary Watch button */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: hovered ? 'auto' : 'none',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.22s ease',
          zIndex: 1,
        }}>
          <button
            onClick={handleWatch}
            onMouseEnter={() => setWatchBtnHovered(true)}
            onMouseLeave={() => setWatchBtnHovered(false)}
            style={{
              background: watchBg,
              color: '#0a0709',
              border: 'none',
              borderRadius: '50px',
              padding: '8px 20px',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.01em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: watchShadow,
              transform: watchScale,
              transition: 'background 0.15s, box-shadow 0.15s, transform 0.15s',
            }}
          >
            ▶ {lang === 'ka' ? 'ყურება' : 'Watch'}
          </button>
        </div>

        {/* BOTTOM — Watched strip */}
        {showWatchedButton && (
          <button
            onClick={handleWatched}
            onMouseEnter={() => setWatchedBtnHovered(true)}
            onMouseLeave={() => setWatchedBtnHovered(false)}
            style={{
              ...stripBase,
              bottom: 0,
              background: watchedBg,
              color: watchedColor,
              borderTop: watched ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.06)',
              transform: watchedVisible ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.22s ease, background 0.15s, color 0.15s',
            }}
          >
            {watched
              ? (lang === 'ka' ? '✓ ნანახია' : '✓ Watched')
              : (watchedBtnHovered
                  ? (lang === 'ka' ? '✓ ნანახი მაქვს' : '✓ Mark as watched')
                  : (lang === 'ka' ? 'ნანახი მაქვს' : 'Mark as watched'))}
          </button>
        )}
      </div>

      {/* ── Info below poster ── */}
      <div style={{ padding: '6px 4px 4px', background: 'var(--bg-card)' }}>
        <p style={{
          fontSize: '13px', fontWeight: 500, color: 'var(--fg)',
          lineHeight: 1.3, marginBottom: '2px',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {movie.title}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
          {year}{rating != null ? ` ⭐ ${rating}` : ''}
        </p>
      </div>
    </div>
  );
}
