import React from 'react';
import BottomNav from './BottomNav';

interface MobileLayoutProps {
    children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Main Content */}
            <main className="flex-1 pb-20 md:pb-0">
                {children}
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};

export default MobileLayout;
