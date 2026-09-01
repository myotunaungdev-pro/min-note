import React, { useEffect, useState } from 'react';
import { APP_NAME } from '../../utils/constants';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useSelector } from 'react-redux';

const Header = () => {
    const { t } = useTranslation();
    const [isLightMode, setIsLightMode] = useState(false);
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsLightMode(true);
            document.body.classList.add('light-theme');
        }
    }, []);

    const toggleTheme = () => {
        setIsLightMode(!isLightMode);
        if (!isLightMode) {
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        }
    };

    return (
        <nav className="landing-nav">
            <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                <i className="bi bi-journal-richtext"></i>
                <span>{APP_NAME}</span>
            </Link>
            <div className="nav-actions">
                <LanguageSwitcher />
                <button className="btn-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                    <i className={`bi ${isLightMode ? 'bi-moon-stars' : 'bi-sun'}`}></i>
                </button>
                {token ? (
                    <Link to="/notes" className="btn-login">{t('landing.workspace_btn')}</Link>
                ) : (
                    <Link to="/login" className="btn-login">{t("auth.login.submit")}</Link>
                )}
            </div>
        </nav>
    );
};

export default Header;
