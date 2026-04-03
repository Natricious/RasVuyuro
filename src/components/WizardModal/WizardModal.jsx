import { useState, useEffect, useMemo } from 'react';
import { THEMATIC_COLLECTIONS } from '../../data/movies';
import './WizardModal.css';

// ─── Question pool ────────────────────────────────────────────────────────────
// Larger pool lets the adaptive picker choose meaningfully
const QUESTION_POOL = [
  {
    id: 'year',
    label: 'გამოშვების წელი',
    question: 'გსურს კლასიკური ფილმი (1990-მდე)?',
    hint: 'ფილმის გამოშვების პერიოდი',
    weight: 0.9,
  },
  {
    id: 'historical',
    label: 'ისტორიული გარემო',
    question: 'გინდა ისტორიული ეპოქის ფილმი?',
    hint: 'ისტორიული ან თანამედროვე სეტინგი',
    weight: 1.0,
  },
  {
    id: 'theme',
    label: 'სიუჟეტის თემა',
    question: 'გსურს სათავგადასავლო სიუჟეტი?',
    hint: 'ექსპედიცია, ბრძოლა, გადარჩენა',
    weight: 0.85,
  },
  {
    id: 'tone',
    label: 'ფილმის ტონი',
    question: 'გირჩევნია მძიმე, სერიოზული ტონი?',
    hint: 'მსუბუქი კომედია vs დრამა/საშინელება',
    weight: 0.8,
  },
  {
    id: 'supernatural',
    label: 'ზებუნებრივი ელემენტი',
    question: 'გინდა ზებუნებრივი ან ფანტასტიური ელემენტები?',
    hint: 'ვამპირები, მითოლოგია, ჯადოსნობა',
    weight: 0.95,
  },
  {
    id: 'romance',
    label: 'სიყვარულის ხაზი',
    question: 'გსურს ძლიერი სიყვარულის სიუჟეტი?',
    hint: 'რომანტიკა მთავარ პლანში',
    weight: 0.7,
  },
  {
    id: 'ensemble',
    label: 'პერსონაჟების ჯგუფი',
    question: 'გირჩევნია ჯგუფური / ანსამბლური ისტორია?',
    hint: 'ომი, ექსპედიცია, სტუდენტური ჯგუფი',
    weight: 0.75,
  },
  {
    id: 'foreign',
    label: 'ფილმის ენა',
    question: 'მზად ხარ არაინგლისურენოვანი ფილმისთვის?',
    hint: 'სუბტიტრები ან დუბლირება',
    weight: 0.65,
  },
];

// ─── Collection preference vectors ───────────────────────────────────────────
// +1 = strongly prefers "კი", -1 = strongly prefers "არა", 0 = neutral
// Collections: 1=ვამპირები 2=ძველი რომი 3=სტუდენტური 4=მოგზაურობა 5=გადარჩენა 6=ომი
const COLLECTION_PREFS = {
  1: { year: 1,  historical: -1, theme: -1, tone:  1,  supernatural:  1, romance:  1, ensemble: -1, foreign:  0 },
  2: { year: 1,  historical:  1, theme:  1, tone:  1,  supernatural:  0, romance: -1, ensemble:  1, foreign:  1 },
  3: { year: -1, historical: -1, theme: -1, tone: -1,  supernatural: -1, romance:  1, ensemble:  1, foreign: -1 },
  4: { year: -1, historical: -1, theme:  1, tone: -1,  supernatural: -1, romance:  0, ensemble: -1, foreign:  1 },
  5: { year:  0, historical:  0, theme:  1, tone:  1,  supernatural: -1, romance: -1, ensemble:  0, foreign:  0 },
  6: { year:  1, historical:  1, theme:  1, tone:  1,  supernatural:  0, romance: -1, ensemble:  1, foreign:  1 },
};

const ANSWER_VALUES = { კი: 1, არა: -1, 'არ ვიცი': 0 };
const ANSWER_BUTTONS = ['კი', 'არა', 'არ ვიცი'];
const DECISION_EVERY = 5; // show decision dialog every N answered questions

// ─── Pure scoring helpers ─────────────────────────────────────────────────────

// Score a single collection given current structured answers
function scoreCollection(colId, answers) {
  return Object.entries(answers).reduce((sum, [qId, { value, weight }]) => {
    const pref = COLLECTION_PREFS[colId]?.[qId] ?? 0;
    return sum + pref * value * weight;
  }, 0);
}

// Rank all collections, return array sorted desc
function rankCollections(answers) {
  return THEMATIC_COLLECTIONS
    .map((col) => ({ ...col, score: scoreCollection(col.id, answers) }))
    .sort((a, b) => b.score - a.score);
}

// ─── Confidence calculation ────────────────────────────────────────────────────
// Base curve: 100 * (1 - 0.8^n) gives ~20/36/49/59/67/74 for n=1..6
// Discrimination bonus: how far #1 is ahead of #2 (max +10)
function calcConfidence(answers) {
  const n = Object.keys(answers).length;
  if (n === 0) return 0;
  const base = Math.round(100 * (1 - Math.pow(0.8, n)));
  const ranked = rankCollections(answers);
  const spread = ranked[0].score - (ranked[1]?.score ?? 0);
  const bonus = Math.min(10, Math.round(spread * 3));
  return Math.min(95, base + bonus);
}

// ─── Adaptive question picker ─────────────────────────────────────────────────
// For each unanswered question, compute the weighted variance of its preference
// values across collections, where weights are softmax of current collection scores.
// The question with highest weighted variance will best discriminate the frontrunners.
function pickNextQuestion(answeredIds, answers) {
  const unanswered = QUESTION_POOL.filter((q) => !answeredIds.has(q.id));
  if (unanswered.length === 0) return null;

  // Softmax weights from current scores (temperature=1)
  const scored = THEMATIC_COLLECTIONS.map((col) => ({
    id: col.id,
    score: scoreCollection(col.id, answers),
  }));
  const maxScore = Math.max(...scored.map((s) => s.score), 0);
  const exps = scored.map((s) => Math.exp(s.score - maxScore));
  const expSum = exps.reduce((a, b) => a + b, 0);
  const softmax = exps.map((e) => e / expSum);

  // Weighted variance of prefs for each candidate question
  let bestQ = unanswered[0];
  let bestVar = -1;

  for (const q of unanswered) {
    const prefs = THEMATIC_COLLECTIONS.map((col, i) => ({
      pref: COLLECTION_PREFS[col.id][q.id] ?? 0,
      w: softmax[i],
    }));
    const mean = prefs.reduce((s, p) => s + p.pref * p.w, 0);
    const variance = prefs.reduce((s, p) => s + p.w * (p.pref - mean) ** 2, 0);
    // Weight by the question's intrinsic importance
    const score = variance * q.weight;
    if (score > bestVar) {
      bestVar = score;
      bestQ = q;
    }
  }

  return bestQ;
}

// ─── Top 3 results ────────────────────────────────────────────────────────────
function getRecommendations(answers) {
  return rankCollections(answers).slice(0, 3);
}

// ─── Initial state factory ────────────────────────────────────────────────────
function makeInitialState() {
  const firstQ = pickNextQuestion(new Set(), {});
  return {
    phase: 'question',       // 'question' | 'decision' | 'results'
    answeredIds: new Set(),
    // Structured: { [questionId]: { answer: string, value: number, weight: number } }
    answers: {},
    confidence: 0,
    currentQuestion: firstQ,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WizardModal({ open, onClose }) {
  const [state, setState] = useState(makeInitialState);

  // Reset on open
  useEffect(() => {
    if (open) setState(makeInitialState());
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAnswer = (answer) => {
    const { currentQuestion, answeredIds, answers } = state;
    const value = ANSWER_VALUES[answer] ?? 0;

    const newAnsweredIds = new Set([...answeredIds, currentQuestion.id]);
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: { answer, value, weight: currentQuestion.weight },
    };
    const newConfidence = calcConfidence(newAnswers);
    const count = newAnsweredIds.size;

    // Every DECISION_EVERY questions → show decision dialog
    if (count % DECISION_EVERY === 0) {
      setState({
        phase: 'decision',
        answeredIds: newAnsweredIds,
        answers: newAnswers,
        confidence: newConfidence,
        currentQuestion: null,
      });
      return;
    }

    // If no more questions → go straight to results
    const nextQ = pickNextQuestion(newAnsweredIds, newAnswers);
    if (!nextQ) {
      setState({
        phase: 'results',
        answeredIds: newAnsweredIds,
        answers: newAnswers,
        confidence: newConfidence,
        currentQuestion: null,
      });
      return;
    }

    setState({
      phase: 'question',
      answeredIds: newAnsweredIds,
      answers: newAnswers,
      confidence: newConfidence,
      currentQuestion: nextQ,
    });
  };

  const handleContinue = () => {
    const { answeredIds, answers, confidence } = state;
    const nextQ = pickNextQuestion(answeredIds, answers);
    if (!nextQ) {
      setState((s) => ({ ...s, phase: 'results' }));
      return;
    }
    setState((s) => ({ ...s, phase: 'question', currentQuestion: nextQ }));
  };

  const handleRecommendNow = () => {
    setState((s) => ({ ...s, phase: 'results' }));
  };

  const handleRestart = () => {
    setState(makeInitialState());
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const { phase, answers, confidence, currentQuestion, answeredIds } = state;
  const answeredCount = answeredIds.size;
  const recommendations = useMemo(
    () => (phase === 'results' ? getRecommendations(answers) : []),
    [phase, answers]
  );
  const highConfidence = confidence >= 70;

  // Progress bar: question phase = answered / pool, results = 100
  const progressPct = phase === 'results' ? 100
    : Math.round((answeredCount / QUESTION_POOL.length) * 100);

  if (!open) return null;

  return (
    <div className="wizard-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="wizard-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="wizard-header">
          <div className="wizard-header__left">
            <span className="wizard-header__icon">🎬</span>
            <span className="wizard-header__title">კინო-გზამკვლელი</span>
          </div>
          <button className="wizard-close" onClick={onClose} aria-label="დახურვა">
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

        {/* ── Accuracy indicator (shown once at least 1 answer given) ── */}
        {answeredCount > 0 && phase !== 'results' && (
          <div className="wizard-accuracy">
            <div className="wizard-accuracy__track">
              <div
                className={`wizard-accuracy__fill ${highConfidence ? 'wizard-accuracy__fill--high' : ''}`}
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className={`wizard-accuracy__label ${highConfidence ? 'wizard-accuracy__label--high' : ''}`}>
              რეკომენდაციის სიზუსტე: {confidence}%
            </span>
          </div>
        )}

        {/* ── Body ── */}
        <div className="wizard-body">

          {/* Question phase */}
          {phase === 'question' && currentQuestion && (
            <div className="wizard-question" key={currentQuestion.id}>
              <p className="wizard-question__label">{currentQuestion.label}</p>
              <h2 className="wizard-question__text">{currentQuestion.question}</h2>
              <p className="wizard-question__hint">{currentQuestion.hint}</p>
              <div className="wizard-answers">
                {ANSWER_BUTTONS.map((btn) => (
                  <button
                    key={btn}
                    className={`wizard-answer-btn wizard-answer-btn--${btn === 'კი' ? 'yes' : btn === 'არა' ? 'no' : 'idk'}`}
                    onClick={() => handleAnswer(btn)}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Decision phase (every 5 answers) */}
          {phase === 'decision' && (
            <div className="wizard-decision" key="decision">
              <div className="wizard-decision__icon">🤔</div>
              <h2 className="wizard-decision__title">
                {answeredCount} კითხვა პასუხგაცემულია
              </h2>
              <p className="wizard-decision__sub">
                სიზუსტე {confidence}% — {highConfidence ? 'საკმარისია კარგი რეკომენდაციისთვის' : 'მეტი კითხვა გააუმჯობესებს შედეგს'}
              </p>
              <div className="wizard-decision__actions">
                <button
                  className={`wizard-decision-btn ${highConfidence ? 'wizard-decision-btn--primary' : 'wizard-decision-btn--secondary'}`}
                  onClick={handleRecommendNow}
                >
                  ✨ ფილმების რეკომენდაცია
                </button>
                <button
                  className={`wizard-decision-btn ${highConfidence ? 'wizard-decision-btn--secondary' : 'wizard-decision-btn--primary'}`}
                  onClick={handleContinue}
                >
                  კითხვების გაგრძელება →
                </button>
              </div>
            </div>
          )}

          {/* Results phase */}
          {phase === 'results' && (
            <div className="wizard-results">
              <div className="wizard-results__header">
                <span className="wizard-results__emoji">✨</span>
                <h2 className="wizard-results__title">შენი კოლექციები</h2>
                <p className="wizard-results__subtitle">
                  {answeredCount} პასუხი · სიზუსტე {confidence}%
                </p>
              </div>
              <div className="wizard-results__list">
                {recommendations.map((col, i) => (
                  <div
                    key={col.id}
                    className="wizard-result-card"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="wizard-result-card__img-wrap">
                      <img src={col.imageUrl} alt={col.name} className="wizard-result-card__img" />
                      <div className="wizard-result-card__overlay" style={{ background: col.gradient }} />
                    </div>
                    <div className="wizard-result-card__body">
                      <span className="wizard-result-card__icon">{col.icon}</span>
                      <div>
                        <p className="wizard-result-card__name">{col.name}</p>
                        <p className="wizard-result-card__count" style={{ color: col.accentColor }}>
                          {col.count} ფილმი
                        </p>
                      </div>
                    </div>
                    {i === 0 && <span className="wizard-result-card__badge">საუკეთესო</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="wizard-footer">
          <div className="wizard-footer__left">
            {phase === 'question' && answeredCount > 0 && (
              <button className="wizard-footer__back" onClick={handleContinue}>
                {/* skip back — go to results early */}
              </button>
            )}
            {phase === 'results' && (
              <button className="wizard-footer__restart" onClick={handleRestart}>
                ↺ თავიდან
              </button>
            )}
            {(phase === 'question' || phase === 'decision') && answeredCount === 0 && (
              <span />
            )}
            {phase === 'question' && answeredCount > 0 && (
              <button className="wizard-footer__early" onClick={handleRecommendNow}>
                ახლავე →
              </button>
            )}
          </div>

          <span className="wizard-footer__step">
            {phase === 'results'
              ? `${answeredCount} / ${QUESTION_POOL.length} · დასრულებულია`
              : `${answeredCount} / ${QUESTION_POOL.length}`}
          </span>
        </div>

      </div>
    </div>
  );
}
