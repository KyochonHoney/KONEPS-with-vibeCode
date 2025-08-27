import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';

interface RoleGuardProps {
  allowedRoles: ('user' | 'superadmin')[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role && allowedRoles.includes(role)) {
    return <Outlet />;
  }

  // Redirect to a forbidden page or home if role is not allowed
  return <Navigate to="/bids" replace />; // Redirect to bids page if not authorized
};

export default RoleGuard;