import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, FileQuestion, PenLine, MessageSquare, Sparkles, Share2, Zap } from "lucide-react";
import { MCQCard } from "@/components/MCQCard";
import { FillBlankCard } from "@/components/FillBlankCard";
import { DescriptiveCard } from "@/components/DescriptiveCard";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    getUnit,
    getMCQsByUnit,
    getFillBlanksByUnit,
    getDescriptivesByUnit,
    getSubject,
    safeStorage,
} from "@/lib/api";
import { generateUnitPDF } from "@/lib/pdfGen";
import { FileDown, Brain } from "lucide-react";
import { QuizSetupDialog } from "@/components/QuizSetupDialog";

const UnitPage = () => {
    const { unitId } = useParams<{ unitId: string }>();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['unitData', unitId],
        queryFn: async () => {
            if (!unitId) throw new Error("Unit ID is required");
            const [unit, mcqs, fillBlanks, descriptives] = await Promise.all([
                getUnit(unitId),
                getMCQsByUnit(unitId),
                getFillBlanksByUnit(unitId),
                getDescriptivesByUnit(unitId)
            ]);
            return { unit, mcqs, fillBlanks, descriptives };
        },
        enabled: !!unitId,
        staleTime: 1000 * 60 * 60 * 2, // 2 hours - Data stays fresh
        gcTime: 1000 * 60 * 60 * 24, // 24 hours - Keep in memory
        retry: 3,
    });

    const unit = data?.unit || null;
    const subjectId = unit?.subjectId;

    // ✅ Force Update Logic: Monitor subject version in background
    const { data: subject } = useQuery({
        queryKey: ['subject', subjectId],
        queryFn: () => getSubject(subjectId!),
        enabled: !!subjectId,
        staleTime: 0,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (subject && subject.version !== undefined && subjectId) {
            const storageKey = `subject_v_${subjectId}`;
            const localVersion = safeStorage.getItem(storageKey);

            if (localVersion && parseInt(localVersion) < subject.version) {
                console.log(`🚀 Force Update (UnitView): Version mismatch. Invalidating unitData...`);

                queryClient.invalidateQueries({ queryKey: ['unitData', unitId] });

                toast.info("Content updated. Refreshing questions...", {
                    icon: <Zap className="w-4 h-4" />,
                });
            }
            safeStorage.setItem(storageKey, subject.version.toString());
        }
    }, [subject, subjectId, unitId, queryClient]);

    const mcqs = data?.mcqs || [];
    const fillBlanks = data?.fillBlanks || [];
    const descriptives = data?.descriptives || [];
    const loading = isLoading;

    const handleDownloadPDF = (options: { includeAnswers: boolean, includeExplanations: boolean, sections: { mcqs: boolean, fbs: boolean, descs: boolean } }) => {
        if (!unit || !subject) {
            toast.error("Data not ready for export");
            return;
        }

        try {
            toast.promise(async () => {
                generateUnitPDF({
                    title: unit.title,
                    unit: unit.unit,
                    subjectName: subject.name,
                    mcqs: options.sections.mcqs ? mcqs.map(m => ({ ...m, type: 'mcq' })) : [],
                    fillBlanks: options.sections.fbs ? fillBlanks.map(f => ({ ...f, type: 'fb' })) : [],
                    descriptives: options.sections.descs ? descriptives.map(d => ({ ...d, type: 'desc' })) : [],
                    options: {
                        includeAnswers: options.includeAnswers,
                        includeExplanations: options.includeExplanations
                    }
                });
            }, {
                loading: 'Preparing PDF Study Guide...',
                success: 'Study Guide generated successfully!',
                error: 'Failed to generate PDF',
            });
        } catch (e) {
            console.error(e);
            toast.error("An unexpected error occurred during PDF generation.");
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: unit?.title || 'NullPtr Unit',
                    text: `Practice ${unit?.title} on NullPtr!`,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled or failed
            }
        } else {
            // Fallback
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

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
                    <div className="max-w-7xl mx-auto space-y-6">
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
                <p className="text-red-600 dark:text-red-400">{(error as Error).message || "Failed to load data"}</p>
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
                <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
                    <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-2 sm:px-3 py-3 sm:py-4">
                        <Link to={`/subjects/${unit?.subjectId}`}>
                            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 h-9 w-9 sm:h-10 sm:w-auto p-0 sm:px-3">
                                <ArrowLeft className="w-4 h-4 sm:mr-1.5" />
                                <span className="hidden sm:inline">Back</span>
                            </Button>
                        </Link>
                        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2 md:gap-4">
                            <div className="text-right hidden md:block">
                                <div className="text-xs text-slate-500">Unit {unit?.unit}</div>
                                <div className="font-semibold text-sm">{unit?.title}</div>
                            </div>

                            <PDFExportDialog
                                onExport={handleDownloadPDF}
                                isLoading={isLoading}
                                unitTitle={unit?.title}
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsQuizDialogOpen(true)}
                                className="rounded-full text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 h-9 w-9 sm:h-10 sm:w-10"
                                title="Take Quiz"
                            >
                                <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>

                            <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full h-9 w-9 sm:h-10 sm:w-10">
                                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>

                            <div className="-mr-0.5 ml-0.5 sm:ml-1 flex items-center gap-1.5 sm:gap-2 border-l border-slate-200 pl-1.5 sm:pl-2 dark:border-white/10 sm:mr-0 md:ml-2 md:pl-4">
                                <ThemeToggle />
                                <UserMenu />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="py-4 sm:py-6 md:py-8 lg:py-12 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-transparent">
                    <div className="container mx-auto px-3 sm:px-4">
                        <div className="max-w-7xl mx-auto text-center">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs sm:text-sm mb-3 sm:mb-4">
                                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>{totalQuestions} Questions</span>
                            </div>
                            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2 text-slate-900 dark:bg-gradient-to-r dark:from-white dark:to-slate-400 dark:bg-clip-text dark:text-transparent px-2">
                                Unit {unit?.unit}: {unit?.title}
                            </h1>
                            {unit?.subtitle && (
                                <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">{unit.subtitle}</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="container mx-auto px-2 sm:px-0 sm:px-4 py-4 sm:py-6 md:py-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Search */}
                        <div className="mb-4 sm:mb-6 md:mb-8 px-1 sm:px-0">
                            <div className="relative">
                                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search questions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        {/* Tabs - Improved Visibility */}
                        <Tabs defaultValue="descriptive" className="space-y-4 sm:space-y-6 md:space-y-8">
                            <TabsList className="w-full h-auto p-1 sm:p-1.5 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg sm:rounded-xl grid grid-cols-3 gap-0.5 sm:gap-1 shadow-sm">
                                <TabsTrigger
                                    value="descriptive"
                                    className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md sm:rounded-lg font-medium transition-all text-xs sm:text-sm
                                        text-slate-600 dark:text-slate-400
                                        hover:bg-slate-100 dark:hover:bg-slate-700
                                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 
                                        data-[state=active]:text-white data-[state=active]:shadow-lg"
                                >
                                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Q&A</span>
                                    <span className="bg-white/20 dark:bg-black/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs">{filteredDescriptives.length}</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="mcqs"
                                    className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md sm:rounded-lg font-medium transition-all text-xs sm:text-sm
                                        text-slate-600 dark:text-slate-400
                                        hover:bg-slate-100 dark:hover:bg-slate-700
                                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 
                                        data-[state=active]:text-white data-[state=active]:shadow-lg"
                                >
                                    <FileQuestion className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">MCQs</span>
                                    <span className="bg-white/20 dark:bg-black/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs">{filteredMCQs.length}</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="fillblanks"
                                    className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md sm:rounded-lg font-medium transition-all text-xs sm:text-sm
                                        text-slate-600 dark:text-slate-400
                                        hover:bg-slate-100 dark:hover:bg-slate-700
                                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 
                                        data-[state=active]:text-white data-[state=active]:shadow-lg"
                                >
                                    <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Fill Blanks</span>
                                    <span className="bg-white/20 dark:bg-black/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs">{filteredFillBlanks.length}</span>
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
                                            question={desc}
                                            index={index}
                                            subjectId={unit?.subjectId}
                                            unitId={unit?._id}
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
                                            question={mcq}
                                            index={index}
                                            subjectId={unit?.subjectId}
                                            unitId={unit?._id}
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
                                            question={fb}
                                            index={index}
                                            subjectId={unit?.subjectId}
                                            unitId={unit?._id}
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

            <QuizSetupDialog
                open={isQuizDialogOpen}
                onOpenChange={setIsQuizDialogOpen}
                subjectId={subjectId}
                unitId={unitId}
                title={unit?.title || "Unit"}
            />
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

// PDF Export Dialog Component
const PDFExportDialog = ({ onExport, isLoading, unitTitle }: { onExport: any, isLoading: boolean, unitTitle?: string }) => {
    const [includeAnswers, setIncludeAnswers] = useState(true);
    const [includeExplanations, setIncludeExplanations] = useState(true);
    const [sections, setSections] = useState({
        mcqs: true,
        fbs: true,
        descs: true
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20" title="Download PDF">
                    <FileDown className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Export Study Guide
                    </DialogTitle>
                    <DialogDescription>
                        Customize your PDF guide for "{unitTitle}".
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Sections */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Include Sections</h4>
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="mcqs" className="cursor-pointer">Multiple Choice Questions</Label>
                                <Switch id="mcqs" checked={sections.mcqs} onCheckedChange={(v) => setSections(s => ({ ...s, mcqs: v }))} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="fbs" className="cursor-pointer">Fill in the Blanks</Label>
                                <Switch id="fbs" checked={sections.fbs} onCheckedChange={(v) => setSections(s => ({ ...s, fbs: v }))} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="descs" className="cursor-pointer">Descriptive Q&A</Label>
                                <Switch id="descs" checked={sections.descs} onCheckedChange={(v) => setSections(s => ({ ...s, descs: v }))} />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-white/10" />

                    {/* Options */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Options</h4>
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="answers">Include Answer Key</Label>
                                    <p className="text-[10px] text-slate-500">Show correct options/answers in the guide</p>
                                </div>
                                <Switch id="answers" checked={includeAnswers} onCheckedChange={setIncludeAnswers} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="explanations">Include Diagrams & Notes</Label>
                                    <p className="text-[10px] text-slate-500">Add detailed explanations where available</p>
                                </div>
                                <Switch id="explanations" checked={includeExplanations} onCheckedChange={setIncludeExplanations} />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between items-center">
                    <div className="text-[10px] font-mono text-slate-400 hidden sm:block">
                        FORMAT: PDF / SYNC: LIVE
                    </div>
                    <Button
                        onClick={() => onExport({ includeAnswers, includeExplanations, sections })}
                        disabled={isLoading || (!sections.mcqs && !sections.fbs && !sections.descs)}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none shadow-lg shadow-purple-500/20"
                    >
                        Generate PDF Guide
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UnitPage;
