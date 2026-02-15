import express from 'express';
// We'll reuse the existing auth middleware but add a check for the admin secret header
// since the admin panel uses that specific header auth scheme
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

import { getSMTPConfig, updateSMTPConfig, sendTestEmail } from '../controllers/adminController.js';

// Middleware to check for Admin Secret Header (legacy/admin-app compatibility)
const requireAdminSecret = (req, res, next) => {
    const secret = req.headers['x-second-space-secret'];
    const serverSecret = process.env.SECOND_SPACE_SECRET || 'nullptr_secret_123';

    if (secret === serverSecret) {
        return next();
    }

    // Fallback to standard JWT admin check if header not present
    // This allows both the Admin App (header) and Postman/Other (JWT) to work
    if (req.headers.authorization) {
        return authenticate(req, res, () => {
            if (req.user && req.user.role === 'admin') {
                next();
            } else {
                res.status(403).json({ message: "Admin access required" });
            }
        });
    }

    res.status(403).json({ message: "Forbidden: Invalid Admin Secret" });
};

router.get('/smtp', requireAdminSecret, getSMTPConfig);
router.post('/smtp', requireAdminSecret, updateSMTPConfig);
router.post('/test-email', requireAdminSecret, sendTestEmail);

export default router;
