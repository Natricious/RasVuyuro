import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFilteredMovies } from '../../hooks/useMovies';
import MovieCard from '../../components/MovieCard/MovieCard';
import { useLang } from '../../context/LanguageContext';

// Derive column count from a container pixel width.
// Grid is: repeat(auto-fill, minmax(160px, 1fr)) with gap 20px
// n = floor((containerWidth + gap) / (minWidth + gap))
function colsFromWidth(containerWidth) {
  return Math.max(1, Math.floor((containerWidth + 20) / 180));
}

// Initial estimate before the DOM is measured (avoids a wrong first fetch)
function initialCols() {
  const cw = Math.min(window.innerWidth, 1280) - (window.innerWidth <= 640 ? 32 : 64);
  return colsFromWidth(cw);
}

const ALL_TIMELINES = ['ancient', 'medieval', '19th_century', 'ww2', 'modern', 'future'];

const TIMELINE_LABELS = {
  ka: {
    ancient:        'ანტიკური',
    medieval:       'შუა საუკუნეები',
    '19th_century': 'XIX საუკუნე',
    ww2:            'მეორე მსოფლიო ომი',
    modern:         'თანამედროვე',
    future:         'მომავალი',
  },
  en: {
    ancient:        'Ancient',
    medieval:       'Medieval',
    '19th_century': '19th Century',
    ww2:            'World War II',
    modern:         'Modern',
    future:         'Future',
  },
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

const GENRES = [
  'Action','Adventure','Animation','Biography','Comedy','Crime',
  'Documentary','Drama','Family','Fantasy','History','Horror',
  'Music','Mystery','Romance','Sci-Fi','Thriller','War','Western',
];

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

export default function MoviesPage() {
  const { lang } = useLang();

  const [search,   setSearch]   = useState('');
  const [genre,    setGenre]    = useState('');
  const [timeline, setTimeline] = useState('');
  const [sort,     setSort]     = useState('rating');
  const [page,     setPage]     = useState(0);

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

  // Smallest multiple of cols that is >= 40
  const pageSize = Math.ceil(40 / cols) * cols;

  // Fetch current page
  const { movies: pageMovies, total, loading } = useFilteredMovies({
    query: search, genre, timeline, sort, page, pageSize,
  });

  // ── Load-more accumulation ────────────────────────────────────────────────
  // prevMovies holds all movies from pages 0..page-1.
  // allMovies is always derived synchronously: no effects, no race conditions.
  const [prevMovies, setPrevMovies] = useState([]);

  const allMovies = useMemo(() => {
    if (page === 0 || prevMovies.length === 0) return pageMovies;
    const ids = new Set(prevMovies.map(m => m.id));
    return [...prevMovies, ...pageMovies.filter(m => !ids.has(m.id))];
  }, [prevMovies, pageMovies, page]);

  // Reset on cols change (breakpoint crossed)
  const prevCols = useRef(cols);
  useEffect(() => {
    if (prevCols.current === cols) return;
    prevCols.current = cols;
    setPrevMovies([]);
    setPage(0);
  }, [cols]);

  const resetPage = useCallback(() => {
    setPrevMovies([]);
    setPage(0);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPrevMovies(allMovies);
    setPage(p => p + 1);
  }, [allMovies]);

  const hasFilters = search || genre || timeline;
  const hasMore    = total !== null && allMovies.length > 0 && allMovies.length < total;

  const selectStyle = {
    background: 'var(--bg-card)',
    color: 'var(--fg)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <main style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: '96px', minHeight: '100vh' }}>
      <div className="container" ref={containerRef}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '6px' }}>
            {lang === 'ka' ? 'ყველა ფილმი' : 'All Movies'}
          </h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.9375rem' }}>
            {loading && page === 0 ? '…' : (
              <>
                {total !== null ? total : allMovies.length}
                {' '}{lang === 'ka' ? 'ფილმი' : 'movies'}
                {hasFilters ? (lang === 'ka' ? ' ნაპოვნია' : ' found') : ''}
              </>
            )}
          </p>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px', alignItems: 'center' }}>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            placeholder={lang === 'ka' ? 'ფილმის ძებნა (მინ. 3 სიმბოლო)...' : 'Search movies (min. 3 chars)...'}
            style={{ ...selectStyle, flex: '1 1 200px', minWidth: '180px' }}
          />

          <select value={genre} onChange={e => { setGenre(e.target.value); resetPage(); }} style={selectStyle}>
            <option value="">{lang === 'ka' ? 'ყველა ჟანრი' : 'All genres'}</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select value={timeline} onChange={e => { setTimeline(e.target.value); resetPage(); }} style={selectStyle}>
            <option value="">{lang === 'ka' ? 'ყველა პერიოდი' : 'All periods'}</option>
            {ALL_TIMELINES.map(tl => (
              <option key={tl} value={tl}>{TIMELINE_LABELS[lang][tl]}</option>
            ))}
          </select>

          <select value={sort} onChange={e => { setSort(e.target.value); resetPage(); }} style={selectStyle}>
            {SORT_OPTIONS[lang].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setGenre(''); setTimeline(''); resetPage(); }}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'var(--fg-muted)', padding: '8px 14px', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              {lang === 'ka' ? '✕ გასუფთავება' : '✕ Clear'}
            </button>
          )}
        </div>

        {/* Grid */}
        {allMovies.length === 0 ? (
          loading ? (
            <Spinner />
          ) : hasFilters ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎬</p>
              <p style={{ fontSize: '1rem' }}>
                {lang === 'ka' ? 'ფილმი ვერ მოიძებნა' : 'No movies found'}
              </p>
            </div>
          ) : (
            <Spinner />
          )
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
              {allMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                {loading ? (
                  <Spinner />
                ) : (
                  <button
                    onClick={handleLoadMore}
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
                    {` (${total - allMovies.length} ${lang === 'ka' ? 'დარჩა' : 'remaining'})`}
                  </button>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}
