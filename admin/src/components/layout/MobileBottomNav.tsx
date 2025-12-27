import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Layers, HelpCircle, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileBottomNavProps {
    onMenuClick: () => void;
}

const navItems = [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
    { icon: BookOpen, label: "Subjects", path: "/subjects" },
    { icon: Layers, label: "Units", path: "/units" },
    { icon: HelpCircle, label: "Ask", path: "/questions" },
];

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onMenuClick }) => {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-40 safe-bottom">
            <nav className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", isActive && "fill-current/20")} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}

                {/* Menu Button for other actions (Logout, Theme, etc.) */}
                <button
                    onClick={onMenuClick}
                    className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                >
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-[10px] sm:text-xs font-medium">Menu</span>
                </button>
            </nav>
        </div>
    );
};

export default MobileBottomNav;
