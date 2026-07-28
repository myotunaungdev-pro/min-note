import axiosInstance from '../api/axiosConfig';

export const createCheckoutSession = async (planType) => {
    try {
        const response = await axiosInstance.post('/stripe/create-checkout-session', { planType });
        return {
            success: true,
            sessionId: response.data.sessionId,
            url: response.data.url
        };
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to create checkout session');
    }
};

export const cancelSubscription = () => {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Subscription canceled successfully'
            });
        }, 1500); // 1.5 second delay
    });
};
