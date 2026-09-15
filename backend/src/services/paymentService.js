import ManualPayment from '../models/manualPayment.js';
import User from '../models/user.js';

class PaymentService {
    // Processes a new offline payment submission (like KPay) from the user
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

        // Hardcode the local currency prices based on the selected plan
        const amount = planType === 'yearly' ? 335000 : 35000;

        // Fetch the most recent payment attempt by this user to handle retries and prevent spam
        const existingRecord = await ManualPayment.findOne({ userId }).sort({ createdAt: -1 });

        if (existingRecord) {
            // Block new submissions if they already have one awaiting admin review
            if (existingRecord.status === 'pending') {
                const err = new Error('You already have a pending payment. Please wait for approval.');
                err.statusCode = 400;
                throw err;
            }

            // Implement a hard cutoff after 5 rejections to prevent abuse of the upload system
            if (existingRecord.status === 'rejected' && existingRecord.rejectionHistory && existingRecord.rejectionHistory.length >= 5) {
                const err = new Error('Maximum retry limit reached. Please contact support.');
                err.statusCode = 400;
                throw err;
            }

            // If a previous submission was rejected, recycle the document to save DB space
            existingRecord.planType = planType;
            existingRecord.amount = amount;
            existingRecord.slipUrl = file.path; // New image URL from Cloudinary
            existingRecord.status = 'pending';
            existingRecord.rejectionReason = null;
            
            await existingRecord.save();
            return { success: true, message: 'Payment proof submitted successfully', isUpdate: true };
        }

        // First-time submission: create a brand new manual payment record
        const manualPayment = new ManualPayment({
            userId,
            planType,
            amount,
            slipUrl: file.path
        });

        await manualPayment.save();
        return { success: true, message: 'Payment proof submitted successfully', isUpdate: false };
    }

    // Handles user-initiated cancellation of their manual subscription
    async cancelSubscription(userId, immediate) {
        const user = await User.findById(userId);
        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }

        if (immediate) {
            // Hard downgrade: instantly revoke all premium access
            user.plan = 'free';
            user.planType = null;
            user.currentPeriodEnd = null;
            user.cancelAtPeriodEnd = false;
            user.hasSeenProWelcome = false;
        } else {
            // Soft downgrade: mark them to lose access only when their paid time runs out
            user.cancelAtPeriodEnd = true;
        }

        await user.save();
        return { success: true, message: immediate ? 'Subscription canceled immediately' : 'Subscription will cancel at the end of the billing cycle' };
    }

    // Reverses a soft downgrade if the user changes their mind before the period ends
    async resumeSubscription(userId) {
        const user = await User.findById(userId);

        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }

        // Simply uncheck the cancellation flag; the cron job will ignore them now
        user.cancelAtPeriodEnd = false;
        await user.save();
        
        return { success: true, message: 'Subscription resumed successfully' };
    }
}

export const paymentService = new PaymentService();
