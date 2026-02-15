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

// Quiz Question Schema
const quizQuestionSchema = new mongoose.Schema({
    questionId: { type: String, required: true },
    questionType: { type: String, enum: ['mcq', 'fillblank', 'descriptive'], required: true },
    questionText: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
    userAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
    isCorrect: { type: Boolean, default: null },
    timeSpent: { type: Number, default: 0 },
    points: { type: Number, default: 1 },
    earnedPoints: { type: Number, default: 0 }
});

// Quiz Attempt Schema
const quizAttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    config: {
        subjectId: { type: String, default: null },
        unitIds: [{ type: String }],
        questionTypes: [{ type: String, enum: ['mcq', 'fillblank', 'descriptive'] }],
        totalQuestions: { type: Number, required: true },
        timeLimit: { type: Number, default: null },
        shuffle: { type: Boolean, default: true },
        negativeMarking: { type: Boolean, default: false },
        negativeMarkValue: { type: Number, default: 0.25 },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' }
    },
    questions: [quizQuestionSchema],
    results: {
        totalQuestions: { type: Number, required: true },
        attemptedQuestions: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 },
        incorrectAnswers: { type: Number, default: 0 },
        skipped: { type: Number, default: 0 },
        score: { type: Number, default: 0 },
        maxScore: { type: Number, required: true },
        percentage: { type: Number, default: 0 },
        timeTaken: { type: Number, default: 0 },
        averageTimePerQuestion: { type: Number, default: 0 }
    },
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    lastActivityAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Quiz Methods
quizAttemptSchema.methods.submitAnswer = function (questionIndex, userAnswer, timeSpent = 0) {
    if (questionIndex < 0 || questionIndex >= this.questions.length) {
        throw new Error('Invalid question index');
    }

    const question = this.questions[questionIndex];
    question.userAnswer = userAnswer;
    question.timeSpent = timeSpent;
    this.lastActivityAt = new Date();

    let isCorrect = false;
    if (question.questionType === 'mcq') {
        isCorrect = userAnswer === question.correctAnswer;
    } else if (question.questionType === 'fillblank') {
        isCorrect = userAnswer?.toString().toLowerCase().trim() ===
            question.correctAnswer?.toString().toLowerCase().trim();
    } else if (question.questionType === 'descriptive') {
        if (typeof question.correctAnswer === 'number' && typeof userAnswer === 'number') {
            isCorrect = userAnswer === question.correctAnswer;
        } else {
            isCorrect = userAnswer ? true : false;
        }
    }

    question.isCorrect = isCorrect;
    if (isCorrect === true) {
        question.earnedPoints = question.points;
    } else if (isCorrect === false && this.config.negativeMarking) {
        question.earnedPoints = -question.points * this.config.negativeMarkValue;
    } else {
        question.earnedPoints = 0;
    }

    return this.save();
};

quizAttemptSchema.methods.completeQuiz = function () {
    this.status = 'completed';
    this.completedAt = new Date();

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

    results.score = Math.max(0, results.score);
    results.percentage = results.maxScore > 0 ? Math.round((results.score / results.maxScore) * 100 * 100) / 100 : 0;
    results.averageTimePerQuestion = results.attemptedQuestions > 0 ? Math.round(results.timeTaken / results.attemptedQuestions) : 0;
    this.results = results;

    return this.save();
};

// Get or create models
const getQuizAttemptModel = () =>
    mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema);

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
/* 🚀 4. Main Quiz Handler                            */
/* -------------------------------------------------- */
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(204).end();

    try {
        await connectDB();
        const auth = authenticate(req);

        // All quiz routes require authentication
        if (!auth.authenticated) {
            return res.status(401).json({ success: false, error: auth.error });
        }

        const parts = req.url.split("?")[0].split("/").filter(Boolean);
        const quizIndex = parts.indexOf("quiz");
        const actionIndex = quizIndex !== -1 ? quizIndex + 1 : 0;
        const action = parts[actionIndex] || '';

        const QuizAttempt = getQuizAttemptModel();
        const MCQ = getMCQModel();
        const FillBlank = getFillBlankModel();
        const Descriptive = getDescriptiveModel();

        // ==================== QUIZ OPERATIONS ====================
        if (action === 'start' && req.method === 'POST') {
            const { subjectId, unitIds, questionTypes, totalQuestions, timeLimit, difficulty, shuffle } = req.body;

            const query = {};
            if (subjectId) query.subjectId = subjectId;
            if (unitIds && unitIds.length > 0) query.unitId = { $in: unitIds };

            let questions = [];
            const types = questionTypes || ['mcq', 'fillblank'];

            if (types.includes('mcq')) {
                const mcqs = await MCQ.find(query).limit(totalQuestions);
                questions = questions.concat(mcqs.map(q => ({
                    questionId: q._id.toString(),
                    questionType: 'mcq',
                    questionText: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    points: 1
                })));
            }

            if (types.includes('fillblank') && questions.length < totalQuestions) {
                const fills = await FillBlank.find(query).limit(totalQuestions - questions.length);
                questions = questions.concat(fills.map(q => ({
                    questionId: q._id.toString(),
                    questionType: 'fillblank',
                    questionText: q.question,
                    correctAnswer: q.correctAnswer,
                    points: 1
                })));
            }

            if (types.includes('descriptive') && questions.length < totalQuestions) {
                const descs = await Descriptive.find(query);

                const stringifyBlocks = (blocks) => {
                    return blocks.map(b => {
                        if (b.type === 'list') return b.items.join(', ');
                        return b.content || '';
                    }).join(' ').slice(0, 150) + (blocks.length > 1 || (blocks[0]?.content?.length > 150) ? '...' : '');
                };

                const convertedDescs = descs.slice(0, totalQuestions - questions.length).map((q, idx) => {
                    const correctOption = stringifyBlocks(q.answer);
                    const otherAnswers = descs
                        .filter(d => d._id.toString() !== q._id.toString())
                        .map(d => stringifyBlocks(d.answer));

                    const distractors = otherAnswers
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 3);

                    while (distractors.length < 3) {
                        distractors.push(`Alternative context ${distractors.length + 1}`);
                    }

                    const options = [correctOption, ...distractors].sort(() => Math.random() - 0.5);
                    const correctIndex = options.indexOf(correctOption);

                    return {
                        questionId: q._id.toString(),
                        questionType: 'mcq',
                        originalType: 'descriptive',
                        questionText: q.question,
                        options: options,
                        correctAnswer: correctIndex,
                        points: 2
                    };
                });

                questions = questions.concat(convertedDescs);
            }

            if (shuffle !== false) {
                questions = questions.sort(() => Math.random() - 0.5);
            }

            questions = questions.slice(0, totalQuestions);

            if (questions.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No questions found for the given criteria'
                });
            }

            const quizAttempt = await QuizAttempt.create({
                userId: auth.user.userId,
                config: {
                    subjectId,
                    unitIds,
                    questionTypes: types,
                    totalQuestions: questions.length,
                    timeLimit,
                    shuffle,
                    difficulty
                },
                questions,
                results: {
                    totalQuestions: questions.length,
                    maxScore: questions.reduce((acc, q) => acc + q.points, 0)
                }
            });

            res.status(201).json({
                success: true,
                data: {
                    quizId: quizAttempt._id,
                    questions: quizAttempt.questions.map(q => ({
                        questionId: q.questionId,
                        questionType: q.questionType,
                        questionText: q.questionText,
                        options: q.options
                    })),
                    config: quizAttempt.config,
                    startedAt: quizAttempt.startedAt
                }
            });
        }

        else if (action && action.match(/^[0-9a-f]{24}$/) && req.method === 'POST' && parts[actionIndex + 1] === 'submit') {
            const { questionIndex, answer, timeSpent } = req.body;
            const quizId = action;

            const quiz = await QuizAttempt.findOne({ _id: quizId, userId: auth.user.userId });
            if (!quiz) {
                return res.status(404).json({ success: false, error: 'Quiz not found' });
            }

            if (quiz.status !== 'in_progress') {
                return res.status(400).json({ success: false, error: 'Quiz is already finished' });
            }

            await quiz.submitAnswer(questionIndex, answer, timeSpent);

            res.json({ success: true, message: 'Answer submitted' });
        }

        else if (action && action.match(/^[0-9a-f]{24}$/) && req.method === 'POST' && parts[actionIndex + 1] === 'complete') {
            const quizId = action;

            const quiz = await QuizAttempt.findOne({ _id: quizId, userId: auth.user.userId });
            if (!quiz) {
                return res.status(404).json({ success: false, error: 'Quiz not found' });
            }

            await quiz.completeQuiz();

            res.json({
                success: true,
                data: {
                    results: quiz.results,
                    questions: quiz.questions
                }
            });
        }

        else if (action === 'history' && req.method === 'GET') {
            const history = await QuizAttempt.find({ userId: auth.user.userId })
                .sort({ startedAt: -1 })
                .limit(20);

            res.json({
                success: true,
                data: history
            });
        }

        else if (action && action.match(/^[0-9a-f]{24}$/) && req.method === 'GET') {
            const quizId = action;

            const quiz = await QuizAttempt.findOne({ _id: quizId, userId: auth.user.userId });
            if (!quiz) {
                return res.status(404).json({ success: false, error: 'Quiz not found' });
            }

            res.json({
                success: true,
                data: quiz
            });
        }

        else {
            return res.status(404).json({ success: false, error: 'Quiz endpoint not found' });
        }

    } catch (err) {
        console.error("Quiz API Error:", err);
        return res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
    }
}
