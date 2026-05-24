import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { session } = useAuth();

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined text-icon-6xl text-primary animate-spin">autorenew</span>
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;
  return <Outlet />;
}
