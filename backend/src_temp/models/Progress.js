import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    // User & Question Reference
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    questionId: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        enum: ['mcq', 'fillblank', 'descriptive'],
        required: true
    },
    subjectId: {
        type: String,
        required: true,
        index: true
    },
    unitId: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        default: null
    },

    // Progress Tracking
    attempts: {
        type: Number,
        default: 0
    },
    correctAttempts: {
        type: Number,
        default: 0
    },
    incorrectAttempts: {
        type: Number,
        default: 0
    },
    lastAttemptCorrect: {
        type: Boolean,
        default: null
    },

    // Timestamps
    firstAttemptAt: {
        type: Date,
        default: Date.now
    },
    lastAttemptAt: {
        type: Date,
        default: null
    },

    // Spaced Repetition (SM-2 Algorithm)
    srs: {
        easeFactor: {
            type: Number,
            default: 2.5,
            min: 1.3
        },
        interval: {
            type: Number,
            default: 0 // days until next review
        },
        repetitions: {
            type: Number,
            default: 0 // consecutive correct answers
        },
        nextReviewDate: {
            type: Date,
            default: null
        },
        lastReviewRating: {
            type: Number,
            min: 0,
            max: 5,
            default: null
        }
    },

    // User Notes & Bookmarks
    isBookmarked: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        maxlength: 2000,
        default: ''
    },
    userTags: [{
        type: String,
        maxlength: 50
    }],

    // Time Tracking
    totalTimeSpent: {
        type: Number,
        default: 0 // in seconds
    },
    averageTimePerAttempt: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Compound Indexes
progressSchema.index({ userId: 1, questionId: 1, questionType: 1 }, { unique: true });
progressSchema.index({ userId: 1, subjectId: 1 });
progressSchema.index({ userId: 1, 'srs.nextReviewDate': 1 });
progressSchema.index({ userId: 1, isBookmarked: 1 });

// Virtual for accuracy
progressSchema.virtual('accuracy').get(function () {
    if (this.attempts === 0) return 0;
    return (this.correctAttempts / this.attempts) * 100;
});

// Virtual for isDue
progressSchema.virtual('isDue').get(function () {
    if (!this.srs.nextReviewDate) return true;
    return new Date() >= this.srs.nextReviewDate;
});

// Methods

/**
 * Record an attempt on this question
 */
progressSchema.methods.recordAttempt = function (isCorrect, timeSpent = 0) {
    this.attempts += 1;

    if (isCorrect) {
        this.correctAttempts += 1;
    } else {
        this.incorrectAttempts += 1;
    }

    this.lastAttemptCorrect = isCorrect;
    this.lastAttemptAt = new Date();

    // Update time tracking
    this.totalTimeSpent += timeSpent;
    this.averageTimePerAttempt = this.totalTimeSpent / this.attempts;

    return this.save();
};

/**
 * Update spaced repetition data based on SM-2 algorithm
 * @param {number} rating - 0-5 scale (0=complete fail, 5=perfect)
 */
progressSchema.methods.updateSRS = function (rating) {
    let { easeFactor, interval, repetitions } = this.srs;

    // Update ease factor
    easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
    );

    if (rating < 3) {
        // Failed - reset
        repetitions = 0;
        interval = 1;
    } else {
        // Passed
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetitions++;
    }

    // Calculate next review date (start of the day, interval days from today)
    const nextReviewDate = new Date();
    nextReviewDate.setHours(0, 0, 0, 0);
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    this.srs = {
        easeFactor,
        interval,
        repetitions,
        nextReviewDate,
        lastReviewRating: rating
    };

    return this.save();
};

/**
 * Mark/unmark as bookmark
 */
progressSchema.methods.toggleBookmark = function () {
    this.isBookmarked = !this.isBookmarked;
    return this.save();
};

/**
 * Update user notes
 */
progressSchema.methods.updateNotes = function (notes) {
    this.notes = notes;
    return this.save();
};

// Statics

/**
 * Get all due cards for a user
 */
progressSchema.statics.getDueCards = function (userId, limit = 50) {
    const now = new Date();
    return this.find({
        userId,
        $or: [
            { 'srs.nextReviewDate': { $lte: now } },
            { 'srs.nextReviewDate': null }
        ]
    })
        .sort({ 'srs.nextReviewDate': 1 })
        .limit(limit);
};

/**
 * Get user's progress summary for a subject
 */
progressSchema.statics.getSubjectSummary = async function (userId, subjectId) {
    const result = await this.aggregate([
        {
            $match: { userId: mongoose.Types.ObjectId(userId), subjectId }
        },
        {
            $group: {
                _id: null,
                totalQuestions: { $sum: 1 },
                totalAttempts: { $sum: '$attempts' },
                totalCorrect: { $sum: '$correctAttempts' },
                bookmarked: {
                    $sum: { $cond: ['$isBookmarked', 1, 0] }
                },
                dueCards: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $lte: ['$srs.nextReviewDate', new Date()] },
                                    { $eq: ['$srs.nextReviewDate', null] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    return result[0] || {
        totalQuestions: 0,
        totalAttempts: 0,
        totalCorrect: 0,
        bookmarked: 0,
        dueCards: 0
    };
};

/**
 * Get user's weak areas (low accuracy questions)
 */
progressSchema.statics.getWeakAreas = function (userId, threshold = 0.6, limit = 10) {
    return this.aggregate([
        {
            $match: {
                userId: mongoose.Types.ObjectId(userId),
                attempts: { $gte: 3 } // At least 3 attempts
            }
        },
        {
            $project: {
                questionId: 1,
                questionType: 1,
                subjectId: 1,
                unitId: 1,
                topic: 1,
                attempts: 1,
                correctAttempts: 1,
                accuracy: {
                    $divide: ['$correctAttempts', '$attempts']
                }
            }
        },
        {
            $match: {
                accuracy: { $lt: threshold }
            }
        },
        {
            $sort: { accuracy: 1 }
        },
        {
            $limit: limit
        }
    ]);
};

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;