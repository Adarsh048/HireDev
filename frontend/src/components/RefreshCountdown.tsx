import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRefreshStatus } from '@/hooks/useRefreshStatus';

export const RefreshCountdown: React.FC = () => {
  const { data: status, triggerRefresh, isTriggering } = useRefreshStatus();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!status?.nextRefreshAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(status.nextRefreshAt!).getTime();
      const diff = Math.max(0, target - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [status?.nextRefreshAt]);

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-r from-emerald-500/5 via-card to-teal-500/5 backdrop-blur shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50">
          <RefreshCw className={`h-5 w-5 ${isTriggering ? 'animate-spin' : ''}`} />
        </div>
        <div>
          <h4 className="text-sm font-semibold">24-Hour Opportunity Cycle</h4>
          <p className="text-xs text-muted-foreground">
            Next discovery refresh in:{' '}
            <span className="font-mono font-medium text-foreground">{timeLeft || 'Calculating...'}</span>
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => triggerRefresh()}
        disabled={isTriggering}
        className="text-xs h-8 gap-1.5"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isTriggering ? 'animate-spin' : ''}`} />
        Refresh Now
      </Button>
    </div>
  );
};

