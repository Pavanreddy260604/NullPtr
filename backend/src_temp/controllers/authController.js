import User from '../models/User.js';
import PendingUser from '../models/PendingUser.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { sendOTP, sendPasswordReset } from '../services/emailService.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { userId: user._id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        { expiresIn: '30d' }
    );
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and name are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters'
            });
        }

        // Check if user already fully registered
        console.log(`[Register] Checking for existing user: ${email}`);
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        console.log(`[Register] Found existing user:`, existingUser);

        if (existingUser) {
            console.log('[Register] Conflict: User already exists');
            return res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const passwordHash = await User.hashPassword(password);

        // Check if there is a pending registration
        let pendingUser = await PendingUser.findOne({ email: email.toLowerCase() });

        if (pendingUser) {
            // Update existing pending user
            pendingUser.passwordHash = passwordHash;
            pendingUser.name = name.trim();
            pendingUser.verificationToken = otp;
            // Reset expiration by re-saving (expires index uses createdAt, so we might need to update createdAt? 
            // Mongoose TTL usually checks specific field. My model uses createdAt. 
            // Updating createdAt effectively resets TTL if simple TTL. 
            // Actually, for precise control, we might want a specific 'expiresAt' but standard TTL is fine.
            // Let's re-create or update. Updating createdAt works for some TTL setups but replacing is safer for strict TTL.)
            pendingUser.createdAt = Date.now();
            await pendingUser.save();
        } else {
            // Create new pending user
            pendingUser = await PendingUser.create({
                email: email.toLowerCase(),
                passwordHash,
                name: name.trim(),
                verificationToken: otp
            });
        }

        // Send OTP
        await sendOTP(email, otp);

        res.status(200).json({
            success: true,
            message: 'Verification code sent. Please check your email.',
            requireVerification: true,
            email: email
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create account'
        });
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check if user has password (OAuth users might not)
        if (!user.passwordHash) {
            return res.status(401).json({
                success: false,
                error: 'Please login with your social account'
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Account has been deactivated'
            });
        }

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // Update last login and streak
        user.lastLogin = new Date();
        await user.updateStreak();

        res.json({
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
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to login'
        });
    }
};

/**
 * Refresh token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
        );

        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                error: 'Invalid refresh token'
            });
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'User not found or inactive'
            });
        }

        // Generate new tokens
        const newToken = generateToken(user);
        const newRefreshToken = generateRefreshToken(user);

        res.json({
            success: true,
            data: {
                token: newToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid or expired refresh token'
        });
    }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
    try {
        // In a more complex setup, you might blacklist the token
        // For now, we just return success (client clears tokens)
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to logout'
        });
    }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
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
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get profile'
        });
    }
};

/**
 * Update user profile
 * PATCH /api/auth/profile
 */
export const updateProfile = async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name.trim();
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        res.json({
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
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
};

/**
 * Update user preferences
 * PATCH /api/auth/preferences
 */
export const updatePreferences = async (req, res) => {
    try {
        const { theme, aiProvider, aiApiKey, aiModel, notifications } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update preferences
        if (theme) user.preferences.theme = theme;
        if (aiProvider) user.preferences.aiProvider = aiProvider;
        if (aiApiKey !== undefined) {
            // In production, encrypt this!
            user.preferences.aiApiKey = aiApiKey;
        }
        if (aiModel) user.preferences.aiModel = aiModel;
        if (notifications) {
            user.preferences.notifications = {
                ...user.preferences.notifications,
                ...notifications
            };
        }

        await user.save();

        res.json({
            success: true,
            data: {
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update preferences'
        });
    }
};

/**
 * Change password
 * POST /api/auth/change-password
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // OAuth users can't change password
        if (!user.passwordHash) {
            return res.status(400).json({
                success: false,
                error: 'Password change not available for social accounts'
            });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Validate new password
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 8 characters'
            });
        }

        // Update password
        user.passwordHash = await User.hashPassword(newPassword);
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password'
        });
    }
};

/**
 * Delete account
 * DELETE /api/auth/account
 */
export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify password for non-OAuth users
        if (user.passwordHash) {
            if (!password) {
                return res.status(400).json({
                    success: false,
                    error: 'Password is required to delete account'
                });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    error: 'Password is incorrect'
                });
            }
        }

        // Soft delete - deactivate account
        user.isActive = false;
        user.email = `deleted_${user._id}_${user.email}`;
        await user.save();

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete account'
        });
    }
};

/**
 * Google OAuth callback
 * GET /api/auth/google/callback
 */
export const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        const apiBaseUrl = process.env.API_URL || 'http://localhost:5000';
        const redirectUri = `${apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl}/api/auth/google/callback`;

        // Exchange code for tokens with Google
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            })
        });

        const tokens = await response.json();
        if (tokens.error) {
            console.error('[Google OAuth] Token exchange error:', tokens);
            throw new Error(tokens.error_description || tokens.error);
        }

        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        }).then(r => r.json());

        // Find or create user
        let user = await User.findOne({
            oauthProvider: 'google',
            oauthId: userInfo.id
        });

        if (!user) {
            // Check if email exists
            user = await User.findOne({ email: userInfo.email });

            if (user) {
                // Link OAuth to existing account
                user.oauthProvider = 'google';
                user.oauthId = userInfo.id;
                user.avatar = user.avatar || userInfo.picture;
            } else {
                // Create new user
                user = await User.create({
                    email: userInfo.email,
                    name: userInfo.name,
                    avatar: userInfo.picture,
                    oauthProvider: 'google',
                    oauthId: userInfo.id,
                    emailVerified: true
                });
            }
        }

        await user.save();

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // Redirect to frontend with tokens
        const redirectUrl = new URL(process.env.FRONTEND_URL);
        redirectUrl.pathname = '/auth/callback';
        redirectUrl.searchParams.set('token', token);
        redirectUrl.searchParams.set('refreshToken', refreshToken);

        res.redirect(redirectUrl.toString());
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
};

/**
 * GitHub OAuth callback
 * GET /api/auth/github/callback
 */
export const githubCallback = async (req, res) => {
    try {
        const { code } = req.query;

        // Exchange code for access token with GitHub
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: `${process.env.API_URL}/api/auth/github/callback`
            })
        });

        const { access_token } = await response.json();

        // Get user info from GitHub
        const userInfo = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${access_token}` }
        }).then(r => r.json());

        // Get email (GitHub doesn't always include it)
        const emails = await fetch('https://api.github.com/user/emails', {
            headers: { Authorization: `Bearer ${access_token}` }
        }).then(r => r.json());

        const primaryEmail = emails.find(e => e.primary)?.email || userInfo.email;

        // Find or create user
        let user = await User.findOne({
            oauthProvider: 'github',
            oauthId: userInfo.id.toString()
        });

        if (!user) {
            // Check if email exists
            user = await User.findOne({ email: primaryEmail });

            if (user) {
                // Link OAuth to existing account
                user.oauthProvider = 'github';
                user.oauthId = userInfo.id.toString();
                user.avatar = user.avatar || userInfo.avatar_url;
            } else {
                // Create new user
                user = await User.create({
                    email: primaryEmail,
                    name: userInfo.name || userInfo.login,
                    avatar: userInfo.avatar_url,
                    oauthProvider: 'github',
                    oauthId: userInfo.id.toString()
                });
            }
        }

        await user.save();

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // Redirect to frontend with tokens
        const redirectUrl = new URL(process.env.FRONTEND_URL);
        redirectUrl.pathname = '/auth/callback';
        redirectUrl.searchParams.set('token', token);
        redirectUrl.searchParams.set('refreshToken', refreshToken);

        res.redirect(redirectUrl.toString());
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
};

/**
 * Get OAuth redirect URLs
 * GET /api/auth/oauth/urls
 */
export const getOAuthUrls = (req, res) => {
    const urls = {
        google: `https://accounts.google.com/o/oauth2/v2/auth?` +
            new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                redirect_uri: `${(process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/auth/google/callback`,
                response_type: 'code',
                scope: 'email profile',
                access_type: 'offline',
                prompt: 'select_account'
            }).toString(),
        github: `https://github.com/login/oauth/authorize?` +
            new URLSearchParams({
                client_id: process.env.GITHUB_CLIENT_ID,
                redirect_uri: `${(process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/auth/github/callback`,
                scope: 'user:email'
            }).toString()
    };

    res.json({
        success: true,
        data: urls
    });
};
export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find in PendingUser
        const pendingUser = await PendingUser.findOne({
            email: email.toLowerCase(),
            verificationToken: otp
        });

        if (!pendingUser) {
            return res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
        }

        // Create real User
        const user = await User.create({
            email: pendingUser.email,
            passwordHash: pendingUser.passwordHash,
            name: pendingUser.name,
            emailVerified: true,
            lastLogin: new Date(),
            stats: {
                streakDays: 1,
                lastActiveDate: new Date()
            }
        });

        // Delete pending record
        await PendingUser.deleteOne({ _id: pendingUser._id });

        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(200).json({
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
        console.error('Verify email error:', error);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            if (!user.oauthProvider) {
                user.oauthProvider = 'google';
                user.oauthId = googleId;
                if (!user.avatar) user.avatar = picture;
                if (!user.emailVerified) user.emailVerified = true;
                await user.save();
            }
        } else {
            user = await User.create({
                email: email.toLowerCase(),
                name,
                avatar: picture,
                oauthProvider: 'google',
                oauthId: googleId,
                emailVerified: true,
                role: 'student'
            });
        }

        user.lastLogin = new Date();
        await user.updateStreak();

        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
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
        res.status(401).json({ success: false, error: 'Google authentication failed' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
        await sendPasswordReset(email, resetUrl);

        res.json({ success: true, message: 'Password reset link sent to email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, error: 'Failed to process request' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired token' });
        }

        user.passwordHash = await User.hashPassword(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, error: 'Failed to reset password' });
    }
};
