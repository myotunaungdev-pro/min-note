import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import Settings from './components/settings/Settings';
import SystemSettings from './components/settings/SystemSettings';
import ShortcutModal from './components/common/ShortcutModal';
import HelpGuide from './components/help/HelpGuide';

function App() {
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
        <BrowserRouter>
            <Tooltip id="global-tooltip" className="custom-react-tooltip" />
            <ShortcutModal />
            <ToastContainer theme="dark" position="top-right" autoClose={3000} />
            <Routes>
                <Route element={<PublicRoute />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                    <Route path="/notes" element={<NotesApp cardStyle={cardStyle} />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/system-settings" element={<SystemSettings cardStyle={cardStyle} setCardStyle={setCardStyle} />} />
                    <Route path="/help" element={<HelpGuide />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
