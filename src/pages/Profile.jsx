/* ============================================================
   Profile.jsx — PitchIt
   ============================================================ */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SidebarNav from '../components/SidebarNav';
import { useSession } from '../context/SessionContext';
import './Profile.css';

const RIGOR_OPTIONS = ['STANDARD', 'STRICT', 'EXECUTIVE'];
const PREP_TIMES = ['5 MIN', '7 MIN', '10 MIN'];
const DEPTH_OPTIONS = ['SURFACE', 'DEEP'];

function Avatar({ name }) {
  const initials = (name || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return <div className="prof-avatar">{initials}</div>;
}

function EditableField({ label, value, onSave, validate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState(null);

  const handleSave = () => {
    if (validate) {
      const errMsg = validate(draft);
      if (errMsg) {
        setError(errMsg);
        return;
      }
    }
    setError(null);
    onSave(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setError(null);
    setEditing(false);
  };

  return (
    <div className="prof-field">
      <span className="prof-field-label">{label}</span>
      {editing ? (
        <div className="prof-field-edit-container">
          <div className="prof-field-edit">
            <input
              className={`prof-input ${error ? 'prof-input-error' : ''}`}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError(null);
              }}
              autoFocus
            />
            <button className="prof-btn-sm-gold" onClick={handleSave}>SAVE</button>
            <button className="prof-btn-sm-ghost" onClick={handleCancel}>CANCEL</button>
          </div>
          {error && <span className="prof-field-error">{error}</span>}
        </div>
      ) : (
        <div className="prof-field-row">
          <span className="prof-field-value">{value || '—'}</span>
          <button className="prof-edit-link" onClick={() => { setDraft(value); setEditing(true); }}>
            EDIT
          </button>
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      className={`prof-toggle ${on ? 'on' : ''}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
    >
      <span className="prof-toggle-knob" />
    </button>
  );
}

export default function Profile() {
  const { sessions, clearHistory, user, updateUser } = useSession();

  /* ------ Profile state ------ */
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: displayName, bio });

  /* ------ Prefs state ------ */
  const [rigor, setRigor] = useState(user?.preferences?.analysisRigor || 'STANDARD');
  
  // Convert seconds to label for UI
  const getPrepLabel = (seconds) => {
    if (seconds === 420) return '7 MIN';
    if (seconds === 600) return '10 MIN';
    return '5 MIN'; // default
  };
  const [prepTime, setPrepTime] = useState(getPrepLabel(user?.preferences?.defaultPrepTime));
  
  const [feedbackDepth, setFeedbackDepth] = useState(user?.preferences?.feedbackDepth || 'DEEP');

  // Handle prep time change
  const handlePrepTimeChange = (label) => {
    setPrepTime(label);
    const secs = label === '10 MIN' ? 600 : label === '7 MIN' ? 420 : 300;
    updateUser({ 
      ...user, 
      preferences: { ...user?.preferences, defaultPrepTime: secs }
    });
  };

  /* ------ Derived metrics ------ */
  const metrics = useMemo(() => {
    const s = sessions || [];
    const scores = s.map((x) => x.feedback?.overallScore).filter((v) => v != null);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const best = scores.length ? Math.max(...scores) : 0;

    /* Simple streak: consecutive sessions with score >= 70 from most recent */
    const sorted = [...s].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    for (const sess of sorted) {
      if ((sess.feedback?.overallScore ?? 0) >= 70) streak++;
      else break;
    }

    return { total: s.length, avg, best, streak };
  }, [sessions]);

  const handleSaveProfile = () => {
    setDisplayName(profileDraft.name);
    setBio(profileDraft.bio);
    updateUser({ ...user, displayName: profileDraft.name, bio: profileDraft.bio });
    setEditingProfile(false);
  };

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false, isAlert: false });

  const handleDeleteHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Wipe Session History',
      message: 'Are you sure you want to clear all session history? This action cannot be undone.',
      isDanger: true,
      isAlert: false,
      onConfirm: () => {
        clearHistory();
        setConfirmModal({ isOpen: false });
      }
    });
  };

  const [diagStatus, setDiagStatus] = useState('IDLE'); // IDLE, TESTING, SUCCESS, ERROR

  const handleDiagnostic = async () => {
    setDiagStatus('TESTING');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setDiagStatus('SUCCESS');
    } catch (e) {
      setDiagStatus('ERROR');
    }
    setTimeout(() => setDiagStatus('IDLE'), 3000);
  };

  const [useWebcam, setUseWebcam] = useState(user?.preferences?.useWebcam ?? true);

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ user, sessions }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "pitchit_data.json");
    dlAnchor.click();
  };

  const handleDeleteAccount = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This will wipe all data and log you out. This action is irreversible.',
      isDanger: true,
      isAlert: false,
      onConfirm: () => {
        clearHistory();
        localStorage.removeItem('pp_user');
        window.location.href = '/';
      }
    });
  };

  const handleUpgrade = () => {
    if (user?.preferences?.waitlistJoined) {
      setConfirmModal({
        isOpen: true,
        title: 'Already on Waitlist',
        message: 'You are already on the waitlist for PitchIt PRO! We will notify you when a spot opens up.',
        isDanger: false,
        isAlert: true,
        onConfirm: () => setConfirmModal({ isOpen: false })
      });
      return;
    }

    updateUser({ ...user, preferences: { ...user?.preferences, waitlistJoined: true } });

    setConfirmModal({
      isOpen: true,
      title: 'Waitlist Joined',
      message: 'PitchIt PRO is currently in invite-only beta. You have been automatically added to the waitlist!',
      isDanger: false,
      isAlert: true,
      onConfirm: () => setConfirmModal({ isOpen: false })
    });
  };

  return (
    <div className="prof-root">
      <SidebarNav />
      <main className="prof-main">

        {/* ---- 1. Profile Summary ---- */}
        <section className="prof-section">
          <p className="prof-section-label">PROFILE SUMMARY</p>
          <div className="prof-summary-row">
            <Avatar name={displayName} />
            <div className="prof-summary-info">
              <h2 className="prof-name">{displayName}</h2>
              <p className="prof-email">{email}</p>
              <span className="prof-tier-badge">FREE TIER</span>
            </div>
            <button
              className="prof-btn-outline"
              onClick={() => {
                setProfileDraft({ name: displayName, bio });
                setEditingProfile(true);
              }}
            >
              EDIT PROFILE
            </button>
          </div>

          {editingProfile && (
            <div className="prof-inline-form">
              <label className="prof-field-label">DISPLAY NAME</label>
              <input
                className="prof-input"
                value={profileDraft.name}
                onChange={(e) => setProfileDraft((p) => ({ ...p, name: e.target.value }))}
              />
              <label className="prof-field-label" style={{ marginTop: 12 }}>BIO</label>
              <textarea
                className="prof-input prof-textarea"
                value={profileDraft.bio}
                onChange={(e) => setProfileDraft((p) => ({ ...p, bio: e.target.value }))}
                rows={3}
              />
              <div className="prof-form-actions">
                <button className="prof-btn-gold" onClick={handleSaveProfile}>SAVE CHANGES</button>
                <button className="prof-btn-ghost" onClick={() => setEditingProfile(false)}>CANCEL</button>
              </div>
            </div>
          )}
        </section>

        <div className="prof-divider" />

        {/* ---- 2. Key Metrics ---- */}
        <section className="prof-section">
          <p className="prof-section-label">KEY METRICS</p>
          <div className="prof-metrics-grid">
            {[
              { label: 'TOTAL SESSIONS', value: metrics.total },
              { label: 'AVERAGE SCORE', value: metrics.avg },
              { label: 'BEST SCORE', value: metrics.best },
              { label: 'PASS STREAK', value: metrics.streak },
            ].map(({ label, value }) => (
              <div key={label} className="prof-metric-card">
                <span className="prof-metric-value">{value}</span>
                <span className="prof-metric-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="prof-divider" />

        {/* ---- 3. Account Settings ---- */}
        <section className="prof-section">
          <p className="prof-section-label">ACCOUNT SETTINGS</p>
          <EditableField label="DISPLAY NAME" value={displayName} onSave={(val) => { setDisplayName(val); updateUser({ ...user, displayName: val }); }} />
          <EditableField 
            label="EMAIL ADDRESS" 
            value={email} 
            onSave={(val) => { setEmail(val); updateUser({ ...user, email: val }); }}
            validate={(val) => {
              if (!val) return 'Email is required.';
              if (!val.includes('@') || !val.includes('.')) return 'Please enter a valid email address.';
              return null;
            }}
          />
        </section>

        <div className="prof-divider" />

        {/* ---- 4. Preferences ---- */}
        <section className="prof-section">
          <p className="prof-section-label">ANALYSIS PREFERENCES</p>

          <div className="prof-pref-row" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1, paddingRight: '24px' }}>
              <p className="prof-pref-title">Analysis Rigor (AI Persona)</p>
              <p className="prof-pref-sub" style={{ marginBottom: '12px' }}>
                Determine how ruthlessly the AI grades your performance.
              </p>
              
              <div className="prof-rigor-desc">
                {rigor === 'STANDARD' && <p><strong>STANDARD:</strong> Balanced coaching. Ideal for everyday presentations and internal meetings.</p>}
                {rigor === 'STRICT' && <p><strong>STRICT:</strong> High-stakes environment. Flaws in pacing and logic are heavily penalized.</p>}
                {rigor === 'EXECUTIVE' && <p style={{ color: 'var(--color-gold)' }}><strong>EXECUTIVE (VC-STYLE):</strong> Ruthless teardown. Zero flattery. Expect brutal honesty on weak status markers and fuzzy logic.</p>}
              </div>
            </div>
            <div className="prof-segmented" style={{ alignSelf: 'flex-start' }}>
              {RIGOR_OPTIONS.map((o) => (
                <button
                  key={o}
                  className={`prof-seg-btn ${rigor === o ? 'active' : ''}`}
                  onClick={() => {
                    setRigor(o);
                    updateUser({ ...user, preferences: { ...user?.preferences, analysisRigor: o } });
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="prof-divider" />

        {/* ---- 5. Presentation Preferences ---- */}
        <section className="prof-section">
          <p className="prof-section-label">PRESENTATION PREFERENCES</p>

          <div className="prof-pref-row">
            <p className="prof-pref-title">Default Prep Time</p>
            <div className="prof-segmented">
              {PREP_TIMES.map((t) => (
                <button
                  key={t}
                  className={`prof-seg-btn ${prepTime === t ? 'active' : ''}`}
                  onClick={() => handlePrepTimeChange(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="prof-pref-row">
            <p className="prof-pref-title">Feedback Depth</p>
            <div className="prof-segmented">
              {DEPTH_OPTIONS.map((d) => (
                <button
                  key={d}
                  className={`prof-seg-btn ${feedbackDepth === d ? 'active' : ''}`}
                  onClick={() => {
                    setFeedbackDepth(d);
                    updateUser({ ...user, preferences: { ...user?.preferences, feedbackDepth: d } });
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="prof-pref-row">
            <p className="prof-pref-title">Language</p>
            <span className="prof-pref-static">ENGLISH (US)</span>
          </div>
        </section>

        <div className="prof-divider" />

        {/* ---- 6. Hardware & Telemetry ---- */}
        <section className="prof-section">
          <p className="prof-section-label">HARDWARE & TELEMETRY</p>

          <div className="prof-pref-row">
            <div>
              <p className="prof-pref-title">Microphone Array</p>
              <p className="prof-pref-sub">Default System Audio Device</p>
            </div>
            <button 
              className={`prof-btn-outline ${
                diagStatus === 'TESTING' ? 'prof-diag-testing' : 
                diagStatus === 'SUCCESS' ? 'prof-diag-success' : 
                diagStatus === 'ERROR' ? 'prof-diag-error' : ''
              }`}
              style={{ fontSize: '10px', minWidth: '130px' }} 
              onClick={handleDiagnostic}
              disabled={diagStatus !== 'IDLE'}
            >
              {diagStatus === 'IDLE' && 'RUN DIAGNOSTIC'}
              {diagStatus === 'TESTING' && 'TESTING...'}
              {diagStatus === 'SUCCESS' && '✓ PASSED'}
              {diagStatus === 'ERROR' && '✕ FAILED'}
            </button>
          </div>

          <div className="prof-pref-row">
            <div>
              <p className="prof-pref-title">Webcam (Vision Analysis)</p>
              <p className="prof-pref-sub">Enable camera for body language and eye-contact tracking.</p>
            </div>
            <Toggle on={useWebcam} onChange={(val) => {
              setUseWebcam(val);
              updateUser({ ...user, preferences: { ...user?.preferences, useWebcam: val } });
            }} />
          </div>
        </section>

        <div className="prof-divider" />

        {/* ---- 7. Data & Privacy ---- */}
        <section className="prof-section">
          <p className="prof-section-label">DATA & PRIVACY</p>
          <div className="prof-data-info" style={{ marginBottom: '24px' }}>
            <p className="prof-pref-sub">
              Your audio and video feeds are processed ephemerally. Telemetry data is analyzed in memory and discarded after the report is generated. We do not use your sessions to train our models.
            </p>
          </div>
          <div className="prof-data-actions">
            <button className="prof-btn-outline" onClick={handleDownload}>DOWNLOAD RAW DATA</button>
            <button className="prof-btn-ghost prof-btn-danger-ghost" onClick={handleDeleteHistory}>
              WIPE SESSION HISTORY
            </button>
            <button className="prof-danger-link" onClick={handleDeleteAccount}>DELETE ACCOUNT</button>
          </div>
        </section>

        <div className="prof-divider" />

        {/* ---- 8. Subscription ---- */}
        <section className="prof-section">
          <p className="prof-section-label">SUBSCRIPTION</p>
          <div className="prof-sub-row">
            <div>
              <p className="prof-pref-title">Current Plan</p>
              <p className="prof-pref-sub">Free Tier — limited sessions and features.</p>
            </div>
            <button 
              className={user?.preferences?.waitlistJoined ? "prof-btn-outline" : "prof-btn-gold"} 
              onClick={handleUpgrade}
            >
              {user?.preferences?.waitlistJoined ? "✓ ON WAITLIST" : "UPGRADE TO PRO"}
            </button>
          </div>
        </section>

        {/* ---- Footer ---- */}
        <footer className="prof-footer">
          <span>© 2026 PITCHIT. A PROJECT BY FILIP ZIGMUND.</span>
          <div className="prof-footer-links">
            <Link to="/terms">TERMS</Link>
            <Link to="/privacy">PRIVACY</Link>
            <Link to="/support">SUPPORT</Link>
          </div>
        </footer>

      </main>

      {/* ---- Confirmation Modal ---- */}
      {confirmModal.isOpen && (
        <div className="prof-modal-overlay">
          <div className="prof-modal">
            <h3 className="prof-modal-title">{confirmModal.title}</h3>
            <p className="prof-modal-message">{confirmModal.message}</p>
            <div className="prof-modal-actions">
              {!confirmModal.isAlert && (
                <button 
                  className="prof-btn-ghost" 
                  onClick={() => setConfirmModal({ isOpen: false })}
                >
                  CANCEL
                </button>
              )}
              <button 
                className={confirmModal.isDanger ? "prof-btn-danger" : "prof-btn-gold"} 
                onClick={confirmModal.onConfirm}
              >
                {confirmModal.isAlert ? "OK" : "CONFIRM"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
