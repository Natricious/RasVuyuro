import { Link } from 'react-router-dom';
import MovieCard from '../MovieCard/MovieCard';
import './NewMovies.css';
import { useLang } from '../../context/LanguageContext';
import { T } from '../../data/translations';

export default function NewMovies({ movies = [] }) {
  const { lang } = useLang();
  return (
    <section className="new-movies">
      <div className="container">

        <div className="section-header">
          <div className="section-header__left">
            <div className="section-header__accent-bar" />
            <div>
              <p className="section-header__label">{T[lang].newMoviesLabel}</p>
              <h2 className="section-header__title">{T[lang].newMoviesTitle}</h2>
              <p className="section-header__desc">{T[lang].newMoviesDesc}</p>
            </div>
          </div>
          <Link to="/movies" className="section-header__view-all">
            {T[lang].newMoviesViewAll}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <div className="new-grid">
          {movies.map((movie, i) => (
            <div
              key={movie.id}
              style={{ animationDelay: `${i * 0.08}s` }}
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
