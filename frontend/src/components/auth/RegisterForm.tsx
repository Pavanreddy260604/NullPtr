import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { GoogleLogin } from "@react-oauth/google";

export function RegisterForm() {
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const googleEnabled = Boolean(
        (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim() &&
        (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim() !== "YOUR_CLIENT_ID"
    );
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) return;

        if (password !== confirmPassword) {
            toast({ title: "Passwords don't match", variant: "destructive" });
            return;
        }

        if (password.length < 8) {
            toast({ title: "Password must be at least 8 characters", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
            toast({ title: "Account created!", description: "Please verify your email." });
            navigate("/otp", { state: { email } });
        } catch (err: any) {
            toast({
                title: "Registration failed",
                description: err.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        const credential = credentialResponse?.credential;
        if (!credential) {
            toast({ title: "Google Sign-Up failed", description: "No Google credential received", variant: "destructive" });
            return;
        }

        try {
            await googleLogin(credential);
            toast({ title: "Welcome!", description: "Signed up with Google" });
            navigate("/");
        } catch (error) {
            toast({ title: "Google Sign-Up failed", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                        placeholder="Your name"
                    />
                </div>

                <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Email
                    </label>
                    <input
                        id="reg-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Password
                    </label>
                    <input
                        id="reg-password"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                        placeholder="Min 8 characters"
                    />
                </div>

                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Confirm Password
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                        placeholder="Repeat password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-500/25"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Creating account...
                        </span>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            {googleEnabled && (
                <>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-950 px-2 text-slate-500 dark:text-slate-400">Or sign up with</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast({ title: "Google Sign-Up Failed", variant: "destructive" })}
                            theme="filled_black"
                            shape="pill"
                            text="signup_with"
                        />
                    </div>
                </>
            )}
        </div>
    );
}
