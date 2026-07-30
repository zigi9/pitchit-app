import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import './CustomScenario.css';

const DURATION_OPTIONS = [
  { label: '1 MIN', value: 60 },
  { label: '2 MIN', value: 120 },
  { label: '3 MIN', value: 180 },
  { label: '5 MIN', value: 300 },
];

const DIFFICULTY_OPTIONS = [
  { label: 'STANDARD', value: 'STANDARD' },
  { label: 'STRICT', value: 'STRICT' },
  { label: 'EXECUTIVE', value: 'EXECUTIVE' },
];

const MAX_BRIEF_LENGTH = 800;

export default function CustomScenario() {
  const navigate = useNavigate();
  const { setCurrentSession } = useSession();
  const fileInputRef = useRef(null);

  const [brief, setBrief] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(180);
  const [selectedDifficulty, setSelectedDifficulty] = useState('STANDARD');
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileError, setFileError] = useState(null);

  const handleBriefChange = (e) => {
    if (e.target.value.length <= MAX_BRIEF_LENGTH) {
      setBrief(e.target.value);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setFileError('Invalid file type. Please upload PDF, TXT, or DOCX.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File exceeds 5MB limit.');
      return;
    }
    setFileError(null);
    setUploadedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const handleBeginPreparation = () => {
    setCurrentSession((prev) => ({
      ...prev,
      mode: 'CUSTOM',
      modeLabel: 'Custom Scenario',
      brief,
      duration: selectedDuration,
      difficulty: selectedDifficulty,
      file: uploadedFile,
    }));
    navigate('/preparation');
  };

  const isReady = brief.trim().length > 0;

  return (
    <div className="custom-scenario">
      {/* Top Navigation */}
      <nav className="custom-nav">
        <button className="nav-back" onClick={() => navigate('/mode')}>
          ← BACK
        </button>
        <span className="nav-logo">PITCHIT</span>
        <span className="nav-step">Custom Setup</span>
      </nav>

      {/* Header */}
      <header className="custom-header">
        <h1 className="custom-title">Custom Scenario Setup</h1>
        <p className="custom-subtitle">
          <em>Define your own presentation brief before the session begins.</em>
        </p>
      </header>

      {/* Main 2-col layout */}
      <main className="custom-main">
        {/* Left: Brief textarea */}
        <section className="custom-brief" aria-label="Presentation brief">
          <label className="field-label" htmlFor="brief-textarea">
            PRESENTATION BRIEF
          </label>
          <textarea
            id="brief-textarea"
            className="brief-textarea"
            value={brief}
            onChange={handleBriefChange}
            placeholder="Describe the scenario, audience, and what you need to present..."
            rows={12}
          />
          <div className="brief-counter">
            <span className={brief.length >= MAX_BRIEF_LENGTH ? 'brief-counter--max' : ''}>
              {brief.length} / {MAX_BRIEF_LENGTH}
            </span>
          </div>
        </section>

        {/* Right: File upload */}
        <section className="custom-upload" aria-label="File upload">
          <label className="field-label">
            UPLOAD BRIEF <span className="field-label--optional">(OPTIONAL)</span>
          </label>
          <div
            className={`dropzone${dragOver ? ' dropzone--active' : ''}${uploadedFile ? ' dropzone--filled' : ''}`}
            onClick={handleDropzoneClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            role="button"
            tabIndex={0}
            aria-label="Upload file dropzone"
            id="file-dropzone"
            onKeyDown={(e) => e.key === 'Enter' && handleDropzoneClick()}
          >
            <span className="dropzone__icon" aria-hidden="true">↑</span>
            {uploadedFile ? (
              <div className="dropzone__file">
                <span className="dropzone__filename">{uploadedFile.name}</span>
                <button
                  className="dropzone__remove"
                  onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <span className="dropzone__primary">Drag & drop or click to browse</span>
                <span className="dropzone__types">PDF · TXT · DOCX — MAX 5MB</span>
                {fileError && <span className="dropzone__error" style={{color: 'var(--color-danger)', marginTop: '8px', fontSize: '12px'}}>{fileError}</span>}
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              className="dropzone__input"
              onChange={handleFileInput}
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>
        </section>
      </main>

      {/* Controls */}
      <section className="custom-controls">
        {/* Duration */}
        <div className="control-group">
          <label className="field-label">DURATION</label>
          <div className="segmented-control" role="group" aria-label="Duration selection">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`segmented-btn${selectedDuration === opt.value ? ' segmented-btn--active' : ''}`}
                onClick={() => setSelectedDuration(opt.value)}
                id={`duration-${opt.value}`}
                aria-pressed={selectedDuration === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="control-group">
          <label className="field-label">DIFFICULTY</label>
          <div className="segmented-control" role="group" aria-label="Difficulty selection">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`segmented-btn${selectedDifficulty === opt.value ? ' segmented-btn--active' : ''}`}
                onClick={() => setSelectedDifficulty(opt.value)}
                id={`difficulty-${opt.value.toLowerCase()}`}
                aria-pressed={selectedDifficulty === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="control-hint">Standard is recommended for first-time sessions.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="custom-footer">
        <button
          className="btn-ghost"
          onClick={() => navigate('/mode')}
          id="custom-back-btn"
        >
          ← Back to Mode Selection
        </button>
        <button
          className={`btn-gold${!isReady ? ' btn-gold--disabled' : ''}`}
          onClick={handleBeginPreparation}
          disabled={!isReady}
          id="custom-begin-btn"
        >
          BEGIN PREPARATION →
        </button>
      </footer>
    </div>
  );
}
