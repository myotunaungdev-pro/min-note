import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../context/SubscriptionContext';
import { cancelSubscription } from '../services/paymentService';
import { toast } from 'react-toastify';
import './CheckoutModal.css'; // Reusing base modal styles
import './ManageSubscriptionModal.css';

const ManageSubscriptionModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { cancelSubscription: revertToFree } = useSubscription();
    const [status, setStatus] = useState('idle'); // idle | processing

    const handleClose = () => {
        if (status === 'processing') return;
        onClose();
        setStatus('idle');
    };

    const handleCancel = async () => {
        setStatus('processing');
        try {
            const response = await cancelSubscription();
            if (response.success) {
                revertToFree();
                toast.success(t('billing.cancelSuccess'));
                handleClose();
            }
        } catch (error) {
            toast.error(t('billing.cancelError', { defaultValue: 'Failed to cancel subscription' }));
            setStatus('idle');
        }
    };

    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="checkout-overlay"
                    onClick={handleClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className="checkout-modal manage-sub-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <button className="checkout-close-btn" onClick={handleClose} disabled={status === 'processing'}>
                            <X size={24} />
                        </button>
                        <div className="checkout-header">
                            <h2 className="checkout-title">{t('billing.manageSubscription')}</h2>
                        </div>

                        <div className="checkout-body">
                            <div className="manage-sub-details">
                                <div className="sub-detail-row">
                                    <span className="sub-detail-label">{t('billing.currentPlan')}</span>
                                    <span className="sub-detail-value pro-badge">{t('billing.proPlan')}</span>
                                </div>
                                <div className="sub-detail-row">
                                    <span className="sub-detail-label">{t('billing.nextBillingDate')}</span>
                                    <span className="sub-detail-value">{nextBillingDate.toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="manage-sub-warning">
                                <AlertTriangle size={20} className="warning-icon" />
                                <p>{t('billing.cancelWarning')}</p>
                            </div>
                        </div>

                        <div className="checkout-footer manage-footer">
                            <button
                                className="manage-btn-cancel"
                                onClick={handleCancel}
                                disabled={status === 'processing'}
                            >
                                {status === 'processing' ? (
                                    <div className="spinner-small"></div>
                                ) : (
                                    t('billing.cancelSubscriptionBtn')
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ManageSubscriptionModal;
