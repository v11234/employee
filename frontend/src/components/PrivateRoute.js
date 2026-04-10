import React from 'react';
import { Navigate } from 'react-router-dom';
import { getDefaultRouteForRole, getStoredUser } from '../config/access';

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const preAuthToken = localStorage.getItem('preAuthToken');
  const user = getStoredUser();
  
  // If no token, redirect to login
  if (!token) {
    if (preAuthToken) {
      return <Navigate to="/biometric-verification" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  // If token exists, render the protected content
  return children;
}
