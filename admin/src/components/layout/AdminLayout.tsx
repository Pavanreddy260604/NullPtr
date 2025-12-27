import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import InstallPWA from '../shared/InstallPWA';

const AdminLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
          }`}
      >
        {/* Mobile Header: Branding only (Burger moved to bottom nav) */}
        <header className="lg:hidden sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-center border-b bg-background/95 backdrop-blur px-4 safe-top">
          <span className="font-mono font-semibold text-lg">
            <span className="text-purple-500">&lt;</span>
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">NullPtr</span>
            <span className="text-purple-500">/&gt;</span>
          </span>
        </header>

        {/* Main Content - Added padding-bottom for mobile nav */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-24 lg:pb-8">
          <div className="mx-auto max-w-7xl w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <MobileBottomNav onMenuClick={() => setMobileOpen(true)} />

      {/* PWA Install Prompt */}
      <InstallPWA />
    </div>
  );
};


export default AdminLayout;