import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { createCheckoutSession } from '../services/paymentService';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, planType = 'monthly' }) => {
    const { t } = useTranslation();
    const [status, setStatus] = useState('idle'); // idle | processing | error
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('processing');
        setErrorMsg('');

        try {
            const response = await createCheckoutSession(planType);
            if (response.success && response.url) {
                window.location.href = response.url;
            } else {
                throw new Error('Failed to retrieve checkout URL from server.');
            }
        } catch (error) {
            setStatus('error');
            setErrorMsg(error.message || t('checkout.errors.failed'));
        }
    };

    const handleClose = () => {
        setStatus('idle');
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
                                    <h2 className="checkout-title">Secure Checkout</h2>
                                    <p className="checkout-subtitle">You will be redirected to Stripe to securely complete your payment.</p>
                                </div>

                                <form className="checkout-form" onSubmit={handleSubmit}>
                                    {status === 'error' && (
                                        <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '15px' }}>
                                            {errorMsg}
                                        </div>
                                    )}

                                    <button type="submit" className="checkout-submit-btn">
                                        Proceed to Checkout
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="checkout-processing">
                                <div className="cyber-spinner"></div>
                                <h3 className="processing-text">Redirecting to Stripe...</h3>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutModal;
