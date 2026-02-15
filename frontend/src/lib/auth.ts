import { fetchWithApiFallback, safeStorage } from './api';

// ─── Token Management ───────────────────────────────────────────────────────
const TOKEN_KEY = 'nullptr_token';
const REFRESH_KEY = 'nullptr_refresh_token';

function getToken(): string | null {
    return safeStorage.getItem(TOKEN_KEY);
}

function getRefreshToken(): string | null {
    return safeStorage.getItem(REFRESH_KEY);
}

function setTokens(token: string, refreshToken: string) {
    safeStorage.setItem(TOKEN_KEY, token);
    safeStorage.setItem(REFRESH_KEY, refreshToken);
}

function clearTokens() {
    safeStorage.removeItem(TOKEN_KEY);
    safeStorage.removeItem(REFRESH_KEY);
}

export { getToken, clearTokens };

// ─── Public Fetch Helper (no auth required) ──────────────────────────────────
async function publicFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetchWithApiFallback(endpoint, {
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

    const response = await fetchWithApiFallback(endpoint, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        const body = await response.json().catch(() => ({} as any));

        const publicAuthEndpoints = [
            '/auth/login',
            '/auth/register',
            '/auth/verify-email',
            '/auth/google-login',
            '/auth/forgot-password',
            '/auth/reset-password',
            '/auth/refresh',
        ];

        const isPublicAuthRequest = publicAuthEndpoints.some((publicEndpoint) =>
            endpoint.startsWith(publicEndpoint)
        );

        const tokenExpired =
            body.code === 'TOKEN_EXPIRED' ||
            /expired/i.test(body.error || '');

        if (token && !isPublicAuthRequest && tokenExpired) {
            const refreshed = await refreshTokens();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${getToken()}`;
                const retryResponse = await fetchWithApiFallback(endpoint, {
                    ...options,
                    headers,
                });
                if (!retryResponse.ok) {
                    const retryError = await retryResponse.json().catch(() => ({ error: 'Request failed after token refresh' }));
                    throw new Error(retryError.error || `Request failed with status ${retryResponse.status}`);
                }
                return retryResponse.json();
            }
        }

        if (token && !isPublicAuthRequest) {
            clearTokens();
        }

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

export async function resendVerificationOtp(
    email: string
): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithApiFallback('/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    const result = await response.json().catch(() => ({} as { success?: boolean; message?: string; error?: string }));
    if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to resend verification code');
    }

    return {
        success: true,
        message: result.message || 'Verification code resent successfully.',
    };
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
        const response = await fetchWithApiFallback('/auth/refresh', {
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
    const response = await fetchWithApiFallback('/auth/register', {
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
