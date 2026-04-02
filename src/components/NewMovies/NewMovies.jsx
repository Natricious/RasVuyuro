import { Link } from 'react-router-dom';
import { NEW_MOVIES } from '../../data/movies';
import MovieCard from '../MovieCard/MovieCard';
import './NewMovies.css';

export default function NewMovies() {
  return (
    <section className="new-movies">
      <div className="container">

        <div className="section-header">
          <div className="section-header__left">
            <div className="section-header__accent-bar" />
            <div>
              <p className="section-header__label">განახლებები</p>
              <h2 className="section-header__title">ახალი ფილმები</h2>
              <p className="section-header__desc">ბოლოს დამატებული</p>
            </div>
          </div>
          <Link to="/movies" className="section-header__view-all">
            ყველა
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <div className="new-grid">
          {NEW_MOVIES.map((movie, i) => (
            <div
              key={movie.id}
              style={{ animationDelay: `${i * 0.08}s` }}
              className="animate-fade-in"
            >
              <MovieCard movie={movie} isNew />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
