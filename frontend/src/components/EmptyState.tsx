import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed bg-card/40 my-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

