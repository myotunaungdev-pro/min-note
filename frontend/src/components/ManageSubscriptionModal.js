import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../context/SubscriptionContext';
import { cancelSubscription, resumeSubscription } from '../services/paymentService';
import { toast } from 'react-toastify';
import './CheckoutModal.css'; // Reusing base modal styles
import './ManageSubscriptionModal.css';

const ManageSubscriptionModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { cancelSubscription: updateContextCancel, resumeSubscription: updateContextResume, cancelAtPeriodEnd, nextBillingDate } = useSubscription();

    const [isCancelingAtEnd, setIsCancelingAtEnd] = useState(false);
    const [isCancelingNow, setIsCancelingNow] = useState(false);
    const [isResuming, setIsResuming] = useState(false);

    const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
    const [showImmediateConfirm, setShowImmediateConfirm] = useState(false);

    const isProcessing = isCancelingAtEnd || isCancelingNow || isResuming;

    const handleClose = () => {
        if (isProcessing) return;
        setIsConfirmingCancel(false);
        setShowImmediateConfirm(false);
        onClose();
    };

    const handleCancelClick = () => {
        setIsConfirmingCancel(true);
    };

    const handleConfirmCancel = async (immediate) => {
        if (immediate && !showImmediateConfirm) {
            setShowImmediateConfirm(true);
            return;
        }

        if (immediate) setIsCancelingNow(true);
        else setIsCancelingAtEnd(true);

        try {
            const response = await cancelSubscription(immediate);
            if (response.success) {
                updateContextCancel(immediate);
                toast.success(immediate ? t('toast.cancelImmediate') : t('toast.cancelScheduled'));
                handleClose();
            }
        } catch (error) {
            toast.error(t('toast.cancelError'));
        } finally {
            await new Promise(resolve => setTimeout(resolve, 800));
            if (immediate) setIsCancelingNow(false);
            else setIsCancelingAtEnd(false);
        }
    };

    const handleResume = async () => {
        setIsResuming(true);
        try {
            const response = await resumeSubscription();
            if (response.success) {
                updateContextResume();
                toast.success(t('toast.resumeSuccess'));
                handleClose();
            }
        } catch (error) {
            toast.error(t('toast.resumeError'));
        } finally {
            await new Promise(resolve => setTimeout(resolve, 800));
            setIsResuming(false);
        }
    };

    const formattedNextBillingDate = nextBillingDate
        ? new Date(nextBillingDate).toLocaleDateString()
        : 'Active';

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
                        <button className="checkout-close-btn" onClick={handleClose} disabled={isProcessing}>
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
                                    <span className="sub-detail-value">{formattedNextBillingDate}</span>
                                </div>
                            </div>

                            {cancelAtPeriodEnd ? (
                                <div className="manage-sub-info success">
                                    <CheckCircle size={20} className="info-icon" />
                                    <p>{t('subscriptionModal.scheduledWarning', { date: formattedNextBillingDate })}</p>
                                </div>
                            ) : showImmediateConfirm ? (
                                <div className="manage-sub-warning">
                                    <AlertTriangle size={20} className="warning-icon" />
                                    <p>{t('subscriptionModal.confirmImmediateCancel')}</p>
                                </div>
                            ) : (
                                <div className="manage-sub-warning">
                                    <AlertTriangle size={20} className="warning-icon" />
                                    <p>{isConfirmingCancel ? t('subscriptionModal.cancelWarning') : t('billing.cancelWarning')}</p>
                                </div>
                            )}
                        </div>

                        <div className="checkout-footer manage-footer manage-footer-vertical">
                            {cancelAtPeriodEnd ? (
                                <button
                                    className="manage-btn-keep"
                                    onClick={handleResume}
                                    disabled={isProcessing}
                                    style={{ opacity: isProcessing ? 0.6 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                                >
                                    {isResuming ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>{t('subscriptionModal.resumingBtn')}</span>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                            <RefreshCcw size={18} />
                                            <span>{t('subscriptionModal.resumeBtn')}</span>
                                        </div>
                                    )}
                                </button>
                            ) : showImmediateConfirm ? (
                                <div className="manage-btn-group-vertical">
                                    <button
                                        className="manage-btn-cancel manage-btn-cancel-secondary"
                                        onClick={() => handleConfirmCancel(true)}
                                        disabled={isProcessing}
                                        style={{ opacity: isProcessing ? 0.6 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isCancelingNow ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                                <Loader2 size={18} className="animate-spin" />
                                                <span>{t('subscriptionModal.cancelingBtn')}</span>
                                            </div>
                                        ) : (
                                            t('subscriptionModal.confirmImmediateBtn')
                                        )}
                                    </button>
                                    <button
                                        className="manage-btn-cancel manage-btn-tertiary"
                                        onClick={() => setShowImmediateConfirm(false)}
                                        disabled={isProcessing}
                                        style={{ marginTop: '0.5rem', opacity: isProcessing ? 0.6 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                                    >
                                        {t('subscriptionModal.goBackBtn')}
                                    </button>
                                </div>
                            ) : isConfirmingCancel ? (
                                <div className="manage-btn-group-vertical">
                                    <button
                                        className="manage-btn-keep manage-btn-with-desc"
                                        onClick={() => handleConfirmCancel(false)}
                                        disabled={isProcessing}
                                        style={{ opacity: isProcessing ? 0.6 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isCancelingAtEnd ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%', padding: '8px 0' }}>
                                                <Loader2 size={18} className="animate-spin" />
                                                <span className="btn-title" style={{ margin: 0 }}>{t('subscriptionModal.cancelingBtn')}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="btn-title">{t('subscriptionModal.cancelAtEndBtn')}</span>
                                                <span className="btn-desc">{t('subscriptionModal.cancelAtEndDesc')}</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="manage-btn-cancel manage-btn-cancel-secondary manage-btn-with-desc"
                                        onClick={() => handleConfirmCancel(true)}
                                        disabled={isProcessing}
                                        style={{ opacity: isProcessing ? 0.6 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}
                                    >
                                        {isCancelingNow ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%', padding: '8px 0' }}>
                                                <Loader2 size={18} className="animate-spin" />
                                                <span className="btn-title" style={{ margin: 0 }}>{t('subscriptionModal.cancelingBtn')}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="btn-title">{t('subscriptionModal.cancelImmediateBtn')}</span>
                                                <span className="btn-desc">{t('subscriptionModal.cancelImmediateDesc')}</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="manage-btn-cancel manage-btn-tertiary"
                                        onClick={handleClose}
                                        disabled={isProcessing}
                                        style={{ marginTop: '0.5rem', opacity: isProcessing ? 0.6 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                                    >
                                        {t('subscriptionModal.keepPlanBtn')}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="manage-btn-cancel"
                                    onClick={handleCancelClick}
                                    disabled={isProcessing}
                                    style={{ opacity: isProcessing ? 0.6 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                                >
                                    {t('billing.cancelSubscriptionBtn')}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ManageSubscriptionModal;
