import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // A ce stade, l'utilisateur est authentifié et les données sont chargées.
  // On peut donc s'assurer que `user` n'est pas null.
  if (!user) {
    // Ce cas ne devrait pas arriver si isLoading est false et isAuthenticated est true,
    // mais c'est une sécurité supplémentaire.
    return <Navigate to="/login" />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user.role || !allowedRoles.includes(user.role.name)) {
      return <Navigate to="/" />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
