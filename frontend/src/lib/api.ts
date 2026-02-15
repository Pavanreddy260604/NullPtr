// API Configuration - Uses environment variable for deployment flexibility
const getApiUrl = () => {
    const url = import.meta.env.VITE_API_URL;

    // If VITE_API_URL is explicitly set, use it
    if (url) {
        return url;
    }

    // Otherwise, use relative /api path (works for both localhost and production with Vercel rewrites)
    console.log("🚀 [API] Using same-domain /api");
    return "/api";
};

const rawApiUrl = getApiUrl();
export const API_BASE_URL = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;

console.log(`🌐 [API] Base URL: ${API_BASE_URL}`);

/**
 * ✅ Safe Storage Helper
 * Prevents "Access to storage is not allowed" errors from crashing the app
 * when localStorage is blocked by Privacy/Incognito settings.
 */
export const safeStorage = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn(`[Storage] Failed to get ${key}:`, e);
            return null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn(`[Storage] Failed to set ${key}:`, e);
        }
    },
    removeItem: (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn(`[Storage] Failed to remove ${key}:`, e);
        }
    }
};

/* -------------------------------------------------------------------------- */
/* 🧱 TYPE DEFINITIONS                                                        */
/* -------------------------------------------------------------------------- */
export interface Subject {
    _id: string;
    name: string;
    code: string;
    description: string;
    thumbnail?: string;
    visibility?: 'public' | 'private';
    version?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Unit {
    _id: string;
    subjectId: string;
    unit: number;
    title: string;
    subtitle?: string;
    questionCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface MCQ {
    _id: string;
    subjectId: string;
    unitId: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    topic?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface FillBlank {
    _id: string;
    subjectId: string;
    unitId: string;
    question: string;
    correctAnswer: string;
    explanation?: string;
    topic?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AnswerBlock {
    type: "text" | "heading" | "subheading" | "list" | "code" | "diagram" | "image" | "callout";
    content?: string;
    items?: string[];
    ref?: string;
}

export interface Descriptive {
    _id: string;
    subjectId: string;
    unitId: string;
    question: string;
    answer: AnswerBlock[];
    topic?: string;
    createdAt?: string;
    updatedAt?: string;
}

/* -------------------------------------------------------------------------- */
/* 🔧 HELPER                                                                  */
/* -------------------------------------------------------------------------- */
async function fetchApi<T>(endpoint: string): Promise<T> {
    const token = safeStorage.getItem("second_space_secret");
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["x-second-space-secret"] = token;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        const json = await response.json();
        return json.data ?? json;
    } catch (error: any) {
        // If we're offline and the service worker didn't have a cached response,
        // throw a recognizable error so React Query can serve stale data instead.
        if (!navigator.onLine) {
            const offlineErr = new Error(`Offline: cached data unavailable for ${endpoint}`);
            offlineErr.name = 'OfflineError';
            throw offlineErr;
        }
        throw error;
    }
}

/* -------------------------------------------------------------------------- */
/* 📚 SUBJECT API                                                             */
/* -------------------------------------------------------------------------- */
export async function getSubjects(): Promise<Subject[]> {
    return fetchApi<Subject[]>("/subjects");
}

export async function getSubject(id: string): Promise<Subject> {
    return fetchApi<Subject>(`/subjects/${id}`);
}

/* -------------------------------------------------------------------------- */
/* 📦 UNIT API                                                                */
/* -------------------------------------------------------------------------- */
export async function getUnitsBySubject(subjectId: string): Promise<Unit[]> {
    return fetchApi<Unit[]>(`/units/subject/${subjectId}`);
}

export async function getUnit(id: string): Promise<Unit> {
    return fetchApi<Unit>(`/units/${id}`);
}

/* -------------------------------------------------------------------------- */
/* 🎯 MCQ API                                                                 */
/* -------------------------------------------------------------------------- */
export async function getMCQsByUnit(unitId: string): Promise<MCQ[]> {
    return fetchApi<MCQ[]>(`/mcq/unit/${unitId}`);
}

/* -------------------------------------------------------------------------- */
/* ✏️ FILL BLANK API                                                          */
/* -------------------------------------------------------------------------- */
export async function getFillBlanksByUnit(unitId: string): Promise<FillBlank[]> {
    return fetchApi<FillBlank[]>(`/fillblank/unit/${unitId}`);
}

/* -------------------------------------------------------------------------- */
/* 🧠 DESCRIPTIVE API                                                          */
/* -------------------------------------------------------------------------- */
export async function getDescriptivesByUnit(unitId: string): Promise<Descriptive[]> {
    return fetchApi<Descriptive[]>(`/descriptive/unit/${unitId}`);
}

/* -------------------------------------------------------------------------- */
/* 🔐 AUTH API (Serverless)                                                    */
/* -------------------------------------------------------------------------- */

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'admin';
    avatar?: string;
    preferences?: {
        theme?: 'light' | 'dark' | 'system';
        aiProvider?: string;
        aiModel?: string;
        notifications?: {
            reviewReminders?: boolean;
            streakReminders?: boolean;
        };
    };
    stats?: {
        totalQuestions?: number;
        streakDays?: number;
        longestStreak?: number;
        lastActiveDate?: string;
    };
    createdAt?: string;
    lastLogin?: string;
}

export interface AuthResponse {
    success: boolean;
    data?: {
        user: User;
        token: string;
        refreshToken: string;
    };
    error?: string;
    message?: string;
    requireVerification?: boolean;
    email?: string;
}

export interface RefreshResponse {
    success: boolean;
    data?: {
        token: string;
        refreshToken: string;
    };
    error?: string;
}

// Helper to get stored tokens
const getStoredTokens = () => ({
    token: safeStorage.getItem('auth_token'),
    refreshToken: safeStorage.getItem('refresh_token'),
});

// Helper to store tokens
const storeTokens = (token: string, refreshToken: string) => {
    safeStorage.setItem('auth_token', token);
    safeStorage.setItem('refresh_token', refreshToken);
};

// Helper to clear tokens
export const clearAuthTokens = () => {
    safeStorage.removeItem('auth_token');
    safeStorage.removeItem('refresh_token');
    safeStorage.removeItem('user');
};

// Auth API object
export const authApi = {
    // Register new user
    register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });
        return response.json();
    },

    // Verify email with OTP
    verifyEmail: async (email: string, otp: string): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        const data = await response.json();
        if (data.success && data.data) {
            storeTokens(data.data.token, data.data.refreshToken);
            safeStorage.setItem('user', JSON.stringify(data.data.user));
        }
        return data;
    },

    // Login
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (data.success && data.data) {
            storeTokens(data.data.token, data.data.refreshToken);
            safeStorage.setItem('user', JSON.stringify(data.data.user));
        }
        return data;
    },

    // Google OAuth login
    googleLogin: async (credential: string): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
        });
        const data = await response.json();
        if (data.success && data.data) {
            storeTokens(data.data.token, data.data.refreshToken);
            safeStorage.setItem('user', JSON.stringify(data.data.user));
        }
        return data;
    },

    // Forgot password
    forgotPassword: async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return response.json();
    },

    // Reset password
    resetPassword: async (email: string, token: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token, newPassword }),
        });
        return response.json();
    },

    // Refresh token
    refreshToken: async (): Promise<RefreshResponse> => {
        const { refreshToken } = getStoredTokens();
        if (!refreshToken) {
            return { success: false, error: 'No refresh token' };
        }
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        const data = await response.json();
        if (data.success && data.data) {
            storeTokens(data.data.token, data.data.refreshToken);
        }
        return data;
    },

    // Logout
    logout: async (): Promise<void> => {
        const { token } = getStoredTokens();
        if (token) {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
        }
        clearAuthTokens();
    },

    // Get profile
    getProfile: async (): Promise<{ success: boolean; data?: { user: User }; error?: string }> => {
        const { token } = getStoredTokens();
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success && data.data) {
            safeStorage.setItem('user', JSON.stringify(data.data.user));
        }
        return data;
    },

    // Update profile
    updateProfile: async (updates: { name?: string; avatar?: string }): Promise<{ success: boolean; data?: { user: User }; error?: string }> => {
        const { token } = getStoredTokens();
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        });
        return response.json();
    },

    // Update preferences
    updatePreferences: async (preferences: {
        theme?: 'light' | 'dark' | 'system';
        aiProvider?: string;
        aiApiKey?: string;
        aiModel?: string;
        notifications?: { reviewReminders?: boolean; streakReminders?: boolean };
    }): Promise<{ success: boolean; data?: { preferences: User['preferences'] }; error?: string }> => {
        const { token } = getStoredTokens();
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }
        const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(preferences),
        });
        return response.json();
    },

    // Change password
    changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
        const { token } = getStoredTokens();
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        return response.json();
    },

    // Delete account
    deleteAccount: async (password?: string): Promise<{ success: boolean; message?: string; error?: string }> => {
        const { token } = getStoredTokens();
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }
        const response = await fetch(`${API_BASE_URL}/auth/account`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ password }),
        });
        if (response.ok) {
            clearAuthTokens();
        }
        return response.json();
    },

    // Get stored user (synchronous)
    getStoredUser: (): User | null => {
        const userStr = safeStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },

    // Get stored token (synchronous)
    getStoredToken: (): string | null => {
        return safeStorage.getItem('auth_token');
    },

    // Check if authenticated
    isAuthenticated: (): boolean => {
        return !!safeStorage.getItem('auth_token');
    },
};
