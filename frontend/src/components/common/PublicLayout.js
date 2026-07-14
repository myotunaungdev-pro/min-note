import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PageTransition from './PageTransition';
import '../../App/landing/LandingPage.css';

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
