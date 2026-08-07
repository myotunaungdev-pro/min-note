import express from 'express';
import { createCheckoutSession, verifyCheckoutSession } from '../controller/stripeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-session', protect, verifyCheckoutSession);

export default router;
