import { useParams, useNavigate } from 'react-router-dom';
import { useMovies } from '../../hooks/useMovies';
import { useWatched } from '../../hooks/useWatched';
import { useLang } from '../../context/LanguageContext';
import { T } from '../../data/translations';
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
  const { isWatched, toggleWatched, isPlanned, togglePlanned } = useWatched();

  if (loading) return <Spinner />;

  const movie = movies.find(m => m.id === Number(id));

  if (!movie) {
    return (
      <main style={{ textAlign: 'center', padding: '160px 24px', minHeight: '100vh' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', fontWeight: 700, color: 'var(--gold)' }}>404</p>
        <p style={{ color: 'var(--fg-muted)', marginTop: '12px' }}>{T[lang].movieNotFound}</p>
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

  const watched = isWatched(movie.id);
  const planned = isPlanned(movie.id);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', overflow: 'hidden' }}>
      <style>{`
        .cinematic-hero {
          position: relative;
          min-height: 80vh;
          display: flex;
          align-items: center;
          padding: 100px 4% 80px 4%;
        }

        .cinematic-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          object-fit: cover;
          width: 100%;
          height: 100%;
          filter: blur(24px) brightness(0.25);
          transform: scale(1.1);
        }

        .cinematic-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(90deg, var(--bg) 0%, rgba(15,15,15,0.8) 45%, transparent 100%),
                      linear-gradient(0deg, var(--bg) 0%, transparent 40%);
        }

        .cinematic-content {
          width: 100%;
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 64px;
          align-items: center;
        }

        .cinematic-poster img {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.8);
          border: 1px solid rgba(255,255,255,0.1);
          aspect-ratio: 2/3;
          object-fit: cover;
          display: block;
        }

        .cinematic-info {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .movie-title {
          font-family: var(--font-display);
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin: 0;
          text-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
        
        .movie-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px;
          font-size: 1.1rem;
          color: var(--fg-muted);
        }

        .action-buttons {
          display: flex;
          gap: 16px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-primary {
          background: var(--gold);
          color: #000;
        }
        .btn-primary:hover {
          filter: brightness(1.15);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(12px);
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }

        .btn-active {
          background: rgba(232,197,71,0.15);
          color: var(--gold);
          border: 1px solid var(--gold);
          backdrop-filter: blur(12px);
        }
        .btn-active:hover {
          background: rgba(232,197,71,0.25);
          transform: translateY(-2px);
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .tag-pill {
            padding: 8px 16px;
            border-radius: 999px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            font-size: 0.9rem;
            font-weight: 500;
            backdrop-filter: blur(4px);
        }

        .overview-section {
          padding: 64px 4% 0 4%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .similar-section {
          padding: 64px 4%;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .cinematic-content {
            grid-template-columns: 280px 1fr;
            gap: 40px;
          }
          .movie-title {
            font-size: 2.75rem;
          }
        }

        @media (max-width: 768px) {
          .cinematic-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 32px;
          }
          .cinematic-poster {
            max-width: 260px;
            margin: 0 auto;
          }
          .cinematic-overlay {
            background: linear-gradient(to top, var(--bg) 0%, rgba(15,15,15,0.85) 60%, transparent 100%);
          }
          .movie-meta, .tags-container, .action-buttons {
            justify-content: center;
          }
        }
      `}</style>

      {/* ── Cinematic Hero ── */}
      <section className="cinematic-hero">
        <img className="cinematic-bg" src={movie.poster} alt="" aria-hidden="true" />
        <div className="cinematic-overlay" />
        
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                padding: '8px 16px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
                backdropFilter: 'blur(12px)', display: 'inline-flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
            >
              <span>←</span> {lang === 'ka' ? 'უკან' : 'Back'}
            </button>
          </div>

          <div className="cinematic-content">
            <div className="cinematic-poster">
              <img src={movie.poster} alt={movie.title} />
            </div>

            <div className="cinematic-info">
              <div>
                <h1 className="movie-title">{movie.title}</h1>
                {movie.title_ge && lang === 'ka' && (
                  <p style={{ color: 'var(--fg-muted)', fontSize: '1.25rem', marginTop: '12px', fontWeight: 500 }}>{movie.title_ge}</p>
                )}
              </div>

              <div className="movie-meta">
                <span style={{ fontWeight: 600, color: 'white' }}>{movie.year}</span>
                <span>•</span>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>⭐ {movie.imdb_rating}</span>
                {movie.timeline && (
                  <>
                    <span>•</span>
                    <span>{TIMELINE_LABELS[movie.timeline] || movie.timeline}</span>
                  </>
                )}
              </div>

              <div className="tags-container">
                {(movie.genres || []).map(g => (
                  <span key={g} className="tag-pill">{g}</span>
                ))}
                {movie.tone && (
                  <span className="tag-pill" style={{ borderColor: 'rgba(200,75,49,0.4)', color: 'var(--red)', background: 'rgba(200,75,49,0.05)' }}>
                    {TONE_LABELS[movie.tone] || movie.tone}
                  </span>
                )}
              </div>

              <div className="action-buttons">
                <button className="btn btn-primary">
                  ▶ {lang === 'ka' ? 'ყურება' : 'Watch'}
                </button>
                <button 
                  className={`btn ${planned ? 'btn-active' : 'btn-secondary'}`}
                  onClick={() => togglePlanned(movie.id)}
                >
                  {planned ? '✓' : '+'} {lang === 'ka' ? 'ვაპირებ ყურებას' : 'Planned'}
                </button>
                <button 
                  className={`btn ${watched ? 'btn-active' : 'btn-secondary'}`}
                  onClick={() => toggleWatched(movie.id)}
                >
                  {watched ? '✓' : '♥'} {lang === 'ka' ? 'ნანახი მაქვს' : 'Watched'}
                </button>
              </div>
              
              {(movie.themes || []).length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--fg-muted)', marginBottom: '12px', fontWeight: 600 }}>
                    {lang === 'ka' ? 'თემები' : 'Themes'}
                  </p>
                  <div className="tags-container">
                    {movie.themes.map(th => (
                      <span key={th} className="tag-pill" style={{ background: 'transparent', opacity: 0.7, padding: '4px 12px', fontSize: '0.8rem' }}>{th}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Overview Description ── */}
      <section className="overview-section">
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px', color: 'white' }}>
          {lang === 'ka' ? 'აღწერა' : 'Overview'}
        </h2>
        <div style={{ maxWidth: '900px' }}>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', margin: 0, letterSpacing: '0.015em' }}>
            {(lang === 'ka' ? (movie.description_ka || movie.description) : movie.description) || (lang === 'ka' ? 'ფილმის აღწერა არ არის ხელმისაწვდომი.' : 'Movie description is not available.')}
          </p>
        </div>
      </section>

      {/* ── Similar Movies ── */}
      {similarMovies.length > 0 && (
        <section className="similar-section">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '32px', color: 'white' }}>
            {lang === 'ka' ? 'მსგავსი ფილმები' : 'Similar Movies'}
          </h2>
          <div style={{ 
            display: 'grid', 
            gridAutoFlow: 'column', 
            gridAutoColumns: 'max-content',
            gap: '20px', 
            overflowX: 'auto', 
            paddingBottom: '32px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.2) transparent'
          }}>
            {similarMovies.map(sm => (
              <div key={sm.id} style={{ width: '180px' }}>
                 <MovieCard movie={sm} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
