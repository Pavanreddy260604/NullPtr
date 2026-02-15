import { API_BASE_URL } from './api';

// ─── Token Management ───────────────────────────────────────────────────────
const TOKEN_KEY = 'nullptr_token';
const REFRESH_KEY = 'nullptr_refresh_token';

function getToken(): string | null {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function getRefreshToken(): string | null {
    try { return localStorage.getItem(REFRESH_KEY); } catch { return null; }
}

function setTokens(token: string, refreshToken: string) {
    try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(REFRESH_KEY, refreshToken);
    } catch { /* storage blocked */ }
}

function clearTokens() {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
    } catch { /* storage blocked */ }
}

export { getToken, clearTokens };

// ─── Public Fetch Helper (no auth required) ──────────────────────────────────
async function publicFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return response.json();
}

// ─── Types ──────────────────────────────────────────────────────────────────
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar: string | null;
    preferences: {
        theme: string;
        aiProvider: string | null;
        aiModel: string | null;
        notifications: {
            reviewReminders: boolean;
            streakReminders: boolean;
        };
    };
    stats: {
        totalQuestions: number;
        streakDays: number;
        longestStreak: number;
        lastActiveDate: string | null;
    };
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: AuthUser;
        token: string;
        refreshToken: string;
    };
    error?: string;
}

// ─── Authenticated Fetch Helper ─────────────────────────────────────────────
async function authFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Try refresh if token expired
    if (response.status === 401) {
        const body = await response.json().catch(() => ({}));
        if (body.code === 'TOKEN_EXPIRED') {
            const refreshed = await refreshTokens();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${getToken()}`;
                const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers,
                });
                if (!retryResponse.ok) {
                    throw new Error('Request failed after token refresh');
                }
                return retryResponse.json();
            }
        }
        clearTokens();
        throw new Error(body.error || 'Authentication required');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return response.json();
}

// ─── Auth API Functions ─────────────────────────────────────────────────────
// Note: registerUser now returns pending verification state instead of user directly
// Registration requires email verification before tokens are issued
export async function registerUser(
    name: string,
    email: string,
    password: string
): Promise<{ requireVerification: boolean; email: string }> {
    return registerUserPending(name, email, password);
}

export async function loginUser(
    email: string,
    password: string
): Promise<AuthUser> {
    const result = await authFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (result.success && result.data) {
        setTokens(result.data.token, result.data.refreshToken);
        return result.data.user;
    }
    throw new Error(result.error || 'Login failed');
}

export async function verifyEmail(
    email: string,
    otp: string
): Promise<AuthResponse['data']> {
    const result = await authFetch<AuthResponse>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
    });

    if (result.success && result.data) {
        setTokens(result.data.token, result.data.refreshToken);
        return result.data;
    }
    throw new Error(result.error || 'Verification failed');
}

export async function googleLogin(
    credential: string
): Promise<AuthUser> {
    const result = await authFetch<AuthResponse>('/auth/google-login', {
        method: 'POST',
        body: JSON.stringify({ credential }),
    });

    if (result.success && result.data) {
        setTokens(result.data.token, result.data.refreshToken);
        return result.data.user;
    }
    throw new Error(result.error || 'Google login failed');
}

export async function getProfile(): Promise<AuthUser> {
    const result = await authFetch<{ success: boolean; data: { user: AuthUser } }>(
        '/auth/profile'
    );
    if (result.success) return result.data.user;
    throw new Error('Failed to get profile');
}

export async function updateProfile(
    data: { name?: string; avatar?: string }
): Promise<AuthUser> {
    const result = await authFetch<{ success: boolean; data: { user: AuthUser } }>(
        '/auth/profile',
        { method: 'PATCH', body: JSON.stringify(data) }
    );
    if (result.success) return result.data.user;
    throw new Error('Failed to update profile');
}

export async function updatePreferences(
    preferences: Record<string, unknown>
): Promise<void> {
    await authFetch('/auth/preferences', {
        method: 'PATCH',
        body: JSON.stringify(preferences),
    });
}

export async function changePassword(
    currentPassword: string,
    newPassword: string
): Promise<void> {
    await authFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
    });
}

export async function logoutUser(): Promise<void> {
    try {
        await authFetch('/auth/logout', { method: 'POST' });
    } catch { /* ignore logout errors */ }
    clearTokens();
}

async function refreshTokens(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return false;

        const result = await response.json();
        if (result.success && result.data) {
            setTokens(result.data.token, result.data.refreshToken);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

// Re-export authFetch for use by progress/quiz libraries
export { authFetch, publicFetch };

// Registration response type (backend sends OTP, not tokens immediately)
export interface RegisterResponse {
    success: boolean;
    message?: string;
    requireVerification?: boolean;
    email?: string;
    error?: string;
}

// Register user - returns pending state, not user (requires email verification)
export async function registerUserPending(
    name: string,
    email: string,
    password: string
): Promise<{ requireVerification: boolean; email: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json() as RegisterResponse;

    if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
    }

    if (result.success && result.requireVerification) {
        return { requireVerification: true, email: result.email || email };
    }

    throw new Error(result.error || 'Registration failed');
}

// Forgot password - request reset link (public endpoint)
export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return publicFetch<{ success: boolean; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

// Reset password with token (public endpoint)
export async function resetPassword(
    email: string,
    token: string,
    newPassword: string
): Promise<{ success: boolean; message: string }> {
    return publicFetch<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token, newPassword }),
    });
}
