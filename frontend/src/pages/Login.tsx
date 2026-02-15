import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoginForm } from "@/components/auth/LoginForm";

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
            {/* Theme Toggle Top Right */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        NullPtr
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Welcome back</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-xl p-8 shadow-xl dark:shadow-2xl">
                    <LoginForm />

                    <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 font-medium transition-colors">
                            Create one
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
