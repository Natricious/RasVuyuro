import { useParams, useNavigate } from 'react-router-dom';
import COLLECTIONS from '../../data/collections';
import { getMoviesByCollectionSlug } from '../../utils/movieUtils';
import { useLang } from '../../context/LanguageContext';
import MovieCard from '../../components/MovieCard/MovieCard';

export default function CollectionDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();

  const collection = COLLECTIONS.find(c => c.slug === slug);

  if (!collection) {
    return (
      <main style={{ textAlign: 'center', padding: '160px 24px', minHeight: '100vh' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', fontWeight: 700, color: 'var(--gold)' }}>404</p>
        <p style={{ color: 'var(--fg-muted)', marginTop: '12px' }}>
          {lang === 'ka' ? 'კოლექცია ვერ მოიძებნა' : 'Collection not found'}
        </p>
        <button onClick={() => navigate('/collections')} style={{ marginTop: '24px', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9375rem' }}>
          ← {lang === 'ka' ? 'კოლექციებზე დაბრუნება' : 'Back to Collections'}
        </button>
      </main>
    );
  }

  const movies = getMoviesByCollectionSlug(slug);

  return (
    <main style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: '96px', minHeight: '100vh' }}>
      <div className="container">

        {/* Back button */}
        <button
          onClick={() => navigate('/collections')}
          style={{ color: 'var(--fg-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
        >
          ← {lang === 'ka' ? 'ყველა კოლექცია' : 'All Collections'}
        </button>

        {/* Header */}
        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '18px',
            background: `${collection.color}22`,
            border: `1px solid ${collection.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', flexShrink: 0,
          }}>
            {collection.icon}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '6px' }}>
              {lang === 'ka' ? collection.title_ka : collection.title_en}
            </h1>
            <p style={{ color: 'var(--fg-muted)', fontSize: '0.9375rem', marginBottom: '8px' }}>
              {lang === 'ka' ? collection.description_ka : collection.description_en}
            </p>
            <p style={{ color: collection.color, fontSize: '0.8125rem', fontWeight: 600 }}>
              {movies.length} {lang === 'ka' ? 'ფილმი' : 'movies'}
            </p>
          </div>
        </div>

        {/* Movie grid or empty state */}
        {movies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🎬</p>
            <p>ამ კოლექციაში ფილმები ვერ მოიძებნა</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '20px',
          }}>
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
