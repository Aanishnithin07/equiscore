import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const RoleGuard: React.FC<{ allowedRoles: string[]; children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  // Wait until user is fully hydrated before rejecting access
  if (user && !allowedRoles.includes(user.role || '')) {
    // If role doesn't match, send back to home based on their actual role 
    if (user.role === 'organizer') return <Navigate to="/organizer/dashboard" replace />;
    if (user.role === 'judge') return <Navigate to="/judge/dashboard" replace />;
    if (user.role === 'team_member') return <Navigate to="/team/dashboard" replace />;
    
    // Fallback if they somehow have no role or an unrecognized one
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
