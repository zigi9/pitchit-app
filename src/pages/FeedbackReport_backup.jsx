import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { analyzePresentation } from '../services/groq';
import './FeedbackReport.css';

// ── Scoring Engine ────────────────────────────────────────────────────────────

/**
 * Mode-specific competency weights.
 * All weights in each mode must sum to 1.0.
 */
const COMPETENCY_WEIGHTS = {
  INVESTOR_PITCH: {
    structureLogic:          0.22,
    persuasiveness:          0.20,
    openingImpression:       0.15,
    clarityConciseness:      0.15,
    voiceDelivery:           0.10,
    bodyLanguage:            0.10,
    adaptabilityAuthenticity:0.05,
    timeManagement:          0.03,
  },
  TEDX_TALK: {
    adaptabilityAuthenticity:0.20,
    openingImpression:       0.20,
    persuasiveness:          0.18,
    structureLogic:          0.15,
    clarityConciseness:      0.12,
    voiceDelivery:           0.10,
    bodyLanguage:            0.05,
    timeManagement:          0.00,
  },
  CONFERENCE_TALK: {
    structureLogic:          0.20,
    clarityConciseness:      0.20,
    voiceDelivery:           0.15,
    openingImpression:       0.15,
    persuasiveness:          0.10,
    bodyLanguage:            0.10,
    timeManagement:          0.05,
    adaptabilityAuthenticity:0.05,
  },
  PRODUCT_DEMO: {
    clarityConciseness:      0.25,
    persuasiveness:          0.20,
    structureLogic:          0.15,
    voiceDelivery:           0.15,
    openingImpression:       0.10,
    timeManagement:          0.10,
    bodyLanguage:            0.05,
    adaptabilityAuthenticity:0.00,
  },
  ACADEMIC: {
    structureLogic:          0.25,
    clarityConciseness:      0.20,
    openingImpression:       0.15,
    voiceDelivery:           0.15,
    persuasiveness:          0.10,
    timeManagement:          0.10,
    bodyLanguage:            0.05,
    adaptabilityAuthenticity:0.00,
  },
  DEFAULT: {
    structureLogic:          0.125,
    persuasiveness:          0.125,
    openingImpression:       0.125,
    clarityConciseness:      0.125,
    voiceDelivery:           0.125,
    bodyLanguage:            0.125,
    adaptabilityAuthenticity:0.125,
    timeManagement:          0.125,
  },
};

/**
 * Computes a mathematically-derived overall score (0-100) from
 * individual AI competency scores (0-10) using mode-specific weights.
 */
function computeWeightedScore(competencies, mode) {
  if (!competencies) return 0;
  const weights = COMPETENCY_WEIGHTS[mode] || COMPETENCY_WEIGHTS.DEFAULT;
  let weightedSum = 0;
  let totalWeight = 0;
  Object.entries(competencies).forEach(([key, comp]) => {
    const w = weights[key] ?? 0;
    if (w === 0) return;
    const score = Math.max(0, Math.min(10, comp.score ?? 0));
    weightedSum += (score / 10) * 100 * w;
    totalWeight += w;
  });
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Returns grade label, descriptor and color based on 0-100 score.
 */
function getGrade(score) {
  if (score >= 90) return { grade: 'S', label: 'Elite Performer',      color: '#e7c353' };
  if (score >= 80) return { grade: 'A', label: 'Investment Ready',     color: '#c8a84b' };
  if (score >= 70) return { grade: 'B', label: 'Strong Foundation',    color: '#a0855a' };
  if (score >= 55) return { grade: 'C', label: 'Needs Development',    color: '#8b7355' };
  if (score >= 40) return { grade: 'D', label: 'Critical Gaps',        color: '#8b4a35' };
  return              { grade: 'F', label: 'Failed to Deliver',        color: '#8b2020' };
}

/**
 * Returns a 5-tier color for competency scores (0-10).
 */
function competencyColor(score) {
  if (score >= 9) return '#e7c353';      // Gold — Elite
  if (score >= 7) return '#c8a84b';      // Amber — Strong
  if (score >= 5) return '#a0855a';      // Warm — Average
  if (score >= 3) return '#b05a35';      // Orange-Red — Weak
  return '#8b2020';                      // Red — Failed
}

// ── Analysis Steps ────────────────────────────────────────────────────────────

const ANALYSIS_STEPS = [
  'Processing Audio',
  'Analyzing Speech',
  'Evaluating Competencies',
  'Computing Weighted Score',
  'Generating Report',
];

// ── Sub-components ────────────────────────────────────────────────────────────

function LoadingScreen({ currentStep }) {
  return (
    <div className="fr-loading-screen">
      <div className="fr-loading-inner">
        <p className="fr-loading-label">ANALYZING YOUR PERFORMANCE</p>
        <h1 className="fr-loading-title">Computing Your Score</h1>
        <p className="fr-loading-subtitle">
          AI is evaluating 8 competencies with weighted scoring for your session type…
        </p>
        <div className="fr-loading-bar-track">
          <div className="fr-loading-bar-fill" />
        </div>
        <div className="fr-loading-steps">
          {ANALYSIS_STEPS.map((step, i) => (
            <div
              key={step}
              className={`fr-loading-step ${i <= currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}
            >
              <span className="fr-loading-step-dot" />
              <span className="fr-loading-step-label">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompetencyCard({ comp, weight }) {
  const color = competencyColor(comp.score ?? 0);
  const pct = Math.round(((comp.score ?? 0) / 10) * 100);
  const weightPct = weight != null ? Math.round(weight * 100) : null;

  return (
    <div className="fr-comp-card">
      <div className="fr-comp-card-header">
        <p className="fr-comp-label">{(comp.label || 'Competency').toUpperCase()}</p>
        <div className="fr-comp-score-wrap">
          {weightPct != null && (
            <span className="fr-comp-weight">{weightPct}%</span>
          )}
          <span className="fr-comp-score" style={{ color }}>
            {comp.score ?? '—'}<span className="fr-comp-max">/10</span>
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="fr-comp-bar-track">
        <div
          className="fr-comp-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>

      {comp.detailedFeedback && (
        <p className="fr-comp-detail">
          {comp.detailedFeedback}
        </p>
      )}

      {comp.evidence && comp.evidence.length > 0 && (
        <div className="fr-comp-evidence">
          <span className="fr-evidence-label">EVIDENCE</span>
          <p className="fr-evidence-text">"{comp.evidence[0]}"</p>
        </div>
      )}
    </div>
  );
}

function ActionCard({ action, index }) {
  return (
    <div className="fr-action-card">
      <p className="fr-action-number">{index + 1}</p>
      <h3 className="fr-action-title">{action.title}</h3>
      <p className="fr-action-desc">{action.description}</p>
      
      {action.whyItMatters && (
        <div className="fr-action-why">
          <span className="fr-action-sublabel">WHY IT MATTERS</span>
          <p>{action.whyItMatters}</p>
        </div>
      )}
      
      {action.howToPractice && (
        <div className="fr-action-how">
          <span className="fr-action-sublabel">HOW TO PRACTICE</span>
          <p>{action.howToPractice}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FeedbackReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSession, saveSession, sessions, user } = useSession();

  const historicalSession = useMemo(() => {
    if (!id || !sessions) return null;
    return sessions.find(s => s.id === id);
  }, [id, sessions]);

  const [feedback,     setFeedback]     = useState(null);
  const [isAnalyzing,  setIsAnalyzing]  = useState(false);
  const [error,        setError]        = useState('');
  const [currentStep,  setCurrentStep]  = useState(0);
  const [savedSession, setSavedSession] = useState(null);

  useEffect(() => {
    if (historicalSession) {
      const actualFeedback = historicalSession.feedback?.feedback || historicalSession.feedback;
      setFeedback(actualFeedback);
      setSavedSession(historicalSession);
      return;
    }

    if (!currentSession || (!currentSession.feedback && !currentSession.recordedBlob)) {
      navigate('/dashboard');
      return;
    }

    if (currentSession.feedback) {
      setFeedback(currentSession.feedback);
      return;
    }

    let stepTimer;
    const runAnalysis = async () => {
      setIsAnalyzing(true);
      setCurrentStep(0);
      stepTimer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
          clearInterval(stepTimer);
          return prev;
        });
      }, 3000);

      try {
        const result = await analyzePresentation({
          blob:          currentSession.recordedBlob,
          brief:         currentSession.brief,
          mode:          currentSession.mode,
          duration:      currentSession.duration,
          transcript:    currentSession.transcript,
          telemetry:     currentSession.telemetry,
          feedbackDepth: user?.preferences?.feedbackDepth || 'DEEP',
          analysisRigor: user?.preferences?.analysisRigor || 'STANDARD',
        });
        clearInterval(stepTimer);
        setCurrentStep(ANALYSIS_STEPS.length - 1);
        setFeedback(result);
        const saved = saveSession(result);
        setSavedSession(saved);
      } catch (err) {
        clearInterval(stepTimer);
        setError(err?.message || 'Analysis failed. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    runAnalysis();
    return () => clearInterval(stepTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, historicalSession]);

  if (isAnalyzing) return <LoadingScreen currentStep={currentStep} />;

  if (error) {
    return (
      <div className="fr-error-screen">
        <p className="fr-error-title">ANALYSIS FAILED</p>
        <p className="fr-error-message">{error}</p>
        <button className="fr-btn-gold" onClick={() => navigate('/mode')}>
          TRY AGAIN
        </button>
      </div>
    );
  }

  if (!feedback) return null;

  const sessionSource = historicalSession || currentSession;
  const mode = sessionSource?.mode || 'DEFAULT';

  // Compute score mathematically — do NOT trust AI's overallScore
  const overallScore = computeWeightedScore(feedback.competencies, mode);
  const { grade, label: gradeLabel, color: gradeColor } = getGrade(overallScore);
  const weights = COMPETENCY_WEIGHTS[mode] || COMPETENCY_WEIGHTS.DEFAULT;

  const sessionDate = sessionSource?.date
    ? new Date(sessionSource.date).toLocaleDateString('en-US', {
        month: 'short', day: '2-digit', year: 'numeric',
      }).toUpperCase()
    : '—';

  const sessionDuration = sessionSource?.duration
    ? `${Math.floor(sessionSource.duration / 60)}m ${sessionSource.duration % 60}s`
    : '—';

  const sessionId = savedSession?.id || sessionSource?.id || '—';

  // Sort competencies by weighted contribution (highest first)
  const sortedCompetencies = feedback.competencies
    ? Object.entries(feedback.competencies).sort(([aKey], [bKey]) => {
        return (weights[bKey] ?? 0) - (weights[aKey] ?? 0);
      })
    : [];

  return (
    <div className="fr-root">
      {/* Top nav */}
      <nav className="fr-nav">
        <button className="fr-nav-back" onClick={() => navigate('/history')}>
          ← BACK TO PERFORMANCE HISTORY
        </button>
        <span className="fr-nav-brand">PITCHIT</span>
        <div className="fr-nav-right">
          <span className="fr-nav-session-id">{sessionId}</span>
          <span className="fr-nav-badge">{historicalSession ? 'Historical Report' : 'Session Report'}</span>
        </div>
      </nav>

      <main className="fr-main">
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="fr-hero">
          <div className="fr-hero-score-block">
            {/* Left: numeric score */}
            <div className="fr-hero-score-wrap">
              <span className="fr-hero-score" style={{ color: gradeColor }}>
                {overallScore}
              </span>
              <span className="fr-hero-score-denom">/100</span>
            </div>

            {/* Right: grade badge */}
            <div className="fr-grade-badge" style={{ borderColor: gradeColor }}>
              <span className="fr-grade-letter" style={{ color: gradeColor }}>{grade}</span>
              <span className="fr-grade-label">{gradeLabel}</span>
            </div>
          </div>

          {/* Score bar */}
          <div className="fr-hero-bar-track">
            <div
              className="fr-hero-bar-fill"
              style={{ width: `${overallScore}%`, background: gradeColor }}
            />
          </div>

          <div className="fr-hero-meta">
            <span>{mode.replace(/_/g, ' ')}</span>
            <span className="fr-meta-sep">·</span>
            <span>{sessionDate}</span>
            <span className="fr-meta-sep">·</span>
            <span>{sessionDuration}</span>
            <span className="fr-meta-sep">·</span>
            <span>ID: {sessionId}</span>
          </div>

          {feedback.executiveSummary ? (
            <blockquote className="fr-summary">{feedback.executiveSummary}</blockquote>
          ) : (
            <blockquote className="fr-summary">
              Analysis was incomplete. The presentation lacked sufficient content for a full executive summary.
            </blockquote>
          )}
        </section>

        <div className="fr-divider" />

        {/* ── COMPETENCY BREAKDOWN ──────────────────────────────── */}
        <section className="fr-section">
          <div className="fr-section-header">
            <h2 className="fr-section-title">COMPETENCY BREAKDOWN</h2>
            <p className="fr-section-subtitle">
              Scores weighted for <strong>{mode.replace(/_/g, ' ')}</strong>. Weighted average = {overallScore}/100.
            </p>
          </div>
          <div className="fr-comp-grid">
            {sortedCompetencies.length > 0 ? (
              sortedCompetencies.map(([key, comp]) => (
                <CompetencyCard
                  key={key}
                  comp={comp}
                  weight={weights[key]}
                />
              ))
            ) : (
              <CompetencyCard
                comp={{ score: 0, label: 'Evaluation Failed', detailedFeedback: 'No detailed competencies were generated.' }}
                weight={null}
              />
            )}
          </div>
        </section>

        {/* ── PRIORITY ACTIONS ─────────────────────────────────── */}
        {feedback.priorityActions?.length > 0 && (
          <>
            <div className="fr-divider" />
            <section className="fr-section">
              <h2 className="fr-section-title">PRIORITY ACTIONS</h2>
              <div className="fr-actions-grid">
                {feedback.priorityActions.slice(0, 4).map((action, i) => (
                  <ActionCard key={i} action={action} index={i} />
                ))}
              </div>
            </section>
          </>
        )}

        <div className="fr-divider" />

        {/* ── TRANSCRIPT ───────────────────────────────────────── */}
        {feedback.transcript && (
          <section className="fr-section">
            <h2 className="fr-section-title">SESSION TRANSCRIPT</h2>
            <div className="fr-comp-card" style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '14px', whiteSpace: 'pre-wrap', margin: 0 }}>
                {feedback.transcript}
              </p>
            </div>
          </section>
        )}

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div className="fr-cta">
          <button className="fr-btn-gold fr-btn-full" onClick={() => navigate('/mode')}>
            START NEW SESSION
          </button>
        </div>
      </main>
    </div>
  );
}
