import mongoose from 'mongoose';

// Schema defining the core user profile, authentication, and subscription state
const userSchema = new mongoose.Schema({
    // User's full display name
    name: {
        type: String,
        required: true,
        trim: true
    },
    
    // Primary contact and login identifier, must be strictly unique
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    
    // Bcrypt-hashed password string (never stored in plain text)
    password: {
        type: String,
        required: true
    },
    
    // Optional demographic data
    birthdate: {
        type: Date
    },
    
    // URL pointing to the user's uploaded profile picture on Cloudinary
    avatarUrl: {
        type: String
    },
    
    // Flag indicating if the user has completed email verification during signup
    isVerified: {
        type: Boolean,
        default: false
    },
    
    // Temporary One-Time Password for email verification or password resets
    otp: {
        type: String
    },
    
    // Timestamp dictating when the current OTP becomes invalid
    otpExpires: {
        type: Date
    },
    
    // The user's globally preferred note card aesthetic
    defaultNoteTheme: {
        type: String,
        default: 'default'
    },
    
    // Base tier indicator determining access to premium features
    plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },
    
    // Defines the billing cycle (e.g., 'monthly', 'yearly') for Pro users
    planType: {
        type: String,
        default: null
    },
    
    // Indicates if a Stripe user has requested cancellation but retains access until the period ends
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    },
    
    // Stripe's unique identifier for this customer, used for all billing operations
    stripeCustomerId: {
        type: String,
        default: null
    },
    
    // Stripe's unique identifier for the active recurring subscription
    stripeSubscriptionId: {
        type: String,
        default: null
    },
    
    // The specific Stripe Price ID associated with their chosen billing cycle
    stripePriceId: {
        type: String,
        default: null
    },
    
    // The exact date and time when the current billing period expires
    currentPeriodEnd: {
        type: Date,
        default: null
    },
    
    // High-level authorization flag granting access to the admin dashboard
    isAdmin: {
        type: Boolean,
        default: false
    },
    
    // UI state flag to ensure the Pro welcome modal is only shown once upon upgrading
    hasSeenProWelcome: {
        type: Boolean,
        default: true
    },
    
    // UI preference toggling the display of note counts next to tags in the sidebar
    showTagCounts: {
        type: Boolean,
        default: false
    },
    
    // Flag set via Stripe webhooks if a recurring payment fails
    hasPaymentIssue: {
        type: Boolean,
        default: false
    },
    
    // Prevents spamming the user with multiple expiration reminders from the cron job
    hasSentExpirationReminder: {
        type: Boolean,
        default: false
    },
    
    // Final state flag indicating the grace period has ended and the plan is fully expired
    isPlanExpired: {
        type: Boolean,
        default: false
    }
}, {
    // Automatically creates 'createdAt' and 'updatedAt' fields for the document
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
