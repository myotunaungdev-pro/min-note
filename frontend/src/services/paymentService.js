import axiosInstance from '../api/axiosConfig';

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

export const verifySession = async (sessionId) => {
    try {
        const response = await axiosInstance.post('/stripe/verify-session', { sessionId });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to verify session');
    }
};

export const cancelSubscription = async (immediate = false) => {
    try {
        const response = await axiosInstance.post('/cancel-subscription', { immediate });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to cancel subscription');
    }
};

export const resumeSubscription = async () => {
    try {
        const response = await axiosInstance.post('/resume-subscription');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to resume subscription');
    }
};
