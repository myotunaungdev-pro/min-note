import express from 'express';
import { createCheckoutSession, verifyCheckoutSession, createPortalSession } from '../controllers/stripeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Generates a Stripe checkout page URL for users looking to subscribe or upgrade
router.post('/create-checkout-session', protect, createCheckoutSession);

// Generates a self-service Stripe billing portal URL for users to manage their active subscription
router.post('/create-portal-session', protect, createPortalSession);

// Manually verifies the result of a checkout session when the user is redirected back to the app
router.post('/verify-session', protect, verifyCheckoutSession);

// Note: The Stripe Webhook route (/api/stripe/webhook) is explicitly NOT defined here.
// It must bypass the standard Express JSON body parser to allow cryptographic signature verification,
// so it is registered directly in backend/src/server.js using express.raw().

export default router;
