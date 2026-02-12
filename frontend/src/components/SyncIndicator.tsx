import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, CloudDownload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface SyncIndicatorProps {
    isSyncing: boolean;
    progress: number;
    status: string;
    isComplete?: boolean;
    isError?: boolean;
}

export const SyncIndicator = ({ isSyncing, progress, status, isComplete, isError }: SyncIndicatorProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isSyncing || isComplete || isError) {
            setIsVisible(true);
            if (isComplete && !isSyncing) {
                const timer = setTimeout(() => setIsVisible(false), 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [isSyncing, isComplete, isError]);

    if (!isVisible && !isSyncing) return null;

    return (
        <div
            className={cn(
                "fixed bottom-6 right-6 z-50 transition-all duration-500 transform translate-y-0",
                !isVisible && "translate-y-20 opacity-0"
            )}
        >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 w-72 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90">
                <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                        "p-2 rounded-xl",
                        isError ? "bg-red-100 text-red-600" :
                            isComplete ? "bg-green-100 text-green-600" :
                                "bg-purple-100 text-purple-600 animate-pulse"
                    )}>
                        {isError ? <AlertCircle className="w-5 h-5" /> :
                            isComplete ? <CheckCircle2 className="w-5 h-5" /> :
                                <CloudDownload className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {isError ? "Sync Failed" :
                                isComplete ? "Sync Complete" :
                                    "Downloading..."}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {status}
                        </p>
                    </div>
                    {isSyncing && (
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-slate-100 dark:bg-white/5" />
                </div>
            </div>
        </div>
    );
};
