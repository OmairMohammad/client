import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.includes(currentUser.role)) return <Navigate to="/recommendations" replace />;
  return children;
}
