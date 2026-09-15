import ManualPayment from '../models/manualPayment.js';
import User from '../models/user.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getPaymentSuccessEmailTemplate, getPaymentFailedEmailTemplate } from '../utils/emailTemplates.js';

class AdminService {
    // Retrieves a sorted list of all manual payment submissions for the admin dashboard
    async getManualPayments() {
        // Fetch payments and populate the associated user data needed for display
        const payments = await ManualPayment.find({})
            .populate('userId', 'email name plan cancelAtPeriodEnd planType currentPeriodEnd')
            .sort({ status: -1, createdAt: -1 });
            
        // Segregate pending payments to prioritize them at the top of the UI list
        const pending = payments.filter(p => p.status === 'pending');
        const others = payments.filter(p => p.status !== 'pending');
        
        return { success: true, payments: [...pending, ...others] };
    }

    // Processes a manual payment approval, upgrading the user and sending a confirmation email
    async approvePayment(paymentId) {
        const payment = await ManualPayment.findById(paymentId);
        if (!payment) {
            const err = new Error('Payment record not found');
            err.statusCode = 404;
            throw err;
        }
        
        // Prevent double-processing if another admin already handled it
        if (payment.status !== 'pending') {
            const err = new Error('Payment is already processed');
            err.statusCode = 400;
            throw err;
        }

        // Lock the payment state to approved
        payment.status = 'approved';
        await payment.save();

        const user = await User.findById(payment.userId);
        if (user) {
            // Apply the premium tier and record the billing cycle
            user.plan = 'pro';
            user.planType = payment.planType;
            
            // Calculate the new expiration date, stacking on top of any existing valid time
            let endDate = user.currentPeriodEnd ? new Date(user.currentPeriodEnd) : new Date();
            if (endDate < new Date()) {
                endDate = new Date();
            }

            if (payment.planType === 'yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                endDate.setMonth(endDate.getMonth() + 1);
            }
            
            // Update user state flags to reflect active premium status
            user.currentPeriodEnd = endDate;
            user.hasSeenProWelcome = false; // Reset to show the welcome modal on next login
            user.hasSentExpirationReminder = false;
            user.isPlanExpired = false;
            await user.save();
            
            // Generate and dispatch the success email notification
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
                // Do not throw here; the approval succeeded even if the email failed
            }
        }

        return { success: true, message: 'Payment approved successfully' };
    }

    // Processes a manual payment rejection, logging the reason and notifying the user
    async rejectPayment(paymentId, adminId, rejectionReason) {
        const payment = await ManualPayment.findById(paymentId).populate('userId');
        if (!payment) {
            const err = new Error('Payment record not found');
            err.statusCode = 404;
            throw err;
        }
        
        // Prevent double-processing
        if (payment.status !== 'pending') {
            const err = new Error('Payment is already processed');
            err.statusCode = 400;
            throw err;
        }

        const reason = rejectionReason || 'Transaction could not be verified';

        // Archive the rejected slip details into the history array for future reference
        payment.rejectionHistory.push({
            slipUrl: payment.slipUrl,
            reason: reason,
            rejectedBy: adminId
        });

        // Lock the payment state to rejected
        payment.status = 'rejected';
        payment.rejectionReason = reason;
        await payment.save();

        // Dispatch an email explaining why the proof of payment was denied
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
