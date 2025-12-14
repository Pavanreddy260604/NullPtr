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
        <header className="lg:hidden sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background/95 backdrop-blur px-4">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="-ml-2">
            <Menu className="h-6 w-6" />
          </Button>
          <span className="ml-3 font-semibold text-lg">EduAdmin</span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;