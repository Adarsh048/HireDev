import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex">
      <Sidebar />
      <section className="flex-1 p-4 md:p-8 max-w-7xl mx-auto overflow-y-auto">
        <Outlet />
      </section>
    </div>
  );
};

