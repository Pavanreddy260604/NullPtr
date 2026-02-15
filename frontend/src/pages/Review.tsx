import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    getDueCards,
    submitReview,
    BookmarkItem
} from "@/lib/progress";
import {
    Brain,
    XCircle,
    Clock,
    ArrowLeft,
    Sparkles,
    Eye,
    Star,
    Zap,
    CircleCheck,
    History,
    ChevronRight,
    Trophy
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RATING_LABELS = [
    { value: 0, label: "Forgot", color: "text-red-500", bg: "bg-red-500/10", border: "hover:border-red-500/50", icon: XCircle },
    { value: 1, label: "Rough", color: "text-orange-500", bg: "bg-orange-500/10", border: "hover:border-orange-500/50", icon: Clock },
    { value: 2, label: "Hard", color: "text-fuchsia-500", bg: "bg-fuchsia-500/10", border: "hover:border-fuchsia-500/50", icon: Brain },
    { value: 3, label: "Good", color: "text-cyan-500", bg: "bg-cyan-500/10", border: "hover:border-cyan-500/50", icon: Sparkles },
    { value: 4, label: "Easy", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/50", icon: CircleCheck },
    { value: 5, label: "Perfect", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "hover:border-indigo-500/50", icon: Star },
];

export default function Review() {
    const navigate = useNavigate();
    const [dueCards, setDueCards] = useState<BookmarkItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

    useEffect(() => {
        getDueCards().then(data => {
            if (data && data.cards) {
                setDueCards(data.cards);
            } else {
                setDueCards([]);
            }
            setLoading(false);
        }).catch(err => {
            console.error("❌ [Review] Error loading cards:", err);
            toast.error("Failed to load review cards");
            setLoading(false);
        });
    }, []);

    const handleRate = async (rating: number) => {
        if (!dueCards[currentIndex]) return;

        const card = dueCards[currentIndex];
        try {
            await submitReview(card.question._id, card.progress.questionType, rating);

            if (rating >= 3) {
                setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
            }
            setSessionStats(prev => ({ ...prev, total: prev.total + 1 }));

            if (currentIndex < dueCards.length - 1) {
                setDirection(1);
                setCurrentIndex(prev => prev + 1);
                setShowAnswer(false);
            } else {
                setCompleted(true);
            }
        } catch (err) {
            toast.error("Failed to save review");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500"
                        />
                        <Brain className="w-8 h-8 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-slate-500 font-bold mt-6 tracking-widest uppercase text-[10px]">Cognitive Syncing...</p>
                </div>
            </div>
        );
    }

    if (dueCards.length === 0 && !completed) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
                <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mb-8 shadow-inner">
                    <Zap className="w-12 h-12 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-black mb-3 tracking-tighter">Zero Entropy Detected</h1>
                <p className="text-slate-500 max-w-sm mb-10 leading-relaxed font-medium">
                    Your knowledge graph is fully optimized. No concepts require reinforcement at this time.
                </p>
                <Link to="/">
                    <Button className="h-14 px-10 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold shadow-xl shadow-violet-500/25 transition-all hover:scale-105 active:scale-95">
                        Return to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center overflow-hidden">
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 flex flex-col items-center max-w-lg"
                >
                    <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-violet-500/40">
                        <Trophy className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-4 tracking-tighter">Peak Retention</h1>
                    <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                        Session analyzed. {sessionStats.correct} out of {sessionStats.total} concepts reinforced successfully. Your cognitive network is expanding.
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full mb-10">
                        <div className="p-6 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-sm">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Accuracy</div>
                            <div className="text-2xl font-black text-violet-500">
                                {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
                            </div>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-sm">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Cards</div>
                            <div className="text-2xl font-black text-cyan-500">{sessionStats.total}</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <Link to="/" className="flex-1">
                            <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 dark:border-white/10 font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-all tracking-tight">
                                Back to Base
                            </Button>
                        </Link>
                        <Button
                            onClick={() => window.location.reload()}
                            className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold shadow-xl shadow-violet-500/25 transition-all hover:scale-105 active:scale-95"
                        >
                            Sync More
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const currentCard = dueCards[currentIndex];
    const progress = ((currentIndex + 1) / dueCards.length) * 100;

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95,
            rotate: direction > 0 ? 5 : -5
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                x: { type: "spring" as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.3 }
            }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95,
            transition: {
                x: { type: "spring" as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
        })
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden transition-colors duration-500">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
            </div>

            {/* Header HUD */}
            <header className="sticky top-0 z-30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5">
                <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 md:h-20 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 text-xs sm:text-sm px-2 sm:px-3"
                    >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Abort</span>
                        <span className="sm:hidden">Exit</span>
                    </Button>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-1.5">
                            <History className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-500" />
                            <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-500 tracking-widest">Session</span>
                        </div>
                        <div className="w-20 sm:w-32 md:w-48 h-1 sm:h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-[10px] sm:text-xs font-black text-slate-500 bg-slate-200/50 dark:bg-white/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ring-1 ring-slate-200 dark:ring-white/5">
                            {currentIndex + 1} <span className="text-slate-400">/</span> {dueCards.length}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 container mx-auto px-4 py-8 sm:py-16 max-w-3xl relative z-10 flex flex-col justify-center min-h-0">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="w-full flex-1 flex flex-col items-center"
                    >
                        <Card className="w-full flex-1 flex flex-col border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden ring-1 ring-white/40 dark:ring-white/5 transition-all duration-500 group">
                            {/* Card Header with Question Type */}
                            <div className="relative pt-12 pb-6 px-8 text-center bg-gradient-to-b from-slate-50/50 to-transparent dark:from-white/5 dark:to-transparent">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest mx-auto mb-6 shadow-sm border border-violet-500/10"
                                >
                                    <Brain className="w-3.5 h-3.5" />
                                    {currentCard.progress.questionType} Reinforcement
                                </motion.div>
                                <h2 className="text-2xl sm:text-3xl font-bold px-4 sm:px-10 leading-[1.3] tracking-tight text-slate-900 dark:text-white">
                                    {currentCard.question.question}
                                </h2>

                                {currentCard.question.topic && (
                                    <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Topic: {currentCard.question.topic}
                                    </div>
                                )}
                            </div>

                            {/* Card Content (Answer Area) */}
                            <CardContent className="flex-1 flex flex-col px-8 sm:px-12 pb-12 overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {showAnswer ? (
                                        <motion.div
                                            key="answer"
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-8 flex-1"
                                        >
                                            <div className="p-8 sm:p-10 rounded-[2rem] bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 dark:from-violet-500/10 dark:to-indigo-500/10 border border-violet-500/20 dark:border-white/10 relative overflow-hidden group/ans shadow-inner">
                                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                                    <Sparkles className="w-12 h-12 text-violet-500" />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="text-[11px] font-black text-violet-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                                        Verified Solution
                                                    </div>
                                                    <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed tracking-tight mb-6">
                                                        {currentCard.progress.questionType === 'mcq'
                                                            ? currentCard.question.options?.[currentCard.question.correctAnswer as number]
                                                            : currentCard.question.correctAnswer}
                                                    </div>

                                                    {currentCard.question.explanation && (
                                                        <div className="pt-6 border-t border-violet-500/10">
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Context & Logic</div>
                                                            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                                                                {currentCard.question.explanation}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="placeholder"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex-1 flex flex-col items-center justify-center py-12"
                                        >
                                            <div className="text-slate-400 text-sm font-medium mb-8 text-center max-w-xs animate-pulse">
                                                Visualize the solution in your mind before proceeding.
                                            </div>
                                            <Button
                                                size="lg"
                                                onClick={() => setShowAnswer(true)}
                                                className="h-20 rounded-[2rem] px-12 gap-4 text-xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-[0_20px_40px_-10px_rgba(124,58,237,0.3)] transition-all hover:scale-105 active:scale-95 group"
                                            >
                                                <Eye className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                                Reveal Logic
                                                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Rating HUD */}
                <div className="mt-10 h-28 relative">
                    <AnimatePresence>
                        {showAnswer && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="grid grid-cols-3 sm:grid-cols-6 gap-3"
                            >
                                {RATING_LABELS.map((rating) => (
                                    <Button
                                        key={rating.value}
                                        variant="outline"
                                        onClick={() => handleRate(rating.value)}
                                        className={cn(
                                            "flex flex-col h-24 rounded-3xl border-slate-200 dark:border-white/5 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl transition-all gap-1.5 p-3 group",
                                            rating.bg,
                                            rating.border
                                        )}
                                    >
                                        <rating.icon className={cn("w-6 h-6 mb-1 group-hover:scale-125 transition-all duration-300", rating.color)} />
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{rating.label}</span>
                                            <span className="text-[8px] font-bold text-slate-400 group-hover:text-slate-500">Rating {rating.value}</span>
                                        </div>
                                    </Button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Global Session Info Footer */}
            {!showAnswer && (
                <footer className="p-8 text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"
                    >
                        <Sparkles className="w-4 h-4 text-violet-500" />
                        Self-Assessment Required
                    </motion.div>
                </footer>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(124, 58, 237, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: rgba(124, 58, 237, 0.2);
                }
            `}</style>
        </div>
    );
}
