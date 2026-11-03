import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-extrabold tracking-tight text-primary">404</h1>
      <h2 className="text-xl font-bold mt-2">Page Not Found</h2>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        The link you followed does not exist or may have expired.
      </p>
      <Button asChild className="mt-6" size="sm">
        <Link to="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
};

