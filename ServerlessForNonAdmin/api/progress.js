import mongoose from "mongoose";
import jwt from "jsonwebtoken";

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = { bufferCommands: false, maxPoolSize: 10 };
        cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongooseInstance) => mongooseInstance);
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

const progressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    questionId: { type: String, required: true },
    questionType: { type: String, enum: ["mcq", "fillblank", "descriptive"], required: true },
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
    notes: { type: String, maxlength: 2000, default: "" },
    userTags: [{ type: String, maxlength: 50 }],
    totalTimeSpent: { type: Number, default: 0 },
    averageTimePerAttempt: { type: Number, default: 0 }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

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
        repetitions += 1;
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

progressSchema.statics.getDueCards = function (userId, limit = 50) {
    const now = new Date();
    return this.find({
        userId,
        $or: [
            { "srs.nextReviewDate": { $lte: now } },
            { "srs.nextReviewDate": null }
        ]
    })
        .sort({ "srs.nextReviewDate": 1 })
        .limit(limit);
};

progressSchema.statics.getSubjectSummary = async function (userId, subjectId) {
    const objectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
    const result = await this.aggregate([
        { $match: { userId: objectId, subjectId } },
        {
            $group: {
                _id: null,
                totalQuestions: { $sum: 1 },
                totalAttempts: { $sum: "$attempts" },
                totalCorrect: { $sum: "$correctAttempts" },
                bookmarked: { $sum: { $cond: ["$isBookmarked", 1, 0] } },
                dueCards: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $lte: ["$srs.nextReviewDate", new Date()] },
                                    { $eq: ["$srs.nextReviewDate", null] }
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
    const objectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
    return this.aggregate([
        {
            $match: {
                userId: objectId,
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
                accuracy: { $divide: ["$correctAttempts", "$attempts"] }
            }
        },
        { $match: { accuracy: { $lt: threshold } } },
        { $sort: { accuracy: 1 } },
        { $limit: limit }
    ]);
};

const getProgressModel = () => mongoose.models.Progress || mongoose.model("Progress", progressSchema);
const getUserModel = () => mongoose.models.User || mongoose.model("User", new mongoose.Schema({}, { strict: false, collection: "users" }));
const getMCQModel = () => mongoose.models.MCQ || mongoose.model("MCQ", new mongoose.Schema({}, { strict: false, collection: "mcqs" }));
const getFillBlankModel = () => mongoose.models.FillBlank || mongoose.model("FillBlank", new mongoose.Schema({}, { strict: false, collection: "fillblanks" }));
const getDescriptiveModel = () => mongoose.models.Descriptive || mongoose.model("Descriptive", new mongoose.Schema({}, { strict: false, collection: "descriptives" }));

const VALID_QUESTION_TYPES = new Set(["mcq", "fillblank", "descriptive"]);

const parseRequestBody = (body) => {
    if (body && typeof body === "object") return body;
    if (typeof body === "string") {
        try {
            return JSON.parse(body);
        } catch {
            return {};
        }
    }
    return {};
};

const parseRequestQuery = (url, query = {}) => {
    if (query && Object.keys(query).length > 0) {
        return query;
    }

    try {
        const parsed = new URL(url, "http://localhost");
        return Object.fromEntries(parsed.searchParams.entries());
    } catch {
        return {};
    }
};

const authenticate = (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { authenticated: false, error: "Authentication required" };
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return { authenticated: false, error: "Authentication token required" };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key");
        return { authenticated: true, user: decoded };
    } catch (error) {
        if (error?.name === "TokenExpiredError") {
            return { authenticated: false, error: "Token expired", code: "TOKEN_EXPIRED" };
        }
        return { authenticated: false, error: "Invalid token", code: "INVALID_TOKEN" };
    }
};

const isMongoId = (value) => typeof value === "string" && mongoose.Types.ObjectId.isValid(value);

const toSafeString = (value) => {
    if (value === null || value === undefined) return "";
    return typeof value === "string" ? value : String(value);
};

const resolveQuestionByType = async (questionType, questionId, models) => {
    if (questionType === "mcq") {
        return models.MCQ.findById(questionId);
    }
    if (questionType === "fillblank") {
        return models.FillBlank.findById(questionId);
    }
    if (questionType === "descriptive") {
        return models.Descriptive.findById(questionId);
    }
    return null;
};

const getQuestionPayload = (question, questionType) => {
    if (!question) return null;
    return {
        _id: question._id,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        topic: question.topic,
        type: questionType
    };
};

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(204).end();

    try {
        await connectDB();

        const auth = authenticate(req);
        if (!auth.authenticated) {
            return res.status(401).json({ success: false, error: auth.error, code: auth.code });
        }

        const userId = new mongoose.Types.ObjectId(auth.user.userId);
        const parts = req.url.split("?")[0].split("/").filter(Boolean);
        const progressIndex = parts.indexOf("progress");
        const actionIndex = progressIndex !== -1 ? progressIndex + 1 : 0;
        const action = parts[actionIndex] || "";

        const body = parseRequestBody(req.body);
        const query = parseRequestQuery(req.url, req.query);

        const Progress = getProgressModel();
        const User = getUserModel();
        const MCQ = getMCQModel();
        const FillBlank = getFillBlankModel();
        const Descriptive = getDescriptiveModel();
        const questionModels = { MCQ, FillBlank, Descriptive };

        if (action === "attempt" && req.method === "POST") {
            const { questionId, questionType, subjectId, unitId, isCorrect, timeSpent } = body;

            if (!questionId || !VALID_QUESTION_TYPES.has(questionType)) {
                return res.status(400).json({
                    success: false,
                    error: "questionId and valid questionType are required"
                });
            }

            const question = await resolveQuestionByType(questionType, questionId, questionModels);
            if (!question) {
                return res.status(404).json({ success: false, error: "Question not found" });
            }

            let progress = await Progress.findOne({ userId, questionId, questionType });
            if (!progress) {
                progress = new Progress({
                    userId,
                    questionId,
                    questionType,
                    subjectId: toSafeString(subjectId || question.subjectId),
                    unitId: toSafeString(unitId || question.unitId),
                    topic: question.topic || null
                });
            }

            await progress.recordAttempt(Boolean(isCorrect), Number(timeSpent) || 0);

            const user = await User.findById(userId);
            if (user) {
                user.stats.totalQuestions = await Progress.countDocuments({ userId });
                await user.save();
            }

            return res.json({ success: true, data: progress });
        }

        if (action === "review" && req.method === "POST") {
            const { questionId, questionType, rating } = body;
            const numericRating = Number(rating);

            if (!questionId || !VALID_QUESTION_TYPES.has(questionType)) {
                return res.status(400).json({
                    success: false,
                    error: "questionId and valid questionType are required"
                });
            }

            if (Number.isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
                return res.status(400).json({ success: false, error: "Rating must be between 0 and 5" });
            }

            const progress = await Progress.findOne({ userId, questionId, questionType });
            if (!progress) {
                return res.status(404).json({ success: false, error: "Progress not found for this question" });
            }

            await progress.updateSRS(numericRating);
            return res.json({
                success: true,
                data: {
                    nextReviewDate: progress.srs.nextReviewDate,
                    interval: progress.srs.interval,
                    easeFactor: progress.srs.easeFactor
                }
            });
        }

        if (action === "review" && parts[actionIndex + 1] === "due" && req.method === "GET") {
            const limit = Math.max(1, Math.min(200, parseInt(String(query.limit ?? "50"), 10) || 50));
            const subjectId = typeof query.subjectId === "string" ? query.subjectId : undefined;

            const dbQuery = {
                userId,
                $or: [
                    { "srs.nextReviewDate": { $lte: new Date() } },
                    { "srs.nextReviewDate": null }
                ]
            };
            if (subjectId) dbQuery.subjectId = subjectId;

            const dueProgress = await Progress.find(dbQuery)
                .sort({ "srs.nextReviewDate": 1 })
                .limit(limit);

            const dueCards = await Promise.all(dueProgress.map(async (progressDoc) => {
                const question = await resolveQuestionByType(progressDoc.questionType, progressDoc.questionId, questionModels);
                return {
                    progress: progressDoc,
                    question: getQuestionPayload(question, progressDoc.questionType)
                };
            }));

            const validCards = dueCards.filter((card) => card.question);
            return res.json({
                success: true,
                data: {
                    total: validCards.length,
                    cards: validCards
                }
            });
        }

        if (action === "summary" && req.method === "GET") {
            const subjectId = typeof query.subjectId === "string" ? query.subjectId : undefined;
            const matchQuery = { userId };
            if (subjectId) matchQuery.subjectId = subjectId;

            const summary = await Progress.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalQuestions: { $sum: 1 },
                        totalAttempts: { $sum: "$attempts" },
                        totalCorrect: { $sum: "$correctAttempts" },
                        totalIncorrect: { $sum: "$incorrectAttempts" },
                        bookmarked: { $sum: { $cond: ["$isBookmarked", 1, 0] } },
                        dueCards: {
                            $sum: {
                                $cond: [
                                    {
                                        $or: [
                                            { $lte: ["$srs.nextReviewDate", new Date()] },
                                            { $eq: ["$srs.nextReviewDate", null] }
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
                                    { $gt: ["$attempts", 0] },
                                    { $divide: ["$correctAttempts", "$attempts"] },
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

            return res.json({ success: true, data: result });
        }

        if (action === "bookmarks" && req.method === "GET") {
            const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
            const limit = Math.max(1, Math.min(100, parseInt(String(query.limit ?? "20"), 10) || 20));

            const bookmarks = await Progress.find({ userId, isBookmarked: true })
                .sort({ updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await Progress.countDocuments({ userId, isBookmarked: true });

            const detailedBookmarks = await Promise.all(bookmarks.map(async (bookmark) => {
                const question = await resolveQuestionByType(bookmark.questionType, bookmark.questionId, questionModels);
                return {
                    progress: bookmark,
                    question: getQuestionPayload(question, bookmark.questionType)
                };
            }));

            return res.json({
                success: true,
                data: {
                    bookmarks: detailedBookmarks.filter((bookmark) => bookmark.question),
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        }

        if (
            isMongoId(action) &&
            VALID_QUESTION_TYPES.has(parts[actionIndex + 1]) &&
            parts[actionIndex + 2] === "bookmark" &&
            req.method === "POST"
        ) {
            const questionId = action;
            const questionType = parts[actionIndex + 1];

            const existing = await Progress.findOne({ userId, questionId, questionType });
            if (!existing) {
                const question = await resolveQuestionByType(questionType, questionId, questionModels);
                if (!question) {
                    return res.status(404).json({ success: false, error: "Question not found" });
                }

                await Progress.create({
                    userId,
                    questionId,
                    questionType,
                    subjectId: toSafeString(question.subjectId),
                    unitId: toSafeString(question.unitId),
                    topic: question.topic || null,
                    isBookmarked: true
                });

                return res.json({ success: true, data: { isBookmarked: true } });
            }

            await existing.toggleBookmark();
            return res.json({ success: true, data: { isBookmarked: existing.isBookmarked } });
        }

        if (
            isMongoId(action) &&
            VALID_QUESTION_TYPES.has(parts[actionIndex + 1]) &&
            parts[actionIndex + 2] === "notes" &&
            req.method === "PUT"
        ) {
            const questionId = action;
            const questionType = parts[actionIndex + 1];
            const notes = typeof body.notes === "string" ? body.notes : "";

            let progress = await Progress.findOne({ userId, questionId, questionType });
            if (!progress) {
                const question = await resolveQuestionByType(questionType, questionId, questionModels);
                if (!question) {
                    return res.status(404).json({ success: false, error: "Question not found" });
                }

                progress = await Progress.create({
                    userId,
                    questionId,
                    questionType,
                    subjectId: toSafeString(question.subjectId),
                    unitId: toSafeString(question.unitId),
                    topic: question.topic || null,
                    notes
                });
            } else {
                await progress.updateNotes(notes);
            }

            return res.json({ success: true, data: { notes: progress.notes } });
        }

        if (
            isMongoId(action) &&
            VALID_QUESTION_TYPES.has(parts[actionIndex + 1]) &&
            !parts[actionIndex + 2] &&
            req.method === "GET"
        ) {
            const questionId = action;
            const questionType = parts[actionIndex + 1];

            const progress = await Progress.findOne({ userId, questionId, questionType });
            return res.json({ success: true, data: progress || null });
        }

        return res.status(404).json({ success: false, error: "Progress endpoint not found" });
    } catch (err) {
        console.error("Progress API Error:", err);
        return res.status(500).json({ success: false, error: "Internal Server Error", message: err.message });
    }
}
