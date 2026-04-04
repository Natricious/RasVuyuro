import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovies } from '../../hooks/useMovies';
import { useCollections } from '../../hooks/useCollections';
import { getMoviesByCollectionSlug } from '../../utils/movieUtils';
import { useLang } from '../../context/LanguageContext';
import MovieCard from '../../components/MovieCard/MovieCard';

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

export default function CollectionDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();

  const { movies: allMovies, loading: moviesLoading } = useMovies();
  const { collections, loading: collectionsLoading } = useCollections();

  // STEP 1 — filter state
  const [sortBy, setSortBy] = useState('rating');
  const [minRating, setMinRating] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [yearRange, setYearRange] = useState('all');

  const loading = moviesLoading || collectionsLoading;

  const collection = collections.find(c => c.slug === slug);

  // STEP 2 — filtered movies for this collection
  const movies = useMemo(
    () => getMoviesByCollectionSlug(allMovies, collections, slug),
    [allMovies, collections, slug]
  );

  // STEP 3 — derive available genres from this collection's movies
  const allGenres = useMemo(() => {
    const genres = new Set();
    movies.forEach(m => m.genres?.forEach(g => genres.add(g)));
    return ['all', ...Array.from(genres).sort()];
  }, [movies]);

  // STEP 4 — apply filters and sort
  const filteredMovies = useMemo(() => {
    return movies
      .filter(m => {
        const ratingOk = (m.imdb_rating ?? 0) >= minRating;
        const genreOk = selectedGenre === 'all' || m.genres?.includes(selectedGenre);
        const yearOk = yearRange === 'all'
          || (yearRange === 'classic' && m.year < 1990)
          || (yearRange === '90s'     && m.year >= 1990 && m.year < 2000)
          || (yearRange === '2000s'   && m.year >= 2000 && m.year < 2010)
          || (yearRange === '2010s'   && m.year >= 2010 && m.year < 2020)
          || (yearRange === '2020s'   && m.year >= 2020);
        return ratingOk && genreOk && yearOk;
      })
      .sort((a, b) => {
        if (sortBy === 'rating')    return (b.imdb_rating ?? 0) - (a.imdb_rating ?? 0);
        if (sortBy === 'year_desc') return (b.year ?? 0) - (a.year ?? 0);
        if (sortBy === 'year_asc')  return (a.year ?? 0) - (b.year ?? 0);
        if (sortBy === 'title')     return a.title.localeCompare(b.title);
        return 0;
      });
  }, [movies, sortBy, minRating, selectedGenre, yearRange]);

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

  if (!loading && !collection) {
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
      <div className="container">

        {/* Back button */}
        <button
          onClick={() => navigate('/collections')}
          style={{ color: 'var(--fg-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
        >
          ← {lang === 'ka' ? 'ყველა კოლექცია' : 'All Collections'}
        </button>

        {/* Header */}
        {collection && (
          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
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
                    {filteredMovies.length}
                    {hasFilters ? ` / ${movies.length}` : ''}
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
            {movies.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px', alignItems: 'center' }}>
                <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)} style={selectStyle}>
                  {allGenres.map(g => (
                    <option key={g} value={g}>
                      {g === 'all' ? (lang === 'ka' ? 'ყველა ჟანრი' : 'All genres') : g}
                    </option>
                  ))}
                </select>

                <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} style={selectStyle}>
                  {RATING_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value === 0 ? (lang === 'ka' ? 'ნებისმიერი რეიტინგი' : 'Any rating') : `⭐ ${opt.label}`}
                    </option>
                  ))}
                </select>

                <select value={yearRange} onChange={e => setYearRange(e.target.value)} style={selectStyle}>
                  {YEAR_RANGES[lang].map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
                  {SORT_OPTIONS[lang].map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                {hasFilters && (
                  <button
                    onClick={() => { setMinRating(0); setSelectedGenre('all'); setYearRange('all'); }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'var(--fg-muted)', padding: '7px 12px', fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    {lang === 'ka' ? '✕ გასუფთავება' : '✕ Clear'}
                  </button>
                )}
              </div>
            )}

            {/* Movie grid or empty state */}
            {filteredMovies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)' }}>
                <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🎬</p>
                <p>
                  {hasFilters
                    ? (lang === 'ka' ? 'ფილტრები ვერ პოულობს შედეგებს' : 'No movies match your filters')
                    : (lang === 'ka' ? 'ამ კოლექციაში ფილმები ვერ მოიძებნა' : 'No movies in this collection')}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                {filteredMovies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}
