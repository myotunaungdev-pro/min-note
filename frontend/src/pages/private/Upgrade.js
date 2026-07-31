import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import usePageTitle from '../../hooks/usePageTitle';
import PricingCards from '../../components/PricingCards';
import { createCheckoutSession } from '../../services/paymentService';
import '../../components/settings/Settings.css';

const Upgrade = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isUpgrading, setIsUpgrading] = useState(false);
    usePageTitle("Upgrade to Pro");

    const handleUpgradeClick = async (planType) => {
        setIsUpgrading(true);
        try {
            const response = await createCheckoutSession(planType);
            if (response.success && response.url) {
                window.location.href = response.url;
            } else {
                toast.error('Failed to retrieve checkout URL from server.');
            }
        } catch (error) {
            toast.error(error.message || 'Checkout failed');
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <button className="back-btn" onClick={() => navigate('/settings')}>
                    <i className="bi bi-arrow-left"></i>
                    <span>{t("settings.back")}</span>
                </button>
                <h1 className="page-title">{t("pricingPage.title")}</h1>
            </div>

            <PricingCards onUpgradeClick={handleUpgradeClick} isUpgrading={isUpgrading} />
        </div>
    );
};

export default Upgrade;
