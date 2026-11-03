import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LoadingSpinner: React.FC<{ className?: string; text?: string }> = ({
  className,
  text,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 gap-3', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="text-xs text-muted-foreground">{text}</p>}
    </div>
  );
};

