import { useState, useEffect } from 'react';
import { useMovies } from '../../hooks/useMovies';
import { useLang } from '../../context/LanguageContext';
import { T } from '../../data/translations';
import MovieCard from '../MovieCard/MovieCard';
import './WizardModal.css';

// ─── Question definitions ─────────────────────────────────────────────────────
// Each question has: id, group, question_ka, question_en, answers_ka, answers_en,
// filter(movies, answerIndex) → filtered movies
// score(movie, answerIndex) → number added to movie's relevance score

const Q_ERA = {
  id: 'era',
  group: 'era',
  question_ka: 'რომელი პერიოდის ფილმი გსურს?',
  question_en: 'What era of film do you prefer?',
  answers_ka: ['კლასიკა (2000-მდე)', '2000–2019', 'ახალი (2020+)', 'მნიშვნელობა არ აქვს'],
  answers_en: ['Classic (before 2000)', '2000–2019', 'Recent (2020+)', "Doesn't matter"],
  filter: (movies, i) => {
    if (i === 3) return movies;
    if (i === 0) return movies.filter(m => m.year < 2000);
    if (i === 1) return movies.filter(m => m.year >= 2000 && m.year < 2020);
    if (i === 2) return movies.filter(m => m.year >= 2020);
    return movies;
  },
  score: (movie, i) => {
    if (i === 3) return 0;
    if (i === 0) return movie.year < 2000 ? 2 : 0;
    if (i === 1) return movie.year >= 2000 && movie.year < 2020 ? 2 : 0;
    if (i === 2) return movie.year >= 2020 ? 2 : 0;
    return 0;
  },
};

// Group: Tone (pick 1 randomly)
const Q_TONE = [
  {
    id: 'tone_dark',
    group: 'tone',
    question_ka: 'გირჩევნია მძიმე, სერიოზული ტონი?',
    question_en: 'Do you prefer a dark, serious tone?',
    answers_ka: ['კი, სერიოზული', 'არა, მსუბუქი', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, serious', 'No, light & fun', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      if (i === 0) return movies.filter(m => ['serious', 'thriller', 'horror'].includes(m.tone));
      if (i === 1) return movies.filter(m => ['light', 'comedy'].includes(m.tone));
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      if (i === 0) return ['serious', 'thriller', 'horror'].includes(movie.tone) ? 3 : 0;
      if (i === 1) return ['light', 'comedy'].includes(movie.tone) ? 3 : 0;
      return 0;
    },
  },
  {
    id: 'tone_thriller',
    group: 'tone',
    question_ka: 'გსურს დაძაბული, თრილერის ატმოსფერო?',
    question_en: 'Do you want a tense, thriller atmosphere?',
    answers_ka: ['კი, დაძაბული', 'არა, მშვიდი', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, tense', 'No, calm', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      if (i === 0) return movies.filter(m => ['thriller', 'serious', 'horror'].includes(m.tone));
      if (i === 1) return movies.filter(m => ['light', 'comedy'].includes(m.tone));
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      if (i === 0) return ['thriller', 'serious', 'horror'].includes(movie.tone) ? 3 : 0;
      if (i === 1) return ['light', 'comedy'].includes(movie.tone) ? 3 : 0;
      return 0;
    },
  },
];

// Group: Setting (pick 1 randomly)
const Q_SETTING = [
  {
    id: 'setting_historical',
    group: 'setting',
    question_ka: 'გინდა ისტორიული ეპოქის ფილმი?',
    question_en: 'Do you want a historical era film?',
    answers_ka: ['კი, ისტორიული', 'არა, თანამედროვე', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, historical', 'No, modern day', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      if (i === 0) return movies.filter(m => ['ancient', 'medieval', '19th_century', 'ww2'].includes(m.timeline));
      if (i === 1) return movies.filter(m => ['modern', 'future'].includes(m.timeline));
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      if (i === 0) return ['ancient', 'medieval', '19th_century', 'ww2'].includes(movie.timeline) ? 3 : 0;
      if (i === 1) return ['modern', 'future'].includes(movie.timeline) ? 3 : 0;
      return 0;
    },
  },
  {
    id: 'setting_nature',
    group: 'setting',
    question_ka: 'გინდა ბუნებაში / გარე სამყაროში მოქმედი ფილმი?',
    question_en: 'Do you want a film set in nature or the outdoors?',
    answers_ka: ['კი, ბუნება / გადარჩენა', 'არა, ქალაქური', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, nature / survival', 'No, urban', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      const natureTags = ['survival', 'nature', 'wilderness', 'expedition'];
      const urbanTags = ['urban', 'city', 'crime', 'heist'];
      if (i === 0) return movies.filter(m => m.themes?.some(t => natureTags.includes(t)));
      if (i === 1) return movies.filter(m => m.themes?.some(t => urbanTags.includes(t)));
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      const natureTags = ['survival', 'nature', 'wilderness', 'expedition'];
      const urbanTags = ['urban', 'city', 'crime', 'heist'];
      if (i === 0) return (movie.themes?.filter(t => natureTags.includes(t)).length ?? 0) * 2;
      if (i === 1) return (movie.themes?.filter(t => urbanTags.includes(t)).length ?? 0) * 2;
      return 0;
    },
  },
  {
    id: 'setting_ww2',
    group: 'setting',
    question_ka: 'გაინტერესებს ომის ეპოქის ფილმი?',
    question_en: 'Are you interested in a war-era film?',
    answers_ka: ['კი, ომი / WW2', 'არა', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, war / WW2', 'No', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      if (i === 0) return movies.filter(m => m.timeline === 'ww2' || m.themes?.includes('war'));
      if (i === 1) return movies.filter(m => m.timeline !== 'ww2' && !m.themes?.includes('war'));
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      const isWar = movie.timeline === 'ww2' || movie.themes?.includes('war');
      if (i === 0) return isWar ? 3 : 0;
      if (i === 1) return isWar ? 0 : 2;
      return 0;
    },
  },
];

// Group: Story type (pick 1 randomly)
const Q_STORY = [
  {
    id: 'story_ensemble',
    group: 'story',
    question_ka: 'გირჩევნია ჯგუფური / ანსამბლური ისტორია?',
    question_en: 'Do you prefer a group / ensemble story?',
    answers_ka: ['კი, ჯგუფური', 'არა, ერთი გმირი', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, ensemble cast', 'No, solo hero', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      const ensembleTags = ['ensemble', 'group', 'team', 'friendship'];
      if (i === 0) return movies.filter(m => m.themes?.some(t => ensembleTags.includes(t)));
      if (i === 1) return movies.filter(m => !m.themes?.some(t => ensembleTags.includes(t)));
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      const ensembleTags = ['ensemble', 'group', 'team', 'friendship'];
      const hasEnsemble = movie.themes?.some(t => ensembleTags.includes(t));
      if (i === 0) return hasEnsemble ? 2 : 0;
      if (i === 1) return hasEnsemble ? 0 : 2;
      return 0;
    },
  },
  {
    id: 'story_realevents',
    group: 'story',
    question_ka: 'გსურს რეალურ მოვლენებზე დაფუძნებული ფილმი?',
    question_en: 'Do you want a film based on real events?',
    answers_ka: ['კი, რეალური', 'არა, გამოგონილი', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, based on true events', 'No, fiction', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      const realTags = ['true story', 'based on true events', 'historical', 'biography'];
      if (i === 0) return movies.filter(m => m.themes?.some(t => realTags.includes(t)));
      if (i === 1) return movies.filter(m => !m.themes?.some(t => realTags.includes(t)));
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      const realTags = ['true story', 'based on true events', 'historical', 'biography'];
      const isReal = movie.themes?.some(t => realTags.includes(t));
      if (i === 0) return isReal ? 2 : 0;
      if (i === 1) return isReal ? 0 : 1;
      return 0;
    },
  },
];

// Group: Psychological depth (pick 1 randomly)
const Q_DEPTH = [
  {
    id: 'depth_complex',
    group: 'depth',
    question_ka: 'გსურს ფსიქოლოგიურად ღრმა, რთული ფილმი?',
    question_en: 'Do you want a psychologically complex, layered film?',
    answers_ka: ['კი, ღრმა / საფიქრებელი', 'არა, მარტივი / გასართობი', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, deep & thought-provoking', 'No, simple & entertaining', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      const deepTags = ['psychological', 'philosophical', 'complex', 'identity', 'moral dilemma'];
      if (i === 0) return movies.filter(m =>
        m.themes?.some(t => deepTags.includes(t)) || m.genres?.includes('Drama')
      );
      if (i === 1) return movies.filter(m =>
        !m.themes?.some(t => deepTags.includes(t)) &&
        (m.genres?.some(g => ['Action', 'Adventure', 'Comedy'].includes(g)) ?? false)
      );
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      const deepTags = ['psychological', 'philosophical', 'complex', 'identity', 'moral dilemma'];
      const isDeep = movie.themes?.some(t => deepTags.includes(t)) || movie.genres?.includes('Drama');
      if (i === 0) return isDeep ? 3 : 0;
      if (i === 1) return isDeep ? 0 : 2;
      return 0;
    },
  },
  {
    id: 'depth_mindbending',
    group: 'depth',
    question_ka: 'გაინტერესებს გონებაამრეველი, არამხიარული სიუჟეტი?',
    question_en: 'Are you interested in a mind-bending, non-linear plot?',
    answers_ka: ['კი, კომპლექსური', 'არა, პირდაპირი', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, complex structure', 'No, straightforward', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      const complexTags = ['nonlinear', 'twist', 'unreliable narrator', 'psychological'];
      if (i === 0) return movies.filter(m => m.themes?.some(t => complexTags.includes(t)));
      if (i === 1) return movies.filter(m => !m.themes?.some(t => complexTags.includes(t)));
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      const complexTags = ['nonlinear', 'twist', 'unreliable narrator', 'psychological'];
      const isComplex = movie.themes?.some(t => complexTags.includes(t));
      if (i === 0) return isComplex ? 3 : 0;
      if (i === 1) return isComplex ? 0 : 1;
      return 0;
    },
  },
];

// Adaptive pool questions (used after checkpoint)
const Q_ADAPTIVE = [
  {
    id: 'adapt_fantasy',
    group: 'fantasy',
    question_ka: 'გინდა ფანტასტიკური / ზებუნებრივი ელემენტები?',
    question_en: 'Do you want fantasy / supernatural elements?',
    answers_ka: ['კი', 'არა', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes', 'No', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      const tags = ['supernatural', 'fantasy', 'magic', 'vampires', 'mythology'];
      if (i === 0) return movies.filter(m =>
        m.themes?.some(t => tags.includes(t)) || m.genres?.includes('Fantasy')
      );
      if (i === 1) return movies.filter(m =>
        !m.themes?.some(t => tags.includes(t)) && !m.genres?.includes('Fantasy')
      );
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      const tags = ['supernatural', 'fantasy', 'magic', 'vampires', 'mythology'];
      const has = movie.themes?.some(t => tags.includes(t)) || movie.genres?.includes('Fantasy');
      if (i === 0) return has ? 3 : 0;
      if (i === 1) return has ? 0 : 2;
      return 0;
    },
  },
  {
    id: 'adapt_scifi',
    group: 'scifi',
    question_ka: 'გაინტერესებს სამეცნიერო ფანტასტიკა?',
    question_en: 'Are you interested in science fiction?',
    answers_ka: ['კი', 'არა', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes', 'No', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      if (i === 0) return movies.filter(m =>
        m.genres?.includes('Science Fiction') || m.genres?.includes('Sci-Fi') || m.timeline === 'future'
      );
      if (i === 1) return movies.filter(m =>
        !m.genres?.includes('Science Fiction') && !m.genres?.includes('Sci-Fi') && m.timeline !== 'future'
      );
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      const isSF = movie.genres?.includes('Science Fiction') || movie.genres?.includes('Sci-Fi') || movie.timeline === 'future';
      if (i === 0) return isSF ? 3 : 0;
      if (i === 1) return isSF ? 0 : 2;
      return 0;
    },
  },
  {
    id: 'adapt_emotional',
    group: 'emotional',
    question_ka: 'გსურს ემოციურად ძლიერი, მამოძრავებელი ფილმი?',
    question_en: 'Do you want an emotionally powerful, moving film?',
    answers_ka: ['კი, ემოციური', 'არა, ნეიტრალური', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes, emotional', 'No, neutral', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      const emotionTags = ['emotional', 'grief', 'love', 'loss', 'redemption', 'friendship'];
      if (i === 0) return movies.filter(m => m.themes?.some(t => emotionTags.includes(t)));
      if (i === 1) return movies.filter(m => !m.themes?.some(t => emotionTags.includes(t)));
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      const emotionTags = ['emotional', 'grief', 'love', 'loss', 'redemption', 'friendship'];
      const count = movie.themes?.filter(t => emotionTags.includes(t)).length ?? 0;
      if (i === 0) return count * 2;
      if (i === 1) return count === 0 ? 2 : 0;
      return 0;
    },
  },
  {
    id: 'adapt_romance',
    group: 'romance',
    question_ka: 'გსურს ძლიერი სიყვარულის სიუჟეტი?',
    question_en: 'Do you want a strong romance storyline?',
    answers_ka: ['კი', 'არა', 'მნიშვნელობა არ აქვს'],
    answers_en: ['Yes', 'No', "Doesn't matter"],
    filter: (movies, i) => {
      if (i === 2) return movies;
      const romanceTags = ['romance', 'love', 'forbidden love'];
      if (i === 0) return movies.filter(m =>
        m.genres?.includes('Romance') || m.themes?.some(t => romanceTags.includes(t))
      );
      if (i === 1) return movies.filter(m =>
        !m.genres?.includes('Romance') && !m.themes?.some(t => romanceTags.includes(t))
      );
      return movies;
    },
    score: (movie, i) => {
      if (i === 2) return 0;
      const romanceTags = ['romance', 'love', 'forbidden love'];
      const has = movie.genres?.includes('Romance') || movie.themes?.some(t => romanceTags.includes(t));
      if (i === 0) return has ? 3 : 0;
      if (i === 1) return has ? 0 : 2;
      return 0;
    },
  },
];

// ─── Pick one random question from a group array ─────────────────────────────
function pickFromGroup(group) {
  return group[Math.floor(Math.random() * group.length)];
}

// ─── Build the fixed 5-question sequence for questions 1–5 ───────────────────
function buildSessionQuestions() {
  return [
    Q_ERA,
    pickFromGroup(Q_TONE),
    pickFromGroup(Q_SETTING),
    pickFromGroup(Q_STORY),
    pickFromGroup(Q_DEPTH),
  ];
}

// ─── Pick best adaptive question (closest 50/50 split) ───────────────────────
function pickAdaptiveQuestion(remainingMovies, askedIds) {
  const available = Q_ADAPTIVE.filter(q => !askedIds.has(q.id));
  if (available.length === 0) return null;

  const target = remainingMovies.length / 2;
  let best = available[0];
  let bestScore = Infinity;

  for (const q of available) {
    let variance = 0;
    for (let i = 0; i < q.answers_ka.length - 1; i++) {
      const filtered = q.filter(remainingMovies, i);
      variance += Math.abs(filtered.length - target);
    }
    if (variance < bestScore) {
      bestScore = variance;
      best = q;
    }
  }

  return best;
}

// ─── Score movies against collected answers ───────────────────────────────────
function scoreAndRank(movies, answeredQuestions) {
  const pool = movies.length > 0 ? movies : [];
  const scored = pool.map(movie => {
    let s = 0;
    for (const { question, answerIndex } of answeredQuestions) {
      s += question.score(movie, answerIndex);
    }
    // Blend with IMDb rating as a tiebreaker
    s += (movie.imdb_rating ?? 5) * 0.3;
    return { movie, score: s };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(s => s.movie);
}

// ─── Component ────────────────────────────────────────────────────────────────
const VISIBLE_COUNT = 3;

export default function WizardModal({ open, onClose, collections = [] }) {
  const { lang } = useLang();
  const t = T[lang];
  const isKa = lang === 'ka';

  const { movies: allMovies } = useMovies();

  // Session questions (fixed sequence of 5, built once per open)
  const [sessionQuestions, setSessionQuestions] = useState([]);
  // Index into sessionQuestions (0–4 = structured, 5+ = adaptive)
  const [questionIndex, setQuestionIndex] = useState(0);
  // Current adaptive question (used after checkpoint)
  const [adaptiveQuestion, setAdaptiveQuestion] = useState(null);

  const [phase, setPhase] = useState('question'); // 'question' | 'checkpoint' | 'results'
  const [remainingMovies, setRemainingMovies] = useState([]);
  const [askedIds, setAskedIds] = useState(new Set());
  const [answeredQuestions, setAnsweredQuestions] = useState([]); // [{question, answerIndex}]
  const [questionCount, setQuestionCount] = useState(0);
  const [results, setResults] = useState([]);
  const [scrollIndex, setScrollIndex] = useState(0);

  // Determine current question
  const isAdaptivePhase = questionIndex >= 5;
  const currentQuestion = isAdaptivePhase
    ? adaptiveQuestion
    : sessionQuestions[questionIndex] ?? null;

  // Initialize when modal opens (also handles movies arriving after open)
  useEffect(() => {
    if (!open || !allMovies.length) return;
    const sq = buildSessionQuestions();
    setSessionQuestions(sq);
    setQuestionIndex(0);
    setAdaptiveQuestion(null);
    setPhase('question');
    setRemainingMovies(allMovies);
    setAskedIds(new Set());
    setAnsweredQuestions([]);
    setQuestionCount(0);
    setResults([]);
    setScrollIndex(0);
  }, [open, allMovies]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function showResults(movies, answered) {
    const pool = movies.length > 0 ? movies : allMovies;
    const top10 = scoreAndRank(pool, answered);
    setResults(top10);
    setScrollIndex(0);
    setPhase('results');
  }

  function handleAnswer(answerIndex) {
    const filtered = currentQuestion.filter(remainingMovies, answerIndex);
    const newAskedIds = new Set([...askedIds, currentQuestion.id]);
    const newAnswered = [...answeredQuestions, { question: currentQuestion, answerIndex }];
    const newCount = questionCount + 1;
    const nextIndex = questionIndex + 1;

    setRemainingMovies(filtered);
    setAskedIds(newAskedIds);
    setAnsweredQuestions(newAnswered);
    setQuestionCount(newCount);

    // Stop early if pool is small enough
    if (filtered.length <= 10) {
      showResults(filtered, newAnswered);
      return;
    }

    // After question 5 (index 4), show checkpoint
    if (questionIndex === 4) {
      setQuestionIndex(nextIndex);
      setPhase('checkpoint');
      return;
    }

    // Structured phase: advance to next session question
    if (nextIndex < 5) {
      setQuestionIndex(nextIndex);
      return;
    }

    // Adaptive phase: pick best splitting question
    const nextAdaptive = pickAdaptiveQuestion(filtered, newAskedIds);
    if (!nextAdaptive) {
      showResults(filtered, newAnswered);
      return;
    }
    setAdaptiveQuestion(nextAdaptive);
    setQuestionIndex(nextIndex);
  }

  function handleContinueFromCheckpoint() {
    const next = pickAdaptiveQuestion(remainingMovies, askedIds);
    if (!next) {
      showResults(remainingMovies, answeredQuestions);
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
    setRemainingMovies(allMovies);
    setAskedIds(new Set());
    setAnsweredQuestions([]);
    setQuestionCount(0);
    setResults([]);
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
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="wizard-question__hint" style={{ marginTop: 12, color: '#888', fontSize: '0.8rem' }}>
                {isKa
                  ? `კითხვა ${questionCount + 1} · დარჩენილი ფილმები: ${remainingMovies.length}`
                  : `Question ${questionCount + 1} · Remaining: ${remainingMovies.length}`}
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
                {isKa
                  ? `დარჩენილი ფილმები: ${remainingMovies.length}`
                  : `Remaining movies: ${remainingMovies.length}`}
              </p>
              <div className="wizard-decision__actions">
                <button
                  className="wizard-decision-btn wizard-decision-btn--primary"
                  onClick={() => showResults(remainingMovies, answeredQuestions)}
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

              {results.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>
                  {isKa ? 'ფილმები ვერ მოიძებნა' : 'No movies found'}
                </p>
              ) : (() => {
                const canGoLeft = scrollIndex > 0;
                const canGoRight = scrollIndex + VISIBLE_COUNT < results.length;
                const visibleMovies = results.slice(scrollIndex, scrollIndex + VISIBLE_COUNT);
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <button
                        onClick={() => setScrollIndex(i => i - 1)}
                        disabled={!canGoLeft}
                        style={{
                          flexShrink: 0, width: '32px', height: '32px',
                          borderRadius: '50%',
                          background: canGoLeft ? 'rgba(234,179,8,0.9)' : 'rgba(255,255,255,0.08)',
                          border: 'none',
                          color: canGoLeft ? '#000' : '#444',
                          fontSize: '20px',
                          cursor: canGoLeft ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          lineHeight: 1,
                        }}
                      >‹</button>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        flex: 1,
                        minWidth: 0,
                      }}>
                        {visibleMovies.map(movie => (
                          <MovieCard key={movie.id} movie={movie} />
                        ))}
                      </div>

                      <button
                        onClick={() => setScrollIndex(i => i + 1)}
                        disabled={!canGoRight}
                        style={{
                          flexShrink: 0, width: '32px', height: '32px',
                          borderRadius: '50%',
                          background: canGoRight ? 'rgba(234,179,8,0.9)' : 'rgba(255,255,255,0.08)',
                          border: 'none',
                          color: canGoRight ? '#000' : '#444',
                          fontSize: '20px',
                          cursor: canGoRight ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          lineHeight: 1,
                        }}
                      >›</button>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>
                      {scrollIndex + 1}–{Math.min(scrollIndex + VISIBLE_COUNT, results.length)} / {results.length}
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
