import express from 'express';
import {
    register,
    login,
    verifyEmail,
    googleLogin,
    forgotPassword,
    resetPassword,
    refreshToken,
    logout,
    getProfile,
    updateProfile,
    updatePreferences,
    changePassword,
    deleteAccount,
    googleCallback,
    githubCallback,
    getOAuthUrls
} from '../controllers/authController.js';
import { authenticate, rateLimitAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ==================== Public Routes ====================
router.post('/register', rateLimitAuth, register);
router.post('/verify-email', rateLimitAuth, verifyEmail);
router.post('/login', rateLimitAuth, login);
router.post('/google-login', rateLimitAuth, googleLogin);
router.post('/forgot-password', rateLimitAuth, forgotPassword);
router.post('/reset-password', rateLimitAuth, resetPassword);
router.post('/refresh', refreshToken);
router.get('/oauth/urls', getOAuthUrls);
router.get('/google/callback', googleCallback);
router.get('/github/callback', githubCallback);

// ==================== Protected Routes ====================
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);
router.patch('/preferences', authenticate, updatePreferences);
router.post('/change-password', authenticate, changePassword);
router.delete('/account', authenticate, deleteAccount);

export default router;