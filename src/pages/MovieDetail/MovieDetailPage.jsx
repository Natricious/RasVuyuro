import { useParams, useNavigate } from 'react-router-dom';
import { useMovies } from '../../hooks/useMovies';
import { useLang } from '../../context/LanguageContext';
import MovieCard from '../../components/MovieCard/MovieCard';

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <div style={{
      width: '36px', height: '36px',
      border: '3px solid rgba(232,197,71,0.15)',
      borderTopColor: 'var(--gold)',
      borderRadius: '50%',
      animation: 'spin 0.75s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const { movies, loading } = useMovies();

  if (loading) return <Spinner />;

  const movie = movies.find(m => m.id === Number(id));

  if (!movie) {
    return (
      <main style={{ textAlign: 'center', padding: '160px 24px', minHeight: '100vh' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', fontWeight: 700, color: 'var(--gold)' }}>404</p>
        <p style={{ color: 'var(--fg-muted)', marginTop: '12px' }}>ფილმი ვერ მოიძებნა</p>
        <button
          onClick={() => navigate(-1)}
          style={{ marginTop: '24px', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9375rem' }}
        >
          ← {lang === 'ka' ? 'უკან' : 'Back'}
        </button>
      </main>
    );
  }

  const similarMovies = (movie.similar_movies || [])
    .map(sid => movies.find(m => m.id === sid))
    .filter(Boolean);

  const TIMELINE_LABELS = {
    ancient:      lang === 'ka' ? 'ძველი სამყარო'    : 'Ancient World',
    medieval:     lang === 'ka' ? 'შუა საუკუნეები'   : 'Medieval',
    '19th_century': lang === 'ka' ? 'XIX საუკუნე'    : '19th Century',
    ww2:          lang === 'ka' ? 'მეორე მსოფლიო ომი' : 'World War II',
    modern:       lang === 'ka' ? 'თანამედროვე'       : 'Modern',
    future:       lang === 'ka' ? 'მომავალი'           : 'Future',
  };

  const TONE_LABELS = {
    serious:  lang === 'ka' ? 'სერიოზული'  : 'Serious',
    light:    lang === 'ka' ? 'მსუბუქი'    : 'Light',
    horror:   lang === 'ka' ? 'საშინელება' : 'Horror',
    comedy:   lang === 'ka' ? 'კომედია'    : 'Comedy',
    thriller: lang === 'ka' ? 'თრილერი'   : 'Thriller',
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', height: '480px', overflow: 'hidden' }}>
        <img
          src={movie.poster}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            filter: 'blur(24px) brightness(0.35)',
            transform: 'scale(1.1)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, var(--bg) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
        }} />

        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: 'calc(var(--navbar-height) + 16px)', left: '24px',
            color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
            padding: '8px 14px', cursor: 'pointer', fontSize: '0.875rem',
            backdropFilter: 'blur(8px)',
          }}
        >
          ← {lang === 'ka' ? 'უკან' : 'Back'}
        </button>

        <div style={{
          position: 'absolute', bottom: '-60px', left: '50%',
          transform: 'translateX(-50%)',
          width: '160px', height: '240px',
          borderRadius: '14px', overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          border: '2px solid rgba(255,255,255,0.12)',
        }}>
          <img src={movie.poster} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ paddingTop: '80px', paddingBottom: '96px' }}>
        <div className="container" style={{ maxWidth: '720px' }}>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '8px', lineHeight: 1.2 }}>
              {movie.title}
            </h1>
            {movie.title_ge && lang === 'ka' && (
              <p style={{ color: 'var(--fg-muted)', fontSize: '1rem', marginBottom: '12px' }}>{movie.title_ge}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
              <span style={{ color: 'var(--fg-muted)', fontSize: '0.9375rem' }}>{movie.year}</span>
              <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1rem' }}>⭐ {movie.imdb_rating}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              {(movie.genres || []).map(g => (
                <span key={g} style={{
                  padding: '4px 12px', borderRadius: '999px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--fg)', fontSize: '0.8125rem', fontWeight: 600,
                }}>
                  {g}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {movie.timeline && (
                <span style={{
                  padding: '3px 10px', borderRadius: '6px',
                  background: 'rgba(232,197,71,0.12)',
                  border: '1px solid rgba(232,197,71,0.3)',
                  color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 700,
                }}>
                  {TIMELINE_LABELS[movie.timeline] || movie.timeline}
                </span>
              )}
              {movie.tone && (
                <span style={{
                  padding: '3px 10px', borderRadius: '6px',
                  background: 'rgba(200,75,49,0.12)',
                  border: '1px solid rgba(200,75,49,0.3)',
                  color: 'var(--red)', fontSize: '0.75rem', fontWeight: 700,
                }}>
                  {TONE_LABELS[movie.tone] || movie.tone}
                </span>
              )}
            </div>
          </div>

          {movie.description && (
            <p style={{ color: 'var(--fg-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '28px', textAlign: 'center' }}>
              {movie.description}
            </p>
          )}

          {(movie.themes || []).length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--fg-muted)', marginBottom: '10px' }}>
                {lang === 'ka' ? 'თემები' : 'Themes'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {movie.themes.map(th => (
                  <span key={th} style={{
                    padding: '3px 9px', borderRadius: '6px',
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: 'var(--fg-muted)', fontSize: '0.75rem',
                  }}>
                    {th}
                  </span>
                ))}
              </div>
            </div>
          )}

          {similarMovies.length > 0 && (
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--fg-muted)', marginBottom: '14px' }}>
                {lang === 'ka' ? 'მსგავსი ფილმები' : 'Similar Movies'}
              </p>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                {similarMovies.map(sm => (
                  <MovieCard key={sm.id} movie={sm} width="120px" />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
