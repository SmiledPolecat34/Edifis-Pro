import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!user) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user.role || !allowedRoles.includes(user.role.name)) {
      return <Navigate to="/" />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;