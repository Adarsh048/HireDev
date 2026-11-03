import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Flame,
  CheckCircle,
  Building2,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { RefreshCountdown } from '@/components/RefreshCountdown';
import { JobCard } from '@/components/JobCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRecommendedJobs } from '@/hooks/useJobs';
import { useProfile } from '@/hooks/useResume';

export const Dashboard: React.FC = () => {
  const { data: recData, isLoading: recLoading } = useRecommendedJobs(1, 6);
  const { data: profile, isLoading: profileLoading } = useProfile();

  const recommendations = recData?.data?.recommendations || [];
  const total = recData?.pagination?.total || 0;

  const topMatch = recommendations.length > 0 ? recommendations[0].matchScore : 0;

  if (profileLoading || recLoading) {
    return <LoadingSpinner text="Loading career intelligence..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here are your ranked India opportunities and 24-hour discovery cycle.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild size="sm">
            <Link to="/upload" className="gap-1.5">
              <Upload className="h-4 w-4" /> Update Resume
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/dashboard/jobs" className="gap-1.5">
              View All Ranked <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Countdown Card */}
      <RefreshCountdown />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Matching Opportunities"
          value={total}
          subtitle="Filtered for India"
          icon={Briefcase}
        />
        <StatsCard
          title="Highest Match Score"
          value={`${topMatch}%`}
          subtitle="Hybrid AI relevance"
          icon={Flame}
        />
        <StatsCard
          title="Active Platforms"
          value="7"
          subtitle="LinkedIn, Naukri, Foundit..."
          icon={Building2}
        />
        <StatsCard
          title="Mandatory Checks"
          value="100%"
          subtitle="Eligibility pre-validated"
          icon={CheckCircle}
        />
      </div>

      {/* Recent High Match Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Top Ranked Opportunities</h2>
            <p className="text-xs text-muted-foreground">
              Highest scoring jobs across verified India feeds
            </p>
          </div>
          {recommendations.length > 0 && (
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link to="/dashboard/jobs">
                See all {total} <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>

        {recommendations.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No matches found yet"
            description="Upload your resume to kick off the AI matching engine against active Indian tech vacancies."
            actionText="Upload Resume"
            onAction={() => (window.location.href = '/upload')}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <JobCard
                key={rec.id}
                job={rec.job}
                recommendation={rec}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

