import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/* -------------------------------------------------- */
/* 🔌 1. DB Connection (Fixed for Race Conditions)    */
/* -------------------------------------------------- */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = { bufferCommands: false, maxPoolSize: 10 };
        cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}

/* -------------------------------------------------- */
/* 🧠 2. Mongoose Models                              */
/* -------------------------------------------------- */

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    name: { type: String, required: true, trim: true },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    oauthProvider: { type: String, enum: ['google', 'github', null], default: null },
    oauthId: { type: String, default: null },
    preferences: {
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
        aiProvider: { type: String, enum: ['ollama', 'openai', 'anthropic', 'google', 'groq', null], default: null },
        aiApiKey: { type: String, default: null },
        aiModel: { type: String, default: null },
        notifications: {
            reviewReminders: { type: Boolean, default: true },
            streakReminders: { type: Boolean, default: true }
        }
    },
    stats: {
        totalQuestions: { type: Number, default: 0 },
        streakDays: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastActiveDate: { type: Date, default: null }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: null }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.passwordHash;
            delete ret.oauthId;
            delete ret.preferences?.aiApiKey;
            return ret;
        }
    }
});

// User Methods
userSchema.methods.comparePassword = async function (password) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = async function (password) {
    return bcrypt.hash(password, 12);
};

// PendingUser Schema (for email verification)
const pendingUserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    verificationToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // 10 min TTL
});

// SystemConfig Schema (for SMTP settings)
const systemConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now }
});

// Get or create models
const getUserModel = () =>
    mongoose.models.User || mongoose.model('User', userSchema);

const getPendingUserModel = () =>
    mongoose.models.PendingUser || mongoose.model('PendingUser', pendingUserSchema);

const getSystemConfigModel = () =>
    mongoose.models.SystemConfig || mongoose.model('SystemConfig', systemConfigSchema);

/* -------------------------------------------------- */
/* 🔐 3. JWT Utilities                               */
/* -------------------------------------------------- */
const generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { userId: user._id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        { expiresIn: '30d' }
    );
};

const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};

/* -------------------------------------------------- */
/* 📧 4. Email Service                               */
/* -------------------------------------------------- */
async function sendEmail(to, subject, html) {
    console.log(`📧 Email to ${to}: ${subject}`);

    if (process.env.RESEND_API_KEY) {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: process.env.EMAIL_FROM || 'NullPtr <noreply@nullptr.com>',
                    to,
                    subject,
                    html
                })
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }
    }

    console.log('Email content:', html.substring(0, 200) + '...');
    return { success: true, messageId: 'dev-mode-' + Date.now() };
}

const sendOTP = async (email, otp) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #4f46e5; text-align: center;">Verify Your Email</h2>
            <p style="color: #333; font-size: 16px;">Hello,</p>
            <p style="color: #555; font-size: 16px;">Use the following code to complete your registration:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
            </div>
            <p style="color: #555; font-size: 14px;">This code will expire in 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
    `;
    return sendEmail(email, 'Your Verification Code', html);
};

const sendPasswordReset = async (email, resetUrl) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #d946ef; text-align: center;">Reset Your Password</h2>
            <p style="color: #333; font-size: 16px;">Hello,</p>
            <p style="color: #555; font-size: 16px;">You requested a password reset. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 25px 0;">
                <a href="${resetUrl}" style="background-color: #d946ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #555; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #555; font-size: 14px;">Or copy this link: <br> <a href="${resetUrl}">${resetUrl}</a></p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
    `;
    return sendEmail(email, 'Reset Your Password', html);
};

/* -------------------------------------------------- */
/* 🔑 5. Google OAuth                                */
/* -------------------------------------------------- */
async function verifyGoogleToken(credential) {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!response.ok) {
        throw new Error('Invalid Google token');
    }
    return response.json();
}

/* -------------------------------------------------- */
/* 🛡️ 6. Auth Middleware                             */
/* -------------------------------------------------- */
const authenticate = (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authenticated: false, error: 'Authentication required' };
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');

    if (!decoded) {
        return { authenticated: false, error: 'Invalid or expired token' };
    }

    return { authenticated: true, user: decoded };
};

/* -------------------------------------------------- */
/* 🚀 7. Main Handler                                */
/* -------------------------------------------------- */
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(204).end();

    try {
        console.log("Auth handler received request:", req.method, req.url);
        console.log("Request body:", req.body);

        await connectDB();

        const parts = req.url.split("?")[0].split("/").filter(Boolean);
        const authIndex = parts.indexOf("auth");
        const actionIndex = authIndex !== -1 ? authIndex + 1 : 0;
        const action = parts[actionIndex] || '';

        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                body = {};
            }
        }
        if (!body) body = {};

        const User = getUserModel();
        const PendingUser = getPendingUserModel();

        // ==================== PUBLIC ROUTES ====================

        if (action === 'register' && req.method === 'POST') {
            const { email, password, name } = body;

            if (!email || !password || !name) {
                return res.status(400).json({ success: false, error: 'Email, password, and name are required' });
            }

            if (password.length < 8) {
                return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
            }

            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(409).json({ success: false, error: 'Email already registered' });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const passwordHash = await User.hashPassword(password);

            let pendingUser = await PendingUser.findOne({ email: email.toLowerCase() });
            if (pendingUser) {
                pendingUser.passwordHash = passwordHash;
                pendingUser.name = name.trim();
                pendingUser.verificationToken = otp;
                pendingUser.createdAt = Date.now();
                await pendingUser.save();
            } else {
                pendingUser = await PendingUser.create({
                    email: email.toLowerCase(),
                    passwordHash,
                    name: name.trim(),
                    verificationToken: otp
                });
            }

            await sendOTP(email, otp);

            return res.status(200).json({
                success: true,
                message: 'Verification code sent. Please check your email.',
                requireVerification: true,
                email
            });
        }

        if (action === 'verify-email' && req.method === 'POST') {
            const { email, otp } = body;

            const pendingUser = await PendingUser.findOne({
                email: email.toLowerCase(),
                verificationToken: otp
            });

            if (!pendingUser) {
                return res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
            }

            const user = await User.create({
                email: pendingUser.email,
                passwordHash: pendingUser.passwordHash,
                name: pendingUser.name,
                emailVerified: true,
                lastLogin: new Date(),
                stats: { streakDays: 1, lastActiveDate: new Date() }
            });

            await PendingUser.deleteOne({ _id: pendingUser._id });

            const token = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            return res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        avatar: user.avatar,
                        preferences: user.preferences,
                        stats: user.stats
                    },
                    token,
                    refreshToken
                }
            });
        }

        if (action === 'login' && req.method === 'POST') {
            const { email, password } = body;

            if (!email || !password) {
                return res.status(400).json({ success: false, error: 'Email and password are required' });
            }

            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(401).json({ success: false, error: 'Invalid email or password' });
            }

            if (!user.passwordHash) {
                return res.status(401).json({ success: false, error: 'Please login with your social account' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ success: false, error: 'Invalid email or password' });
            }

            if (!user.isActive) {
                return res.status(403).json({ success: false, error: 'Account has been deactivated' });
            }

            const token = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            user.lastLogin = new Date();
            await user.save();

            return res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        avatar: user.avatar,
                        preferences: user.preferences,
                        stats: user.stats
                    },
                    token,
                    refreshToken
                }
            });
        }

        if (action === 'google-login' && req.method === 'POST') {
            const { credential } = body;

            if (!credential) {
                return res.status(400).json({ success: false, error: 'Credential is required' });
            }

            try {
                const payload = await verifyGoogleToken(credential);
                const { email, name, picture, sub: googleId } = payload;

                if (!email) {
                    return res.status(400).json({ success: false, error: 'Email not found in Google token' });
                }

                let user = await User.findOne({ email: email.toLowerCase() });

                if (user) {
                    if (!user.oauthProvider) {
                        user.oauthProvider = 'google';
                        user.oauthId = googleId;
                        if (!user.avatar) user.avatar = picture;
                        if (!user.emailVerified) user.emailVerified = true;
                    }
                    user.lastLogin = new Date();
                    await user.save();
                } else {
                    user = await User.create({
                        email: email.toLowerCase(),
                        name: name || 'User',
                        avatar: picture,
                        oauthProvider: 'google',
                        oauthId: googleId,
                        emailVerified: true,
                        role: 'student',
                        lastLogin: new Date(),
                        stats: { streakDays: 1, lastActiveDate: new Date() }
                    });
                }

                const token = generateToken(user);
                const refreshToken = generateRefreshToken(user);

                return res.json({
                    success: true,
                    data: {
                        user: {
                            id: user._id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            avatar: user.avatar,
                            preferences: user.preferences,
                            stats: user.stats
                        },
                        token,
                        refreshToken
                    }
                });
            } catch (error) {
                console.error('Google login error:', error);
                return res.status(401).json({ success: false, error: 'Google authentication failed: ' + error.message });
            }
        }

        if (action === 'forgot-password' && req.method === 'POST') {
            const { email } = body;
            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetExpires;
            await user.save();

            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
            await sendPasswordReset(email, resetUrl);

            return res.json({ success: true, message: 'Password reset link sent to email' });
        }

        if (action === 'reset-password' && req.method === 'POST') {
            const { email, token, newPassword } = body;

            const user = await User.findOne({
                email: email.toLowerCase(),
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ success: false, error: 'Invalid or expired token' });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
            }

            user.passwordHash = await User.hashPassword(newPassword);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return res.json({ success: true, message: 'Password changed successfully' });
        }

        if (action === 'refresh' && req.method === 'POST') {
            const { refreshToken } = body;

            if (!refreshToken) {
                return res.status(400).json({ success: false, error: 'Refresh token is required' });
            }

            const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');

            if (!decoded || decoded.type !== 'refresh') {
                return res.status(401).json({ success: false, error: 'Invalid refresh token' });
            }

            const user = await User.findById(decoded.userId);
            if (!user || !user.isActive) {
                return res.status(401).json({ success: false, error: 'User not found or inactive' });
            }

            const newToken = generateToken(user);
            const newRefreshToken = generateRefreshToken(user);

            return res.json({
                success: true,
                data: { token: newToken, refreshToken: newRefreshToken }
            });
        }

        // ==================== PROTECTED ROUTES ====================

        const authResult = authenticate(req);
        if (!authResult.authenticated) {
            return res.status(401).json({ success: false, error: authResult.error });
        }
        const { user: authUser } = authResult;

        if (action === 'logout' && req.method === 'POST') {
            return res.json({ success: true, message: 'Logged out successfully' });
        }

        if (action === 'profile' && req.method === 'GET') {
            const user = await User.findById(authUser.userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            return res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        avatar: user.avatar,
                        preferences: user.preferences,
                        stats: user.stats,
                        createdAt: user.createdAt,
                        lastLogin: user.lastLogin
                    }
                }
            });
        }

        if (action === 'profile' && req.method === 'PATCH') {
            const { name, avatar } = body;
            const user = await User.findById(authUser.userId);

            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            if (name) user.name = name.trim();
            if (avatar !== undefined) user.avatar = avatar;
            await user.save();

            return res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        avatar: user.avatar,
                        preferences: user.preferences,
                        stats: user.stats
                    }
                }
            });
        }

        if (action === 'preferences' && req.method === 'PATCH') {
            const { theme, aiProvider, aiApiKey, aiModel, notifications } = body;
            const user = await User.findById(authUser.userId);

            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            if (theme) user.preferences.theme = theme;
            if (aiProvider) user.preferences.aiProvider = aiProvider;
            if (aiApiKey !== undefined) user.preferences.aiApiKey = aiApiKey;
            if (aiModel) user.preferences.aiModel = aiModel;
            if (notifications) {
                user.preferences.notifications = {
                    ...user.preferences.notifications,
                    ...notifications
                };
            }

            await user.save();

            return res.json({ success: true, data: { preferences: user.preferences } });
        }

        if (action === 'change-password' && req.method === 'POST') {
            const { currentPassword, newPassword } = body;
            const user = await User.findById(authUser.userId);

            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            if (!user.passwordHash) {
                return res.status(400).json({ success: false, error: 'Password change not available for social accounts' });
            }

            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({ success: false, error: 'Current password is incorrect' });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
            }

            user.passwordHash = await User.hashPassword(newPassword);
            await user.save();

            return res.json({ success: true, message: 'Password changed successfully' });
        }

        if (action === 'account' && req.method === 'DELETE') {
            const { password } = body;
            const user = await User.findById(authUser.userId);

            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            if (user.passwordHash) {
                if (!password) {
                    return res.status(400).json({ success: false, error: 'Password is required to delete account' });
                }

                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    return res.status(401).json({ success: false, error: 'Password is incorrect' });
                }
            }

            user.isActive = false;
            user.email = `deleted_${user._id}_${user.email}`;
            await user.save();

            return res.json({ success: true, message: 'Account deleted successfully' });
        }

        return res.status(404).json({ success: false, error: 'Auth endpoint not found' });

    } catch (err) {
        console.error("Auth API Error:", err);
        return res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
    }
}
