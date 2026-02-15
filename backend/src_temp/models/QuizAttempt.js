import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        enum: ['mcq', 'fillblank', 'descriptive'],
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    // For MCQs
    options: [{
        type: String
    }],
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed, // Can be number (MCQ) or string (fillblank)
        required: true
    },
    // User's response
    userAnswer: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    isCorrect: {
        type: Boolean,
        default: null
    },
    timeSpent: {
        type: Number,
        default: 0 // seconds
    },
    points: {
        type: Number,
        default: 1
    },
    earnedPoints: {
        type: Number,
        default: 0
    }
});

const quizAttemptSchema = new mongoose.Schema({
    // User Reference
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Quiz Configuration
    config: {
        subjectId: {
            type: String,
            default: null
        },
        unitIds: [{
            type: String
        }],
        questionTypes: [{
            type: String,
            enum: ['mcq', 'fillblank', 'descriptive']
        }],
        totalQuestions: {
            type: Number,
            required: true
        },
        timeLimit: {
            type: Number,
            default: null // null = untimed, otherwise seconds
        },
        shuffle: {
            type: Boolean,
            default: true
        },
        negativeMarking: {
            type: Boolean,
            default: false
        },
        negativeMarkValue: {
            type: Number,
            default: 0.25
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'mixed'],
            default: 'mixed'
        }
    },

    // Questions
    questions: [quizQuestionSchema],

    // Results
    results: {
        totalQuestions: {
            type: Number,
            required: true
        },
        attemptedQuestions: {
            type: Number,
            default: 0
        },
        correctAnswers: {
            type: Number,
            default: 0
        },
        incorrectAnswers: {
            type: Number,
            default: 0
        },
        skipped: {
            type: Number,
            default: 0
        },
        score: {
            type: Number,
            default: 0
        },
        maxScore: {
            type: Number,
            required: true
        },
        percentage: {
            type: Number,
            default: 0
        },
        timeTaken: {
            type: Number,
            default: 0 // total seconds
        },
        averageTimePerQuestion: {
            type: Number,
            default: 0
        }
    },

    // Status
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned'],
        default: 'in_progress'
    },

    // Timestamps
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Indexes
quizAttemptSchema.index({ userId: 1, startedAt: -1 });
quizAttemptSchema.index({ userId: 1, status: 1 });
quizAttemptSchema.index({ 'config.subjectId': 1 });

// Virtual for duration
quizAttemptSchema.virtual('duration').get(function () {
    if (!this.completedAt) return null;
    return Math.round((this.completedAt - this.startedAt) / 1000);
});

// Methods

/**
 * Submit an answer for a question
 */
quizAttemptSchema.methods.submitAnswer = function (questionIndex, userAnswer, timeSpent = 0) {
    if (questionIndex < 0 || questionIndex >= this.questions.length) {
        throw new Error('Invalid question index');
    }

    const question = this.questions[questionIndex];
    question.userAnswer = userAnswer;
    question.timeSpent = timeSpent;
    this.lastActivityAt = new Date();

    // Check if answer is correct
    let isCorrect = false;

    if (question.questionType === 'mcq') {
        isCorrect = userAnswer === question.correctAnswer;
    } else if (question.questionType === 'fillblank') {
        // Case-insensitive comparison, trimmed
        isCorrect = userAnswer?.toString().toLowerCase().trim() ===
            question.correctAnswer?.toString().toLowerCase().trim();
    } else if (question.questionType === 'descriptive') {
        // If it's descriptive but has MCQ properties (our current conversion)
        if (typeof question.correctAnswer === 'number' && typeof userAnswer === 'number') {
            isCorrect = userAnswer === question.correctAnswer;
        } else {
            // Actual descriptive text - mark as attempted (correct=true for effort) or leave null for manual
            isCorrect = userAnswer ? true : false;
        }
    }

    question.isCorrect = isCorrect;

    // Calculate points
    if (isCorrect === true) {
        question.earnedPoints = question.points;
    } else if (isCorrect === false && this.config.negativeMarking) {
        question.earnedPoints = -question.points * this.config.negativeMarkValue;
    } else {
        question.earnedPoints = 0;
    }

    return this.save();
};

/**
 * Complete the quiz and calculate final results
 */
quizAttemptSchema.methods.completeQuiz = function () {
    this.status = 'completed';
    this.completedAt = new Date();

    // Calculate results
    const results = {
        totalQuestions: this.questions.length,
        attemptedQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        skipped: 0,
        score: 0,
        maxScore: 0,
        timeTaken: 0
    };

    for (const question of this.questions) {
        results.maxScore += question.points;

        if (question.userAnswer !== null && question.userAnswer !== undefined) {
            results.attemptedQuestions++;
            results.timeTaken += question.timeSpent || 0;

            if (question.isCorrect === true) {
                results.correctAnswers++;
            } else if (question.isCorrect === false) {
                results.incorrectAnswers++;
            }
        } else {
            results.skipped++;
        }

        results.score += question.earnedPoints || 0;
    }

    // Ensure score is not negative
    results.score = Math.max(0, results.score);

    // Calculate percentage
    results.percentage = results.maxScore > 0
        ? Math.round((results.score / results.maxScore) * 100 * 100) / 100
        : 0;

    // Average time
    results.averageTimePerQuestion = results.attemptedQuestions > 0
        ? Math.round(results.timeTaken / results.attemptedQuestions)
        : 0;

    this.results = results;

    return this.save();
};

/**
 * Abandon the quiz
 */
quizAttemptSchema.methods.abandonQuiz = function () {
    this.status = 'abandoned';
    this.completedAt = new Date();
    return this.save();
};

// Statics

/**
 * Get user's quiz history
 */
quizAttemptSchema.statics.getHistory = function (userId, options = {}) {
    const { limit = 20, skip = 0, subjectId, status } = options;

    const query = { userId: mongoose.Types.ObjectId(userId) };
    if (subjectId) query['config.subjectId'] = subjectId;
    if (status) query.status = status;

    return this.find(query)
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('config results status startedAt completedAt');
};

/**
 * Get user's quiz statistics
 */
quizAttemptSchema.statics.getStats = async function (userId) {
    const result = await this.aggregate([
        {
            $match: {
                userId: mongoose.Types.ObjectId(userId),
                status: 'completed'
            }
        },
        {
            $group: {
                _id: null,
                totalQuizzes: { $sum: 1 },
                totalQuestions: { $sum: '$results.totalQuestions' },
                totalCorrect: { $sum: '$results.correctAnswers' },
                averageScore: { $avg: '$results.percentage' },
                averageTime: { $avg: '$results.timeTaken' },
                bestScore: { $max: '$results.percentage' }
            }
        }
    ]);

    return result[0] || {
        totalQuizzes: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        averageScore: 0,
        averageTime: 0,
        bestScore: 0
    };
};

/**
 * Get leaderboard for a subject
 */
quizAttemptSchema.statics.getLeaderboard = function (subjectId, limit = 10) {
    return this.aggregate([
        {
            $match: {
                'config.subjectId': subjectId,
                status: 'completed'
            }
        },
        {
            $group: {
                _id: '$userId',
                bestScore: { $max: '$results.percentage' },
                totalQuizzes: { $sum: 1 },
                averageScore: { $avg: '$results.percentage' }
            }
        },
        {
            $sort: { bestScore: -1, averageScore: -1 }
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $project: {
                userId: '$_id',
                name: { $arrayElemAt: ['$user.name', 0] },
                avatar: { $arrayElemAt: ['$user.avatar', 0] },
                bestScore: 1,
                totalQuizzes: 1,
                averageScore: { $round: ['$averageScore', 2] }
            }
        }
    ]);
};

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;