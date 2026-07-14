import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost, Home } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import PageTransition from '../../components/common/PageTransition';
import './NotFound.css';

const NotFound = () => {
    usePageTitle("404 Not Found");

    return (
        <PageTransition>
            <div className="not-found-container">
                <div className="not-found-icon-wrapper">
                    <Ghost size={120} className="not-found-ghost" strokeWidth={1.5} />
                </div>
                <h1 className="not-found-title">404</h1>
                <h2 className="not-found-subtitle">Oops! Lost in Cyberspace.</h2>
                <p className="not-found-desc">
                    The page you are looking for has drifted into the digital void or never existed in the first place. 
                    Let's get you back to safe coordinates.
                </p>
                <Link to="/" className="not-found-btn">
                    <Home size={20} />
                    Return to Home
                </Link>
            </div>
        </PageTransition>
    );
};

export default NotFound;
