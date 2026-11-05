import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-background py-8 text-sm text-muted-foreground">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="DevLaunch" className="h-full w-full object-contain" />
          </div>
          <span className="font-semibold text-foreground">DevLaunch</span>
          <span>— Autonomous Career Intelligence for Developers</span>
        </div>
        <p className="text-xs">
          Built strictly with genuine, verified India-located job opportunities.
        </p>
      </div>
    </footer>
  );
};

