import QuizAttempt from '../models/QuizAttempt.js';
import MCQ from '../models/MCQ.js';
import FillBlank from '../models/FillBlank.js';
import Descriptive from '../models/Descriptive.js';
import mongoose from 'mongoose';

/**
 * Start a new quiz attempt
 * POST /api/quiz/start
 */
export const startQuiz = async (req, res) => {
    try {
        const { subjectId, unitIds, questionTypes, totalQuestions, timeLimit, difficulty, shuffle } = req.body;
        const userId = req.user.userId;

        const buildIdCandidates = (value) => {
            const normalized = value === null || value === undefined ? '' : String(value).trim();
            if (!normalized) return [];
            const candidates = [normalized];
            if (mongoose.Types.ObjectId.isValid(normalized)) {
                candidates.push(new mongoose.Types.ObjectId(normalized));
            }
            return candidates;
        };

        // Build query for questions
        const query = {};
        const subjectCandidates = buildIdCandidates(subjectId);
        if (subjectCandidates.length === 1) {
            query.subjectId = subjectCandidates[0];
        } else if (subjectCandidates.length > 1) {
            query.subjectId = { $in: subjectCandidates };
        }

        if (unitIds && unitIds.length > 0) {
            const unitCandidates = unitIds.flatMap((id) => buildIdCandidates(id));
            if (unitCandidates.length > 0) {
                query.unitId = { $in: unitCandidates };
            }
        }
        // Note: difficulty filtering depends on model support. Check if field exists.

        // Fetch questions from different collections
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

            // Helper to stringify blocks
            const stringifyBlocks = (blocks) => {
                return blocks.map(b => {
                    if (b.type === 'list') return b.items.join(', ');
                    return b.content || '';
                }).join(' ').slice(0, 150) + (blocks.length > 1 || (blocks[0]?.content?.length > 150) ? '...' : '');
            };

            const convertedDescs = descs.slice(0, totalQuestions - questions.length).map((q, idx) => {
                const correctOption = stringifyBlocks(q.answer);

                // Get distractors from other descriptive questions
                const otherAnswers = descs
                    .filter(d => d._id.toString() !== q._id.toString())
                    .map(d => stringifyBlocks(d.answer));

                // Shuffle other answers and take 3
                const distractors = otherAnswers
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3);

                // If not enough distractors, add some generic ones or repeat (edge case)
                while (distractors.length < 3) {
                    distractors.push(`Alternative context ${distractors.length + 1}`);
                }

                const options = [correctOption, ...distractors].sort(() => Math.random() - 0.5);
                const correctIndex = options.indexOf(correctOption);

                return {
                    questionId: q._id.toString(),
                    questionType: 'mcq', // Frontend treats it as MCQ
                    originalType: 'descriptive',
                    questionText: q.question,
                    options: options,
                    correctAnswer: correctIndex,
                    points: 2
                };
            });

            questions = questions.concat(convertedDescs);
        }

        // Shuffle if requested
        if (shuffle !== false) {
            questions = questions.sort(() => Math.random() - 0.5);
        }

        // Limit to requested count
        questions = questions.slice(0, totalQuestions);

        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No questions found for the given criteria'
            });
        }

        // Create QuizAttempt
        const quizAttempt = await QuizAttempt.create({
            userId,
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

    } catch (error) {
        console.error('Start quiz error:', error);
        res.status(500).json({ success: false, error: 'Failed to start quiz' });
    }
};

/**
 * Submit an answer for a specific question
 * POST /api/quiz/:quizId/submit
 */
export const submitAnswer = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { questionIndex, answer, timeSpent } = req.body;
        const userId = req.user.userId;

        const quiz = await QuizAttempt.findOne({ _id: quizId, userId });
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        if (quiz.status !== 'in_progress') {
            return res.status(400).json({ success: false, error: 'Quiz is already finished' });
        }

        await quiz.submitAnswer(questionIndex, answer, timeSpent);

        res.json({ success: true, message: 'Answer submitted' });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ success: false, error: 'Failed to submit answer' });
    }
};

/**
 * Complete the quiz
 * POST /api/quiz/:quizId/complete
 */
export const completeQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.userId;

        const quiz = await QuizAttempt.findOne({ _id: quizId, userId });
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
    } catch (error) {
        console.error('Complete quiz error:', error);
        res.status(500).json({ success: false, error: 'Failed to complete quiz' });
    }
};

/**
 * Get quiz history/stats for user
 * GET /api/quiz/history
 */
export const getQuizHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const history = await QuizAttempt.find({ userId })
            .sort({ startedAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch history' });
    }
};

/**
 * Get a specific quiz attempt
 * GET /api/quiz/:quizId
 */
export const getQuizAttempt = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.userId;

        const quiz = await QuizAttempt.findOne({ _id: quizId, userId });
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        res.json({
            success: true,
            data: quiz
        });
    } catch (error) {
        console.error('Get attempt error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch attempt' });
    }
};
