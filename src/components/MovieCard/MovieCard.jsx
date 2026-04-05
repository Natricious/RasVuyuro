import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatched } from '../../hooks/useWatched';
import { useLang } from '../../context/LanguageContext';
import './MovieCard.css';

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { isWatched, toggleWatched, isPlanned, togglePlanned } = useWatched();
  const [imgError, setImgError] = useState(false);

  // Fallbacks for data structures
  const poster = movie.poster || movie.posterUrl;
  const rating = movie.imdb_rating ?? movie.rating;
  const year   = movie.year ?? movie.meta;
  
  const watched = isWatched(movie.id);
  const planned = isPlanned(movie.id);

  const handleWatch   = (e) => { e.stopPropagation(); e.preventDefault(); navigate(`/movie/${movie.id}`); };
  const handleWatched = (e) => { e.stopPropagation(); e.preventDefault(); toggleWatched(movie.id); };
  const handlePlanned = (e) => { e.stopPropagation(); e.preventDefault(); togglePlanned(movie.id); };

  const plannedBtnText = lang === 'ka' ? 'ვაპირებ ყურებას' : 'Plan to watch';
  const watchedBtnText = lang === 'ka' ? 'ნანახი მაქვს' : 'Mark as watched';
  const watchBtnText = lang === 'ka' ? 'ყურება' : 'Watch';

  return (
    <div className="movie-card" onClick={handleWatch}>
      <div className="movie-card__poster">
        {poster && !imgError ? (
          <img
            src={poster}
            alt={movie.title}
            className="movie-card__img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="movie-card__placeholder">
            <span>{movie.title}</span>
          </div>
        )}
        
        <div 
          className="movie-card__overlay" 
          style={{ background: 'rgba(0, 0, 0, 0.65)' }}
        >
          <button 
            type="button"
            className={`movie-card__btn movie-card__btn--glass movie-card__btn--planned ${planned ? 'active' : ''}`}
            onClick={handlePlanned}
            style={{ position: 'absolute', top: '30%', left: '12px', right: '12px', width: 'auto', transform: 'translateY(-50%)' }}
          >
            {plannedBtnText}
          </button>
          
          <button 
            type="button"
            className="movie-card__btn movie-card__btn--primary"
            onClick={handleWatch}
            style={{ position: 'absolute', top: '50%', left: '12px', right: '12px', width: 'auto', transform: 'translateY(-50%)' }}
          >
            {watchBtnText}
          </button>
          
          <button 
            type="button"
            className={`movie-card__btn movie-card__btn--glass movie-card__btn--watched ${watched ? 'active' : ''}`}
            onClick={handleWatched}
            style={{ position: 'absolute', top: '70%', left: '12px', right: '12px', width: 'auto', transform: 'translateY(-50%)' }}
          >
            {watchedBtnText}
          </button>
        </div>
      </div>

      <div className="movie-card__content">
        <h3 className="movie-card__title" title={movie.title}>
          {movie.title}
        </h3>
        
        <div className="movie-card__meta">
          <span>{year}</span>
          {rating != null && (
            <>
              <span className="movie-card__dot" />
              <span className="movie-card__rating">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {rating}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
