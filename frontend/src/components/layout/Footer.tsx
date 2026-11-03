import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-background py-8 text-sm text-muted-foreground">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">NexHire AI</span>
          <span>— India's Autonomous Career Intelligence Platform</span>
        </div>
        <p className="text-xs">
          Built strictly with genuine, verified India-located job opportunities.
        </p>
      </div>
    </footer>
  );
};

