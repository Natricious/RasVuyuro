import { Link } from 'react-router-dom';
import { THEMATIC_COLLECTIONS } from '../../data/movies';
import './ThematicCollections.css';

export default function ThematicCollections() {
  return (
    <section className="thematic">
      <div className="container">

        <div className="section-header">
          <div className="section-header__left">
            <div className="section-header__accent-bar" />
            <div>
              <p className="section-header__label">კოლექციები</p>
              <h2 className="section-header__title">თემატური კოლექციები</h2>
              <p className="section-header__desc">ფილმები, დაჯგუფებული თემების მიხედვით</p>
            </div>
          </div>
          <Link to="/movies" className="section-header__view-all">
            ყველა
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <div className="thematic__grid">
          {THEMATIC_COLLECTIONS.map((col, i) => (
            <Link
              key={col.id}
              to="/movies"
              className={`theme-tile ${col.colSpan === 2 ? 'theme-tile--wide' : ''}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Background image */}
              <img src={col.imageUrl} alt="" className="theme-tile__bg" aria-hidden="true" />

              {/* Gradient overlay */}
              <div className="theme-tile__overlay" style={{ background: col.gradient }} />

              {/* Icon */}
              <div
                className="theme-tile__icon"
                style={{
                  border: `1px solid ${col.accentColor}40`,
                  background: `${col.accentColor}20`,
                }}
              >
                <span>{col.icon}</span>
              </div>

              {/* Text */}
              <div className="theme-tile__text">
                <p className="theme-tile__name">{col.name}</p>
                <p className="theme-tile__count" style={{ color: `${col.accentColor}99` }}>
                  {col.count} ფილმი
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
