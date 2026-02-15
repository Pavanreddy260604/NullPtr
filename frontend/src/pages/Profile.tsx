import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { updateProfile, changePassword } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Profile() {
    const { user, refreshUser, logout } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [name, setName] = useState(user?.name || "");
    const [saving, setSaving] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    if (!user) {
        navigate("/login");
        return null;
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile({ name });
            await refreshUser();
            toast({ title: "Profile updated!" });
        } catch (err: any) {
            toast({ title: "Failed to update", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            toast({ title: "Password must be at least 8 characters", variant: "destructive" });
            return;
        }
        setChangingPassword(true);
        try {
            await changePassword(currentPassword, newPassword);
            setCurrentPassword("");
            setNewPassword("");
            toast({ title: "Password changed!" });
        } catch (err: any) {
            toast({ title: "Failed", description: err.message, variant: "destructive" });
        } finally {
            setChangingPassword(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => navigate("/")}
                            className="text-sm text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            ← Back
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 text-center shadow-sm">
                        <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{user.stats.totalQuestions}</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">Questions</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 text-center shadow-sm">
                        <div className="text-2xl font-bold text-amber-500 dark:text-amber-400">🔥 {user.stats.streakDays}</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">Day Streak</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 text-center shadow-sm">
                        <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">{user.stats.longestStreak}</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">Best Streak</div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Account</h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                                type="text"
                                disabled
                                value={user.email}
                                className="w-full rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/3 px-4 py-3 text-slate-500 dark:text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-violet-600 px-6 py-2.5 text-white font-medium hover:bg-violet-500 disabled:opacity-50 transition-colors"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Change Password</h2>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={changingPassword || !currentPassword || !newPassword}
                            className="rounded-xl bg-slate-200 dark:bg-white/10 px-6 py-2.5 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-white/15 disabled:opacity-50 transition-colors"
                        >
                            {changingPassword ? "Changing..." : "Change Password"}
                        </button>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
                    <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">Sign out from your account</p>
                    <button
                        onClick={handleLogout}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-2.5 text-red-600 dark:text-red-400 font-medium hover:bg-red-500/20 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
