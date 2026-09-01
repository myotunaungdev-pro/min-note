import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import ManualPayment from '../model/manualPayment.js';
import User from '../model/user.js';
import dotenv from 'dotenv';

dotenv.config();

// Ensure Cloudinary is configured
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'min-note-payment-slips',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

export const upload = multer({ storage: storage });

export const submitKPayPayment = async (req, res) => {
    try {
        const { planType } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Payment slip image is required' });
        }
        if (!['monthly', 'yearly'].includes(planType)) {
            return res.status(400).json({ error: 'Invalid plan type' });
        }

        const userId = req.user.id || req.user._id;
        const amount = planType === 'yearly' ? 335000 : 35000;

        // Check for existing payment record
        const existingRecord = await ManualPayment.findOne({ userId }).sort({ createdAt: -1 });

        if (existingRecord) {
            if (existingRecord.status === 'pending') {
                return res.status(400).json({ error: 'You already have a pending payment. Please wait for approval.' });
            }

            if (existingRecord.status === 'rejected' && existingRecord.rejectionHistory && existingRecord.rejectionHistory.length >= 5) {
                return res.status(400).json({ error: 'Maximum retry limit reached. Please contact support.' });
            }

            existingRecord.planType = planType;
            existingRecord.amount = amount;
            existingRecord.slipUrl = file.path;
            existingRecord.status = 'pending';
            existingRecord.rejectionReason = null;
            
            await existingRecord.save();
            return res.status(200).json({ success: true, message: 'Payment proof submitted successfully' });
        }

        const manualPayment = new ManualPayment({
            userId,
            planType,
            amount,
            slipUrl: file.path
        });

        await manualPayment.save();
        res.status(201).json({ success: true, message: 'Payment proof submitted successfully' });
    } catch (error) {
        console.error('KPay Submit Error:', error);
        res.status(500).json({ error: 'Failed to submit payment proof' });
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const { immediate } = req.body;
        const userId = req.user.id || req.user._id;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
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
        res.json({ success: true, message: immediate ? 'Subscription canceled immediately' : 'Subscription will cancel at the end of the billing cycle' });
    } catch (error) {
        console.error('Cancel Subscription Error:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
};

export const resumeSubscription = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.cancelAtPeriodEnd = false;
        await user.save();
        
        res.json({ success: true, message: 'Subscription resumed successfully' });
    } catch (error) {
        console.error('Resume Subscription Error:', error);
        res.status(500).json({ error: 'Failed to resume subscription' });
    }
};
