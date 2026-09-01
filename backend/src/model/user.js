import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date
    },
    avatarUrl: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    defaultNoteTheme: {
        type: String,
        default: 'default'
    },
    plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },
    planType: {
        type: String,
        default: null
    },
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    },
    stripeCustomerId: {
        type: String,
        default: null
    },
    stripeSubscriptionId: {
        type: String,
        default: null
    },
    stripePriceId: {
        type: String,
        default: null
    },
    currentPeriodEnd: {
        type: Date,
        default: null
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    hasSeenProWelcome: {
        type: Boolean,
        default: true
    },
    showTagCounts: {
        type: Boolean,
        default: false
    },
    hasPaymentIssue: {
        type: Boolean,
        default: false
    },
    hasSentExpirationReminder: {
        type: Boolean,
        default: false
    },
    isPlanExpired: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
