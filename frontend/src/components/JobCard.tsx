import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building2, Bookmark, ExternalLink, Calendar, Clock, Banknote, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MatchScoreBadge } from './MatchScoreBadge';
import { PlatformBadge } from './PlatformBadge';
import { SkillBadge } from './SkillBadge';
import { JobPosting, Recommendation } from '@/types';
import { useToggleSaveJob } from '@/hooks/useJobs';
import { getSafeExternalUrl, formatDeadline, formatSalary } from '@/lib/utils';

interface JobCardProps {
  job?: JobPosting | null;
  recommendation?: Recommendation;
  isSaved?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, recommendation, isSaved = false }) => {
  if (!job) return null;

  const toggleSave = useToggleSaveJob();
  const deadlineInfo = formatDeadline(job.deadline);
  const jobId = job.id || (job as any)._id;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave.mutate({ jobId });
  };

  // Company avatar initials
  const companyInitials = job.company
    ? job.company
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : 'CO';

  const formattedSalary = formatSalary(job.salary);

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border border-border/70 bg-card hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 rounded-2xl">
      <CardHeader className="pb-3 space-y-3">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {job.originalUrl ? (
              <a
                href={getSafeExternalUrl(job.originalUrl)}
                target="_blank"
                rel="noopener noreferrer"
                title={`View listing on ${job.source}`}
                className="hover:opacity-85 transition-opacity inline-flex items-center"
              >
                <PlatformBadge platform={job.source} />
              </a>
            ) : (
              <PlatformBadge platform={job.source} />
            )}
            <Badge variant="secondary" className="capitalize text-[11px] font-normal py-0 h-5">
              {job.workMode}
            </Badge>
            {job.employmentType && (
              <Badge variant="outline" className="text-[11px] font-normal py-0 h-5 text-muted-foreground">
                {job.employmentType}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {recommendation && <MatchScoreBadge score={recommendation.matchScore} />}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="text-muted-foreground hover:text-foreground rounded-full h-7 w-7"
              aria-label="Save Job"
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Company Avatar & Job Title */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center font-bold text-xs text-emerald-800 shadow-2xs">
            {companyInitials}
          </div>

          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold leading-tight hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors line-clamp-1">
              <Link to={`/dashboard/jobs/${jobId}`}>{job.title}</Link>
            </CardTitle>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground pt-1 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {job.company || 'Tech Company'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {job.location?.city || 'India'}
              </span>
            </div>
          </div>
        </div>

        {/* Salary & Deadline Strip */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Banknote className="h-3.5 w-3.5 shrink-0" /> {formattedSalary}
          </span>

          {/* Application Deadline Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${deadlineInfo.isUrgent
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse'
                : deadlineInfo.isExpired
                  ? 'bg-destructive/10 text-destructive border border-destructive/20'
                  : 'bg-muted text-muted-foreground border border-border/60'
              }`}
            title={`Application Deadline: ${deadlineInfo.formattedDate}`}
          >
            <Clock className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[170px]">{deadlineInfo.label}</span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Matched skills */}
        {recommendation?.matchedSkills && recommendation.matchedSkills.length > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> Matched skills
            </div>
            <div className="flex flex-wrap gap-1">
              {recommendation.matchedSkills.slice(0, 4).map((skill) => (
                <SkillBadge key={skill} name={skill} matched={true} />
              ))}
              {recommendation.matchedSkills.length > 4 && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground">
                  +{recommendation.matchedSkills.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        ) : job.requiredSkills && job.requiredSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {job.requiredSkills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                {skill}
              </Badge>
            ))}
            {job.requiredSkills.length > 4 && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground">
                +{job.requiredSkills.length - 4}
              </Badge>
            )}
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      </CardContent>

      <CardFooter className="pt-2 flex items-center justify-between border-t border-border/40 text-xs text-muted-foreground py-2.5 bg-muted/20">
        <span className="flex items-center gap-1 text-[11px]">
          <Calendar className="h-3 w-3" />
          {job.postingDate ? new Date(job.postingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent'}
        </span>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2">
            <Link to={`/dashboard/jobs/${jobId}`}>Details</Link>
          </Button>
          {job.originalUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground"
              title={`View job listing on ${job.source}`}
            >
              <a href={getSafeExternalUrl(job.originalUrl)} target="_blank" rel="noopener noreferrer">
                Source <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </Button>
          )}
          <Button size="sm" asChild className="h-7 text-xs px-2.5 gap-1 shadow-xs bg-[#0A382C] hover:bg-[#065F46] text-white font-medium">
            <a href={getSafeExternalUrl(job.applicationUrl)} target="_blank" rel="noopener noreferrer">
              Apply <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
