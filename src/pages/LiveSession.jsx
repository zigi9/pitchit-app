import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { transcribeAudio } from '../services/transcription';
import './LiveSession.css';

function formatTime(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

const WPM_LOW  = 120;
const WPM_HIGH = 160;

function getPitchStatus(wpm) {
  if (wpm === 0) return 'OPTIMAL';
  if (wpm < WPM_LOW)  return 'LOW';
  if (wpm > WPM_HIGH) return 'HIGH';
  return 'OPTIMAL';
}

function getBestMimeType() {
  const types = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm',
    'video/mp4',
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

export default function LiveSession() {
  const navigate  = useNavigate();
  const { currentSession, setCurrentSession, user } = useSession();
  const useWebcam = user?.preferences?.useWebcam ?? true;

  const duration = currentSession?.duration || 120;
  const mode     = currentSession?.mode  || 'PITCH';

  // ── State ──────────────────────────────────────────────────
  const [isRecording,     setIsRecording]     = useState(false);
  const [preCountdown,    setPreCountdown]    = useState(3);
  const [elapsed,         setElapsed]         = useState(0);
  const [timeLeft,        setTimeLeft]        = useState(duration);
  const [wpm,             setWpm]             = useState(0);
  const [audioVolume,     setAudioVolume]     = useState(0);
  const [transcript,      setTranscript]      = useState('');
  const [transcriptWords, setTranscriptWords] = useState(0);
  const [pitchStatus,     setPitchStatus]     = useState('OPTIMAL');
  const [showBrief,       setShowBrief]       = useState(true);
  const [cameraError,     setCameraError]     = useState(null);
  const [isProcessing,    setIsProcessing]    = useState(false);

  // ── Refs ───────────────────────────────────────────────────
  const videoRef         = useRef(null);
  const streamRef        = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks   = useRef([]);
  const recognitionRef   = useRef(null);
  const elapsedRef       = useRef(0);
  const framesRef        = useRef([]);
  const timerRef         = useRef(null);
  const endedRef         = useRef(false);

  // ── Telemetry Refs ─────────────────────────────────────────
  const wpmTimelineRef   = useRef([]);
  const volumeTimelineRef= useRef([]);
  const timestampedTranscriptRef = useRef([]);
  const audioContextRef  = useRef(null);
  const analyserRef      = useRef(null);
  const dataArrayRef     = useRef(null);
  const latestWpmRef     = useRef(0);

  // ── Helpers ────────────────────────────────────────────────
  function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  // ── END SESSION ────────────────────────────────────────────
  const endSession = useRef(null);
  endSession.current = () => {
    if (endedRef.current) return;
    endedRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    try { recognitionRef.current?.stop(); } catch (_) {}

    setIsProcessing(true);

    const finishUp = async (blob) => {
      let finalTranscript = transcript;
      if (blob) {
        const whisperTranscript = await transcribeAudio(blob);
        if (whisperTranscript) {
          finalTranscript = whisperTranscript;
        }
      }

      const telemetry = {
        wpmTimeline: wpmTimelineRef.current,
        volumeTimeline: volumeTimelineRef.current,
        timestampedTranscript: timestampedTranscriptRef.current.join('\n'),
        frames: framesRef.current,
      };

      setCurrentSession((prev) => ({
        ...prev,
        recordedBlob: blob,
        transcript: finalTranscript,
        telemetry,
      }));
      navigate('/feedback');
    };

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        finishUp(blob);
      };
      mediaRecorderRef.current.stop();
    } else {
      finishUp(null);
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (_) {}
    }
    setIsRecording(false);
  };

  // ── Mount: camera + mic + recording + speech ───────────────
  useEffect(() => {
    let cancelled = false;

    async function setupStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: useWebcam ? { facingMode: 'user' } : false,
          audio: true,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Wait for preCountdown
        let countdown = 3;
        const countdownTimer = setInterval(() => {
          countdown -= 1;
          setPreCountdown(countdown);
          if (countdown <= 0) {
            clearInterval(countdownTimer);
            if (!cancelled) startRecording(stream);
          }
        }, 1000);

      } catch (err) {
        console.error('Mic/Cam error:', err);
        setCameraError(err.message || 'Could not access camera/mic.');
      }
    }

    function startRecording(stream) {
      // MediaRecorder
      const mimeType = getBestMimeType();
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunks.current.push(e.data);
      };
      mr.start(250);
      setIsRecording(true);

      // Audio Analyser setup for telemetry
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
      } catch (err) {
        console.warn('AudioContext setup failed', err);
      }

      // Elapsed / countdown timer
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        const currentElapsed = elapsedRef.current;
        
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          let sum = 0;
          for(let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
          }
          const vol = sum / dataArrayRef.current.length;
          volumeTimelineRef.current.push(vol);
          setAudioVolume(vol);
        }

        setTranscriptWords((currentWords) => {
          if (currentElapsed > 5) {
            const updatedWpm = Math.round(currentWords / (currentElapsed / 60));
            latestWpmRef.current = updatedWpm;
            setWpm(updatedWpm);
            setPitchStatus(getPitchStatus(updatedWpm));
          }
          return currentWords;
        });

        if (useWebcam && currentElapsed % 10 === 0 && videoRef.current) {
          try {
            const canvas = document.createElement('canvas');
            const video = videoRef.current;
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx && canvas.width > 0) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const base64 = canvas.toDataURL('image/jpeg', 0.4);
              framesRef.current.push(base64);
            }
          } catch (err) {
            console.warn('Failed to capture frame', err);
          }
        }

        if (currentElapsed % 5 === 0) {
          wpmTimelineRef.current.push(latestWpmRef.current);
        }

        setElapsed(currentElapsed);
        setTimeLeft((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            endSession.current();
            return 0;
          }
          return next;
        });
      }, 1000);

      // Speech recognition
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const recognition = new SR();
        recognitionRef.current = recognition;
        recognition.continuous      = true;
        recognition.interimResults  = true;
        recognition.lang            = 'en-US';

        let fullTranscript = '';

        recognition.onresult = (event) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              fullTranscript += t + ' ';
              timestampedTranscriptRef.current.push(`[${formatTime(elapsedRef.current)}] ${t.trim()}`);
            } else {
              interim = t;
            }
          }
          setTranscript(fullTranscript + interim);
          setTranscriptWords(countWords(fullTranscript));
        };

        recognition.onerror = (e) => {
          if (e.error !== 'no-speech') console.warn('SR error', e.error);
        };
        recognition.onend = () => {
          if (!endedRef.current) {
            try { recognition.start(); } catch (_) {}
          }
        };
        try { recognition.start(); } catch (_) {}
      }
    }

    setupStream();

    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
      try { recognitionRef.current?.stop(); } catch (_) {}
      try { mediaRecorderRef.current?.stop(); } catch (_) {}
      try { audioContextRef.current?.close(); } catch (_) {}
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [useWebcam]);

  // ── Derived visuals ────────────────────────────────────────
  const timeDanger = timeLeft <= 30;
  const timeColor  = timeDanger ? '#8B2020' : '#e7c353';
  const timePct    = Math.max(0, timeLeft / duration);

  const wpmColor =
    pitchStatus === 'OPTIMAL' ? '#e7c353'
    : pitchStatus === 'LOW'   ? '#C9A84C'
    : '#8B2020';

  const transcriptSentences = transcript.split(/(?<=[.?!])\s+/).filter(Boolean);
  const lastSentence = transcriptSentences[transcriptSentences.length - 1] || '';

  return (
    <div className="live-wrapper">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <header className="live-header">
        <div className="live-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span className="live-brand">PITCHIT</span>
            <button 
              className="live-notes-toggle-btn label-caps"
              onClick={() => setShowBrief(!showBrief)}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border-warm)',
                color: showBrief ? 'var(--color-gold)' : 'var(--color-text-muted)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              {showBrief ? 'HIDE NOTES' : 'SHOW NOTES'}
            </button>
          </div>
          <div className="live-session-badge label-caps">
            {preCountdown > 0 ? (
              <span style={{ color: 'var(--color-text-sec)' }}>GET READY</span>
            ) : isRecording ? (
              <>
                <span className="live-session-dot" />
                RECORDING
              </>
            ) : (
              <span style={{ color: 'var(--color-text-sec)' }}>SESSION ENDED</span>
            )}
          </div>
          <span className="live-mode label-caps muted">{mode} MODE</span>
        </div>
      </header>

      {/* ── 3-SECOND COUNTDOWN OVERLAY ──────────────────────────── */}
      {preCountdown > 0 && (
        <div className="live-pre-countdown-overlay">
          <div className="live-pre-countdown-circle">
            <span className="live-pre-countdown-number">{preCountdown}</span>
          </div>
          <p className="live-pre-countdown-text">Camera rolling in...</p>
        </div>
      )}

      {/* ── MAIN SPLIT ──────────────────────────────────────── */}
      <div className={`live-main ${isRecording ? 'live-main--recording' : ''}`}>
        
        {/* ── LEFT — Notes Panel ─────────────────────────────── */}
        {showBrief && (
          <aside className="live-notes-col">
            <div className="live-notes-header">
              <h2 className="label-caps gold">YOUR NOTES</h2>
            </div>
            <div className="live-notes-content">
              {/* User Custom Notes */}
              {currentSession?.notes && (
                <div style={{ marginBottom: '32px' }}>
                  <p className="live-notes-text">{currentSession.notes}</p>
                </div>
              )}

              {/* Automatic Brief Key Points */}
              {currentSession?.keyPoints?.length > 0 && (
                <div className="live-kp-fallback">
                  <h3 className="label-caps muted" style={{ marginBottom: '16px', fontSize: '10px' }}>
                    BRIEF KEY POINTS
                  </h3>
                  <ul className="live-kp-list">
                    {currentSession.keyPoints.map((pt, i) => (
                      <li key={i} className="live-kp-item">
                        <span className="gold">▸</span> {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Empty Fallback */}
              {!currentSession?.notes && !currentSession?.keyPoints?.length && (
                <p className="muted">No notes prepared for this session.</p>
              )}
            </div>
        </aside>
        )}

        {/* ── RIGHT — Camera & HUD ───────────────────────────── */}
        <section className="live-viewport-col">
          <div className="live-viewport">
            {cameraError ? (
              <div className="live-cam-error">
                <p>⚠ {cameraError}</p>
                <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                  Allow microphone access to record.
                </p>
              </div>
            ) : useWebcam ? (
              <video
                ref={videoRef}
                className="live-video"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <div className="live-no-video">
                <div className="live-no-video-avatar">
                  {(user?.displayName || 'U')[0].toUpperCase()}
                </div>
                <p className="label-caps muted">AUDIO ONLY MODE</p>
              </div>
            )}

            {/* LIVE HUD OVERLAYS */}
            {isRecording && (
              <>
                {/* Top HUD: Time & Audio */}
                <div className="live-hud-top">
                  <div className="live-hud-time">
                    <span className="live-hud-label label-caps">REMAINING</span>
                    <span className="live-hud-value mono" style={{ color: timeColor }}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div className="live-hud-audio">
                    <span className="live-hud-label label-caps">AUDIO</span>
                    <div className="live-hud-audio-bar">
                      <div 
                        className="live-hud-audio-fill" 
                        style={{ width: `${Math.min(100, (audioVolume / 255) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom HUD: Pacing & Transcript & End Button */}
                <div className="live-hud-bottom">
                  <div className="live-hud-wpm">
                    <span className="live-hud-label label-caps">PACING</span>
                    <div className="live-hud-wpm-wrap">
                      <span className="live-hud-value mono" style={{ color: wpmColor }}>
                        {wpm}
                      </span>
                      <span className="live-hud-unit label-caps">WPM</span>
                    </div>
                  </div>
                  <div className="live-hud-transcript">
                    {lastSentence || <span className="muted">Listening...</span>}
                  </div>
                  <button
                    id="live-end-session-btn"
                    className="live-end-btn label-caps"
                    onClick={() => endSession.current()}
                  >
                    END SESSION
                  </button>
                </div>
              </>
            )}

            {isProcessing && (
              <div className="live-processing-overlay">
                <div className="live-spinner" />
                <p className="label-caps gold">ANALYZING AUDIO...</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
