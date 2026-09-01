import ManualPayment from '../model/manualPayment.js';
import User from '../model/user.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getPaymentSuccessEmailTemplate, getPaymentFailedEmailTemplate } from '../utils/emailTemplates.js';

// GET /api/admin/manual-payments
export const getManualPayments = async (req, res) => {
    try {
        const payments = await ManualPayment.find({})
            .populate('userId', 'email name plan cancelAtPeriodEnd planType currentPeriodEnd')
            .sort({ status: -1, createdAt: -1 }); // 'pending' (p) comes after 'approved' (a), wait, sort pending first.
            
        // To strictly sort 'pending' first, we can do it in memory or use aggregation.
        // In memory is fine for a small admin dashboard.
        const pending = payments.filter(p => p.status === 'pending');
        const others = payments.filter(p => p.status !== 'pending');
        
        res.json({ success: true, payments: [...pending, ...others] });
    } catch (error) {
        console.error('Fetch manual payments error:', error);
        res.status(500).json({ error: 'Failed to fetch manual payments' });
    }
};

// PATCH /api/admin/manual-payments/:id/approve
export const approvePayment = async (req, res) => {
    try {
        const payment = await ManualPayment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ error: 'Payment record not found' });
        }
        if (payment.status !== 'pending') {
            return res.status(400).json({ error: 'Payment is already processed' });
        }

        payment.status = 'approved';
        await payment.save();

        const user = await User.findById(payment.userId);
        if (user) {
            user.plan = 'pro';
            user.planType = payment.planType;
            
            // Calculate currentPeriodEnd
            let endDate = user.currentPeriodEnd ? new Date(user.currentPeriodEnd) : new Date();
            if (endDate < new Date()) {
                endDate = new Date(); // If expired, start from today
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
            
            // Send automated approval email
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

        res.json({ success: true, message: 'Payment approved successfully' });
    } catch (error) {
        console.error('Approve payment error:', error);
        res.status(500).json({ error: 'Failed to approve payment' });
    }
};

// PATCH /api/admin/manual-payments/:id/reject
export const rejectPayment = async (req, res) => {
    try {
        const payment = await ManualPayment.findById(req.params.id).populate('userId');
        if (!payment) {
            return res.status(404).json({ error: 'Payment record not found' });
        }
        if (payment.status !== 'pending') {
            return res.status(400).json({ error: 'Payment is already processed' });
        }

        const { rejectionReason } = req.body;
        const reason = rejectionReason || 'Transaction could not be verified';

        payment.rejectionHistory.push({
            slipUrl: payment.slipUrl,
            reason: reason,
            rejectedBy: req.user.id || req.user._id
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

        res.json({ success: true, message: 'Payment rejected successfully' });
    } catch (error) {
        console.error('Reject payment error:', error);
        res.status(500).json({ error: 'Failed to reject payment' });
    }
};
