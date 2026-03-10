import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>; // Simple loading state

    if (!user) {
        // Not logged in
        return <Navigate to="/" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Redirection based on role
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'parent') return <Navigate to="/guardian-dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
