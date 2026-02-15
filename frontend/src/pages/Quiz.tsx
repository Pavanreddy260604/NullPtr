import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Brain,
    Clock,
    ChevronLeft,
    ChevronRight,
    Send,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Flag
} from "lucide-react";
import {
    QuizAttemptResponse,
    QuizQuestion,
    submitQuizAnswer,
    completeQuiz,
    getQuizAttempt
} from "@/lib/quiz";
import { MCQCard } from "@/components/MCQCard";
import { FillBlankCard } from "@/components/FillBlankCard";
import { DescriptiveCard } from "@/components/DescriptiveCard";
import { cn } from "@/lib/utils";

import { motion, AnimatePresence } from "framer-motion";

export default function Quiz() {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [quiz, setQuiz] = useState<QuizAttemptResponse | null>(location.state?.quiz || null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(!quiz);
    const [direction, setDirection] = useState(0);

    // Fetch quiz if not provided in state
    useEffect(() => {
        if (!quiz && quizId) {
            getQuizAttempt(quizId).then(data => {
                setQuiz(data);
                if (data.config.timeLimit) {
                    const elapsed = Math.round((Date.now() - new Date(data.startedAt).getTime()) / 1000);
                    const remaining = Math.max(0, data.config.timeLimit - elapsed);
                    setTimeRemaining(remaining);
                }
                setLoading(false);
            }).catch(err => {
                toast.error("Failed to load quiz");
                navigate("/");
            });
        } else if (quiz) {
            if (quiz.config.timeLimit) {
                setTimeRemaining(quiz.config.timeLimit);
            }
        }
    }, [quizId, quiz, navigate]);

    // Timer logic
    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer);
                    if (prev === 1) handleComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (answer: any) => {
        setAnswers(prev => ({ ...prev, [currentIndex]: answer }));
    };

    const handleNext = () => {
        if (quiz && currentIndex < quiz.questions.length - 1) {
            setDirection(1);
            const question = quiz.questions[currentIndex];
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            submitQuizAnswer(quizId!, currentIndex, answers[currentIndex], timeSpent);

            setCurrentIndex(prev => prev + 1);
            setStartTime(Date.now());
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
            setStartTime(Date.now());
        }
    };

    const handleComplete = async () => {
        if (!quizId || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            await submitQuizAnswer(quizId, currentIndex, answers[currentIndex], timeSpent);

            const results = await completeQuiz(quizId);
            toast.success("Quiz completed!");
            navigate(`/quiz/${quizId}/results`, { state: { results } });
        } catch (error: any) {
            toast.error(error.message || "Failed to complete quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 animate-pulse" />
                <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center animate-bounce">
                        <Brain className="w-10 h-10 text-violet-500" />
                    </div>
                    <p className="text-xl font-medium text-slate-700 dark:text-slate-300 animate-pulse">Preparing your session...</p>
                </div>
            </div>
        );
    }

    if (!quiz) return null;

    const currentQuestion = quiz.questions[currentIndex];
    const progress = ((currentIndex + 1) / quiz.questions.length) * 100;
    const isLastQuestion = currentIndex === quiz.questions.length - 1;

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
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
                opacity: { duration: 0.2 },
                scale: { duration: 0.3 }
            }
        })
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden">
            {/* Animated Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            </div>

            {/* Header / HUD */}
            <header className="sticky top-0 z-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/10 dark:border-white/5">
                <div className="container mx-auto px-4 py-2 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden sm:flex hover:bg-white/20 dark:hover:bg-white/10"
                            onClick={() => {
                                if (window.confirm("Abandon quiz? Progress will not be saved.")) {
                                    navigate(-1);
                                }
                            }}
                        >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Exit
                        </Button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
                        <div className="flex flex-col gap-1.5 min-w-[100px] sm:min-w-[150px]">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Question {currentIndex + 1} / {quiz.questions.length}</span>
                                <span className="text-[10px] sm:text-xs font-bold text-violet-600 dark:text-violet-400">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5 sm:h-2 bg-slate-200/50 dark:bg-white/5" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        {timeRemaining !== null && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={cn(
                                    "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border transition-all duration-300 shadow-sm backdrop-blur-md",
                                    timeRemaining < 60
                                        ? "bg-red-500/10 text-red-600 border-red-500/50 ring-2 ring-red-500/20"
                                        : "bg-white/50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-white/20"
                                )}
                            >
                                <Clock className={cn("w-4 h-4", timeRemaining < 60 && "animate-pulse")} />
                                <span className="font-mono text-sm sm:text-base font-bold tabular-nums">{formatTime(timeRemaining)}</span>
                            </motion.div>
                        )}
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleComplete}
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg sm:rounded-2xl shadow-lg shadow-violet-500/25 px-3 sm:px-4"
                        >
                            <span className="hidden xs:inline">Finish</span>
                            <span className="hidden sm:inline ml-1">Quiz</span>
                            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-12 max-w-3xl relative z-10 flex flex-col min-h-0">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="flex-1 flex flex-col"
                    >
                        <Card className="flex-1 flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-white/5 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden ring-1 ring-white/20 dark:ring-white/5">
                            <CardHeader className="pb-3 sm:pb-8 pt-4 sm:pt-10 px-4 sm:px-10 space-y-3 sm:space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs uppercase font-extrabold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 tracking-widest">
                                            {currentQuestion.questionType === 'mcq' && (currentQuestion as any).originalType === 'descriptive' ? 'Deep Knowledge' : currentQuestion.questionType}
                                        </span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500/40" />
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tighter">Objective Task</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-violet-500/10 text-slate-400 hover:text-violet-500 transition-colors" title="Flag Question">
                                        <Flag className="w-4 h-4" />
                                    </Button>
                                </div>
                                <CardTitle className="text-xl sm:text-3xl font-bold leading-tight text-slate-900 dark:text-white tracking-tight">
                                    {currentQuestion.questionText}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex-1 px-4 sm:px-10 pb-6 sm:pb-10 overflow-y-auto">
                                {currentQuestion.questionType === 'mcq' && (
                                    <div className="grid gap-3 sm:gap-4">
                                        {currentQuestion.options?.map((option, idx) => (
                                            <motion.button
                                                key={idx}
                                                whileHover={{ scale: 1.01, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleAnswerChange(idx)}
                                                className={cn(
                                                    "group relative w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300",
                                                    answers[currentIndex] === idx
                                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 shadow-xl shadow-violet-500/25 text-white"
                                                        : "border-white/50 dark:border-white/5 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:border-violet-500/30 text-slate-700 dark:text-slate-300"
                                                )}
                                            >
                                                <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                                    <div className={cn(
                                                        "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-sm sm:text-lg font-black transition-colors duration-300 shadow-inner",
                                                        answers[currentIndex] === idx
                                                            ? "bg-white/20 text-white"
                                                            : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:bg-violet-500/10 group-hover:text-violet-600"
                                                    )}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className="text-sm sm:text-lg font-semibold leading-snug">{option}</span>
                                                </div>
                                                {/* Selection Indicator Glow */}
                                                {answers[currentIndex] === idx && (
                                                    <motion.div
                                                        layoutId="activeGlow"
                                                        className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl -z-1"
                                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                    />
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {currentQuestion.questionType === 'fillblank' && (
                                    <div className="space-y-6 pt-4">
                                        <div className="group relative p-6 sm:p-8 rounded-3xl bg-white/50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 focus-within:border-cyan-500 focus-within:bg-white dark:focus-within:bg-white/10 transition-all duration-300">
                                            <Label className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest block mb-4">Secure Input Field</Label>
                                            <input
                                                type="text"
                                                className="bg-transparent border-none p-0 focus:ring-0 text-xl sm:text-3xl font-bold w-full placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                                placeholder="Type your answer..."
                                                value={answers[currentIndex] || ""}
                                                onChange={(e) => handleAnswerChange(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-400">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <p className="text-xs sm:text-sm font-medium">
                                                Tip: Exact spelling is recorded for auto-grading.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {currentQuestion.questionType === 'descriptive' && (
                                    <div className="space-y-6 pt-4 flex-1 flex flex-col">
                                        <textarea
                                            className="flex-1 w-full min-h-[300px] p-6 sm:p-10 rounded-3xl bg-white/50 dark:bg-white/5 border-2 border-transparent focus:border-violet-500/20 focus:bg-white dark:focus:bg-white/10 transition-all duration-500 text-lg sm:text-xl font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none shadow-inner"
                                            placeholder="Elaborate your answer here... Use key concepts for better self-evaluation."
                                            value={answers[currentIndex] || ""}
                                            onChange={(e) => handleAnswerChange(e.target.value)}
                                        />
                                        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-violet-500/5 border border-violet-500/10">
                                            <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                            <p className="text-xs sm:text-sm font-medium text-violet-600/80 dark:text-violet-400/80">
                                                Self-reflection mode enabled. Your detailed response will be saved for review.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Bottom Navigation HUD */}
                <div className="relative z-20 mt-8 pb-10 sm:pb-0">
                    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-2 rounded-3xl flex items-center justify-between shadow-xl">
                        <Button
                            variant="ghost"
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="h-10 sm:h-14 px-3 sm:px-6 rounded-xl sm:rounded-2xl hover:bg-violet-500/10 text-slate-600 dark:text-slate-400 disabled:opacity-30 transition-all font-bold group"
                        >
                            <ChevronLeft className="w-5 h-5 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>

                        <div className="flex gap-2.5 px-4 hidden sm:flex">
                            {quiz.questions.map((_, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.2 }}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cn(
                                        "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                        currentIndex === idx ? "bg-violet-600 w-8" :
                                            answers[idx] !== undefined ? "bg-violet-400" : "bg-slate-300 dark:bg-white/10"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Mobile Micro Nav */}
                        <div className="sm:hidden text-sm font-bold text-slate-500 tracking-widest px-4">
                            {currentIndex + 1} / {quiz.questions.length}
                        </div>

                        {isLastQuestion ? (
                            <Button
                                onClick={handleComplete}
                                disabled={isSubmitting}
                                className="h-10 sm:h-14 px-4 sm:px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl sm:rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 font-bold"
                            >
                                <span className="hidden sm:inline">Finish</span>
                                <Send className="w-5 h-5 sm:ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                className="h-10 sm:h-14 px-4 sm:px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl shadow-xl shadow-violet-500/25 transition-all hover:scale-105 active:scale-95 font-bold group"
                            >
                                <span className="hidden sm:inline">Continue</span>
                                <ChevronRight className="w-5 h-5 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        )}
                    </div>
                </div>
            </main>

            {/* Global Animation Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}} />
        </div>
    );
}


