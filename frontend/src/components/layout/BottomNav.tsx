import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Search, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

const BottomNav = () => {
    const location = useLocation();

    // Only show on mobile
    // Hiding on specific pages if needed? No, always good.

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 safe-bottom">
            <nav className="flex items-center justify-around h-16 px-2">
                <NavLink
                    to="/"
                    className={({ isActive }) => cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {({ isActive }) => (
                        <>
                            <Home className={cn("w-5 h-5", isActive && "fill-current/20")} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">Home</span>
                        </>
                    )}
                </NavLink>

                {/* Placeholder for Search - scrolls to list or opens modal */}
                <button
                    onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })}
                    className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                >
                    <Search className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Browse</span>
                </button>

                {/* Settings / Theme - Just a toggle wrapper for now */}
                <div className="flex flex-col items-center justify-center w-full h-full gap-1">
                    <div className="scale-75">
                        <ThemeToggle />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">Theme</span>
                </div>
            </nav>
        </div>
    );
};

export default BottomNav;
