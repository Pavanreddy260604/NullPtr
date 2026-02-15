import jwt from 'jsonwebtoken';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication token required'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-super-secret-jwt-key'
        );

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

/**
 * Optional authentication middleware
 */
export const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-super-secret-jwt-key'
        );

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

/**
 * Admin role middleware
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }

    next();
};

/**
 * Rate limiting for auth routes
 */
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

export const rateLimitAuth = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const email = req.body.email?.toLowerCase();
    const key = email ? `${ip}:${email}` : ip;
    const attempts = loginAttempts.get(key) || { count: 0, firstAttempt: Date.now() };

    if (attempts.count >= MAX_ATTEMPTS) {
        const timeLeft = LOCKOUT_TIME - (Date.now() - attempts.firstAttempt);
        if (timeLeft > 0) {
            return res.status(429).json({
                success: false,
                error: 'Too many login attempts. Please try again later.',
                retryAfter: Math.ceil(timeLeft / 1000)
            });
        }
        attempts.count = 0;
        attempts.firstAttempt = Date.now();
    }

    const originalSend = res.send;
    res.send = function (data) {
        if (res.statusCode === 401) {
            attempts.count++;
            attempts.firstAttempt = attempts.count === 1 ? Date.now() : attempts.firstAttempt;
            loginAttempts.set(key, attempts);
        } else if (res.statusCode === 200) {
            loginAttempts.delete(key);
        }
        return originalSend.call(this, data);
    };

    next();
};

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of loginAttempts.entries()) {
        if (now - value.firstAttempt > LOCKOUT_TIME) {
            loginAttempts.delete(key);
        }
    }
}, 60 * 1000);