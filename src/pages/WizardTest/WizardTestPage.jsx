import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../context/LanguageContext';
import MovieCard from '../../components/MovieCard/MovieCard';

const LIST_FIELDS =
  'id,title,title_ge,year,imdb_id,imdb_rating,genres,themes,timeline,tone,poster,collections,similar_movies';

// ── Questions ─────────────────────────────────────────────────────────────────
// Each option.weights object has optional keys:
//   tones:     { [toneName]: points }
//   genres:    { [genreName]: points }
//   themes:    { [themeStr]: points }   (matched case-insensitively)
//   timelines: { [timelineName]: points }
//   yearBonus: (year) => points

const QUESTIONS = [
  {
    id: 'q1',
    question: { ka: 'ვისთან ერთად უყურებ?', en: 'Who are you watching with?' },
    options: [
      {
        icon: '🎧',
        label:  { ka: 'მარტო',        en: 'Alone' },
        desc:   { ka: 'სრული ჩაძირვა', en: 'Full immersion' },
        weights: {
          tones:  { serious: 3, thriller: 2 },
          genres: { Drama: 2, Crime: 2, Mystery: 2 },
          themes: { psychological: 3, philosophical: 2, existential: 2 },
        },
      },
      {
        icon: '💑',
        label:  { ka: 'პარტნიორთან',       en: 'With partner' },
        desc:   { ka: 'სიყვარულის ატმოსფერო', en: 'Romantic atmosphere' },
        weights: {
          genres: { Romance: 4, Drama: 3 },
          themes: { romance: 3, love: 3, 'forbidden love': 2, passion: 2 },
        },
      },
      {
        icon: '👫',
        label:  { ka: 'მეგობრებთან', en: 'With friends' },
        desc:   { ka: 'სახალისო, ემოციური', en: 'Fun & exciting' },
        weights: {
          tones:  { light: 2 },
          genres: { Action: 3, Comedy: 3, Adventure: 3, Thriller: 2 },
          themes: { friendship: 3, heist: 2, humor: 2 },
        },
      },
      {
        icon: '👨‍👩‍👧',
        label:  { ka: 'ოჯახთან',    en: 'With family' },
        desc:   { ka: 'ყველასთვის', en: 'For everyone' },
        weights: {
          tones:  { light: 3 },
          genres: { Family: 5, Animation: 4, Adventure: 3, Comedy: 2 },
          themes: { family: 3, 'coming of age': 2 },
        },
      },
    ],
  },
  {
    id: 'q2',
    question: { ka: 'როგორ გრძნობ თავს ახლა?', en: 'How do you feel right now?' },
    options: [
      {
        icon: '😴',
        label:  { ka: 'დაღლილი — დასვენება მინდა', en: 'Tired — need to unwind' },
        desc:   { ka: 'მსუბუქი, სასიამოვნო',        en: 'Easy-going & pleasant' },
        weights: {
          tones:  { light: 3, comedy: 3 },
          genres: { Comedy: 4, Animation: 2, Romance: 2 },
          themes: { humor: 3, 'feel good': 2 },
        },
      },
      {
        icon: '⚡',
        label:  { ka: 'ენერგიული — მინდა ემოცია', en: 'Energized — want excitement' },
        desc:   { ka: 'ადრენალინი, სიჩქარე',       en: 'Adrenaline & pace' },
        weights: {
          tones:  { thriller: 3, serious: 2 },
          genres: { Action: 4, Thriller: 3, Adventure: 3 },
          themes: { survival: 2, chase: 2 },
        },
      },
      {
        icon: '💭',
        label:  { ka: 'ჩაფიქრებული — მინდა ვიფიქრო', en: 'Reflective — want to think' },
        desc:   { ka: 'ღრმა, შინაარსიანი',           en: 'Deep & meaningful' },
        weights: {
          tones:  { serious: 4 },
          genres: { Drama: 4, Biography: 3, History: 3 },
          themes: { philosophical: 3, psychological: 3, identity: 2 },
        },
      },
      {
        icon: '🌙',
        label:  { ka: 'სხვა სამყარო მინდა',    en: 'Need to escape reality' },
        desc:   { ka: 'ფანტაზია, თავგადასავალი', en: 'Fantasy & adventure' },
        weights: {
          genres:    { 'Sci-Fi': 4, Fantasy: 4, Adventure: 3 },
          timelines: { future: 3 },
          themes:    { mythology: 2, supernatural: 2, space: 2 },
        },
      },
    ],
  },
  {
    id: 'q3',
    question: { ka: 'რა გჭირდება?', en: 'What do you need from this film?' },
    options: [
      {
        icon: '❤️',
        label:  { ka: 'ემოციური კავშირი',        en: 'Emotional connection' },
        desc:   { ka: 'ფილმი, რომელიც შეგიძრავს', en: 'Something that moves you' },
        weights: {
          tones:  { serious: 3 },
          genres: { Drama: 4, Romance: 3 },
          themes: { love: 3, redemption: 3, grief: 2, emotional: 3, loss: 2 },
        },
      },
      {
        icon: '💥',
        label:  { ka: 'ადრენალინი, დაძაბულობა', en: 'Adrenaline & tension' },
        desc:   { ka: 'გული გამიჩქარდება',       en: 'Heart-pounding moments' },
        weights: {
          tones:  { thriller: 4, horror: 3 },
          genres: { Action: 3, Thriller: 4, Horror: 3 },
          themes: { survival: 3, war: 2, chase: 2 },
        },
      },
      {
        icon: '😂',
        label:  { ka: 'სიცილი, გართობა', en: 'Laughter & fun' },
        desc:   { ka: 'სიხარული, პოზიტივი', en: 'Joy & positivity' },
        weights: {
          tones:  { comedy: 5, light: 4 },
          genres: { Comedy: 5, Animation: 3 },
          themes: { humor: 4, parody: 2 },
        },
      },
      {
        icon: '🔮',
        label:  { ka: 'სხვა სამყაროში ჩაძირვა', en: 'Immerse in another world' },
        desc:   { ka: 'ეპიკური, ვრცელი სამყარო', en: 'Epic, vast universe' },
        weights: {
          genres:    { Fantasy: 5, 'Sci-Fi': 4, Adventure: 3, History: 3 },
          timelines: { ancient: 2, medieval: 2, future: 3 },
          themes:    { mythology: 3, supernatural: 2, 'world building': 2 },
        },
      },
    ],
  },
  {
    id: 'q4',
    question: { ka: 'სად გინდა მოხვდე?', en: 'Where do you want to go?' },
    options: [
      {
        icon: '🏙️',
        label:  { ka: 'თანამედროვე ცხოვრება', en: 'Modern day life' },
        desc:   { ka: 'ნაცნობი, რეალური სამყარო', en: 'Familiar, real world' },
        weights: {
          timelines: { modern: 4 },
          themes:    { urban: 3, crime: 2 },
        },
      },
      {
        icon: '⚔️',
        label:  { ka: 'ისტორიული ეპოქა',          en: 'Historical era' },
        desc:   { ka: 'ომები, სამეფოები, ძველი ეპოქები', en: 'Wars, kingdoms, ancient times' },
        weights: {
          timelines: { ancient: 4, medieval: 4, '19th_century': 3, ww2: 3 },
          genres:    { History: 3, War: 3 },
        },
      },
      {
        icon: '🚀',
        label:  { ka: 'მომავალი და კოსმოსი', en: 'Future & space' },
        desc:   { ka: 'ტექნოლოგია, კოსმოსი, AI', en: 'Tech, space, AI' },
        weights: {
          timelines: { future: 4 },
          genres:    { 'Sci-Fi': 5 },
          themes:    { space: 3, AI: 2, dystopia: 2, technology: 2 },
        },
      },
      {
        icon: '✨',
        label:  { ka: 'ჯადოსნური სამყარო',          en: 'Magical realm' },
        desc:   { ka: 'ფანტაზია, ჯადოქრობა, მითოლოგია', en: 'Magic, fantasy, mythology' },
        weights: {
          genres: { Fantasy: 5, Animation: 2 },
          themes: { supernatural: 3, mythology: 3, magic: 3 },
        },
      },
    ],
  },
  {
    id: 'q5',
    question: { ka: 'რომელ ეპოქაში გამოშვებული ფილმი გინდა?', en: 'Which release era works for you?' },
    options: [
      {
        icon: '🎞️',
        label:  { ka: 'კლასიკა (2000-მდე)', en: 'Classic (before 2000)' },
        desc:   { ka: 'კინოს ოქროს ხანა',  en: 'The golden age of cinema' },
        weights: { yearBonus: y => y < 2000 ? 4 : y < 2010 ? -1 : -2 },
      },
      {
        icon: '📀',
        label:  { ka: '2000 – 2019', en: '2000 – 2019' },
        desc:   { ka: 'მოდერნული კინო', en: 'Modern era' },
        weights: { yearBonus: y => y >= 2000 && y < 2020 ? 4 : 0 },
      },
      {
        icon: '🔥',
        label:  { ka: 'ახალი (2020+)', en: 'Recent (2020+)' },
        desc:   { ka: 'ყველაზე ახალი ფილმები', en: 'Latest releases' },
        weights: { yearBonus: y => y >= 2020 ? 4 : 0 },
      },
      {
        icon: '🎬',
        label:  { ka: 'ნებისმიერი',            en: 'Any era is fine' },
        desc:   { ka: 'კარგი ფილმი — კარგი ფილმია', en: 'Good film is a good film' },
        weights: { yearBonus: () => 0 },
      },
    ],
  },
  {
    id: 'q6',
    question: { ka: 'ფილმის ბოლოს რა გრძნობა გინდა?', en: 'How do you want to feel when it ends?' },
    options: [
      {
        icon: '🌟',
        label:  { ka: 'შთაგონებული, მოტივირებული', en: 'Inspired & uplifted' },
        desc:   { ka: 'ცხოვრება ღირს!',             en: 'Life is worth living!' },
        weights: {
          themes: { redemption: 4, triumph: 3, hope: 3, inspiring: 3, sacrifice: 2 },
          genres: { Biography: 3 },
        },
      },
      {
        icon: '😢',
        label:  { ka: 'შეძრული, ემოციური', en: 'Moved & emotional' },
        desc:   { ka: 'ბედნიერი ცრემლები', en: 'Happy tears' },
        weights: {
          tones:  { serious: 3 },
          genres: { Drama: 3, Romance: 2 },
          themes: { grief: 3, loss: 3, love: 3, emotional: 4, sacrifice: 3 },
        },
      },
      {
        icon: '😅',
        label:  { ka: 'კმაყოფილი, გართობული', en: 'Satisfied & entertained' },
        desc:   { ka: 'ყველაფერი კარგად',     en: 'Everything turned out well' },
        weights: {
          tones:  { light: 3, comedy: 3, thriller: 2 },
          genres: { Action: 2, Comedy: 3, Thriller: 2 },
          themes: { justice: 2, victory: 2 },
        },
      },
      {
        icon: '🤔',
        label:  { ka: 'ჩაფიქრებული, განახლებული',  en: 'Thoughtful & changed' },
        desc:   { ka: 'სამყარო სხვანაირია ახლა', en: 'The world looks different after' },
        weights: {
          tones:  { serious: 4 },
          genres: { Drama: 3 },
          themes: { philosophical: 4, psychological: 4, existential: 3, identity: 3, 'moral dilemma': 3 },
        },
      },
    ],
  },
];

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreMovie(movie, allWeights) {
  let score = 0;
  const tone     = movie.tone;
  const genres   = movie.genres   || [];
  const themes   = (movie.themes  || []).map(t => t.toLowerCase());
  const timeline = movie.timeline;
  const year     = movie.year;

  for (const w of allWeights) {
    // Tone
    if (w.tones && tone) score += w.tones[tone] || 0;

    // Genres
    if (w.genres) {
      for (const g of genres) score += w.genres[g] || 0;
    }

    // Themes — try original, underscore→space, space→underscore variants
    if (w.themes) {
      for (const th of themes) {
        score += w.themes[th]
          ?? w.themes[th.replace(/\s+/g, '_')]
          ?? w.themes[th.replace(/_/g, ' ')]
          ?? 0;
      }
    }

    // Timeline
    if (w.timelines && timeline) score += w.timelines[timeline] || 0;

    // Year bonus
    if (w.yearBonus && year) score += w.yearBonus(year);
  }

  // Small tiebreaker: IMDb rating above 6 adds up to ~0.5 extra points
  score += Math.max(0, (movie.imdb_rating || 0) - 6) * 0.2;

  return score;
}

// ── Fetch candidates, score, return top 10 ────────────────────────────────────

async function fetchAndScore(allWeights) {
  // Collect high-signal tones (≥ 3 pts) and timelines (≥ 3 pts) for targeted OR
  const toneSet     = new Set();
  const timelineSet = new Set();

  for (const w of allWeights) {
    if (w.tones)     Object.entries(w.tones)    .forEach(([k, v]) => { if (v >= 3) toneSet.add(k); });
    if (w.timelines) Object.entries(w.timelines).forEach(([k, v]) => { if (v >= 3) timelineSet.add(k); });
  }

  const orParts = [];
  if (toneSet.size     > 0) orParts.push(`tone.in.(${[...toneSet].join(',')})`);
  if (timelineSet.size > 0) orParts.push(`timeline.in.(${[...timelineSet].join(',')})`);

  // Targeted query: matching tone/timeline signals, min rating 6.0
  let q = supabase
    .from('movies')
    .select(LIST_FIELDS)
    .gte('imdb_rating', 6.0)
    .order('imdb_rating', { ascending: false });
  if (orParts.length > 0) q = q.or(orParts.join(','));
  q = q.limit(500);

  // Baseline quality query: always include top-rated movies
  const qBase = supabase
    .from('movies')
    .select(LIST_FIELDS)
    .gte('imdb_rating', 7.5)
    .order('imdb_rating', { ascending: false })
    .limit(100);

  const [r1, r2] = await Promise.all([q, qBase]);

  // Merge & deduplicate
  const movieMap = new Map();
  for (const m of [...(r1.data || []), ...(r2.data || [])]) {
    if (!movieMap.has(m.id)) movieMap.set(m.id, m);
  }

  const candidates = [...movieMap.values()];
  if (candidates.length === 0) return [];

  return candidates
    .map(m => ({ m, score: scoreMovie(m, allWeights) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(s => s.m);
}

// ── Styles ────────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes wiz-fade-in {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes wiz-spin {
    to { transform: rotate(360deg); }
  }
  .wiz-slide {
    animation: wiz-fade-in 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .wiz-opt {
    cursor: pointer;
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 20px 18px;
    background: rgba(255,255,255,0.04);
    text-align: left;
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
    width: 100%;
  }
  .wiz-opt:hover {
    border-color: var(--gold);
    background: rgba(232,197,71,0.07);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  .wiz-opt:active {
    transform: scale(0.97) translateY(0);
  }
  .wiz-opts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 520px) {
    .wiz-opts-grid { grid-template-columns: 1fr; }
  }
  .wiz-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px;
  }
  @media (max-width: 600px) {
    .wiz-results-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 14px; }
  }
`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function WizardTestPage() {
  const { lang } = useLang();
  const isKa = lang === 'ka';

  const [step,              setStep]              = useState(0);
  const [phase,             setPhase]             = useState('questions'); // 'questions' | 'loading' | 'results'
  const [collectedWeights,  setCollectedWeights]  = useState([]);
  const [results,           setResults]           = useState([]);
  const [loadingError,      setLoadingError]      = useState(false);

  const question = QUESTIONS[step];
  const progressPct = Math.round((step / QUESTIONS.length) * 100);

  async function handleOption(weights) {
    const newWeights = [...collectedWeights, weights];

    if (step < QUESTIONS.length - 1) {
      setCollectedWeights(newWeights);
      setStep(s => s + 1);
    } else {
      setCollectedWeights(newWeights);
      setPhase('loading');
      setLoadingError(false);
      try {
        const top10 = await fetchAndScore(newWeights);
        setResults(top10);
        setPhase('results');
      } catch {
        setLoadingError(true);
        setPhase('results');
      }
    }
  }

  function handleRestart() {
    setStep(0);
    setPhase('questions');
    setCollectedWeights([]);
    setResults([]);
    setLoadingError(false);
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 'calc(var(--navbar-height) + 56px)', paddingBottom: '96px' }}>
      <style>{CSS}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>

        {/* ── Page header ── */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{
            fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.18em',
            color: 'var(--gold)', fontWeight: 700, marginBottom: '10px',
          }}>
            {isKa ? 'ფილმის მოძებნა' : 'MOVIE FINDER'}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
            fontWeight: 800, color: 'var(--fg)', margin: 0, lineHeight: 1.15,
          }}>
            {isKa ? 'შენი სრულყოფილი ფილმი' : 'Your Perfect Movie'}
          </h1>
          <p style={{ color: 'var(--fg-muted)', marginTop: '10px', fontSize: '1rem' }}>
            {isKa
              ? 'უპასუხე 6 კითხვას — მოვიძებნით სრულ შესაბამისობებს'
              : 'Answer 6 questions — we\'ll score every movie to find your best matches'}
          </p>
        </div>

        {/* ── Question phase ── */}
        {phase === 'questions' && question && (
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>

            {/* Progress */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)', fontWeight: 600 }}>
                  {isKa ? `კითხვა ${step + 1} / ${QUESTIONS.length}` : `Question ${step + 1} of ${QUESTIONS.length}`}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', opacity: 0.6 }}>
                  {progressPct}%
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${progressPct}%`, background: 'var(--gold)',
                  borderRadius: '999px', transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                }} />
              </div>
              {/* Dot stepper */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '14px' }}>
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width:  i === step ? '22px' : '8px',
                      height: '8px',
                      borderRadius: '999px',
                      background: i <= step ? 'var(--gold)' : 'rgba(255,255,255,0.12)',
                      opacity: i < step ? 0.5 : 1,
                      transition: 'all 0.35s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Question card — keyed by step so it re-mounts & re-animates */}
            <div key={step} className="wiz-slide">
              <p style={{
                fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)', fontWeight: 700,
                color: 'var(--fg)', textAlign: 'center',
                marginBottom: '28px', lineHeight: 1.35,
              }}>
                {isKa ? question.question.ka : question.question.en}
              </p>

              <div className="wiz-opts-grid">
                {question.options.map((opt, i) => (
                  <button
                    key={i}
                    className="wiz-opt"
                    onClick={() => handleOption(opt.weights)}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '10px', lineHeight: 1 }}>
                      {opt.icon}
                    </div>
                    <div style={{
                      fontWeight: 700, fontSize: '0.9375rem',
                      color: 'var(--fg)', marginBottom: '4px', lineHeight: 1.3,
                    }}>
                      {isKa ? opt.label.ka : opt.label.en}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)', lineHeight: 1.4 }}>
                      {isKa ? opt.desc.ka : opt.desc.en}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Loading phase ── */}
        {phase === 'loading' && (
          <div style={{ textAlign: 'center', padding: '80px 0' }} className="wiz-slide">
            <div style={{
              width: '52px', height: '52px',
              border: '3px solid rgba(232,197,71,0.15)',
              borderTopColor: 'var(--gold)',
              borderRadius: '50%',
              animation: 'wiz-spin 0.75s linear infinite',
              margin: '0 auto 28px',
            }} />
            <p style={{ color: 'var(--fg)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '8px' }}>
              {isKa ? 'ვაანალიზებ პასუხებს...' : 'Scoring every movie...'}
            </p>
            <p style={{ color: 'var(--fg-muted)', fontSize: '0.875rem' }}>
              {isKa ? '6000+ ფილმი ქულებდება' : 'Ranking 6000+ films by your preferences'}
            </p>
          </div>
        )}

        {/* ── Results phase ── */}
        {phase === 'results' && (
          <div className="wiz-slide">

            {/* Results header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✨</div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 2rem)',
                fontWeight: 700, color: 'var(--fg)', marginBottom: '8px',
              }}>
                {isKa ? 'შენთვის შერჩეული ფილმები' : 'Movies picked for you'}
              </h2>
              <p style={{ color: 'var(--fg-muted)', fontSize: '0.9375rem' }}>
                {isKa
                  ? `${QUESTIONS.length} კითხვის საფუძველზე სქორინგი`
                  : `Scored & ranked based on your ${QUESTIONS.length} answers`}
              </p>
            </div>

            {/* Error state */}
            {loadingError && (
              <p style={{ textAlign: 'center', color: 'var(--fg-muted)', padding: '40px 0' }}>
                {isKa ? 'დაფიქსირდა შეცდომა — სცადეთ თავიდან' : 'Something went wrong — please try again'}
              </p>
            )}

            {/* No results */}
            {!loadingError && results.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--fg-muted)', padding: '40px 0', fontSize: '1rem' }}>
                {isKa ? 'ფილმები ვერ მოიძებნა' : 'No movies found'}
              </p>
            )}

            {/* Results grid */}
            {results.length > 0 && (
              <>
                {/* Rank labels */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ width: '3px', height: '20px', background: 'var(--gold)', borderRadius: '999px', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {isKa ? `საუკეთესო ${results.length} შესაბამისობა` : `Top ${results.length} matches`}
                  </p>
                </div>
                <div className="wiz-results-grid">
                  {results.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </>
            )}

            {/* Restart button */}
            <div style={{ textAlign: 'center', marginTop: '52px' }}>
              <button
                onClick={handleRestart}
                style={{
                  background: 'transparent',
                  border: '1.5px solid rgba(255,255,255,0.18)',
                  borderRadius: '10px',
                  color: 'var(--fg-muted)',
                  padding: '13px 32px',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'var(--fg-muted)'; }}
              >
                ↺ {isKa ? 'თავიდან' : 'Start Over'}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
