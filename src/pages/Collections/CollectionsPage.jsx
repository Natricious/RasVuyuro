import { Link } from 'react-router-dom';
import { useCollections } from '../../hooks/useCollections';
import { useCollectionCounts } from '../../hooks/useMovies';
import { useLang } from '../../context/LanguageContext';

// Skeleton card shown while collections are loading
function SkeletonCard() {
  return (
    <div style={{
      height: '180px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.05)',
      animation: 'skeletonPulse 1.4s ease-in-out infinite',
    }} />
  );
}

export default function CollectionsPage() {
  const { lang } = useLang();
  const { collections, loading } = useCollections();
  const counts = useCollectionCounts(collections);

  return (
    <main style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: '96px', minHeight: '100vh' }}>
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
      <div className="container">

        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '8px' }}>
            {lang === 'ka' ? 'კოლექციები' : 'Collections'}
          </h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.9375rem' }}>
            {loading ? '…' : (lang === 'ka' ? `${collections.length} კოლექცია` : `${collections.length} collections`)}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : collections.map(col => (
              <Link
                key={col.slug}
                to={`/collections/${col.slug}`}
                style={{
                  position: 'relative',
                  height: '180px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'block',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
                {col.imageUrl && (
                  <img
                    src={col.imageUrl}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                {/* Fallback background when no image */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: col.imageUrl
                    ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)'
                    : `linear-gradient(135deg, ${col.color}33 0%, rgba(10,7,9,0.9) 100%)`,
                }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', textAlign: 'left' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px', lineHeight: 1.2, fontFamily: 'var(--font-display)' }}>
                    {col.icon} {lang === 'ka' ? col.title_ka : col.title_en}
                  </p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: col.color }}>
                    {counts[col.slug] != null
                      ? `${counts[col.slug]} ${lang === 'ka' ? 'ფილმი' : 'movies'}`
                      : '…'}
                  </p>
                </div>
              </Link>
            ))
          }
        </div>

      </div>
    </main>
  );
}
