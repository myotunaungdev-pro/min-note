import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HelpGuide.css';

const HelpGuide = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('getting-started');
    const [openCells, setOpenCells] = useState({});
    const [revealedIds, setRevealedIds] = useState(new Set());

    const sectionRefs = useRef([]);
    const revealRefs = useRef([]);

    // Scroll-spy observer for nav
    useEffect(() => {
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        sectionRefs.current.forEach(s => {
            if (s) spyObserver.observe(s);
        });

        return () => spyObserver.disconnect();
    }, []);

    // Scroll reveal observer
    useEffect(() => {
        const revealObserver = new IntersectionObserver((entries) => {
            setRevealedIds(prev => {
                const next = new Set(prev);
                let changed = false;
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.dataset.revealId;
                        if (id && !next.has(id)) {
                            next.add(id);
                            changed = true;
                        }
                        revealObserver.unobserve(entry.target);
                    }
                });
                return changed ? next : prev;
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealRefs.current.forEach(el => {
            if (el) revealObserver.observe(el);
        });

        return () => revealObserver.disconnect();
    }, []);

    const handleScrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleCell = (id) => {
        setOpenCells(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const addSectionRef = (el) => {
        if (el && !sectionRefs.current.includes(el)) {
            sectionRefs.current.push(el);
        }
    };

    const addRevealRef = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    return (
        <div className="help-guide-wrapper">
            <div className="nav-wrap">
                <nav className="nav-pill">
                    <div className="nav-brand"><i className="bi bi-journal-text"></i> MIN NOTE</div>
                    <span 
                        className={`nav-link ${activeSection === 'getting-started' ? 'active' : ''}`} 
                        onClick={() => handleScrollTo('getting-started')}
                    >
                        {t("help.gettingStarted")}
                    </span>
                    <span 
                        className={`nav-link ${activeSection === 'pro-features' ? 'active' : ''}`} 
                        onClick={() => handleScrollTo('pro-features')}
                    >
                        {t("help.proFeatures")}
                    </span>
                    <span 
                        className={`nav-link ${activeSection === 'shortcuts' ? 'active' : ''}`} 
                        onClick={() => handleScrollTo('shortcuts')}
                    >
                        {t("help.essentialShortcuts")}
                    </span>
                    <span 
                        className={`nav-link ${activeSection === 'settings' ? 'active' : ''}`} 
                        onClick={() => handleScrollTo('settings')}
                    >
                        {t("help.settingsLanguage")}
                    </span>
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-all ml-2 border border-slate-700 font-medium text-sm shadow-sm" 
                        onClick={() => navigate(-1)}
                    >
                        <i className="bi bi-arrow-left"></i> {t("help.back")}
                    </button>
                </nav>
            </div>

            <section className="hero">
                <div className="eyebrow"><i className="bi bi-life-preserver"></i> {t("help.helpGuide").toUpperCase()}</div>
                <h1>{t("help.heroTitle1")}<br/><span>{t("help.heroTitle2")}</span></h1>
                <p>{t("help.heroSubtitle")}</p>
            </section>

            {/* Getting Started */}
            <section className="section" id="getting-started" ref={addSectionRef}>
                <div className="section-head">
                    <span className="num">01</span>
                    <h2>{t("help.gettingStarted")}</h2>
                    <span className="line"></span>
                </div>
                <div className="bento">
                    <div data-reveal-id="cell-creating-notes" className={`cell hero-cell reveal ${openCells['creating-notes'] ? 'open' : ''} ${revealedIds.has('cell-creating-notes') ? 'in' : ''}`} onClick={() => toggleCell('creating-notes')} ref={addRevealRef}>
                        <div className="cell-top">
                            <div className="cell-icon"><i className="bi bi-plus-lg"></i></div>
                            <div className="cell-chevron"><i className="bi bi-plus"></i></div>
                        </div>
                        <h3>{t("help.creatingNotes")}</h3>
                        <div className="cell-desc-wrap">
                            <div className="cell-desc-inner">
                                <p>{t("help.clickTheNewNoteButto")}</p>
                            </div>
                        </div>
                    </div>

                    <div data-reveal-id="cell-using-tags" className={`cell reveal ${openCells['using-tags'] ? 'open' : ''} ${revealedIds.has('cell-using-tags') ? 'in' : ''}`} onClick={() => toggleCell('using-tags')} ref={addRevealRef}>
                        <div className="cell-top">
                            <div className="cell-icon"><i className="bi bi-tags-fill"></i></div>
                            <div className="cell-chevron"><i className="bi bi-plus"></i></div>
                        </div>
                        <h3>{t("help.usingTags")}</h3>
                        <div className="cell-desc-wrap">
                            <div className="cell-desc-inner">
                                <p>{t("help.organizeYourWorkflow")}</p>
                            </div>
                        </div>
                    </div>

                    <div data-reveal-id="cell-rich-text" className={`cell reveal ${openCells['rich-text'] ? 'open' : ''} ${revealedIds.has('cell-rich-text') ? 'in' : ''}`} onClick={() => toggleCell('rich-text')} ref={addRevealRef}>
                        <div className="cell-top">
                            <div className="cell-icon"><i className="bi bi-type-bold"></i></div>
                            <div className="cell-chevron"><i className="bi bi-plus"></i></div>
                        </div>
                        <h3>{t("help.richText")}</h3>
                        <div className="cell-desc-wrap">
                            <div className="cell-desc-inner">
                                <p>{t("help.selectAnyTextWhileEd")}</p>
                            </div>
                        </div>
                    </div>

                    <div data-reveal-id="cell-doodle-mode" className={`cell reveal ${openCells['doodle-mode'] ? 'open' : ''} ${revealedIds.has('cell-doodle-mode') ? 'in' : ''}`} onClick={() => toggleCell('doodle-mode')} ref={addRevealRef}>
                        <div className="cell-top">
                            <div className="cell-icon"><i className="bi bi-palette-fill"></i></div>
                            <div className="cell-chevron"><i className="bi bi-plus"></i></div>
                        </div>
                        <h3>{t("help.doodleMode")}</h3>
                        <div className="cell-desc-wrap">
                            <div className="cell-desc-inner">
                                <p>{t("help.expressYourselfVisua")}</p>
                            </div>
                        </div>
                    </div>

                    <div data-reveal-id="cell-high-quality-images" className={`cell reveal ${openCells['high-quality-images'] ? 'open' : ''} ${revealedIds.has('cell-high-quality-images') ? 'in' : ''}`} onClick={() => toggleCell('high-quality-images')} ref={addRevealRef}>
                        <div className="cell-top">
                            <div className="cell-icon"><i className="bi bi-cloud-arrow-up-fill"></i></div>
                            <div className="cell-chevron"><i className="bi bi-plus"></i></div>
                        </div>
                        <h3>{t("help.highQualityImages")}</h3>
                        <div className="cell-desc-wrap">
                            <div className="cell-desc-inner">
                                <p>{t("help.allYourUploadedImage")}</p>
                            </div>
                        </div>
                    </div>

                    <div data-reveal-id="cell-image-text-recognition" className={`cell reveal ${openCells['image-text-recognition'] ? 'open' : ''} ${revealedIds.has('cell-image-text-recognition') ? 'in' : ''}`} onClick={() => toggleCell('image-text-recognition')} ref={addRevealRef}>
                        <div className="cell-top">
                            <div className="cell-icon"><i className="bi bi-textarea-t"></i></div>
                            <div className="cell-chevron"><i className="bi bi-plus"></i></div>
                        </div>
                        <h3>{t("help.imageTextRecognition")}</h3>
                        <div className="cell-desc-wrap">
                            <div className="cell-desc-inner">
                                <p>{t("help.extractTextFromYourU")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pro Features */}
            <section className="section" id="pro-features" ref={addSectionRef}>
                <div className="section-head">
                    <span className="num">02</span>
                    <h2>{t("help.proFeatures")}</h2>
                    <span className="line"></span>
                </div>
                <div data-reveal-id="pro-banner" className={`pro-banner reveal ${revealedIds.has('pro-banner') ? 'in' : ''}`} ref={addRevealRef}>
                    <div className="icon-badge"><i className="bi bi-rocket-takeoff-fill"></i></div>
                    <h3>{t("help.comingSoonTitle")}</h3>
                    <p>{t("help.comingSoonDesc")}</p>
                    <span className="tag">IN THE WORKS</span>
                </div>
            </section>

            {/* Shortcuts */}
            <section className="section" id="shortcuts" ref={addSectionRef}>
                <div className="section-head">
                    <span className="num">03</span>
                    <h2>{t("help.essentialShortcuts")}</h2>
                    <span className="line"></span>
                </div>
                <p data-reveal-id="shortcuts-intro" className={`shortcuts-intro reveal ${revealedIds.has('shortcuts-intro') ? 'in' : ''}`} ref={addRevealRef}>
                    {t("help.masterYourWorkflowWi")} <strong className="mx-1">{t("help.completeList")}</strong> {t("help.OfAllAvailableShortc")} <kbd>?</kbd> {t("help.or")} <kbd>Ctrl</kbd><kbd>/</kbd>.
                </p>
                <div className="keycap-row">
                    <div data-reveal-id="shortcut-new-note" className={`keycap-card reveal ${revealedIds.has('shortcut-new-note') ? 'in' : ''}`} ref={addRevealRef}>
                        <i className="bi bi-file-earmark-plus"></i>
                        <div className="label">{t("notes.sidebar.newNote")}</div>
                        <div className="keys"><kbd>Ctrl</kbd><span className="plus">+</span><kbd>N</kbd></div>
                    </div>
                    <div data-reveal-id="shortcut-save-note" className={`keycap-card reveal ${revealedIds.has('shortcut-save-note') ? 'in' : ''}`} ref={addRevealRef}>
                        <i className="bi bi-save2"></i>
                        <div className="label">{t("help.saveNote")}</div>
                        <div className="keys"><kbd>Ctrl</kbd><span className="plus">+</span><kbd>Enter</kbd></div>
                    </div>
                    <div data-reveal-id="shortcut-toggle-sidebar" className={`keycap-card reveal ${revealedIds.has('shortcut-toggle-sidebar') ? 'in' : ''}`} ref={addRevealRef}>
                        <i className="bi bi-layout-sidebar"></i>
                        <div className="label">{t("help.toggleSidebar")}</div>
                        <div className="keys"><kbd>Ctrl</kbd><span className="plus">+</span><kbd>\</kbd></div>
                    </div>
                </div>
            </section>

            {/* Settings & Language */}
            <section className="section" id="settings" ref={addSectionRef}>
                <div className="section-head">
                    <span className="num">04</span>
                    <h2>{t("help.settingsLanguage")}</h2>
                    <span className="line"></span>
                </div>
                <div className="settings-grid">
                    <div data-reveal-id="settings-profile" className={`settings-card reveal ${revealedIds.has('settings-profile') ? 'in' : ''}`} ref={addRevealRef}>
                        <div className="cell-icon"><i className="bi bi-gear-fill"></i></div>
                        <h3>{t("help.profileCustomization")}</h3>
                        <p>{t("help.headOverToTheSetting")}</p>
                    </div>
                    <div data-reveal-id="settings-lang" className={`settings-card reveal ${revealedIds.has('settings-lang') ? 'in' : ''}`} ref={addRevealRef}>
                        <div className="cell-icon"><i className="bi bi-globe2"></i></div>
                        <h3>{t("help.multiLanguageSupport")}</h3>
                        <p>{t("help.ourAppSupportsMultip")}</p>
                    </div>
                    <div data-reveal-id="settings-theme" className={`settings-card reveal ${revealedIds.has('settings-theme') ? 'in' : ''}`} ref={addRevealRef}>
                        <div className="cell-icon"><i className="bi bi-moon-stars-fill"></i></div>
                        <h3>{t("help.themePreferences")}</h3>
                        <p>{t("help.switchBetweenOurPrem")}</p>
                    </div>
                </div>
            </section>

            <footer>{t("help.footer")}</footer>
        </div>
    );
};

export default HelpGuide;
