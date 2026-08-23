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
                <div className="w-full px-4 md:px-8 lg:max-w-4xl mx-auto flex flex-col items-center text-center">
                    <h1 className="pricing-title w-full md:text-balance">{t('pricingPage.title')}</h1>
                    <p className="pricing-subtitle w-full md:max-w-2xl mx-auto md:text-balance">
                        {t('pricingPage.subtitle')}
                    </p>
                </div>
            </header>

            <PricingCards onUpgradeClick={() => navigate('/signup', { state: { returnTo: 'checkout' } })} />
        </div>
    );
};

export default Pricing;
