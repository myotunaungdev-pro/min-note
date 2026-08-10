import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosConfig';

const getAuthErrorKey = (msg, defaultKey) => {
    const map = {
        "User already exists with this email": "auth.errors.user_exists",
        "User not found": "auth.errors.user_not_found",
        "User not found.": "auth.errors.user_not_found",
        "No account found with that email address.": "auth.errors.user_not_found",
        "User is already verified": "auth.errors.user_already_verified",
        "OTP has expired. Please request a new one.": "auth.errors.otp_expired",
        "Invalid OTP": "auth.errors.invalid_otp",
        "Invalid OTP.": "auth.errors.invalid_otp",
        "Invalid email or password": "auth.errors.invalid_credentials",
        "Please verify your email address to login.": "auth.errors.please_verify_email",
        "Email is already taken": "auth.errors.email_taken",
        "Failed to process forgot password request": "auth.errors.forgot_password_failed",
    };
    return map[msg] || msg || defaultKey;
};

// Async thunk for Signup
export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/auth/signup', userData);
            // We do NOT save token here anymore, we wait for OTP verification
            return response.data;
        } catch (error) {
            return rejectWithValue(getAuthErrorKey(error.response?.data?.message, 'signup_failed'));
        }
    }
);

// Async thunk for OTP Verification
export const verifyOTP = createAsyncThunk(
    'auth/verifyOTP',
    async (verificationData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/auth/verify-otp', verificationData);
            // Save token and user to local storage after successful verification
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            return rejectWithValue(getAuthErrorKey(error.response?.data?.message, 'Verification failed'));
        }
    }
);

// Async thunk for Forgot Password
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (emailData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/auth/forgot-password', emailData);
            return response.data;
        } catch (error) {
            return rejectWithValue(getAuthErrorKey(error.response?.data?.message, 'Failed to send OTP'));
        }
    }
);

// Async thunk for Reset Password
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (resetData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/auth/reset-password', resetData);
            return response.data;
        } catch (error) {
            return rejectWithValue(getAuthErrorKey(error.response?.data?.message, 'Failed to reset password'));
        }
    }
);

// Async thunk for Login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/auth/login', userData);
            // Save token and user to local storage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            return rejectWithValue(getAuthErrorKey(error.response?.data?.message, 'login_failed'));
        }
    }
);

// Async thunk for Updating Profile
export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put('/auth/profile', userData);
            // Update user in local storage
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            return rejectWithValue(getAuthErrorKey(error.response?.data?.message, 'Profile update failed'));
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(getAuthErrorKey(error.response?.data?.message, 'Fetch profile failed'));
        }
    }
);

export const markWelcomeSeen = createAsyncThunk(
    'auth/markWelcomeSeen',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch('/auth/welcome-seen');
            return response.data;
        } catch (error) {
            return rejectWithValue(getAuthErrorKey(error.response?.data?.message, 'Mark welcome seen failed'));
        }
    }
);

const loadUserFromStorage = () => {
    try {
        const serializedUser = localStorage.getItem('user');
        if (!serializedUser || serializedUser === 'undefined') {
            return null;
        }
        return JSON.parse(serializedUser);
    } catch (e) {
        console.error("Could not parse user from localStorage", e);
        return null;
    }
};

const initialState = {
    user: loadUserFromStorage(),
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            state.user = null;
            state.token = null;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Signup
            .addCase(signupUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.isLoading = false;
                // We don't set user and token here anymore
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Verify OTP
            .addCase(verifyOTP.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update Profile
            .addCase(updateUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Current User
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload.user;
                localStorage.setItem('user', JSON.stringify(action.payload.user));
                
                if (action.payload.user.plan) {
                    localStorage.setItem('user_plan', action.payload.user.plan);
                    if (action.payload.user.planType) {
                        localStorage.setItem('user_planType', action.payload.user.planType);
                    } else {
                        localStorage.removeItem('user_planType');
                    }
                    // Dispatch a custom event to notify SubscriptionContext if needed
                    window.dispatchEvent(new Event('storage'));
                }
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                console.error("Fetch user failed:", action.error);
            })
            // Mark Welcome Seen
            .addCase(markWelcomeSeen.fulfilled, (state) => {
                if (state.user) {
                    state.user.hasSeenProWelcome = true;
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
            })
            // Forgot Password
            .addCase(forgotPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
