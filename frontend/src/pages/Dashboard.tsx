import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Flame,
  CheckCircle,
  Building2,
  ArrowRight,
  Upload,
  Sparkles,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatsCard } from '@/components/StatsCard';
import { RefreshCountdown } from '@/components/RefreshCountdown';
import { JobCard } from '@/components/JobCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRecommendedJobs } from '@/hooks/useJobs';
import { useProfile } from '@/hooks/useResume';

export const Dashboard: React.FC = () => {
  const { data: recData, isLoading: recLoading } = useRecommendedJobs(1, 6);
  const { data: profile, isLoading: profileLoading } = useProfile();

  const recommendations = recData?.data?.recommendations || [];
  const total = recData?.pagination?.total ?? 0;
  const hasRecommendations = recommendations.length > 0;
  const topMatch = hasRecommendations ? recommendations[0].matchScore : 0;

  if (profileLoading || recLoading) {
    return <LoadingSpinner text="Loading career intelligence..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Discover genuine Indian tech opportunities and 24-hour verification feeds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild size="sm">
            <Link to="/upload" className="gap-1.5">
              <Upload className="h-4 w-4" /> {hasRecommendations ? 'Update Resume' : 'Upload Resume'}
            </Link>
          </Button>
          {hasRecommendations && (
            <Button asChild size="sm">
              <Link to="/dashboard/jobs" className="gap-1.5">
                View All {total} Jobs <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Countdown Card */}
      <RefreshCountdown />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Verified Opportunities"
          value={hasRecommendations ? total : '0'}
          subtitle={hasRecommendations ? 'Filtered for your profile' : 'Upload resume to unlock'}
          icon={Briefcase}
        />
        <StatsCard
          title="Highest Match Score"
          value={hasRecommendations ? `${topMatch}%` : '—'}
          subtitle={hasRecommendations ? 'Hybrid AI relevance' : 'Upload resume to calculate'}
          icon={Flame}
        />
        <StatsCard
          title="Monitored Platforms"
          value="6"
          subtitle="LinkedIn, Naukri, Foundit..."
          icon={Building2}
        />
        <StatsCard
          title="Mandatory Checks"
          value="100%"
          subtitle="Direct ATS links verified"
          icon={CheckCircle}
        />
      </div>

      {/* Onboarding Callout if Resume Not Uploaded Yet */}
      {!hasRecommendations && (
        <Card className="border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-card overflow-hidden shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/15 text-primary shrink-0 mt-0.5">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  Upload Your Resume to Unlock Personalized Recommendations
                </h3>
                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                  Upload your resume (PDF or DOCX). DevLaunch extracts your skills and calculates semantic relevance, required experience compatibility, and graduation batch checks for every vacancy across 6 top platforms.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <Button asChild size="sm" className="w-full sm:w-auto gap-1.5 shadow-sm">
                <Link to="/upload">
                  <Upload className="h-4 w-4" /> Upload Resume Now
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {hasRecommendations ? 'Top Ranked Opportunities' : 'Your Recommended Opportunities'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {hasRecommendations
                ? 'Highest scoring jobs tailored to your resume across verified Indian employers'
                : 'Recommendations will appear here after you upload your resume.'}
            </p>
          </div>
          {hasRecommendations && (
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link to="/dashboard/jobs">
                See all {total} <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>

        {hasRecommendations ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, i) => (
              <JobCard
                key={rec.id || (rec as any)._id || (rec.job as any)?._id || i}
                job={rec.job}
                recommendation={rec.matchScore > 0 ? rec : undefined}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-border/70 bg-card/50 p-10 text-center flex flex-col items-center justify-center rounded-xl space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base font-semibold text-foreground">No Jobs to Show Yet</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We only display jobs that match your verified profile and resume. Please upload your resume to discover matching tech roles across LinkedIn, Naukri, Indeed, Internshala, Foundit, and Wellfound.
              </p>
            </div>
            <Button asChild size="sm" className="gap-1.5 shadow-sm">
              <Link to="/upload">
                <Upload className="h-4 w-4" /> Upload Resume
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};
