import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../MovieCard/MovieCard';
import './MovieRow.css';

export default function MovieRow({ label, title, description, movies, viewAllTo }) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 1);
    // Tolerate rounding variance natively
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth + 1) < scrollWidth);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [movies]);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

        <div className="scroll-row-wrap">
          <button 
            className="scroll-btn scroll-btn--left" 
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            disabled={!canScrollLeft}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          
          <div 
            className="scroll-row" 
            ref={rowRef} 
            onScroll={handleScroll}
          >
            {movies.map((movie, i) => (
              <div
                key={movie.id}
                style={{ animationDelay: `${i * 0.05}s` }}
                className="animate-fade-in"
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          {movies.length > 0 && (
            <button 
              className="scroll-btn scroll-btn--right" 
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              disabled={!canScrollRight}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
