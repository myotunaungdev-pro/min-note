import ManualPayment from '../model/manualPayment.js';
import User from '../model/user.js';

class PaymentService {
    async submitKPayPayment(userId, planType, file) {
        if (!file) {
            const err = new Error('Payment slip image is required');
            err.statusCode = 400;
            throw err;
        }
        if (!['monthly', 'yearly'].includes(planType)) {
            const err = new Error('Invalid plan type');
            err.statusCode = 400;
            throw err;
        }

        const amount = planType === 'yearly' ? 335000 : 35000;

        const existingRecord = await ManualPayment.findOne({ userId }).sort({ createdAt: -1 });

        if (existingRecord) {
            if (existingRecord.status === 'pending') {
                const err = new Error('You already have a pending payment. Please wait for approval.');
                err.statusCode = 400;
                throw err;
            }

            if (existingRecord.status === 'rejected' && existingRecord.rejectionHistory && existingRecord.rejectionHistory.length >= 5) {
                const err = new Error('Maximum retry limit reached. Please contact support.');
                err.statusCode = 400;
                throw err;
            }

            existingRecord.planType = planType;
            existingRecord.amount = amount;
            existingRecord.slipUrl = file.path;
            existingRecord.status = 'pending';
            existingRecord.rejectionReason = null;
            
            await existingRecord.save();
            return { success: true, message: 'Payment proof submitted successfully', isUpdate: true };
        }

        const manualPayment = new ManualPayment({
            userId,
            planType,
            amount,
            slipUrl: file.path
        });

        await manualPayment.save();
        return { success: true, message: 'Payment proof submitted successfully', isUpdate: false };
    }

    async cancelSubscription(userId, immediate) {
        const user = await User.findById(userId);
        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }

        if (immediate) {
            user.plan = 'free';
            user.planType = null;
            user.currentPeriodEnd = null;
            user.cancelAtPeriodEnd = false;
            user.hasSeenProWelcome = false;
        } else {
            user.cancelAtPeriodEnd = true;
        }

        await user.save();
        return { success: true, message: immediate ? 'Subscription canceled immediately' : 'Subscription will cancel at the end of the billing cycle' };
    }

    async resumeSubscription(userId) {
        const user = await User.findById(userId);

        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }

        user.cancelAtPeriodEnd = false;
        await user.save();
        
        return { success: true, message: 'Subscription resumed successfully' };
    }
}

export const paymentService = new PaymentService();
