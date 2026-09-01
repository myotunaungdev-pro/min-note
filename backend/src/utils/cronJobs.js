import cron from 'node-cron';
import User from '../model/user.js';
import { sendEmail } from './sendEmail.js';
import { getExpirationReminderTemplate } from './emailTemplates.js';

export const startCronJobs = () => {
    // 1. Run every hour at minute 0: Cleaning up expired unverified users
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('Running hourly cron job: Cleaning up expired unverified users...');
            const result = await User.deleteMany({
                isVerified: false,
                otpExpires: { $lt: Date.now() }
            });
            console.log(`Cleanup complete. Deleted ${result.deletedCount} unverified users.`);
        } catch (error) {
            console.error('❌ Error during cleanup cron job:', error.message);
        }
    });

    // 2. Run every day at midnight (00:00): Auto-Downgrade expired users
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Running daily cron job: Auto-downgrading expired Pro plans...');
            const result = await User.updateMany(
                { plan: 'pro', currentPeriodEnd: { $lt: Date.now() }, stripeSubscriptionId: null },
                { $set: { plan: 'free', hasSentExpirationReminder: false, currentPeriodEnd: null, planType: null, isPlanExpired: true, hasSeenProWelcome: false } }
            );
            console.log(`Downgrade complete. Downgraded ${result.modifiedCount} expired users to the free plan.`);
        } catch (error) {
            console.error('❌ Error during auto-downgrade cron job:', error.message);
        }
    });

    // 3. Run every day at 8:00 AM: Expiration Reminder
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log('Running daily cron job: Checking for expiring Pro plans...');

            const lowerBound = new Date(Date.now() + 48 * 60 * 60 * 1000);
            const upperBound = new Date(Date.now() + 72 * 60 * 60 * 1000);

            const expiringUsers = await User.find({
                plan: 'pro',
                currentPeriodEnd: { $gte: lowerBound, $lte: upperBound },
                hasSentExpirationReminder: false,
                $or: [
                    { stripeSubscriptionId: null }, // Manual KPay users (never auto-renew)
                    { stripeSubscriptionId: { $exists: false } },
                    { cancelAtPeriodEnd: true } // Stripe users who canceled auto-renewal
                ]
            });

            console.log(`Found ${expiringUsers.length} users expiring in 3 days.`);

            for (const user of expiringUsers) {
                try {
                    const { html, text } = getExpirationReminderTemplate(user.name);

                    await sendEmail({
                        email: user.email,
                        subject: 'Action Required: Pro Plan Expiring Soon! / အရေးကြီးအကြောင်းကြားစာ - Pro Plan သက်တမ်းကုန်ဆုံးတော့မည်!',
                        text: text,
                        message: html
                    });

                    console.log(`✅ Sent expiration reminder to ${user.email}`);

                    await User.updateOne(
                        { _id: user._id },
                        { $set: { hasSentExpirationReminder: true } }
                    );
                } catch (emailError) {
                    console.error(`❌ Failed to send expiration reminder to ${user.email}:`, emailError.message);
                }
            }
            console.log('✅ Expiration reminder cron job complete.');
        } catch (error) {
            console.error('❌ Error during expiration reminder cron job:', error.message);
        }
    });
};