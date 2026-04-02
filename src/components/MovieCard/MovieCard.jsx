import { Link } from 'react-router-dom';
import './MovieCard.css';

export default function MovieCard({ movie, isNew = false }) {
  return (
    <Link to={`/movies`} className="poster-card group">
      <div className="poster-card__image-wrap">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="poster-card__image"
          loading="lazy"
        />

        {/* Rating badge — top right */}
        <div className="poster-card__rating">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--gold)">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {movie.rating.toFixed(1)}
        </div>

        {/* New badge — top left */}
        {isNew && (
          <div className="poster-card__new-badge">ახალი</div>
        )}

        {/* Heart / watchlist — top left (trending) */}
        {!isNew && (
          <button className="poster-card__heart" aria-label="Add to favourites">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Hover overlay with button */}
        <div className="poster-card__hover-overlay">
          <button className="poster-card__view-btn">
            ნახვა
          </button>
        </div>
      </div>

      <div className="poster-card__info">
        <p className="poster-card__title truncate">{movie.title}</p>
        <p className="poster-card__meta truncate">{movie.meta}</p>
      </div>
    </Link>
  );
}
