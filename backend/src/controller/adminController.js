import ManualPayment from '../model/manualPayment.js';
import User from '../model/user.js';
import { sendEmail } from '../utils/sendEmail.js';

// GET /api/admin/manual-payments
export const getManualPayments = async (req, res) => {
    try {
        const payments = await ManualPayment.find({})
            .populate('userId', 'email name')
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
            await user.save();
            
            // Send automated approval email
            const planTypeCapitalized = payment.planType.charAt(0).toUpperCase() + payment.planType.slice(1);
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #00d4aa;">Your MIN NOTE Pro Subscription is Active!</h2>
                    <p>Hello ${user.name},</p>
                    <p>Great news! We have successfully verified your KPay payment proof.</p>
                    <p>Your account has now been upgraded to the <strong>${planTypeCapitalized} Pro Plan</strong>.</p>
                    <p>Thank you for choosing MIN NOTE. We hope you enjoy the premium features!</p>
                    
                    <hr style="border:none; border-top:1px solid #eee; margin: 20px 0;">
                    
                    <h2 style="color: #00d4aa;">လူကြီးမင်း၏ MIN NOTE Pro အကောင့် ရရှိပါပြီ!</h2>
                    <p>ဝမ်းမြောက်ပါသည်! လူကြီးမင်း၏ KPay ငွေလွှဲမှတ်တမ်းကို အတည်ပြုပြီးပါပြီ။</p>
                    <p>လူကြီးမင်း၏ အကောင့်ကို <strong>${planTypeCapitalized} Pro Plan</strong> သို့ အောင်မြင်စွာ ပြောင်းလဲပေးလိုက်ပါသည်။</p>
                    <p>MIN NOTE ကို ရွေးချယ်တဲ့အတွက် ကျေးဇူးတင်ပါသည်။</p>
                    
                    <br>
                    <p>Best regards,<br>The MIN NOTE Team</p>
                </div>
            `;
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Your MIN NOTE Pro Subscription is Active! / လူကြီးမင်း၏ MIN NOTE Pro အကောင့် ရရှိပါပြီ',
                    message: emailHtml
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

        payment.status = 'rejected';
        await payment.save();

        if (payment.userId && payment.userId.email) {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2>Update regarding your MIN NOTE Payment Proof</h2>
                    <p>Hello ${payment.userId.name || 'User'},</p>
                    <p>We encountered an issue while verifying the payment proof you submitted.</p>
                    <p>Unfortunately, we could not confirm the transaction. Please contact our support team or re-submit a valid screenshot of the successful KPay transfer.</p>
                    
                    <hr style="border:none; border-top:1px solid #eee; margin: 20px 0;">
                    
                    <h2>MIN NOTE ငွေပေးချေမှု အခြေအနေ</h2>
                    <p>လူကြီးမင်း တင်သွင်းထားသော KPay ငွေလွှဲမှတ်တမ်းကို စစ်ဆေးရာတွင် အခက်အခဲရှိနေပါသည်။</p>
                    <p>ကျေးဇူးပြု၍ မှန်ကန်သော ငွေလွှဲပြေစာအား ပြန်လည်တင်သွင်းပေးပါရန် သို့မဟုတ် Customer Support သို့ ဆက်သွယ်ပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။</p>
                    
                    <br>
                    <p>Best regards,<br>The MIN NOTE Team</p>
                </div>
            `;
            try {
                await sendEmail({
                    email: payment.userId.email,
                    subject: 'Update regarding your MIN NOTE Payment / MIN NOTE ငွေပေးချေမှု အခြေအနေ',
                    message: emailHtml
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
