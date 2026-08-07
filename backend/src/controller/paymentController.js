import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import ManualPayment from '../model/manualPayment.js';
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

        const amount = planType === 'yearly' ? 335000 : 35000;

        const manualPayment = new ManualPayment({
            userId: req.user.id || req.user._id,
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
