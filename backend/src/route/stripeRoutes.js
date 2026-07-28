import express from 'express';
import { createCheckoutSession } from '../controller/stripeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);

export default router;
