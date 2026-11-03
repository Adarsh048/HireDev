import React from 'react';
import { Bookmark, Briefcase } from 'lucide-react';
import { JobCard } from '@/components/JobCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSavedJobs } from '@/hooks/useJobs';

export const SavedJobs: React.FC = () => {
  const { data, isLoading } = useSavedJobs(1, 20);

  const savedList = data?.data?.savedJobs || [];

  if (isLoading) {
    return <LoadingSpinner text="Loading saved opportunities..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Opportunities bookmarked for follow-up and application.
        </p>
      </div>

      {savedList.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Bookmark jobs from your recommendations dashboard to review them here anytime."
          actionText="Browse Recommendations"
          onAction={() => (window.location.href = '/dashboard/jobs')}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedList.map((item) => (
            <JobCard key={item.id} job={item.job} isSaved={true} />
          ))}
        </div>
      )}
    </div>
  );
};

