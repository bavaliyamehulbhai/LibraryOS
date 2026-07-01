import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role || (user.roleId?.name);

  if (role === 'MEMBER' || role === 'STUDENT') {
    return <Navigate to="/member-dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default RoleBasedRedirect;
