import { paymentService } from '../services/paymentService.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
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
        const userId = req.user.id || req.user._id;

        const result = await paymentService.submitKPayPayment(userId, planType, file);
        
        if (result.isUpdate) {
            return res.status(200).json({ success: result.success, message: result.message });
        }
        res.status(201).json({ success: result.success, message: result.message });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('KPay Submit Error:', error);
        res.status(500).json({ error: 'Failed to submit payment proof' });
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const { immediate } = req.body;
        const userId = req.user.id || req.user._id;
        
        const result = await paymentService.cancelSubscription(userId, immediate);
        res.json(result);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Cancel Subscription Error:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
};

export const resumeSubscription = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const result = await paymentService.resumeSubscription(userId);
        res.json(result);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Resume Subscription Error:', error);
        res.status(500).json({ error: 'Failed to resume subscription' });
    }
};
