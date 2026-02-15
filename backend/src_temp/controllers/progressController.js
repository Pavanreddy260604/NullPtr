import Progress from '../models/Progress.js';
import User from '../models/User.js';
import MCQ from '../models/MCQ.js';
import FillBlank from '../models/FillBlank.js';
import Descriptive from '../models/Descriptive.js';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

/**
 * Get user's progress for a specific question
 * GET /api/progress/:questionId/:questionType
 */
export const getQuestionProgress = async (req, res) => {
    try {
        const { questionId, questionType } = req.params;
        const userId = new ObjectId(req.user.userId);

        const progress = await Progress.findOne({
            userId,
            questionId,
            questionType
        });

        res.json({
            success: true,
            data: progress || null
        });
    } catch (error) {
        console.error('Get question progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get progress'
        });
    }
};

/**
 * Record an attempt on a question
 * POST /api/progress/attempt
 */
export const recordAttempt = async (req, res) => {
    try {
        const {
            questionId,
            questionType,
            subjectId,
            unitId,
            isCorrect,
            timeSpent,
            userAnswer
        } = req.body;
        const userId = new ObjectId(req.user.userId);

        // Validate question exists
        let question;
        let topic = null;

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

        topic = question.topic;

        // Find or create progress
        let progress = await Progress.findOne({
            userId,
            questionId,
            questionType
        });

        if (!progress) {
            progress = new Progress({
                userId,
                questionId,
                questionType,
                subjectId: subjectId || question.subjectId,
                unitId: unitId || question.unitId,
                topic
            });
        }

        // Record the attempt
        await progress.recordAttempt(isCorrect, timeSpent || 0);

        // Update user stats
        const user = await User.findById(userId);
        if (user) {
            user.stats.totalQuestions = await Progress.countDocuments({ userId });
            await user.updateStreak();
        }

        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Record attempt error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record attempt'
        });
    }
};

/**
 * Submit a spaced repetition rating
 * POST /api/progress/review
 */
export const submitReview = async (req, res) => {
    try {
        const { questionId, questionType, rating } = req.body;
        const userId = new ObjectId(req.user.userId);

        if (rating < 0 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 0 and 5'
            });
        }

        const progress = await Progress.findOne({
            userId,
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
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit review'
        });
    }
};

/**
 * Get due cards for review
 * GET /api/progress/review/due
 */
export const getDueCards = async (req, res) => {
    try {
        const userId = new ObjectId(req.user.userId);
        const { limit = 50, subjectId } = req.query;

        let query = { userId };
        if (subjectId) query.subjectId = subjectId;

        const rawQuery = {
            ...query,
            $or: [
                { 'srs.nextReviewDate': { $lte: new Date() } },
                { 'srs.nextReviewDate': null }
            ]
        };

        const dueProgress = await Progress.find({
            ...query,
            $or: [
                { 'srs.nextReviewDate': { $lte: new Date() } },
                { 'srs.nextReviewDate': null }
            ]
        })
            .sort({ 'srs.nextReviewDate': 1 })
            .limit(parseInt(limit));


        // Fetch actual questions
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

        // Filter out cards where question was deleted
        const validCards = dueCards.filter(c => c.question);

        res.json({
            success: true,
            data: {
                total: validCards.length,
                cards: validCards
            }
        });
    } catch (error) {
        console.error('Get due cards error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get due cards'
        });
    }
};

/**
 * Get user's progress summary
 * GET /api/progress/summary
 */
export const getSummary = async (req, res) => {
    try {
        const userId = new ObjectId(req.user.userId);
        const { subjectId } = req.query;

        let matchQuery = { userId };
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

        console.log('🔍 [SRS Debug] Summary for user:', userId, 'Due:', result.dueCards);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get summary'
        });
    }
};

/**
 * Get progress by subject
 * GET /api/progress/by-subject
 */
export const getBySubject = async (req, res) => {
    try {
        const userId = new ObjectId(req.user.userId);

        const bySubject = await Progress.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$subjectId',
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
            },
            {
                $project: {
                    subjectId: '$_id',
                    totalQuestions: 1,
                    totalAttempts: 1,
                    totalCorrect: 1,
                    bookmarked: 1,
                    dueCards: 1,
                    accuracy: {
                        $cond: [
                            { $gt: ['$totalAttempts', 0] },
                            { $multiply: [{ $divide: ['$totalCorrect', '$totalAttempts'] }, 100] },
                            0
                        ]
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: bySubject
        });
    } catch (error) {
        console.error('Get by subject error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get progress by subject'
        });
    }
};

/**
 * Get weak areas (low accuracy questions)
 * GET /api/progress/weak-areas
 */
export const getWeakAreas = async (req, res) => {
    try {
        const userId = new ObjectId(req.user.userId);
        const { threshold = 0.6, limit = 10 } = req.query;

        const weakAreas = await Progress.getWeakAreas(userId, parseFloat(threshold), parseInt(limit));

        // Fetch question details
        const detailedWeakAreas = await Promise.all(weakAreas.map(async (w) => {
            let question;
            if (w.questionType === 'mcq') {
                question = await MCQ.findById(w.questionId).select('question options topic');
            } else if (w.questionType === 'fillblank') {
                question = await FillBlank.findById(w.questionId).select('question topic');
            } else {
                question = await Descriptive.findById(w.questionId).select('question topic');
            }

            return {
                ...w,
                questionText: question?.question,
                topic: question?.topic || w.topic
            };
        }));

        res.json({
            success: true,
            data: detailedWeakAreas
        });
    } catch (error) {
        console.error('Get weak areas error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get weak areas'
        });
    }
};

/**
 * Toggle bookmark
 * POST /api/progress/:questionId/:questionType/bookmark
 */
export const toggleBookmark = async (req, res) => {
    try {
        const { questionId, questionType } = req.params;
        const userId = new ObjectId(req.user.userId);

        const progress = await Progress.findOne({
            userId,
            questionId,
            questionType
        });

        if (!progress) {
            // Create progress entry with bookmark
            const newProgress = await Progress.create({
                userId,
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
    } catch (error) {
        console.error('Toggle bookmark error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle bookmark'
        });
    }
};

/**
 * Update notes
 * PUT /api/progress/:questionId/:questionType/notes
 */
export const updateNotes = async (req, res) => {
    try {
        const { questionId, questionType } = req.params;
        const { notes } = req.body;
        const userId = new ObjectId(req.user.userId);

        let progress = await Progress.findOne({
            userId,
            questionId,
            questionType
        });

        if (!progress) {
            // Create progress entry with notes
            progress = await Progress.create({
                userId,
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
    } catch (error) {
        console.error('Update notes error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update notes'
        });
    }
};

/**
 * Get bookmarked questions
 * GET /api/progress/bookmarks
 */
export const getBookmarks = async (req, res) => {
    try {
        const userId = new ObjectId(req.user.userId);
        const { page = 1, limit = 20 } = req.query;

        const bookmarks = await Progress.find({
            userId,
            isBookmarked: true
        })
            .sort({ updatedAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await Progress.countDocuments({
            userId,
            isBookmarked: true
        });

        // Fetch question details
        const detailedBookmarks = await Promise.all(bookmarks.map(async (b) => {
            let question;
            if (b.questionType === 'mcq') {
                question = await MCQ.findById(b.questionId);
            } else if (b.questionType === 'fillblank') {
                question = await FillBlank.findById(b.questionId);
            } else {
                question = await Descriptive.findById(b.questionId);
            }

            return {
                progress: b,
                question: question ? {
                    _id: question._id,
                    question: question.question,
                    options: question.options,
                    correctAnswer: question.correctAnswer,
                    explanation: question.explanation,
                    topic: question.topic,
                    type: b.questionType
                } : null
            };
        }));

        res.json({
            success: true,
            data: {
                bookmarks: detailedBookmarks.filter(b => b.question),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get bookmarks'
        });
    }
};

/**
 * Get activity heatmap data
 * GET /api/progress/activity
 */
export const getActivity = async (req, res) => {
    try {
        const userId = new ObjectId(req.user.userId);
        const { year = new Date().getFullYear() } = req.query;

        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        const activity = await Progress.aggregate([
            {
                $match: {
                    userId,
                    lastAttemptAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$lastAttemptAt' }
                    },
                    count: { $sum: '$attempts' },
                    correct: { $sum: '$correctAttempts' }
                }
            },
            {
                $project: {
                    date: '$_id',
                    count: 1,
                    correct: 1,
                    _id: 0
                }
            },
            { $sort: { date: 1 } }
        ]);

        res.json({
            success: true,
            data: activity
        });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get activity'
        });
    }
};

/**
 * Sync offline progress
 * POST /api/progress/sync
 */
export const syncProgress = async (req, res) => {
    try {
        const { progressData } = req.body; // Array of progress entries
        const userId = new ObjectId(req.user.userId);

        const results = {
            synced: 0,
            failed: 0,
            errors: []
        };

        for (const entry of progressData) {
            try {
                const { questionId, questionType, isCorrect, timeSpent, timestamp } = entry;

                let progress = await Progress.findOne({
                    userId,
                    questionId,
                    questionType
                });

                if (!progress) {
                    // Need to get subjectId and unitId from question
                    let question;
                    if (questionType === 'mcq') {
                        question = await MCQ.findById(questionId);
                    } else if (questionType === 'fillblank') {
                        question = await FillBlank.findById(questionId);
                    } else {
                        question = await Descriptive.findById(questionId);
                    }

                    if (!question) {
                        results.failed++;
                        results.errors.push({ questionId, error: 'Question not found' });
                        continue;
                    }

                    progress = new Progress({
                        userId,
                        questionId,
                        questionType,
                        subjectId: question.subjectId,
                        unitId: question.unitId,
                        topic: question.topic
                    });
                }

                await progress.recordAttempt(isCorrect, timeSpent || 0);
                results.synced++;
            } catch (error) {
                results.failed++;
                results.errors.push({ questionId: entry.questionId, error: error.message });
            }
        }

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Sync progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync progress'
        });
    }
};