import React, { createContext, useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../store/authSlice';

const SubscriptionContext = createContext();

export const useSubscription = () => {
    return useContext(SubscriptionContext);
};

// Context wrapper to globally expose subscription status to frontend components without prop drilling
export const SubscriptionProvider = ({ children }) => {
    // Select the currently authenticated user from Redux state
    const user = useSelector((state) => state.auth?.user);
    const dispatch = useDispatch();

    // Local state is initialized from localStorage to prevent UI flashing before Redux hydration completes
    const [plan, setPlan] = useState(() => {
        const savedPlan = localStorage.getItem('user_plan');
        return savedPlan || 'free';
    });
    const [planType, setPlanType] = useState(() => localStorage.getItem('user_planType') || null);
    const [nextBillingDate, setNextBillingDate] = useState(() => localStorage.getItem('user_nextBillingDate') || null);
    const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(() => localStorage.getItem('user_cancelAtPeriodEnd') === 'true');
    const [hasPendingPayment, setHasPendingPayment] = useState(() => localStorage.getItem('user_hasPendingPayment') === 'true');

    // Auto-sync with the freshest user data fetched from the backend via Redux
    // This effect runs every time the Redux `user` state changes
    useEffect(() => {
        if (user) {
            setPlan(user.plan || 'free');
            setPlanType(user.planType || null);
            if (user.currentPeriodEnd) {
                setNextBillingDate(new Date(user.currentPeriodEnd).toISOString());
            } else {
                setNextBillingDate(null);
            }
            setCancelAtPeriodEnd(user.cancelAtPeriodEnd || false);
            setHasPendingPayment(user.hasPendingPayment || false);
        } else {
            setPlan('free');
            setPlanType(null);
            setNextBillingDate(null);
            setCancelAtPeriodEnd(false);
            setHasPendingPayment(false);
        }
    }, [user]);

    // Keep localStorage aggressively in sync with React state to survive hard refreshes
    useEffect(() => {
        localStorage.setItem('user_plan', plan);
        if (planType) localStorage.setItem('user_planType', planType);
        else localStorage.removeItem('user_planType');
        
        if (nextBillingDate) localStorage.setItem('user_nextBillingDate', nextBillingDate);
        else localStorage.removeItem('user_nextBillingDate');
        
        localStorage.setItem('user_cancelAtPeriodEnd', cancelAtPeriodEnd);
        localStorage.setItem('user_hasPendingPayment', hasPendingPayment);
    }, [plan, planType, nextBillingDate, cancelAtPeriodEnd, hasPendingPayment]);

    // Polling mechanism: if user has a pending payment, poll the server every 15 seconds
    // to check if an Admin has approved or rejected it, so the UI updates without a refresh.
    useEffect(() => {
        let interval;
        if (hasPendingPayment) {
            interval = setInterval(() => {
                dispatch(fetchCurrentUser());
            }, 15000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [hasPendingPayment, dispatch]);

    // Optimistically upgrades the UI state before the server confirms the Stripe event
    const upgradeToPro = (selectedPlanType = 'monthly', expiryDate = null) => {
        setPlan('pro');
        setPlanType(selectedPlanType);
        
        if (expiryDate) {
            setNextBillingDate(new Date(expiryDate).toISOString());
        } else {
            setNextBillingDate(null);
        }
    };

    // Reflects a user-initiated cancellation either immediately or at period end
    const cancelSubscription = (immediate = false) => {
        if (immediate) {
            setPlan('free');
            setPlanType(null);
            setNextBillingDate(null);
            setCancelAtPeriodEnd(false);
        } else {
            setCancelAtPeriodEnd(true);
        }
    };

    // Unmarks a pending cancellation
    const resumeSubscription = () => {
        setCancelAtPeriodEnd(false);
    };

    // Flags the UI to start polling the backend for admin approval on a KPay upload
    const markPaymentAsPending = () => {
        setHasPendingPayment(true);
    };

    return (
        <SubscriptionContext.Provider value={{ plan, planType, nextBillingDate, cancelAtPeriodEnd, hasPendingPayment, markPaymentAsPending, upgradeToPro, cancelSubscription, resumeSubscription }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
