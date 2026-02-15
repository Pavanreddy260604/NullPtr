import { useQuery } from '@tanstack/react-query';
import { getProgressSummary, ProgressSummary as ProgressSummaryType } from '@/lib/progress';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Target, BookOpen, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const ProgressSummary = ({ subjectId, className }: { subjectId?: string, className?: string }) => {
    const { isAuthenticated } = useAuth();

    const { data: summary, isLoading } = useQuery({
        queryKey: ['progressSummary', subjectId],
        queryFn: () => getProgressSummary(subjectId),
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    if (!isAuthenticated) return null;

    if (isLoading) {
        return (
            <Card className={cn("p-6 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10", className)}>
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                </div>
            </Card>
        );
    }

    if (!summary) return null;

    const stats = [
        {
            label: "Questions Attempted",
            value: summary.totalAttempts,
            icon: Target,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            label: "Accuracy",
            value: `${Math.round(summary.averageAccuracy * 100)}%`,
            icon: Trophy,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
        },
        {
            label: "Cards Due",
            value: summary.dueCards,
            icon: Clock,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            label: "Mastered",
            value: summary.totalCorrect,
            icon: Zap,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        }
    ];

    return (
        <Card className={cn("overflow-hidden bg-white dark:bg-white/5 border-slate-200 dark:border-white/10", className)}>
            <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    Your Progress
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col gap-3 transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.bg, stat.color)}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Motivational Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {summary.dueCards > 0
                            ? `You have ${summary.dueCards} cards due for review!`
                            : "All caught up! Great job keeping your streak alive."
                        }
                    </p>
                </div>
            </div>
        </Card>
    );
};
