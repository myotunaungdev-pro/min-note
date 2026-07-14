import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import usePageTitle from '../../hooks/usePageTitle';
import PricingCards from '../../components/PricingCards';
import './Pricing.css';

const Pricing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    usePageTitle("Pricing");

    return (
        <div className="pricing-page-container">
            <header className="pricing-header">
                <h1 className="pricing-title">{t('pricingPage.title')}</h1>
                <p className="pricing-subtitle">
                    {t('pricingPage.subtitle')}
                </p>
            </header>

            <PricingCards onUpgradeClick={() => navigate('/signup', { state: { returnTo: 'checkout' } })} />
        </div>
    );
};

export default Pricing;
