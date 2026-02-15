import mongoose from "mongoose";
import jwt from "jsonwebtoken";

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

// Progress Schema
const progressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questionId: { type: String, required: true },
    questionType: { type: String, enum: ['mcq', 'fillblank', 'descriptive'], required: true },
    subjectId: { type: String, required: true, index: true },
    unitId: { type: String, required: true },
    topic: { type: String, default: null },
    attempts: { type: Number, default: 0 },
    correctAttempts: { type: Number, default: 0 },
    incorrectAttempts: { type: Number, default: 0 },
    lastAttemptCorrect: { type: Boolean, default: null },
    firstAttemptAt: { type: Date, default: Date.now },
    lastAttemptAt: { type: Date, default: null },
    srs: {
        easeFactor: { type: Number, default: 2.5, min: 1.3 },
        interval: { type: Number, default: 0 },
        repetitions: { type: Number, default: 0 },
        nextReviewDate: { type: Date, default: null },
        lastReviewRating: { type: Number, min: 0, max: 5, default: null }
    },
    isBookmarked: { type: Boolean, default: false },
    notes: { type: String, maxlength: 2000, default: '' },
    userTags: [{ type: String, maxlength: 50 }],
    totalTimeSpent: { type: Number, default: 0 },
    averageTimePerAttempt: { type: Number, default: 0 }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Progress Methods
progressSchema.methods.recordAttempt = function (isCorrect, timeSpent = 0) {
    this.attempts += 1;
    if (isCorrect) {
        this.correctAttempts += 1;
    } else {
        this.incorrectAttempts += 1;
    }

    this.lastAttemptCorrect = isCorrect;
    this.lastAttemptAt = new Date();
    this.totalTimeSpent += timeSpent;
    this.averageTimePerAttempt = this.totalTimeSpent / this.attempts;
    return this.save();
};

progressSchema.methods.updateSRS = function (rating) {
    let { easeFactor, interval, repetitions } = this.srs;

    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));

    if (rating < 3) {
        repetitions = 0;
        interval = 1;
    } else {
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetitions++;
    }

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

progressSchema.methods.toggleBookmark = function () {
    this.isBookmarked = !this.isBookmarked;
    return this.save();
};

progressSchema.methods.updateNotes = function (notes) {
    this.notes = notes;
    return this.save();
};

// Progress Statics
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

progressSchema.statics.getWeakAreas = function (userId, threshold = 0.6, limit = 10) {
    return this.aggregate([
        {
            $match: {
                userId: mongoose.Types.ObjectId(userId),
                attempts: { $gte: 3 }
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

// Get or create models
const getProgressModel = () =>
    mongoose.models.Progress || mongoose.model('Progress', progressSchema);

const getUserModel = () =>
    mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));

const getMCQModel = () =>
    mongoose.models.MCQ || mongoose.model('MCQ', new mongoose.Schema({}, { strict: false, collection: 'mcqs' }));

const getFillBlankModel = () =>
    mongoose.models.FillBlank || mongoose.model('FillBlank', new mongoose.Schema({}, { strict: false, collection: 'fillblanks' }));

const getDescriptiveModel = () =>
    mongoose.models.Descriptive || mongoose.model('Descriptive', new mongoose.Schema({}, { strict: false, collection: 'descriptives' }));

/* -------------------------------------------------- */
/* 🔐 3. Authentication Middleware                     */
/* -------------------------------------------------- */
const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};

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
/* 🚀 4. Main Progress Handler                         */
/* -------------------------------------------------- */
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(204).end();

    try {
        await connectDB();
        const auth = authenticate(req);

        if (!auth.authenticated) {
            return res.status(401).json({ success: false, error: auth.error });
        }

        const parts = req.url.split("?")[0].split("/").filter(Boolean);
        const progressIndex = parts.indexOf("progress");
        const actionIndex = progressIndex !== -1 ? progressIndex + 1 : 0;
        const action = parts[actionIndex] || '';

        const Progress = getProgressModel();
        const User = getUserModel();
        const MCQ = getMCQModel();
        const FillBlank = getFillBlankModel();
        const Descriptive = getDescriptiveModel();

        // ==================== PROGRESS OPERATIONS ====================
        if (action === 'attempt' && req.method === 'POST') {
            const { questionId, questionType, subjectId, unitId, isCorrect, timeSpent, userAnswer } = req.body;

            let question;
            if (questionType === 'mcq') {
                question = await MCQ.findById(questionId);
            } else if (questionType === 'fillblank') {
                question = await FillBlank.findById(questionId);
            } else if (questionType === 'descriptive') {
                question = await Descriptive.findById(questionId);
            }

            if (!question) {
                return res.status(404).json({
                    success: false,
                    error: 'Question not found'
                });
            }

            let progress = await Progress.findOne({
                userId: auth.user.userId,
                questionId,
                questionType
            });

            if (!progress) {
                progress = new Progress({
                    userId: auth.user.userId,
                    questionId,
                    questionType,
                    subjectId: subjectId || question.subjectId,
                    unitId: unitId || question.unitId,
                    topic: question.topic
                });
            }

            await progress.recordAttempt(isCorrect, timeSpent || 0);

            const user = await User.findById(auth.user.userId);
            if (user) {
                user.stats.totalQuestions = await Progress.countDocuments({ userId: auth.user.userId });
                await user.save();
            }

            res.json({
                success: true,
                data: progress
            });
        }

        else if (action === 'review' && req.method === 'POST') {
            const { questionId, questionType, rating } = req.body;

            if (rating < 0 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    error: 'Rating must be between 0 and 5'
                });
            }

            const progress = await Progress.findOne({
                userId: auth.user.userId,
                questionId,
                questionType
            });

            if (!progress) {
                return res.status(404).json({
                    success: false,
                    error: 'Progress not found for this question'
                });
            }

            await progress.updateSRS(rating);

            res.json({
                success: true,
                data: {
                    nextReviewDate: progress.srs.nextReviewDate,
                    interval: progress.srs.interval,
                    easeFactor: progress.srs.easeFactor
                }
            });
        }

        else if (action === 'review' && parts[actionIndex + 1] === 'due' && req.method === 'GET') {
            const { limit = 50, subjectId } = req.query;

            let query = { userId: auth.user.userId };
            if (subjectId) query.subjectId = subjectId;

            const rawQuery = {
                ...query,
                $or: [
                    { 'srs.nextReviewDate': { $lte: new Date() } },
                    { 'srs.nextReviewDate': null }
                ]
            };

            const dueProgress = await Progress.find(rawQuery)
                .sort({ 'srs.nextReviewDate': 1 })
                .limit(parseInt(limit));

            const dueCards = await Promise.all(dueProgress.map(async (p) => {
                let question;
                if (p.questionType === 'mcq') {
                    question = await MCQ.findById(p.questionId);
                } else if (p.questionType === 'fillblank') {
                    question = await FillBlank.findById(p.questionId);
                } else {
                    question = await Descriptive.findById(p.questionId);
                }

                return {
                    progress: p,
                    question: question ? {
                        _id: question._id,
                        question: question.question,
                        options: question.options,
                        correctAnswer: question.correctAnswer,
                        explanation: question.explanation,
                        topic: question.topic,
                        type: p.questionType
                    } : null
                };
            }));

            const validCards = dueCards.filter(c => c.question);

            res.json({
                success: true,
                data: {
                    total: validCards.length,
                    cards: validCards
                }
            });
        }

        else if (action === 'summary' && req.method === 'GET') {
            const { subjectId } = req.query;

            let matchQuery = { userId: auth.user.userId };
            if (subjectId) matchQuery.subjectId = subjectId;

            const summary = await Progress.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalQuestions: { $sum: 1 },
                        totalAttempts: { $sum: '$attempts' },
                        totalCorrect: { $sum: '$correctAttempts' },
                        totalIncorrect: { $sum: '$incorrectAttempts' },
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
                        },
                        averageAccuracy: {
                            $avg: {
                                $cond: [
                                    { $gt: ['$attempts', 0] },
                                    { $divide: ['$correctAttempts', '$attempts'] },
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            const result = summary[0] || {
                totalQuestions: 0,
                totalAttempts: 0,
                totalCorrect: 0,
                totalIncorrect: 0,
                bookmarked: 0,
                dueCards: 0,
                averageAccuracy: 0
            };

            res.json({
                success: true,
                data: result
            });
        }

        else if (action === 'bookmarks' && req.method === 'GET') {
            const bookmarks = await Progress.find({
                userId: auth.user.userId,
                isBookmarked: true
            });

            res.json({
                success: true,
                data: bookmarks
            });
        }

        else if (action && action.match(/^[0-9a-f]{24}$/) && parts[actionIndex + 1] && parts[actionIndex + 2] === 'bookmark' && req.method === 'POST') {
            const questionId = action;
            const questionType = parts[actionIndex + 1];

            const progress = await Progress.findOne({
                userId: auth.user.userId,
                questionId,
                questionType
            });

            if (!progress) {
                const newProgress = await Progress.create({
                    userId: auth.user.userId,
                    questionId,
                    questionType,
                    isBookmarked: true
                });

                return res.json({
                    success: true,
                    data: { isBookmarked: true }
                });
            }

            await progress.toggleBookmark();

            res.json({
                success: true,
                data: { isBookmarked: progress.isBookmarked }
            });
        }

        else if (action && action.match(/^[0-9a-f]{24}$/) && parts[actionIndex + 1] && parts[actionIndex + 2] === 'notes' && req.method === 'PUT') {
            const questionId = action;
            const questionType = parts[actionIndex + 1];
            const { notes } = req.body;

            let progress = await Progress.findOne({
                userId: auth.user.userId,
                questionId,
                questionType
            });

            if (!progress) {
                progress = await Progress.create({
                    userId: auth.user.userId,
                    questionId,
                    questionType,
                    notes
                });
            } else {
                await progress.updateNotes(notes);
            }

            res.json({
                success: true,
                data: { notes: progress.notes }
            });
        }

        else {
            return res.status(404).json({ success: false, error: 'Progress endpoint not found' });
        }

    } catch (err) {
        console.error("Progress API Error:", err);
        return res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
    }
}
