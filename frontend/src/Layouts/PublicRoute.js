import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Wrapper component that redirects logged-in users away from auth pages (login/signup) to the workspace
const PublicRoute = () => {
    // Check if a valid token exists in the Redux state
    const { token } = useSelector((state) => state.auth);

    // If there is a token, redirect to notes
    if (token) {
        return <Navigate to="/notes" replace />;
    }

    // Otherwise render the child routes (Landing, Login, Signup)
    return <Outlet />;
};

export default PublicRoute;
