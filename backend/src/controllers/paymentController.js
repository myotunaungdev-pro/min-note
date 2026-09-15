import { paymentService } from '../services/paymentService.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Ensure Cloudinary is configured with the environment variables for direct uploads
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer to stream file uploads directly to Cloudinary instead of the local disk
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'min-note-payment-slips',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

// Export the configured middleware to be used in the router
export const upload = multer({ storage: storage });

// POST /api/payment/submit
// Receives the plan details and the uploaded slip file from Multer to initiate a manual payment
export const submitKPayPayment = async (req, res) => {
    try {
        const { planType } = req.body;
        const file = req.file; // Populated by the upload middleware
        const userId = req.user.id || req.user._id;

        const result = await paymentService.submitKPayPayment(userId, planType, file);
        
        // 200 OK for an updated retry, 201 Created for a brand new submission
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

// POST /api/payment/cancel
// Handles user requests to cancel their manual subscription (either immediately or at period end)
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

// POST /api/payment/resume
// Removes the pending cancellation flag so the user's manual subscription remains active
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
