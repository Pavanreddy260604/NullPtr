import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, Loader2, FileQuestion, PenLine, MessageSquare, Sparkles } from "lucide-react";
import { MCQCard } from "@/components/MCQCard";
import { FillBlankCard } from "@/components/FillBlankCard";
import { DescriptiveCard } from "@/components/DescriptiveCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
    getUnit,
    getMCQsByUnit,
    getFillBlanksByUnit,
    getDescriptivesByUnit,
    Unit,
    MCQ,
    FillBlank,
    Descriptive
} from "@/lib/api";

const UnitPage = () => {
    const { unitId } = useParams<{ unitId: string }>();
    const [unit, setUnit] = useState<Unit | null>(null);
    const [mcqs, setMcqs] = useState<MCQ[]>([]);
    const [fillBlanks, setFillBlanks] = useState<FillBlank[]>([]);
    const [descriptives, setDescriptives] = useState<Descriptive[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!unitId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [unitData, mcqData, fbData, descData] = await Promise.all([
                    getUnit(unitId),
                    getMCQsByUnit(unitId),
                    getFillBlanksByUnit(unitId),
                    getDescriptivesByUnit(unitId)
                ]);
                setUnit(unitData);
                setMcqs(mcqData);
                setFillBlanks(fbData);
                setDescriptives(descData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [unitId]);

    const filterQuestions = <T extends { question: string; topic?: string }>(questions: T[]): T[] => {
        if (!searchQuery.trim()) return questions;
        const query = searchQuery.toLowerCase();
        return questions.filter(q =>
            q.question.toLowerCase().includes(query) ||
            q.topic?.toLowerCase().includes(query)
        );
    };

    const filteredMCQs = filterQuestions(mcqs);
    const filteredFillBlanks = filterQuestions(fillBlanks);
    const filteredDescriptives = filterQuestions(descriptives);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header skeleton */}
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        {/* Title skeleton */}
                        <div className="text-center py-8">
                            <Skeleton className="h-8 w-48 mx-auto mb-2" />
                            <Skeleton className="h-10 w-96 mx-auto" />
                        </div>
                        {/* Search skeleton */}
                        <Skeleton className="h-12 w-full rounded-lg" />
                        {/* Tabs skeleton */}
                        <Skeleton className="h-14 w-full rounded-xl" />
                        {/* Question cards skeleton */}
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <Skeleton className="h-6 w-3/4 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <Button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                    Retry
                </Button>
            </div>
        );
    }

    const totalQuestions = mcqs.length + fillBlanks.length + descriptives.length;

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors">
            {/* Background - Only in dark mode */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none dark:block hidden">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <Link to={`/subjects/${unit?.subjectId}`}>
                            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-xs text-slate-500">Unit {unit?.unit}</div>
                                <div className="font-semibold text-sm">{unit?.title}</div>
                            </div>
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="py-12 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-transparent">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm mb-4">
                                <Sparkles className="w-4 h-4" />
                                <span>{totalQuestions} Questions</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:bg-gradient-to-r dark:from-white dark:to-slate-400 dark:bg-clip-text dark:text-transparent">
                                Unit {unit?.unit}: {unit?.title}
                            </h1>
                            {unit?.subtitle && (
                                <p className="text-slate-600 dark:text-slate-400">{unit.subtitle}</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Search */}
                        <div className="mb-8">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search questions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 h-12 bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        {/* Tabs - Improved Visibility */}
                        <Tabs defaultValue="descriptive" className="space-y-8">
                            <TabsList className="w-full h-auto p-1.5 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl grid grid-cols-3 gap-1 shadow-sm">
                                <TabsTrigger
                                    value="descriptive"
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all
                                        text-slate-600 dark:text-slate-400
                                        hover:bg-slate-100 dark:hover:bg-slate-700
                                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 
                                        data-[state=active]:text-white data-[state=active]:shadow-lg"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="hidden sm:inline">Q&A</span>
                                    <span className="bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">{filteredDescriptives.length}</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="mcqs"
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all
                                        text-slate-600 dark:text-slate-400
                                        hover:bg-slate-100 dark:hover:bg-slate-700
                                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 
                                        data-[state=active]:text-white data-[state=active]:shadow-lg"
                                >
                                    <FileQuestion className="w-4 h-4" />
                                    <span className="hidden sm:inline">MCQs</span>
                                    <span className="bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">{filteredMCQs.length}</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="fillblanks"
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all
                                        text-slate-600 dark:text-slate-400
                                        hover:bg-slate-100 dark:hover:bg-slate-700
                                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 
                                        data-[state=active]:text-white data-[state=active]:shadow-lg"
                                >
                                    <PenLine className="w-4 h-4" />
                                    <span className="hidden sm:inline">Fill Blanks</span>
                                    <span className="bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">{filteredFillBlanks.length}</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Descriptive Tab */}
                            <TabsContent value="descriptive" className="space-y-4">
                                {filteredDescriptives.length === 0 ? (
                                    <EmptyState
                                        icon={MessageSquare}
                                        message={searchQuery ? `No questions matching "${searchQuery}"` : "No Q&A questions available"}
                                    />
                                ) : (
                                    filteredDescriptives.map((desc, index) => (
                                        <DescriptiveCard
                                            key={desc._id}
                                            question={{
                                                id: desc._id,
                                                question: desc.question,
                                                answer: desc.answer,
                                                topic: desc.topic
                                            }}
                                            index={index}
                                        />
                                    ))
                                )}
                            </TabsContent>

                            {/* MCQs Tab */}
                            <TabsContent value="mcqs" className="space-y-4">
                                {filteredMCQs.length === 0 ? (
                                    <EmptyState
                                        icon={FileQuestion}
                                        message={searchQuery ? `No questions matching "${searchQuery}"` : "No MCQ questions available"}
                                    />
                                ) : (
                                    filteredMCQs.map((mcq, index) => (
                                        <MCQCard
                                            key={mcq._id}
                                            question={{
                                                id: mcq._id,
                                                question: mcq.question,
                                                options: mcq.options,
                                                correctAnswer: mcq.correctAnswer,
                                                explanation: mcq.explanation,
                                                topic: mcq.topic
                                            }}
                                            index={index}
                                        />
                                    ))
                                )}
                            </TabsContent>

                            {/* Fill Blanks Tab */}
                            <TabsContent value="fillblanks" className="space-y-4">
                                {filteredFillBlanks.length === 0 ? (
                                    <EmptyState
                                        icon={PenLine}
                                        message={searchQuery ? `No questions matching "${searchQuery}"` : "No fill-blank questions available"}
                                    />
                                ) : (
                                    filteredFillBlanks.map((fb, index) => (
                                        <FillBlankCard
                                            key={fb._id}
                                            question={{
                                                id: fb._id,
                                                question: fb.question,
                                                correctAnswer: fb.correctAnswer,
                                                explanation: fb.explanation,
                                                topic: fb.topic
                                            }}
                                            index={index}
                                        />
                                    ))
                                )}
                            </TabsContent>
                        </Tabs>

                        {/* Motivation */}
                        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 dark:from-purple-500/10 dark:via-pink-500/10 dark:to-orange-500/10 border border-purple-200 dark:border-purple-500/20">
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-2xl">💪</span>
                                <p className="text-center font-medium text-purple-700 dark:text-transparent dark:bg-gradient-to-r dark:from-purple-300 dark:to-pink-300 dark:bg-clip-text">
                                    Keep practicing! You're doing amazing!
                                </p>
                                <span className="text-2xl">✨</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

// Empty State Component
const EmptyState = ({ icon: Icon, message }: { icon: any; message: string }) => (
    <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </div>
        <p className="text-slate-500">{message}</p>
    </div>
);

export default UnitPage;
