import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useSubscription } from '../context/SubscriptionContext';
import '../pages/public/Pricing.css';

const PricingCards = ({ onUpgradeClick, isUpgrading = false }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const { plan, hasPendingPayment } = useSubscription();
    const [isYearly, setIsYearly] = useState(() => {
        const saved = localStorage.getItem('pricing_billingCycle');
        if (saved !== null) return saved === 'yearly';

        const params = new URLSearchParams(window.location.search);
        if (params.get('canceled') === 'true') {
            return sessionStorage.getItem('savedPlanType') === 'yearly';
        }
        sessionStorage.removeItem('savedPlanType');
        return false;
    });

    const [currency, setCurrency] = useState(() => {
        const saved = localStorage.getItem('pricing_currency');
        if (saved) return saved;

        const params = new URLSearchParams(window.location.search);
        if (params.get('canceled') === 'true') {
            const savedCurrency = sessionStorage.getItem('savedCurrency');
            if (savedCurrency) return savedCurrency;
        } else {
            sessionStorage.removeItem('savedCurrency');
        }

        const lang = i18n.language || 'en';
        if (lang.startsWith('th')) return 'THB';
        if (lang.startsWith('my')) return 'MMK';
        return 'USD';
    });

    useEffect(() => {
        localStorage.setItem('pricing_billingCycle', isYearly ? 'yearly' : 'monthly');
        localStorage.setItem('pricing_currency', currency);
        
        sessionStorage.setItem('savedPlanType', isYearly ? 'yearly' : 'monthly');
        sessionStorage.setItem('savedCurrency', currency);
    }, [isYearly, currency]);

    useEffect(() => {
        // Only override with language default if no currency is saved
        if (!sessionStorage.getItem('savedCurrency')) {
            const lang = i18n.language || 'en';
            let initCurr = 'USD';
            if (lang.startsWith('th')) initCurr = 'THB';
            else if (lang.startsWith('my')) initCurr = 'MMK';
            setCurrency(initCurr);
        }
    }, [i18n.language]);

    const toggleBilling = () => {
        setIsYearly(!isYearly);
    };

    const pricingData = {
        monthly: { USD: { price: 8, symbol: '$' }, THB: { price: 269, symbol: '฿' }, MMK: { price: '35,000', symbol: 'Ks' } },
        yearly: { USD: { price: 76, symbol: '$' }, THB: { price: 2590, symbol: '฿' }, MMK: { price: '335,000', symbol: 'Ks' } },
        free: { USD: { price: 0, symbol: '$' }, THB: { price: 0, symbol: '฿' }, MMK: { price: 0, symbol: 'Ks' } }
    };

    const getPriceData = (planType) => {
        const data = pricingData[planType][currency] || pricingData[planType]['USD'];
        return `${data.symbol}${data.price}`;
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-1">

            <div className="pricing-controls-wrapper">
                <div className="currency-selector">
                    {['USD', 'THB', 'MMK'].map((c) => (
                        <button
                            key={c}
                            className={`currency-btn ${currency === c ? 'active' : ''}`}
                            onClick={() => setCurrency(c)}
                        >
                            {c === 'USD' ? t('pricing.currencyUSD') : c === 'THB' ? t('pricing.currencyTHB') : t('pricing.currencyMMK')}
                        </button>
                    ))}
                </div>

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
            </div>

            <div className="pricing-grid w-full max-w-md lg:max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Free Tier */}
                <div className="pricing-card">
                    <h2 className="pricing-card-name">{t('pricingPage.tiers.free.name')}</h2>
                    <div className="pricing-card-price-container flex flex-col items-center">
                        <span className="pricing-card-price">{getPriceData('free')}</span>
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
                    <div className="pricing-card-price-container flex flex-col items-center">
                        <span className="pricing-card-price">{isYearly ? getPriceData('yearly') : getPriceData('monthly')}</span>
                        <span className="pricing-card-period">{isYearly ? t('pricing.perYear') : t('pricing.perMonth')}</span>
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
                        className={`pricing-card-btn pricing-btn-filled ${hasPendingPayment ? 'opacity-70 cursor-not-allowed grayscale' : ''}`}
                        disabled={isUpgrading}
                        onClick={() => {
                            if (hasPendingPayment) {
                                toast.info(t('pricingPage.pendingBanner'));
                                return;
                            }
                            if (!user) {
                                navigate('/signup');
                                return;
                            }
                            if (user && plan === 'pro') {
                                navigate('/notes');
                                return;
                            }
                            if (user && plan !== 'pro' && onUpgradeClick) {
                                onUpgradeClick(isYearly ? 'yearly' : 'monthly', currency);
                            }
                        }}
                    >
                        {user && plan === 'pro'
                            ? t('pricingPage.currentPlan')
                            : hasPendingPayment
                                ? t('pricingPage.pendingButton')
                                : isUpgrading
                                    ? t('common.loading', 'Loading...')
                                    : t('pricingPage.tiers.pro.button')}
                    </button>
                </div>

                {/* Enterprise Tier */}
                <div className="pricing-card">
                    <h2 className="pricing-card-name">{t('pricingPage.tiers.enterprise.name')}</h2>
                    <div className="pricing-card-price-container flex flex-col items-center">
                        <span className="pricing-card-price text-3xl md:text-4xl lg:text-3xl xl:text-4xl break-words" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>{t('pricingPage.tiers.enterprise.price')}</span>
                        <span className="text-gray-400 text-sm" style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{t('enterprise.helperText')}</span>
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
                        {t('enterprise.cta')}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default PricingCards;
