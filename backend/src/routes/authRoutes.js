import express from 'express';
import { signup, login, updateProfile, verifyOTP, forgotPassword, resetPassword, getMe, markWelcomeSeen } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Publicly accessible endpoints for account creation and recovery
router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/login', login);

// Protected endpoints requiring a valid JWT in the Authorization header
router.put('/profile', protect, updateProfile);
router.get('/me', protect, getMe);
router.patch('/welcome-seen', protect, markWelcomeSeen);

export default router;
