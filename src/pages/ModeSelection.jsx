import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import './ModeSelection.css';

const MODES = [
  {
    id: 'INVESTOR_PITCH',
    label: 'Investor Pitch',
    title: 'INVESTOR PITCH',
    description: '3-minute pitch to seed investors',
    difficulty: 'ADVANCED',
  },
  {
    id: 'CONFERENCE_TALK',
    label: 'Conference Talk',
    title: 'CONFERENCE TALK',
    description: '5-minute conference talk opening',
    difficulty: 'INTERMEDIATE',
  },
  {
    id: 'TEDX_TALK',
    label: 'TEDx Talk',
    title: 'TEDX TALK',
    description: '3-minute opening of a TEDx-style talk',
    difficulty: 'ADVANCED',
  },
  {
    id: 'PRODUCT_DEMO',
    label: 'Product Demo',
    title: 'PRODUCT DEMO',
    description: '3-minute live product presentation',
    difficulty: 'INTERMEDIATE',
  },
  {
    id: 'ACADEMIC',
    label: 'Academic Presentation',
    title: 'ACADEMIC PRESENTATION',
    description: '4-minute thesis/research presentation',
    difficulty: 'INTERMEDIATE',
  },
  {
    id: 'CUSTOM',
    label: 'Custom Scenario',
    title: 'CUSTOM SCENARIO',
    description: 'Upload your own brief and topic',
    difficulty: 'CUSTOM',
  },
];

const DURATION_MAP = {
  INVESTOR_PITCH: 180,
  CONFERENCE_TALK: 300,
  TEDX_TALK: 180,
  PRODUCT_DEMO: 180,
  ACADEMIC: 240,
  CUSTOM: 120,
};

export default function ModeSelection() {
  const navigate = useNavigate();
  const { setCurrentSession } = useSession();
  const [selectedMode, setSelectedMode] = useState('INVESTOR_PITCH');

  const handleContinue = () => {
    const mode = MODES.find((m) => m.id === selectedMode);
    if (selectedMode === 'CUSTOM') {
      navigate('/custom');
      return;
    }
    setCurrentSession((prev) => ({
      ...prev,
      mode: selectedMode,
      modeLabel: mode.label,
      duration: DURATION_MAP[selectedMode],
    }));
    navigate('/preparation');
  };

  return (
    <div className="mode-selection">
      {/* Top Navigation */}
      <nav className="mode-nav">
        <button className="nav-back" onClick={() => navigate('/dashboard')}>
          ← BACK
        </button>
        <span className="nav-logo">PITCHIT</span>
        <span className="nav-step">Mode Selection</span>
      </nav>

      {/* Header */}
      <header className="mode-header">
        <h1 className="mode-title">Select Your Mode</h1>
        <p className="mode-subtitle">
          Choose the presentation format for your training session.
        </p>
      </header>

      {/* Cards Grid */}
      <main className="mode-grid">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            className={`mode-card${selectedMode === mode.id ? ' mode-card--selected' : ''}${mode.difficulty === 'CUSTOM' ? ' mode-card--custom' : ''}`}
            onClick={() => setSelectedMode(mode.id)}
            aria-pressed={selectedMode === mode.id}
            id={`mode-card-${mode.id.toLowerCase()}`}
          >
            <div className="mode-card__top">
              <span className="mode-card__title">
                {mode.title}
                {mode.difficulty === 'CUSTOM' && (
                  <span className="mode-card__icon" aria-hidden="true"> ✦</span>
                )}
              </span>
              <span
                className={`mode-card__badge mode-card__badge--${mode.difficulty.toLowerCase()}`}
              >
                {mode.difficulty}
              </span>
            </div>
            <p className="mode-card__desc">{mode.description}</p>
            {selectedMode === mode.id && (
              <span className="mode-card__selected-indicator" aria-hidden="true" />
            )}
          </button>
        ))}
      </main>

      {/* Bottom Bar */}
      <footer className="mode-footer">
        <div className="mode-footer__inner">
          <span className="mode-footer__hint">
            {MODES.find((m) => m.id === selectedMode)?.label} selected
          </span>
          <button
            className="btn-gold"
            onClick={handleContinue}
            id="mode-continue-btn"
          >
            CONTINUE →
          </button>
        </div>
      </footer>
    </div>
  );
}
