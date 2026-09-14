import { stripeService } from '../services/stripeService.js';

export const createCheckoutSession = async (req, res) => {
    try {
        const { planType, currency = 'USD' } = req.body;
        const result = await stripeService.createCheckoutSession(req.user.id || req.user._id, req.user.email, planType, currency);
        res.json(result);
    } catch (error) {
        console.error('Stripe checkout error:', error);
        if (error.type === 'StripeCardError' || error.code === 'insufficient_funds') {
            return res.status(402).json({ error: 'insufficient_funds', message: 'Insufficient funds in your card.' });
        }
        res.status(400).json({ error: error.message });
    }
};

export const createPortalSession = async (req, res) => {
    try {
        const result = await stripeService.createPortalSession(req.user.id);
        res.json(result);
    } catch (error) {
        console.error('Stripe portal error:', error);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
};

export const verifyCheckoutSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });

        const result = await stripeService.verifyCheckoutSession(sessionId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const webhookHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (webhookSecret) {
        try {
            event = stripeService.verifyWebhookSignature(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('❌ Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    } else {
        // Fallback for development if no webhook secret is provided
        // WARNING: This skips signature verification and should NOT be used in production
        event = stripeService.parseRawWebhookBody(req.body);
    }

    try {
        const result = await stripeService.handleWebhookEvent(event);
        res.json(result);
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Server Error');
    }
};
