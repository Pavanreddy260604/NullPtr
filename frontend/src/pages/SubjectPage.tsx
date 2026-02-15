import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Loader2, Play, FileQuestion, PenLine, MessageSquare, Share2, Zap, Brain } from "lucide-react";
import {
    getSubject,
    getUnitsBySubject,
    getUnit,
    getMCQsByUnit,
    getFillBlanksByUnit,
    getDescriptivesByUnit,
    Subject,
    Unit,
    safeStorage,
    API_BASE_URL
} from "@/lib/api";
import { syncSubject } from "@/lib/sync";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RefreshCw, CloudDownload } from "lucide-react";
import { ProgressSummary } from "@/components/ProgressSummary";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QuizSetupDialog } from "@/components/QuizSetupDialog";

const SubjectPage = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const queryClient = useQueryClient();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);

    // Fetch Subject Details
    const { data: subject, isLoading: subjectLoading, error: subjectError } = useQuery({
        queryKey: ['subject', subjectId],
        queryFn: () => getSubject(subjectId!),
        enabled: !!subjectId,
        staleTime: 0, // Always check version on mount
        refetchOnWindowFocus: true, // Check for updates when coming back to tab
    });

    // Fetch Units list
    const { data: unitsData, isLoading: unitsLoading, error: unitsError } = useQuery({
        queryKey: ['units', subjectId],
        queryFn: async () => {
            const data = await getUnitsBySubject(subjectId!);
            return data.sort((a, b) => a.unit - b.unit);
        },
        enabled: !!subjectId,
    });

    const units = unitsData || [];
    const loading = subjectLoading || unitsLoading;
    const error = (subjectError as Error)?.message || (unitsError as Error)?.message || null;

    // ✅ Force Update Logic: Invalidate cache if version mismatch
    useEffect(() => {
        if (subject && subject.version !== undefined) {
            const storageKey = `subject_v_${subjectId}`;
            const localVersion = safeStorage.getItem(storageKey);

            if (localVersion && parseInt(localVersion) < subject.version) {
                console.log(`🚀 Force Update: Version mismatch (${localVersion} vs ${subject.version}). Invalidating cache...`);

                // Invalidate units list and all unit question data
                queryClient.invalidateQueries({ queryKey: ['units', subjectId] });
                queryClient.invalidateQueries({ queryKey: ['unitData'] });

                toast.info("Content updated from Admin Panel. Refreshing...", {
                    icon: <Zap className="w-4 h-4" />,
                });
            }

            // Sync local version
            safeStorage.setItem(storageKey, subject.version.toString());
        }
    }, [subject, subjectId, queryClient]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: subject?.name || 'NullPtr Subject',
                    text: `Check out ${subject?.name} on NullPtr!`,
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="container mx-auto px-4 py-8">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between mb-8">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    {/* Hero skeleton */}
                    <div className="py-12 mb-8">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <Skeleton className="h-12 w-64 mb-2" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    {/* Units grid skeleton */}
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="p-6 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10">
                                <div className="flex items-start gap-4">
                                    <Skeleton className="w-14 h-14 rounded-2xl" />
                                    <div className="flex-1">
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-8 w-24 ml-auto" />
                                </div>
                            </Card>
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

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors">
            {/* Background Effects - Dark mode only */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none hidden dark:block">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
                    <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-3 py-4 sm:px-4">
                        <Link to="/">
                            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
                            <div className="hidden md:flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold hidden lg:inline">{subject?.name}</span>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                    if (isSyncing) return;
                                    setIsSyncing(true);
                                    const toastId = toast.loading(`Refreshing ${subject?.name}...`);
                                    try {
                                        await syncSubject(queryClient, subjectId!);
                                        toast.success("Content Updated!", { id: toastId });
                                    } catch (e) {
                                        toast.error("Update failed. Check connection.", { id: toastId });
                                    } finally {
                                        setIsSyncing(false);
                                    }
                                }}
                                className={cn("rounded-full", isSyncing && "text-purple-500")}
                                title="Refresh Content"
                                disabled={isSyncing}
                            >
                                <RefreshCw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
                            </Button>

                            <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full">
                                <Share2 className="w-5 h-5" />
                            </Button>

                            <div className="-mr-0.5 ml-1 flex items-center gap-2 border-l border-slate-200 pl-2 dark:border-white/10 sm:mr-0 md:ml-2 md:pl-4">
                                <ThemeToggle />
                                <UserMenu />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="py-8 md:py-16 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-transparent">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm mb-4">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{units.length} Units Available</span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-slate-400 dark:bg-clip-text">
                                    {subject?.name}
                                </h1>
                                {subject?.description && (
                                    <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-6">{subject.description}</p>
                                )}
                                <Button
                                    onClick={() => setIsQuizDialogOpen(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 gap-2"
                                >
                                    <Brain className="w-4 h-4" />
                                    Take a Quiz
                                </Button>
                            </div>

                            <div className="lg:col-span-1 w-full">
                                <ProgressSummary subjectId={subjectId} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Units Grid */}
                <section className="container mx-auto px-4 py-12">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-900 dark:text-white">
                        <Play className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        Available Units
                    </h2>

                    {units.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                            </div>
                            <p className="text-slate-500">No units available yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {units.map((unit, index) => (
                                <Link
                                    key={unit._id}
                                    to={`/units/${unit._id}`}
                                    className="group"
                                    onMouseEnter={() => {
                                        // Prefetch data on hover
                                        queryClient.prefetchQuery({
                                            queryKey: ['unitData', unit._id],
                                            queryFn: async () => {
                                                const [unitData, mcqs, fillBlanks, descriptives] = await Promise.all([
                                                    getUnit(unit._id),
                                                    getMCQsByUnit(unit._id),
                                                    getFillBlanksByUnit(unit._id),
                                                    getDescriptivesByUnit(unit._id)
                                                ]);
                                                return { unit: unitData, mcqs, fillBlanks, descriptives };
                                            },
                                            staleTime: 1000 * 60 * 60 * 2, // 2 hours
                                        });
                                    }}
                                >
                                    <Card className="relative overflow-hidden bg-white dark:bg-white/5 backdrop-blur-md border-slate-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-purple-500/10 active:scale-[0.98]">
                                        {/* Progress-like accent */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="p-6">
                                            <div className="flex items-start gap-4">
                                                {/* Unit Number */}
                                                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 dark:from-purple-500/20 to-pink-100 dark:to-pink-500/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{unit.unit}</span>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                                                        {unit.title}
                                                    </h3>
                                                    {unit.subtitle && (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{unit.subtitle}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Practice Types */}
                                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <FileQuestion className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">MCQs</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <PenLine className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Fill Blanks</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Q&A</span>
                                                </div>
                                                <div className="ml-auto">
                                                    <Button
                                                        size="sm"
                                                        className="h-8 bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30"
                                                    >
                                                        <Play className="w-3 h-3 mr-1" />
                                                        Practice
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <QuizSetupDialog
                open={isQuizDialogOpen}
                onOpenChange={setIsQuizDialogOpen}
                subjectId={subjectId}
                title={subject?.name || "Subject"}
            />
        </div>
    );
};

export default SubjectPage;
