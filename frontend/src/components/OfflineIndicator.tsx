import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const OfflineIndicator = () => {
    const [status, setStatus] = useState<'none' | 'offline' | 'online'>('none');

    useEffect(() => {
        const handleOnline = () => {
            setStatus('online');
            toast.success("Back online! Syncing data...", {
                icon: <Wifi className="w-4 h-4" />,
            });
            // Hide online banner after 5 seconds
            setTimeout(() => setStatus('none'), 5000);
        };

        const handleOffline = () => {
            setStatus('offline');
            toast.error("You are offline. Using cached mode.", {
                icon: <WifiOff className="w-4 h-4" />,
                duration: 5000,
            });
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (status === 'none') return null;

    const isOffline = status === 'offline';

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 z-50 text-white px-4 py-2 flex items-center justify-center gap-2 animate-in slide-in-from-bottom duration-300 transition-colors",
            isOffline ? "bg-red-600 shadow-[0_-4px_20px_rgba(220,38,38,0.3)]" : "bg-emerald-600 shadow-[0_-4px_20px_rgba(5,150,105,0.3)]"
        )}>
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span className="text-sm font-semibold">
                {isOffline ? "You are currently offline." : "Back Online!"}
            </span>
            <span className="text-xs opacity-90 hidden sm:inline">
                {isOffline
                    ? "Working in cached mode. All progress saved locally."
                    : "Connectivity restored. Systems operational."}
            </span>
        </div>
    );
};
