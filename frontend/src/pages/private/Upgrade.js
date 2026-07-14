import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import PricingCards from '../../components/PricingCards';
import CheckoutModal from '../../components/CheckoutModal';
import '../../components/settings/Settings.css';

const Upgrade = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    usePageTitle("Upgrade to Pro");

    return (
        <div className="settings-page">
            <div className="settings-header">
                <button className="back-btn" onClick={() => navigate('/settings')}>
                    <i className="bi bi-arrow-left"></i>
                    <span>{t("settings.back")}</span>
                </button>
                <h1 className="page-title">{t("pricingPage.title")}</h1>
            </div>

            <div className="w-full" style={{ paddingTop: '20px' }}>
                <div className="pricing-page-container" style={{ padding: 0, minHeight: 'auto' }}>
                    <PricingCards onUpgradeClick={() => setIsCheckoutOpen(true)} />
                </div>
            </div>

            <CheckoutModal 
                isOpen={isCheckoutOpen} 
                onClose={() => setIsCheckoutOpen(false)} 
            />
        </div>
    );
};

export default Upgrade;
