import cron from 'node-cron';
import User from '../model/user.js';
import { sendEmail } from './sendEmail.js';
import { getExpirationReminderTemplate } from './emailTemplates.js';

export const startCronJobs = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('⏳ Running hourly cron job: Cleaning up expired unverified users...');
            const result = await User.deleteMany({
                isVerified: false,
                otpExpires: { $lt: Date.now() }
            });
            console.log(`✅ Cleanup complete. Deleted ${result.deletedCount} unverified users.`);
        } catch (error) {
            console.error('❌ Error during cleanup cron job:', error.message);
        }
    });

    // Run every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log('⏳ Running daily cron job: Checking for expiring Pro plans...');
            
            const lowerBound = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now
            const upperBound = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours from now
            
            const expiringUsers = await User.find({
                plan: 'pro',
                currentPeriodEnd: { $gte: lowerBound, $lte: upperBound }
            });

            console.log(`Found ${expiringUsers.length} users expiring in 3 days.`);

            for (const user of expiringUsers) {
                try {
                    const { html, text } = getExpirationReminderTemplate(user.name);
                    await sendEmail({
                        to: user.email,
                        subject: 'Action Required: Pro Plan Expiring Soon! / အသိပေးချက် - Pro Plan သက်တမ်းကုန်ဆုံးတော့မည်!',
                        text: text,
                        html: html
                    });
                    console.log(`✉️ Sent expiration reminder to ${user.email}`);
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
