import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/user.js';
import Note from '../models/notes.js';
import ManualPayment from '../models/manualPayment.js';
import { generateOTP } from '../utils/generateOTP.js';
import { sendEmail } from '../utils/sendEmail.js';

class AuthService {
    // Retrieves the current authenticated user's profile and actively checks their subscription status
    async getMe(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        
        let planModified = false;
        
        // Check if the user is on a Pro plan but their paid period has expired in the past
        if (user.plan === 'pro' && user.currentPeriodEnd && new Date(user.currentPeriodEnd) < new Date()) {
            user.plan = 'free';
            user.planType = undefined;
            user.currentPeriodEnd = undefined;
            user.cancelAtPeriodEnd = false;
            user.hasSeenProWelcome = false;
            user.isPlanExpired = true;
            planModified = true;
        }

        if (planModified) {
            await user.save();
        }

        const plan = user.plan || 'free';
        const planType = user.planType || null;
        const cancelAtPeriodEnd = user.cancelAtPeriodEnd || false;

        const pendingPayment = await ManualPayment.findOne({ userId, status: 'pending' });
        const hasPendingPayment = !!pendingPayment;

        return { 
            user: { ...user.toObject(), plan, planType, cancelAtPeriodEnd, hasPendingPayment } 
        };
    }

    // Handles new user registration, hashes passwords, and sends the initial OTP email
    async signup(name, email, password) {
        const sanitizedEmail = email.toLowerCase().trim();

        let user = await User.findOne({ email: sanitizedEmail });
        
        // Cryptographically hash the raw password before it ever touches the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a 6-digit OTP and hash it as well so it cannot be read if the DB is compromised
        const otp = generateOTP();
        const otpSalt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, otpSalt);

        if (user) {
            if (user.isVerified) {
                const error = new Error("User already exists with this email");
                error.statusCode = 400;
                throw error;
            }
            user.name = name;
            user.password = hashedPassword;
            user.otp = hashedOtp;
            user.otpExpires = Date.now() + 10 * 60 * 1000;
        } else {
            user = new User({
                name,
                email: sanitizedEmail,
                password: hashedPassword,
                otp: hashedOtp,
                otpExpires: Date.now() + 10 * 60 * 1000
            });
        }

        const savedUser = await user.save();

        const message = `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
                <h2 style="color: #00d4aa;">Verify Your Email Address</h2>
                <p>Hello ${name},</p>
                <p>Thank you for signing up for MIN NOTE. Please use the following 6-digit code to verify your email address and activate your account:</p>
                <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="margin: 0; letter-spacing: 5px; color: #1f2937;">${otp}</h1>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <p>Best regards,<br>The MIN NOTE Team</p>
            </div>
        `;

        await sendEmail({
            email: savedUser.email,
            subject: 'MIN NOTE - Email Verification OTP',
            message
        });

        return {
            message: "User created successfully. Please check your email for the verification code.",
            email: savedUser.email
        };
    }

    // Validates the OTP submitted by the user during signup or after requesting a new code
    async verifyOTP(email, otp) {
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        if (user.isVerified) {
            const error = new Error("User is already verified");
            error.statusCode = 400;
            throw error;
        }

        if (!user.otpExpires || user.otpExpires < Date.now()) {
            const error = new Error("OTP has expired. Please request a new one.");
            error.statusCode = 400;
            throw error;
        }

        // Securely compare the provided plaintext OTP against the hashed version in the database
        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) {
            const error = new Error("Invalid OTP");
            error.statusCode = 400;
            throw error;
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Automatically generate a welcome board of notes for a newly verified user
        await this.createSampleNotes(user._id);

        // Generate the primary authentication JWT valid for 7 days
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            message: "Email verified successfully",
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                birthdate: user.birthdate, 
                avatarUrl: user.avatarUrl, 
                defaultNoteTheme: user.defaultNoteTheme,
                plan: user.plan || 'free',
                planType: user.planType || null,
                cancelAtPeriodEnd: user.cancelAtPeriodEnd || false
            }
        };
    }

    // Populates a new user's account with educational and localized placeholder notes
    async createSampleNotes(userId) {
        try {
            const sampleNotes = [
                {
                    userId,
                    title: "Welcome to MIN NOTE! 🚀",
                    content: "<h1>Welcome Aboard!</h1><p>We are thrilled to have you here.</p><p>Check out our <a href='#'>Getting Started Guide</a> to learn more about the <strong>rich text features</strong> and customization options.</p>",
                    titleFontFamily: "",
                    tag: "Work",
                    tagColor: "#3B82F6",
                    isDone: false,
                    theme: "default",
                    isArchived: false,
                    isDeleted: false
                },
                {
                    userId,
                    title: "နေ့စဉ်လုပ်ဆောင်ရန်များ (Daily Tasks)",
                    content: "<h3>လုပ်ဆောင်ရမည့်အရာများ:</h3><ol><li>မနက်စာစားရန်</li><li>အလုပ်သွားရန်</li><li>လေ့ကျင့်ခန်းလုပ်ရန်</li></ol><ul><li>အစည်းအဝေးတက်ရန်</li><li>အီးမေးလ်စစ်ရန်</li></ul>",
                    titleFontFamily: "",
                    tag: "Personal",
                    tagColor: "#C084FC",
                    isDone: false,
                    theme: "default",
                    isArchived: false,
                    isDeleted: false
                },
                {
                    userId,
                    title: "Weekend Grocery List 🛒",
                    content: "<h3>Supermarket Run</h3><ul><li>Milk & Eggs 🥚</li><li>Fresh vegetables (Spinach, Tomatoes) 🍅</li><li>Chicken breasts 🍗</li><li>Coffee beans ☕</li></ul><p><em>Don't forget to grab some snacks for the movie night! 🍿</em></p>",
                    titleFontFamily: "",
                    tag: "Shopping",
                    tagColor: "#F43F8E",
                    isDone: false,
                    theme: "default",
                    isArchived: false,
                    isDeleted: false
                },
                {
                    userId,
                    title: "ဖျက်လိုက်သော မှတ်စုဟောင်း",
                    content: "<p>ဤမှတ်စုသည် အမှိုက်ပုံးထဲတွင် ရှိနေပါသည်။</p><p>ဖျက်လိုက်သော မှတ်စုများကို ဤနေရာတွင် ယာယီသိမ်းဆည်းထားမည်ဖြစ်သည်။ (Trashed items will stay here temporarily.)</p>",
                    titleFontFamily: "",
                    tag: "Health",
                    tagColor: "#FF6B6B",
                    isDone: false,
                    theme: "default",
                    isArchived: false,
                    isDeleted: true
                },
                {
                    userId,
                    title: "ไอเดียโปรเจกต์ (Project Ideas) 💡",
                    content: "<blockquote><p>\"ความคิดสร้างสรรค์เริ่มต้นที่นี่\"</p></blockquote><p><em>หัวข้อโปรเจกต์ใหม่:</em></p><p><span style=\"font-family: monospace;\">1. แอปพลิเคชันจดบันทึก</span></p><p><u>ต้องมี:</u> ระบบหลายภาษา</p>",
                    titleFontFamily: "",
                    tag: "Ideas",
                    tagColor: "#FFB020",
                    isDone: false,
                    theme: "default",
                    isArchived: false,
                    isDeleted: false
                },
                {
                    userId,
                    title: "Archived: Trip to Bangkok",
                    content: "<p>This is an archived note.</p><p>แผนการเดินทางไปกรุงเทพฯ (Bangkok Trip Plan):</p><ul><li>จองตั๋วเครื่องบิน (Book flights)</li><li>จองโรงแรม (Book hotel)</li></ul>",
                    titleFontFamily: "",
                    tag: "Finance",
                    tagColor: "#22C55E",
                    isDone: false,
                    theme: "default",
                    isArchived: true,
                    isDeleted: false
                },
                {
                    userId,
                    title: "🧟‍♂️ Zombie - The Cranberries 🎸",
                    content: "🎶\nAnother head hangs lowly\nChild is slowly taken\nAnd the violence caused such silence\nWho are we mistaken?\n\nBut you see, it's not me\nIt's not my family\nIn your head, in your head, they are fighting\nWith their tanks, and their bombs\nAnd their bombs, and their guns\nIn your head, in your head they are crying\n\nIn your head, in your head\nZombie, zombie, zombie-ie-ie 🎵",
                    titleFontFamily: "",
                    tag: "Lyrics",
                    tagColor: "#6366F1",
                    isDone: false,
                    theme: "default",
                    isArchived: false,
                    isDeleted: false
                },
                {
                    userId,
                    title: "🍲 အရသာရှိတဲ့ ကြက်သားစွပ်ပြုတ် ချက်ပြုတ်နည်း 🍲",
                    content: "<p>ပါဝင်ပစ္စည်းများ 🛒</p><ul><li>ကြက်ပေါင် (သို့) ကြက်သား</li><li>ကြက်သွန်ဖြူ 🧄</li><li>စပါးလင် 🌿</li><li>မုန်လာဥနီ 🥕</li><li>မုန်ညင်းရွက် 🥬</li><li>ဆား 🧂</li><li>ကြက်သားမှုန့် 🥄</li></ul><p>ချက်ပြုတ်ရန် အဆင့်ဆင့် 👩‍🍳</p><ol><li>ရေနွေးတည်ခြင်း: ပထမဦးစွာ ရေတစ်အိုးကို ပွက်ပွက်ဆူလာသည်အထိ တည်ပါ။ ♨️</li><li>ကြက်သားထည့်ခြင်း: ရေဆူလာပါက ကြက်ပေါင် (သို့) ကြက်သားများထည့်ပြီး ၅ မိနစ်ခန့် ပြုတ်ပေးပါ။ 🍗</li><li>အမွှေးအကြိုင်ထည့်ခြင်း: ထို့နောက် ကြက်သွန်ဖြူနှင့် စပါးလင်ကို ထည့်ပြီး (၂၅) မိနစ်ခန့် ဆက်ပြုတ်ပေးပါ။ 🧄 🌿</li><li>ဟင်းသီးဟင်းရွက်ထည့်ခြင်း: ဟင်းအိုး ပွက်ပွက်ဆူနေချိန်တွင် မုန်လာဥနီ 🥕 ကို ထပ်ရောထည့်ပြီး ပြုတ်ပါ။</li><li>အရသာသွင်းခြင်း: ကြက်သားလေး နူးအိလာပြီဆိုလျှင် အရသာအတွက် ကြက်သားမှုန့် (၁) ဇွန်းနှင့် ဆား (၁) ဇွန်းစီ ထည့်ပါ။ 🧂 🥄</li><li>အသီးအရွက်ထည့်ခြင်း: စတင်ပြုတ်ချိန်မှစ၍ (၂၅) မိနစ်ခန့် ကြာသွားသောအခါ နောက်ဆုံးအနေဖြင့် မုန်ညင်းရွက်ကို ထပ်ထည့်ပြီး ခဏလောက် ဆက်ပြုတ်ပေးပါ။ 🥬</li></ol><p>✨ အခုဆိုရင်တော့ အာဟာရပြည့်ဝပြီး အရသာရှိတဲ့ ကြက်သားစွပ်ပြုတ် ပူပူလေးတစ်ခွက် ရရှိပါပြီ။ 🍲 💛</p>",
                    titleFontFamily: "",
                    tag: "Cooking",
                    tagColor: "#D97A4D",
                    isDone: false,
                    theme: "default",
                    isArchived: true,
                    isDeleted: false
                }
            ];
            await Note.insertMany(sampleNotes);
        } catch (noteErr) {
            console.error("Failed to insert sample notes:", noteErr);
        }
    }

    // Authenticates an existing user and returns a fresh JWT
    async login(email, password) {
        const sanitizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: sanitizedEmail });
        if (!user) {
            const error = new Error("Invalid email or password");
            error.statusCode = 400;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error("Invalid email or password");
            error.statusCode = 400;
            throw error;
        }

        if (!user.isVerified) {
            const error = new Error("Please verify your email address to login.");
            error.statusCode = 403;
            throw error;
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            message: "Login successful",
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                birthdate: user.birthdate, 
                avatarUrl: user.avatarUrl, 
                defaultNoteTheme: user.defaultNoteTheme,
                plan: user.plan || 'free',
                planType: user.planType || null,
                cancelAtPeriodEnd: user.cancelAtPeriodEnd || false
            }
        };
    }

    // Handles updating user demographic data, preferences, and profile avatars
    async updateProfile(userId, updateData) {
        const { name, email, birthdate, avatarUrl, defaultNoteTheme, showTagCounts } = updateData;
        
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                const error = new Error("Email is already taken");
                error.statusCode = 400;
                throw error;
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (birthdate) user.birthdate = birthdate;
        if (defaultNoteTheme) user.defaultNoteTheme = defaultNoteTheme;
        if (showTagCounts !== undefined) user.showTagCounts = showTagCounts;
        
        if (avatarUrl !== undefined && avatarUrl !== user.avatarUrl) {
            if (user.avatarUrl) {
                // Asynchronously delete the old image from Cloudinary to save storage space
                this.cleanupOldAvatar(user.avatarUrl).catch(err => {
                    console.error("Cloudinary cleanup failed:", err);
                });
            }
            user.avatarUrl = avatarUrl;
        }

        const updatedUser = await user.save();

        return {
            message: "Profile updated successfully",
            user: { 
                id: updatedUser._id, 
                name: updatedUser.name, 
                email: updatedUser.email,
                birthdate: updatedUser.birthdate,
                avatarUrl: updatedUser.avatarUrl,
                defaultNoteTheme: updatedUser.defaultNoteTheme,
                showTagCounts: updatedUser.showTagCounts
            }
        };
    }

    // Utility to parse a Cloudinary URL and issue a deletion request for the underlying asset
    async cleanupOldAvatar(avatarUrl) {
        try {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });

            const parts = avatarUrl.split('/upload/');
            if (parts.length > 1) {
                const pathWithVersion = parts[1];
                const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, '');
                const lastDotIndex = pathWithoutVersion.lastIndexOf('.');
                const publicId = lastDotIndex !== -1 ? pathWithoutVersion.substring(0, lastDotIndex) : pathWithoutVersion;
                
                if (publicId && process.env.CLOUDINARY_API_KEY) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }
        } catch (err) {
            throw err;
        }
    }

    // Initiates the password recovery flow by generating and emailing a secure OTP
    async forgotPassword(email) {
        const user = await User.findOne({ email });

        if (!user) {
            const error = new Error("No account found with that email address.");
            error.statusCode = 404;
            throw error;
        }

        const otp = generateOTP();
        const otpSalt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, otpSalt);

        user.otp = hashedOtp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        const message = `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
                <h2 style="color: #00d4aa;">Password Reset Request</h2>
                <p>Hello ${user.name},</p>
                <p>You requested a password reset for your MIN NOTE account. Please use the following 6-digit code to securely reset your password:</p>
                <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="margin: 0; letter-spacing: 5px; color: #1f2937;">${otp}</h1>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <p>Best regards,<br>The MIN NOTE Team</p>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: 'MIN NOTE - Password Reset OTP',
            message
        });

        return { message: "Password reset OTP sent to your email." };
    }

    // Completes the password recovery flow by verifying the OTP and saving the new hashed password
    async resetPassword(email, otp, newPassword) {
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("User not found.");
            error.statusCode = 404;
            throw error;
        }

        if (!user.otpExpires || user.otpExpires < Date.now()) {
            const error = new Error("OTP has expired. Please request a new one.");
            error.statusCode = 400;
            throw error;
        }

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) {
            const error = new Error("Invalid OTP.");
            error.statusCode = 400;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return { message: "Password reset successfully. You can now log in." };
    }

    // Acknowledges that the user has seen the Pro welcome modal to prevent it from showing again
    async markWelcomeSeen(userId) {
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        user.hasSeenProWelcome = true;
        await user.save();
        return { success: true, message: "Welcome marked as seen" };
    }
}

export const authService = new AuthService();
