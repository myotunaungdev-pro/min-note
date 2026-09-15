import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import '../pages/public/Landing/LandingPage.css';

// Layout wrapper for all public pages (Landing, Pricing, etc.) combining Header, content area, and Footer
const PublicLayout = () => {
    return (
        <div className="landing-page">
            <Header />
            <main className="landing-main">
                <PageTransition>
                    <div className="public-content-wrapper">
                        <Outlet />
                    </div>
                </PageTransition>
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
