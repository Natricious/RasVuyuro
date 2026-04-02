import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TIMELINE_MOVIES } from '../../data/movies';
import './Timeline.css';

const ERAS = [
  { id: 'ancient', label: 'ძველი სამყარო', active: true },
  { id: 'medieval', label: 'შუასაუკუნეები', active: false },
  { id: 'modern', label: 'თანამედროვე', active: false },
];

export default function Timeline() {
  const [activeEra, setActiveEra] = useState('ancient');

  return (
    <section className="timeline-section">
      <div className="container">

        {/* Header */}
        <div className="timeline-section__header">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div className="section-header__left">
              <div className="section-header__accent-bar" />
              <div>
                <p className="section-header__label">ქრონოლოგია</p>
                <h2 className="section-header__title">ისტორიული ქრონოლოგია</h2>
                <p className="section-header__desc">ფილმები ისტორიული პერიოდების მიხედვით</p>
              </div>
            </div>
            <Link to="/timeline" className="section-header__view-all">
              ყველა
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
                {era.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div className="timeline-section__grid">
          {TIMELINE_MOVIES.map((movie, i) => (
            <Link
              key={movie.id}
              to="/timeline"
              className="timeline-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="timeline-card__image-wrap">
                <img src={movie.imageUrl} alt={movie.title} className="timeline-card__image" loading="lazy" />
                <div className="timeline-card__gradient" />
                {/* Era dot */}
                <div
                  className="timeline-card__era-dot"
                  style={{
                    background: movie.eraColor,
                    boxShadow: `0 0 8px ${movie.eraColor}`,
                  }}
                />
              </div>

              <div className="timeline-card__body">
                <p className="timeline-card__title truncate">{movie.title}</p>
                <div className="timeline-card__rating">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>{movie.rating.toFixed(1)}</span>
                </div>
                <p className="timeline-card__meta">{movie.year} · {movie.era}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer range */}
        <p className="timeline-section__range">3000 BC – 500 AD</p>

      </div>
    </section>
  );
}
