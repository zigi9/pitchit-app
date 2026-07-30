import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../firebase'
import { getUserSessions, saveSessionToFirestore, getUserProfile } from '../services/firestore'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [currentSession, setCurrentSession] = useState({
    mode: null,
    modeLabel: '',
    brief: '',
    prepTime: 420,
    difficulty: 'STANDARD',
    duration: 120,
    recordedBlob: null,
    feedback: null,
  })

  const [sessions, setSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pp_sessions') || '[]')
    } catch {
      return []
    }
  })

  const defaultPrefs = {
    defaultMode: 'INVESTOR_PITCH',
    defaultPrepTime: 300,
    feedbackDepth: 'DEEP',
    language: 'ENGLISH (US)',
    autoAnalyze: true,
    analysisRigor: 'EXECUTIVE',
  }

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pp_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...parsed, preferences: { ...defaultPrefs, ...(parsed.preferences || {}) } };
      }
      return { 
        displayName: '', 
        email: '', 
        bio: '',
        isAuthenticated: false,
        preferences: defaultPrefs
      };
    } catch {
      return { displayName: '', email: '', bio: '', isAuthenticated: false, preferences: defaultPrefs };
    }
  })

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load user profile
        const profile = await getUserProfile(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || profile?.displayName || '',
          email: firebaseUser.email,
          isAuthenticated: true,
          preferences: profile?.preferences || defaultPrefs
        });

        // Load sessions
        const firestoreSessions = await getUserSessions(firebaseUser.uid);
        if (firestoreSessions.length > 0) {
          setSessions(firestoreSessions);
          localStorage.setItem('pp_sessions', JSON.stringify(firestoreSessions));
        }
      } else {
        // Logged out
        setUser({ displayName: '', email: '', bio: '', isAuthenticated: false, preferences: defaultPrefs });
        setSessions([]);
        localStorage.removeItem('pp_sessions');
      }
    });

    return () => unsubscribe();
  }, []);

  const saveSession = (feedbackData) => {
    // Strip markdown headings (###) from the excerpt
    const rawText = (currentSession.brief || '').replace(/#/g, '').trim();
    
    const newSession = {
      id: `PR-${Math.floor(Math.random() * 900 + 100)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
      date: new Date().toISOString(),
      mode: currentSession.mode, // Raw ID for computing scores
      modeLabel: currentSession.modeLabel || currentSession.mode, // Human readable string
      briefExcerpt: rawText.substring(0, 80) + '...',
      score: feedbackData.overallScore,
      result: feedbackData.overallScore >= 70 ? 'PASS' : 'IMPROVE',
      feedback: feedbackData,
      duration: currentSession.duration,
    }
    const updated = [newSession, ...sessions]
    setSessions(updated)
    localStorage.setItem('pp_sessions', JSON.stringify(updated))
    
    if (user.uid) {
      saveSessionToFirestore(user.uid, newSession);
    }
    
    return newSession
  }

  const updateUser = (data) => {
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('pp_user', JSON.stringify(updated))
  }

  const signOut = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    } else {
      setUser({ displayName: '', email: '', bio: '', isAuthenticated: false, preferences: defaultPrefs });
      setSessions([]);
      localStorage.removeItem('pp_sessions');
      localStorage.removeItem('pp_user');
    }
  }

  const clearCurrentSession = () => {
    setCurrentSession({
      mode: null,
      modeLabel: '',
      brief: '',
      prepTime: 420,
      difficulty: 'STANDARD',
      duration: 120,
      recordedBlob: null,
      feedback: null,
    })
  }

  const clearHistory = () => {
    setSessions([])
    localStorage.removeItem('pp_sessions')
  }

  return (
    <SessionContext.Provider value={{
      currentSession,
      setCurrentSession,
      sessions,
      saveSession,
      user,
      updateUser,
      signOut,
      clearCurrentSession,
      clearHistory,
    }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
