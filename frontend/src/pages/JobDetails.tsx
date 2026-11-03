import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MatchScoreBadge } from '@/components/MatchScoreBadge';
import { PlatformBadge } from '@/components/PlatformBadge';
import { SkillBadge } from '@/components/SkillBadge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useJobDetails, useToggleSaveJob } from '@/hooks/useJobs';
import { useCreateApplication } from '@/hooks/useApplications';
import { getSafeExternalUrl } from '@/lib/utils';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useJobDetails(id || '');
  const toggleSave = useToggleSaveJob();
  const createApplication = useCreateApplication();

  if (isLoading || !data) {
    return <LoadingSpinner text="Loading opportunity intelligence..." />;
  }

  const { job, recommendation, isSaved } = data;

  const handleApplyClick = () => {
    // Automatically track in applications
    createApplication.mutate({ jobId: job.id, status: 'applied' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 text-xs">
        <Link to="/dashboard/jobs">
          <ArrowLeft className="h-4 w-4" /> Back to Recommendations
        </Link>
      </Button>

      {/* Main Header Card */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <PlatformBadge platform={job.source} />
                <Badge variant="secondary" className="capitalize text-xs">
                  {job.workMode}
                </Badge>
                {job.employmentType && (
                  <Badge variant="outline" className="text-xs">
                    {job.employmentType}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Building2 className="h-4 w-4" /> {job.company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {job.location.city || 'All India'}, {job.location.country}
                </span>
                {job.salary && <span className="font-medium text-emerald-600">{job.salary}</span>}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              {recommendation && <MatchScoreBadge score={recommendation.matchScore} size="lg" />}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSave.mutate({ jobId: job.id })}
                  className="gap-1.5"
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button size="sm" asChild className="gap-1.5">
                  <a
                    href={getSafeExternalUrl(job.applicationUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleApplyClick}
                  >
                    Direct Apply <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Eligibility & Recommendation breakdown */}
          {recommendation && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Mandatory Eligibility Verification</h4>
                <div className="flex items-center gap-1.5 text-xs">
                  {recommendation.eligibility?.passes ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Meets All Criteria
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                      <XCircle className="h-4 w-4" /> Fails Criteria
                    </span>
                  )}
                </div>
              </div>

              {recommendation.eligibility?.reasons && (
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  {recommendation.eligibility.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}

              {/* Matched vs Missing Skills */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <h5 className="text-xs font-semibold mb-2 text-foreground">
                    Matched Skills ({recommendation.matchedSkills?.length || 0})
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendation.matchedSkills?.map((skill) => (
                      <SkillBadge key={skill} name={skill} matched={true} />
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold mb-2 text-foreground">
                    Missing / In-Demand Skills ({recommendation.missingSkills?.length || 0})
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendation.missingSkills?.map((skill) => (
                      <SkillBadge key={skill} name={skill} matched={false} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job Description */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Genuine Job Description</h3>
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed border rounded-lg p-4 bg-card">
              {job.description}
            </div>
          </div>

          {/* Metadata info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
            <span>First Discovered: {new Date(job.firstDiscovered).toLocaleDateString()}</span>
            <span>Last Verified: {new Date(job.lastVerified).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

