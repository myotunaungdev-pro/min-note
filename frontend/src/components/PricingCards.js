import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import '../pages/public/Pricing.css';

const PricingCards = ({ onUpgradeClick }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { plan } = useSubscription();
    const [isYearly, setIsYearly] = useState(false);

    const toggleBilling = () => {
        setIsYearly(!isYearly);
    };

    const getPrice = (basePrice) => {
        if (basePrice === 0) return 0;
        if (isYearly) return Math.floor(basePrice * 0.8 * 12);
        return basePrice;
    };

    return (
        <>
            <div className="pricing-toggle-container">
                <span className={`pricing-toggle-label ${!isYearly ? 'active' : ''}`} onClick={() => setIsYearly(false)}>
                    {t('pricingPage.billing.monthly')}
                </span>
                <div className={`pricing-toggle-switch ${isYearly ? 'active' : ''}`} onClick={toggleBilling}>
                    <div className="pricing-toggle-knob"></div>
                </div>
                <span className={`pricing-toggle-label ${isYearly ? 'active' : ''}`} onClick={() => setIsYearly(true)}>
                    {t('pricingPage.billing.yearly')}
                </span>
                <span className="pricing-save-badge">{t('pricingPage.billing.save')}</span>
            </div>

            <div className="pricing-grid w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Free Tier */}
                <div className="pricing-card">
                    <h2 className="pricing-card-name">{t('pricingPage.tiers.free.name')}</h2>
                    <div className="pricing-card-price-container">
                        <span className="pricing-card-price">$0</span>
                        <span className="pricing-card-period">{t('pricingPage.tiers.free.period')}</span>
                    </div>
                    <p className="pricing-card-desc">{t('pricingPage.tiers.free.desc')}</p>
                    
                    <ul className="pricing-card-features">
                        {t('pricingPage.tiers.free.features', { returnObjects: true }).map((feature, idx) => (
                            <li key={idx} className="pricing-card-feature">
                                <Check size={20} />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    
                    <button 
                        className="pricing-card-btn pricing-btn-outline"
                        onClick={() => navigate('/signup')}
                    >
                        {t('pricingPage.tiers.free.button')}
                    </button>
                </div>

                {/* Pro Tier */}
                <div className="pricing-card featured">
                    <h2 className="pricing-card-name">{t('pricingPage.tiers.pro.name')}</h2>
                    <div className="pricing-card-price-container">
                        <span className="pricing-card-price">${getPrice(8)}</span>
                        <span className="pricing-card-period">{isYearly ? '/year' : t('pricingPage.tiers.pro.period')}</span>
                    </div>
                    <p className="pricing-card-desc">{t('pricingPage.tiers.pro.desc')}</p>
                    
                    <ul className="pricing-card-features">
                        {t('pricingPage.tiers.pro.features', { returnObjects: true }).map((feature, idx) => (
                            <li key={idx} className="pricing-card-feature">
                                <Check size={20} />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    
                    <button 
                        className="pricing-card-btn pricing-btn-filled"
                        onClick={() => {
                            if (plan !== 'pro' && onUpgradeClick) {
                                onUpgradeClick();
                            }
                        }}
                    >
                        {plan === 'pro' ? t('pricingPage.currentPlan') : t('pricingPage.tiers.pro.button')}
                    </button>
                </div>

                {/* Enterprise Tier */}
                <div className="pricing-card">
                    <h2 className="pricing-card-name">{t('pricingPage.tiers.enterprise.name')}</h2>
                    <div className="pricing-card-price-container">
                        <span className="pricing-card-price text-3xl md:text-4xl lg:text-3xl xl:text-4xl break-words" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>{t('pricingPage.tiers.enterprise.price')}</span>
                    </div>
                    <p className="pricing-card-desc">{t('pricingPage.tiers.enterprise.desc')}</p>
                    
                    <ul className="pricing-card-features">
                        {t('pricingPage.tiers.enterprise.features', { returnObjects: true }).map((feature, idx) => (
                            <li key={idx} className="pricing-card-feature">
                                <Check size={20} />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    
                    <button 
                        className="pricing-card-btn pricing-btn-outline"
                        onClick={() => navigate('/contact')}
                    >
                        {t('pricingPage.tiers.enterprise.button')}
                    </button>
                </div>
            </div>

        </>
    );
};

export default PricingCards;
