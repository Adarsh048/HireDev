import React from 'react';
import { cn } from '@/lib/utils';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({ score, size = 'md' }) => {
  const getColors = (val: number) => {
    if (val >= 80) return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400';
    if (val >= 60) return 'text-amber-600 bg-amber-500/10 border-amber-500/30 dark:text-amber-400';
    return 'text-rose-600 bg-rose-500/10 border-rose-500/30 dark:text-rose-400';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm font-semibold px-2.5 py-1',
    lg: 'text-base font-bold px-3 py-1.5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border shadow-sm font-mono',
        getColors(score),
        sizeClasses[size],
      )}
    >
      <span>{score}%</span>
      <span className="text-[10px] uppercase font-sans tracking-wider opacity-80">Match</span>
    </div>
  );
};

