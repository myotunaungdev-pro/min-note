# MIN NOTE: Subscription Architecture

This document provides a comprehensive overview of how the system handles subscriptions for **Stripe Users** (automated recurring payments) versus **KPay Users** (manual one-time payments).

## Shared Functions (Similarities)

Regardless of the payment method, both Stripe and KPay users share several core functionalities:

1. **Database Schema**: Both use the same `User` model, heavily relying on the `plan: 'pro' | 'free'`, `planType: 'monthly' | 'yearly'`, `cancelAtPeriodEnd: boolean`, and `currentPeriodEnd: Date` fields to manage their active status.
2. **Access Control**: The backend middlewares and frontend protected routes strictly check `user.plan === 'pro'` for premium access. It does not differentiate based on the payment provider.
3. **Lazy Evaluation (Downgrade)**: On authentication (login/session check), the `authController.js` performs a lazy evaluation. If any user's `currentPeriodEnd` has passed, they are forcefully downgraded to `free`, `isPlanExpired: true`, and `hasSeenProWelcome: false` to keep the UI state clean regardless of background cron tasks.
4. **Expiration Banner & Welcome Modal**: Both sets of users rely entirely on the `isPlanExpired` boolean to show the warning banner, and `hasSeenProWelcome` to show the onboarding modal. Both flags are carefully synced during upgrades, downgrades, and cancellations.

---

## Distinct Functions (Differences)

Because Stripe handles recurring automation and KPay is manual, the workflows for each diverge significantly in the backend.

### 1. Subscription Activation and Renewal

> [!NOTE]
> How a user gets and maintains their 'Pro' status.

- **Stripe Users**: 
  - **Driven by Webhooks**. 
  - When a user pays, Stripe fires `checkout.session.completed` (initial) or `invoice.paid` (renewal) to our `stripeController.js`. 
  - The controller automatically extends the `currentPeriodEnd`, sets `plan: 'pro'`, and assigns the `stripeSubscriptionId` and `stripeCustomerId`.
- **KPay Users**: 
  - **Driven by Admin Dashboard**. 
  - The user uploads a receipt, creating a pending `ManualPayment` request. 
  - An Admin manually reviews this in the dashboard (`adminController.js`). Upon clicking "Approve", the backend manually calculates and sets `currentPeriodEnd` (+30 or +365 days) and activates `plan: 'pro'`. `stripeSubscriptionId` remains `null`.

### 2. Expiration and Auto-Downgrade Logic

> [!WARNING]
> How the system knows when to revoke 'Pro' access.

- **Stripe Users**: 
  - Handled by Stripe's lifecycle. We **do not** manually downgrade them when their period ends.
  - Instead, we wait for Stripe to officially cancel the subscription (either because the user canceled, or all retry attempts failed) via the `customer.subscription.deleted` webhook.
  - This webhook then resets `plan: 'free'`, `isPlanExpired: true`, and `hasSeenProWelcome: false`.
- **KPay Users**: 
  - Handled by our custom daily **Node-Cron Job** (`cronJobs.js`). 
  - The job explicitly searches for expired users where `stripeSubscriptionId: null` and `currentPeriodEnd < Date.now()`. 
  - It then executes a bulk update to downgrade them and reset their flags.

### 3. 3-Day Reminder Emails

> [!TIP]
> How we warn users that they are about to lose access.

- **Stripe Users**: 
  - If a Stripe user is auto-renewing (`cancelAtPeriodEnd: false`), our system **does not** email them. Stripe handles its own upcoming invoice emails.
  - However, if a Stripe user disabled auto-renew (`cancelAtPeriodEnd: true`), our cron job **will** pick them up 3 days before expiry and send our custom reminder, since their access is genuinely about to end.
- **KPay Users**: 
  - Because KPay users never auto-renew, our cron job **always** targets them exactly 3 days before their `currentPeriodEnd` and sends the reminder email.

### 4. Payment Failure Handling

- **Stripe Users**: 
  - Caught via the `invoice.payment_failed` webhook. Stripe will attempt Smart Retries depending on dashboard settings. 
  - If all retries fail, Stripe eventually fires `customer.subscription.deleted`, triggering the downgrade.
- **KPay Users**: 
  - If a user uploads an invalid or fake receipt, the admin clicks "Reject" in the dashboard. The subscription never activates, and the user remains on the `free` plan. No automated retries exist.

### 5. Immediate Manual Cancellations

> [!IMPORTANT]
> How users or admins explicitly force-cancel a subscription before the period naturally ends.

- **Stripe Users**: 
  - Users manage their subscription via the **Stripe Customer Portal**. 
  - In `Settings.js`, clicking "Manage Subscription" redirects them to Stripe's hosted page. If they cancel there, Stripe fires webhooks to update our database. 
  - We do not use our own database endpoints for their cancellations.
- **KPay Users**: 
  - Users manage their subscription via our custom **Manage Subscription Modal**.
  - Clicking "Cancel Immediately" hits our `paymentController.js` `cancelSubscription` endpoint.
  - This endpoint directly executes the database wipe: `plan: 'free'`, `currentPeriodEnd: null`, `isPlanExpired: true`, and `hasSeenProWelcome: false`.
