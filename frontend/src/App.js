import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

import NotesApp from './App/notes/NotesApp';
import LandingPage from './App/landing/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import PublicLayout from './components/common/PublicLayout';
import Settings from './components/settings/Settings';
import SystemSettings from './components/settings/SystemSettings';
import ShortcutModal from './components/common/ShortcutModal';
import HelpGuide from './components/help/HelpGuide';
import Upgrade from './pages/private/Upgrade';
import AdminPayments from './pages/private/AdminPayments';
import KPayCheckoutPage from './pages/private/KPayCheckoutPage';
import KPaySuccess from './pages/private/KPaySuccess';
import PaymentSuccess from './pages/private/PaymentSuccess';

import Features from './pages/public/Features';
import Pricing from './pages/public/Pricing';
import Integrations from './pages/public/Integrations';
import Changelog from './pages/public/Changelog';
import HelpCenter from './pages/public/HelpCenter';
import Guides from './pages/public/Guides';
import ApiDocs from './pages/public/ApiDocs';
import Community from './pages/public/Community';
import AboutUs from './pages/public/AboutUs';
import Careers from './pages/public/Careers';
import Blog from './pages/public/Blog';
import Contact from './pages/public/Contact';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfService from './pages/public/TermsOfService';
import CookiePolicy from './pages/public/CookiePolicy';
import { AnimatePresence } from 'framer-motion';

import NotFound from './pages/public/NotFound';
import ScrollToTop from './components/common/ScrollToTop';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './App/store/authSlice';

function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth?.user);
    const [prevPlan, setPrevPlan] = useState(user?.plan);

    useEffect(() => {
        const handleFocus = () => {
            const token = localStorage.getItem('token');
            if (token) {
                dispatch(fetchCurrentUser());
            }
        };

        const token = localStorage.getItem('token');
        if (token) {
            dispatch(fetchCurrentUser());
        }

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [dispatch]);

    useEffect(() => {
        if (prevPlan && prevPlan !== 'pro' && user?.plan === 'pro') {
            navigate('/payment-success');
        }
        setPrevPlan(user?.plan);
    }, [user?.plan, prevPlan, navigate]);


    const [cardStyle, setCardStyle] = useState(() => {
        const savedStyle = localStorage.getItem('app_note_card_style');
        return savedStyle || 'default';
    });

    useEffect(() => {
        localStorage.setItem('app_note_card_style', cardStyle);
    }, [cardStyle]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }, []);

    return (
        <>
            <ScrollToTop />
            <Tooltip id="global-tooltip" className="custom-react-tooltip" />
            <ShortcutModal />
            <ToastContainer theme="dark" position="top-right" autoClose={3000} />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route element={<PublicRoute />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                    </Route>

                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/features" element={<Features />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/integrations" element={<Integrations />} />
                        <Route path="/changelog" element={<Changelog />} />
                        
                        <Route path="/help-center" element={<HelpCenter />} />
                        <Route path="/guides" element={<Guides />} />
                        <Route path="/api-docs" element={<ApiDocs />} />
                        <Route path="/community" element={<Community />} />
                        
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/careers" element={<Careers />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/contact" element={<Contact />} />
                        
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsOfService />} />
                        <Route path="/cookies" element={<CookiePolicy />} />
                    </Route>

                    <Route element={<ProtectedRoute />}>
                        <Route path="/notes" element={<NotesApp cardStyle={cardStyle} />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/system-settings" element={<SystemSettings cardStyle={cardStyle} setCardStyle={setCardStyle} />} />
                        <Route path="/help" element={<HelpGuide />} />
                        <Route path="/upgrade" element={<Upgrade />} />
                        <Route path="/checkout/kpay" element={<KPayCheckoutPage />} />
                        <Route path="/kpay-success" element={<KPaySuccess />} />
                        <Route path="/payment-success" element={<PaymentSuccess />} />
                        <Route path="/admin/payments" element={<AdminPayments />} />
                    </Route>

                    {/* Catch-all 404 Route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AnimatePresence>
        </>
    );
}

export default App;
