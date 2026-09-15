import axiosInstance from '../api/axiosConfig';

// Initializes a Stripe checkout session for a given plan and currency
export const createCheckoutSession = async (planType, currency = 'USD') => {
    try {
        const response = await axiosInstance.post('/stripe/create-checkout-session', { planType, currency });
        return {
            success: true,
            sessionId: response.data.sessionId,
            url: response.data.url
        };
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to create checkout session');
    }
};

// Verifies the success of a Stripe payment session via the backend webhook listener
export const verifySession = async (sessionId) => {
    try {
        const response = await axiosInstance.post('/stripe/verify-session', { sessionId });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to verify session');
    }
};

// Signals the backend to cancel a Stripe subscription, optionally taking immediate effect
export const cancelSubscription = async (immediate = false) => {
    try {
        const response = await axiosInstance.post('/cancel-subscription', { immediate });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to cancel subscription');
    }
};

// Reverses a pending cancellation if the subscription period hasn't ended yet
export const resumeSubscription = async () => {
    try {
        const response = await axiosInstance.post('/resume-subscription');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to resume subscription');
    }
};
