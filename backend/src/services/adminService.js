import ManualPayment from '../model/manualPayment.js';
import User from '../model/user.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getPaymentSuccessEmailTemplate, getPaymentFailedEmailTemplate } from '../utils/emailTemplates.js';

class AdminService {
    async getManualPayments() {
        const payments = await ManualPayment.find({})
            .populate('userId', 'email name plan cancelAtPeriodEnd planType currentPeriodEnd')
            .sort({ status: -1, createdAt: -1 });
            
        const pending = payments.filter(p => p.status === 'pending');
        const others = payments.filter(p => p.status !== 'pending');
        
        return { success: true, payments: [...pending, ...others] };
    }

    async approvePayment(paymentId) {
        const payment = await ManualPayment.findById(paymentId);
        if (!payment) {
            const err = new Error('Payment record not found');
            err.statusCode = 404;
            throw err;
        }
        if (payment.status !== 'pending') {
            const err = new Error('Payment is already processed');
            err.statusCode = 400;
            throw err;
        }

        payment.status = 'approved';
        await payment.save();

        const user = await User.findById(payment.userId);
        if (user) {
            user.plan = 'pro';
            user.planType = payment.planType;
            
            let endDate = user.currentPeriodEnd ? new Date(user.currentPeriodEnd) : new Date();
            if (endDate < new Date()) {
                endDate = new Date();
            }

            if (payment.planType === 'yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                endDate.setMonth(endDate.getMonth() + 1);
            }
            
            user.currentPeriodEnd = endDate;
            user.hasSeenProWelcome = false;
            user.hasSentExpirationReminder = false;
            user.isPlanExpired = false;
            await user.save();
            
            const planTypeCapitalized = payment.planType.charAt(0).toUpperCase() + payment.planType.slice(1);
            const { html, text } = getPaymentSuccessEmailTemplate(user.name, planTypeCapitalized);

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Your MIN NOTE Pro Subscription is Active! / လူကြီးမင်း၏ MIN NOTE Pro အကောင့် ရရှိပါပြီ',
                    message: html,
                    text: text
                });
            } catch (err) {
                console.error('Failed to send approval email:', err);
            }
        }

        return { success: true, message: 'Payment approved successfully' };
    }

    async rejectPayment(paymentId, adminId, rejectionReason) {
        const payment = await ManualPayment.findById(paymentId).populate('userId');
        if (!payment) {
            const err = new Error('Payment record not found');
            err.statusCode = 404;
            throw err;
        }
        if (payment.status !== 'pending') {
            const err = new Error('Payment is already processed');
            err.statusCode = 400;
            throw err;
        }

        const reason = rejectionReason || 'Transaction could not be verified';

        payment.rejectionHistory.push({
            slipUrl: payment.slipUrl,
            reason: reason,
            rejectedBy: adminId
        });

        payment.status = 'rejected';
        payment.rejectionReason = reason;
        await payment.save();

        if (payment.userId && payment.userId.email) {
            const { html, text } = getPaymentFailedEmailTemplate(
                payment.userId.name || 'User',
                payment.rejectionReason
            );
            
            try {
                await sendEmail({
                    email: payment.userId.email,
                    subject: 'Update regarding your MIN NOTE Payment / MIN NOTE ငွေပေးချေမှု အခြေအနေ',
                    message: html,
                    text: text
                });
            } catch (err) {
                console.error('Failed to send rejection email:', err);
            }
        }

        return { success: true, message: 'Payment rejected successfully' };
    }
}

export const adminService = new AdminService();
