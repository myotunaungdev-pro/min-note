import { authService } from '../services/authService.js';

// GET /api/auth/me
// Fetches the profile data of the currently logged-in user using their JWT payload
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

// POST /api/auth/signup
// Initiates the registration process and sends an OTP to the provided email
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

// POST /api/auth/verify-otp
// Finalizes registration by verifying the emailed OTP and returning the initial JWT
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

// POST /api/auth/login
// Authenticates a returning user and issues a fresh JWT session token
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

// PUT /api/auth/profile
// Updates the user's demographic information, preferences, or profile picture
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

// POST /api/auth/forgot-password
// Triggers the password recovery flow by emailing a one-time reset code
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

// POST /api/auth/reset-password
// Consumes the reset OTP and assigns a new hashed password to the user's account
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

// POST /api/auth/mark-welcome-seen
// Updates the user's state so the Pro onboarding modal isn't shown on subsequent logins
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
