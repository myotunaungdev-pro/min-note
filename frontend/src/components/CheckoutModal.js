import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../context/SubscriptionContext';
import { processPayment } from '../services/paymentService';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, planType = 'monthly' }) => {
    const { t } = useTranslation();
    const { upgradeToPro } = useSubscription();
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
    const [status, setStatus] = useState('idle'); // idle | processing | success | error
    const [errorMsg, setErrorMsg] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'number') {
            const onlyDigits = value.replace(/\D/g, '');
            const formatted = onlyDigits.replace(/(.{4})/g, '$1 ').trim();
            setCardDetails(prev => ({ ...prev, [name]: formatted }));
        } else {
            setCardDetails(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Heavily relaxed validation for mock testing purposes
        const cleanNumber = cardDetails.number.replace(/\s/g, '');
        if (cleanNumber.length < 8 || cardDetails.expiry.length < 4 || cardDetails.cvv.length < 3) {
            setStatus('error');
            setErrorMsg(t('checkout.errors.invalidCard'));
            return;
        }

        setStatus('processing');
        setErrorMsg('');

        try {
            const response = await processPayment(cardDetails);
            if (response.success) {
                setStatus('success');
                upgradeToPro(planType);

                // Auto close after showing success for a moment
                setTimeout(() => {
                    handleClose();
                }, 2000);
            }
        } catch (error) {
            setStatus('error');
            setErrorMsg(error.message || t('checkout.errors.failed'));
        }
    };

    const handleClose = () => {
        setStatus('idle');
        setCardDetails({ number: '', expiry: '', cvv: '' });
        setErrorMsg('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="checkout-overlay"
                    onClick={handleClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="checkout-modal"
                        onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ type: "spring", damping: 26, stiffness: 170, mass: 1 }}
                    >
                        <button className="checkout-close-btn" onClick={handleClose}>
                            <X size={24} />
                        </button>

                        {status === 'idle' || status === 'error' ? (
                            <>
                                <div className="checkout-header">
                                    <h2 className="checkout-title">{t('checkout.title')}</h2>
                                    <p className="checkout-subtitle">{t('checkout.subtitle')}</p>
                                </div>

                                <form className="checkout-form" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label>{t('checkout.cardNumber')}</label>
                                        <input
                                            type="text"
                                            name="number"
                                            placeholder="0000 0000 0000 0000"
                                            className="form-input"
                                            value={cardDetails.number}
                                            onChange={handleInputChange}
                                            maxLength="19"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>{t('checkout.expiry')}</label>
                                            <input
                                                type="text"
                                                name="expiry"
                                                placeholder="MM/YY"
                                                className="form-input"
                                                value={cardDetails.expiry}
                                                onChange={handleInputChange}
                                                maxLength="5"
                                            />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>{t('checkout.cvv')}</label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                placeholder="123"
                                                className="form-input"
                                                value={cardDetails.cvv}
                                                onChange={handleInputChange}
                                                maxLength="4"
                                            />
                                        </div>
                                    </div>

                                    {status === 'error' && (
                                        <div style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '4px' }}>
                                            {errorMsg}
                                        </div>
                                    )}

                                    <button type="submit" className="checkout-submit-btn">
                                        {t('checkout.payNow')}
                                    </button>
                                </form>
                            </>
                        ) : status === 'processing' ? (
                            <div className="checkout-processing">
                                <div className="cyber-spinner"></div>
                                <h3 className="processing-text">{t('checkout.processing')}</h3>
                            </div>
                        ) : (
                            <div className="checkout-success">
                                <div className="neon-checkmark-wrapper">
                                    <Check size={40} strokeWidth={3} className="neon-checkmark" />
                                </div>
                                <h3 className="success-text">{t('checkout.successTitle')}</h3>
                                <p className="success-desc">{t('checkout.successDesc')}</p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutModal;
