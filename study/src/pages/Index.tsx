import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, ArrowRight, Sparkles, GraduationCap, Trophy, Zap, Terminal, Github } from "lucide-react";
import { getSubjects, Subject } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

// Typing animation hook
const useTypingEffect = (text: string, speed: number = 100, delay: number = 0) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setDisplayedText("");
        setIsComplete(false);

        const timeout = setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                if (i < text.length) {
                    setDisplayedText(text.slice(0, i + 1));
                    i++;
                } else {
                    setIsComplete(true);
                    clearInterval(interval);
                }
            }, speed);
            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timeout);
    }, [text, speed, delay]);

    return { displayedText, isComplete };
};

const Index = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Animated typing effects
    const { displayedText: nullText, isComplete: nullComplete } = useTypingEffect("Null", 150, 500);
    const { displayedText: ptrText } = useTypingEffect("Ptr", 150, nullComplete ? 0 : 2000);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                const data = await getSubjects();
                setSubjects(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load subjects");
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    const gradients = [
        "from-violet-500 via-purple-500 to-fuchsia-500",
        "from-cyan-500 via-blue-500 to-indigo-500",
        "from-orange-500 via-red-500 to-pink-500",
        "from-emerald-500 via-teal-500 to-cyan-500",
        "from-amber-500 via-orange-500 to-red-500",
    ];

    const stats = [
        { icon: BookOpen, label: "Subjects", value: subjects.length.toString() },
        { icon: Trophy, label: "Practice Modes", value: "3" },
        { icon: Zap, label: "Instant Feedback", value: "✓" },
    ];

    const codeSnippets = [
        "int* ptr = NULL;",
        "if (ptr != nullptr)",
        "delete ptr;",
        "ptr = new int[10];",
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors">
            {/* Theme Toggle */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Animated Background - Dark mode only */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none hidden dark:block">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl" />

                {/* Floating code snippets */}
                {codeSnippets.map((code, i) => (
                    <div
                        key={i}
                        className="absolute font-mono text-xs text-purple-500/20 animate-float"
                        style={{
                            left: `${15 + i * 20}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${4 + i}s`,
                        }}
                    >
                        {code}
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Hero Section */}
                <section className="container mx-auto px-4 py-20 md:py-32">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        {/* Terminal Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-black/50 backdrop-blur-sm border border-slate-700 dark:border-white/20 text-sm font-mono">
                            <Terminal className="w-4 h-4 text-green-500" />
                            <span className="text-green-500">$</span>
                            <span className="text-slate-300">./study --mode=engineer</span>
                            <span className="w-2 h-4 bg-green-500 animate-pulse ml-1"></span>
                        </div>

                        {/* Animated Title */}
                        <div className="relative">
                            <h1 className="text-6xl md:text-8xl font-bold leading-tight font-mono">
                                <span className="text-purple-500 dark:text-purple-400">&lt;</span>
                                <span className="text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 bg-clip-text">
                                    {nullText}
                                </span>
                                <span className="text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text">
                                    {ptrText}
                                </span>
                                <span className="text-purple-500 dark:text-purple-400">/&gt;</span>
                                <span className="inline-block w-1 h-12 md:h-16 bg-purple-500 dark:bg-purple-400 animate-blink ml-2 align-middle"></span>
                            </h1>

                            {/* Decorative asterisk */}
                            <div className="absolute -top-4 -right-4 md:-top-8 md:-right-8 text-6xl md:text-8xl font-bold text-purple-500/20 dark:text-purple-400/20 animate-spin-slow">
                                *
                            </div>
                        </div>

                        {/* Subtitle with code style */}
                        <div className="space-y-2">
                            <p className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-white">
                                Master Your Engineering Subjects
                            </p>
                            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-mono">
                                <span className="text-green-600 dark:text-green-400">// </span>
                                MCQs • Fill Blanks • Q&A
                                <span className="text-purple-600 dark:text-purple-400"> | </span>
                                <span className="text-cyan-600 dark:text-cyan-400">Works Offline!</span>
                            </p>
                        </div>

                        {/* Code Block Style CTA */}
                        <div className="inline-block bg-slate-900 dark:bg-black/50 rounded-lg border border-slate-700 dark:border-white/10 p-4 text-left font-mono text-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-slate-500 text-xs ml-2">main.cpp</span>
                            </div>
                            <code>
                                <span className="text-purple-400">class</span>{" "}
                                <span className="text-cyan-400">Engineer</span>{" "}
                                <span className="text-slate-400">{"{"}</span>
                                <br />
                                <span className="text-slate-500 ml-4">// Built by engineers, for engineers</span>
                                <br />
                                <span className="text-slate-400 ml-4">{"}"}</span>
                                <span className="text-purple-400">;</span>
                            </code>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-4 md:gap-8 pt-8">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-sm">
                                    <stat.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    <div className="text-left">
                                        <div className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                                        <div className="text-xs text-slate-500">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Subjects Grid */}
                <section className="container mx-auto px-4 pb-24">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-center gap-3 mb-12">
                            <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white">
                                Choose Your Subject
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                                </div>
                                <p className="text-slate-500 font-mono">Loading subjects...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 mb-4">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <p className="text-red-600 dark:text-red-400 mb-4 font-mono">// Error: {error}</p>
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : subjects.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 mb-4">
                                    <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                </div>
                                <p className="text-slate-500 font-mono">// No subjects found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {subjects.map((subject, index) => (
                                    <Link
                                        key={subject._id}
                                        to={`/subjects/${subject._id}`}
                                        className="group"
                                    >
                                        <Card className="relative h-full overflow-hidden bg-white dark:bg-white/5 backdrop-blur-md border-slate-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-purple-500/20 hover:-translate-y-2">
                                            {/* Gradient Overlay */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                            <div className="relative p-6 space-y-4">
                                                {/* Icon */}
                                                {subject.thumbnail ? (
                                                    <img
                                                        src={subject.thumbnail}
                                                        alt={subject.name}
                                                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-white/20"
                                                    />
                                                ) : (
                                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center shadow-lg`}>
                                                        <BookOpen className="w-8 h-8 text-white" />
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                                                        {subject.name}
                                                    </h3>
                                                    {subject.description && (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                            {subject.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* CTA */}
                                                <div className="pt-2">
                                                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 font-medium">
                                                        <span>Start Learning</span>
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 dark:border-white/10 py-8 bg-white dark:bg-transparent">
                    <div className="container mx-auto px-4 text-center space-y-4">
                        <p className="font-mono text-slate-500 text-sm">
                            <span className="text-purple-600 dark:text-purple-400">&lt;NullPtr/&gt;</span>
                            <span className="text-slate-400"> // </span>
                            Built by engineers, for engineers 🚀
                        </p>
                        <a
                            href="https://github.com/Pavanreddy260604/study"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-400 dark:hover:border-purple-500/50 transition-all text-sm font-medium"
                        >
                            <Github className="w-4 h-4" />
                            <span>View Source Code</span>
                        </a>
                        <p className="text-xs text-slate-400">
                            Open source • Contribute & improve the project
                        </p>
                    </div>
                </footer>
            </div>

            {/* Custom CSS for animations */}
            <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-20px) rotate(5deg); opacity: 0.4; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-blink { animation: blink 1s infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
        </div>
    );
};

export default Index;
