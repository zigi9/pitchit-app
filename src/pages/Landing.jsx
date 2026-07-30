import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      {/* ── Decorative corners ── */}
      <div className="landing-corner landing-corner--tl" />
      <div className="landing-corner landing-corner--tr" />
      <div className="landing-corner landing-corner--bl" />
      <div className="landing-corner landing-corner--br" />

      {/* ── Top bar ── */}
      <header className="landing-topbar">
        <span className="landing-topbar__brand">
          Executive Laboratory&nbsp;&nbsp;|&nbsp;&nbsp;PitchIt
        </span>
      </header>

      {/* ── Bottom bar ── */}
      <footer className="landing-bottombar">
        <span className="landing-bottombar__text">
          Rigorous Performance Analysis — AI-Powered Presentation Training
        </span>
      </footer>

      {/* ── Main centered content ── */}
      <main className="landing-page">
        <div className="landing-center">
          {/* Eyebrow */}
          <p className="landing-eyebrow">Presentation Training System</p>

          {/* H1 */}
          <h1 className="landing-h1">
            Train to present{'\n'}
            <em>under pressure.</em>
          </h1>

          {/* Body */}
          <p className="landing-body">
            Get a random brief. Deliver live. Receive AI feedback on your
            voice, body language, structure and persuasiveness.
          </p>

          {/* Workflow steps */}
          <div className="landing-workflow">
            <span className="landing-workflow__step">Random Scenario</span>
            <span className="landing-workflow__arrow">→</span>
            <span className="landing-workflow__step">Live Delivery</span>
            <span className="landing-workflow__arrow">→</span>
            <span className="landing-workflow__step">AI Feedback</span>
          </div>

          {/* CTA */}
          <button
            className="landing-cta"
            onClick={() => navigate('/mode')}
            id="begin-session-btn"
          >
            Begin Session
          </button>

          {/* Sub-text */}
          <p className="landing-subtext">
            No account required. Start training immediately.
          </p>
        </div>
      </main>
    </>
  );
}
