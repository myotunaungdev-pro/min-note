import { stripeService } from '../services/stripeService.js';

// POST /api/stripe/create-checkout-session
// Initializes a Stripe hosted payment page for users upgrading to Pro
export const createCheckoutSession = async (req, res) => {
    try {
        const { planType, currency = 'USD' } = req.body;
        const result = await stripeService.createCheckoutSession(req.user.id || req.user._id, req.user.email, planType, currency);
        res.json(result);
    } catch (error) {
        console.error('Stripe checkout error:', error);
        
        // Catch specific card errors to return actionable messages to the frontend UI
        if (error.type === 'StripeCardError' || error.code === 'insufficient_funds') {
            return res.status(402).json({ error: 'insufficient_funds', message: 'Insufficient funds in your card.' });
        }
        res.status(400).json({ error: error.message });
    }
};

// POST /api/stripe/create-portal-session
// Generates a link to Stripe's Customer Portal so users can update cards or cancel
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

// POST /api/stripe/verify-session
// Called by the frontend immediately after a successful checkout return redirect
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

// POST /api/stripe/webhook
// Secure endpoint that receives asynchronous events directly from Stripe servers
export const webhookHandler = async (req, res) => {
    // Extract the cryptographic signature sent by Stripe
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (webhookSecret) {
        try {
            // Reconstruct the event using the raw unparsed body to ensure the signature matches exactly
            event = stripeService.verifyWebhookSignature(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('❌ Webhook signature verification failed:', err.message);
            // Immediately reject spoofed or malformed requests
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    } else {
        // Fallback for local development if the CLI webhook secret is not configured
        // WARNING: This skips signature verification and MUST NOT be used in production
        event = stripeService.parseRawWebhookBody(req.body);
    }

    try {
        // Pass the verified event to the service layer to process subscriptions, cancellations, etc.
        const result = await stripeService.handleWebhookEvent(event);
        res.json(result);
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Server Error');
    }
};
