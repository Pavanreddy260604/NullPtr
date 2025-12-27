import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Loader2, Play, FileQuestion, PenLine, MessageSquare, Share2 } from "lucide-react";
import { getSubject, getUnitsBySubject, Subject, Unit } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

const SubjectPage = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!subjectId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [subjectData, unitsData] = await Promise.all([
                    getSubject(subjectId),
                    getUnitsBySubject(subjectId)
                ]);
                setSubject(subjectData);
                setUnits(unitsData.sort((a, b) => a.unit - b.unit));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId]);

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
                <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <Link to="/">
                            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="hidden md:flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold">{subject?.name}</span>
                            </div>

                            <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full">
                                <Share2 className="w-5 h-5" />
                            </Button>

                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="py-8 md:py-16 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-transparent">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm mb-4">
                                <BookOpen className="w-4 h-4" />
                                <span>{units.length} Units Available</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-slate-400 dark:bg-clip-text">
                                {subject?.name}
                            </h1>
                            {subject?.description && (
                                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">{subject.description}</p>
                            )}
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
                                <Link key={unit._id} to={`/units/${unit._id}`} className="group">
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
        </div>
    );
};

export default SubjectPage;
