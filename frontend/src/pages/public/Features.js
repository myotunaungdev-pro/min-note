import usePageTitle from '../../hooks/usePageTitle';
import React from 'react';
import { Palette, Globe, Tags, ScanText } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import './Features.css';

const Features = () => {
    usePageTitle("Features");
    const { t } = useTranslation();

    return (
        <div className="features-page-container">
            <header className="features-hero">
                <h1 className="features-hero-title">{t('featuresPage.heroTitle')}</h1>
                <p className="features-hero-subtitle">
                    {t('featuresPage.heroSubtitle')}
                </p>
            </header>

            <div className="features-grid">
                {/* Custom Note Themes */}
                <div className="feature-card theme-card">
                    <div className="feature-icon-wrapper">
                        <Palette size={28} />
                    </div>
                    <h2 className="feature-title">{t('featuresPage.themeTitle')}</h2>
                    <p className="feature-desc">
                        <Trans i18nKey="featuresPage.themeDesc">
                            Personalize your workspace with our exclusive <strong>Cyber</strong> and <strong>Minimal</strong> card designs. Choose a layout that perfectly resonates with your creative energy.
                        </Trans>
                    </p>
                </div>

                {/* Seamless Localization */}
                <div className="feature-card i18n-card">
                    <div className="feature-icon-wrapper">
                        <Globe size={28} />
                    </div>
                    <h2 className="feature-title">{t('featuresPage.i18nTitle')}</h2>
                    <p className="feature-desc">
                        <Trans i18nKey="featuresPage.i18nDesc">
                            Built for a global audience. Experience instant, dynamic language switching between <strong>English, Burmese, and Thai</strong> with state-of-the-art i18n integration.
                        </Trans>
                    </p>
                </div>

                {/* Fluid Organization */}
                <div className="feature-card tags-card">
                    <div className="feature-icon-wrapper">
                        <Tags size={28} />
                    </div>
                    <h2 className="feature-title">{t('featuresPage.tagsTitle')}</h2>
                    <p className="feature-desc">
                        {t('featuresPage.tagsDesc')}
                    </p>
                </div>

                {/* Image Text Recognition */}
                <div className="feature-card ocr-card">
                    <div className="feature-icon-wrapper">
                        <ScanText size={28} />
                    </div>
                    <h2 className="feature-title">
                        {t('featuresPage.ocrTitle')}
                        <span className="coming-soon-badge">{t('featuresPage.ocrComingSoon')}</span>
                    </h2>
                    <p className="feature-desc">
                        {t('featuresPage.ocrDesc')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Features;
