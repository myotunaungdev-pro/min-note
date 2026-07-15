import React, { createContext, useState, useEffect, useContext } from 'react';

const SubscriptionContext = createContext();

export const useSubscription = () => {
    return useContext(SubscriptionContext);
};

export const SubscriptionProvider = ({ children }) => {
    const [plan, setPlan] = useState(() => {
        const savedPlan = localStorage.getItem('user_plan');
        return savedPlan || 'free';
    });
    const [planType, setPlanType] = useState(() => localStorage.getItem('user_planType') || null);
    const [nextBillingDate, setNextBillingDate] = useState(() => localStorage.getItem('user_nextBillingDate') || null);

    useEffect(() => {
        localStorage.setItem('user_plan', plan);
        if (planType) localStorage.setItem('user_planType', planType);
        else localStorage.removeItem('user_planType');
        
        if (nextBillingDate) localStorage.setItem('user_nextBillingDate', nextBillingDate);
        else localStorage.removeItem('user_nextBillingDate');
    }, [plan, planType, nextBillingDate]);

    const upgradeToPro = (selectedPlanType = 'monthly') => {
        setPlan('pro');
        setPlanType(selectedPlanType);
        
        const currentDate = new Date();
        if (selectedPlanType === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (selectedPlanType === 'yearly') {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
        setNextBillingDate(currentDate.toISOString());
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
