import React, { createContext, useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';

const SubscriptionContext = createContext();

export const useSubscription = () => {
    return useContext(SubscriptionContext);
};

export const SubscriptionProvider = ({ children }) => {
    const user = useSelector((state) => state.auth?.user);

    const [plan, setPlan] = useState(() => {
        const savedPlan = localStorage.getItem('user_plan');
        return savedPlan || 'free';
    });
    const [planType, setPlanType] = useState(() => localStorage.getItem('user_planType') || null);
    const [nextBillingDate, setNextBillingDate] = useState(() => localStorage.getItem('user_nextBillingDate') || null);

    // Auto-sync with the freshest user data fetched from the backend via Redux
    useEffect(() => {
        if (user) {
            setPlan(user.plan || 'free');
            setPlanType(user.planType || null);
            if (user.currentPeriodEnd) {
                setNextBillingDate(new Date(user.currentPeriodEnd).toISOString());
            } else {
                setNextBillingDate(null);
            }
        } else {
            setPlan('free');
            setPlanType(null);
            setNextBillingDate(null);
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('user_plan', plan);
        if (planType) localStorage.setItem('user_planType', planType);
        else localStorage.removeItem('user_planType');
        
        if (nextBillingDate) localStorage.setItem('user_nextBillingDate', nextBillingDate);
        else localStorage.removeItem('user_nextBillingDate');
    }, [plan, planType, nextBillingDate]);

    const upgradeToPro = (selectedPlanType = 'monthly', expiryDate = null) => {
        setPlan('pro');
        setPlanType(selectedPlanType);
        
        if (expiryDate) {
            setNextBillingDate(new Date(expiryDate).toISOString());
        } else {
            setNextBillingDate(null);
        }
    };

    const cancelSubscription = () => {
        setPlan('free');
        setPlanType(null);
        setNextBillingDate(null);
    };

    return (
        <SubscriptionContext.Provider value={{ plan, planType, nextBillingDate, upgradeToPro, cancelSubscription }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
