import { useMovies } from '../../hooks/useMovies';
import { useWatched } from '../../hooks/useWatched';
import { useLang } from '../../context/LanguageContext';
import { T } from '../../data/translations';
import MovieCard from '../../components/MovieCard/MovieCard';

export default function PlannedPage() {
  const { movies, loading } = useMovies();
  const { plannedIds } = useWatched();
  const { lang } = useLang();

  const plannedMovies = movies.filter(m => plannedIds.has(m.id));

  return (
    <main style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: '96px', minHeight: '100vh' }}>
      <div className="container">

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '8px' }}>
            {T[lang].plannedPageTitle}
          </h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.9375rem' }}>
            {loading ? '…' : `${plannedMovies.length} ${T[lang].plannedCount}`}
          </p>
        </div>

        {!loading && plannedMovies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)' }}>
            <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🕐</p>
            <p style={{ fontSize: '1rem' }}>
              {T[lang].plannedEmpty}
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
