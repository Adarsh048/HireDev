import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PlatformBadgeProps {
  platform: string;
  className?: string;
}

const platformStyles: Record<string, string> = {
  linkedin: 'bg-blue-600/10 text-blue-600 border-blue-200 dark:border-blue-900 dark:text-blue-400',
  naukri: 'bg-sky-600/10 text-sky-600 border-sky-200 dark:border-sky-900 dark:text-sky-400',
  indeed: 'bg-indigo-600/10 text-indigo-600 border-indigo-200 dark:border-indigo-900 dark:text-indigo-400',
  internshala: 'bg-cyan-600/10 text-cyan-600 border-cyan-200 dark:border-cyan-900 dark:text-cyan-400',
  foundit: 'bg-purple-600/10 text-purple-600 border-purple-200 dark:border-purple-900 dark:text-purple-400',
  wellfound: 'bg-orange-600/10 text-orange-600 border-orange-200 dark:border-orange-900 dark:text-orange-400',
  workday: 'bg-amber-600/10 text-amber-600 border-amber-200 dark:border-amber-900 dark:text-amber-400',
};

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platform, className }) => {
  const normalized = platform.toLowerCase();
  const style = platformStyles[normalized] || 'bg-muted text-muted-foreground border-border';

  return (
    <Badge variant="outline" className={cn('capitalize font-medium text-xs', style, className)}>
      {platform}
    </Badge>
  );
};

