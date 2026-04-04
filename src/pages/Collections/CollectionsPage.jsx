import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../../hooks/useCollections';
import { useMovies } from '../../hooks/useMovies';
import { getMoviesByCollectionSlug } from '../../utils/movieUtils';
import { useLang } from '../../context/LanguageContext';

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
    <div style={{
      width: '36px', height: '36px',
      border: '3px solid rgba(232,197,71,0.15)',
      borderTopColor: 'var(--gold)',
      borderRadius: '50%',
      animation: 'spin 0.75s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function CollectionsPage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { collections, loading: collectionsLoading } = useCollections();
  const { movies, loading: moviesLoading } = useMovies();

  const loading = collectionsLoading || moviesLoading

  // Pre-compute movie counts for all collections
  const countsBySlug = useMemo(() => {
    if (!movies.length || !collections.length) return {};
    const map = {};
    for (const col of collections) {
      map[col.slug] = getMoviesByCollectionSlug(movies, collections, col.slug).length;
    }
    return map;
  }, [movies, collections]);

  return (
    <main style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: '96px', minHeight: '100vh' }}>
      <div className="container">

        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '8px' }}>
            {lang === 'ka' ? 'კოლექციები' : 'Collections'}
          </h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.9375rem' }}>
            {loading ? '…' : (lang === 'ka' ? `${collections.length} კოლექცია` : `${collections.length} collections`)}
          </p>
        </div>

        {loading ? <Spinner /> : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {collections.map(col => (
              <button
                key={col.slug}
                onClick={() => navigate(`/collections/${col.slug}`)}
                style={{
                  position: 'relative',
                  width: '280px',
                  height: '180px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img
                  src={col.imageUrl}
                  alt=""
                  aria-hidden="true"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)',
                }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', textAlign: 'left' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px', lineHeight: 1.2, fontFamily: 'var(--font-display)' }}>
                    {col.icon} {lang === 'ka' ? col.title_ka : col.title_en}
                  </p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: col.color }}>
                    {countsBySlug[col.slug] ?? '…'} {lang === 'ka' ? 'ფილმი' : 'movies'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
