import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, requiredRole }) {
    const { currentUser, userRole, loading } = useAuth();
    const location = useLocation();


    if (loading) {
        return <div>Loading...</div>; // Or a spinner
    }

    if (!currentUser) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && userRole !== requiredRole) {
        // User is logged in but doesn't have the required role
        return <Navigate to="/" replace />;
    }

    return children;
}

export default PrivateRoute;
