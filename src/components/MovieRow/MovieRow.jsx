import { Link } from 'react-router-dom';
import MovieCard from '../MovieCard/MovieCard';
import './MovieRow.css';

export default function MovieRow({ label, title, description, movies, viewAllTo }) {
  return (
    <section className="section-row">
      <div className="container">
        <div className="section-header">
          <div className="section-header__left">
            <div className="section-header__accent-bar" />
            <div>
              <p className="section-header__label">{label}</p>
              <h2 className="section-header__title">{title}</h2>
              {description && (
                <p className="section-header__desc">{description}</p>
              )}
            </div>
          </div>
          {viewAllTo && (
            <Link to={viewAllTo} className="section-header__view-all">
              ყველა
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      <div className="scroll-row-wrap">
        <div className="scroll-row">
          {movies.map((movie, i) => (
            <div
              key={movie.id}
              style={{ animationDelay: `${i * 0.1}s` }}
              className="animate-fade-in"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
