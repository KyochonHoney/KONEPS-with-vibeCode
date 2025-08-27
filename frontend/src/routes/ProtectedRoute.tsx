import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';
import AppLayout from '../layouts/AppLayout'; // Assuming AppLayout is the main layout for protected routes

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <AppLayout><Outlet /></AppLayout>;
};

export default ProtectedRoute;