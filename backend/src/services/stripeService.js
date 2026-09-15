import Stripe from 'stripe';
import User from '../models/user.js';
import dotenv from 'dotenv';
import { sendEmail } from '../utils/sendEmail.js';
import { getPaymentSuccessEmailTemplate } from '../utils/emailTemplates.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Hardcoded mapping of Stripe Price IDs to internal plan types and currencies
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

class StripeService {
    // Generates a Stripe hosted checkout page URL for a user looking to upgrade
    async createCheckoutSession(userId, email, planType, currency = 'USD') {
        const finalPriceId = stripePriceIds[planType]?.[currency] || stripePriceIds['monthly']['USD'];
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

        // Initialize the Stripe session payload, enforcing recurring subscriptions
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: email,
            client_reference_id: userId.toString(),
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

        return { sessionId: session.id, url: session.url };
    }

    // Generates a self-service Stripe billing portal URL for active subscribers to manage their cards/plans
    async createPortalSession(userId) {
        const user = await User.findById(userId);
        
        if (!user || !user.stripeCustomerId) {
            const err = new Error('No Stripe customer found for this user');
            err.statusCode = 400;
            throw err;
        }

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${clientUrl}/settings`,
        });

        return { url: portalSession.url };
    }

    // Polling fallback to check if a checkout session was completed successfully (used mainly as a backup to webhooks)
    async verifyCheckoutSession(sessionId) {
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
                
                return { success: true, plan: 'pro', planType, currentPeriodEnd: endDate };
            } else {
                return { success: false, error: 'No user ID in session' };
            }
        } else {
            return { success: false, status: session.payment_status };
        }
    }

    // Cryptographically verifies that the incoming HTTP request is genuinely from Stripe
    verifyWebhookSignature(rawBody, sig, webhookSecret) {
        return stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    }

    // Normalizes the request body ensuring it's a parsed JSON object
    parseRawWebhookBody(rawBody) {
        let body = rawBody;
        if (Buffer.isBuffer(body)) {
            body = body.toString('utf8');
        }
        return typeof body === 'string' ? JSON.parse(body) : body;
    }

    // Master switchboard that routes verified Stripe webhook events to their respective handler logic
    async handleWebhookEvent(event) {
        // Triggered when a user successfully completes a new checkout flow
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

                // Idempotency check: prevent duplicate emails or DB writes if Stripe sends the event twice
                const existingUser = await User.findById(userId);
                
                if (existingUser && existingUser.stripeSubscriptionId === session.subscription) {
                    console.log('✅ Webhook already processed for this checkout session.');
                    return { received: true };
                }

                // Update the user's tier, sync Stripe metadata, and wipe any previous expiration flags
                const updatedUser = await User.findByIdAndUpdate(userId, {
                    plan: 'pro',
                    planType: planType,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    stripePriceId: priceId,
                    currentPeriodEnd: endDate,
                    isPlanExpired: false
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
        // Triggered when a subscription changes state (e.g., user cancels it via the portal, or an admin changes the plan)
        } else if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object;
            
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
                { returnDocument: 'after' }
            );
            
            if (updatedUser) {
                // Success
            } else {
                console.warn(`⚠️ Warning: No user found in DB with stripeSubscriptionId: ${subscription.id}`);
            }
        // Triggered when a subscription is fully dead (the billing period ended after a cancellation, or they failed to pay)
        } else if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
            await User.findOneAndUpdate(
                { stripeSubscriptionId: subscription.id },
                {
                    plan: 'free',
                    hasSentExpirationReminder: false,
                    currentPeriodEnd: null,
                    stripeSubscriptionId: null,
                    stripePriceId: null,
                    cancelAtPeriodEnd: false,
                    planType: null,
                    isPlanExpired: true,
                    hasSeenProWelcome: false
                }
            );
        // Triggered upon successful monthly/yearly recurring renewal charges
        } else if (event.type === 'invoice.paid') {
            const invoice = event.data.object;
            const stripeSubscriptionId = invoice.subscription;
            
            if (stripeSubscriptionId) {
                try {
                    const periodEndRaw = invoice.lines?.data?.[0]?.period?.end || invoice.period_end;
                    
                    if (periodEndRaw) {
                        const endDate = new Date(periodEndRaw * 1000);
                        
                        // Push out the expiration date and clear any pending payment issue flags
                        await User.findOneAndUpdate(
                            { stripeSubscriptionId: stripeSubscriptionId },
                            { 
                                currentPeriodEnd: endDate,
                                hasPaymentIssue: false,
                                hasSentExpirationReminder: false,
                                isPlanExpired: false
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
        // Triggered when a recurring charge fails (e.g., expired card, insufficient funds)
        } else if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object;
            const stripeSubscriptionId = invoice.subscription;
            
            if (stripeSubscriptionId) {
                console.warn(`⚠️ Invoice payment failed for subscription ${stripeSubscriptionId}`);
                
                // Flag the user so the frontend can display an urgent "Update Billing" banner
                await User.findOneAndUpdate(
                    { stripeSubscriptionId: stripeSubscriptionId },
                    { hasPaymentIssue: true }
                );
                console.log(`⚠️ Marked hasPaymentIssue=true for user with subscription ${stripeSubscriptionId}`);
            } else {
                console.warn(`⚠️ Invoice payment failed for non-subscription invoice ${invoice.id} (subscription undefined or null)`);
            }
        }

        return { received: true };
    }
}

export const stripeService = new StripeService();
