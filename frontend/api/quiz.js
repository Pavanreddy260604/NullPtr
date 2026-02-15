import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { parseBody } from "./utils/parseBody.js";

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

const quizQuestionSchema = new mongoose.Schema({
    questionId: { type: String, required: true },
    questionType: { type: String, enum: ["mcq", "fillblank", "descriptive"], required: true },
    originalType: { type: String, enum: ["descriptive", null], default: null },
    questionText: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
    userAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
    isCorrect: { type: Boolean, default: null },
    timeSpent: { type: Number, default: 0 },
    points: { type: Number, default: 1 },
    earnedPoints: { type: Number, default: 0 }
});

const quizAttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    config: {
        subjectId: { type: String, default: null },
        unitIds: [{ type: String }],
        questionTypes: [{ type: String, enum: ["mcq", "fillblank", "descriptive"] }],
        totalQuestions: { type: Number, required: true },
        timeLimit: { type: Number, default: null },
        shuffle: { type: Boolean, default: true },
        negativeMarking: { type: Boolean, default: false },
        negativeMarkValue: { type: Number, default: 0.25 },
        difficulty: { type: String, enum: ["easy", "medium", "hard", "mixed"], default: "mixed" }
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
    status: { type: String, enum: ["in_progress", "completed", "abandoned"], default: "in_progress" },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    lastActivityAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

quizAttemptSchema.methods.submitAnswer = function (questionIndex, userAnswer, timeSpent = 0) {
    if (questionIndex < 0 || questionIndex >= this.questions.length) {
        throw new Error("Invalid question index");
    }

    const question = this.questions[questionIndex];
    question.userAnswer = userAnswer;
    question.timeSpent = Number(timeSpent) || 0;
    this.lastActivityAt = new Date();

    let isCorrect = false;

    if (question.questionType === "mcq") {
        const normalizedUserAnswer = typeof userAnswer === "string" ? Number(userAnswer) : userAnswer;
        const normalizedCorrectAnswer = typeof question.correctAnswer === "string"
            ? Number(question.correctAnswer)
            : question.correctAnswer;
        isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    } else if (question.questionType === "fillblank") {
        isCorrect = userAnswer?.toString().toLowerCase().trim() === question.correctAnswer?.toString().toLowerCase().trim();
    } else if (question.questionType === "descriptive") {
        if (typeof question.correctAnswer === "number" && typeof userAnswer === "number") {
            isCorrect = userAnswer === question.correctAnswer;
        } else {
            isCorrect = Boolean(userAnswer);
        }
    }

    question.isCorrect = isCorrect;
    if (isCorrect) {
        question.earnedPoints = question.points;
    } else if (this.config.negativeMarking) {
        question.earnedPoints = -question.points * this.config.negativeMarkValue;
    } else {
        question.earnedPoints = 0;
    }

    return this.save();
};

quizAttemptSchema.methods.completeQuiz = function () {
    this.status = "completed";
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
            results.attemptedQuestions += 1;
            results.timeTaken += question.timeSpent || 0;
            if (question.isCorrect === true) {
                results.correctAnswers += 1;
            } else if (question.isCorrect === false) {
                results.incorrectAnswers += 1;
            }
        } else {
            results.skipped += 1;
        }

        results.score += question.earnedPoints || 0;
    }

    results.score = Math.max(0, results.score);
    results.percentage = results.maxScore > 0
        ? Math.round((results.score / results.maxScore) * 100 * 100) / 100
        : 0;
    results.averageTimePerQuestion = results.attemptedQuestions > 0
        ? Math.round(results.timeTaken / results.attemptedQuestions)
        : 0;

    this.results = results;
    return this.save();
};

const getQuizAttemptModel = () => mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema);
const getMCQModel = () => mongoose.models.MCQ || mongoose.model("MCQ", new mongoose.Schema({}, { strict: false, collection: "mcqs" }));
const getFillBlankModel = () => mongoose.models.FillBlank || mongoose.model("FillBlank", new mongoose.Schema({}, { strict: false, collection: "fillblanks" }));
const getDescriptiveModel = () => mongoose.models.Descriptive || mongoose.model("Descriptive", new mongoose.Schema({}, { strict: false, collection: "descriptives" }));

const parseRequestBody = (body) => {
    return parseBody(body);
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
        const userId = decoded?.userId || decoded?.id || decoded?.sub;
        if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
            return { authenticated: false, error: "Invalid token payload", code: "INVALID_TOKEN_PAYLOAD" };
        }

        return { authenticated: true, user: { ...decoded, userId: String(userId) } };
    } catch (error) {
        if (error?.name === "TokenExpiredError") {
            return { authenticated: false, error: "Token expired", code: "TOKEN_EXPIRED" };
        }
        return { authenticated: false, error: "Invalid token", code: "INVALID_TOKEN" };
    }
};

const asSafeArray = (value) => (Array.isArray(value) ? value : []);

const buildIdCandidates = (value) => {
    const normalized = value === null || value === undefined ? "" : String(value).trim();
    if (!normalized) return [];

    const candidates = [normalized];
    if (mongoose.Types.ObjectId.isValid(normalized)) {
        candidates.push(new mongoose.Types.ObjectId(normalized));
    }
    return candidates;
};

const stringifyBlocks = (blocks) => {
    if (!Array.isArray(blocks) || blocks.length === 0) return "No model answer available";

    const combined = blocks.map((block) => {
        if (block?.type === "list") {
            return Array.isArray(block.items) ? block.items.join(", ") : "";
        }
        return block?.content || "";
    }).join(" ").trim();

    if (!combined) return "No model answer available";
    return combined.length > 150 ? `${combined.slice(0, 150)}...` : combined;
};

const sanitizeQuestionTypes = (questionTypes) => {
    const allowed = ["mcq", "fillblank", "descriptive"];
    const incoming = Array.isArray(questionTypes) ? questionTypes.filter((type) => allowed.includes(type)) : [];
    return incoming.length > 0 ? incoming : ["mcq", "fillblank"];
};

const buildStartResponseQuestions = (questions) => questions.map((question) => ({
    questionId: question.questionId,
    questionType: question.questionType,
    originalType: question.originalType || null,
    questionText: question.questionText,
    options: question.options
}));

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

        const parts = req.url.split("?")[0].split("/").filter(Boolean);
        const quizIndex = parts.indexOf("quiz");
        const actionIndex = quizIndex !== -1 ? quizIndex + 1 : 0;
        const action = parts[actionIndex] || "";

        const body = parseRequestBody(req.body);

        const QuizAttempt = getQuizAttemptModel();
        const MCQ = getMCQModel();
        const FillBlank = getFillBlankModel();
        const Descriptive = getDescriptiveModel();

        if (action === "start" && req.method === "POST") {
            const {
                subjectId,
                unitIds,
                questionTypes,
                totalQuestions,
                timeLimit,
                difficulty,
                shuffle,
                negativeMarking,
                negativeMarkValue
            } = body;

            const requestedTotalQuestions = Math.max(
                1,
                Math.min(100, parseInt(String(totalQuestions ?? "10"), 10) || 10)
            );
            const selectedTypes = sanitizeQuestionTypes(questionTypes);

            const query = {};
            const subjectCandidates = buildIdCandidates(subjectId);
            if (subjectCandidates.length === 1) {
                query.subjectId = subjectCandidates[0];
            } else if (subjectCandidates.length > 1) {
                query.subjectId = { $in: subjectCandidates };
            }

            const safeUnitIds = asSafeArray(unitIds).map((id) => String(id)).filter(Boolean);
            if (safeUnitIds.length > 0) {
                const unitCandidates = safeUnitIds.flatMap((id) => buildIdCandidates(id));
                if (unitCandidates.length > 0) {
                    query.unitId = { $in: unitCandidates };
                }
            }

            let questions = [];

            if (selectedTypes.includes("mcq")) {
                const mcqs = await MCQ.find(query).limit(requestedTotalQuestions);
                questions = questions.concat(mcqs.map((question) => ({
                    questionId: question._id.toString(),
                    questionType: "mcq",
                    originalType: null,
                    questionText: question.question,
                    options: asSafeArray(question.options).map((option) => String(option)),
                    correctAnswer: question.correctAnswer,
                    points: 1
                })));
            }

            if (selectedTypes.includes("fillblank") && questions.length < requestedTotalQuestions) {
                const remaining = requestedTotalQuestions - questions.length;
                const fillBlanks = await FillBlank.find(query).limit(remaining);
                questions = questions.concat(fillBlanks.map((question) => ({
                    questionId: question._id.toString(),
                    questionType: "fillblank",
                    originalType: null,
                    questionText: question.question,
                    correctAnswer: question.correctAnswer,
                    points: 1
                })));
            }

            if (selectedTypes.includes("descriptive") && questions.length < requestedTotalQuestions) {
                const descriptives = await Descriptive.find(query);
                const remaining = requestedTotalQuestions - questions.length;

                const converted = descriptives.slice(0, remaining).map((question) => {
                    const correctOption = stringifyBlocks(question.answer);
                    const distractorsPool = descriptives
                        .filter((candidate) => candidate._id.toString() !== question._id.toString())
                        .map((candidate) => stringifyBlocks(candidate.answer))
                        .filter(Boolean);

                    const distractors = distractorsPool
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 3);

                    while (distractors.length < 3) {
                        distractors.push(`Alternative context ${distractors.length + 1}`);
                    }

                    const options = [correctOption, ...distractors].sort(() => Math.random() - 0.5);
                    const correctIndex = options.indexOf(correctOption);

                    return {
                        questionId: question._id.toString(),
                        questionType: "mcq",
                        originalType: "descriptive",
                        questionText: question.question,
                        options,
                        correctAnswer: correctIndex,
                        points: 2
                    };
                });

                questions = questions.concat(converted);
            }

            if (shuffle !== false) {
                questions = questions.sort(() => Math.random() - 0.5);
            }

            questions = questions.slice(0, requestedTotalQuestions);

            if (questions.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "No questions found for the given criteria"
                });
            }

            const quizAttempt = await QuizAttempt.create({
                userId: auth.user.userId,
                config: {
                    subjectId: subjectId || null,
                    unitIds: safeUnitIds,
                    questionTypes: selectedTypes,
                    totalQuestions: questions.length,
                    timeLimit: timeLimit ?? null,
                    shuffle: shuffle !== false,
                    difficulty: difficulty || "mixed",
                    negativeMarking: Boolean(negativeMarking),
                    negativeMarkValue: Number(negativeMarkValue) > 0 ? Number(negativeMarkValue) : 0.25
                },
                questions,
                results: {
                    totalQuestions: questions.length,
                    maxScore: questions.reduce((acc, question) => acc + question.points, 0)
                }
            });

            return res.status(201).json({
                success: true,
                data: {
                    quizId: quizAttempt._id,
                    questions: buildStartResponseQuestions(quizAttempt.questions),
                    config: quizAttempt.config,
                    startedAt: quizAttempt.startedAt
                }
            });
        }

        if (
            action &&
            mongoose.Types.ObjectId.isValid(action) &&
            req.method === "POST" &&
            parts[actionIndex + 1] === "submit"
        ) {
            const { questionIndex, answer, timeSpent } = body;
            const quizId = action;

            const parsedQuestionIndex = parseInt(String(questionIndex), 10);
            if (Number.isNaN(parsedQuestionIndex)) {
                return res.status(400).json({ success: false, error: "Invalid question index" });
            }

            const quiz = await QuizAttempt.findOne({ _id: quizId, userId: auth.user.userId });
            if (!quiz) {
                return res.status(404).json({ success: false, error: "Quiz not found" });
            }

            if (quiz.status !== "in_progress") {
                return res.status(400).json({ success: false, error: "Quiz is already finished" });
            }

            await quiz.submitAnswer(parsedQuestionIndex, answer, timeSpent);
            return res.json({ success: true, message: "Answer submitted" });
        }

        if (
            action &&
            mongoose.Types.ObjectId.isValid(action) &&
            req.method === "POST" &&
            parts[actionIndex + 1] === "complete"
        ) {
            const quizId = action;
            const quiz = await QuizAttempt.findOne({ _id: quizId, userId: auth.user.userId });
            if (!quiz) {
                return res.status(404).json({ success: false, error: "Quiz not found" });
            }

            await quiz.completeQuiz();
            return res.json({
                success: true,
                data: {
                    results: quiz.results,
                    questions: quiz.questions
                }
            });
        }

        if (action === "history" && req.method === "GET") {
            const history = await QuizAttempt.find({ userId: auth.user.userId })
                .sort({ startedAt: -1 })
                .limit(20);

            return res.json({ success: true, data: history });
        }

        if (action && mongoose.Types.ObjectId.isValid(action) && req.method === "GET") {
            const quizId = action;
            const quiz = await QuizAttempt.findOne({ _id: quizId, userId: auth.user.userId });
            if (!quiz) {
                return res.status(404).json({ success: false, error: "Quiz not found" });
            }

            return res.json({ success: true, data: quiz });
        }

        return res.status(404).json({ success: false, error: "Quiz endpoint not found" });
    } catch (err) {
        console.error("Quiz API Error:", err);
        return res.status(500).json({ success: false, error: "Internal Server Error", message: err.message });
    }
}
