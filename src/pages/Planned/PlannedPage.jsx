import moviesData from '../../data/movies.json';
import { useWatched } from '../../hooks/useWatched';
import { useLang } from '../../context/LanguageContext';
import MovieCard from '../../components/MovieCard/MovieCard';

const ALL_MOVIES = moviesData;

export default function PlannedPage() {
  const { plannedIds } = useWatched();
  const { lang } = useLang();

  const plannedMovies = ALL_MOVIES.filter(m => plannedIds.has(m.id));

  return (
    <main style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: '96px', minHeight: '100vh' }}>
      <div className="container">

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '8px' }}>
            {lang === 'ka' ? 'სანახავი სია' : 'Watch List'}
          </h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.9375rem' }}>
            {plannedMovies.length} {lang === 'ka' ? 'ფილმი' : 'movies'}
          </p>
        </div>

        {plannedMovies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)' }}>
            <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🕐</p>
            <p style={{ fontSize: '1rem' }}>
              {lang === 'ka' ? 'გეგმაში ფილმები არ გაქვს დამატებული' : 'No movies in your watch list yet'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '20px',
          }}>
            {plannedMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
