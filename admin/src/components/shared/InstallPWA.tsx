import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPWA: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowInstallBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowInstallBanner(false);
    };

    if (!showInstallBanner) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-20 left-4 right-4 z-50 md:bottom-6 md:left-auto md:right-6 md:w-96"
            >
                <div className="bg-primary text-primary-foreground p-4 rounded-xl shadow-xl border border-primary/20 flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm">Install App</h3>
                        <p className="text-xs opacity-90 mt-1">
                            Add to Home Screen for a faster, app-like experience.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleInstallClick}
                            className="h-8 text-xs bg-white text-primary hover:bg-white/90"
                        >
                            <Download className="w-3 h-3 mr-1.5" />
                            Install
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowInstallBanner(false)}
                            className="h-8 w-8 hover:bg-white/10 text-white"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstallPWA;
