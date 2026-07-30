import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNav from '../components/SidebarNav';
import { useSession } from '../context/SessionContext';
import './History.css';

const PAGE_SIZE = 10;

/* ── Scoring (mirrors FeedbackReport) ────────────────────── */
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
  let weightedSum = 0, totalWeight = 0;
  Object.entries(competencies).forEach(([key, comp]) => {
    const w = weights[key] ?? 0;
    if (w === 0) return;
    weightedSum += (Math.max(0, Math.min(10, comp.score ?? 0)) / 10) * 100 * w;
    totalWeight += w;
  });
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
}

function getSessionScore(session) {
  if (session.score != null) return session.score;
  const fb = session.feedback?.feedback || session.feedback;
  if (fb?.competencies) return computeWeightedScore(fb.competencies, session.mode);
  if (fb?.overallScore != null) return fb.overallScore;
  return null;
}

function getGrade(score) {
  if (score == null) return { grade: '—', color: '#99907c' };
  if (score >= 90) return { grade: 'S', color: '#e7c353' };
  if (score >= 80) return { grade: 'A', color: '#c8a84b' };
  if (score >= 70) return { grade: 'B', color: '#a0855a' };
  if (score >= 55) return { grade: 'C', color: '#8b7355' };
  if (score >= 40) return { grade: 'D', color: '#8b4a35' };
  return { grade: 'F', color: '#8b2020' };
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr)
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    .toUpperCase();
}

function truncate(str, n = 60) {
  if (!str) return '—';
  return str.length > n ? str.slice(0, n) + '…' : str;
}
/* ---- Simple SVG Line Chart ---- */
function ScoreTrendChart({ sessions }) {
  const width = 800;
  const height = 200;
  const padding = 24;
  const scores = sessions.map(s => getSessionScore(s) ?? 0);
  const dates = sessions.map((s) => {
    const d = new Date(s.date);
    const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${datePart} ${timePart}`;
  });

  const minScore = Math.max(0, Math.min(...scores) - 15);
  const maxScore = Math.min(100, Math.max(...scores) + 15);
  const range = maxScore - minScore || 1;

  const xStep = (width - padding * 2) / (scores.length - 1 || 1);
  const yScale = (v) => padding + ((maxScore - v) / range) * (height - padding * 2);

  const points = scores.length === 1
    ? [{ x: width / 2, y: yScale(scores[0]) }]
    : scores.map((s, i) => ({
        x: padding + i * xStep,
        y: yScale(s),
      }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="hist-chart-card">
      <p className="hist-chart-label">SCORE TREND</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="hist-chart-svg"
        aria-label="Score trend chart"
        preserveAspectRatio="none"
        style={{ height: '200px' }}
      >
        {/* Y-axis lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + ratio * (height - padding * 2);
          return (
            <line
              key={ratio}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="#2a2a2a"
              strokeWidth="1"
            />
          );
        })}
        <polyline
          points={polyline}
          fill="none"
          stroke="var(--color-gold, #e7c353)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5" fill="var(--color-gold, #e7c353)" />
        ))}
      </svg>
      <div className="hist-chart-dates" style={{ justifyContent: dates.length === 1 ? 'center' : 'space-between' }}>
        {dates.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
    </div>
  );
}

/* ---- Mini Sparkline (last 3 scores) ---- */
function Sparkline({ scores }) {
  if (!scores || scores.length === 0) return <span className="hist-spark-empty">—</span>;
  const last = scores.slice(-3);
  const w = 36;
  const h = 16;
  const minS = Math.max(0, Math.min(...last) - 10);
  const maxS = Math.min(100, Math.max(...last) + 10);
  const range = maxS - minS || 1;
  
  const xStep = (w - 4) / (last.length - 1 || 1);
  const yScale = (v) => 2 + ((maxS - v) / range) * (h - 4);
  
  const pts = last.length === 1
    ? [{ x: w / 2, y: yScale(last[0]) }]
    : last.map((s, i) => ({ x: 2 + i * xStep, y: yScale(s) }));
    
  const poly = pts.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="hist-spark">
      <polyline
        points={poly}
        fill="none"
        stroke="var(--color-gold, #e7c353)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.8" fill="var(--color-gold, #e7c353)" />
      ))}
    </svg>
  );
}

function computeCompetencyAverages(sessions) {
  const totals = {};
  const counts = {};

  sessions.forEach(session => {
    const f = session.feedback?.feedback || session.feedback;
    if (f && f.competencies) {
      Object.entries(f.competencies).forEach(([key, data]) => {
        if (typeof data.score === 'number') {
          if (!totals[key]) { totals[key] = 0; counts[key] = 0; }
          totals[key] += data.score;
          counts[key] += 1;
        }
      });
    }
  });

  const formattedLabels = {
    structureLogic: 'Structure & Logic',
    voiceDelivery: 'Voice & Delivery',
    bodyLanguage: 'Body Language',
    persuasion: 'Persuasion',
    qnaReadiness: 'Q&A Readiness',
    timeManagement: 'Time Management',
    statusMarkers: 'Status Markers',
    emotionalResonance: 'Emotional Resonance',
    marketClarity: 'Market Clarity'
  };

  return Object.keys(totals).map(key => ({
    key,
    label: formattedLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    avg: Math.round(totals[key] / counts[key])
  })).sort((a, b) => b.avg - a.avg);
}

export default function History() {
  const { sessions, clearHistory } = useSession();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });

  const sorted = useMemo(
    () => [...(sessions || [])].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [sessions]
  );

  const visible = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = sorted.length > visible.length;

  /* Build running score list per session for sparklines */
  const allScores = useMemo(
    () => sorted.map(s => getSessionScore(s) ?? 0).reverse(),
    [sorted]
  );

  const compAverages = useMemo(() => computeCompetencyAverages(sorted), [sorted]);
  const strongest = compAverages.length > 0 ? compAverages[0] : null;
  const weakest = compAverages.length > 0 ? compAverages[compAverages.length - 1] : null;

  return (
    <div className="hist-root">
      <SidebarNav />
      <main className="hist-main">
        <header className="hist-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="hist-h1">Performance History</h1>
            <p className="hist-subtitle">
              Log of previous analytical sessions and performance metrics.
            </p>
          </div>
          {sessions?.length > 0 && (
            <button 
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: 'Wipe Session History',
                  message: 'Are you sure you want to permanently delete all history? This action cannot be undone.',
                  isDanger: true,
                  onConfirm: () => {
                    clearHistory();
                    setConfirmModal({ isOpen: false });
                  }
                });
              }} 
              className="hist-btn-danger" 
            >
              CLEAR HISTORY
            </button>
          )}
        </header>

        {/* Trend chart */}
        {sorted.length > 0 && <ScoreTrendChart sessions={[...sorted].reverse()} />}

        {/* Competency Breakdown */}
        {sorted.length > 0 && compAverages.length > 0 && (
          <div className="hist-comp-breakdown" style={{ marginTop: '24px', padding: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border-dark)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '13px', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
                Competency Breakdown
              </h2>
              <div style={{ display: 'flex', gap: '24px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>STRONGEST</span>
                  <span style={{ color: 'var(--color-gold)' }}>{strongest?.label} ({strongest?.avg})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>WEAKEST</span>
                  <span style={{ color: 'var(--color-red)' }}>{weakest?.label} ({weakest?.avg})</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {compAverages.map(c => (
                <div key={c.key} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{c.label}</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{c.avg}/10</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'var(--color-bg-base)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${Math.min(c.avg * 10, 100)}%`, background: c.avg >= 8 ? 'var(--color-gold)' : c.avg >= 6 ? 'var(--color-text-muted)' : 'var(--color-red)', transition: 'width 1s ease-out' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        {sorted.length === 0 ? (
          <div className="hist-empty">
            <p className="hist-empty-icon">◈</p>
            <p className="hist-empty-title">No sessions recorded yet.</p>
            <p className="hist-empty-sub">
              Start your first training session to begin tracking your performance.
            </p>
          </div>
        ) : (
          <div className="hist-table-wrap">
            <table className="hist-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>MODE</th>
                  <th>SCENARIO</th>
                  <th>SCORE</th>
                  <th>RESULT</th>
                  <th>TREND</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((session, idx) => {
                  const score = getSessionScore(session);
                  const { grade, color: gradeColor } = getGrade(score);
                  const sparkScores = allScores.slice(0, sorted.length - idx);

                  return (
                    <tr
                      key={session.id || idx}
                      className="hist-row"
                      onClick={() => navigate(`/feedback/${session.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="hist-cell-date">{formatDate(session.date)}</td>
                      <td className="hist-cell-mode">
                        {session.modeLabel || session.mode?.replace(/_/g, ' ') || '—'}
                      </td>
                      <td className="hist-cell-scenario">
                        {truncate((session.briefExcerpt || '').replace(/#/g, '').trim(), 60)}
                      </td>
                      <td className="hist-cell-score" style={{ color: gradeColor, fontWeight: 700 }}>
                        {score != null ? score : '—'}
                      </td>
                      <td className="hist-cell-result">
                        <span
                          className="hist-badge"
                          style={{ color: gradeColor, borderColor: gradeColor }}
                        >
                          {grade}
                        </span>
                      </td>
                      <td className="hist-cell-spark">
                        <Sparkline scores={sparkScores} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {hasMore && (
          <div className="hist-load-more">
            <button
              className="hist-btn-outline"
              onClick={() => setPage((p) => p + 1)}
            >
              LOAD MORE RECORDS
            </button>
          </div>
        )}
      </main>

      {/* ---- Confirmation Modal ---- */}
      {confirmModal.isOpen && (
        <div className="prof-modal-overlay">
          <div className="prof-modal">
            <h3 className="prof-modal-title">{confirmModal.title}</h3>
            <p className="prof-modal-message">{confirmModal.message}</p>
            <div className="prof-modal-actions">
              <button 
                className="prof-btn-ghost" 
                onClick={() => setConfirmModal({ isOpen: false })}
              >
                CANCEL
              </button>
              <button 
                className={confirmModal.isDanger ? "prof-btn-danger" : "prof-btn-gold"} 
                onClick={confirmModal.onConfirm}
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
