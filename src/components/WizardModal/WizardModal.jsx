import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../context/LanguageContext';
import { T } from '../../data/translations';
import MovieCard from '../MovieCard/MovieCard';
import './WizardModal.css';

// Fields fetched for result movie cards
const LIST_FIELDS =
  'id,title,title_ge,year,imdb_id,imdb_rating,genres,themes,timeline,tone,poster,collections,similar_movies';

// ─── Apply all accumulated filters to a Supabase query builder ───────────────
function applyFilters(q, answeredQuestions) {
  for (const { question, answerIndex } of answeredQuestions) {
    q = question.applyFilter(q, answerIndex);
  }
  return q;
}

// ─── COUNT how many movies match the current filters (lightweight HEAD) ───────
async function queryCount(answeredQuestions) {
  let q = supabase.from('movies').select('id', { count: 'exact', head: true });
  q = applyFilters(q, answeredQuestions);
  const { count, error } = await q;
  return error ? null : count;
}

// ─── Fetch top 10 matching movies ordered by IMDb rating ─────────────────────
async function queryResults(answeredQuestions) {
  let q = supabase
    .from('movies')
    .select(LIST_FIELDS)
    .order('imdb_rating', { ascending: false })
    .limit(10);
  q = applyFilters(q, answeredQuestions);
  const { data, error } = await q;
  return error ? [] : (data ?? []);
}

// ─── Question definitions ─────────────────────────────────────────────────────
// Each question has: id, group, question_ka/en, answers_ka/en,
// applyFilter(q, answerIndex) → modified Supabase query (returns q unchanged for "doesn't matter")

const Q_ERA = {
  id: 'era',
  group: 'era',
  question_ka: 'რომელი პერიოდის ფილმი გსურს?',
  question_en: 'What era of film do you prefer?',
  answers_ka: ['კლასიკა (2000-მდე)', '2000–2019', 'ახალი (2020+)', 'მნიშვნელობა არ აქვს'],
  answers_en: ['Classic (before 2000)', '2000–2019', 'Recent (2020+)', "Doesn't matter"],
  applyFilter: (q, i) => {
    if (i === 0) return q.lt('year', 2000);
    if (i === 1) return q.gte('year', 2000).lt('year', 2020);
    if (i === 2) return q.gte('year', 2020);
    return q; // doesn't matter
  },
};

const Q_TONE = [
  {
    id: 'tone_dark',
    group: 'tone',
    question_ka: 'გირჩევნია მძიმე, სერიოზული ტონი?',
    question_en: 'Do you prefer a dark, serious tone?',
    answers_ka: ['კი, სერიოზული', 'არა, მსუბუქი', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, serious', 'No, light & fun', "Doesn't matter"],
    applyFilter: (q, i) => {
      if (i === 0) return q.in('tone', ['serious', 'thriller', 'horror']);
      if (i === 1) return q.in('tone', ['light', 'comedy']);
      return q;
    },
  },
  {
    id: 'tone_thriller',
    group: 'tone',
    question_ka: 'გსურს დაძაბული, თრილერის ატმოსფერო?',
    question_en: 'Do you want a tense, thriller atmosphere?',
    answers_ka: ['კი, დაძაბული', 'არა, მშვიდი', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, tense', 'No, calm', "Doesn't matter"],
    applyFilter: (q, i) => {
      if (i === 0) return q.in('tone', ['thriller', 'serious', 'horror']);
      if (i === 1) return q.in('tone', ['light', 'comedy']);
      return q;
    },
  },
];

const Q_SETTING = [
  {
    id: 'setting_historical',
    group: 'setting',
    question_ka: 'გინდა ისტორიული ეპოქის ფილმი?',
    question_en: 'Do you want a historical era film?',
    answers_ka: ['კი, ისტორიული', 'არა, თანამედროვე', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, historical', 'No, modern day', "Doesn't matter"],
    applyFilter: (q, i) => {
      if (i === 0) return q.in('timeline', ['ancient', 'medieval', '19th_century', 'ww2']);
      if (i === 1) return q.in('timeline', ['modern', 'future']);
      return q;
    },
  },
  {
    id: 'setting_nature',
    group: 'setting',
    question_ka: 'გინდა ბუნებაში / გარე სამყაროში მოქმედი ფილმი?',
    question_en: 'Do you want a film set in nature or the outdoors?',
    answers_ka: ['კი, ბუნება / გადარჩენა', 'არა, ქალაქური', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, nature / survival', 'No, urban', "Doesn't matter"],
    applyFilter: (q, i) => {
      if (i === 0) return q.overlaps('themes', ['survival', 'nature', 'wilderness', 'expedition']);
      if (i === 1) return q.overlaps('themes', ['urban', 'city', 'crime', 'heist']);
      return q;
    },
  },
  {
    id: 'setting_ww2',
    group: 'setting',
    question_ka: 'გაინტერესებს ომის ეპოქის ფილმი?',
    question_en: 'Are you interested in a war-era film?',
    answers_ka: ['კი, ომი / WW2', 'არა', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, war / WW2', 'No', "Doesn't matter"],
    applyFilter: (q, i) => {
      // "Yes" → timeline is ww2 OR themes contains war
      if (i === 0) return q.or('timeline.eq.ww2,themes.cs.{war}');
      // "No" → skip (negative theme filter over-narrows; positive picks elsewhere handle this)
      return q;
    },
  },
];

const Q_STORY = [
  {
    id: 'story_ensemble',
    group: 'story',
    question_ka: 'გირჩევნია ჯგუფური / ანსამბლური ისტორია?',
    question_en: 'Do you prefer a group / ensemble story?',
    answers_ka: ['კი, ჯგუფური', 'არა, ერთი გმირი', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, ensemble cast', 'No, solo hero', "Doesn't matter"],
    applyFilter: (q, i) => {
      if (i === 0) return q.overlaps('themes', ['ensemble', 'group', 'team', 'friendship']);
      return q; // "No" → skip (negative theme overlap is too restrictive)
    },
  },
  {
    id: 'story_realevents',
    group: 'story',
    question_ka: 'გსურს რეალურ მოვლენებზე დაფუძნებული ფილმი?',
    question_en: 'Do you want a film based on real events?',
    answers_ka: ['კი, რეალური', 'არა, გამოგონილი', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, based on true events', 'No, fiction', "Doesn't matter"],
    applyFilter: (q, i) => {
      if (i === 0) return q.filter('themes', 'ov', '{"true story","based on true events",historical,biography}');
      return q; // "No" → skip
    },
  },
];

const Q_DEPTH = [
  {
    id: 'depth_complex',
    group: 'depth',
    question_ka: 'გსურს ფსიქოლოგიურად ღრმა, რთული ფილმი?',
    question_en: 'Do you want a psychologically complex, layered film?',
    answers_ka: ['კი, ღრმა / საფიქრებელი', 'არა, მარტივი / გასართობი', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, deep & thought-provoking', 'No, simple & entertaining', "Doesn't matter"],
    applyFilter: (q, i) => {
      if (i === 0) return q.or('themes.ov.{psychological,philosophical,complex,identity,"moral dilemma"},genres.cs.{Drama}');
      if (i === 1) return q.overlaps('genres', ['Action', 'Adventure', 'Comedy']);
      return q;
    },
  },
  {
    id: 'depth_mindbending',
    group: 'depth',
    question_ka: 'გაინტერესებს გონებაამრეველი, არამხიარული სიუჟეტი?',
    question_en: 'Are you interested in a mind-bending, non-linear plot?',
    answers_ka: ['კი, კომპლექსური', 'არა, პირდაპირი', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, complex structure', 'No, straightforward', "Doesn't matter"],
    applyFilter: (q, i) => {
      if (i === 0) return q.filter('themes', 'ov', '{nonlinear,twist,"unreliable narrator",psychological}');
      return q; // "No" → skip
    },
  },
];

// Adaptive questions — picked randomly after the checkpoint
const Q_ADAPTIVE = [
  {
    id: 'adapt_fantasy',
    group: 'fantasy',
    question_ka: 'გინდა ფანტასტიკური / ზებუნებრივი ელემენტები?',
    question_en: 'Do you want fantasy / supernatural elements?',
    answers_ka: ['კი', 'არა', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes', 'No', "Doesn't matter"],
    applyFilter: (q, i) => {
      if (i === 0) return q.or('themes.ov.{supernatural,fantasy,magic,vampires,mythology},genres.cs.{Fantasy}');
      return q;
    },
  },
  {
    id: 'adapt_scifi',
    group: 'scifi',
    question_ka: 'გაინტერესებს სამეცნიერო ფანტასტიკა?',
    question_en: 'Are you interested in science fiction?',
    answers_ka: ['კი', 'არა', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes', 'No', "Doesn't matter"],
    applyFilter: (q, i) => {
      if (i === 0) return q.or('genres.cs.{"Sci-Fi"},timeline.eq.future');
      return q;
    },
  },
  {
    id: 'adapt_emotional',
    group: 'emotional',
    question_ka: 'გსურს ემოციურად ძლიერი, მამოძრავებელი ფილმი?',
    question_en: 'Do you want an emotionally powerful, moving film?',
    answers_ka: ['კი, ემოციური', 'არა, ნეიტრალური', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, emotional', 'No, neutral', "Doesn't matter"],
    applyFilter: (q, i) => {
      if (i === 0) return q.overlaps('themes', ['emotional', 'grief', 'love', 'loss', 'redemption', 'friendship']);
      return q;
    },
  },
  {
    id: 'adapt_romance',
    group: 'romance',
    question_ka: 'გსურს ძლიერი სიყვარულის სიუჟეტი?',
    question_en: 'Do you want a strong romance storyline?',
    answers_ka: ['კი', 'არა', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes', 'No', "Doesn't matter"],
    applyFilter: (q, i) => {
      if (i === 0) return q.or('genres.cs.{Romance},themes.ov.{romance,love,"forbidden love"}');
      return q;
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pickFromGroup(group) {
  return group[Math.floor(Math.random() * group.length)];
}

function buildSessionQuestions() {
  return [
    Q_ERA,
    pickFromGroup(Q_TONE),
    pickFromGroup(Q_SETTING),
    pickFromGroup(Q_STORY),
    pickFromGroup(Q_DEPTH),
  ];
}

// Pick a random unused adaptive question
function pickAdaptiveQuestion(askedIds) {
  const available = Q_ADAPTIVE.filter(q => !askedIds.has(q.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WizardModal({ open, onClose, collections = [] }) {
  const { lang } = useLang();
  const t = T[lang];
  const isKa = lang === 'ka';

  // Session questions (fixed sequence of 5, built once per open)
  const [sessionQuestions, setSessionQuestions] = useState([]);
  // 0–4 = structured questions, 5+ = adaptive
  const [questionIndex, setQuestionIndex] = useState(0);
  const [adaptiveQuestion, setAdaptiveQuestion] = useState(null);

  const [phase, setPhase] = useState('question'); // 'question' | 'checkpoint' | 'results'
  const [remainingCount, setRemainingCount] = useState(null); // server-side count
  const [countLoading, setCountLoading] = useState(false);
  const [askedIds, setAskedIds] = useState(new Set());
  const [answeredQuestions, setAnsweredQuestions] = useState([]); // [{question, answerIndex}]
  const [questionCount, setQuestionCount] = useState(0);
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);

  const isAdaptivePhase = questionIndex >= 5;
  const currentQuestion = isAdaptivePhase
    ? adaptiveQuestion
    : sessionQuestions[questionIndex] ?? null;

  // Initialize (or re-initialize) when modal opens
  useEffect(() => {
    if (!open) return;
    const sq = buildSessionQuestions();
    setSessionQuestions(sq);
    setQuestionIndex(0);
    setAdaptiveQuestion(null);
    setPhase('question');
    setRemainingCount(null);
    setCountLoading(false);
    setAskedIds(new Set());
    setAnsweredQuestions([]);
    setQuestionCount(0);
    setResults([]);
    setResultsLoading(false);
    setScrollIndex(0);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // ── Core logic ───────────────────────────────────────────────────────────────

  async function showResults(answered) {
    setPhase('results');
    setResultsLoading(true);
    const top10 = await queryResults(answered);
    setResults(top10);
    setScrollIndex(0);
    setResultsLoading(false);
  }

  async function handleAnswer(answerIndex) {
    const newAnswered = [...answeredQuestions, { question: currentQuestion, answerIndex }];
    const newAskedIds = new Set([...askedIds, currentQuestion.id]);
    const newCount = questionCount + 1;
    const nextIndex = questionIndex + 1;

    setAnsweredQuestions(newAnswered);
    setAskedIds(newAskedIds);
    setQuestionCount(newCount);

    // Query Supabase for the new remaining count
    setCountLoading(true);
    const count = await queryCount(newAnswered);
    setCountLoading(false);
    setRemainingCount(count);

    // Pool small enough — go straight to results
    if (count !== null && count <= 10) {
      showResults(newAnswered);
      return;
    }

    // After the 5th structured question (index 4), show checkpoint
    if (questionIndex === 4) {
      setQuestionIndex(nextIndex);
      setPhase('checkpoint');
      return;
    }

    // Still in structured phase
    if (nextIndex < 5) {
      setQuestionIndex(nextIndex);
      return;
    }

    // Adaptive phase — pick a random unused question
    const nextAdaptive = pickAdaptiveQuestion(newAskedIds);
    if (!nextAdaptive) {
      showResults(newAnswered);
      return;
    }
    setAdaptiveQuestion(nextAdaptive);
    setQuestionIndex(nextIndex);
  }

  function handleContinueFromCheckpoint() {
    const next = pickAdaptiveQuestion(askedIds);
    if (!next) {
      showResults(answeredQuestions);
      return;
    }
    setAdaptiveQuestion(next);
    setPhase('question');
  }

  function handleRestart() {
    const sq = buildSessionQuestions();
    setSessionQuestions(sq);
    setQuestionIndex(0);
    setAdaptiveQuestion(null);
    setPhase('question');
    setRemainingCount(null);
    setCountLoading(false);
    setAskedIds(new Set());
    setAnsweredQuestions([]);
    setQuestionCount(0);
    setResults([]);
    setResultsLoading(false);
    setScrollIndex(0);
  }

  if (!open) return null;

  const answers = isKa
    ? (currentQuestion?.answers_ka ?? [])
    : (currentQuestion?.answers_en ?? []);

  const progressPct = phase === 'results'
    ? 100
    : Math.min(95, Math.round((questionCount / 9) * 100));

  return (
    <div className="wizard-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="wizard-panel" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="wizard-header">
          <div className="wizard-header__left">
            <span className="wizard-header__icon">🎬</span>
            <span className="wizard-header__title">{t.wizardTitle}</span>
          </div>
          <button className="wizard-close" onClick={onClose} aria-label={t.close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div className="wizard-progress">
          <div className="wizard-progress__bar" style={{ width: `${progressPct}%` }} />
        </div>

        {/* ── Body ── */}
        <div className="wizard-body">

          {/* Question phase */}
          {phase === 'question' && currentQuestion && (
            <div className="wizard-question" key={currentQuestion.id}>
              <h2 className="wizard-question__text">
                {isKa ? currentQuestion.question_ka : currentQuestion.question_en}
              </h2>
              <div className="wizard-answers">
                {answers.map((label, i) => (
                  <button
                    key={i}
                    className={`wizard-answer-btn ${
                      i === answers.length - 1
                        ? 'wizard-answer-btn--idk'
                        : i === 0
                          ? 'wizard-answer-btn--yes'
                          : 'wizard-answer-btn--no'
                    }`}
                    onClick={() => handleAnswer(i)}
                    disabled={countLoading}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="wizard-question__hint" style={{ marginTop: 12, color: '#888', fontSize: '0.8rem' }}>
                {countLoading
                  ? (isKa ? 'იძებნება...' : 'Searching...')
                  : remainingCount !== null
                    ? (isKa
                        ? `კითხვა ${questionCount + 1} · დარჩენილი ფილმები: ${remainingCount}`
                        : `Question ${questionCount + 1} · Remaining: ${remainingCount}`)
                    : (isKa ? `კითხვა ${questionCount + 1}` : `Question ${questionCount + 1}`)}
              </p>
            </div>
          )}

          {/* Checkpoint phase */}
          {phase === 'checkpoint' && (
            <div className="wizard-decision" key="checkpoint">
              <div className="wizard-decision__icon">🤔</div>
              <h2 className="wizard-decision__title">
                {isKa
                  ? `უკვე ${questionCount} კითხვაზე უპასუხე`
                  : `You've answered ${questionCount} questions`}
              </h2>
              <p className="wizard-decision__sub" style={{ color: '#aaa', marginBottom: 8 }}>
                {remainingCount !== null
                  ? (isKa ? `დარჩენილი ფილმები: ${remainingCount}` : `Remaining movies: ${remainingCount}`)
                  : '…'}
              </p>
              <div className="wizard-decision__actions">
                <button
                  className="wizard-decision-btn wizard-decision-btn--primary"
                  onClick={() => showResults(answeredQuestions)}
                >
                  {isKa ? '✨ საუკეთესო შედეგების ნახვა' : '✨ Show best results'}
                </button>
                <button
                  className="wizard-decision-btn wizard-decision-btn--secondary"
                  onClick={handleContinueFromCheckpoint}
                >
                  {isKa ? 'კიდევ კითხვები →' : 'More questions →'}
                </button>
              </div>
            </div>
          )}

          {/* Results phase */}
          {phase === 'results' && (
            <div className="wizard-results">
              <div className="wizard-results__header">
                <span className="wizard-results__emoji">✨</span>
                <h2 className="wizard-results__title">
                  {isKa ? 'შენთვის შერჩეული ფილმები' : 'Movies picked for you'}
                </h2>
                <p className="wizard-results__subtitle" style={{ color: '#888' }}>
                  {isKa
                    ? `${questionCount} კითხვის საფუძველზე`
                    : `Based on ${questionCount} questions`}
                </p>
              </div>

              {resultsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <div style={{
                    width: '32px', height: '32px',
                    border: '3px solid rgba(232,197,71,0.15)',
                    borderTopColor: 'var(--gold)',
                    borderRadius: '50%',
                    animation: 'wizardSpin 0.75s linear infinite',
                  }} />
                  <style>{`@keyframes wizardSpin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : results.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>
                  {isKa ? 'ფილმები ვერ მოიძებნა' : 'No movies found'}
                </p>
              ) : (() => {
                // 2 cards on narrow viewports, 3 on wider ones
                const count = window.innerWidth < 480 ? 2 : 3;

                // Compute exact card pixel width so MovieCard's inline width prop
                // doesn't overflow the panel.
                // Layout: [arrow 32px] [gap 6px] [cards + (count-1)*8px gaps] [gap 6px] [arrow 32px]
                // Panel inner width = panelWidth - body padding (24px * 2)
                // Overlay padding: 16px each side on desktop, 0 on mobile (<480)
                const overlayPadding = window.innerWidth < 480 ? 0 : 32;
                const panelWidth = Math.min(window.innerWidth - overlayPadding, 480);
                const cardPx = Math.floor((panelWidth - 48 - 76 - (count - 1) * 8) / count);
                const cardWidth = `${cardPx}px`;

                const canGoLeft  = scrollIndex > 0;
                const canGoRight = scrollIndex + count < results.length;
                const visibleMovies = results.slice(scrollIndex, scrollIndex + count);
                return (
                  <>
                    <div className="wizard-carousel">
                      <button
                        className={`wizard-carousel__btn${canGoLeft ? ' wizard-carousel__btn--active' : ''}`}
                        onClick={() => setScrollIndex(i => i - 1)}
                        disabled={!canGoLeft}
                        aria-label="Previous"
                      >‹</button>
                      <div className="wizard-carousel__grid">
                        {visibleMovies.map(movie => (
                          <MovieCard key={movie.id} movie={movie} width={cardWidth} />
                        ))}
                      </div>
                      <button
                        className={`wizard-carousel__btn${canGoRight ? ' wizard-carousel__btn--active' : ''}`}
                        onClick={() => setScrollIndex(i => i + 1)}
                        disabled={!canGoRight}
                        aria-label="Next"
                      >›</button>
                    </div>
                    <p className="wizard-carousel__counter">
                      {scrollIndex + 1}–{Math.min(scrollIndex + count, results.length)} / {results.length}
                    </p>
                  </>
                );
              })()}
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="wizard-footer">
          <div className="wizard-footer__left">
            {phase === 'results' && (
              <button className="wizard-footer__restart" onClick={handleRestart}>
                {t.restartShort}
              </button>
            )}
          </div>
          <span className="wizard-footer__step">
            {phase === 'results'
              ? (isKa ? `${results.length} ფილმი` : `${results.length} movies`)
              : (isKa ? `${questionCount} კითხვა` : `${questionCount} questions`)}
          </span>
        </div>

      </div>
    </div>
  );
}
