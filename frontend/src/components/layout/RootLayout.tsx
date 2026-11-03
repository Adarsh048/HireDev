import React from 'react';
import { Outlet } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const RootLayout: React.FC = () => {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <Toaster />
      </div>
    </TooltipProvider>
  );
};

