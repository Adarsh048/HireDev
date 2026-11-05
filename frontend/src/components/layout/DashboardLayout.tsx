import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl mx-auto w-full min-w-0 overflow-y-auto pb-24 md:pb-8">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
};
