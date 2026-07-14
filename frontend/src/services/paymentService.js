export const processPayment = (cardDetails) => {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            if (cardDetails && cardDetails.number) {
                // Mock success response
                resolve({
                    success: true,
                    transactionId: 'txn_mock_' + Math.random().toString(36).substr(2, 9),
                    message: 'Payment processed successfully'
                });
            } else {
                reject({
                    success: false,
                    message: 'Invalid card details'
                });
            }
        }, 2000); // 2 second delay
    });
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
