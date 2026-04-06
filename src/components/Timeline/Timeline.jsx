import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMovies } from '../../hooks/useMovies';
import { useLang } from '../../context/LanguageContext';
import './Timeline.css';

const ERAS = [
  { id: 'ancient',  ka: 'ძველი სამყარო', en: 'Ancient World' },
  { id: 'medieval', ka: 'შუასაუკუნეები', en: 'Medieval' },
  { id: 'modern',   ka: 'თანამედროვე',   en: 'Modern' },
];

const ERA_COLORS = {
  ancient:  '#FB923C',
  medieval: '#A78BFA',
  modern:   '#34D399',
};

export default function Timeline() {
  const [activeEra, setActiveEra] = useState('ancient');
  const { movies, loading } = useMovies();
  const { lang } = useLang();

  const eraMovies = movies
    .filter(m => m.timeline === activeEra)
    .sort((a, b) => (b.imdb_rating ?? 0) - (a.imdb_rating ?? 0))
    .slice(0, 6);

  return (
    <section className="timeline-section">
      <div className="container">

        {/* Header */}
        <div className="timeline-section__header">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div className="section-header__left">
              <div className="section-header__accent-bar" />
              <div>
                <p className="section-header__label">{lang === 'ka' ? 'ქრონოლოგია' : 'Timeline'}</p>
                <h2 className="section-header__title">{lang === 'ka' ? 'ისტორიული ქრონოლოგია' : 'Historical Timeline'}</h2>
                <p className="section-header__desc">{lang === 'ka' ? 'ფილმები ისტორიული პერიოდების მიხედვით' : 'Movies by historical era'}</p>
              </div>
            </div>
            <Link to="/timeline" className="section-header__view-all">
              {lang === 'ka' ? 'ყველა' : 'All'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          {/* Era filter buttons */}
          <div className="timeline-section__eras">
            {ERAS.map((era) => (
              <button
                key={era.id}
                className={`era-btn ${activeEra === era.id ? 'era-btn--active' : ''}`}
                onClick={() => setActiveEra(era.id)}
              >
                {lang === 'ka' ? era.ka : era.en}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: '32px', height: '32px',
              border: '3px solid rgba(232,197,71,0.15)',
              borderTopColor: 'var(--gold)',
              borderRadius: '50%',
              animation: 'spin 0.75s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div className="timeline-section__grid">
            {eraMovies.map((movie, i) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="timeline-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="timeline-card__image-wrap">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="timeline-card__image"
                    loading="lazy"
                  />
                  <div className="timeline-card__gradient" />
                  <div
                    className="timeline-card__era-dot"
                    style={{
                      background: ERA_COLORS[movie.timeline] ?? '#FB923C',
                      boxShadow: `0 0 8px ${ERA_COLORS[movie.timeline] ?? '#FB923C'}`,
                    }}
                  />
                </div>

                <div className="timeline-card__body">
                  <p className="timeline-card__title truncate">{movie.title}</p>
                  <div className="timeline-card__rating">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>{(movie.imdb_rating ?? 0).toFixed(1)}</span>
                  </div>
                  <p className="timeline-card__meta">{movie.year}</p>
                </div>
              </Link>
            ))}

            {eraMovies.length === 0 && (
              <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', padding: '40px 0' }}>
                {lang === 'ka' ? 'ამ პერიოდისთვის ფილმები ვერ მოიძებნა' : 'No movies found for this era'}
              </p>
            )}
          </div>
        )}

        <p className="timeline-section__range">{lang === 'ka' ? '3000 ძვ.წ. – დღეს' : '3000 BC – Today'}</p>

      </div>
    </section>
  );
}
