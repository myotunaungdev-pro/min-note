import usePageTitle from '../../hooks/usePageTitle';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';

const LandingPage = () => {
    usePageTitle("Home");
    const { t } = useTranslation();

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach((el) => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <React.Fragment>
            {/* Hero Section */}
            <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">{t("landing.hero.title")}</h1>
                        <p className="hero-subtitle">
                            {t("landing.aPremiumFullyLocaliz")}
                        </p>
                        <Link to="/login" className="btn-get-started">
                            {t("landing.hero.cta")}
                            <i className="bi bi-arrow-right-short"></i>
                        </Link>
                    </div>
                </section>

                {/* Zig-Zag Features Section */}
                <section className="features-section">
                    <div className="zigzag-row reveal fade-up">
                        <div className="zigzag-text">
                            <span className="zigzag-label">{t("landing.secureCloudSync")}</span>
                            <h2 className="zigzag-title">{t("landing.yourNotesEverywhereY")}</h2>
                            <p className="zigzag-desc">
                                {t("landing.neverLoseAnIdeaAgain")}
                            </p>
                        </div>
                        <div className="zigzag-image reveal slide-right">
                            <div className="glass-placeholder">
                                <i className="bi bi-cloud-check"></i>
                            </div>
                        </div>
                    </div>

                    <div className="zigzag-row reverse reveal fade-up">
                        <div className="zigzag-text">
                            <span className="zigzag-label">{t("landing.richTextEditing")}</span>
                            <h2 className="zigzag-title">{t("landing.formatExactlyHowYouT")}</h2>
                            <p className="zigzag-desc">
                                {t("landing.useOurPremiumQuillEd")}
                            </p>
                        </div>
                        <div className="zigzag-image reveal slide-left">
                            <div className="glass-placeholder">
                                <i className="bi bi-type-bold"></i>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="how-it-works">
                    <h2 className="section-title reveal fade-up">{t("landing.howItWorks")}</h2>
                    <div className="steps-grid">
                        <div className="step-card reveal fade-up" style={{ transitionDelay: '0.1s' }}>
                            <div className="step-number">1</div>
                            <h3 className="step-title">{t("auth.signup.title")}</h3>
                            <p className="step-desc">{t("landing.createYourFreePremiu")}</p>
                        </div>
                        <div className="step-card reveal fade-up" style={{ transitionDelay: '0.2s' }}>
                            <div className="step-number">2</div>
                            <h3 className="step-title">{t("landing.captureIdeas")}</h3>
                            <p className="step-desc">{t("landing.startTypingYourThoug")}</p>
                        </div>
                        <div className="step-card reveal fade-up" style={{ transitionDelay: '0.3s' }}>
                            <div className="step-number">3</div>
                            <h3 className="step-title">{t("landing.accessAnywhere")}</h3>
                            <p className="step-desc">{t("landing.pickUpExactlyWhereYo")}</p>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="testimonials-section">
                    <h2 className="section-title reveal fade-up">{t("landing.lovedByCreatorsWorld")}</h2>
                    <div className="testimonials-grid">
                        <div className="testimonial-card reveal fade-up" style={{ transitionDelay: '0.1s' }}>
                            <i className="bi bi-quote testimonial-quote"></i>
                            <p className="testimonial-text">
                                "{t("landing.premiumNotesChangedH")}"
                            </p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">A</div>
                                <div className="author-info">
                                    <h4>{t("landing.aliceChen")}</h4>
                                    <p>{t("landing.productDesigner")}</p>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card reveal fade-up" style={{ transitionDelay: '0.2s' }}>
                            <i className="bi bi-quote testimonial-quote"></i>
                            <p className="testimonial-text">
                                "{t("landing.theDarkModeAesthetic")}"
                            </p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">M</div>
                                <div className="author-info">
                                    <h4>{t("landing.markSterling")}</h4>
                                    <p>{t("landing.softwareEngineer")}</p>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card reveal fade-up" style={{ transitionDelay: '0.3s' }}>
                            <i className="bi bi-quote testimonial-quote"></i>
                            <p className="testimonial-text">
                                "{t("landing.iLoveHowFastTheSearc")}"
                            </p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">S</div>
                                <div className="author-info">
                                    <h4>{t("landing.sarahJenkins")}</h4>
                                    <p>{t("landing.contentStrategist")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="final-cta-section reveal fade-up">
                    <div className="final-cta-container">
                        <h2 className="final-cta-title">{t("landing.startYourFreePremium")}</h2>
                        <p className="final-cta-subtitle">{t("landing.joinThousandsOfProfe")}</p>
                        <Link to="/signup" className="btn-get-started">
                            {t("landing.signUpNow")}
                            <i className="bi bi-arrow-right-short"></i>
                        </Link>
                    </div>
            </section>
        </React.Fragment>
    );
};

export default LandingPage;
