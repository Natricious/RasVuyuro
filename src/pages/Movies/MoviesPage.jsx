import { useState, useMemo } from 'react';
import { useMovies } from '../../hooks/useMovies';
import MovieCard from '../../components/MovieCard/MovieCard';
import { useLang } from '../../context/LanguageContext';

const ALL_TIMELINES = ['ancient', 'medieval', '19th_century', 'ww2', 'modern', 'future'];

const TIMELINE_LABELS = {
  ka: {
    ancient:      'ანტიკური',
    medieval:     'შუა საუკუნეები',
    '19th_century': 'XIX საუკუნე',
    ww2:          'მეორე მსოფლიო ომი',
    modern:       'თანამედროვე',
    future:       'მომავალი',
  },
  en: {
    ancient:      'Ancient',
    medieval:     'Medieval',
    '19th_century': '19th Century',
    ww2:          'World War II',
    modern:       'Modern',
    future:       'Future',
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
  const { movies: allMovies, loading } = useMovies();

  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [timeline, setTimeline] = useState('');
  const [sort, setSort] = useState('rating');

  const allGenres = useMemo(
    () => [...new Set(allMovies.flatMap(m => m.genres || []))].sort(),
    [allMovies]
  );

  const filtered = useMemo(() => {
    let list = allMovies;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.title_ge && m.title_ge.toLowerCase().includes(q))
      );
    }
    if (genre)    list = list.filter(m => (m.genres || []).includes(genre));
    if (timeline) list = list.filter(m => m.timeline === timeline);

    list = [...list];
    if (sort === 'rating')    list.sort((a, b) => (b.imdb_rating ?? 0) - (a.imdb_rating ?? 0));
    else if (sort === 'year_desc') list.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    else if (sort === 'year_asc')  list.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
    else if (sort === 'title')     list.sort((a, b) => a.title.localeCompare(b.title));

    return list;
  }, [allMovies, search, genre, timeline, sort]);

  const hasFilters = search || genre || timeline;

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
      <div className="container">

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '6px' }}>
            {lang === 'ka' ? 'ყველა ფილმი' : 'All Movies'}
          </h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.9375rem' }}>
            {loading ? '…' : (
              <>
                {filtered.length} {lang === 'ka' ? 'ფილმი' : 'movies'}
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
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'ka' ? 'ფილმის ძებნა...' : 'Search movies...'}
            style={{ ...selectStyle, flex: '1 1 200px', minWidth: '180px' }}
          />

          <select value={genre} onChange={e => setGenre(e.target.value)} style={selectStyle}>
            <option value="">{lang === 'ka' ? 'ყველა ჟანრი' : 'All genres'}</option>
            {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select value={timeline} onChange={e => setTimeline(e.target.value)} style={selectStyle}>
            <option value="">{lang === 'ka' ? 'ყველა პერიოდი' : 'All periods'}</option>
            {ALL_TIMELINES.map(tl => (
              <option key={tl} value={tl}>{TIMELINE_LABELS[lang][tl]}</option>
            ))}
          </select>

          <select value={sort} onChange={e => setSort(e.target.value)} style={selectStyle}>
            {SORT_OPTIONS[lang].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setGenre(''); setTimeline(''); }}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'var(--fg-muted)', padding: '8px 14px', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              {lang === 'ka' ? '✕ გასუფთავება' : '✕ Clear'}
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎬</p>
            <p style={{ fontSize: '1rem' }}>
              {lang === 'ka' ? 'ფილმი ვერ მოიძებნა' : 'No movies found'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
            {filtered.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
