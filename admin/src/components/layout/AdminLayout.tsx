import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

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
        {/* Mobile Header: Provides Hamburger to OPEN sidebar on mobile */}
        <header className="lg:hidden sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 sm:px-4 safe-top">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="-ml-1 h-9 w-9 sm:h-10 sm:w-10">
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <span className="ml-2 sm:ml-3 font-semibold text-base sm:text-lg">EduAdmin</span>
        </header>

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;