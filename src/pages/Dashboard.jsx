import { useNavigate } from 'react-router-dom';
import SidebarNav from '../components/SidebarNav';
import { useSession } from '../context/SessionContext';
import './Dashboard.css';

/* ── Scoring weights (must match FeedbackReport) ───────── */
const COMPETENCY_WEIGHTS = {
  INVESTOR_PITCH: { structureLogic: 0.22, persuasiveness: 0.20, openingImpression: 0.15, clarityConciseness: 0.15, voiceDelivery: 0.10, bodyLanguage: 0.10, adaptabilityAuthenticity: 0.05, timeManagement: 0.03 },
  TEDX_TALK:      { adaptabilityAuthenticity: 0.20, openingImpression: 0.20, persuasiveness: 0.18, structureLogic: 0.15, clarityConciseness: 0.12, voiceDelivery: 0.10, bodyLanguage: 0.05, timeManagement: 0.00 },
  CONFERENCE_TALK:{ structureLogic: 0.20, clarityConciseness: 0.20, voiceDelivery: 0.15, openingImpression: 0.15, persuasiveness: 0.10, bodyLanguage: 0.10, timeManagement: 0.05, adaptabilityAuthenticity: 0.05 },
  PRODUCT_DEMO:   { clarityConciseness: 0.25, persuasiveness: 0.20, structureLogic: 0.15, voiceDelivery: 0.15, openingImpression: 0.10, timeManagement: 0.10, bodyLanguage: 0.05, adaptabilityAuthenticity: 0.00 },
  DEFAULT:        { structureLogic: 0.125, persuasiveness: 0.125, openingImpression: 0.125, clarityConciseness: 0.125, voiceDelivery: 0.125, bodyLanguage: 0.125, adaptabilityAuthenticity: 0.125, timeManagement: 0.125 },
};

function computeWeightedScore(competencies, mode) {
  if (!competencies) return null;
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
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
}

/* Reads score from session — computes from competencies if missing */
function getSessionScore(session) {
  if (session.score != null) return session.score;
  const fb = session.feedback?.feedback || session.feedback;
  if (fb?.competencies) return computeWeightedScore(fb.competencies, session.mode);
  if (fb?.overallScore != null) return fb.overallScore; // legacy
  return null;
}

function getGrade(score) {
  if (score == null) return null;
  if (score >= 90) return { grade: 'S', color: '#e7c353' };
  if (score >= 80) return { grade: 'A', color: '#c8a84b' };
  if (score >= 70) return { grade: 'B', color: '#a0855a' };
  if (score >= 55) return { grade: 'C', color: '#8b7355' };
  if (score >= 40) return { grade: 'D', color: '#8b4a35' };
  return { grade: 'F', color: '#8b2020' };
}

/* ── Helpers ────────────────────────────────────────────── */
function avg(sessions) {
  if (!sessions.length) return 0;
  const scores = sessions.map(getSessionScore).filter(s => s != null);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

function bestScore(sessions) {
  if (!sessions.length) return 0;
  const scores = sessions.map(getSessionScore).filter(s => s != null);
  return scores.length ? Math.max(...scores) : 0;
}

function currentStreak(sessions) {
  let streak = 0;
  for (let i = 0; i < sessions.length; i++) {
    const s = getSessionScore(sessions[i]);
    if (s != null && s >= 70) streak++;
    else break;
  }
  return streak;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    .toUpperCase()
    .replace(',', '');
}

function ScoreTrendChart({ sessions }) {
  // sessions is ordered newest-to-oldest (0 is newest)
  // We want the 7 newest sessions, ordered oldest-to-newest for the chart
  const last7 = sessions.slice(0, 7).reverse();
  if (last7.length === 0) return null;

  const W = 400;
  const H = 60;
  const pad = 8;
  const scores = last7.map((s) => s.score ?? 0);
  const minS = Math.max(0, Math.min(...scores) - 10);
  const maxS = Math.min(100, Math.max(...scores) + 10);
  const range = maxS - minS || 1;

  const points = scores.length === 1 
    ? [`${W / 2},${pad + (1 - (scores[0] - minS) / range) * (H - pad * 2)}`]
    : scores.map((s, i) => {
        const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
        const y = pad + (1 - (s - minS) / range) * (H - pad * 2);
        return `${x},${y}`;
      });

  const pathD = `M ${points.join(' L ')}`;

  // Gradient fill area
  let fillD = "";
  if (points.length > 0) {
    fillD = `M ${points[0]} L ${points.join(' L ')} L ${
      scores.length === 1 ? W / 2 : pad + (W - pad * 2)
    },${H} L ${scores.length === 1 ? W / 2 : pad},${H} Z`;
  }

  // Format dates for X axis
  const formatLabel = (dateStr) => {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${datePart} ${timePart}`;
  };

  return (
    <div className="score-chart">
      <p className="score-chart__label">SCORE TREND</p>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fillD} fill="url(#chartGrad)" />
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {scores.map((s, i) => {
            const [x, y] = points[i].split(',').map(Number);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2.5"
                fill="var(--color-gold)"
                opacity={i === scores.length - 1 ? 1 : 0.5}
              />
            );
          })}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginTop: '8px' }}>
          {last7.map((s, i) => (
            <span key={i} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              {formatLabel(s.date)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Focus area progress bar (0-10 scale) ───────────────── */
function FocusBar({ label, score }) {
  const pct = Math.min((score / 10) * 100, 100);
  const fillClass =
    pct < 40 ? 'focus-bar-fill--low' : pct < 70 ? 'focus-bar-fill--mid' : 'focus-bar-fill--high';

  return (
    <div className="focus-item">
      <div className="focus-item__header">
        <span className="focus-item__label">{label}</span>
        <span className="focus-item__score">{score}/10</span>
      </div>
      <div className="focus-bar-track">
        <div
          className={`focus-bar-fill ${fillClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const { sessions, setCurrentSession, user } = useSession();

  // sessions[0] is the newest session because we prepend in saveSession
  const lastSession = sessions.length > 0 ? sessions[0] : null;

  // KPI calculations
  const totalSessions = sessions.length;
  const averageScore = avg(sessions);
  const best = bestScore(sessions);
  const streak = currentStreak(sessions);

  // Resolve last session score + grade
  const lastScore = lastSession ? getSessionScore(lastSession) : null;
  const lastGrade = getGrade(lastScore);

  // Focus areas from last session competencies (lowest 3, on 0-10 scale)
  const lastFeedback = lastSession?.feedback?.feedback || lastSession?.feedback;
  let focusAreas = [];
  if (lastFeedback?.competencies) {
    focusAreas = Object.values(lastFeedback.competencies)
      .filter(c => c.score != null)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }

  function handleViewReport() {
    if (lastSession) {
      setCurrentSession(lastSession);
      navigate('/feedback');
    }
  }

  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Guest';

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main */}
      <div className="dashboard-main">
        {/* Top bar */}
        <div className="dashboard-topbar">
          <h1 className="dashboard-topbar__greeting">Welcome back, {firstName}.</h1>
          <button
            className="dashboard-topbar__cta"
            onClick={() => {
              setCurrentSession({}); // Clear old session data
              navigate('/mode');
            }}
            id="start-new-session-btn"
          >
            Start New Session →
          </button>
        </div>

        {/* Scrollable content */}
        <div className="dashboard-content">
          {/* ── KPI Cards ── */}
          <div className="dashboard-kpi-grid">
            <div className="kpi-card">
              <span className="kpi-card__label">Total Sessions</span>
              <span className="kpi-card__value">{totalSessions}</span>
              <span className="kpi-card__sub">lifetime deliveries</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-card__label">Average Score</span>
              <span className="kpi-card__value">{averageScore}</span>
              <span className="kpi-card__sub">out of 100</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-card__label">Best Score</span>
              <span className="kpi-card__value">{best}</span>
              <span className="kpi-card__sub">personal record</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-card__label">Current Streak</span>
              <span className="kpi-card__value">{streak}</span>
              <span className="kpi-card__sub">sessions ≥ 70</span>
            </div>
          </div>

          {/* ── Lower 2-col grid ── */}
          <div className="dashboard-lower">
            {/* Last Session card (2/3) */}
            <div className="panel-card">
              <div className="panel-card__header">
                <h2 className="panel-card__title">Last Session</h2>
                {lastSession && (
                  <span className="session-meta__date">
                    {formatDate(lastSession.date)}
                  </span>
                )}
              </div>

              <div className="panel-card__body">
                {!lastSession ? (
                  <div className="empty-state">
                    <div className="empty-state__icon">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="2" y="2" width="14" height="14" stroke="var(--color-border-warm)" strokeWidth="1" />
                        <line x1="6" y1="9" x2="12" y2="9" stroke="var(--color-border-warm)" strokeWidth="1" />
                        <line x1="9" y1="6" x2="9" y2="12" stroke="var(--color-border-warm)" strokeWidth="1" />
                      </svg>
                    </div>
                    <p className="empty-state__text">
                      No sessions yet. Start your first training session.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Meta row */}
                    <div className="session-meta">
                      {(lastSession.modeLabel || lastSession.mode) && (
                        <span className="session-meta__tag">
                          {lastSession.modeLabel || lastSession.mode.replace(/_/g, ' ')}
                        </span>
                      )}
                      {lastSession.duration && (
                        <span className="session-meta__duration">
                          {lastSession.duration}
                        </span>
                      )}
                    </div>

                    {/* Brief excerpt */}
                    {lastSession.briefExcerpt && (
                      <p className="session-brief">
                        "{lastSession.briefExcerpt.replace(/#/g, '').trim()}"
                      </p>
                    )}

                    {/* Score row */}
                    <div className="session-score-row">
                      <span className="session-score__number" style={{ color: lastGrade?.color }}>
                        {lastScore ?? '—'}
                      </span>
                      <span className="session-score__out-of">/100</span>
                      {lastScore != null && lastGrade && (
                        <span
                          className="badge"
                          style={{ color: lastGrade.color, borderColor: lastGrade.color, background: 'transparent', border: `1px solid ${lastGrade.color}`, padding: '2px 10px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em' }}
                        >
                          {lastGrade.grade}
                        </span>
                      )}
                    </div>

                    {/* View report link */}
                    <button className="session-link" onClick={handleViewReport}>
                      View Report →
                    </button>

                    {/* Score trend chart */}
                    <ScoreTrendChart sessions={sessions} />
                  </>
                )}
              </div>
            </div>

            {/* Focus Areas card (1/3) */}
            <div className="panel-card">
              <div className="panel-card__header">
                <h2 className="panel-card__title">Focus Areas</h2>
              </div>

              <div className="panel-card__body">
                {focusAreas.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state__icon">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="6" stroke="#4d4636" strokeWidth="1" />
                        <circle cx="9" cy="9" r="2" fill="#4d4636" />
                      </svg>
                    </div>
                    <p className="empty-state__text">
                      Complete a session to see your focus areas.
                    </p>
                  </div>
                ) : (
                  <div className="focus-list">
                    {focusAreas.map((area) => (
                      <FocusBar
                        key={area.label}
                        label={area.label}
                        score={area.score}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
