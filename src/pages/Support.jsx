import { useNavigate } from 'react-router-dom';
import './Legal.css';

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="legal-root">
      <header className="legal-topbar">
        <button className="legal-back" onClick={() => window.history.length > 2 ? navigate(-1) : navigate('/')}>← BACK</button>
        <span className="legal-brand">PITCHIT</span>
        <span className="legal-label">LEGAL</span>
      </header>

      <main className="legal-content">
        <p className="legal-eyebrow">HELP CENTER</p>
        <h1 className="legal-title">Support</h1>
        <p className="legal-updated">I'm here to help you get the most out of PitchIt.</p>

        <section className="legal-section">
          <h2>Contact Me</h2>
          <p>
            If you have questions, encounter issues, or want to request a feature, 
            feel free to reach out. This is a solo project, but I'll do my best to respond quickly.
          </p>
          <div className="legal-contact-grid">
            <div className="legal-contact-card">
              <p className="legal-contact-label">CONTACT</p>
              <span className="legal-contact-value">
                Contact channels coming soon
              </span>
            </div>
            <div className="legal-contact-card">
              <p className="legal-contact-label">STATUS</p>
              <span className="legal-contact-value">Early Access</span>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>Frequently Asked Questions</h2>

          <div className="legal-faq-item">
            <p className="legal-faq-q">How does the AI analysis work?</p>
            <p className="legal-faq-a">
              After you finish recording your presentation, your speech transcript (and optionally webcam frames) 
              are sent to an AI model for analysis. The model evaluates your structure, delivery, persuasiveness, 
              and logical coherence, then returns a detailed performance report with an overall score.
            </p>
          </div>

          <div className="legal-faq-item">
            <p className="legal-faq-q">Is my data stored or used for AI training?</p>
            <p className="legal-faq-a">
              No. Your audio and video are processed ephemerally — they exist only in memory during your session 
              and are discarded after the report is generated. Your content is not used to train AI models.
            </p>
          </div>

          <div className="legal-faq-item">
            <p className="legal-faq-q">Where is my session history saved?</p>
            <p className="legal-faq-a">
              All of your historical data, profiles, and generated reports are stored locally in your browser's 
              Local Storage. If you clear your browser data, your history will be permanently deleted.
            </p>
          </div>
        </section>

      </main>

      <footer className="legal-footer">
        <span>© 2026 PITCHIT. A PROJECT BY FILIP ZIGMUND.</span>
      </footer>
    </div>
  );
}
