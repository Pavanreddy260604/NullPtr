import express from 'express';
import {
    getQuestionProgress,
    recordAttempt,
    submitReview,
    getDueCards,
    getSummary,
    getBySubject,
    getWeakAreas,
    getActivity,
    toggleBookmark,
    updateNotes,
    getBookmarks,
    syncProgress
} from '../controllers/progressController.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All progress routes require authentication
router.use(authenticate);

// ==================== Spaced Repetition ====================
// IMPORTANT: These specific routes MUST come before parameterized routes like /:questionId/:questionType
// Otherwise Express will match /review/due as /:questionId/:questionType (questionId="review", questionType="due")
router.post('/review', submitReview);
router.get('/review/due', getDueCards);

// ==================== Summary & Analytics ====================
router.get('/summary', getSummary);
router.get('/by-subject', getBySubject);
router.get('/weak-areas', getWeakAreas);
router.get('/activity', getActivity);

// ==================== Bookmarks & Notes ====================
router.get('/bookmarks', getBookmarks);

// ==================== Sync ====================
router.post('/sync', syncProgress);
router.post('/attempt', recordAttempt);

// ==================== Question Progress ====================
// IMPORTANT: Parameterized routes MUST come LAST to avoid intercepting specific routes above
router.get('/:questionId/:questionType', getQuestionProgress);
router.post('/:questionId/:questionType/bookmark', toggleBookmark);
router.put('/:questionId/:questionType/notes', updateNotes);

export default router;