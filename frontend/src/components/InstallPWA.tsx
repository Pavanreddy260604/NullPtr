import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const InstallPWA = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            console.log("we are being triggered :D");
            setSupportsPWA(true);
            setPromptInstall(e);
            // Show banner after a short delay
            setTimeout(() => setShowInstallBanner(true), 2000);
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstallClick = (e: any) => {
        e.preventDefault();
        if (!promptInstall) return;

        promptInstall.prompt();
        promptInstall.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                setShowInstallBanner(false);
            } else {
                console.log('User dismissed the install prompt');
            }
        });
    };

    if (!supportsPWA || !showInstallBanner) return null;

    return (
        <div className={cn(
            "fixed bottom-6 left-4 right-4 z-50 md:left-auto md:right-6 md:w-96 transition-all duration-500 ease-in-out transform",
            showInstallBanner ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        )}>
            <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-sm">Install App</h3>
                    <p className="text-xs text-slate-300 mt-1">
                        Add to Home Screen for offline access and better performance.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleInstallClick}
                        className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white border-0"
                    >
                        <Download className="w-3 h-3 mr-1.5" />
                        Install
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setShowInstallBanner(false)}
                        className="h-8 w-8 hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
