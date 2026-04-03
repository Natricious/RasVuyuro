import { useNavigate } from 'react-router-dom';
import COLLECTIONS, { COLLECTION_CATEGORIES } from '../../data/collections';
import { getMoviesByCollectionSlug } from '../../utils/movieUtils';
import { useLang } from '../../context/LanguageContext';

export default function CollectionsPage() {
  const navigate = useNavigate();
  const { lang } = useLang();

  return (
    <main style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: '96px', minHeight: '100vh' }}>
      <div className="container">

        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '8px' }}>
            {lang === 'ka' ? 'კოლექციები' : 'Collections'}
          </h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.9375rem' }}>
            {lang === 'ka' ? `${COLLECTIONS.length} კოლექცია` : `${COLLECTIONS.length} collections`}
          </p>
        </div>

        {COLLECTION_CATEGORIES.map(cat => {
          const catCollections = COLLECTIONS.filter(c => c.category === cat.id);
          return (
            <section key={cat.id} style={{ marginBottom: '52px' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--fg-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '20px',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}>
                {lang === 'ka' ? cat.title_ka : cat.title_en}
              </h2>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                {catCollections.map(col => {
                  const count = getMoviesByCollectionSlug(col.slug).length;
                  return (
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
                        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5)`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Background image */}
                      <img
                        src={col.imageUrl}
                        alt=""
                        aria-hidden="true"
                        style={{
                          position: 'absolute', inset: 0,
                          width: '100%', height: '100%',
                          objectFit: 'cover',
                        }}
                      />

                      {/* Dark gradient overlay */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)',
                      }} />

                      {/* Text overlay */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        padding: '16px',
                        textAlign: 'left',
                      }}>
                        <p style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          marginBottom: '4px',
                          lineHeight: 1.2,
                          fontFamily: 'var(--font-display)',
                        }}>
                          {col.icon} {lang === 'ka' ? col.title_ka : col.title_en}
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: col.color,
                        }}>
                          {count} {lang === 'ka' ? 'ფილმი' : 'movies'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

      </div>
    </main>
  );
}
