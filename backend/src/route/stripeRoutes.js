import express from 'express';
import { createCheckoutSession, verifyCheckoutSession, createPortalSession } from '../controller/stripeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/create-portal-session', protect, createPortalSession);
router.post('/verify-session', protect, verifyCheckoutSession);

export default router;
