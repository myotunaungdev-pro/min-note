import { authService } from '../services/authService.js';

export const getMe = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const result = await authService.getMe(userId);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const status = error.statusCode || 500;
        res.status(status).json({ message: error.message || 'Server error' });
    }
};

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await authService.signup(name, email, password);
        res.status(201).json(result);
    } catch (error) {
        const status = error.statusCode || 500;
        res.status(status).json({ message: error.message || "Signup failed", error: error.message });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyOTP(email, otp);
        res.status(200).json(result);
    } catch (error) {
        const status = error.statusCode || 500;
        res.status(status).json({ message: error.message || "Verification failed", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json(result);
    } catch (error) {
        const status = error.statusCode || 500;
        res.status(status).json({ message: error.message || "Login failed", error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await authService.updateProfile(userId, req.body);
        res.status(200).json(result);
    } catch (error) {
        const status = error.statusCode || 500;
        res.status(status).json({ message: error.message || "Failed to update profile", error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        res.status(200).json(result);
    } catch (error) {
        const status = error.statusCode || 500;
        res.status(status).json({ message: error.message || "Failed to process forgot password request", error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const result = await authService.resetPassword(email, otp, newPassword);
        res.status(200).json(result);
    } catch (error) {
        const status = error.statusCode || 500;
        res.status(status).json({ message: error.message || "Failed to reset password", error: error.message });
    }
};

export const markWelcomeSeen = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await authService.markWelcomeSeen(userId);
        res.status(200).json(result);
    } catch (error) {
        console.error("markWelcomeSeen error:", error);
        const status = error.statusCode || 500;
        res.status(status).json({ message: error.message || "Server error", error: error.message });
    }
};
