import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  const error = useRouteError() as any;
  if (error) {
    console.error('Route error caught:', error);
  }

  const isGenuine404 = !error || error?.status === 404;

  if (error && !isGenuine404) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            {error?.message || 'An unexpected error occurred while loading this view.'}
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Page
          </Button>
          <Button asChild size="sm" className="gap-1.5 bg-[#0A382C] hover:bg-[#065F46] text-white">
            <Link to="/">
              <Home className="h-3.5 w-3.5" /> Go to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-extrabold tracking-tight text-[#0A382C] dark:text-emerald-400">
        404
      </h1>
      <h2 className="text-xl font-bold mt-2">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
        The link you followed does not exist or may have expired.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Button asChild size="sm" className="bg-[#0A382C] hover:bg-[#065F46] text-white">
          <Link to="/">Back to Home</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

