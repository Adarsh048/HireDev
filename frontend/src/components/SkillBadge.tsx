import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  name: string;
  matched?: boolean;
  className?: string;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({ name, matched = true, className }) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-normal gap-1 transition-colors',
        matched
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
        className,
      )}
    >
      {matched ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      <span>{name}</span>
    </Badge>
  );
};

