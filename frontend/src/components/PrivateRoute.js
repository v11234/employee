import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const preAuthToken = localStorage.getItem('preAuthToken');
  
  // If no token, redirect to login
  if (!token) {
    if (preAuthToken) {
      return <Navigate to="/biometric-verification" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected content
  return children;
}
