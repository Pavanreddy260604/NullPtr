import { authFetch } from './auth';

export interface ProgressData {
    _id: string;
    userId: string;
    questionId: string;
    questionType: 'mcq' | 'fillblank' | 'descriptive';
    subjectId: string;
    unitId: string;
    topic: string | null;
    attempts: number;
    correctAttempts: number;
    incorrectAttempts: number;
    lastAttemptCorrect: boolean | null;
    lastAttemptAt: string | null;
    isBookmarked: boolean;
    notes: string;
    srs: {
        easeFactor: number;
        interval: number;
        repetitions: number;
        nextReviewDate: string | null;
        lastReviewRating: number | null;
    };
    averageTimePerAttempt: number;
}

export interface ProgressSummary {
    totalQuestions: number;
    totalAttempts: number;
    totalCorrect: number;
    totalIncorrect: number;
    bookmarked: number;
    dueCards: number;
    averageAccuracy: number;
}

export interface BookmarkItem {
    progress: ProgressData;
    question: {
        _id: string;
        question: string;
        options?: string[]; // For MCQ replies
        correctAnswer: string | number;
        explanation?: string;
        type: string;
        topic: string | null;
    };
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Get progress for a specific question
 */
export async function getQuestionProgress(
    questionId: string,
    questionType: 'mcq' | 'fillblank' | 'descriptive'
): Promise<ProgressData | null> {
    const result = await authFetch<{ success: boolean; data: ProgressData | null }>(
        `/progress/${questionId}/${questionType}`
    );
    return result.data;
}

/**
 * Record an attempt on a question
 */
export async function recordAttempt(data: {
    questionId: string;
    questionType: 'mcq' | 'fillblank' | 'descriptive';
    subjectId: string;
    unitId: string;
    isCorrect: boolean;
    timeSpent: number; // in milliseconds
    userAnswer?: string; // Optional, for analytics only
}): Promise<ProgressData> {
    const result = await authFetch<{ success: boolean; data: ProgressData }>(
        '/progress/attempt',
        {
            method: 'POST',
            body: JSON.stringify(data),
        }
    );
    return result.data;
}

/**
 * Toggle bookmark status
 */
export async function toggleBookmark(
    questionId: string,
    questionType: 'mcq' | 'fillblank' | 'descriptive'
): Promise<{ isBookmarked: boolean }> {
    const result = await authFetch<{ success: boolean; data: { isBookmarked: boolean } }>(
        `/progress/${questionId}/${questionType}/bookmark`,
        { method: 'POST' }
    );
    return result.data;
}

/**
 * Update user notes for a question
 */
export async function updateNotes(
    questionId: string,
    questionType: 'mcq' | 'fillblank' | 'descriptive',
    notes: string
): Promise<{ notes: string }> {
    const result = await authFetch<{ success: boolean; data: { notes: string } }>(
        `/progress/${questionId}/${questionType}/notes`,
        {
            method: 'PUT',
            body: JSON.stringify({ notes }),
        }
    );
    return result.data;
}

/**
 * Get overall progress summary (optional subject filter)
 */
export async function getProgressSummary(subjectId?: string): Promise<ProgressSummary> {
    const query = subjectId ? `?subjectId=${subjectId}` : '';
    const result = await authFetch<{ success: boolean; data: ProgressSummary }>(
        `/progress/summary${query}`
    );
    return result?.data || { totalQuestions: 0, totalAttempts: 0, totalCorrect: 0, totalIncorrect: 0, bookmarked: 0, dueCards: 0, averageAccuracy: 0 };
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

/**
 * Get all bookmarked questions
 */
export async function getBookmarks(page = 1, limit = 20): Promise<{ bookmarks: BookmarkItem[]; pagination: Pagination }> {
    const result = await authFetch<{ success: boolean; data: { bookmarks: BookmarkItem[]; pagination: Pagination } }>(
        `/progress/bookmarks?page=${page}&limit=${limit}`
    );
    return result.data;
}

/**
 * Get all due cards for review
 */
export async function getDueCards(subjectId?: string, limit = 50): Promise<{
    total: number;
    cards: BookmarkItem[];
}> {
    const query = new URLSearchParams();
    if (subjectId) query.append('subjectId', subjectId);
    query.append('limit', limit.toString());

    const result = await authFetch<{ success: boolean; data: { total: number; cards: BookmarkItem[] } }>(
        `/progress/review/due?${query.toString()}`
    );
    return result?.data || { total: 0, cards: [] };
}

/**
 * Submit a Spaced Repetition Review
 * Rating: 0 (Blackout) -> 5 (Perfect)
 */
export async function submitReview(
    questionId: string,
    questionType: 'mcq' | 'fillblank' | 'descriptive',
    rating: number
): Promise<{ success: boolean; data: { nextReviewDate: string; interval: number; easeFactor: number } }> {
    return authFetch('/progress/review', {
        method: 'POST',
        body: JSON.stringify({ questionId, questionType, rating }),
    });
}
