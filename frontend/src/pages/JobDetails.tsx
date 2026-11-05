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
  Banknote,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MatchScoreBadge } from '@/components/MatchScoreBadge';
import { PlatformBadge } from '@/components/PlatformBadge';
import { SkillBadge } from '@/components/SkillBadge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useJobDetails, useToggleSaveJob } from '@/hooks/useJobs';
import { useCreateApplication } from '@/hooks/useApplications';
import { getSafeExternalUrl, formatDeadline, formatSalary } from '@/lib/utils';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useJobDetails(id || '');
  const toggleSave = useToggleSaveJob();
  const createApplication = useCreateApplication();

  if (isLoading || !data) {
    return <LoadingSpinner text="Loading opportunity intelligence..." />;
  }

  const { job, recommendation, isSaved } = data;
  const deadlineInfo = formatDeadline(job.deadline);
  const jobId = job.id || (job as any)._id;

  const handleApplyClick = () => {
    // Automatically track in applications
    createApplication.mutate({ jobId, status: 'applied' });
  };

  const companyInitials = job.company
    ? job.company
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : 'CO';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 text-xs text-muted-foreground hover:text-foreground">
        <Link to="/dashboard/jobs">
          <ArrowLeft className="h-4 w-4" /> Back to Recommendations
        </Link>
      </Button>

      {/* Main Header Card */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center font-bold text-lg text-emerald-800 shadow-2xs">
                {companyInitials}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <PlatformBadge platform={job.source} />
                  <Badge variant="secondary" className="capitalize text-xs font-normal">
                    {job.workMode}
                  </Badge>
                  {job.employmentType && (
                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                      {job.employmentType}
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{job.title}</CardTitle>

                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Building2 className="h-4 w-4 text-muted-foreground" /> {job.company}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-muted-foreground" /> {job.location.city || 'Pan-India'}, {job.location.country}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-3 shrink-0 w-full sm:w-auto">
              {recommendation && <div className="self-start sm:self-end"><MatchScoreBadge score={recommendation.matchScore} size="lg" /></div>}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSave.mutate({ jobId })}
                  className="gap-1.5 h-9 text-xs flex-1 sm:flex-initial"
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : ''}`} />
                  {isSaved ? 'Saved' : 'Save Job'}
                </Button>
                {job.originalUrl && (
                  <Button variant="outline" size="sm" asChild className="gap-1.5 h-9 text-xs flex-1 sm:flex-initial">
                    <a href={getSafeExternalUrl(job.originalUrl)} target="_blank" rel="noopener noreferrer">
                      View Source <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
                <Button size="sm" asChild className="gap-1.5 h-9 text-xs shadow-xs bg-[#0A382C] hover:bg-[#065F46] text-white font-semibold w-full sm:w-auto">
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

        {/* Highlight strip for Compensation, Experience, Batches & Deadline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/30 border-y border-border/60 text-xs">
          <div>
            <div className="text-muted-foreground font-medium flex items-center gap-1 mb-0.5">
              <Banknote className="h-3.5 w-3.5 text-emerald-600" /> Compensation
            </div>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatSalary(job.salary)}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground font-medium flex items-center gap-1 mb-0.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" /> Required Exp
            </div>
            <div className="font-semibold text-foreground">
              {job.minExperienceMonths !== undefined ? `${job.minExperienceMonths / 12} - ${(job.maxExperienceMonths || 24) / 12} yrs` : '0 - 2 years (Entry-Level)'}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground font-medium flex items-center gap-1 mb-0.5">
              <GraduationCap className="h-3.5 w-3.5 text-primary" /> Eligible Batches
            </div>
            <div className="font-semibold text-foreground">
              {job.eligibleBatches && job.eligibleBatches.length > 0
                ? job.eligibleBatches.join(', ')
                : '2024, 2025, 2026 Batch'}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground font-medium flex items-center gap-1 mb-0.5">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Application Deadline
            </div>
            <div className={`font-semibold ${deadlineInfo.isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
              {deadlineInfo.formattedDate}
            </div>
          </div>
        </div>

        <CardContent className="space-y-6 pt-6">
          {/* Prominent Deadline Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${deadlineInfo.isUrgent
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
                : deadlineInfo.isExpired
                  ? 'bg-destructive/10 border-destructive/20 text-destructive'
                  : 'bg-primary/5 border-primary/20 text-foreground'
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg ${deadlineInfo.isUrgent
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    : 'bg-primary/10 text-primary'
                  }`}
              >
                {deadlineInfo.isUrgent ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold">
                  {deadlineInfo.isUrgent
                    ? `Urgent: Application Closes Soon (${deadlineInfo.daysRemaining} days left)`
                    : deadlineInfo.isExpired
                      ? 'Applications for this vacancy are now closed'
                      : `Application Deadline: ${deadlineInfo.formattedDate}`}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verified direct application link. Submit directly on the employer's official career portal before midnight.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {job.originalUrl && (
                <Button variant="outline" size="sm" asChild className="gap-1.5 h-8 text-xs bg-background">
                  <a href={getSafeExternalUrl(job.originalUrl)} target="_blank" rel="noopener noreferrer">
                    View on {job.source.charAt(0).toUpperCase() + job.source.slice(1)} <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
              <Button asChild size="sm" className="shrink-0 gap-1.5 h-8 text-xs shadow-sm">
                <a
                  href={getSafeExternalUrl(job.applicationUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleApplyClick}
                >
                  Apply on Official Site <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Eligibility & Recommendation breakdown */}
          {recommendation && (
            <div className="rounded-xl border border-border/80 bg-muted/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold">Mandatory Eligibility Verification</h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {recommendation.eligibility?.passes ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Meets All Mandatory Criteria
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                      <XCircle className="h-4 w-4" /> Eligibility Criteria Warning
                    </span>
                  )}
                </div>
              </div>

              {recommendation.eligibility?.reasons && (
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
                  {recommendation.eligibility.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}

              {/* Matched vs Missing Skills */}
              <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-border/40">
                <div>
                  <h5 className="text-xs font-semibold mb-2 text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Matched Skills ({recommendation.matchedSkills?.length || 0})
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendation.matchedSkills?.map((skill) => (
                      <SkillBadge key={skill} name={skill} matched={true} />
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold mb-2 text-foreground flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-rose-600" />
                    Missing / Skill Gap ({recommendation.missingSkills?.length || 0})
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
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Official Job Description & Requirements
            </h3>
            <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed border border-border/70 rounded-xl p-5 bg-card">
              {job.description}
            </div>
          </div>

          {/* Verification & Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-4">
            <span>Discovered: {new Date(job.firstDiscovered).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>Verified Source: <strong className="capitalize text-foreground font-medium">{job.source}</strong> (India portal)</span>
            <span>Last Verified Active: {new Date(job.lastVerified).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
