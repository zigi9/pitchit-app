import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { generateBrief } from '../services/groq';
import './Preparation.css';

const MODES = {
  CUSTOM: 'CUSTOM',
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function wordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readingMinutes(text) {
  return Math.max(1, Math.round(wordCount(text) / 200));
}

export default function Preparation() {
  const navigate = useNavigate();
  const { currentSession, setCurrentSession, user } = useSession();

  const mode = currentSession?.mode || 'PITCH';
  const prepTime = user?.preferences?.defaultPrepTime || 300;

  const [brief, setBrief] = useState(currentSession?.brief || '');
  const [briefTitle, setBriefTitle] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [prepTimeLeft, setPrepTimeLeft] = useState(prepTime);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef(null);
  const timerStartedRef = useRef(false);

  // Start countdown
  function startCountdown() {
    if (timerStartedRef.current) return;
    timerStartedRef.current = true;
    timerRef.current = setInterval(() => {
      setPrepTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadBrief() {
      // CUSTOM mode with existing brief
      if (mode === MODES.CUSTOM && brief) {
        setBriefTitle('Custom Brief');
        setKeyPoints([]);
        startCountdown();
        return;
      }

      // Already have a brief stored
      if (currentSession?.brief && currentSession.brief.trim().length > 0) {
        const stored = currentSession.brief;
        setBrief(stored);
        setBriefTitle(currentSession.briefTitle || 'Your Brief');
        setKeyPoints(currentSession.keyPoints || []);
        startCountdown();
        return;
      }

      // Generate brief via AI
      setIsLoading(true);
      try {
        const result = await generateBrief(mode);
        if (cancelled) return;
        const content = result?.content || '';
        const title = result?.title || 'AI-Generated Brief';
        const points = result?.keyPoints || [];
        setBrief(content);
        setBriefTitle(title);
        setKeyPoints(points);
        setCurrentSession({
          ...currentSession,
          brief: content,
          briefTitle: title,
          keyPoints: points,
        });
        startCountdown();
      } catch (err) {
        console.error('generateBrief error:', err);
        if (!cancelled) {
          setBrief('Failed to generate brief. Please go back and try again.');
          setBriefTitle('Error');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadBrief();

    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timerPct = Math.max(0, (prepTime - prepTimeLeft) / prepTime);
  const timerDanger = prepTimeLeft <= 30;

  function handleReady() {
    setCurrentSession((prev) => ({ ...prev, notes }));
    navigate('/live');
  }

  const wc = wordCount(brief);
  const rm = readingMinutes(brief);

  return (
    <div className="prep-root">
      {/* TOP BAR */}
      <header className="prep-topbar">
        <button className="prep-back-btn" onClick={() => navigate('/mode')}>
          ← BACK
        </button>
        <span className="prep-topbar-center label-caps gold">PITCHIT</span>
        <span className="prep-topbar-right label-caps muted">
          {mode} MODE
        </span>
      </header>

      {/* MAIN CONTENT */}
      <div className="prep-main">
        {/* LEFT — Article Reader */}
        <section className="prep-article">
          <div className="prep-article-header">
            {isLoading ? (
              <div className="prep-loading">
                <span className="prep-loading-dot" />
                <span className="prep-loading-text">Generating your brief…</span>
              </div>
            ) : (
              <>
                <h1 className="prep-brief-title">{briefTitle || 'Your Brief'}</h1>
                <p className="prep-brief-meta mono">
                  ~{wc} words · {rm} min read
                </p>
                <div className="prep-gold-divider" />
              </>
            )}
          </div>

          {!isLoading && prepTimeLeft === 0 && (
            <div className="prep-time-up-overlay" style={{ textAlign: 'center', marginTop: '80px' }}>
              <h2 style={{ color: '#8B2020', fontSize: '32px', letterSpacing: '0.1em' }}>TIME'S UP</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', marginTop: '16px' }}>
                The brief is hidden. It is time to rely on your notes and memory.
              </p>
            </div>
          )}

          {!isLoading && prepTimeLeft > 0 && (
            <>
              <div className="prep-brief-body">
                {brief.split('\n').map((para, i) => {
                  const trimmed = para.trim();
                  if (!trimmed) return null;
                  if (trimmed.startsWith('### ')) {
                    return <h3 key={i} style={{ color: 'var(--color-gold)', marginTop: '24px', marginBottom: '12px', fontSize: '18px', fontWeight: 600 }}>{trimmed.replace('### ', '')}</h3>;
                  }
                  if (trimmed.startsWith('## ')) {
                    return <h2 key={i} style={{ color: 'var(--color-gold)', marginTop: '24px', marginBottom: '12px', fontSize: '20px', fontWeight: 600 }}>{trimmed.replace('## ', '')}</h2>;
                  }
                  return <p key={i}>{para}</p>;
                })}
              </div>

              {keyPoints.length > 0 && (
                <div className="prep-key-points">
                  <div className="prep-section-label label-caps">KEY POINTS</div>
                  <ul className="prep-kp-list">
                    {keyPoints.map((pt, i) => (
                      <li key={i} className="prep-kp-item">
                        <span className="prep-kp-bullet gold">▸</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>

        {/* RIGHT — Sticky Sidebar */}
        <aside className="prep-sidebar">
          {/* SCENARIO CARD */}
          <div className="prep-card">
            <div className="prep-card-label label-caps">SCENARIO</div>
            <div className="prep-scenario-mode">{mode}</div>
            <div className="prep-scenario-sub muted mono">
              Duration: {currentSession?.duration || 120}s
              &nbsp;·&nbsp;
              Prep: {prepTime}s
            </div>
          </div>

          {/* COUNTDOWN TIMER */}
          <div className="prep-card prep-timer-card">
            <div className="prep-card-label label-caps">PREPARATION TIME</div>
            <div
              className="prep-timer-clock mono"
              data-danger={timerDanger}
              style={{ color: timerDanger ? '#8B2020' : '#e7c353' }}
            >
              {formatTime(prepTimeLeft)}
            </div>
            <div className="prep-timer-bar-track">
              <div
                className="prep-timer-bar-fill"
                style={{
                  width: `${timerPct * 100}%`,
                  background: timerDanger ? '#8B2020' : '#e7c353',
                }}
              />
            </div>
            {prepTimeLeft === 0 && (
              <p className="prep-timer-alert">Time's up — begin when ready!</p>
            )}
          </div>

          {/* QUICK NOTES */}
          <div className="prep-card prep-notes-card">
            <div className="prep-card-label label-caps">QUICK NOTES</div>
            <textarea
              className="prep-notes-area"
              placeholder="Jot down key points, structure, opening line…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
          </div>

          {/* CTA */}
          <div className="prep-cta-section">
            <button
              id="prep-ready-btn"
              className="prep-ready-btn"
              onClick={handleReady}
              disabled={isLoading}
            >
              I'M READY — BEGIN RECORDING
            </button>
            <div className="prep-camera-status label-caps">
              <span className="prep-camera-dot" />
              CAMERA ARMED
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
