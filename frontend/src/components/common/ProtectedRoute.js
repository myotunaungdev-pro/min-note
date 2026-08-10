import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = () => {
    const { token, user } = useSelector((state) => state.auth);
    const location = useLocation();

    // If there is no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If they are Pro but haven't seen the welcome page, redirect them (unless they are already there)
    if (user?.plan === 'pro' && user?.hasSeenProWelcome === false && location.pathname !== '/payment-success') {
        return <Navigate to="/payment-success" replace />;
    }

    // Otherwise render the child routes
    return <Outlet />;
};

export default ProtectedRoute;
