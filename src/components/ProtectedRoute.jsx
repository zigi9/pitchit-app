import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

export default function ProtectedRoute({ children }) {
  const { user } = useSession();
  
  if (!user || !user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
