import jwt from 'jsonwebtoken';
import User from '../model/user.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development');

            // Attach user id to request
            req.user = { id: decoded.id, email: decoded.email };

            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

export const admin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Not authorized as an admin' });
        }
        
        const user = await User.findById(req.user.id);
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

export const requirePro = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.plan === 'pro') {
            if (user.currentPeriodEnd && new Date(user.currentPeriodEnd) < new Date()) {
                user.plan = 'free';
                await user.save();
                return res.status(403).json({ message: 'Your Pro plan has expired. Please upgrade to continue using this feature.' });
            }
            return next();
        }

        return res.status(403).json({ message: 'This feature requires a Pro subscription.' });
    } catch (error) {
        console.error('requirePro middleware error:', error.message);
        res.status(500).json({ message: 'Server Error verifying Pro status' });
    }
};
