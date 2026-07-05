import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const redirectMap = {
      student: '/student/dashboard',
      librarian: '/librarian/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={redirectMap[user?.role] || '/login'} replace />;
  }

  return children ? children : <Outlet />;
}