import express from 'express';
import { signup, login, updateProfile, verifyOTP, forgotPassword, resetPassword, getMe, markWelcomeSeen } from '../controller/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/login', login);
router.put('/profile', protect, updateProfile);
router.get('/me', protect, getMe);
router.patch('/welcome-seen', protect, markWelcomeSeen);

export default router;
