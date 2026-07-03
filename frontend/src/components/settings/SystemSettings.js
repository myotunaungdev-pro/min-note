import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { setShortcutModalOpen } from '../../App/store/notesSlice';
import { updateUserProfile } from '../../App/store/authSlice';
import LanguageSwitcher from '../common/LanguageSwitcher';
import './Settings.css';

const SystemSettings = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [isDarkMode, setIsDarkMode] = React.useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    React.useEffect(() => {
        document.body.classList.toggle('light-theme', !isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const handleThemeChange = async (themeOption) => {
        if (!user) return;
        try {
            await dispatch(updateUserProfile({ defaultNoteTheme: themeOption })).unwrap();
            toast.success(t("settings.defaultNoteThemeUpdated", "Default note theme updated!"));
        } catch (error) {
            toast.error(t("settings.updateThemeFailed", "Failed to update theme"));
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <button className="back-btn" onClick={() => navigate('/notes')}>
                    <i className="bi bi-arrow-left"></i>
                    <span>{t("settings.back")}</span>
                </button>
                <h1 className="page-title">{t("settings.systemSettings")}</h1>
            </div>

            <div className="settings-content">
                <section className="settings-section preferences-section">
                    <h2 className="section-title">{t("settings.tabs.preferences")}</h2>
                    <div className="settings-card">
                        <div className="preference-item">
                            <div className="preference-info">
                                <i className="bi bi-palette"></i>
                                <span>{t("settings.preferences.theme")} ({isDarkMode ? t("settings.theme.dark") : t("settings.theme.light")})</span>
                            </div>
                            <div 
                                className={`toggle-switch ${isDarkMode ? 'active' : ''}`}
                                onClick={() => setIsDarkMode(!isDarkMode)}
                            >
                                <div className="toggle-knob"></div>
                            </div>
                        </div>
                        <div className="preference-divider"></div>
                        <div className="preference-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                            <div className="preference-info">
                                <i className="bi bi-card-heading"></i>
                                <span>{t("settings.defaultNoteTheme", "Default Note Theme")}</span>
                            </div>
                            <div className="theme-palette" style={{ padding: '0', marginTop: '5px' }}>
                                {['default', 'pastel-red', 'pastel-blue', 'pastel-green', 'pastel-yellow'].map(tOption => (
                                    <div 
                                        key={tOption}
                                        className={`theme-circle theme-${tOption} ${user?.defaultNoteTheme === tOption ? 'selected' : ''}`}
                                        onClick={() => handleThemeChange(tOption)}
                                        title={tOption}
                                    >
                                        {user?.defaultNoteTheme === tOption && <i className="bi bi-check"></i>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="preference-divider"></div>
                        <div className="preference-item">
                            <div className="preference-info">
                                <i className="bi bi-keyboard"></i>
                                <span>{t("settings.keyboardShortcuts")}</span>
                            </div>
                            <button className="btn-upgrade" onClick={() => dispatch(setShortcutModalOpen(true))} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'inherit' }}>
                                {t("settings.viewCheatSheet")}
                            </button>
                        </div>
                        <div className="preference-divider"></div>
                        <div className="preference-item">
                            <div className="preference-info">
                                <i className="bi bi-translate"></i>
                                <span>{t("settings.preferences.language")}</span>
                            </div>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SystemSettings;
