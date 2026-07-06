import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HelpGuide.css';

const HelpGuide = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('getting_started');

    const tabs = [
        { id: 'getting_started', label: t("help.gettingStarted"), icon: 'bi-rocket' },
        { id: 'pro_features', label: t("help.proFeatures"), icon: 'bi-star' },
        { id: 'shortcuts', label: t("help.essentialShortcuts"), icon: 'bi-keyboard' },
        { id: 'settings_language', label: t("help.settingsLanguage"), icon: 'bi-gear' }
    ];

    return (
        <div className="help-guide-page">
            <div className="help-guide-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left"></i>
                    <span>{t("help.back")}</span>
                </button>
                <h2>{t("help.helpGuide")}</h2>
            </div>
            <div className="help-guide-content-wrapper">
                <div className="help-guide-sidebar">
                    <ul className="help-tabs flex overflow-x-auto justify-start items-center gap-2 w-full pb-4 no-scrollbar">
                        {tabs.map(tab => (
                            <li 
                                key={tab.id} 
                                className={`help-tab w-max flex-shrink-0 whitespace-nowrap px-4 py-2 cursor-pointer flex items-center gap-1.5 rounded-full transition-all duration-300 font-medium ${activeTab === tab.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-gray-200'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <i className={`bi ${tab.icon}`}></i>
                                {tab.label}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="help-guide-main">
                    {activeTab === 'getting_started' && (
                        <div className="help-section fade-in bg-slate-800/40 rounded-2xl p-6 lg:p-8 shadow-xl backdrop-blur-sm">
                            <h3 className="mb-6 flex items-center gap-2"><i className="bi bi-rocket-takeoff text-emerald-400"></i> <span className="text-white font-semibold">{t("help.gettingStarted")}</span></h3>
                            <ul className="help-list space-y-4">
                                <li className="flex flex-col sm:flex-row sm:gap-2"><strong className="text-gray-100 font-medium shrink-0">{t("help.creatingNotes")}</strong> <span className="text-gray-400">{t("help.clickTheNewNoteButto")}</span></li>
                                <li className="flex flex-col sm:flex-row sm:gap-2"><strong className="text-gray-100 font-medium shrink-0">{t("help.usingTags")}</strong> <span className="text-gray-400">{t("help.organizeYourWorkflow")}</span></li>
                                <li className="flex flex-col sm:flex-row sm:gap-2"><strong className="text-gray-100 font-medium shrink-0">{t("help.richText")}</strong> <span className="text-gray-400">{t("help.selectAnyTextWhileEd")}</span></li>
                                <li className="flex flex-col sm:flex-row sm:gap-2"><strong className="text-gray-100 font-medium shrink-0">{t("help.doodleMode")}</strong> <span className="text-gray-400">{t("help.expressYourselfVisua")}</span></li>
                                <li className="flex flex-col sm:flex-row sm:gap-2"><strong className="text-gray-100 font-medium shrink-0">{t("help.highQualityImages")}</strong> <span className="text-gray-400">{t("help.allYourUploadedImage")}</span></li>
                                <li className="flex flex-col sm:flex-row sm:gap-2"><strong className="text-gray-100 font-medium shrink-0">{t("help.imageTextRecognition")}</strong> <span className="text-gray-400">{t("help.extractTextFromYourU")}</span></li>
                            </ul>
                        </div>
                    )}
                    {activeTab === 'pro_features' && (
                        <div className="help-section fade-in bg-slate-800/40 rounded-2xl p-6 lg:p-8 shadow-xl backdrop-blur-sm">
                            <h3 className="mb-6 flex items-center gap-2"><i className="bi bi-star-fill text-yellow-400"></i> <span className="text-white font-semibold">{t("help.proFeatures")}</span></h3>
                            <div className="mt-3">
                                <h5 className="text-gray-100 font-medium mb-2">{t("help.comingSoonTitle")}</h5>
                                <p className="text-gray-400">{t("help.comingSoonDesc")}</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'shortcuts' && (
                        <div className="help-section fade-in bg-slate-800/40 rounded-2xl p-6 lg:p-8 shadow-xl backdrop-blur-sm">
                            <h3 className="mb-6 flex items-center gap-2"><i className="bi bi-keyboard text-indigo-400"></i> <span className="text-white font-semibold">{t("help.essentialShortcuts")}</span></h3>
                            <p className="text-gray-400 mb-6">
                                {t("help.masterYourWorkflowWi")} 
                                <strong className="text-gray-100 font-medium mx-1">{t("help.completeList")}</strong> 
                                {t("help.OfAllAvailableShortc")}
                            </p>
                            <div className="shortcut-highlight bg-slate-900/50 p-4 rounded-xl border border-slate-700 mb-6 flex items-center justify-center gap-3">
                                <kbd className="bg-slate-700 text-gray-100 px-2 py-1 rounded-md text-sm font-mono shadow">?</kbd> <span className="text-gray-400">{t("help.or")}</span> <kbd className="bg-slate-700 text-gray-100 px-2 py-1 rounded-md text-sm font-mono shadow">Ctrl</kbd> <span className="text-gray-500">+</span> <kbd className="bg-slate-700 text-gray-100 px-2 py-1 rounded-md text-sm font-mono shadow">/</kbd>
                            </div>
                            <ul className="help-list space-y-4">
                                <li className="flex flex-col sm:flex-row sm:items-center sm:gap-2"><strong className="text-gray-100 font-medium shrink-0 min-w-[120px]">{t("notes.sidebar.newNote")}</strong> <div className="flex items-center gap-2 text-gray-400"><kbd className="bg-slate-700 text-gray-100 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-slate-700 text-gray-100 px-2 py-1 rounded text-xs font-mono">N</kbd></div></li>
                                <li className="flex flex-col sm:flex-row sm:items-center sm:gap-2"><strong className="text-gray-100 font-medium shrink-0 min-w-[120px]">{t("help.saveNote")}</strong> <div className="flex items-center gap-2 text-gray-400"><kbd className="bg-slate-700 text-gray-100 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-slate-700 text-gray-100 px-2 py-1 rounded text-xs font-mono">Enter</kbd></div></li>
                                <li className="flex flex-col sm:flex-row sm:items-center sm:gap-2"><strong className="text-gray-100 font-medium shrink-0 min-w-[120px]">{t("help.toggleSidebar")}</strong> <div className="flex items-center gap-2 text-gray-400"><kbd className="bg-slate-700 text-gray-100 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-slate-700 text-gray-100 px-2 py-1 rounded text-xs font-mono">\</kbd></div></li>
                            </ul>
                        </div>
                    )}
                    {activeTab === 'settings_language' && (
                        <div className="help-section fade-in bg-slate-800/40 rounded-2xl p-6 lg:p-8 shadow-xl backdrop-blur-sm">
                            <h3 className="mb-6 flex items-center gap-2"><i className="bi bi-globe text-cyan-400"></i> <span className="text-white font-semibold">{t("help.settingsLanguage")}</span></h3>
                            <ul className="help-list space-y-4">
                                <li className="flex flex-col sm:flex-row sm:gap-2"><strong className="text-gray-100 font-medium shrink-0">{t("help.profileCustomization")}</strong> <span className="text-gray-400">{t("help.headOverToTheSetting")}</span></li>
                                <li className="flex flex-col sm:flex-row sm:gap-2"><strong className="text-gray-100 font-medium shrink-0">{t("help.multiLanguageSupport")}</strong> <span className="text-gray-400">{t("help.ourAppSupportsMultip")}</span></li>
                                <li className="flex flex-col sm:flex-row sm:gap-2"><strong className="text-gray-100 font-medium shrink-0">{t("help.themePreferences")}</strong> <span className="text-gray-400">{t("help.switchBetweenOurPrem")}</span></li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HelpGuide;
