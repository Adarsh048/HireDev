import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}) => {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {(subtitle || trend) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {trend && <span className="font-medium text-emerald-600 dark:text-emerald-400 mr-1">{trend}</span>}
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

