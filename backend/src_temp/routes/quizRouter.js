import express from 'express';
import {
    startQuiz,
    submitAnswer,
    completeQuiz,
    getQuizHistory,
    getQuizAttempt
} from '../controllers/quizController.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All quiz routes require authentication
router.use(authenticate);

router.post('/start', startQuiz);
router.post('/:quizId/submit', submitAnswer);
router.post('/:quizId/complete', completeQuiz);
router.get('/history', getQuizHistory);
router.get('/:quizId', getQuizAttempt);

export default router;
