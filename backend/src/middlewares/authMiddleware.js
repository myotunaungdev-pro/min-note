import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Verifies the incoming JWT to protect private routes
export const protect = async (req, res, next) => {
    let token;

    // Check if the request contains the standard Bearer token in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the raw token string by splitting off the 'Bearer ' prefix
            token = req.headers.authorization.split(' ')[1];

            // Cryptographically verify the token against the server's secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the decoded user payload to the request object for downstream controllers to consume
            req.user = { id: decoded.id, email: decoded.email };

            // Pass execution to the next middleware or the actual route controller
            next();
        } catch (error) {
            // Catch expired, malformed, or tampered tokens
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        // Reject the request immediately if no Bearer token was provided at all
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Enforces admin-only access for sensitive routes (e.g., verifying manual payments)
export const admin = async (req, res, next) => {
    try {
        // Ensure the basic protect middleware has already run and attached the user ID
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Not authorized as an admin' });
        }
        
        // Fetch the latest user document from the database to check their current role
        const user = await User.findById(req.user.id);
        
        // Allow access only if the user exists and holds the isAdmin flag
        if (user && user.isAdmin) {
            next();
        } else {
            res.status(403).json({ message: 'Not authorized as an admin' });
        }
    } catch (error) {
        console.error('Admin middleware error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Enforces premium tier access for Pro-exclusive features (e.g., specific themes or fonts)
export const requirePro = async (req, res, next) => {
    try {
        // Fetch the user to check their active plan status
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Reject immediately if their baseline plan is not 'pro'
        if (user.plan !== 'pro') {
            return res.status(403).json({ message: 'Premium subscription required' });
        }

        // Double-check expiration dates to catch edge cases where the cron job hasn't run yet
        if (user.currentPeriodEnd && new Date(user.currentPeriodEnd) < new Date()) {
            // Actively downgrade the user on-the-fly to prevent free premium usage
            user.plan = 'free';
            await user.save();
            return res.status(403).json({ message: 'Premium subscription required. Your Pro plan has expired.' });
        }

        // User is confirmed as an active Pro subscriber, allow access
        next();
    } catch (error) {
        console.error('requirePro middleware error:', error.message);
        res.status(500).json({ message: 'Server Error verifying Pro status' });
    }
};
