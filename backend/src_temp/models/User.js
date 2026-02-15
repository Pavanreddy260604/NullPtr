import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    // Basic Info
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: function () {
            return !this.oauthProvider; // Not required for OAuth users
        }
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String,
        default: null
    },

    // Role & Status
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // OAuth
    oauthProvider: {
        type: String,
        enum: ['google', 'github', null],
        default: null
    },
    oauthId: {
        type: String,
        default: null
    },

    // Preferences
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        aiProvider: {
            type: String,
            enum: ['ollama', 'openai', 'anthropic', 'google', 'groq', null],
            default: null
        },
        aiApiKey: {
            type: String,
            default: null
        },
        aiModel: {
            type: String,
            default: null
        },
        notifications: {
            reviewReminders: {
                type: Boolean,
                default: true
            },
            streakReminders: {
                type: Boolean,
                default: true
            }
        }
    },

    // Stats
    stats: {
        totalQuestions: {
            type: Number,
            default: 0
        },
        streakDays: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        },
        lastActiveDate: {
            type: Date,
            default: null
        }
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.passwordHash;
            delete ret.oauthId;
            delete ret.preferences.aiApiKey;
            return ret;
        }
    }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ oauthProvider: 1, oauthId: 1 });

// Methods
userSchema.methods.comparePassword = async function (password) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.updateStreak = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = this.stats.lastActiveDate;
    if (lastActive) {
        const lastActiveDate = new Date(lastActive);
        lastActiveDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            this.stats.streakDays += 1;
            this.stats.longestStreak = Math.max(this.stats.streakDays, this.stats.longestStreak);
        } else if (diffDays > 1) {
            // Streak broken
            this.stats.streakDays = 1;
        }
        // If diffDays === 0, same day, no change
    } else {
        // First activity
        this.stats.streakDays = 1;
    }

    this.stats.lastActiveDate = today;
    return this.save();
};

// Statics
userSchema.statics.hashPassword = async function (password) {
    return bcrypt.hash(password, 12);
};

// Pre-save middleware
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

export default User;