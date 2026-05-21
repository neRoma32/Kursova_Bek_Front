import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ guestOnly = false }) => {
  const { currentUser } = useAuth();

  if (guestOnly) {
    // If user is already logged in, redirect them to the home page (app)
    if (currentUser) {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  }

  // If user is not logged in, redirect them to the login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
