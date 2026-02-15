import React, { useMemo } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Trophy,
    ArrowLeft,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    Target,
    BarChart3,
    BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Label as ReLabel } from "recharts";

const ResultBlockRenderer = ({ blocks }: { blocks: any[] }) => {
    if (!blocks || !Array.isArray(blocks)) return null;

    return (
        <div className="space-y-3 mt-2">
            {blocks.map((block, i) => {
                switch (block.type) {
                    case 'heading':
                        return <h4 key={i} className="font-bold text-slate-800 dark:text-white mt-4">{block.content}</h4>;
                    case 'subheading':
                        return <h5 key={i} className="font-semibold text-primary mt-3">{block.content}</h5>;
                    case 'list':
                        return (
                            <ul key={i} className="list-disc list-inside space-y-2 ml-2">
                                {block.items?.map((item: string, j: number) => (
                                    <li key={j} className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item}</li>
                                ))}
                            </ul>
                        );
                    case 'code':
                        return (
                            <pre key={i} className="p-4 bg-slate-900 text-slate-100 rounded-2xl overflow-x-auto text-xs font-mono shadow-inner border border-white/5">
                                {block.content}
                            </pre>
                        );
                    case 'callout':
                        return (
                            <div key={i} className="p-4 border-l-4 border-primary bg-primary/5 dark:bg-primary/10 text-sm italic rounded-r-2xl">
                                {block.content}
                            </div>
                        );
                    default:
                        return <p key={i} className="whitespace-pre-line text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{block.content}</p>;
                }
            })}
        </div>
    );
};

export default function QuizResults() {
    const { quizId } = useParams<{ quizId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state?.results;

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5" />
                <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Results Expired</h1>
                <p className="text-muted-foreground mb-8">It seems this session's data is no longer available.</p>
                <Link to="/">
                    <Button className="rounded-2xl px-8 h-12 shadow-lg shadow-primary/20">Return Home</Button>
                </Link>
            </div>
        );
    }

    const { results, questions } = data;

    const chartData = [
        { name: "Correct", value: results.correctAnswers, color: "hsl(var(--primary))" },
        { name: "Remaining", value: results.totalQuestions - results.correctAnswers, color: "rgba(0,0,0,0.05)" }
    ];

    const stats = [
        { label: "Final Score", value: `${results.score} / ${results.maxScore}`, icon: Trophy, color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
        { label: "Accuracy", value: `${results.percentage}%`, icon: Target, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
        { label: "Time", value: `${Math.floor(results.timeTaken / 60)}m ${results.timeTaken % 60}s`, icon: Clock, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    ];

    const renderAnswer = (q: any, isUser: boolean = false) => {
        const value = isUser ? q.userAnswer : q.correctAnswer;

        if (q.questionType === 'mcq') {
            return q.options[value] || (isUser ? "No answer provided" : "");
        }

        if (Array.isArray(value)) {
            return <ResultBlockRenderer blocks={value} />;
        }

        return value || (isUser ? "No answer provided" : "");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden pb-12">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[20%] left-[5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[5%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto max-w-5xl px-4 py-8 relative z-10">
                {/* Header Actions */}
                <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-2)}
                            className="rounded-xl hover:bg-white/50 dark:hover:bg-white/5"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Units
                        </Button>
                    </motion.div>

                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex gap-3 w-full sm:w-auto">
                        <Button variant="outline" onClick={() => window.print()} className="hidden sm:flex rounded-xl border-white/20">
                            Print Summary
                        </Button>
                        <Button onClick={() => navigate(-1)} className="gap-2 rounded-xl flex-1 sm:flex-none shadow-lg shadow-primary/20">
                            <RefreshCw className="w-4 h-4" />
                            Take Another Quiz
                        </Button>
                    </motion.div>
                </header>

                {/* Main Results Dashboard */}
                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="lg:col-span-2"
                    >
                        <Card className="h-full border-none shadow-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="text-center pb-2 pt-10">
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 shadow-inner"
                                >
                                    <Trophy className="w-8 h-8 text-primary" />
                                </motion.div>
                                <CardTitle className="text-4xl font-black tracking-tight mb-2">Performance Insight</CardTitle>
                                <p className="text-slate-500 font-medium">Detailed breakdown of your session metrics</p>
                            </CardHeader>
                            <CardContent className="pb-10 pt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {stats.map((s, i) => (
                                        <motion.div
                                            key={s.label}
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.1 * i }}
                                            className="group p-6 rounded-[2rem] bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/5 transition-all hover:scale-105 hover:bg-white dark:hover:bg-white/10"
                                        >
                                            <div className={cn("inline-flex p-3 rounded-2xl mb-4", s.color)}>
                                                <s.icon className="w-5 h-5" />
                                            </div>
                                            <div className="text-3xl font-black mb-1">{s.value}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="h-full border-none shadow-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] flex flex-col items-center justify-center py-10">
                            <div className="w-full h-[240px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={65}
                                            outerRadius={90}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                            startAngle={90}
                                            endAngle={450}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                            <ReLabel
                                                value={`${results.percentage}%`}
                                                position="center"
                                                className="fill-slate-900 dark:fill-white font-black text-3xl"
                                            />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center mt-4">
                                <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Current Mastery</p>
                                <p className="text-sm font-medium text-slate-500 px-8 mt-2">
                                    You solved {results.correctAnswers} out of {results.totalQuestions} questions correctly.
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Detailed Review Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                            <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center">
                                <BarChart3 className="w-4 h-4" />
                            </span>
                            Curated Question Review
                        </h3>
                    </div>

                    <div className="grid gap-6">
                        {questions.map((q: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.05 * (idx % 5) }}
                            >
                                <Card className={cn(
                                    "border-none shadow-lg transition-transform hover:-translate-y-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-white/20 dark:ring-white/5",
                                    q.isCorrect === true ? "shadow-emerald-500/5 ring-emerald-500/10" :
                                        q.isCorrect === false ? "shadow-red-500/5 ring-red-500/10" : "shadow-slate-500/5"
                                )}>
                                    <CardContent className="p-6 sm:p-8">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-slate-400">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-black text-primary tracking-widest leading-none">
                                                        {q.questionType === 'mcq' && q.originalType === 'descriptive' ? 'Deep Extraction' : q.questionType}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Objective Analysis</span>
                                                </div>
                                            </div>
                                            {q.isCorrect === true ? (
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest shadow-inner">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    VERIFIED CORRECT
                                                </div>
                                            ) : q.isCorrect === false ? (
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-black tracking-widest shadow-inner">
                                                    <XCircle className="w-4 h-4" />
                                                    INCORRECT
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-200/50 dark:bg-white/5 text-slate-400 text-xs font-black tracking-widest italic shadow-inner">
                                                    SKIPPED SESSION
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-lg font-bold mb-8 leading-snug text-slate-900 dark:text-white tracking-tight">
                                            {q.questionText}
                                        </p>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="p-5 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/5 group transition-colors hover:border-primary/20">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-primary transition-colors" />
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Input</div>
                                                </div>
                                                <div className={cn(
                                                    "text-sm font-semibold leading-relaxed",
                                                    q.isCorrect === false ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"
                                                )}>
                                                    {renderAnswer(q, true)}
                                                </div>
                                            </div>

                                            {(q.isCorrect !== true || q.originalType === 'descriptive' || q.questionType === 'descriptive') && (
                                                <div className={cn(
                                                    "p-5 rounded-3xl border transition-colors",
                                                    (q.originalType === 'descriptive' || q.questionType === 'descriptive')
                                                        ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/10"
                                                        : "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20"
                                                )}>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className={cn("w-2 h-2 rounded-full", (q.originalType === 'descriptive' || q.questionType === 'descriptive') ? "bg-slate-300" : "bg-emerald-500")} />
                                                        <div className={cn(
                                                            "text-[10px] font-black uppercase tracking-widest",
                                                            (q.originalType === 'descriptive' || q.questionType === 'descriptive') ? "text-slate-400" : "text-emerald-600 dark:text-emerald-400"
                                                        )}>
                                                            {(q.originalType === 'descriptive' || q.questionType === 'descriptive') ? "Model Reference" : "Reference Key"}
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "text-sm font-semibold leading-relaxed",
                                                        (q.originalType === 'descriptive' || q.questionType === 'descriptive') ? "text-slate-700 dark:text-slate-300" : "text-emerald-700 dark:text-emerald-300"
                                                    )}>
                                                        {renderAnswer(q, false)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bottom Perspective Link */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center pb-20"
                >
                    <Link to="/">
                        <Button variant="link" className="text-slate-400 hover:text-primary font-bold group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Return to Research Dashboard
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}


