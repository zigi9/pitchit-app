import { useNavigate } from 'react-router-dom';
import './Legal.css';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="legal-root">
      <header className="legal-topbar">
        <button className="legal-back" onClick={() => window.history.length > 2 ? navigate(-1) : navigate('/')}>← BACK</button>
        <span className="legal-brand">PITCHIT</span>
        <span className="legal-label">LEGAL</span>
      </header>

      <main className="legal-content">
        <p className="legal-eyebrow">PRIVACY POLICY</p>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: July 2026</p>

        <section className="legal-section">
          <h2>1. Data Collection</h2>
          <p>
            PitchIt collects minimal data necessary to provide its features. When you use the platform, 
            the application processes the following information during your session: audio from your microphone, video from your 
            webcam (if enabled), and the resulting speech-to-text transcript. Your display name, 
            email address, and session history are stored entirely locally on your device.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Ephemeral Processing</h2>
          <p>
            Your audio and video feeds are processed ephemerally. This means they are analyzed in memory during 
            your active session and are discarded immediately after your performance report is generated. 
            Raw audio or video recordings are not stored on any server. The only persistent data is the 
            AI-generated feedback report and your session metadata (score, date, mode) stored in your own browser.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Third-Party AI Models</h2>
          <p>
            To generate feedback and scores, PitchIt sends your text transcripts (and optionally visual metadata) 
            to third-party Large Language Model providers (e.g., Groq) via secure API connections. 
            Your presentation content is not incorporated into their machine learning models for public training.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Your Data Rights</h2>
          <p>
            Since all data is stored locally in your browser, you maintain full control. Clearing your browser's 
            local storage or using the "Wipe Session History" feature in the Settings page will permanently and 
            irrecoverably delete all your session data.
          </p>
        </section>

      </main>

      <footer className="legal-footer">
        <span>© 2026 PITCHIT. A PROJECT BY FILIP ZIGMUND.</span>
      </footer>
    </div>
  );
}
