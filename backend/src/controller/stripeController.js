import Stripe from 'stripe';
import User from '../model/user.js';
import dotenv from 'dotenv';
import { sendEmail } from '../utils/sendEmail.js';
import { getPaymentSuccessEmailTemplate } from '../utils/emailTemplates.js';

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

export const createPortalSession = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user || !user.stripeCustomerId) {
            return res.status(400).json({ error: 'No Stripe customer found for this user' });
        }

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${clientUrl}/settings`,
        });

        res.json({ url: portalSession.url });
    } catch (error) {
        console.error('Stripe portal error:', error);
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
                let priceId = null;
                if (session.subscription) {
                    try {
                        const subscription = await stripe.subscriptions.retrieve(session.subscription);
                        const currentPeriodEnd = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end;
                        priceId = subscription.items?.data?.[0]?.price?.id;
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
                    stripePriceId: priceId,
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
                let priceId = null;
                if (session.subscription) {
                    try {
                        const subscription = await stripe.subscriptions.retrieve(session.subscription);
                        const currentPeriodEnd = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end;
                        priceId = subscription.items?.data?.[0]?.price?.id;
                        
                        if (currentPeriodEnd) {
                            endDate = new Date(currentPeriodEnd * 1000);
                        }
                    } catch (subErr) {
                        console.error('❌ Failed to retrieve Stripe subscription:', subErr.message);
                    }
                }

                const existingUser = await User.findById(userId);
                
                // Idempotency Check: Prevent duplicate webhook processing
                if (existingUser && existingUser.stripeSubscriptionId === session.subscription) {
                    console.log('✅ Webhook already processed for this checkout session.');
                    return res.json({ received: true });
                }

                const updatedUser = await User.findByIdAndUpdate(userId, {
                    plan: 'pro',
                    planType: planType,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    stripePriceId: priceId,
                    currentPeriodEnd: endDate
                }, { returnDocument: 'after' });
                
                if (updatedUser) {
                    const planTypeCapitalized = planType.charAt(0).toUpperCase() + planType.slice(1);
                    const { html, text } = getPaymentSuccessEmailTemplate(updatedUser.name, planTypeCapitalized);
                    
                    try {
                        await sendEmail({
                            email: updatedUser.email,
                            subject: 'Your MIN NOTE Pro Subscription is Active! / လူကြီးမင်း၏ MIN NOTE Pro အကောင့် ရရှိပါပြီ',
                            message: html,
                            text: text
                        });
                    } catch (err) {
                        console.error('❌ Failed to send Stripe success email:', err.message);
                    }
                } else {
                    console.error(`❌ User not found in database for ID: ${userId}`);
                }
            } else {
                console.error('❌ No client_reference_id found in session!');
            }
        } else if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object;
            
            // Stripe API Updates: current_period_end moved to items.data[0], and portal may use cancel_at instead of cancel_at_period_end
            const isCanceling = subscription.cancel_at_period_end || subscription.cancel_at !== null;
            const current_period_end_raw = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end;
            
            const cancel_at_period_end = Boolean(isCanceling);
            const current_period_end_date = current_period_end_raw ? new Date(current_period_end_raw * 1000) : null;
            const priceId = subscription.items?.data?.[0]?.price?.id;
            const interval = subscription.items?.data?.[0]?.plan?.interval;
            let planType = undefined;
            if (interval === 'month') planType = 'monthly';
            if (interval === 'year') planType = 'yearly';
            

            const updatedUser = await User.findOneAndUpdate(
                { stripeSubscriptionId: subscription.id },
                {
                    cancelAtPeriodEnd: cancel_at_period_end,
                    ...(current_period_end_date && { currentPeriodEnd: current_period_end_date }),
                    ...(priceId && { stripePriceId: priceId }),
                    ...(planType && { planType: planType })
                },
                { returnDocument: 'after' } // Resolves Mongoose deprecation warning
            );
            
            if (updatedUser) {
                // User successfully updated

            } else {
                console.warn(`⚠️ Warning: No user found in DB with stripeSubscriptionId: ${subscription.id}`);
            }
        } else if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
            await User.findOneAndUpdate(
                { stripeSubscriptionId: subscription.id },
                {
                    plan: 'free',
                    stripeSubscriptionId: null,
                    stripePriceId: null,
                    currentPeriodEnd: null,
                    cancelAtPeriodEnd: false,
                }
            );
        } else if (event.type === 'invoice.paid') {
            const invoice = event.data.object;
            const stripeSubscriptionId = invoice.subscription;
            
            if (stripeSubscriptionId) {
                try {
                    // Extract directly from the invoice object (no extra Stripe API call needed)
                    const periodEndRaw = invoice.lines?.data?.[0]?.period?.end || invoice.period_end;
                    
                    if (periodEndRaw) {
                        const endDate = new Date(periodEndRaw * 1000);
                        await User.findOneAndUpdate(
                            { stripeSubscriptionId: stripeSubscriptionId },
                            { 
                                currentPeriodEnd: endDate,
                                hasPaymentIssue: false // Clear any previous issues
                            }
                        );
                        console.log(`✅ Auto-renewed subscription for invoice ${invoice.id}, new end date: ${endDate}`);
                    }
                } catch (subErr) {
                    console.error('❌ Failed to process invoice.paid:', subErr.message);
                }
            } else {
                console.log(`ℹ️ Ignored invoice.paid for non-subscription invoice ${invoice.id}`);
            }
        } else if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object;
            const stripeSubscriptionId = invoice.subscription;
            
            if (stripeSubscriptionId) {
                console.warn(`⚠️ Invoice payment failed for subscription ${stripeSubscriptionId}`);
                await User.findOneAndUpdate(
                    { stripeSubscriptionId: stripeSubscriptionId },
                    { hasPaymentIssue: true }
                );
                console.log(`⚠️ Marked hasPaymentIssue=true for user with subscription ${stripeSubscriptionId}`);
            } else {
                console.warn(`⚠️ Invoice payment failed for non-subscription invoice ${invoice.id} (subscription undefined or null)`);
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Server Error');
    }
};
