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

    useEffect(() => {
        localStorage.setItem('user_plan', plan);
    }, [plan]);

    const upgradeToPro = () => {
        setPlan('pro');
    };

    const cancelSubscription = () => {
        setPlan('free');
    };

    return (
        <SubscriptionContext.Provider value={{ plan, upgradeToPro, cancelSubscription }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
