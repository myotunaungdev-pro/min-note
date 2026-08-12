import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser, markWelcomeSeen } from '../../App/store/authSlice';
import { verifySession } from '../../services/paymentService';
import usePageTitle from '../../hooks/usePageTitle';
import { useSubscription } from '../../context/SubscriptionContext';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import '../../components/settings/Settings.css';

const PaymentSuccess = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { width, height } = useWindowSize();
    usePageTitle(t('payment.welcomePro'));

    // Slight delay to ensure confetti pops nicely after render
    const [showConfetti, setShowConfetti] = useState(false);
    const { upgradeToPro } = useSubscription();

    useEffect(() => {
        // Mark the welcome as seen on the backend so they don't get redirected here again
        dispatch(markWelcomeSeen());
    }, [dispatch]);

    useEffect(() => {
        let isMounted = true;
        let pollInterval;
        let attempts = 0;
        
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');

        const verifyProStatus = async () => {
            try {
                const action = await dispatch(fetchCurrentUser());
                if (fetchCurrentUser.fulfilled.match(action)) {
                    const user = action.payload.user;
                    if (user && user.plan === 'pro') {
                        upgradeToPro(user.planType || 'monthly', user.currentPeriodEnd);
                        if (pollInterval) clearInterval(pollInterval);
                    }
                }
            } catch (error) {
                // Ignore silent errors
            }
        };

        const checkSession = async () => {
            if (sessionId) {
                try {
                    const result = await verifySession(sessionId);
                    if (result.success && result.plan === 'pro' && isMounted) {
                        upgradeToPro(result.planType, result.currentPeriodEnd);
                        // Also update global store silently
                        dispatch(fetchCurrentUser());
                        if (pollInterval) clearInterval(pollInterval);
                    }
                } catch (error) {
                    // Fallback to polling if direct verification fails
                    verifyProStatus();
                }
            } else {
                verifyProStatus();
            }
        };

        const initialDelay = setTimeout(() => {
            if (isMounted) {
                checkSession();
                
                pollInterval = setInterval(() => {
                    attempts++;
                    if (attempts >= 5) {
                        clearInterval(pollInterval);
                    } else {
                        verifyProStatus();
                    }
                }, 2000);
            }
        }, 500);

        const timer = setTimeout(() => setShowConfetti(true), 100);
        
        return () => {
            isMounted = false;
            clearTimeout(timer);
            clearTimeout(initialDelay);
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [dispatch, upgradeToPro]);

    return (
        <div className="settings-page" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {showConfetti && (
                <Confetti
                    width={width}
                    height={height}
                    colors={['#10B981', '#F59E0B', '#FFFFFF']}
                    recycle={false}
                    numberOfPieces={600}
                    gravity={0.12}
                    style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
                />
            )}

            <div className="glass-card w-full max-w-[95%] sm:max-w-md md:max-w-lg p-4 sm:p-6 md:p-14" style={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderTop: '1px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                animation: 'magicalSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                opacity: 0, // Starts at 0, filled by animation
                transform: 'translateY(40px)'
            }}>
                <div className="success-icon-container" style={{
                    animation: 'float 4s ease-in-out infinite'
                }}>
                    <svg width="84" height="84" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 15px rgba(245, 158, 11, 0.4))' }}>
                        <defs>
                            <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FDE047" />
                                <stop offset="50%" stopColor="#F59E0B" />
                                <stop offset="100%" stopColor="#D97706" />
                            </linearGradient>
                        </defs>
                        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" fill="url(#crownGradient)" />
                    </svg>
                </div>

                <h1 className="page-title" style={{
                    margin: 0,
                    fontSize: '2.4rem',
                    fontWeight: '800',
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.2',
                    whiteSpace: 'nowrap',
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                    {t('payment.welcomePro')}
                </h1>

                <p style={{
                    color: '#94a3b8',
                    margin: 0,
                    fontSize: '1.2rem',
                    lineHeight: '1.6',
                    maxWidth: '90%',
                    fontWeight: '400'
                }}>
                    {t('payment.captureLimits')}
                </p>

                <button
                    className="pricing-card-btn pricing-btn-filled"
                    style={{
                        marginTop: '1rem',
                        maxWidth: '280px',
                        width: '100%',
                        padding: '16px 24px',
                        fontSize: '1.15rem',
                        fontWeight: '600',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                        transition: 'all 0.3s ease',
                        letterSpacing: '0.02em',
                        color: '#ffffff'
                    }}
                    onClick={() => navigate('/notes')}
                >
                    {t('payment.goToWorkspace')}
                </button>
            </div>

            <style>{`
                @keyframes magicalSlideUp {
                    0% { 
                        opacity: 0; 
                        transform: translateY(40px) scale(0.95); 
                        filter: blur(5px);
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                        filter: blur(0);
                    }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-12px) rotate(2deg); }
                }
                @media (max-width: 600px) {
                    .page-title {
                        white-space: normal !important;
                        font-size: 2rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccess;
