import cron from 'node-cron';
import User from '../model/user.js';

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
};
