import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Settings as SettingsIcon, Brain, Shield, Bell, Palette, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
    const { user, updatePreferences, updateProfile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Profile State
    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");

    // Preferences State
    const [theme, setTheme] = useState(user?.preferences?.theme || "system");
    const [aiProvider, setAiProvider] = useState(user?.preferences?.aiProvider || "none");
    const [aiApiKey, setAiApiKey] = useState("");
    const [aiModel, setAiModel] = useState(user?.preferences?.aiModel || "");
    const [notifications, setNotifications] = useState({
        reviewReminders: user?.preferences?.notifications?.reviewReminders ?? true,
        streakReminders: user?.preferences?.notifications?.streakReminders ?? true
    });

    useEffect(() => {
        if (user) {
            setName(user.name);
            setAvatar(user.avatar || "");
            setTheme(user.preferences?.theme || "system");
            setAiProvider(user.preferences?.aiProvider || "none");
            setAiModel(user.preferences?.aiModel || "");
            setNotifications({
                reviewReminders: user.preferences?.notifications?.reviewReminders ?? true,
                streakReminders: user.preferences?.notifications?.streakReminders ?? true
            });
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            await updateProfile({ name, avatar });
            toast({ title: "Profile updated successfully" });
        } catch (error: any) {
            toast({ title: "Failed to update profile", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSavePreferences = async () => {
        setLoading(true);
        try {
            const prefs: any = {
                theme,
                aiProvider: aiProvider === "none" ? null : aiProvider,
                aiModel,
                notifications
            };
            if (aiApiKey) prefs.aiApiKey = aiApiKey;

            await updatePreferences(prefs);
            toast({ title: "Settings saved successfully" });
            setAiApiKey(""); // Clear sensitive field after save
        } catch (error: any) {
            toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-4xl py-10 px-4 space-y-8 pb-20">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </motion.div>

            <div className="grid gap-8">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-violet-500" />
                            <CardTitle>Profile</CardTitle>
                        </div>
                        <CardDescription>Update your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="avatar">Avatar URL</Label>
                            <Input
                                id="avatar"
                                value={avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                placeholder="https://example.com/avatar.png"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button onClick={handleSaveProfile} disabled={loading} className="gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>

                {/* Appearance Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5 text-indigo-500" />
                            <CardTitle>Appearance</CardTitle>
                        </div>
                        <CardDescription>Customize how NullPtr looks on your device.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="theme">Theme</Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger id="theme">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Configuration Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-blue-500" />
                            <CardTitle>AI Configuration</CardTitle>
                        </div>
                        <CardDescription>Setup your AI provider for smart explanations and MCQ generation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="provider">AI Provider</Label>
                            <Select value={aiProvider} onValueChange={setAiProvider}>
                                <SelectTrigger id="provider">
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Disabled</SelectItem>
                                    <SelectItem value="ollama">Ollama (Local)</SelectItem>
                                    <SelectItem value="openai">OpenAI</SelectItem>
                                    <SelectItem value="anthropic">Anthropic</SelectItem>
                                    <SelectItem value="google">Google Gemini</SelectItem>
                                    <SelectItem value="groq">Groq</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {aiProvider !== "none" && aiProvider !== "ollama" && (
                            <div className="grid gap-2">
                                <Label htmlFor="apiKey">API Key</Label>
                                <Input
                                    id="apiKey"
                                    type="password"
                                    value={aiApiKey}
                                    onChange={(e) => setAiApiKey(e.target.value)}
                                    placeholder="Enter your API key (stored encrypted)"
                                />
                                <p className="text-[10px] text-muted-foreground">API keys are never transmitted to third parties except for validation.</p>
                            </div>
                        )}

                        {aiProvider !== "none" && (
                            <div className="grid gap-2">
                                <Label htmlFor="model">Model Name</Label>
                                <Input
                                    id="model"
                                    value={aiModel}
                                    onChange={(e) => setAiModel(e.target.value)}
                                    placeholder={aiProvider === "ollama" ? "llama3:8b" : "gpt-4-turbo"}
                                />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button onClick={handleSavePreferences} disabled={loading} className="gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save AI Config
                        </Button>
                    </CardFooter>
                </Card>

                {/* Notifications Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-amber-500" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>Manage how we alert you about your progress.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Review Reminders</Label>
                                <p className="text-xs text-muted-foreground">Get notified when cards are due for review.</p>
                            </div>
                            <Switch
                                checked={notifications.reviewReminders}
                                onCheckedChange={(val) => setNotifications(prev => ({ ...prev, reviewReminders: val }))}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Streak Reminders</Label>
                                <p className="text-xs text-muted-foreground">Get reminded to keep your learning streak alive.</p>
                            </div>
                            <Switch
                                checked={notifications.streakReminders}
                                onCheckedChange={(val) => setNotifications(prev => ({ ...prev, streakReminders: val }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Section */}
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-destructive" />
                            <CardTitle>Security</CardTitle>
                        </div>
                        <CardDescription>Sensitive account actions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full sm:w-auto" asChild>
                            <a href="/change-password">Change Password</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
