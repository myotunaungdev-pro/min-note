import Stripe from 'stripe';
import User from '../model/user.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripePriceIds = {
  monthly: {
    USD: "price_1Txkt3FKdcz2yKzLXlknbslP",
    THB: "price_1U10OFFKdcz2yKzLMzwNxA5Z"
  },
  yearly: {
    USD: "price_1U0go1FKdcz2yKzLKmV05kFj",
    THB: "price_1U10PIFKdcz2yKzLNeHriYsk"
  }
};

export const createCheckoutSession = async (req, res) => {
    try {
        const { planType, currency = 'USD' } = req.body;
        
        // Securely derive the price ID on the backend
        const finalPriceId = stripePriceIds[planType]?.[currency] || stripePriceIds['monthly']['USD'];
        
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: req.user.email,
            client_reference_id: (req.user.id || req.user._id).toString(),
            metadata: { planType: planType || 'monthly' },
            line_items: [
                {
                    price: finalPriceId,
                    quantity: 1,
                },
            ],
            success_url: `${clientUrl}/payment-success`,
            cancel_url: `${clientUrl}/upgrade?canceled=true`,
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const verifyCheckoutSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const planType = session.metadata?.planType || 'monthly';
            const userId = session.client_reference_id;

            if (userId) {
                let endDate = null;
                if (session.subscription) {
                    try {
                        const subscription = await stripe.subscriptions.retrieve(session.subscription);
                        const currentPeriodEnd = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end;
                        if (currentPeriodEnd) endDate = new Date(currentPeriodEnd * 1000);
                    } catch (subErr) {
                        console.error('Failed to retrieve subscription in verify:', subErr.message);
                    }
                }

                await User.findByIdAndUpdate(userId, {
                    plan: 'pro',
                    planType: planType,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    currentPeriodEnd: endDate
                });
                
                res.json({ success: true, plan: 'pro', planType, currentPeriodEnd: endDate });
            } else {
                res.json({ success: false, error: 'No user ID in session' });
            }
        } else {
            res.json({ success: false, status: session.payment_status });
        }
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
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('❌ Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    } else {
        // Fallback for development if no webhook secret is provided
        // WARNING: This skips signature verification and should NOT be used in production
        let rawBody = req.body;
        if (Buffer.isBuffer(rawBody)) {
            rawBody = rawBody.toString('utf8');
        }
        event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.client_reference_id;
            const planType = session.metadata?.planType || 'monthly';

            if (userId) {
                let endDate = null;
                if (session.subscription) {
                    try {
                        const subscription = await stripe.subscriptions.retrieve(session.subscription);
                        const currentPeriodEnd = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end;
                        
                        if (currentPeriodEnd) {
                            endDate = new Date(currentPeriodEnd * 1000);
                        }
                    } catch (subErr) {
                        console.error('❌ Failed to retrieve Stripe subscription:', subErr.message);
                    }
                }

                const updatedUser = await User.findByIdAndUpdate(userId, {
                    plan: 'pro',
                    planType: planType,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    currentPeriodEnd: endDate
                }, { new: true });
                
                if (!updatedUser) {
                    console.error(`❌ User not found in database for ID: ${userId}`);
                }
            } else {
                console.error('❌ No client_reference_id found in session!');
            }
        } else if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
            await User.findOneAndUpdate(
                { stripeSubscriptionId: subscription.id },
                {
                    plan: 'free',
                    stripeSubscriptionId: null,
                    currentPeriodEnd: null,
                }
            );
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Server Error');
    }
};
