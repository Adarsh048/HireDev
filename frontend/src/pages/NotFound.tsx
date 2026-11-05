import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const NotFound: React.FC = () => {
  const error = useRouteError() as any;
  if (error) {
    console.error('Route error caught:', error);
  }

  const is404 = !error || error?.status === 404 || error?.statusText === 'Not Found';

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-extrabold tracking-tight text-primary">
        {error?.status || '404'}
      </h1>
      <h2 className="text-xl font-bold mt-2">
        {is404 ? 'Page Not Found' : 'Something went wrong'}
      </h2>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        {error?.message || error?.statusText || 'The link you followed does not exist or may have expired.'}
      </p>
      <Button asChild className="mt-6" size="sm">
        <Link to="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
};

