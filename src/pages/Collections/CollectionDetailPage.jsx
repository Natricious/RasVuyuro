import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollectionMovies } from '../../hooks/useMovies';
import { useCollections } from '../../hooks/useCollections';
import { useLang } from '../../context/LanguageContext';
import MovieCard from '../../components/MovieCard/MovieCard';

// Grid is: repeat(auto-fill, minmax(160px, 1fr)) with gap 20px
function colsFromWidth(containerWidth) {
  return Math.max(1, Math.floor((containerWidth + 20) / 180));
}

function initialCols() {
  const cw = Math.min(window.innerWidth, 1280) - (window.innerWidth <= 640 ? 32 : 64);
  return colsFromWidth(cw);
}

const GENRES = [
  'Action','Adventure','Animation','Biography','Comedy','Crime',
  'Documentary','Drama','Family','Fantasy','History','Horror',
  'Music','Mystery','Romance','Sci-Fi','Thriller','War','Western',
];

const YEAR_RANGES = {
  ka: [
    { value: 'all',     label: 'ყველა წელი' },
    { value: 'classic', label: '1990-მდე' },
    { value: '90s',     label: '1990–1999' },
    { value: '2000s',   label: '2000–2009' },
    { value: '2010s',   label: '2010–2019' },
    { value: '2020s',   label: '2020+' },
  ],
  en: [
    { value: 'all',     label: 'All years' },
    { value: 'classic', label: 'Before 1990' },
    { value: '90s',     label: '1990–1999' },
    { value: '2000s',   label: '2000–2009' },
    { value: '2010s',   label: '2010–2019' },
    { value: '2020s',   label: '2020+' },
  ],
};

const SORT_OPTIONS = {
  ka: [
    { value: 'rating',    label: 'რეიტინგი' },
    { value: 'year_desc', label: 'ახალი პირველი' },
    { value: 'year_asc',  label: 'ძველი პირველი' },
    { value: 'title',     label: 'სათაური A–Z' },
  ],
  en: [
    { value: 'rating',    label: 'Top Rated' },
    { value: 'year_desc', label: 'Newest First' },
    { value: 'year_asc',  label: 'Oldest First' },
    { value: 'title',     label: 'Title A–Z' },
  ],
};

const RATING_OPTIONS = [
  { value: 0,   label: 'All' },
  { value: 7,   label: '7+' },
  { value: 7.5, label: '7.5+' },
  { value: 8,   label: '8+' },
  { value: 8.5, label: '8.5+' },
];

const mobileStyles = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 768px) {
    .collection-filters { flex-direction: column !important; align-items: stretch !important; }
    .collection-filters select,
    .collection-filters button { width: 100% !important; }
    .collection-header { flex-direction: column !important; gap: 12px !important; }
  }
`;

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
    <div style={{
      width: '36px', height: '36px',
      border: '3px solid rgba(232,197,71,0.15)',
      borderTopColor: 'var(--gold)',
      borderRadius: '50%',
      animation: 'spin 0.75s linear infinite',
    }} />
  </div>
);

export default function CollectionDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang }  = useLang();

  const { collections, loading: collectionsLoading } = useCollections();

  // Filter + sort state
  const [sortBy,         setSortBy]         = useState('rating');
  const [minRating,      setMinRating]      = useState(0);
  const [selectedGenre,  setSelectedGenre]  = useState('all');
  const [yearRange,      setYearRange]      = useState('all');

  // Pagination: accumulate pages
  const [page,     setPage]     = useState(0);
  const [allMovies, setAllMovies] = useState([]);

  // ── Responsive page-size ──────────────────────────────────────────────────
  const containerRef = useRef(null);
  const [cols, setCols] = useState(initialCols);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setCols(colsFromWidth(el.offsetWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const prevCols = useRef(cols);
  useEffect(() => {
    if (prevCols.current === cols) return;
    prevCols.current = cols;
    setAllMovies([]);
    setPage(0);
  }, [cols]);

  const pageSize = Math.ceil(20 / cols) * cols;

  const collection = collections.find(c => c.slug === slug);

  const filters = { sortBy, minRating, selectedGenre, yearRange };

  // Fetch current page
  const { movies: pageMovies, total, loading: moviesLoading } = useCollectionMovies(
    collection,
    filters,
    page,
    pageSize,
  );

  // Reset accumulated list when filters/sort change
  const resetFilters = useCallback((applyChange) => {
    setAllMovies([]);
    setPage(0);
    applyChange();
  }, []);

  // Append new page results to accumulated list
  useEffect(() => {
    if (moviesLoading || pageMovies.length === 0) return;
    if (page === 0) {
      setAllMovies(pageMovies);
    } else {
      setAllMovies(prev => {
        const ids = new Set(prev.map(m => m.id));
        const newMovies = pageMovies.filter(m => !ids.has(m.id));
        return newMovies.length > 0 ? [...prev, ...newMovies] : prev;
      });
    }
  }, [pageMovies, page, moviesLoading]);

  const displayed = allMovies;
  const hasMore = total !== null && displayed.length < total;
  const hasFilters = minRating > 0 || selectedGenre !== 'all' || yearRange !== 'all';

  const selectStyle = {
    background: 'var(--bg-card)',
    color: 'var(--fg)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '7px 11px',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    outline: 'none',
  };

  const loading = collectionsLoading || (moviesLoading && page === 0);

  if (!collectionsLoading && !collection) {
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

  return (
    <main style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: '96px', minHeight: '100vh' }}>
      <style>{mobileStyles}</style>
      <div className="container" ref={containerRef}>

        {/* Back button */}
        <button
          onClick={() => navigate('/collections')}
          style={{ color: 'var(--fg-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
        >
          ← {lang === 'ka' ? 'ყველა კოლექცია' : 'All Collections'}
        </button>

        {/* Header */}
        {collection && (
          <div className="collection-header" style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
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
                {loading ? '…' : (
                  <>
                    {displayed.length}
                    {total !== null && displayed.length < total ? ` / ${total}` : (total !== null ? ` ${lang === 'ka' ? 'სულ' : 'total'}` : '')}
                    {' '}{lang === 'ka' ? 'ფილმი' : 'movies'}
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {loading ? <Spinner /> : (
          <>
            {/* Filters + Sort bar */}
            <div className="collection-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px', alignItems: 'center' }}>
              <select
                value={selectedGenre}
                onChange={e => resetFilters(() => setSelectedGenre(e.target.value))}
                style={selectStyle}
              >
                <option value="all">{lang === 'ka' ? 'ყველა ჟანრი' : 'All genres'}</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>

              <select
                value={minRating}
                onChange={e => resetFilters(() => setMinRating(Number(e.target.value)))}
                style={selectStyle}
              >
                {RATING_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value === 0 ? (lang === 'ka' ? 'ნებისმიერი რეიტინგი' : 'Any rating') : `⭐ ${opt.label}`}
                  </option>
                ))}
              </select>

              <select
                value={yearRange}
                onChange={e => resetFilters(() => setYearRange(e.target.value))}
                style={selectStyle}
              >
                {YEAR_RANGES[lang].map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={e => resetFilters(() => setSortBy(e.target.value))}
                style={selectStyle}
              >
                {SORT_OPTIONS[lang].map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {hasFilters && (
                <button
                  onClick={() => resetFilters(() => { setSortBy('rating'); setMinRating(0); setSelectedGenre('all'); setYearRange('all'); })}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'var(--fg-muted)', padding: '7px 12px', fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  {lang === 'ka' ? '✕ გასუფთავება' : '✕ Clear'}
                </button>
              )}
            </div>

            {/* Movie grid */}
            {displayed.length === 0 && !moviesLoading ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)' }}>
                <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🎬</p>
                <p>
                  {hasFilters
                    ? (lang === 'ka' ? 'ფილტრები ვერ პოულობს შედეგებს' : 'No movies match your filters')
                    : (lang === 'ka' ? 'ამ კოლექციაში ფილმები ვერ მოიძებნა' : 'No movies in this collection')}
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
                  {displayed.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                    {moviesLoading ? (
                      <Spinner />
                    ) : (
                      <button
                        onClick={() => setPage(p => p + 1)}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(232,197,71,0.4)',
                          borderRadius: '10px',
                          color: 'var(--gold)',
                          padding: '12px 32px',
                          fontSize: '0.9375rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        {lang === 'ka' ? 'მეტის ჩვენება' : 'Load more'}
                        {total !== null ? ` (${total - displayed.length} ${lang === 'ka' ? 'დარჩა' : 'remaining'})` : ''}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>
    </main>
  );
}
