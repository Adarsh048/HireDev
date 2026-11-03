import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck2, ExternalLink, Building2, MapPin, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useApplications, useUpdateApplication } from '@/hooks/useApplications';
import { ApplicationStatus } from '@/types';
import { getSafeExternalUrl } from '@/lib/utils';

const STATUS_COLUMNS: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: 'saved', label: 'Saved / Staged', color: 'border-slate-500/20 bg-slate-500/5' },
  { key: 'applied', label: 'Applied', color: 'border-blue-500/20 bg-blue-500/5' },
  { key: 'interview', label: 'Interviewing', color: 'border-amber-500/20 bg-amber-500/5' },
  { key: 'offered', label: 'Offer Received', color: 'border-emerald-500/20 bg-emerald-500/5' },
  { key: 'rejected', label: 'Archived', color: 'border-rose-500/20 bg-rose-500/5' },
];

export const Applications: React.FC = () => {
  const { data: applications = [], isLoading } = useApplications();
  const updateApp = useUpdateApplication();

  if (isLoading) {
    return <LoadingSpinner text="Loading your application tracker..." />;
  }

  const handleStatusChange = (appId: string, newStatus: string) => {
    updateApp.mutate({ id: appId, updates: { status: newStatus } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Application Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your progress across companies, interviews, and verified India employer portals.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No applications tracked yet"
          description="Click 'Direct Apply' on any verified vacancy to automatically stage it in your tracking board."
          actionText="Browse Recommendations"
          onAction={() => (window.location.href = '/dashboard/jobs')}
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dashboard/jobs/${app.job.id}`}
                      className="font-bold text-base hover:text-primary transition-colors"
                    >
                      {app.job.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Building2 className="h-3.5 w-3.5" /> {app.job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {app.job.location.city || 'India'}
                    </span>
                    {app.appliedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Applied: {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={app.status}
                    onValueChange={(val) => handleStatusChange(app.id, val)}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs capitalize">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saved">Saved</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="offered">Offer</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <a href={getSafeExternalUrl(app.job.applicationUrl)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

