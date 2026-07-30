import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ModeSelection from './pages/ModeSelection'
import CustomScenario from './pages/CustomScenario'
import Preparation from './pages/Preparation'
import LiveSession from './pages/LiveSession'
import FeedbackReport from './pages/FeedbackReport'
import History from './pages/History'
import Profile from './pages/Profile'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Support from './pages/Support'
import { SessionProvider } from './context/SessionContext'
import ProtectedRoute from './components/ProtectedRoute'

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/"                element={<Landing />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/terms"           element={<Terms />} />
          <Route path="/privacy"         element={<Privacy />} />
          <Route path="/support"         element={<Support />} />

          {/* Protected Routes */}
          <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/mode"            element={<ProtectedRoute><ModeSelection /></ProtectedRoute>} />
          <Route path="/custom"          element={<ProtectedRoute><CustomScenario /></ProtectedRoute>} />
          <Route path="/preparation"     element={<ProtectedRoute><Preparation /></ProtectedRoute>} />
          <Route path="/live"            element={<ProtectedRoute><LiveSession /></ProtectedRoute>} />
          <Route path="/feedback"        element={<ProtectedRoute><FeedbackReport /></ProtectedRoute>} />
          <Route path="/feedback/:id"    element={<ProtectedRoute><FeedbackReport /></ProtectedRoute>} />
          <Route path="/history"         element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="*"               element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}
