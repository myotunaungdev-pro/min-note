import React from 'react';
import { APP_NAME } from '../../utils/constants';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="landing-footer">
            <div className="footer-grid">
                <div className="footer-brand">
                    <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                        <i className="bi bi-journal-richtext"></i>
                        <span>{APP_NAME}</span>
                    </Link>
                    <p className="footer-desc">
                        {t("landing.hero.subtitle1")}
                    </p>
                    <div className="social-links">
                        <a href="#twitter"><i className="bi bi-twitter-x"></i></a>
                        <a href="#github"><i className="bi bi-github"></i></a>
                        <a href="#linkedin"><i className="bi bi-linkedin"></i></a>
                    </div>
                </div>
                
                <div className="footer-col">
                    <h4>{t("landing.product")}</h4>
                    <ul>
                        <li><Link to="/features">{t("landing.footerFeaturesLink")}</Link></li>
                        <li><Link to="/pricing">{t("landing.pricing")}</Link></li>
                        <li><Link to="/integrations">{t("landing.integrations")}</Link></li>
                        <li><Link to="/changelog">{t("landing.changelog")}</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>{t("landing.resources")}</h4>
                    <ul>
                        <li><Link to="/help-center">{t("landing.helpCenter")}</Link></li>
                        <li><Link to="/guides">{t("landing.guides")}</Link></li>
                        <li><Link to="/api-docs">{t("landing.aPIDocs")}</Link></li>
                        <li><Link to="/community">{t("landing.community")}</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>{t("landing.company")}</h4>
                    <ul>
                        <li><Link to="/about">{t("landing.aboutUs")}</Link></li>
                        <li><Link to="/careers">{t("landing.careers")}</Link></li>
                        <li><Link to="/blog">{t("landing.blog")}</Link></li>
                        <li><Link to="/contact">{t("landing.contact")}</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>{t("landing.legal")}</h4>
                    <ul>
                        <li><Link to="/privacy">{t("landing.privacyPolicy")}</Link></li>
                        <li><Link to="/terms">{t("landing.termsOfService")}</Link></li>
                        <li><Link to="/cookies">{t("landing.cookiePolicy")}</Link></li>
                    </ul>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} {APP_NAME}. {t("landing.footer.rights")}</p>
                <div className="footer-locale">
                    {t("landing.builtWithPrecision")}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
