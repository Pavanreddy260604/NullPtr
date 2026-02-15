import { authFetch } from './auth';

export interface QuizConfig {
    subjectId?: string;
    unitIds?: string[];
    questionTypes?: string[];
    totalQuestions: number;
    timeLimit?: number; // seconds
    shuffle?: boolean;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    negativeMarking?: boolean;
}

export interface QuizQuestion {
    questionId: string;
    questionType: 'mcq' | 'fillblank' | 'descriptive';
    questionText: string;
    options?: string[]; // For MCQs
}

export interface QuizAttemptResponse {
    quizId: string;
    questions: QuizQuestion[];
    config: QuizConfig;
    startedAt: string;
}

export interface QuizResults {
    totalQuestions: number;
    attemptedQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skipped: number;
    score: number;
    maxScore: number;
    percentage: number;
    timeTaken: number;
    averageTimePerQuestion: number;
}

/**
 * Start a new quiz
 */
export async function startQuiz(config: QuizConfig): Promise<QuizAttemptResponse> {
    const response = await authFetch<{ success: boolean; data: QuizAttemptResponse }>('/quiz/start', {
        method: 'POST',
        body: JSON.stringify(config)
    });
    return response?.data;
}

/**
 * Submit an answer for a question
 */
export async function submitQuizAnswer(
    quizId: string,
    questionIndex: number,
    answer: any,
    timeSpent: number
): Promise<void> {
    await authFetch(`/quiz/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ questionIndex, answer, timeSpent })
    });
}

/**
 * Complete the quiz and get results
 */
export async function completeQuiz(quizId: string): Promise<{ results: QuizResults; questions: any[] }> {
    const response = await authFetch<{ success: boolean; data: { results: QuizResults; questions: any[] } }>(
        `/quiz/${quizId}/complete`,
        { method: 'POST' }
    );
    return response?.data || { results: {} as QuizResults, questions: [] };
}

/**
 * Get specific quiz attempt
 */
export async function getQuizAttempt(quizId: string): Promise<any> {
    const response = await authFetch<{ success: boolean; data: any }>(`/quiz/${quizId}`);
    return response?.data;
}

/**
 * Get quiz history
 */
export async function getQuizHistory(): Promise<any[]> {
    const response = await authFetch<{ success: boolean; data: any[] }>('/quiz/history');
    return response?.data || [];
}
