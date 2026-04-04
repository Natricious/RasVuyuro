import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatButton.css';
import { useMovies } from '../../hooks/useMovies';
import { useLang } from '../../context/LanguageContext';

// ── Keyword maps ──────────────────────────────────────────────────────────────

const GENRE_KEYWORDS = {
  // English
  drama: 'Drama', action: 'Action', crime: 'Crime', thriller: 'Thriller',
  war: 'War', 'sci-fi': 'Sci-Fi', scifi: 'Sci-Fi', 'science fiction': 'Sci-Fi',
  fantasy: 'Fantasy', animation: 'Animation', animated: 'Animation',
  comedy: 'Comedy', horror: 'Horror', mystery: 'Mystery', romance: 'Romance',
  biography: 'Biography', biographical: 'Biography', history: 'History',
  historical: 'History', adventure: 'Adventure', western: 'Western',
  sport: 'Sport', music: 'Music', musical: 'Musical',
  // Georgian
  'დრამა': 'Drama', 'მოქმედება': 'Action', 'ექშენი': 'Action',
  'კრიმინალი': 'Crime', 'თრილერი': 'Thriller', 'ომი': 'War',
  'სამეცნიერო ფანტასტიკა': 'Sci-Fi', 'სფ': 'Sci-Fi',
  'ფანტასტიკა': 'Fantasy', 'ანიმაცია': 'Animation',
  'კომედია': 'Comedy', 'საშინელება': 'Horror',
  'მისტიკა': 'Mystery', 'რომანტიკა': 'Romance',
  'ბიოგრაფია': 'Biography', 'ისტორიული': 'History',
  'სათავგადასავლო': 'Adventure', 'სპორტი': 'Sport',
};

const TONE_KEYWORDS = {
  // English
  serious: 'serious', 'dark': 'serious', heavy: 'serious',
  light: 'light', fun: 'light', funny: 'light', cheerful: 'light',
  // Georgian
  'სერიოზული': 'serious', 'მძიმე': 'serious', 'პაათოსური': 'serious',
  'მსუბუქი': 'light', 'სახალისო': 'light', 'გასართობი': 'light',
};

const TIMELINE_KEYWORDS = {
  // English
  ancient: 'ancient', antique: 'ancient', 'ancient world': 'ancient',
  medieval: 'medieval', 'middle ages': 'medieval', 'middle age': 'medieval',
  '19th century': '19th_century', '19th': '19th_century', xix: '19th_century',
  ww2: 'ww2', wwii: 'ww2', 'world war 2': 'ww2', 'world war ii': 'ww2', 'world war': 'ww2',
  modern: 'modern', contemporary: 'modern', 'present day': 'modern',
  future: 'future', futuristic: 'future', 'sci-fi era': 'future',
  // Georgian
  'ძველი სამყარო': 'ancient', 'ძველი': 'ancient', 'ანტიკური': 'ancient',
  'შუა საუკუნეები': 'medieval', 'შუა საუკუნე': 'medieval',
  'xix საუკუნე': '19th_century', 'მეცხრამეტე საუკუნე': '19th_century',
  'მეორე მსოფლიო ომი': 'ww2', 'მეორე მსოფლიო': 'ww2', 'ომის პერიოდი': 'ww2',
  'თანამედროვე': 'modern', 'დღეს': 'modern',
  'მომავალი': 'future', 'მომავლის': 'future',
};

const RATING_KEYWORDS = {
  // English → minimum rating
  best: 8.0, top: 8.0, great: 8.0, excellent: 8.5, outstanding: 8.5,
  'highest rated': 8.0, 'high rated': 8.0, masterpiece: 8.5,
  // Georgian
  'საუკეთესო': 8.0, 'ტოპ': 8.0, 'შესანიშნავი': 8.5,
  'მაღალი რეიტინგი': 8.0, 'მაღალრეიტინგიანი': 8.0,
  'კარგი': 7.5, 'კლასიკური': 7.5,
};

const SIMILAR_PATTERNS = [
  /similar to\s+[""]?(.+?)[""]?\s*$/i,
  /like\s+[""]?(.+?)[""]?\s*$/i,
  /movies like\s+[""]?(.+?)[""]?\s*$/i,
  /(.+?)-ს\s+მსგავსი/i,
  /(.+?)\s+მსგავსი\s+ფილმი/i,
  /(.+?)\s+მსგავსი/i,
  /მსგავსი\s+[""]?(.+?)[""]?\s*(?:ფილმი)?$/i,
];

// ── Transliteration pre-processing ───────────────────────────────────────────
// Maps Latin-spelled Georgian words → English equivalents understood by the
// keyword maps above. Entries are sorted longest-first at runtime so that
// multi-word phrases are substituted before their individual words.

const TRANSLIT_MAP = [
  // ── Multi-word phrases ────────────────────────────────────────────────
  ['kolejis cxovrebaze',    'comedy drama'],
  ['kolejis cxovreba',      'comedy drama'],
  ['meore msoflio omi',     'world war'],
  ['meore msoflio',         'world war'],
  ['samecniero fantastika', 'sci-fi'],
  ['shua saukunebi',        'medieval'],
  ['shua sauk',             'medieval'],

  // ── Genres ───────────────────────────────────────────────────────────
  ['satavgadasavlo',  'adventure'],
  ['sashinelebis',    'horror'],
  ['sashineeleba',    'horror'],
  ['sashineleba',     'horror'],
  ['vampirebze',      'horror'],
  ['vampirebis',      'horror'],
  ['vampirebi',       'horror'],
  ['vampirze',        'horror'],
  ['animaciuri',      'animation'],
  ['animatsia',       'animation'],
  ['animacia',        'animation'],
  ['fantastiuri',     'fantasy'],
  ['fantastika',      'fantasy'],
  ['fantezi',         'fantasy'],
  ['komediebi',       'comedy'],
  ['komedias',        'comedy'],
  ['komedia',         'comedy'],
  ['sasacilo',        'comedy'],
  ['trileri',         'thriller'],
  ['triler',          'thriller'],
  ['kriminali',       'crime'],
  ['kriminal',        'crime'],
  ['biografiuli',     'biography'],
  ['biographia',      'biography'],
  ['biografia',       'biography'],
  ['istoriuri',       'historical'],
  ['istoriuli',       'historical'],
  ['romantiuri',      'romance'],
  ['romantiuli',      'romance'],
  ['romantika',       'romance'],
  ['mistiuri',        'mystery'],
  ['mistika',         'mystery'],
  ['moqmedebis',      'action'],
  ['moqmedeba',       'action'],
  ['ekshenis',        'action'],
  ['eksheni',         'action'],
  ['sportuli',        'sport'],
  ['sporti',          'sport'],

  // ── Tones ────────────────────────────────────────────────────────────
  ['seriozuri',   'serious'],
  ['seriozuli',   'serious'],
  ['mdzimis',     'dark'],
  ['mdzime',      'dark'],
  ['msubukis',    'light'],
  ['msubuki',     'light'],
  ['gasartobis',  'fun'],
  ['gasartobi',   'fun'],
  ['saxaliso',    'fun'],

  // ── Era / timeline ───────────────────────────────────────────────────
  ['tanamedroves', 'modern'],
  ['tanamedrove',  'modern'],
  ['momavlis',     'future'],
  ['momavali',     'future'],
  ['antikuri',     'ancient'],
  ['dzvelis',      'ancient'],
  ['dzveli',       'ancient'],

  // ── Rating ───────────────────────────────────────────────────────────
  ['sauketseso',      'best'],
  ['sauketeso',       'best'],
  ['shesanishnavis',  'excellent'],
  ['shesanishnavi',   'excellent'],
  ['klasikuri',       'great'],
  ['klasikur',        'great'],
  ['kargi',           'great'],

  // ── Structural / filler words ─────────────────────────────────────────
  // (map war inflections before stripping filmebi etc.)
  ['omebze',     'war'],
  ['omebis',     'war'],
  ['omze',       'war'],
  ['omis',       'war'],
  ['kolejis',    'drama comedy'],
  ['filmebze',   ''],
  ['filmebis',   ''],
  ['filmebi',    ''],
  ['filmze',     ''],
  ['filme',      ''],
  ['filmi',      ''],
  ['cxovrebaze', ''],
  ['cxovrebis',  ''],
  ['cxovreba',   ''],
];

function preprocessQuery(raw) {
  let q = raw.toLowerCase().trim();
  // Sort longest first so multi-word phrases replace before single words
  const entries = TRANSLIT_MAP.slice().sort((a, b) => b[0].length - a[0].length);
  for (const [latin, replacement] of entries) {
    const escaped = latin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    q = q.replace(new RegExp(`\\b${escaped}\\b`, 'g'), replacement);
  }
  return q.replace(/\s+/g, ' ').trim();
}

// ── Core matching logic ───────────────────────────────────────────────────────

function parseAndScore(query, movies) {
  const q = preprocessQuery(query);

  // 1. Similar-to detection
  for (const pattern of SIMILAR_PATTERNS) {
    const match = q.match(pattern);
    if (match) {
      const titleQ = match[1].trim();
      const target = movies.find(m =>
        m.title.toLowerCase().includes(titleQ) ||
        (m.title_ge && m.title_ge.toLowerCase().includes(titleQ))
      );
      if (target) {
        const similar = (target.similar_movies || [])
          .map(id => movies.find(m => m.id === id))
          .filter(Boolean)
          .slice(0, 5);
        return { movies: similar.length > 0 ? similar : [target], type: 'similar' };
      }
    }
  }

  // 2. Build criteria
  const matchedGenres = [];
  const matchedTones = [];
  const matchedTimelines = [];
  let ratingMin = null;

  // Check multi-word keywords first (longest match wins)
  const kwSorted = kws => Object.keys(kws).sort((a, b) => b.length - a.length);

  for (const kw of kwSorted(GENRE_KEYWORDS)) {
    if (q.includes(kw) && !matchedGenres.includes(GENRE_KEYWORDS[kw])) {
      matchedGenres.push(GENRE_KEYWORDS[kw]);
    }
  }
  for (const kw of kwSorted(TONE_KEYWORDS)) {
    if (q.includes(kw) && !matchedTones.includes(TONE_KEYWORDS[kw])) {
      matchedTones.push(TONE_KEYWORDS[kw]);
    }
  }
  for (const kw of kwSorted(TIMELINE_KEYWORDS)) {
    if (q.includes(kw) && !matchedTimelines.includes(TIMELINE_KEYWORDS[kw])) {
      matchedTimelines.push(TIMELINE_KEYWORDS[kw]);
    }
  }
  for (const kw of kwSorted(RATING_KEYWORDS)) {
    if (q.includes(kw)) { ratingMin = RATING_KEYWORDS[kw]; break; }
  }

  // 3. If nothing matched, try title search
  const hasCriteria = matchedGenres.length || matchedTones.length || matchedTimelines.length || ratingMin;
  if (!hasCriteria) {
    const byTitle = movies.filter(m =>
      m.title.toLowerCase().includes(q) ||
      (m.title_ge && m.title_ge.toLowerCase().includes(q))
    );
    if (byTitle.length > 0) return { movies: byTitle.slice(0, 5), type: 'title' };
    return null;
  }

  // 4. Score every movie
  const scored = movies.map(m => {
    let score = 0;
    const mGenres = (m.genres || []).map(g => g.toLowerCase());

    for (const g of matchedGenres) {
      if (mGenres.includes(g.toLowerCase())) score += 3;
    }
    if (matchedTones.includes(m.tone)) score += 2;
    if (matchedTimelines.includes(m.timeline)) score += 2;
    if (ratingMin !== null && (m.imdb_rating ?? 0) >= ratingMin) score += 2;

    // IMDb tiebreaker
    score += (m.imdb_rating ?? 0) * 0.1;

    return { movie: m, score };
  });

  const results = scored
    .filter(s => s.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.movie);

  return results.length > 0 ? { movies: results, type: 'scored' } : null;
}

// ── UI strings ────────────────────────────────────────────────────────────────

const UI = {
  ka: {
    name: 'CineGuide ასისტენტი',
    status: 'ონლაინ',
    placeholder: 'შეიყვანეთ შეტყობინება...',
    greeting: 'გამარჯობა! მე ვარ CineGuide ასისტენტი.\nმითხარი, რა სახის ფილმი გინდა ნახო? 🎬\n\nმაგ: "ისტორიული დრამა", "კომედია", "Inception-ის მსგავსი"',
    noResults: 'ვერ ვიპოვე შესაფერისი ფილმი.\nსცადეთ: ჟანრი (დრამა, კომედია), ეპოქა (შუა საუკუნეები), ტონი (სერიოზული), ან "X-ს მსგავსი".',
    loading: 'ფილმების ჩატვირთვა...',
    foundSimilar: (t) => `"${t}"-ს მსგავსი ფილმები:`,
    found: (n) => `ნაპოვნია ${n} ფილმი:`,
  },
  en: {
    name: 'CineGuide Assistant',
    status: 'Online',
    placeholder: 'Type a message...',
    greeting: 'Hi! I\'m your CineGuide assistant.\nTell me what kind of movie you\'re in the mood for! 🎬\n\nTry: "historical drama", "comedy", "similar to Inception"',
    noResults: 'No matching movies found.\nTry: genre (drama, comedy), era (medieval, modern), tone (serious, light), or "similar to X".',
    loading: 'Loading movies...',
    foundSimilar: (t) => `Movies similar to "${t}":`,
    found: (n) => `Found ${n} movie${n === 1 ? '' : 's'}:`,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { movies, loading: moviesLoading } = useMovies();
  const { lang } = useLang();
  const t = UI[lang] ?? UI.ka;

  // Show greeting when panel first opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ type: 'bot', text: t.greeting }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-scroll body to bottom on new messages
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input after panel opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 280);
      return () => clearTimeout(timer);
    }
  }, [open]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    setMessages(prev => [...prev, { type: 'user', text }]);
    setInput('');

    if (moviesLoading) {
      setMessages(prev => [...prev, { type: 'bot', text: t.loading }]);
      return;
    }

    const result = parseAndScore(text, movies);
    if (!result) {
      setMessages(prev => [...prev, { type: 'bot', text: t.noResults }]);
    } else {
      const label = result.type === 'similar'
        ? t.foundSimilar(text)
        : t.found(result.movies.length);
      setMessages(prev => [...prev, { type: 'bot', text: label, movies: result.movies }]);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSend();
  }

  return (
    <>
      {/* Chat panel */}
      <div className={`chat-panel ${open ? 'chat-panel--open' : ''}`} aria-hidden={!open}>

        <div className="chat-panel__header">
          <div className="chat-panel__header-info">
            <div className="chat-panel__avatar">🎬</div>
            <div>
              <p className="chat-panel__name">{t.name}</p>
              <p className="chat-panel__status">{t.status}</p>
            </div>
          </div>
          <button className="chat-panel__close" onClick={() => setOpen(false)} aria-label="Close chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="18" y1="18" x2="6" y2="6" />
            </svg>
          </button>
        </div>

        <div className="chat-panel__body" ref={bodyRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`chat-panel__message chat-panel__message--${msg.type}`}>
              {msg.text && (
                <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
              )}
              {msg.movies && msg.movies.length > 0 && (
                <div className="chat-panel__results">
                  {msg.movies.map(movie => (
                    <button
                      key={movie.id}
                      className="chat-panel__movie-card"
                      onClick={() => { navigate(`/movie/${movie.id}`); setOpen(false); }}
                    >
                      {movie.poster ? (
                        <img
                          src={movie.poster}
                          alt=""
                          className="chat-panel__movie-poster"
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="chat-panel__movie-poster chat-panel__movie-poster--placeholder">🎬</div>
                      )}
                      <div className="chat-panel__movie-info">
                        <span className="chat-panel__movie-title">{movie.title}</span>
                        <span className="chat-panel__movie-meta">
                          {movie.year} &middot; ⭐ {movie.imdb_rating}
                        </span>
                        {(movie.genres || []).length > 0 && (
                          <span className="chat-panel__movie-genres">
                            {movie.genres.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="chat-panel__footer">
          <input
            ref={inputRef}
            type="text"
            className="chat-panel__input"
            placeholder={t.placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            aria-label="Chat input"
          />
          <button className="chat-panel__send" onClick={handleSend} aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

      </div>

      {/* Floating button */}
      <button
        className="chat-fab"
        onClick={() => setOpen(v => !v)}
        aria-label="Open chat assistant"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
