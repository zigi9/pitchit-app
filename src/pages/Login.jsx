import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { updateUserProfile } from '../services/firestore';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { updateUser } = useSession();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFirebaseAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isSignUp && (!firstName.trim() || !lastName.trim())) {
      setError('Please enter both your first and last name.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms of Service to continue.');
      return;
    }
    
    if (!auth) {
      // Fallback
      updateUser({
        displayName: isSignUp ? `${firstName.trim()} ${lastName.trim()}` : 'Test User',
        isAuthenticated: true
      });
      navigate('/dashboard');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateUserProfile(userCred.user.uid, {
          displayName: `${firstName.trim()} ${lastName.trim()}`,
          email: userCred.user.email
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!agreed) {
      setError('You must agree to the Terms of Service to continue.');
      return;
    }
    
    if (!auth) {
      updateUser({ displayName: 'Google User', isAuthenticated: true });
      navigate('/dashboard');
      return;
    }

    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      await updateUserProfile(userCred.user.uid, {
        displayName: userCred.user.displayName,
        email: userCred.user.email
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="label-caps login-brand">PITCHIT</span>
          <h1 className="login-title">Welcome to the Executive Laboratory</h1>
          <p className="login-subtitle">{isSignUp ? 'Create an account to begin your training session.' : 'Sign in to continue your training session.'}</p>
        </div>
        
        <form onSubmit={handleFirebaseAuth} className="login-form">
          {isSignUp && (
            <>
              <div className="form-group">
                <label htmlFor="firstName" className="field-label">FIRST NAME</label>
                <input
                  type="text"
                  id="firstName"
                  className="login-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Filip"
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName" className="field-label">LAST NAME</label>
                <input
                  type="text"
                  id="lastName"
                  className="login-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Zigmund"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email" className="field-label">EMAIL</label>
            <input
              type="email"
              id="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="field-label">PASSWORD</label>
            <input
              type="password"
              id="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="login-checkbox"
                disabled={isLoading}
              />
              <span className="checkbox-text">
                I agree to the <Link to="/terms" target="_blank">Terms</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>. 
                I also consent to my camera and microphone being used to record video, audio, and transcripts for AI analysis during the session.
              </span>
            </label>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn-gold login-btn" disabled={isLoading}>
            {isLoading ? 'LOADING...' : (isSignUp ? 'CREATE ACCOUNT →' : 'SIGN IN →')}
          </button>
          
          <button type="button" onClick={handleGoogleSignIn} className="btn-secondary login-btn" style={{marginTop: '10px'}} disabled={isLoading}>
            SIGN IN WITH GOOGLE
          </button>
          
          <div style={{marginTop: '20px', textAlign: 'center'}}>
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); }} style={{background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline'}}>
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
