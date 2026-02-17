import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    AuthUser,
    loginUser,
    registerUserPending,
    verifyEmail as verifyRes,
    googleLogin as googleLoginRes,
    getProfile,
    logoutUser,
    getToken,
    clearTokens,
} from '../lib/auth';

// ─── Context Types ──────────────────────────────────────────────────────────
interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<{ requireVerification: boolean; email: string }>;
    logout: () => Promise<void>;
    verifyEmail: (email: string, otp: string) => Promise<void>;
    googleLogin: (credential: string) => Promise<void>;
    refreshUser: () => Promise<void>;
    updateProfile: (data: { name?: string; avatar?: string }) => Promise<void>;
    updatePreferences: (preferences: Record<string, any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load profile on mount if token exists
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (getToken()) {
                    const profileData = await getProfile();
                    setUser(profileData.user);
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
                clearTokens();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const u = await loginUser(email, password);
            setUser(u);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            // Registration now returns pending verification state, not user
            // User will be set after OTP verification
            return registerUserPending(name, email, password);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verifyEmail = useCallback(async (email: string, otp: string) => {
        setIsLoading(true);
        try {
            const data = await verifyRes(email, otp);
            setUser(data.user);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const googleLogin = useCallback(async (credential: string) => {
        setIsLoading(true);
        try {
            const u = await googleLoginRes(credential);
            setUser(u);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await logoutUser();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const u = await getProfile();
            setUser(u);
        } catch {
            clearTokens();
            setUser(null);
        }
    }, []);

    const updateProfile = useCallback(async (data: { name?: string; avatar?: string }) => {
        const updated = await import('../lib/auth').then(m => m.updateProfile(data));
        setUser(updated);
    }, []);

    const updatePreferences = useCallback(async (preferences: Record<string, any>) => {
        await import('../lib/auth').then(m => m.updatePreferences(preferences));
        await refreshUser();
    }, [refreshUser]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user || !!getToken(),
                login,
                register,
                logout,
                verifyEmail,
                googleLogin,
                refreshUser,
                updateProfile,
                updatePreferences,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
